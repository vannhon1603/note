const fs = require('fs');

let bundle = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// Find the face generation loop in drawVolume3D
const pLoopStart = bundle.indexOf('const zAvg = (s00.z + s10.z + s11.z + s01.z) / 4;');
const pLoopEnd = bundle.indexOf('if (ri0 > 0.001 || ri1 > 0.001) {', pLoopStart);

if (pLoopStart === -1 || pLoopEnd === -1) {
  console.error('Could not find face loop');
  process.exit(1);
}

console.log('Original face block:', bundle.substring(pLoopStart, pLoopEnd));
