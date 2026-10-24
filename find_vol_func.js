const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const p = 1430689;
// Let's search backwards for the function declaration
const pFunc = js.lastIndexOf('function', p);
console.log('Function declaration at:', pFunc);
console.log(js.slice(pFunc, pFunc + 300));
