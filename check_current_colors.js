const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sIdx = content.indexOf('function drawVolume3D(');
const eIdx = content.indexOf('function VolumeDialog(', sIdx);
const dvol = content.slice(sIdx, eIdx);
const lines = dvol.split('\n');

lines.forEach((line, i) => {
  if (line.includes('isCross') && (line.includes('?') || line.includes('Color') || line.includes('fill') || line.includes('stroke') || line.includes('gradient') || line.includes('grad'))) {
    console.log(`Line ${i + 1}: ${line.trim()}`);
  }
});
