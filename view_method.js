const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const p = js.lastIndexOf('function', 1191918);
const p2 = js.lastIndexOf('(', 1191918);
console.log('function before 1191918:');
console.log(js.slice(Math.max(0, p - 50), p + 200));

// Or check method signature before 1191918
const chunk = js.slice(1189500, 1191000);
console.log('\nMethod before 1191918:');
console.log(chunk.slice(0, 500));
