const http = require('http');
const fs = require('fs');

async function testVisual() {
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

  // Click at (810, 470)
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 810, y: 470, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 810, y: 470, button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 60));
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 810, y: 470, button: 'left', clickCount: 2 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 810, y: 470, button: 'left', clickCount: 2 });
  await new Promise(r => setTimeout(r, 250));

  const state = await send('Runtime.evaluate', {
    expression: `(() => {
      const act = document.activeElement;
      return {
        tag: act.tagName,
        isContentEditable: act.isContentEditable,
        className: act.className,
        innerText: (act.innerText || '').slice(0, 100)
      };
    })()`,
    returnByValue: true
  });

  console.log('Active element after visual double click:', state.result.result.value);

  if (state.result.result.value.isContentEditable) {
    const cleanTitle = "NOTERENDERER AI\nSổ tay Toán học Tương tác Tích hợp Thị giác AI & Mô hình 3D Động";
    const ins = await send('Runtime.evaluate', {
      expression: `(() => {
        const act = document.activeElement;
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(act);
        sel.removeAllRanges();
        sel.addRange(range);
        return document.execCommand('insertText', false, ${JSON.stringify(cleanTitle)});
      })()`,
      returnByValue: true
    });
    console.log('Inserted clean title:', ins.result.result.value);

    // Escape
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
    await new Promise(r => setTimeout(r, 500));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/canva_slide1_visual_fixed.png', Buffer.from(shot.result.data, 'base64'));
    console.log('Saved scratch/canva_slide1_visual_fixed.png');
  }

  ws.close();
  process.exit(0);
}

testVisual().catch(console.error);
