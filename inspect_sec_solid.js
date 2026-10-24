const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// Let's inspect everything between 'else {' at line 551 and 'Painter algorithm'
const sIdx = content.indexOf('function drawVolume3D(');
const eIdx = content.indexOf('function VolumeDialog(', sIdx);
const dvol = content.slice(sIdx, eIdx);

const p1 = dvol.indexOf('// ══════ CROSS-SECTION SOLID');
const p2 = dvol.indexOf('// ─── 4. Painter\'s Algorithm', p1);
console.log(dvol.slice(p1, p2));
