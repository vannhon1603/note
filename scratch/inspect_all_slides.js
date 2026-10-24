const http = require('http');
const fs = require('fs');

async function main() {
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

  // Get all slide headers or pages
  const slides = await send('Runtime.evaluate', {
    expression: `(() => {
      // Find all slide labels/headers or page sections
      const headings = Array.from(document.querySelectorAll('*')).filter(el => {
        const t = (el.textContent || '').trim();
        return el.children.length === 0 && (
          t === 'Giáo viên thực hiện' ||
          t.toLowerCase().includes('dàn ý') ||
          t.toLowerCase().includes('nội dung bài trình bày') ||
          t.toLowerCase().includes('bối cảnh') ||
          t.toLowerCase().includes('ý tưởng và giải pháp') ||
          t.toLowerCase().includes('triển khai thực tế') ||
          t.toLowerCase().includes('kết quả và tác động') ||
          t.toLowerCase().includes('thảo luận') ||
          t.toLowerCase().includes('tài liệu')
        );
      });
      return headings.map(h => ({
        text: h.textContent.trim(),
        top: h.getBoundingClientRect().top + window.scrollY
      }));
    })()`,
    returnByValue: true
  });

  console.log('Detected slide markers:', slides.result.result.value);

  const markers = slides.result.result.value;
  for (let i = 0; i < markers.length; i++) {
    const m = markers[i];
    await send('Runtime.evaluate', {
      expression: `(() => {
        const el = Array.from(document.querySelectorAll('*')).find(e => e.children.length === 0 && e.textContent && e.textContent.trim() === ${JSON.stringify(m.text)});
        if (el) el.scrollIntoView({ block: 'start' });
      })()`
    });
    await new Promise(r => setTimeout(r, 600));
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`scratch/slide_${i + 1}_${m.text.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20)}.png`, Buffer.from(shot.result.data, 'base64'));
    console.log(`Captured slide ${i + 1}: ${m.text}`);
  }

  ws.close();
  process.exit(0);
}

main().catch(console.error);
