const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const p = js.indexOf('setCrossSection(');
console.log('setCrossSection at', p);
console.log(js.slice(p - 50, p + 400));
