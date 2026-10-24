const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
let idx = 0;
while (true) {
  const f = js.indexOf('truncCylinder', idx);
  if (f === -1) break;
  console.log('truncCylinder at', f, ':', js.slice(Math.max(0, f - 60), f + 100));
  idx = f + 13;
}
