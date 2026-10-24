const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sIdx = content.indexOf('ctx.strokeStyle = strokeCol;');
console.log('Rest of Step 4b:');
console.log(content.substring(sIdx, sIdx + 1200));
