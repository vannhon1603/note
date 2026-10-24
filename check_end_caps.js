const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sIdx = js.indexOf('// End caps at a and b');
console.log('--- END CAPS CODE ---');
console.log(js.slice(sIdx, sIdx + 700));
