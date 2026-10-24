const fs = require('fs');

const path = 'dist/assets/index-D9JME9Hm.js';
let js = fs.readFileSync(path, 'utf8');

console.log('Original js length:', js.length);

// 1. Locate volumeSimpsons and computeVolume
const simpsonsIdx = js.indexOf('function volumeSimpsons(');
const volIdx = js.indexOf('function computeVolume(');
const fmtVolIdx = js.indexOf('function fmtVolume(');
const crossAreaIdx = js.indexOf('function computeCrossArea(');
const crossShapeIdx = js.indexOf('function getCrossSectionShape(');

console.log('simpsonsIdx:', simpsonsIdx);
console.log('volIdx:', volIdx);
console.log('fmtVolIdx:', fmtVolIdx);
console.log('crossAreaIdx:', crossAreaIdx);
console.log('crossShapeIdx:', crossShapeIdx);

if (simpsonsIdx === -1 || volIdx === -1 || crossShapeIdx === -1) {
  console.error('Could not find volume functions');
  process.exit(1);
}

// Check what is between crossShapeIdx and drawVolume3D
const drawVolIdx = js.indexOf('function drawVolume3D(');
console.log('drawVolIdx:', drawVolIdx);

console.log('Current section:');
console.log(js.slice(simpsonsIdx, Math.min(simpsonsIdx + 1500, drawVolIdx)));
