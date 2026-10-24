const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// Check rj.redraw definition
const rIdx = js.indexOf('redraw(){');
console.log('redraw(){ at', rIdx);
if (rIdx !== -1) {
  console.log(js.slice(rIdx, rIdx + 400));
}

// Check how many faces are generated in drawVolume3D
const nAngIdx = js.indexOf('const nAng =');
console.log('nAng at', nAngIdx);
if (nAngIdx !== -1) {
  console.log(js.slice(nAngIdx, nAngIdx + 400));
}

// Check bo(expr)
const boIdx = js.indexOf('function bo(');
console.log('function bo at', boIdx);
if (boIdx !== -1) {
  console.log(js.slice(boIdx, boIdx + 300));
}
