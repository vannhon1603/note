const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const pStart = 1420108;
const pEnd = 1509048;

const snippet = js.slice(pStart, pEnd);
fs.writeFileSync('dump_drawVolume3D_full.js', snippet, 'utf8');
console.log('Saved dump_drawVolume3D_full.js length:', snippet.length);
