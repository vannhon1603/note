const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

console.log('--- Around 1196200 (move) ---');
console.log(js.slice(1196150, 1196800));

console.log('\n--- Around 1206450 (up) ---');
console.log(js.slice(1206420, 1206700));
