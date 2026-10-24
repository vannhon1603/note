const fs = require('fs');

const file = 'dist/assets/index-D9JME9Hm.js';
const js = fs.readFileSync(file, 'utf8');

// 1. Check drawVolume3D start
const pFunc = js.indexOf('function drawVolume3D(ctx, item, isFocused) {');
console.log('drawVolume3D starts at:', pFunc);
console.log(js.slice(pFunc, pFunc + 250));

// 2. Check drawAxisArrow
const pArrow = js.indexOf('const drawAxisArrow = (pFrom, pTo, color, len = 11, halfW = 4.2) => {', pFunc);
console.log('drawAxisArrow at:', pArrow);

// 3. Check toolbar insertion point (after Độ mịn group)
const pDoMin = js.indexOf('/* Nhóm Độ mịn */');
console.log('pDoMin at:', pDoMin);
const pEndDoMin = js.indexOf('f.jsx("span",{className:"turn-sep"})', pDoMin);
console.log('pEndDoMin at:', pEndDoMin);
console.log(js.slice(pEndDoMin - 150, pEndDoMin + 150));
