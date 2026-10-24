const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
const p1 = content.indexOf('if (showSlice && isRev');
console.log('Found showSlice && isRev at:', p1);
console.log(content.slice(p1 - 500, p1 + 2500));
