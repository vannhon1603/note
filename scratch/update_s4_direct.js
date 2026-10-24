const http = require('http');
const fs = require('fs');

async function updateSlide4Direct() {
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

  // Scroll to Slide 4
  await send('Runtime.evaluate', {
    expression: `(() => {
      const scroller = Array.from(document.querySelectorAll('*')).find(el => 
        el.scrollHeight > el.clientHeight + 100 && el.clientHeight > 300 && 
        (window.getComputedStyle(el).overflowY === 'auto' || window.getComputedStyle(el).overflowY === 'scroll')
      );
      if (scroller) scroller.scrollTop = 3 * (scroller.scrollHeight / 10);
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  // Double click at (520, 380)
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 520, y: 380, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 520, y: 380, button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 60));
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 520, y: 380, button: 'left', clickCount: 2 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 520, y: 380, button: 'left', clickCount: 2 });
  await new Promise(r => setTimeout(r, 200));

  const slide4Content = `Rào cản tư duy không gian: Hơn 72% học sinh gặp khó khăn khi hình dung các khối tròn xoay 3D và lát cắt vi phân S(x) từ hình vẽ 2D phẳng trong SGK.
Học sinh học vẹt công thức máy móc: Thiếu sự thấu hiểu trực quan về nguyên lý Cavalieri, dẫn đến lúng túng khi gặp các bài toán biến đổi hoặc toán ứng dụng thực tế.
Áp lực soạn giảng của giáo viên: Mất 10-15 phút vẽ một khối hình không gian lên bảng, nhưng vẫn khó truyền tải trực quan các góc khuất và chuyển động quay.`;

  const ins = await send('Runtime.evaluate', {
    expression: `(() => {
      const act = document.activeElement;
      const target = (act && act.isContentEditable) ? act : document.querySelector('.ql-editor');
      if (!target) return { ok: false };
      target.focus();
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(target);
      sel.removeAllRanges();
      sel.addRange(range);
      const ok = document.execCommand('insertText', false, ${JSON.stringify(slide4Content)});
      return { ok, text: target.innerText ? target.innerText.slice(0, 80) : null };
    })()`,
    returnByValue: true
  });
  console.log('Slide 4 update result:', ins.result.result.value);

  // Escape
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
  await new Promise(r => setTimeout(r, 500));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/canva_slide4_perfect.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved scratch/canva_slide4_perfect.png');

  ws.close();
  process.exit(0);
}

updateSlide4Direct().catch(console.error);
