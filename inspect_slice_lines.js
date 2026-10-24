const fs = require('fs');
const s = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const p = s.indexOf('// 4. Draw Slice / Sector Fill with Gradient');
console.log(s.slice(p + 500, p + 2500));
