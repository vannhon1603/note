const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

function search(str) {
  let idx = 0;
  let count = 0;
  while ((idx = js.indexOf(str, idx)) !== -1 && count < 2) {
    console.log(`Found "${str}" at ${idx}:`);
    console.log(js.substring(Math.max(0, idx - 40), Math.min(js.length, idx + 260)));
    idx += str.length + 10;
    count++;
  }
  if (count === 0) console.log(`Not found: "${str}"`);
}

search('selection-bar');
search('pages-panel');
search('sheet-bar');
search('dialog-head');
search('toolbar');
