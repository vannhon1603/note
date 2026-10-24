const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// Let's inspect case "truncCylinder" in q2
const idx = js.indexOf('case"truncCylinder":');
console.log(js.slice(idx, idx + 400));
