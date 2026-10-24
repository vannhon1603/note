const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
const p = 1430689;
const snippet = js.slice(p - 1500, p + 2500);
fs.writeFileSync('dump_axes_and_labels.js', snippet, 'utf8');
console.log('Dumped to dump_axes_and_labels.js length:', snippet.length);
