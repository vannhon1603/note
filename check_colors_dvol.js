const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sIdx = js.indexOf('function drawVolume3D(');
const eIdx = js.indexOf('function ZapIcon(', sIdx);

const dvol = js.slice(sIdx, eIdx);

// Search for colors, hue, fillStyle in dvol
const lines = dvol.split('\n');
console.log('Total lines in drawVolume3D:', lines.length);

lines.forEach((line, i) => {
  if (line.includes('hue') || line.includes('hsl(') || line.includes('rgba(') || line.includes('fillStyle =') || line.includes('strokeStyle =')) {
    if (line.includes('isCross') || line.includes('isRev') || line.includes('mesh') || line.includes('loft') || line.includes('hue') || line.includes('sec-')) {
      console.log(`Line ${i + 1}: ${line.trim()}`);
    }
  }
});
