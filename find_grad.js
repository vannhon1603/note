const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
const idx = js.indexOf('rgba(251, 113, 133, 0.95)');
console.log('Index:', idx);
if (idx !== -1) {
  console.log(js.substring(idx - 60, idx + 260));
}
