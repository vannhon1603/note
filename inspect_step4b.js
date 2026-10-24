const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sIdx = content.indexOf('// ─── 4b. Draw Revolution Circles & Arcs');
console.log('Step 4b at', sIdx);
if (sIdx !== -1) {
  console.log(content.substring(sIdx, sIdx + 1800));
}
