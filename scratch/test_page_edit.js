const http = require('http');
const fs = require('fs');

async function main() {
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

  async function scrollToPage(pageNum) {
    await send('Runtime.evaluate', {
      expression: `(() => {
        const scroller = Array.from(document.querySelectorAll('*')).find(el => 
          el.scrollHeight > el.clientHeight + 100 && el.clientHeight > 300 && 
          (window.getComputedStyle(el).overflowY === 'auto' || window.getComputedStyle(el).overflowY === 'scroll')
        );
        if (scroller) {
          scroller.scrollTop = (${pageNum} - 1) * (scroller.scrollHeight / 10);
        }
      })()`
    });
    await new Promise(r => setTimeout(r, 600));
  }

  async function replaceText(targetSubstr, newText) {
    console.log(`\nLooking for: "${targetSubstr}"`);
    const ptInfo = await send('Runtime.evaluate', {
      expression: `(() => {
        const el = Array.from(document.querySelectorAll('*')).find(e => 
          e.children.length === 0 && e.textContent && e.textContent.includes(${JSON.stringify(targetSubstr)})
        );
        if (!el) return null;
        el.scrollIntoView({ block: 'center' });
        const r = el.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2, text: el.textContent.trim().slice(0, 50) };
      })()`,
      returnByValue: true
    });

    const pt = ptInfo.result.result.value;
    if (!pt) {
      console.log(`Target not found: "${targetSubstr}"`);
      return false;
    }
    console.log(`Found: "${pt.text}" at (${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`);

    // Double click to activate Quill
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
    await new Promise(r => setTimeout(r, 60));
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 2 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 2 });
    await new Promise(r => setTimeout(r, 200));

    // Select all in active contenteditable and insertText
    const execRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const act = document.activeElement;
        if (!act || !act.isContentEditable) return { ok: false, actTag: act ? act.tagName : null };
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(act);
        sel.removeAllRanges();
        sel.addRange(range);
        const ok = document.execCommand('insertText', false, ${JSON.stringify(newText)});
        return { ok, activeText: act.innerText.slice(0, 60) };
      })()`,
      returnByValue: true
    });
    console.log('Insert result:', execRes.result.result.value);

    // Escape to commit
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
    await new Promise(r => setTimeout(r, 400));
    return true;
  }

  // Test 1: Page 1 Title
  await scrollToPage(1);
  const slide1Title = "NOTERENDERER AI\nSổ tay Toán học Tương tác Tích hợp Thị giác AI & Mô hình 3D Động";
  await replaceText('NOTERENDERER AI', slide1Title);

  // Test 2: Page 5 Idea & Solution (clean bullets without leading '• ')
  await scrollToPage(5);
  const slide5Clean = `Ý tưởng đột phá: Tích hợp Multimodal Vision LLM (Google Gemini) vào sổ tay số, tự động phân tích ảnh chụp đề bài SGK và dựng mô hình 3D động tức thì (1.5 giây).
Chuẩn hóa Sư phạm 100%: Tự động tính toán vector pháp tuyến camera để phân tách nét đứt (bị che khuất) và nét liền (nhìn thấy) chuẩn quy ước SGK Toán 12.
Tương tác trực quan thời gian thực: Tự do xoay 360°, kéo thanh trượt góc quay θ từ 0° đến 360°, dịch chuyển lát cắt vi phân S(x) để thấu hiểu bản chất tích phân.
Tính an toàn & có trách nhiệm: Ứng dụng phi lợi nhuận, không thu thập dữ liệu cá nhân học sinh, AI thuần túy hỗ trợ tư duy toán học thuật.`;
  await replaceText('Ý tưởng đột phá', slide5Clean);

  await new Promise(r => setTimeout(r, 600));

  // Screenshot Page 1 and Page 5
  await scrollToPage(1);
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/test_page_1.png', Buffer.from(shot.result.data, 'base64'));

  await scrollToPage(5);
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/test_page_5.png', Buffer.from(shot.result.data, 'base64'));

  console.log('Saved scratch/test_page_1.png and scratch/test_page_5.png');

  ws.close();
  process.exit(0);
}

main().catch(console.error);
