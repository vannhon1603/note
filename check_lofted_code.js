const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sIdx = js.indexOf('// ── Continuous Lofted 3D Solid ──');
console.log('--- EXACT LOFTED 3D SOLID CODE ---');
console.log(js.slice(sIdx, sIdx + 1800));
