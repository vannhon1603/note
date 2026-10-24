const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
const p = 1597667;
const end = js.indexOf('(ee==null?void 0:ee.selectionPoints())', p);
console.log('End at:', end);
const snippet = js.slice(p, end + 50);
fs.writeFileSync('dump_sel_bar_vol.js', snippet, 'utf8');
console.log('Dumped length:', snippet.length);
