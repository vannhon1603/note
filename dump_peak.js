const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
const p = 1455090;
const snippet = js.slice(p - 600, p + 1000);
fs.writeFileSync('dump_peak_label.js', snippet, 'utf8');
console.log('Saved dump_peak_label.js length:', snippet.length);
