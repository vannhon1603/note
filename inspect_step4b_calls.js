const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sIdx = content.indexOf('drawRevolutionArc(');
let idx = sIdx;
while (idx !== -1) {
  console.log(content.substring(idx - 50, idx + 100));
  idx = content.indexOf('drawRevolutionArc(', idx + 1);
}
