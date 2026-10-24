const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sIdx = js.indexOf('// ── 2. Highlighted Cut Polygon with Hatching ──');
console.log('--- HIGHLIGHTED CUT POLYGON ---');
console.log(js.slice(sIdx, sIdx + 2000));
