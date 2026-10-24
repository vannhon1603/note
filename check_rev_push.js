const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sIdx = js.indexOf('faces.push({', js.indexOf('if (isRev)'));
console.log('--- REVOLUTION FACE PUSH ---');
console.log(js.slice(sIdx - 300, sIdx + 1200));
