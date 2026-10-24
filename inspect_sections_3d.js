const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sIdx = content.indexOf('function drawVolume3D(');
const slice = content.substring(sIdx, sIdx + 70000);

const lines = slice.split('\n');
console.log('Total lines in slice:', lines.length);

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('// ──') || line.includes('function ') || line.includes('// ───')) {
    console.log(`Line ${i + 1}: ${line.trim().substring(0, 100)}`);
  }
}
