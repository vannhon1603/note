const http = require('http');
const fs = require('fs');

async function checkCanva() {
  const json = await new Promise((resolve) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
  });

  // Find a tab we can use or create target
  // Let's create a new target or use an existing unused tab like 84BE0EC293F38599C058E2AB9C0C0D63
  const targetPage = json.find(p => p.id === '84BE0EC293F38599C058E2AB9C0C0D63') || json[0];
  console.log('Using target tab:', targetPage.id);

  const ws = new WebSocket(targetPage.webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      const cb = callbacks.get(msg.id);
      callbacks.delete(msg.id);
      cb(msg);
    }
  };

  const send = (method, params = {}) => new Promise((resolve) => {
    const reqId = id++;
    callbacks.set(reqId, resolve);
    ws.send(JSON.stringify({ id: reqId, method, params }));
  });

  await new Promise(r => ws.onopen = r);

  // Navigate to Canva
  console.log('Navigating to Canva URL...');
  await send('Page.navigate', { url: 'https://www.canva.com/design/DAHYz4qC1Bg/rh68K6dMjPfbk6ufeowgmA/edit' });

  // Wait 6 seconds for Canva to load
  await new Promise(r => setTimeout(r, 6000));

  const pageInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      return {
        title: document.title,
        url: window.location.href,
        bodyText: document.body ? document.body.innerText.slice(0, 500) : ''
      };
    })()`,
    returnByValue: true
  });
  console.log('Canva Page Info:', pageInfo.result.result.value);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/canva_screenshot.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved scratch/canva_screenshot.png');

  ws.close();
  process.exit(0);
}

checkCanva().catch(console.error);
