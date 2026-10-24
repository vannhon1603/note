const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const idx = content.indexOf('// Tab 1: Quay');
console.log(content.substring(idx - 100, idx + 1200));
