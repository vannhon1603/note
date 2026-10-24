const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sIdx = js.indexOf('const outerArc = [];');
console.log('--- SECTION 6 PART 2 ---');
console.log(js.slice(sIdx, sIdx + 2500));
