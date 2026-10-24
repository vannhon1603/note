const http = require('http');

async function inspectPages() {
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
      // Find all page header labels like "Trang 1 - ...", "Trang 2 - ...", etc.
      const pageHeaders = Array.from(document.querySelectorAll('*')).filter(el => {
        return el.children.length === 0 && /^Trang \\d+/.test(el.textContent.trim());
      });
      return pageHeaders.map(el => {
        const text = el.textContent.trim();
        // find parent page container
        let parent = el;
        for (let i = 0; i < 5; i++) {
          if (parent.parentElement) parent = parent.parentElement;
        }
        const r = el.getBoundingClientRect();
        return { text, top: r.top + window.scrollY, y: r.y };
      });
    })()`,
    returnByValue: true
  });

  console.log('Pages found:', res.result.result.value);

  ws.close();
  process.exit(0);
}

inspectPages().catch(console.error);
