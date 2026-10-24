const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sIdx = js.indexOf('if (sweepDeg < 359) {');
console.log('--- REVOLUTION CAPS ---');
console.log(js.slice(sIdx, sIdx + 1200));
