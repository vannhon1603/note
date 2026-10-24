const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
const p = js.indexOf('It("graph")');
console.log(js.slice(p - 100, p + 800));
