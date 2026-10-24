const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// Find occurrences of "volume"
let idx = 0;
while (true) {
  idx = content.indexOf('"volume"', idx);
  if (idx === -1) break;
  console.log('--- at', idx, '---');
  console.log(content.slice(Math.max(0, idx - 60), idx + 100));
  idx += 8;
}
