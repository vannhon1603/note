const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

let idx = content.indexOf('getAB');
console.log(content.slice(idx - 50, idx + 400));
