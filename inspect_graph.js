const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

let idx = 0;
while (true) {
  const f = js.indexOf('.type === "graph"', idx);
  if (f === -1) break;
  console.log('graph match at', f, ':', js.slice(Math.max(0, f - 40), f + 150));
  idx = f + 16;
}

// Find graph dialog
const gd = js.indexOf('function GraphDialog') !== -1 ? 'GraphDialog' : 'kz';
console.log('Checking graph component:');
let p = js.indexOf('function kz');
if (p !== -1) {
  console.log('kz at', p, ':', js.slice(p, p + 500));
}
