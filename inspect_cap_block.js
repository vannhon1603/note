const fs = require('fs');
const c = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
const idx = c.indexOf('if (face.type === "cap" && face.nArch)');
console.log(c.slice(idx, idx + 2000));
