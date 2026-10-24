const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sIdx = js.indexOf('it.type==="volume"&&(()=>{');
console.log('--- SELECTION BAR VOLUME CONTROLS ---');
console.log(js.slice(sIdx, sIdx + 2000));
