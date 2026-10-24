const fs = require('fs');
const s = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const regex = /ctx\.stroke\(\)/g;
let m;
while ((m = regex.exec(s)) !== null) {
  if (m.index > 1420000 && m.index < 1475000) {
    const snippet = s.slice(Math.max(0, m.index - 150), Math.min(s.length, m.index + 20)).replace(/\n/g, ' ');
    console.log(`[${m.index}] ${snippet}`);
  }
}
