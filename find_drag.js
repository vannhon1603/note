const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

let idx = 0;
while (true) {
  const f = js.indexOf('"pointerdown"', idx);
  if (f === -1) break;
  console.log('"pointerdown" at', f, ':', js.slice(Math.max(0, f - 40), f + 100));
  idx = f + 13;
}

idx = 0;
while (true) {
  const f = js.indexOf('this.drag=', idx);
  if (f === -1) break;
  console.log('this.drag= at', f, ':', js.slice(Math.max(0, f - 40), f + 100));
  idx = f + 10;
}
