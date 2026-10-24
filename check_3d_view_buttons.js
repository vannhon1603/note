const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const idx = content.indexOf('↻ 3D');
if (idx !== -1) {
  console.log('Found ↻ 3D at', idx);
  console.log(content.slice(idx - 200, idx + 600));
} else {
  console.log('↻ 3D not found');
}
