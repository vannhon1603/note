const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const p = js.indexOf('crossSection');
console.log(js.slice(1185500, 1186600));
