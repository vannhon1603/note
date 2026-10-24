const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const idx = content.indexOf('drag={k:"volSweep"');
console.log('=== 1000 characters before selectDown place 1 ===');
console.log(content.slice(idx - 1000, idx));
