const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

let idx = 0;
while (true) {
  const f = js.indexOf('.type==="vartable"', idx);
  if (f === -1) break;
  console.log('Match at', f, ':', js.slice(Math.max(0, f - 60), f + 120));
  idx = f + 18;
}
