const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const checks = [
  ['VolumeDialog function', 'function VolumeDialog('],
  ['drawVolume3D function', 'function drawVolume3D('],
  ['fmtVolume function', 'function fmtVolume('],
  ['computeVolume function', 'function computeVolume('],
  ['volume dialog render', 'ze.k==="volume"&&f.jsx(VolumeDialog'],
  ['volumeTitle label', 'volumeTitle:'],
  ['toolbar vartable button', 'vartableTip'],
  ['pv volume dispatch', 'type==="volume"){drawVolume3D'],
  ['Int V button', '\u222bV'],
];
for (const [name, target] of checks) {
  const idx = js.indexOf(target);
  console.log(name + ':', idx >= 0 ? 'FOUND at ' + idx : 'NOT FOUND');
}

// Find toolbar area around vartable button
const vartableBtn = js.indexOf('vartableTip');
if (vartableBtn >= 0) {
  console.log('\n--- Toolbar area around vartableTip ---');
  console.log(js.slice(vartableBtn - 50, vartableBtn + 500));
}
