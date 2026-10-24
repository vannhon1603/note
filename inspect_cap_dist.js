const fs = require('fs');
const c = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
const start = 1434005;

// Find cap face creation code
const capMarker = 'type: "cap"';
let idx = start;
while ((idx = c.indexOf(capMarker, idx)) !== -1 && idx < start + 200000) {
  console.log('--- cap type at', idx, '---');
  console.log(c.substring(idx - 400, idx + 200));
  console.log();
  idx++;
}
