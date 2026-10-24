const http = require('http');
const fs = require('fs');

async function undo() {
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

  // Press Ctrl+Z 3 times to undo the added heading and moves
  for (let i = 0; i < 4; i++) {
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 17, code: 'ControlLeft', key: 'Control', modifiers: 2 });
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 90, code: 'KeyZ', key: 'z', modifiers: 2 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 90, code: 'KeyZ', key: 'z', modifiers: 2 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 17, code: 'ControlLeft', key: 'Control' });
    await new Promise(r => setTimeout(r, 200));
  }

  // Also close sidebar by clicking the collapse chevron at (224, 528)
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 224, y: 528, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 224, y: 528, button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 400));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/canva_slide1_undone.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved scratch/canva_slide1_undone.png');

  ws.close();
  process.exit(0);
}

undo().catch(console.error);
