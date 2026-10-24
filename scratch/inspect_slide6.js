const http = require('http');

async function inspectSlide6() {
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

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const h = Array.from(document.querySelectorAll('*')).find(e => 
        e.children.length === 0 && e.textContent && e.textContent.toLowerCase().includes('triển khai thực tế')
      );
      if (!h) return { foundHeader: false };
      const hRect = h.getBoundingClientRect();

      const allEls = Array.from(document.querySelectorAll('*')).filter(e => e.children.length === 0 && e.textContent && e.textContent.trim().length > 5);
      const nearby = allEls.map(e => {
        const r = e.getBoundingClientRect();
        return { text: e.textContent.trim(), x: r.x, y: r.y, w: r.width, h: r.height };
      }).filter(item => Math.abs(item.y - hRect.y) < 400 && !item.text.toLowerCase().includes('triển khai thực tế'));

      return {
        header: { text: h.textContent.trim(), rect: hRect },
        nearby
      };
    })()`,
    returnByValue: true
  });

  console.log('Slide 6 elements:', JSON.stringify(res.result.result.value, null, 2));

  ws.close();
  process.exit(0);
}

inspectSlide6().catch(console.error);
