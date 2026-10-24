const fs = require('fs');
const code = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const s = code.indexOf('function cP(');
console.log(code.slice(s + 2000, s + 5000));
