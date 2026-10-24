const fs = require('fs');
const s = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const p = s.indexOf('const isRevOx = currentAxis === "ox"');
console.log(s.slice(p, p + 2500));
