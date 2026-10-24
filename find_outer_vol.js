const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const p = 1423365;
const pOuter = js.lastIndexOf('function', p - 50);
console.log('Outer function at:', pOuter);
console.log(js.slice(pOuter, pOuter + 500));
