const http = require('http');

async function checkTitle() {
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
      const titles = Array.from(document.querySelectorAll('*')).filter(e => {
        const t = (e.textContent || '').trim();
        return t.toLowerCase().includes('triển khai thực tế') && e.children.length === 0;
      });
      return titles.map(t => ({
        text: t.textContent,
        r: t.getBoundingClientRect()
      }));
    })()`,
    returnByValue: true
  });

  console.log('Slide 6 title instances:', res.result.result.value);

  ws.close();
  process.exit(0);
}

checkTitle().catch(console.error);
