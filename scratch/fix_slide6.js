const http = require('http');
const fs = require('fs');

async function fixSlide6() {
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

  // Scroll to Page 6
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

  // Find the text element on Slide 6 where r.x > 300
  const ptInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      const els = Array.from(document.querySelectorAll('*')).filter(e => {
        if (e.tagName === 'SCRIPT' || e.tagName === 'STYLE') return false;
        const t = (e.innerText || e.textContent || '').trim();
        if (!t.includes('Triển khai ra sao') && !t.includes('Thầy/cô nêu mô tả')) return false;
        const r = e.getBoundingClientRect();
        return r.x > 300 && r.y > 100 && r.y < 700;
      });
      if (els.length === 0) return null;
      const el = els[0];
      const r = el.getBoundingClientRect();
      return { x: r.x + 100, y: r.y + 20, text: (el.innerText || el.textContent).slice(0, 40) };
    })()`,
    returnByValue: true
  });

  console.log('Slide 6 target point:', ptInfo.result.result.value);
  const pt = ptInfo.result.result.value;

  if (pt) {
    // Click to enter Quill
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
    await new Promise(r => setTimeout(r, 60));
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 2 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 2 });
    await new Promise(r => setTimeout(r, 200));

    const slide6Content = `Thời gian triển khai: Từ Học kỳ II năm học 2025 - 2026 đến nay.
Đối tượng thụ hưởng: Giáo viên bộ môn Toán THPT và hơn 450 học sinh lớp 12.
Phương thức triển khai: Sử dụng trực tiếp trên Web sổ tay trong các tiết dạy chuyên đề Tích phân Thể tích, trình chiếu trên màn hình tương tác và giao bài tự học ở nhà.
Hoạt động học tập: Học sinh quét ảnh đề bài SGK, tự xoay mô hình 3D và quan sát lát cắt vi phân trước khi tính toán.`;

    const insRes = await send('Runtime.evaluate', {
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

    console.log('Slide 6 replace result:', insRes.result.result.value);

    // Escape
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
  }

  // Also remove the offscreen stray element if present
  await send('Runtime.evaluate', {
    expression: `(() => {
      // Find any element with negative x that contains "Triển khai ra sao"
      const stray = Array.from(document.querySelectorAll('*')).find(e => {
        const t = (e.textContent || '').trim();
        const r = e.getBoundingClientRect();
        return t.includes('Triển khai ra sao') && r.x < 0;
      });
      if (stray) {
        // remove or hide
        stray.remove();
        return true;
      }
      return false;
    })()`
  });

  await new Promise(r => setTimeout(r, 500));
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/canva_slide6_fixed.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved scratch/canva_slide6_fixed.png');

  ws.close();
  process.exit(0);
}

fixSlide6().catch(console.error);
