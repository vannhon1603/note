const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sIdx = js.indexOf('function drawVolume3D(');
const revIdx = js.indexOf('if (isRev)', sIdx);
console.log('--- IF ISREV IN DRAWVOLUME3D ---');
console.log(js.slice(revIdx, revIdx + 2000));
