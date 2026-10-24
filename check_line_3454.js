const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const lines = js.split('\n');
console.log('Total lines:', lines.length);
if (lines.length > 3450) {
  for (let i = 3445; i < Math.min(lines.length, 3465); i++) {
    console.log((i + 1) + ':', lines[i]);
  }
} else {
  // Single-line or few lines, find case"volSweep"
  const idx = js.indexOf('case"volSweep"');
  console.log('case volSweep at', idx);
  console.log(js.slice(idx - 100, idx + 800));
}
