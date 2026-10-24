const http = require('http');
const fs = require('fs');

async function testClick() {
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

  // Press Escape 2 times to clear any open toolbar/menu
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
  await new Promise(r => setTimeout(r, 200));

  // Get span location
  const ptInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      const span = Array.from(document.querySelectorAll('*')).find(e => 
        e.children.length === 0 && e.textContent && e.textContent.includes('NOTERENDERER AI') &&
        e.tagName !== 'SCRIPT' && e.tagName !== 'STYLE'
      );
      if (!span) return null;
      span.scrollIntoView({ block: 'center' });
      const r = span.getBoundingClientRect();
      return { x: r.x + 80, y: r.y + 20, text: span.textContent };
    })()`,
    returnByValue: true
  });
  console.log('Target pt:', ptInfo.result.result.value);
  const pt = ptInfo.result.result.value;

  if (pt) {
    // Click once to select box
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
    await new Promise(r => setTimeout(r, 150));

    // Double click to enter Quill
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 2 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 2 });
    await new Promise(r => setTimeout(r, 250));

    const checkEdit = await send('Runtime.evaluate', {
      expression: `(() => {
        const act = document.activeElement;
        const ql = document.querySelector('.ql-editor');
        return {
          actTag: act ? act.tagName : null,
          actEditable: act ? act.isContentEditable : null,
          qlExists: !!ql,
          qlText: ql ? ql.innerText : null
        };
      })()`,
      returnByValue: true
    });
    console.log('Quill state:', checkEdit.result.result.value);

    // If ql-editor exists or act is contentEditable, select all and insert
    const insertRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const target = document.activeElement.isContentEditable ? document.activeElement : document.querySelector('.ql-editor');
        if (!target) return { ok: false };
        target.focus();
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(target);
        sel.removeAllRanges();
        sel.addRange(range);
        const cleanTitle = "NOTERENDERER AI\\nSổ tay Toán học Tương tác Tích hợp Thị giác AI & Mô hình 3D Động";
        const ok = document.execCommand('insertText', false, cleanTitle);
        return { ok, text: target.innerText };
      })()`,
      returnByValue: true
    });
    console.log('Insert result:', insertRes.result.result.value);

    // Escape to commit
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
    await new Promise(r => setTimeout(r, 600));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/canva_slide1_new.png', Buffer.from(shot.result.data, 'base64'));
    console.log('Saved scratch/canva_slide1_new.png');
  }

  ws.close();
  process.exit(0);
}

testClick().catch(console.error);
