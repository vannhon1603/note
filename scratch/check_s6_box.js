const http = require('http');

async function inspectSlide6Box() {
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

  // Scroll to Slide 6
  await send('Runtime.evaluate', {
    expression: `(() => {
      const scroller = Array.from(document.querySelectorAll('*')).find(el => 
        el.scrollHeight > el.clientHeight + 100 && el.clientHeight > 300 && 
        (window.getComputedStyle(el).overflowY === 'auto' || window.getComputedStyle(el).overflowY === 'scroll')
      );
      if (scroller) scroller.scrollTop = 5 * (scroller.scrollHeight / 10);
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  const info = await send('Runtime.evaluate', {
    expression: `(() => {
      // Find element containing "phần mềm quản lý"
      const el = Array.from(document.querySelectorAll('*')).find(e => 
        e.children.length === 0 && (e.innerText || e.textContent || '').includes('phần mềm quản lý')
      );
      if (!el) return null;
      let cur = el;
      let box = null;
      while (cur && cur !== document.body) {
        if (cur.style && (cur.style.transform || cur.style.left || cur.style.top)) {
          box = cur;
          break;
        }
        cur = cur.parentElement;
      }
      const r = el.getBoundingClientRect();
      return {
        text: el.textContent,
        rect: { x: r.x, y: r.y, w: r.width, h: r.height },
        boxTag: box ? box.tagName : null,
        boxClass: box ? box.className : null,
        boxStyle: box ? box.getAttribute('style') : null
      };
    })()`,
    returnByValue: true
  });

  console.log('Slide 6 box info:', info.result.result.value);

  ws.close();
  process.exit(0);
}

inspectSlide6Box().catch(console.error);
