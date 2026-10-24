const fs = require('fs');
const c = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
const idx = c.indexOf('onPointerDown:');
console.log('pointerdown index:', idx);
if (idx >= 0) {
  console.log(c.slice(idx - 100, idx + 800));
}
