const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const p = 1260710;
const start = js.lastIndexOf('function', p);
const end = js.indexOf('function', p + 1000);
console.log('Function start:', start, 'end:', end);

const snippet = js.slice(start - 200, p + 4000);
fs.writeFileSync('dump_calc_component.js', snippet, 'utf8');
console.log('Saved dump_calc_component.js length:', snippet.length);
