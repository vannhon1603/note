const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// Find switch(r.k) in pointerup or pointermove
let idx = 0;
while (true) {
  const f = js.indexOf('case"crossSection":', idx);
  if (f === -1) break;
  console.log('case"crossSection" at', f, ':', js.slice(Math.max(0, f - 40), f + 250));
  idx = f + 18;
}
