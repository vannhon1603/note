const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
const pos = js.indexOf('It("formula")');
console.log('It("formula") at', pos);

// search backwards for where It is declared or passed as argument
let cur = pos;
while (cur > 0) {
  const i = js.lastIndexOf('It', cur - 1);
  if (i < 0) break;
  const sub = js.slice(i, i + 30);
  if (sub.startsWith('It=') || sub.startsWith('It =') || sub.startsWith('It(') || sub.includes('function') || sub.includes('const') || sub.includes('let')) {
    console.log('Near', i, ':', js.slice(Math.max(0, i - 30), i + 70));
    if (sub.startsWith('It=') || sub.startsWith('It =')) break;
  }
  cur = i - 1;
  if (pos - cur > 30000) break;
}
