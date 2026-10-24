const http = require('http');

async function inspectAncestors() {
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

  const info = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = Array.from(document.querySelectorAll('*')).find(e => 
        e.children.length === 0 && (e.innerText || e.textContent || '').includes('phần mềm quản lý')
      );
      if (!el) return null;
      let path = [];
      let cur = el;
      while (cur && cur !== document.body) {
        path.push({
          tag: cur.tagName,
          id: cur.id,
          class: cur.className,
          style: cur.getAttribute('style'),
          rect: cur.getBoundingClientRect()
        });
        cur = cur.parentElement;
      }
      return path.slice(0, 10);
    })()`,
    returnByValue: true
  });

  console.log('Ancestors:', JSON.stringify(info.result.result.value, null, 2));

  ws.close();
  process.exit(0);
}

inspectAncestors().catch(console.error);
