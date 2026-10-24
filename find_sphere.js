const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
let idx = 0;
while (true) {
  idx = js.indexOf('"sphere"', idx);
  if (idx === -1) break;
  const line = js.slice(0, idx).split('\n').length;
  console.log(`Line ${line}: ` + js.slice(Math.max(0, idx - 80), Math.min(js.length, idx + 120)).replace(/\n/g, ' '));
  idx += 8;
}
