const fs = require('fs');

let bundle = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// 1. Step 7 condition: add !isSecRev
const oldStep7 = '  // ─── 7. Representative Slice dx for Revolutions ──────────────────\n  if (showSlice && isRev) {';
const newStep7 = '  // ─── 7. Representative Slice dx for Revolutions ──────────────────\n  if (showSlice && isRev && !isSecRev) {';

if (bundle.includes(oldStep7)) {
  bundle = bundle.replace(oldStep7, newStep7);
  console.log('1. Step 7 condition updated (!isSecRev).');
} else {
  console.log('Step 7 condition already updated or not matched.');
}

// 2. Adjust cutting plane opacity to 0.08 so it is soft and translucent
bundle = bundle.replace('ctx.fillStyle = "rgba(6, 182, 212, 0.12)";', 'ctx.fillStyle = "rgba(6, 182, 212, 0.08)";');
bundle = bundle.replace('ctx.fillStyle = "rgba(6, 182, 212, 0.12)";', 'ctx.fillStyle = "rgba(6, 182, 212, 0.08)";');
console.log('2. Cutting plane opacity tuned.');

// 3. In Tab 2 switch in toolbar: if it.sweepAngle === 0, set sweepAngle: 360 so 3D solid is full
const oldTab2Click = `const targetAx=(it.lastSecAxis&&it.lastSecAxis.startsWith("sec-"))?it.lastSecAxis:(it.axis==="oy"?"sec-oy":"sec-ox");
    setAxis(targetAx);`;
const newTab2Click = `const targetAx=(it.lastSecAxis&&it.lastSecAxis.startsWith("sec-"))?it.lastSecAxis:(it.axis==="oy"?"sec-oy":"sec-ox");
    setAxis(targetAx);
    if(targetAx.startsWith("sec-")&&(!it.sweepAngle||it.sweepAngle<300))ee.replaceItem(_s.page,{...it,axis:targetAx,sweepAngle:360,_playing:false});`;

if (bundle.includes(oldTab2Click)) {
  bundle = bundle.replace(oldTab2Click, newTab2Click);
  console.log('3. Tab 2 click updated with sweepAngle: 360.');
}

fs.writeFileSync('dist/assets/index-D9JME9Hm.js', bundle, 'utf8');
console.log('Done!');
