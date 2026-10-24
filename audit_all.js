const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

console.log('--- AUDIT CHECK ---');
console.log('File size:', js.length, 'bytes');

// Check all solid types
const solids = ["cube","box","prismTri","prismHex","cylinder","cone","sphere","pyramid4","pyramid3","frustumP4","frustumCone","wedge","wedgeRest","truncCylinder","cap","octahedron","plane"];
for (const s of solids) {
  const count = (js.match(new RegExp('"' + s + '"', 'g')) || []).length;
  console.log(`Solid [${s}]: ${count} occurrences`);
}

// Check volume functions
const volChecks = [
  'computeVolume',
  'drawVolume3D',
  'VolumeDialog',
  'volCut',
  'volOrbit',
  'toggleVolAnim',
  'getCrossSectionShape',
  'computeCrossArea',
  'volSecSquare',
  'volSecTriEq',
  'volSecSemiCircle',
  'volSecCircle',
  'volSecTriRight'
];
for (const v of volChecks) {
  console.log(`Volume [${v}]: ${js.includes(v) ? 'OK' : 'MISSING'}`);
}
