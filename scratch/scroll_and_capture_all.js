const http = require('http');
const fs = require('fs');

async function scrollAndCapture() {
  const json = await new Promise((resolve) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
  });

  const page = json.find(p => p.id === 'A150AC8C276CADF071E9500E9996F2AF');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
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

  for (let p = 1; p <= 10; p++) {
    // Scroll to page
    const pageInfo = await send('Runtime.evaluate', {
      expression: `(() => {
        const scroller = Array.from(document.querySelectorAll('*')).find(el => 
          el.scrollHeight > el.clientHeight + 100 && el.clientHeight > 300 && 
          (window.getComputedStyle(el).overflowY === 'auto' || window.getComputedStyle(el).overflowY === 'scroll')
        );
        if (!scroller) return null;
        scroller.scrollTop = ((${p} - 1) * (scroller.scrollHeight / 10));
        return { scrollTop: scroller.scrollTop, scrollHeight: scroller.scrollHeight };
      })()`,
      returnByValue: true
    });

    await new Promise(r => setTimeout(r, 700));

    // Capture screenshot
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`scratch/canva_page_${p}.png`, Buffer.from(shot.result.data, 'base64'));
    console.log(`Saved scratch/canva_page_${p}.png`);
  }

  ws.close();
  process.exit(0);
}

scrollAndCapture().catch(console.error);
