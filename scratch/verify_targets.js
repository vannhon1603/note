const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// Target 1: g_ white background
const gStart = 'e.save(),e.fillStyle="#ffffff",e.fillRect(n,r,i,o),e.beginPath(),e.rect(n,r,i,o),e.clip();';
console.log('gStart found:', content.includes(gStart));

// Target 2: kz dialog row with grid checkbox
const kzRow = 'f.jsxs("label",{className:"check",children:[f.jsx("input",{type:"checkbox",checked:i.grid,onChange:z=>o({...i,grid:z.target.checked})})," ",r.grid]})';
console.log('kzRow found:', content.includes(kzRow));

// Target 3: Selection bar duplicate button
const selBarTarget = 'f.jsxs("button",{onClick:()=>ee==null?void 0:ee.duplicate(),children:[f.jsx(de.duplicate,{})," ",n.duplicate]})';
console.log('selBarTarget found:', content.includes(selBarTarget));

// Target 4: drawVolume3D move button
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
console.log('mBtnDrawTarget found:', content.includes(mBtnDrawTarget));

// Target 5: selectDown
const selDownTarget = `if(_vItem&&_vItem.type==="volume"){
  const _mBW=78,_mBX=_vItem.x+10;
  if(i.y>=_vItem.y+6&&i.y<=_vItem.y+38&&i.x>=_mBX&&i.x<=_mBX+_mBW){
    this.drag={k:"move",page:t,from:i,moved:!1,whole:this.sel};
    return;
  }
  const _t1W=Math.min(105,Math.max(75,(_vItem.w-110)*0.20));
  const _t2W=Math.min(115,Math.max(80,(_vItem.w-110)*0.22));
  const _t1X=_mBX+_mBW+5,_t2X=_t1X+_t1W+4;`;
console.log('selDownTarget found:', content.includes(selDownTarget));

// Target 6: unselected volume
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
console.log('unselTarget found:', content.includes(unselTarget));
