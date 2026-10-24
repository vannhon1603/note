const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

let p = 0;
while ((p = js.indexOf('calc-title', p)) !== -1) {
  console.log('Found calc-title at:', p);
  console.log(js.slice(p - 100, p + 500));
  p += 10;
}
