const http = require('http');
const fs = require('fs');

async function getAllPages() {
  const json = await new Promise((resolve) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
  });

  const page = json.find(p => p.id === 'A150AC8C276CADF071E9500E9996F2AF') || json.find(p => p.url.includes('canva.com') && p.type === 'page');
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

  // Let's inspect the entire text structure across all pages
  const info = await send('Runtime.evaluate', {
    expression: `(() => {
      // Find all page containers
      // Canva renders pages in containers
      const textContainers = [];
      const allTextNodes = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while (node = walker.nextNode()) {
        const txt = node.textContent.trim();
        if (txt.length > 5 && !txt.includes('var ') && !txt.includes('{')) {
          const parent = node.parentElement;
          if (parent && !['SCRIPT', 'STYLE'].includes(parent.tagName)) {
            allTextNodes.push({ text: txt, parentTag: parent.tagName, className: parent.className });
          }
        }
      }
      return { total: allTextNodes.length, sample: allTextNodes };
    })()`,
    returnByValue: true
  });

  fs.writeFileSync('scratch/canva_text_nodes.json', JSON.stringify(info.result.result.value, null, 2));
  console.log('Saved scratch/canva_text_nodes.json');

  ws.close();
  process.exit(0);
}

getAllPages().catch(console.error);
