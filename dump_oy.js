const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
const p = 1430689;
const snippet = js.slice(p - 1500, p);
fs.writeFileSync('dump_oy_axis.js', snippet, 'utf8');
console.log('Saved dump_oy_axis.js');
