const fs = require('fs');

let content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// 1. Transparent background in g_
const gStart = 'e.save(),e.fillStyle="#ffffff",e.fillRect(n,r,i,o),e.beginPath(),e.rect(n,r,i,o),e.clip();';
const gReplacement = 'e.save(),!t.transparent&&(e.fillStyle="#ffffff",e.fillRect(n,r,i,o)),e.beginPath(),e.rect(n,r,i,o),e.clip();';
if (!content.includes(gStart)) {
  console.error('gStart not found');
  process.exit(1);
}
content = content.replace(gStart, gReplacement);

// 2. Checkbox "Xóa nền (Trong suốt)" in kz dialog
const kzRow = 'f.jsxs("label",{className:"check",children:[f.jsx("input",{type:"checkbox",checked:i.grid,onChange:z=>o({...i,grid:z.target.checked})})," ",r.grid]})';
const kzRowReplacement = 'f.jsxs("label",{className:"check",children:[f.jsx("input",{type:"checkbox",checked:i.grid,onChange:z=>o({...i,grid:z.target.checked})})," ",r.grid]}),f.jsxs("label",{className:"check",children:[f.jsx("input",{type:"checkbox",checked:!!i.transparent,onChange:z=>o({...i,transparent:z.target.checked||void 0})})," ","Xóa nền (Trong suốt)"]})';
if (!content.includes(kzRow)) {
  console.error('kzRow not found');
  process.exit(1);
}
content = content.replace(kzRow, kzRowReplacement);

// 3. Save transparent state in kz J
const saveTarget = 't({...z,optF,fns:R,ineqs:B.filter(se=>se.expr.trim()),';
const saveReplacement = 't({...z,optF,transparent:i.transparent,fns:R,ineqs:B.filter(se=>se.expr.trim()),';
if (!content.includes(saveTarget)) {
  console.error('saveTarget not found');
  process.exit(1);
}
content = content.replace(saveTarget, saveReplacement);

// 4. Add "Xóa nền" button to selection toolbar when a graph is selected
const selBarTarget = 'f.jsxs("button",{onClick:()=>ee==null?void 0:ee.duplicate(),children:[f.jsx(de.duplicate,{})," ",n.duplicate]})';
const selBarReplacement = `(()=>{const _si=ee==null?void 0:ee.selectedItem();if(_si&&_si.item&&_si.item.type==="graph"){return f.jsxs("button",{onClick:()=>{_si.item.transparent=!_si.item.transparent;ee.commit(ee.doc);ee.redraw();ee.emit();},children:[f.jsx("span",{style:{fontSize:13},children:"◫"})," ",_si.item.transparent?"Hiện nền":"Xóa nền"]});}return null;})(),f.jsxs("button",{onClick:()=>ee==null?void 0:ee.duplicate(),children:[f.jsx(de.duplicate,{})," ",n.duplicate]})`;
if (!content.includes(selBarTarget)) {
  console.error('selBarTarget not found');
  process.exit(1);
}
content = content.replace(selBarTarget, selBarReplacement);

// 5. Remove "❖ Di chuyển" button from 3D volume toolbar in drawVolume3D
const mBtnDrawTarget = `    // 1. Move Handle Button (Far-left of top bar: clean slate pill)
    const mBtnW = 78, mBtnH = 24, mBtnY = hY + 3, mBtnX = x + 10;
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(mBtnX, mBtnY, mBtnW, mBtnH, 6);
    else ctx.rect(mBtnX, mBtnY, mBtnW, mBtnH);
    ctx.fillStyle = "rgba(248, 250, 252, 0.95)";
    ctx.strokeStyle = "rgba(226, 232, 240, 0.95)";
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#475569";
    ctx.font = "bold 9.5px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("❖ Di chuyển", mBtnX + mBtnW / 2, mBtnY + mBtnH / 2);
    ctx.restore();

    // 2. Mode Segmented Tabs (Unified pill container)
    const tab1W = Math.min(105, Math.max(75, (w - 110) * 0.20));
    const tab2W = Math.min(115, Math.max(80, (w - 110) * 0.22));
    const tabH = 24, tabY = hY + 3;
    const tab1X = mBtnX + mBtnW + 5, tab2X = tab1X + tab1W + 4;`;

const mBtnDrawReplacement = `    // 2. Mode Segmented Tabs (Unified pill container)
    const tab1W = Math.min(105, Math.max(75, (w - 30) * 0.20));
    const tab2W = Math.min(115, Math.max(80, (w - 30) * 0.22));
    const tabH = 24, tabY = hY + 3;
    const tab1X = x + 10, tab2X = tab1X + tab1W + 4;`;

if (!content.includes(mBtnDrawTarget)) {
  console.error('mBtnDrawTarget not found');
  process.exit(1);
}
content = content.replace(mBtnDrawTarget, mBtnDrawReplacement);

// 6. Update selectDown for volume
const selDownTarget = `if(_vItem&&_vItem.type==="volume"){
  const _mBW=78,_mBX=_vItem.x+10;
  if(i.y>=_vItem.y+6&&i.y<=_vItem.y+38&&i.x>=_mBX&&i.x<=_mBX+_mBW){
    this.drag={k:"move",page:t,from:i,moved:!1,whole:this.sel};
    return;
  }
  const _t1W=Math.min(105,Math.max(75,(_vItem.w-110)*0.20));
  const _t2W=Math.min(115,Math.max(80,(_vItem.w-110)*0.22));
  const _t1X=_mBX+_mBW+5,_t2X=_t1X+_t1W+4;`;

const selDownReplacement = `if(_vItem&&_vItem.type==="volume"){
  const _t1W=Math.min(105,Math.max(75,(_vItem.w-30)*0.20));
  const _t2W=Math.min(115,Math.max(80,(_vItem.w-30)*0.22));
  const _t1X=_vItem.x+10,_t2X=_t1X+_t1W+4;`;

if (!content.includes(selDownTarget)) {
  console.error('selDownTarget not found');
  process.exit(1);
}
content = content.replace(selDownTarget, selDownReplacement);

// 7. Update unselected volume
const unselTarget = `if(v.type==="volume"){
  this.sel=d;
  const _mBW=78,_mBX=v.x+10;
  if(i.y>=v.y+6&&i.y<=v.y+38&&i.x>=_mBX&&i.x<=_mBX+_mBW){
    this.drag={k:"move",page:t,from:i,moved:!1,whole:d};
    this.redraw();this.emit();return;
  }
  const _t1W=Math.min(105,Math.max(75,(v.w-110)*0.20));
  const _t2W=Math.min(115,Math.max(80,(v.w-110)*0.22));
  const _t1X=_mBX+_mBW+5,_t2X=_t1X+_t1W+4;`;

const unselReplacement = `if(v.type==="volume"){
  this.sel=d;
  const _t1W=Math.min(105,Math.max(75,(v.w-30)*0.20));
  const _t2W=Math.min(115,Math.max(80,(v.w-30)*0.22));
  const _t1X=v.x+10,_t2X=_t1X+_t1W+4;`;

if (!content.includes(unselTarget)) {
  console.error('unselTarget not found');
  process.exit(1);
}
content = content.replace(unselTarget, unselReplacement);

fs.writeFileSync('dist/assets/index-D9JME9Hm.js', content, 'utf8');
console.log('Successfully applied all changes for both requests!');
