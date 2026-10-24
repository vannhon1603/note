const fs = require('fs');
const c = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
const idx = c.indexOf('type: "cap"');
console.log('cap index:', idx);
if (idx >= 0) {
  console.log(c.slice(idx - 600, idx + 400));
}
