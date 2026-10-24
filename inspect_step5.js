const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sIdx = content.indexOf('// ─── 5. Draw 2D Boundary Curves in Base');
console.log('Step 5 at', sIdx);
if (sIdx !== -1) {
  console.log(content.substring(sIdx, sIdx + 1600));
}
