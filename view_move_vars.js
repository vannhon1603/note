const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const p = js.lastIndexOf('move(', 1196215);
console.log('move( at', p);
console.log(js.slice(p, p + 400));
