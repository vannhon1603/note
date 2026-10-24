const fs = require('fs');
const s = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const p = s.indexOf('// ── 2. Circular / Sector Cross-Section at cutCoord');
console.log(s.slice(p, p + 2800));
