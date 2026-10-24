const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// Find keyboard shortcut handler
const p = js.indexOf('e.key==="f"||e.key==="F"');
console.log('Shortcut F at', p);
if (p >= 0) {
  console.log(js.slice(p - 100, p + 300));
} else {
  // search for keydown or "formula"
  let idx = 0;
  while (true) {
    const f = js.indexOf('k:"formula"', idx);
    if (f === -1) break;
    console.log('k:"formula" at', f, ':', js.slice(Math.max(0, f - 60), f + 100));
    idx = f + 11;
  }
}
