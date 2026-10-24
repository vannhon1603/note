const http = require('http');

async function elementAtPoint() {
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
      const el = document.elementFromPoint(500, 220);
      const span = Array.from(document.querySelectorAll('*')).find(e => 
        e.children.length === 0 && e.textContent && e.textContent.includes('NOTERENDERER AI') &&
        e.tagName !== 'SCRIPT'
      );
      let spanCenter = null;
      if (span) {
        const r = span.getBoundingClientRect();
        spanCenter = { x: r.x + 100, y: r.y + r.height / 2, r, tag: span.tagName, text: span.textContent };
      }
      return {
        at500_220: el ? { tag: el.tagName, className: el.className, id: el.id, text: el.textContent.slice(0, 50) } : null,
        spanCenter,
        topElementAtSpanCenter: spanCenter ? (() => {
          const topEl = document.elementFromPoint(spanCenter.x, spanCenter.y);
          return topEl ? { tag: topEl.tagName, className: topEl.className } : null;
        })() : null
      };
    })()`,
    returnByValue: true
  });

  console.log('Inspection:', res.result.result.value);

  ws.close();
  process.exit(0);
}

elementAtPoint().catch(console.error);
