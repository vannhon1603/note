const http = require('http');

async function verifyBoth() {
  const json = await new Promise((resolve) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
  });

  const page = json.find(p => p.url.includes('5173') && p.type === 'page');
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

  const send = (method, params = {}) => {
    return new Promise((resolve) => {
      const reqId = id++;
      callbacks.set(reqId, resolve);
      ws.send(JSON.stringify({ id: reqId, method, params }));
    });
  };

  await new Promise((res) => ws.onopen = res);

  // 1. Reload page
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 1500));

  // 2. Capture screenshot of 3D volume item with new toolbar (without "❖ Di chuyển" button)
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  require('fs').writeFileSync('scratch/verify_volume_no_move_btn.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved scratch/verify_volume_no_move_btn.png');

  // 3. Test Graph item: click on the graph item or select it
  // Let's find the graph item and select it
  await send('Runtime.evaluate', {
    expression: `(() => {
      // Find app/engine to select graph item or toggle transparent
      // We can use pointer click on canvas where graph is
      // Or find graph item in doc
      const pageIdx = 0;
      // Let's find graph item in window/canvas
    })()`
  });

  // Click on the graph item at (450, 450)
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 450, y: 450, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 450, y: 450, button: 'left' });
  await new Promise(r => setTimeout(r, 400));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  require('fs').writeFileSync('scratch/graph_selected_toolbar.png', Buffer.from(shot.result.data, 'base64'));

  // 4. Click "Xóa nền" on the selection toolbar if visible
  await send('Runtime.evaluate', {
    expression: `(() => {
      const xoaNenBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Xóa nền'));
      if (xoaNenBtn) xoaNenBtn.click();
    })()`
  });

  await new Promise(r => setTimeout(r, 500));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  require('fs').writeFileSync('scratch/graph_transparent_verified.png', Buffer.from(shot.result.data, 'base64'));

  console.log('Verification completed');
  ws.close();
}

verifyBoth().catch(console.error);
