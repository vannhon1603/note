const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

let idx = content.indexOf('function VolumeDialog');
let idx2 = content.indexOf('computeVolume', idx);
let idx3 = content.indexOf('computeVolume', idx2 + 15);
console.log(content.slice(idx3 - 100, idx3 + 500));
