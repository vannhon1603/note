const http = require('http');
const fs = require('fs');

async function testTextSidebar() {
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

  // 1. Delete the corrupted text box on Slide 6 first
  // Click at (500, 300) to select it
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 500, y: 300, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 500, y: 300, button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 200));

  // Press Backspace or Delete to delete it
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 46, code: 'Delete', key: 'Delete' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 46, code: 'Delete', key: 'Delete' });
  await new Promise(r => setTimeout(r, 300));

  // Also in DOM, if still present, remove it
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = Array.from(document.querySelectorAll('*')).find(e => 
        e.children.length === 0 && (e.innerText || e.textContent || '').includes('gian triển khai')
      );
      if (el) {
        // find outer box and remove
        let cur = el;
        while (cur && cur.parentElement && !cur.parentElement.classList.contains('_14BoqA') && !cur.parentElement.classList.contains('DPPJ_A')) {
          cur = cur.parentElement;
        }
        if (cur) cur.remove();
      }
    })()`
  });

  // 2. Click "Văn bản" in sidebar (x: 35, y: 255)
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 35, y: 255, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 35, y: 255, button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 600));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/canva_text_panel_opened.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved scratch/canva_text_panel_opened.png');

  ws.close();
  process.exit(0);
}

testTextSidebar().catch(console.error);
