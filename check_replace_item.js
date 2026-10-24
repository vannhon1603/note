const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

console.log('has replaceItem on this?', js.includes('this.replaceItem('));
console.log('has replaceItem definition?', js.includes('replaceItem('));
let idx = 0;
while ((idx = js.indexOf('replaceItem', idx)) !== -1) {
  console.log('replaceItem at', idx, ':', js.slice(Math.max(0, idx - 20), Math.min(js.length, idx + 60)));
  idx += 11;
}
