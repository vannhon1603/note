const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const chunk = js.slice(1190000, 1191000);
console.log(chunk);
