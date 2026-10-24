const fs = require('fs');

const path = 'dist/assets/index-D9JME9Hm.js';
let js = fs.readFileSync(path, 'utf8');

// 1. Shorten badge titles slightly to fit neatly in any card size
const oldIso = 'badgeTitle = "⊿ Mặt cắt: Tam giác vuông cân (cạnh huyền)";';
const newIso = 'badgeTitle = "⊿ Vuông cân (cạnh huyền đáy)";';

const oldRight = 'badgeTitle = "⊿ Mặt cắt: Tam giác vuông cân (cạnh góc vuông)";';
const newRight = 'badgeTitle = "⊿ Vuông cân (cạnh góc vuông)";';

if (js.indexOf(oldIso) !== -1) {
  js = js.replace(oldIso, newIso);
  console.log('Shortened iso title');
}

if (js.indexOf(oldRight) !== -1) {
  js = js.replace(oldRight, newRight);
  console.log('Shortened right title');
}

// 2. Set cardW to 205
const oldCardW = 'const cardW = Math.max(220, Math.min(300, w * 0.56)), cardH = 50;';
const newCardW = 'const cardW = Math.min(210, Math.max(170, w * 0.42)), cardH = 50;';

if (js.indexOf(oldCardW) !== -1) {
  js = js.replace(oldCardW, newCardW);
  console.log('cardW set to compact dynamic width');
}

// 3. Compact hint text slightly
const oldHint = 'const hintText=isCross?"🔄 Kéo hình để xoay 3D • Kéo ↔ trượt mặt cắt":"🔄 Kéo chuột trên hình để xoay 3D";';
const newHint = 'const hintText=isCross?"🔄 Kéo xoay 3D • ↔ Trượt mặt cắt":"🔄 Kéo xoay 3D";';

if (js.indexOf(oldHint) !== -1) {
  js = js.replace(oldHint, newHint);
  console.log('hintText updated to compact');
}

fs.writeFileSync(path, js, 'utf8');
console.log('Title width fixes written successfully');
