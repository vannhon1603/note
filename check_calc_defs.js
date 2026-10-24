const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const p = 1258439; // function Sj
console.log('Before Sj:');
console.log(js.slice(p - 3000, p));
