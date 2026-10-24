const http = require('http');

async function inspectRect() {
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
      const span = Array.from(document.querySelectorAll('*')).find(e => 
        e.children.length === 0 && e.textContent && e.textContent.includes('NOTERENDERER AI') &&
        e.tagName !== 'SCRIPT' && e.tagName !== 'STYLE'
      );
      if (!span) return null;
      const p = span.closest('p');
      const box = span.closest('._14BoqA') || p;
      const r = box.getBoundingClientRect();
      return {
        tag: box.tagName,
        className: box.className,
        rect: { x: r.x, y: r.y, w: r.width, h: r.height, right: r.right, bottom: r.bottom }
      };
    })()`,
    returnByValue: true
  });

  console.log('Outer box rect:', res.result.result.value);

  ws.close();
  process.exit(0);
}

inspectRect().catch(console.error);
