const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// Find l_ in bundle
const p = js.indexOf('function l_(');
console.log('function l_ at', p);
console.log(js.slice(p, p + 400));
