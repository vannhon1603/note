const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
const key = 'type:"vartable"';
let idx = 0;
while ((idx = content.indexOf(key, idx)) !== -1) {
  console.log('Found vartable at', idx);
  console.log(content.slice(idx - 50, idx + 350));
  idx += key.length;
}
