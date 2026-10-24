const fs = require('fs');
const c = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
const idx = c.indexOf('className:"volume-dialog-modal"');
console.log('modal class idx:', idx);
const fnStart = c.lastIndexOf('function ', idx);
console.log('fnStart:', fnStart);
console.log(c.slice(fnStart, fnStart + 600));
