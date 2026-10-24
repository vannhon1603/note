const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

let idx = 0;
while (true) {
  const f = js.indexOf('this.selectDown(', idx);
  if (f === -1) break;
  console.log('this.selectDown at', f, ':', js.slice(Math.max(0, f - 40), f + 80));
  idx = f + 16;
}
