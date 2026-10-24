const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

let idx = content.indexOf('function VolumeDialog');
let idx2 = content.indexOf('computeVolume', idx);
console.log(content.slice(idx2, idx2 + 1000));
