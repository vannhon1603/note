const http = require('http');

async function sendCDP(wsUrl, method, params = {}) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 1;
    ws.onopen = () => {
      ws.send(JSON.stringify({ id: id++, method, params }));
    };
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.result !== undefined || msg.error !== undefined) {
        ws.close();
        resolve(msg.result || msg.error);
      }
    };
    ws.onerror = reject;
  });
}

async function evalInPage(wsUrl, expression) {
  return sendCDP(wsUrl, 'Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
}

(async () => {
  const wsUrl = 'ws://127.0.0.1:9222/devtools/page/3EF8B589CBF8334D8969EA69A63BF9E6';

  const res = await evalInPage(wsUrl, `
    (() => {
      const x = 29, y = 23.6;
      const el = document.elementFromPoint(x, y);
      const allEls = document.elementsFromPoint(x, y);

      const btn = Array.from(document.querySelectorAll('.toolbar button')).find(b => b.title === 'Menu');
      const r = btn.getBoundingClientRect();

      return {
        point: { x, y },
        btnRect: { top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom, right: r.right },
        topElement: el ? { tag: el.tagName, class: el.className, id: el.id } : null,
        allElements: allEls.map(e => ({ tag: e.tagName, class: e.className, id: e.id, pointerEvents: window.getComputedStyle(e).pointerEvents }))
      };
    })()
  `);
  console.log('Inspection:', JSON.stringify(res.result.value, null, 2));
})();
