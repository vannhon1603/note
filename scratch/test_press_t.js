const http = require('http');
const fs = require('fs');

async function testPressT() {
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

  // Click on the center of Slide 6 (e.g. x: 800, y: 400) to ensure Page 6 is active
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 800, y: 400, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 800, y: 400, button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 200));

  // Press 't'
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 84, code: 'KeyT', key: 't', text: 't' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 84, code: 'KeyT', key: 't' });
  await new Promise(r => setTimeout(r, 400));

  const check = await send('Runtime.evaluate', {
    expression: `(() => {
      const act = document.activeElement;
      return {
        tag: act.tagName,
        isContentEditable: act.isContentEditable,
        className: act.className,
        text: act.innerText
      };
    })()`,
    returnByValue: true
  });
  console.log('Active element after pressing T:', check.result.result.value);

  if (check.result.result.value.isContentEditable) {
    const slide6Content = `Thời gian triển khai: Từ Học kỳ II năm học 2025 - 2026 đến nay.
Đối tượng thụ hưởng: Giáo viên bộ môn Toán THPT và hơn 450 học sinh lớp 12.
Phương thức triển khai: Sử dụng trực tiếp trên Web sổ tay trong các tiết dạy chuyên đề Tích phân Thể tích, trình chiếu trên màn hình tương tác và giao bài tự học ở nhà.
Hoạt động học tập: Học sinh quét ảnh đề bài SGK, tự xoay mô hình 3D và quan sát lát cắt vi phân trước khi tính toán.`;

    const ins = await send('Runtime.evaluate', {
      expression: `(() => {
        const act = document.activeElement;
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(act);
        sel.removeAllRanges();
        sel.addRange(range);
        const ok = document.execCommand('insertText', false, ${JSON.stringify(slide6Content)});
        return { ok, text: act.innerText };
      })()`,
      returnByValue: true
    });
    console.log('Inserted into new text box:', ins.result.result.value);

    // Escape
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
    await new Promise(r => setTimeout(r, 500));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/canva_slide6_with_text.png', Buffer.from(shot.result.data, 'base64'));
    console.log('Saved scratch/canva_slide6_with_text.png');
  }

  ws.close();
  process.exit(0);
}

testPressT().catch(console.error);
