const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
const idx = js.indexOf('function NT(');
if (idx !== -1) {
  console.log(js.slice(idx, idx + 800));
} else {
  const idx2 = js.indexOf('NT=');
  console.log(js.slice(idx2, idx2 + 800));
}
