const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const p = js.lastIndexOf('press(', 1191918);
console.log('press( at', p);
console.log(js.slice(p, p + 400));
