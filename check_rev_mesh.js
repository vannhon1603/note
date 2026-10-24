const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sIdx = js.indexOf('// ─── 3. Generate 3D Revolution Mesh Faces & Caps');
console.log('--- REVOLUTION MESH FACES ---');
console.log(js.slice(sIdx, sIdx + 2000));
