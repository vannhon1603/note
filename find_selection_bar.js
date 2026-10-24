const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

let idx = 0;
while (true) {
  const f = js.indexOf('selection-bar', idx);
  if (f === -1) break;
  console.log('selection-bar at', f, ':', js.slice(Math.max(0, f - 40), f + 150));
  idx = f + 13;
}
