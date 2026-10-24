const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

function find(str) {
  let idx = 0;
  while ((idx = js.indexOf(str, idx)) !== -1) {
    console.log(`Found "${str}" at ${idx}`);
    console.log(js.substring(Math.max(0, idx - 100), Math.min(js.length, idx + 400)));
    console.log('----------------------------------------');
    idx += str.length + 10;
  }
}

find('activeCutX');
