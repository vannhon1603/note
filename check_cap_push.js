const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sIdx = js.indexOf('normZ_cap = isRevOx');
console.log('--- REVOLUTION CAP PUSH ---');
console.log(js.slice(sIdx, sIdx + 1200));
