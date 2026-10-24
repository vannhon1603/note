const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const start = 1193000;
const end = 1197500;
console.log(js.slice(start, end));
