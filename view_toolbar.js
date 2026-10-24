const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
const p = js.indexOf('"tb-group tools"');
console.log(js.slice(p, p + 2500));
