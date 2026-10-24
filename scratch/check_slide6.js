const http = require('http');
const fs = require('fs');

async function checkSlide6() {
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

  // Scroll to Page 6
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

  // Find all text elements in Slide 6 area
  const elements = await send('Runtime.evaluate', {
    expression: `(() => {
      const els = Array.from(document.querySelectorAll('*')).filter(e => {
        if (e.tagName === 'SCRIPT' || e.tagName === 'STYLE' || e.tagName === 'NOSCRIPT') return false;
        if (e.children.length > 0) return false;
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.y > 100 && r.y < 800;
      });
      return els.map(e => ({
        text: (e.textContent || '').trim().slice(0, 60),
        r: { x: e.getBoundingClientRect().x, y: e.getBoundingClientRect().y, w: e.getBoundingClientRect().width, h: e.getBoundingClientRect().height }
      }));
    })()`,
    returnByValue: true
  });

  console.log('Slide 6 visible text elements:', elements.result.result.value);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/canva_slide6_current.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved scratch/canva_slide6_current.png');

  ws.close();
  process.exit(0);
}

checkSlide6().catch(console.error);
