const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
const p1 = content.indexOf('// ── 5. Floating Formula & Area Badge: S(x) ──');
console.log(content.slice(p1, p1 + 2500));
