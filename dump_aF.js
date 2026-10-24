const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
const start = content.indexOf('function aF(');
const end = content.indexOf('function kz(', start);
console.log('aF length:', end - start);
fs.writeFileSync('current_aF.js', content.slice(start, end));
console.log('Saved current_aF.js');
