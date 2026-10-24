const http = require('http');
const fs = require('fs');

async function fixSlide1() {
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

  // Find the title element on Slide 1
  const info = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = Array.from(document.querySelectorAll('*')).find(e => 
        e.children.length === 0 && e.textContent && e.textContent.includes('NOTERENDERER AI')
      );
      if (!el) return null;
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + 20, text: el.textContent };
    })()`,
    returnByValue: true
  });
  console.log('Title element:', info.result.result.value);

  const pt = info.result.result.value;
  if (pt) {
    // Double click to enter Quill
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
    await new Promise(r => setTimeout(r, 60));
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 2 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 2 });
    await new Promise(r => setTimeout(r, 200));

    // Replace text
    const cleanTitle = "NOTERENDERER AI\nSổ tay Toán học Tương tác Tích hợp Thị giác AI & Mô hình 3D Động";
    const repRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const act = document.activeElement;
        if (!act || !act.isContentEditable) return { ok: false, act: act ? act.tagName : null };
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(act);
        sel.removeAllRanges();
        sel.addRange(range);
        const ok = document.execCommand('insertText', false, ${JSON.stringify(cleanTitle)});
        return { ok, text: act.innerText };
      })()`,
      returnByValue: true
    });
    console.log('Replace result:', repRes.result.result.value);

    // Escape
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
  }

  await new Promise(r => setTimeout(r, 600));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/canva_slide1_fixed.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved scratch/canva_slide1_fixed.png');

  ws.close();
  process.exit(0);
}

fixSlide1().catch(console.error);
