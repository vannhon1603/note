const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sIdx = js.indexOf('function drawVolume3D(');
const eIdx = js.indexOf('function ZapIcon(', sIdx);
const dvol = js.slice(sIdx, eIdx);
const lines = dvol.split('\n');

console.log('--- REVOLUTION MESH (lines 370-520) ---');
console.log(lines.slice(370, 520).join('\n'));

console.log('--- LOFTED CROSS SECTION MESH (lines 540-700) ---');
console.log(lines.slice(540, 700).join('\n'));
