const fs = require('fs');

const path = 'dist/assets/index-D9JME9Hm.js';
let js = fs.readFileSync(path, 'utf8');

// 1. Allow sweepDeg to reach 0
const oldSweepDeg = 'const sweepDeg = Math.max(5, Math.min(360, sweepAngle != null ? sweepAngle : 360));';
const newSweepDeg = 'const sweepDeg = Math.max(0, Math.min(360, sweepAngle != null ? sweepAngle : 360));';

if (js.indexOf(oldSweepDeg) !== -1) {
  js = js.replace(oldSweepDeg, newSweepDeg);
  console.log('✓ sweepDeg allowed from 0°');
}

// 2. Adjust slider right margin so 360° label never touches volume badge
const oldRevSlider = 'const tVolW = (item.volume != null && isFinite(item.volume)) ? 175 : 40;\n    const tY=y+h-18,tX0=x+40,tX1=x+w-tVolW-15,tW=Math.max(60, tX1-tX0);';
const newRevSlider = 'const tVolW = (item.volume != null && isFinite(item.volume)) ? 180 : 40;\n    const tY=y+h-18,tX0=x+40,tX1=x+w-tVolW-45,tW=Math.max(60, tX1-tX0);';

if (js.indexOf(oldRevSlider) !== -1) {
  js = js.replace(oldRevSlider, newRevSlider);
  console.log('✓ Adjusted revolution slider margins');
}

// 3. Format fraction label and volume badge
const oldFracText = 'const fracText=sweepDeg>=355?"Trọn vẹn 1 vòng":sweepDeg===180?"1/2 khối":sweepDeg===90?"1/4 khối":sweepDeg===270?"3/4 khối":Math.round(frac*100)+"%";';
const newFracText = 'const fracText=sweepDeg<=5?"Hình phẳng (H) ban đầu":sweepDeg>=355?"Trọn vẹn 1 vòng":sweepDeg===180?"1/2 khối":sweepDeg===90?"1/4 khối":sweepDeg===270?"3/4 khối":Math.round(frac*100)+"%";';

if (js.indexOf(oldFracText) !== -1) {
  js = js.replace(oldFracText, newFracText);
  console.log('✓ Enhanced fracText label');
}

const oldVolDispRev = 'const volDisplay = (sweepDeg < 355 && isRev) ? ("V(" + Math.round(sweepDeg) + "°) ≈ " + fmtVolume(effVol)) : ("V ≈ " + fmtVolume(item.volume));';
const newVolDispRev = 'const volDisplay = (sweepDeg <= 5 && isRev) ? ("V(0°) = 0 • V_toàn ≈ " + fmtVolume(item.volume)) : (sweepDeg < 355 && isRev) ? ("V(" + Math.round(sweepDeg) + "°) ≈ " + fmtVolume(effVol)) : ("V ≈ " + fmtVolume(item.volume));';

if (js.indexOf(oldVolDispRev) !== -1) {
  js = js.replace(oldVolDispRev, newVolDispRev);
  console.log('✓ Enhanced volDisplay during sweep');
}

// 4. In selection bar, make 0° button set sweepAngle to 0
const old0Btn = 'f.jsx("button",{className:sw<=15?"on":"",title:"Góc 0°: Chỉ hiển thị hình phẳng (H) trong Oxy",onClick:()=>{stopVolAnim();ee.replaceItem(_s.page,{...it,sweepAngle:10,_playing:false});},children:"0°"})';
const new0Btn = 'f.jsx("button",{className:sw<=5?"on":"",title:"Góc 0°: Chỉ hiển thị hình phẳng (H) trong Oxy",onClick:()=>{stopVolAnim();ee.replaceItem(_s.page,{...it,sweepAngle:0,_playing:false});},children:"0°"})';

if (js.indexOf(old0Btn) !== -1) {
  js = js.replace(old0Btn, new0Btn);
  console.log('✓ 0° button sets angle to 0°');
}

fs.writeFileSync(path, js, 'utf8');
console.log('Fine-tuning completed successfully');
