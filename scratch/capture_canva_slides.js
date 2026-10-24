const http = require('http');
const fs = require('fs');

async function captureAllSlides() {
  const json = await new Promise((resolve) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
  });

  const page = json.find(p => p.id === 'A150AC8C276CADF071E9500E9996F2AF');
  if (!page) {
    console.error('Canva page not found');
    process.exit(1);
  }
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

  // Scroll to top
  await send('Runtime.evaluate', {
    expression: `(() => {
      const scrollable = Array.from(document.querySelectorAll('*')).find(el => el.scrollHeight > el.clientHeight && el.clientHeight > 400 && el.scrollHeight > 2000);
      if (scrollable) scrollable.scrollTop = 0;
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  // Capture slide 1
  let shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/canva_slide_1.png', Buffer.from(shot1.result.data, 'base64'));
  console.log('Saved scratch/canva_slide_1.png');

  // Let's inspect all slide elements and text
  const slideData = await send('Runtime.evaluate', {
    expression: `(() => {
      // Find all page dividers or containers
      const headers = Array.from(document.querySelectorAll('*')).filter(e => 
        e.children.length === 0 && e.textContent && /^Trang\s+\d+/.test(e.textContent.trim())
      );
      return headers.map(h => ({ text: h.textContent.trim() }));
    })()`,
    returnByValue: true
  });
  console.log('Slide headers:', slideData.result.result.value);

  ws.close();
  process.exit(0);
}

captureAllSlides().catch(console.error);
