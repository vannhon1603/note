const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
const start = content.indexOf('function aF(');
const nextFn = content.indexOf('function ', start + 12);
console.log('Next function at:', nextFn);
console.log('Next function signature:', content.slice(nextFn, nextFn + 40));
fs.writeFileSync('current_aF.js', content.slice(start, nextFn));
console.log('Saved current_aF.js, length:', nextFn - start);
