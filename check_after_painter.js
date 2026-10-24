const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

let pos = js.indexOf('faces.sort((p1, p2) => p1.z - p2.z);');
console.log('--- AFTER PAINTER LOOP ---');
console.log(js.slice(pos, pos + 2500));
