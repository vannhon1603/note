const http = require('http');
const fs = require('fs');

async function formatDeck() {
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

  // Clean helper to replace text in an element found by text content
  async function editElementWithText(searchSubstr, newText) {
    console.log(`\nSearching for element with: "${searchSubstr}"`);
    const ptInfo = await send('Runtime.evaluate', {
      expression: `(() => {
        // Find element that has this text and is visible on screen
        const els = Array.from(document.querySelectorAll('*')).filter(e => {
          if (e.tagName === 'SCRIPT' || e.tagName === 'STYLE' || e.tagName === 'NOSCRIPT') return false;
          const t = (e.innerText || e.textContent || '').trim();
          if (!t.includes(${JSON.stringify(searchSubstr)})) return false;
          // check if leaf-ish
          return Array.from(e.children).every(c => !(c.innerText || '').includes(${JSON.stringify(searchSubstr)}));
        });
        if (els.length === 0) return null;
        const el = els[0];
        const r = el.getBoundingClientRect();
        return {
          x: r.x + Math.min(100, r.width / 2),
          y: r.y + Math.min(30, r.height / 2),
          rect: { x: r.x, y: r.y, w: r.width, h: r.height },
          text: (el.innerText || el.textContent).slice(0, 40)
        };
      })()`,
      returnByValue: true
    });

    const pt = ptInfo.result.result.value;
    if (!pt) {
      console.log(`Not found: "${searchSubstr}"`);
      return false;
    }
    console.log(`Found "${pt.text}" at (${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`);

    // Double click to enter Quill
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
    await new Promise(r => setTimeout(r, 60));
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 2 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 2 });
    await new Promise(r => setTimeout(r, 200));

    // Check Quill editor
    const insertRes = await send('Runtime.evaluate', {
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
        const ok = document.execCommand('insertText', false, ${JSON.stringify(newText)});
        return { ok, text: target.innerText ? target.innerText.slice(0, 80) : null };
      })()`,
      returnByValue: true
    });
    console.log('Insert result:', insertRes.result.result.value);

    // Escape to commit
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
    await new Promise(r => setTimeout(r, 300));
    return true;
  }

  // 1. PAGE 2 (DÀN Ý SLIDE)
  console.log('\n--- FORMATTING PAGE 2 ---');
  await scrollToPage(2);
  const slide2Outline = `Phần 1: Bối cảnh & Thách thức trong dạy học Toán 12
Phần 2: Giải pháp NoteRenderer AI: Thị giác AI & Mô hình 3D Động
Phần 3: Quá trình triển khai thực tế tại trường THPT
Phần 4: Kết quả thực nghiệm và Tác động giáo dục
Phần 5: Tính bền vững và Định hướng mở rộng`;
  await editElementWithText('Liệt kê ngắn ngọn', slide2Outline);
  await editElementWithText('Thêm hình minh họa', 'Giao diện tương tác trực quan 3D NoteRenderer AI');

  // 2. PAGE 4 (BỐI CẢNH VÀ VẤN ĐỀ)
  console.log('\n--- FORMATTING PAGE 4 ---');
  await scrollToPage(4);
  const slide4Content = `Rào cản tư duy không gian: Hơn 72% học sinh gặp khó khăn khi hình dung các khối tròn xoay 3D và lát cắt vi phân S(x) từ hình vẽ 2D phẳng trong SGK.
Học sinh học vẹt công thức: Thiếu sự thấu hiểu trực quan về nguyên lý Cavalieri, dẫn đến lúng túng khi gặp các bài toán biến đổi hoặc toán ứng dụng thực tế.
Áp lực soạn giảng của giáo viên: Mất 10-15 phút vẽ một khối hình không gian lên bảng, nhưng vẫn khó truyền tải trực quan các góc khuất và chuyển động quay.`;
  await editElementWithText('Trình bày ngắn gọn dưới dạng gạch đầu dòng', slide4Content);

  // 3. PAGE 5 (Ý TƯỞNG VÀ GIẢI PHÁP)
  console.log('\n--- FORMATTING PAGE 5 ---');
  await scrollToPage(5);
  const slide5Clean = `Ý tưởng đột phá: Tích hợp Multimodal Vision LLM (Google Gemini) vào sổ tay số, tự động phân tích ảnh chụp đề bài SGK và dựng mô hình 3D động tức thì (1.5 giây).
Chuẩn hóa Sư phạm 100%: Tự động tính toán vector pháp tuyến camera để phân tách nét đứt (bị che khuất) và nét liền (nhìn thấy) chuẩn quy ước SGK Toán 12.
Tương tác trực quan thời gian thực: Tự do xoay 360°, kéo thanh trượt góc quay θ từ 0° đến 360°, dịch chuyển lát cắt vi phân S(x) để thấu hiểu bản chất tích phân.
Tính an toàn & có trách nhiệm: Ứng dụng phi lợi nhuận, không thu thập dữ liệu cá nhân học sinh, AI thuần túy hỗ trợ tư duy toán học thuật.`;
  await editElementWithText('Ý tưởng đột phá', slide5Clean);

  // 4. PAGE 6 (TRIỂN KHAI THỰC TẾ)
  console.log('\n--- FORMATTING PAGE 6 ---');
  await scrollToPage(6);
  const slide6Content = `Thời gian triển khai: Từ Học kỳ II năm học 2025 - 2026 đến nay.
Đối tượng thụ hưởng: Giáo viên bộ môn Toán THPT và hơn 450 học sinh lớp 12.
Phương thức triển khai: Sử dụng trực tiếp trên Web sổ tay trong các tiết dạy chuyên đề Tích phân Thể tích, trình chiếu trên màn hình tương tác và giao bài tự học ở nhà.
Hoạt động học tập: Học sinh quét ảnh đề bài SGK, tự xoay mô hình 3D và quan sát lát cắt vi phân trước khi tính toán.`;
  // Slide 6 might have old text or placeholder
  const s6Ok = await editElementWithText('Thời gian triển khai', slide6Content);
  if (!s6Ok) {
    await editElementWithText('Thầy/cô nêu mô tả', slide6Content);
  }

  // 5. PAGE 7 (KẾT QUẢ VÀ TÁC ĐỘNG)
  console.log('\n--- FORMATTING PAGE 7 ---');
  await scrollToPage(7);
  const slide7Clean = `Tỉ lệ hiểu bài và hứng thú tăng vọt: Đạt 89% học sinh hiểu sâu bản chất tích phân (so với mức 42% trước khi áp dụng); 88% học sinh hào hứng học tập.
Tiết kiệm 75% thời gian chuẩn bị của giáo viên: Giảm từ 15 phút vẽ tay xuống còn 10 giây qua thao tác dán ảnh AI.
Điểm trung bình kiểm tra chuyên đề tăng từ 7.1 lên 8.7.
Đổi mới phương pháp dạy học theo định hướng phát triển năng lực tư duy không gian của Chương trình GDPT 2018.`;
  await editElementWithText('Tỉ lệ hiểu bài', slide7Clean);

  // 6. PAGE 8 (THẢO LUẬN VÀ TỔNG KẾT)
  console.log('\n--- FORMATTING PAGE 8 ---');
  await scrollToPage(8);
  const slide8Clean = `Tính bền vững cao: Ứng dụng nền tảng Web thuần (Web-first), không yêu cầu phần cứng cao, chạy mượt mà trên mọi thiết bị và bảng tương tác.
Chi phí triển khai 0 đồng: Tiết kiệm tối đa ngân sách nhà trường, không tốn chi phí bản quyền phần mềm hay máy chủ.
Dễ dàng nhân rộng toàn quốc: Giáo viên và học sinh ở bất kỳ đâu chỉ cần đường link trình duyệt là có thể sử dụng ngay.
Lộ trình mở rộng: Tiếp tục mở rộng sang toàn bộ chuyên đề Hình học không gian 10, 11, 12 và Hình học giải tích không gian Oxyz.`;
  await editElementWithText('Tính bền vững', slide8Clean);

  // 7. PAGE 9 (TÀI LIỆU/THÔNG TIN ĐÍNH KÈM)
  console.log('\n--- FORMATTING PAGE 9 ---');
  await scrollToPage(9);
  const slide9Clean = `Đường dẫn trải nghiệm trực tiếp ứng dụng sổ tay: http://localhost:5173/ (hoặc bản trực tuyến)
Video demo thuyết trình và hướng dẫn sử dụng (5 phút): Thư mục Google Drive minh chứng dự án (https://drive.google.com/drive/folders/1M0yA6aKes6m5A3Og54DVjnZOYNtJM6la)
Toàn bộ mã nguồn và hồ sơ kỹ thuật dự án: https://github.com/duancty/note
Kèm theo bộ dữ liệu thực nghiệm, bài tập trắc nghiệm và hình ảnh lớp học.`;
  await editElementWithText('Đường dẫn trải nghiệm', slide9Clean);

  console.log('\n=== ALL SLIDES FORMATTED! ===');
  ws.close();
  process.exit(0);
}

formatDeck().catch(console.error);
