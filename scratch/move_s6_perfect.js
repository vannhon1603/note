const http = require('http');
const fs = require('fs');

async function moveS6Perfect() {
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

  // Click on the box at (500, 250) to select it
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 500, y: 250, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 500, y: 250, button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 200));

  // Move right 22 times (220px)
  for (let i = 0; i < 22; i++) {
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 39, code: 'ArrowRight', key: 'ArrowRight', modifiers: 8 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 39, code: 'ArrowRight', key: 'ArrowRight', modifiers: 8 });
  }

  // Move down 8 times (80px)
  for (let i = 0; i < 8; i++) {
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 40, code: 'ArrowDown', key: 'ArrowDown', modifiers: 8 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 40, code: 'ArrowDown', key: 'ArrowDown', modifiers: 8 });
  }

  // Now double click at (550, 320) to edit text and add clean bullets if needed
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 550, y: 320, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 550, y: 320, button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 60));
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 550, y: 320, button: 'left', clickCount: 2 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 550, y: 320, button: 'left', clickCount: 2 });
  await new Promise(r => setTimeout(r, 200));

  const bulletText = `• Thời gian triển khai: Từ Học kỳ II năm học 2025 - 2026 đến nay.
• Đối tượng thụ hưởng: Giáo viên bộ môn Toán THPT và hơn 450 học sinh lớp 12.
• Phương thức triển khai: Sử dụng trực tiếp trên Web sổ tay trong các tiết dạy chuyên đề Tích phân Thể tích, trình chiếu trên màn hình tương tác và giao bài tự học ở nhà.
• Hoạt động học tập: Học sinh quét ảnh đề bài SGK, tự xoay mô hình 3D và quan sát lát cắt vi phân trước khi tính toán.`;

  await send('Runtime.evaluate', {
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
      const ok = document.execCommand('insertText', false, ${JSON.stringify(bulletText)});
      return { ok, text: target.innerText ? target.innerText.slice(0, 80) : null };
    })()`,
    returnByValue: true
  });

  // Escape to commit
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
  await new Promise(r => setTimeout(r, 500));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/canva_slide6_perfect.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved scratch/canva_slide6_perfect.png');

  ws.close();
  process.exit(0);
}

moveS6Perfect().catch(console.error);
