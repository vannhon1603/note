const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const idx = content.indexOf('selectDown(');
console.log('selectDown at', idx);
console.log(content.slice(idx, idx + 400));
