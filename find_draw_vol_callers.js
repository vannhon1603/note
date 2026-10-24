const fs = require('fs');
const c = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
let p = 0;
while ((p = c.indexOf('drawVolume3D(', p + 1)) !== -1) {
  console.log('Call at', p, c.slice(p - 100, p + 200));
}
