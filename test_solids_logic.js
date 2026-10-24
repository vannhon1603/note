const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const idx = js.indexOf('function lP(');
console.log('function lP:');
console.log(js.slice(idx, idx + 800));
