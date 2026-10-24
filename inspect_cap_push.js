const fs = require('fs');
const s = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const p = s.indexOf('normZ_cap');
console.log(s.slice(p, p + 1500));
