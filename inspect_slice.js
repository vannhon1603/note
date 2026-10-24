const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
const p1 = content.indexOf('const planeTag = isRevY');
console.log('Found planeTag at:', p1);
console.log(content.slice(p1 - 1500, p1 + 3000));
