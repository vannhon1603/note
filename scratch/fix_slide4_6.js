const http = require('http');
const fs = require('fs');

async function fixSlide4And6() {
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

  const scrollerSelector = `(() => Array.from(document.querySelectorAll('*')).find(el => 
    el.scrollHeight > el.clientHeight + 100 && el.clientHeight > 300 && 
    (window.getComputedStyle(el).overflowY === 'auto' || window.getComputedStyle(el).overflowY === 'scroll')
  ))()`;

  async function scrollToPage(pageIndex) {
    await send('Runtime.evaluate', {
      expression: `(() => {
        const scroller = ${scrollerSelector};
        if (scroller) scroller.scrollTop = (${pageIndex} - 1) * (scroller.scrollHeight / 10);
      })()`
    });
    await new Promise(r => setTimeout(r, 600));
  }

  // 1. FIX SLIDE 4
  console.log('\n--- RESTORING SLIDE 4 CONTENT ---');
  await scrollToPage(4);

  const pt4Info = await send('Runtime.evaluate', {
    expression: `(() => {
      const els = Array.from(document.querySelectorAll('*')).filter(e => {
        if (e.tagName === 'SCRIPT' || e.tagName === 'STYLE') return false;
        const t = (e.innerText || e.textContent || '').trim();
        if (!t.includes('Thời gian triển khai') && !t.includes('Rào cản')) return false;
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

  const pt4 = pt4Info.result.result.value;
  console.log('Slide 4 pt:', pt4);
  if (pt4) {
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt4.x, y: pt4.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt4.x, y: pt4.y, button: 'left', clickCount: 1 });
    await new Promise(r => setTimeout(r, 60));
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt4.x, y: pt4.y, button: 'left', clickCount: 2 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt4.x, y: pt4.y, button: 'left', clickCount: 2 });
    await new Promise(r => setTimeout(r, 200));

    const slide4Content = `Rào cản tư duy không gian: Hơn 72% học sinh gặp khó khăn khi hình dung các khối tròn xoay 3D và lát cắt vi phân S(x) từ hình vẽ 2D phẳng trong SGK.
Học sinh học vẹt công thức máy móc: Thiếu sự thấu hiểu trực quan về nguyên lý Cavalieri, dẫn đến lúng túng khi gặp các bài toán biến đổi hoặc toán ứng dụng thực tế.
Áp lực soạn giảng của giáo viên: Mất 10-15 phút vẽ một khối hình không gian lên bảng, nhưng vẫn khó truyền tải trực quan các góc khuất và chuyển động quay.`;

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
        const ok = document.execCommand('insertText', false, ${JSON.stringify(slide4Content)});
        return { ok, text: target.innerText ? target.innerText.slice(0, 80) : null };
      })()`,
      returnByValue: true
    });

    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
    await new Promise(r => setTimeout(r, 300));
  }

  // 2. COPY FROM SLIDE 5 TO SLIDE 6
  console.log('\n--- COPYING STYLED BOX FROM SLIDE 5 TO SLIDE 6 ---');
  await scrollToPage(5);

  const pt5Info = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = Array.from(document.querySelectorAll('*')).find(e => 
        e.children.length === 0 && (e.innerText || e.textContent || '').includes('Ý tưởng đột phá')
      );
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x + 80, y: r.y + 20 };
    })()`,
    returnByValue: true
  });
  const pt5 = pt5Info.result.result.value;
  console.log('Slide 5 pt:', pt5);

  if (pt5) {
    // Single click to select the box
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt5.x, y: pt5.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt5.x, y: pt5.y, button: 'left', clickCount: 1 });
    await new Promise(r => setTimeout(r, 200));

    // Ctrl+C
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 17, code: 'ControlLeft', key: 'Control', modifiers: 2 });
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 67, code: 'KeyC', key: 'c', modifiers: 2 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 67, code: 'KeyC', key: 'c', modifiers: 2 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 17, code: 'ControlLeft', key: 'Control' });
    await new Promise(r => setTimeout(r, 300));

    // Scroll to Slide 6
    await scrollToPage(6);
    await new Promise(r => setTimeout(r, 500));

    // Click on slide 6 canvas background (e.g. x: 800, y: 350)
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 800, y: 350, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 800, y: 350, button: 'left', clickCount: 1 });
    await new Promise(r => setTimeout(r, 200));

    // Ctrl+V
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 17, code: 'ControlLeft', key: 'Control', modifiers: 2 });
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 86, code: 'KeyV', key: 'v', modifiers: 2 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 86, code: 'KeyV', key: 'v', modifiers: 2 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 17, code: 'ControlLeft', key: 'Control' });
    await new Promise(r => setTimeout(r, 500));

    // Now double-click the pasted text box or check if activeElement is Quill
    const checkPasted = await send('Runtime.evaluate', {
      expression: `(() => {
        const el = Array.from(document.querySelectorAll('*')).find(e => 
          e.children.length === 0 && (e.innerText || e.textContent || '').includes('Ý tưởng đột phá') &&
          e.getBoundingClientRect().y > 100 && e.getBoundingClientRect().y < 700
        );
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.x + 80, y: r.y + 20 };
      })()`,
      returnByValue: true
    });
    console.log('Pasted element on Slide 6:', checkPasted.result.result.value);

    const ptPasted = checkPasted.result.result.value || { x: 800, y: 350 };
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: ptPasted.x, y: ptPasted.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: ptPasted.x, y: ptPasted.y, button: 'left', clickCount: 1 });
    await new Promise(r => setTimeout(r, 60));
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: ptPasted.x, y: ptPasted.y, button: 'left', clickCount: 2 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: ptPasted.x, y: ptPasted.y, button: 'left', clickCount: 2 });
    await new Promise(r => setTimeout(r, 200));

    const slide6Content = `Thời gian triển khai: Từ Học kỳ II năm học 2025 - 2026 đến nay.
Đối tượng thụ hưởng: Giáo viên bộ môn Toán THPT và hơn 450 học sinh lớp 12.
Phương thức triển khai: Sử dụng trực tiếp trên Web sổ tay trong các tiết dạy chuyên đề Tích phân Thể tích, trình chiếu trên màn hình tương tác và giao bài tự học ở nhà.
Hoạt động học tập: Học sinh quét ảnh đề bài SGK, tự xoay mô hình 3D và quan sát lát cắt vi phân trước khi tính toán.`;

    const insPasted = await send('Runtime.evaluate', {
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
    console.log('Slide 6 text replacement result:', insPasted.result.result.value);

    // Escape
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
    await new Promise(r => setTimeout(r, 500));
  }

  // 3. CAPTURE SLIDE 4 AND SLIDE 6
  await scrollToPage(4);
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/canva_slide4_fixed.png', Buffer.from(shot.result.data, 'base64'));

  await scrollToPage(6);
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/canva_slide6_final.png', Buffer.from(shot.result.data, 'base64'));

  console.log('Saved scratch/canva_slide4_fixed.png and scratch/canva_slide6_final.png');

  ws.close();
  process.exit(0);
}

fixSlide4And6().catch(console.error);
