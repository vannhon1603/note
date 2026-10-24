const fs = require('fs');
const s = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const p = s.indexOf('// ══════ REVOLUTION SOLID (Rotatable around Ox or Oy) ══════');
console.log(s.slice(p, p + 2800));
