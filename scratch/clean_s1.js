const http = require('http');
const fs = require('fs');

async function cleanSlide1Strays() {
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

  // Close the left sidebar panel by clicking the chevron at (224, 528) or Escape
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
  await new Promise(r => setTimeout(r, 200));

  // Find stray elements on Page 1: "TRIỂN KHAI THỰC TẾ" and "Thêm nội dung văn bản"
  await send('Runtime.evaluate', {
    expression: `(() => {
      // Find element containing "TRIỂN KHAI THỰC TẾ"
      const stray1 = Array.from(document.querySelectorAll('*')).find(e => 
        e.children.length === 0 && (e.innerText || e.textContent || '').includes('TRIỂN KHAI THỰC TẾ')
      );
      if (stray1) {
        // find bounding box or canvas wrapper
        let cur = stray1;
        while (cur && cur.parentElement && !cur.parentElement.classList.contains('_14BoqA') && !cur.parentElement.classList.contains('DPPJ_A')) {
          cur = cur.parentElement;
        }
        if (cur && cur.parentElement) cur.remove();
      }

      const stray2 = Array.from(document.querySelectorAll('*')).find(e => 
        e.children.length === 0 && (e.innerText || e.textContent || '').includes('Thêm nội dung văn bản')
      );
      if (stray2) {
        let cur = stray2;
        while (cur && cur.parentElement && !cur.parentElement.classList.contains('_14BoqA') && !cur.parentElement.classList.contains('DPPJ_A')) {
          cur = cur.parentElement;
        }
        if (cur && cur.parentElement) cur.remove();
      }
    })()`
  });

  await new Promise(r => setTimeout(r, 400));

  // Now ensure the Title on Page 1 is set to:
  // "NOTERENDERER AI\nSỔ TAY TOÁN HỌC TƯƠNG TÁC AI"
  // Click at (810, 480)
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 810, y: 480, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 810, y: 480, button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 60));
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 810, y: 480, button: 'left', clickCount: 2 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 810, y: 480, button: 'left', clickCount: 2 });
  await new Promise(r => setTimeout(r, 200));

  const cleanTitle = "NOTERENDERER AI\nSỔ TAY TOÁN HỌC TƯƠNG TÁC AI";
  await send('Runtime.evaluate', {
    expression: `(() => {
      const act = document.activeElement;
      if (!act || !act.isContentEditable) return false;
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(act);
      sel.removeAllRanges();
      sel.addRange(range);
      return document.execCommand('insertText', false, ${JSON.stringify(cleanTitle)});
    })()`
  });

  // Escape to commit
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27, code: 'Escape', key: 'Escape' });
  await new Promise(r => setTimeout(r, 500));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/canva_slide1_clean_final.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved scratch/canva_slide1_clean_final.png');

  ws.close();
  process.exit(0);
}

cleanSlide1Strays().catch(console.error);
