const http = require('http');
const fs = require('fs');

async function fixS6Position() {
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

  // Double click at (450, 210) to enter text edit
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 450, y: 210, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 450, y: 210, button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 60));
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 450, y: 210, button: 'left', clickCount: 2 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 450, y: 210, button: 'left', clickCount: 2 });
  await new Promise(r => setTimeout(r, 200));

  const slide6Content = `Thời gian triển khai: Từ Học kỳ II năm học 2025 - 2026 đến nay.
Đối tượng thụ hưởng: Giáo viên bộ môn Toán THPT và hơn 450 học sinh lớp 12.
Phương thức triển khai: Sử dụng trực tiếp trên Web sổ tay trong các tiết dạy chuyên đề Tích phân Thể tích, trình chiếu trên màn hình tương tác và giao bài tự học ở nhà.
Hoạt động học tập: Học sinh quét ảnh đề bài SGK, tự xoay mô hình 3D và quan sát lát cắt vi phân trước khi tính toán.`;

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
      const ok = document.execCommand('insertText', false, ${JSON.stringify(slide6Content)});
      return { ok, text: target.innerText ? target.innerText.slice(0, 80) : null };
    })()`,
    returnByValue: true
  });
  console.log('Slide 6 inserted:', ins.result.result.value);

  // Press Escape to switch from text edit mode to object selection mode!
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
  await new Promise(r => setTimeout(r, 300));

  // Now the box is selected!
  // Move it right by sending Shift+ArrowRight 55 times (~550px)
  for (let i = 0; i < 55; i++) {
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 39, code: 'ArrowRight', key: 'ArrowRight', modifiers: 8 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 39, code: 'ArrowRight', key: 'ArrowRight', modifiers: 8 });
  }

  // Move it down by sending Shift+ArrowDown 7 times (~70px)
  for (let i = 0; i < 7; i++) {
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 40, code: 'ArrowDown', key: 'ArrowDown', modifiers: 8 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 40, code: 'ArrowDown', key: 'ArrowDown', modifiers: 8 });
  }

  // Escape to commit
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
  await new Promise(r => setTimeout(r, 500));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/canva_slide6_moved.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved scratch/canva_slide6_moved.png');

  ws.close();
  process.exit(0);
}

fixS6Position().catch(console.error);
