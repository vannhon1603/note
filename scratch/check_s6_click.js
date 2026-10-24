const http = require('http');
const fs = require('fs');

async function checkSlide6Click() {
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

  // Scroll to Slide 6
  await send('Runtime.evaluate', {
    expression: `(() => {
      const scroller = Array.from(document.querySelectorAll('*')).find(el => 
        el.scrollHeight > el.clientHeight + 100 && el.clientHeight > 300 && 
        (window.getComputedStyle(el).overflowY === 'auto' || window.getComputedStyle(el).overflowY === 'scroll')
      );
      if (scroller) scroller.scrollTop = 5 * (scroller.scrollHeight / 10);
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  // Single click at (250, 220)
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 250, y: 220, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 250, y: 220, button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 400));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/canva_slide6_clicked_250_220.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved scratch/canva_slide6_clicked_250_220.png');

  ws.close();
  process.exit(0);
}

checkSlide6Click().catch(console.error);
