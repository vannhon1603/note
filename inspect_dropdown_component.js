const fs = require('fs');
const code = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

console.log(code.slice(1581500, 1583000));
