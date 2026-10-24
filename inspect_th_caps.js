const fs = require('fs');
const s = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const p = s.indexOf('// Caps at th = 0 and th = sweepRad');
if (p === -1) {
  const p2 = s.indexOf('// Cap at');
  console.log(s.slice(p2, p2 + 2500));
} else {
  console.log(s.slice(p, p + 2500));
}
