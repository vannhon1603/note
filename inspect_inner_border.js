const fs = require('fs');
const s = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const p = s.indexOf('// Inner border if full washer');
console.log(s.slice(p, p + 1000));
