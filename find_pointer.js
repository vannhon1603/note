const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// Find pointer event handlers in the editor
let idx = 0;
while (true) {
  const f = js.indexOf('pointerDown', idx);
  if (f === -1) break;
  console.log('pointerDown at', f, ':', js.slice(Math.max(0, f - 40), f + 100));
  idx = f + 11;
}
