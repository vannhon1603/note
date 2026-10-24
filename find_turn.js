const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// Find solid.turn or solid.view
let idx = 0;
while (true) {
  const f = js.indexOf('.turn', idx);
  if (f === -1) break;
  console.log('.turn at', f, ':', js.slice(Math.max(0, f - 40), f + 60));
  idx = f + 5;
}
