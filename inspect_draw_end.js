const fs = require('fs');
const code = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const idx = code.indexOf('function drawVolume3D');
const idxEnd = code.indexOf('const VOLUME_AXES=', idx);
console.log('drawVolume3D length:', idxEnd - idx);
console.log('Last 800 chars of drawVolume3D:');
console.log(code.slice(idxEnd - 800, idxEnd));
