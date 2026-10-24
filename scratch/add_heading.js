const http = require('http');
const fs = require('fs');

async function addHeading() {
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

  // 1. First fix "Đối tượng th hưởng" in the body text
  const fixTypo = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = Array.from(document.querySelectorAll('*')).find(e => 
        e.children.length === 0 && (e.innerText || e.textContent || '').includes('th hưởng')
      );
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x + 50, y: r.y + 10 };
    })()`,
    returnByValue: true
  });
  console.log('Typo pt:', fixTypo.result.result.value);
  if (fixTypo.result.result.value) {
    const pt = fixTypo.result.result.value;
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
    await new Promise(r => setTimeout(r, 60));
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 2 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 2 });
    await new Promise(r => setTimeout(r, 200));

    const fullClean = `Thời gian triển khai: Từ Học kỳ II năm học 2025 - 2026 đến nay.
Đối tượng thụ hưởng: Giáo viên bộ môn Toán THPT và hơn 450 học sinh lớp 12.
Phương thức triển khai: Sử dụng trực tiếp trên Web sổ tay trong các tiết dạy chuyên đề Tích phân Thể tích, trình chiếu trên màn hình tương tác và giao bài tự học ở nhà.
Hoạt động học tập: Học sinh quét ảnh đề bài SGK, tự xoay mô hình 3D và quan sát lát cắt vi phân trước khi tính toán.`;

    await send('Runtime.evaluate', {
      expression: `(() => {
        const act = document.activeElement;
        const target = (act && act.isContentEditable) ? act : document.querySelector('.ql-editor');
        if (!target) return false;
        target.focus();
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(target);
        sel.removeAllRanges();
        sel.addRange(range);
        return document.execCommand('insertText', false, ${JSON.stringify(fullClean)});
      })()`
    });

    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
    await new Promise(r => setTimeout(r, 300));
  }

  // 2. Click "Thêm tiêu đề" button on the left panel (x: 120, y: 430)
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 120, y: 430, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 120, y: 430, button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 400));

  // Type "TRIỂN KHAI THỰC TẾ"
  await send('Runtime.evaluate', {
    expression: `(() => {
      const act = document.activeElement;
      const target = (act && act.isContentEditable) ? act : document.querySelector('.ql-editor');
      if (!target) return false;
      target.focus();
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(target);
      sel.removeAllRanges();
      sel.addRange(range);
      return document.execCommand('insertText', false, 'TRIỂN KHAI THỰC TẾ');
    })()`
  });

  // Escape to switch to selection mode
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
  await new Promise(r => setTimeout(r, 200));

  // Move title up and left to match the header position:
  // Heading usually appears at center (around x: 800, y: 400).
  // Standard title position is around x: 440, y: 190.
  // Move left by ~350px (35 times Shift+ArrowLeft) and up by ~200px (20 times Shift+ArrowUp)
  for (let i = 0; i < 35; i++) {
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 37, code: 'ArrowLeft', key: 'ArrowLeft', modifiers: 8 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 37, code: 'ArrowLeft', key: 'ArrowLeft', modifiers: 8 });
  }
  for (let i = 0; i < 20; i++) {
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 38, code: 'ArrowUp', key: 'ArrowUp', modifiers: 8 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 38, code: 'ArrowUp', key: 'ArrowUp', modifiers: 8 });
  }

  // Escape to commit
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
  await new Promise(r => setTimeout(r, 500));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/canva_slide6_complete.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved scratch/canva_slide6_complete.png');

  ws.close();
  process.exit(0);
}

addHeading().catch(console.error);
