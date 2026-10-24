const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sIdx = content.indexOf('const colOx =');
console.log('colOx at', sIdx);
if (sIdx !== -1) {
  console.log(content.substring(sIdx, sIdx + 1500));
}
