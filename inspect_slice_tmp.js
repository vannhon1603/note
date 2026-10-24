const fs = require('fs');
const c = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
const idx = c.indexOf('drawSplitEllipse');
console.log('drawSplitEllipse index:', idx);
if (idx >= 0) {
  console.log(c.slice(idx - 200, idx + 1500));
}
