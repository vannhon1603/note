const fs = require('fs');
const s = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const p = s.indexOf('// 3. Draw Un-swept Ghost Trajectory Guide');
console.log(s.slice(p, p + 2500));
