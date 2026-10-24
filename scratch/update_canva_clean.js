const http = require('http');
const fs = require('fs');

async function updateCanvaClean() {
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

  async function replaceText(searchTarget, newText) {
    console.log(`\n=== Finding: "${searchTarget}" ===`);
    const ptInfo = await send('Runtime.evaluate', {
      expression: `(() => {
        // Find text node matching
        const el = Array.from(document.querySelectorAll('*')).find(e => 
          e.children.length === 0 && e.textContent && e.textContent.includes('${searchTarget}')
        );
        if (!el) return null;
        el.scrollIntoView({ block: 'center' });
        const r = el.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2, text: el.textContent.trim(), r };
      })()`,
      returnByValue: true
    });

    const pt = ptInfo.result.result.value;
    if (!pt) {
      console.log(`Could not find: "${searchTarget}"`);
      return false;
    }
    console.log(`Found "${pt.text.slice(0, 40)}" at (${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`);

    // Double click to activate editor
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
    await new Promise(r => setTimeout(r, 60));
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 2 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 2 });
    await new Promise(r => setTimeout(r, 200));

    // Check if activeElement is contenteditable
    const execRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const act = document.activeElement;
        if (!act || !act.isContentEditable) return { ok: false };
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(act);
        sel.removeAllRanges();
        sel.addRange(range);
        const ok = document.execCommand('insertText', false, ${JSON.stringify(newText)});
        return { ok };
      })()`,
      returnByValue: true
    });

    console.log('Insert result:', execRes.result.result.value);

    // Commit by pressing Escape
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
    await new Promise(r => setTimeout(r, 400));
    return true;
  }

  // 1. Slide 1 Title: Clean, perfectly fitting
  await replaceText('NOTERENDERER AI', 'NOTERENDERER AI: SỔ TAY TOÁN HỌC TƯƠNG TÁC TÍCH HỢP THỊ GIÁC AI (MULTIMODAL LLM)');

  // 2. Slide 2: Outline
  const outline = `• Phần 1: Bối cảnh và Thách thức trong dạy học Tích phân Thể tích Toán 12
• Phần 2: Giải pháp NoteRenderer AI: Thị giác AI & Mô hình 3D Động
• Phần 3: Quá trình triển khai thực tế tại trường THPT
• Phần 4: Kết quả thực nghiệm và Tác động giáo dục
• Phần 5: Tính bền vững và Lộ trình mở rộng`;
  await replaceText('Liệt kê ngắn ngọn các nội dung', outline);

  // 3. Slide 4: Scroll down first
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = Array.from(document.querySelectorAll('*')).find(e => e.textContent && e.textContent.includes('bối cảnh và vấn đề'));
      if (el) el.scrollIntoView({ block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 500));

  const contextText = `• Rào cản hình dung không gian: Hơn 72% học sinh gặp khó khăn khi hình dung khối tròn xoay 3D và lát cắt tích phân S(x) từ hình vẽ phẳng 2D trong SGK.
• Lối học vẹt công thức máy móc: Học sinh chỉ học thuộc công thức tính thể tích mà không hiểu bản chất nguyên lý Cavalieri và lát cắt vi phân phân chia không gian.
• Áp lực soạn giảng của giáo viên: Vẽ hình 3D trên bảng tốn 10–15 phút/hình nhưng khó chuẩn xác góc nhìn và quy chuẩn nét đứt/nét liền.`;
  await replaceText('Trình bày ngắn gọn dưới dạng gạch đầu dòng', contextText);

  // 4. Slide 6: Scroll down to slide 6
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = Array.from(document.querySelectorAll('*')).find(e => e.textContent && e.textContent.includes('triển khai thực tế'));
      if (el) el.scrollIntoView({ block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 500));

  const deploymentText = `• Thời gian triển khai: Từ Học kỳ II năm học 2025 - 2026 đến nay.
• Đối tượng thụ hưởng: Giáo viên bộ môn Toán THPT và hơn 450 học sinh lớp 12.
• Phương thức triển khai: Sử dụng trực tiếp trên Web sổ tay trong các tiết dạy chuyên đề Tích phân Thể tích, trình chiếu trên màn hình tương tác và giao bài tự học ở nhà.
• Hoạt động học tập: Học sinh quét ảnh đề bài SGK, tự xoay mô hình 3D và quan sát lát cắt vi phân trước khi tính toán.`;
  await replaceText('Thầy/cô nêu mô tả cách triển khai', deploymentText);

  // Capture final screenshot
  await new Promise(r => setTimeout(r, 800));
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/canva_updated_clean.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved scratch/canva_updated_clean.png');

  ws.close();
  process.exit(0);
}

updateCanvaClean().catch(console.error);
