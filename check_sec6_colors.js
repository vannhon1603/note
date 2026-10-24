const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sIdx = js.indexOf('// ─── 6.');
console.log('--- SECTION 6 AND BEYOND ---');
console.log(js.slice(sIdx, sIdx + 3000));
