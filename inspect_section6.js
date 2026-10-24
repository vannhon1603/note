const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
const p1 = content.indexOf('// ─── 6. INTERACTIVE CUT');
console.log('Found Section 6 at:', p1);
console.log(content.slice(p1, p1 + 4000));
