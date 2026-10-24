const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const start = 1197500;
const end = 1201500;
console.log(js.slice(start, end));
