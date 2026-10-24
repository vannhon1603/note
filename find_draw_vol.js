const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// Look for how selected items show controls or handles
// In previous sessions, cross-section handles and solid handles were inspected
let idx = 0;
while (true) {
  const f = js.indexOf('drawVolume3D', idx);
  if (f === -1) break;
  console.log('drawVolume3D at', f, ':', js.slice(Math.max(0, f - 40), f + 100));
  idx = f + 12;
}
