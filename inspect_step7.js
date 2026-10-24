const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sIdx = content.indexOf('// ─── 7. Representative Slice dx for Revolutions');
console.log('Step 7 at', sIdx);
if (sIdx !== -1) {
  console.log(content.substring(sIdx, sIdx + 1800));
}
