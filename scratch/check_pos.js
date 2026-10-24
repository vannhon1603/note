const http = require('http');

async function checkPos() {
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
      const scroller = Array.from(document.querySelectorAll('*')).find(el => 
        el.scrollHeight > el.clientHeight + 100 && el.clientHeight > 300 && 
        (window.getComputedStyle(el).overflowY === 'auto' || window.getComputedStyle(el).overflowY === 'scroll')
      );
      if (scroller) scroller.scrollTop = 0;
      window.scrollTo(0, 0);

      const span = Array.from(document.querySelectorAll('*')).find(e => 
        e.children.length === 0 && e.textContent && e.textContent.includes('NOTERENDERER AI') &&
        e.tagName !== 'SCRIPT' && e.tagName !== 'STYLE'
      );
      if (!span) return null;
      const r = span.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height, text: span.textContent };
    })()`,
    returnByValue: true
  });

  console.log('Span natural rect when scrollTop = 0:', res.result.result.value);

  ws.close();
  process.exit(0);
}

checkPos().catch(console.error);
