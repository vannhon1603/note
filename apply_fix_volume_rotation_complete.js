const fs = require('fs');

const file = 'dist/assets/index-D9JME9Hm.js';
let content = fs.readFileSync(file, 'utf8');

function checkAndReplace(target, replacement, label) {
  const count = content.split(target).length - 1;
  if (count !== 1) {
    console.error(`[ERROR] Target for "${label}" count is ${count} (expected 1).`);
    process.exit(1);
  }
  content = content.replace(target, replacement);
  console.log(`[OK] Replaced: ${label}`);
}

// 1. In drawVolume3D: Default sweepDeg to 360 when sweepAngle is undefined/null
const targetSweepDeg = 'const sweepDeg = isCross ? 360 : Math.max(0, Math.min(360, sweepAngle != null ? sweepAngle : 0));';
const replaceSweepDeg = 'const sweepDeg = isCross ? 360 : Math.max(0, Math.min(360, sweepAngle != null ? sweepAngle : 360));';
checkAndReplace(targetSweepDeg, replaceSweepDeg, '1. Default sweepDeg to 360 in drawVolume3D');

// 2. In VolumeDialog state: default modalSweep to 360 (so new items are created with 3D solid, not 0)
const targetModalSweepState = 'const[modalSweep,setModalSweep]=H.useState(item&&item.sweepAngle!=null?item.sweepAngle:0);';
const replaceModalSweepState = 'const[modalSweep,setModalSweep]=H.useState(item&&item.sweepAngle!=null&&item.sweepAngle>0?item.sweepAngle:360);';
checkAndReplace(targetModalSweepState, replaceModalSweepState, '2. VolumeDialog default modalSweep to 360');

// 3. In VolumeDialog handleSelectPreset: reset modalSweep to 360 when selecting presets
const targetSelectPreset = `    setExpr(p.expr);
    setExpr2(p.expr2);
    setAxis(p.axis);
    setAStr(p.a);
    setBStr(p.b);
    setResult(null);
    setErr("");
  };
  const handleAxisChange=e=>{
    setAxis(e.target.value);
    setSelectedPreset("");
  };`;

const replaceSelectPreset = `    setExpr(p.expr);
    setExpr2(p.expr2);
    setAxis(p.axis);
    setAStr(p.a);
    setBStr(p.b);
    setResult(null);
    setErr("");
    if(!p.axis.startsWith("sec-"))setModalSweep(360);
  };
  const handleAxisChange=e=>{
    setAxis(e.target.value);
    setSelectedPreset("");
    if(!e.target.value.startsWith("sec-"))setModalSweep(360);
  };`;
checkAndReplace(targetSelectPreset, replaceSelectPreset, '3. VolumeDialog reset modalSweep to 360 on preset/axis change');

// 4. In VolumeDialog modal canvas hit testing: fix top tabs and bottom slider
const targetModalCanvas = `  if(py>=10&&py<=42){
    if(px>=10&&px<125){if(isRotatable)setAxis(axis==="sec-oy"?"oy":"ox");return;}
    else if(px>=125&&px<245){setAxis(axis==="oy"||axis==="sec-oy"?"sec-oy":"sec-ox");return;}
  }
  if(py>=205&&py<=265&&px>=30&&px<=440){
    const u=Math.max(0,Math.min(1,(px-65)/(405-65)));
    setModalSweep(Math.round(u*360));
    const onMove=ev=>{
      const nx=ev.clientX-rect.left;
      const nu=Math.max(0,Math.min(1,(nx-65)/(405-65)));
      setModalSweep(Math.round(nu*360));
    };
    const onUp=()=>{
      window.removeEventListener("pointermove",onMove);
      window.removeEventListener("pointerup",onUp);
    };
    window.addEventListener("pointermove",onMove);
    window.addEventListener("pointerup",onUp);
    return;
  }`;

const replaceModalCanvas = `  if(py>=10&&py<=42){
    if(px>=90&&px<185){if(isRotatable)setAxis(axis==="sec-oy"?"oy":"ox");return;}
    else if(px>=185&&px<285){setAxis(axis==="oy"||axis==="sec-oy"?"sec-oy":"sec-ox");return;}
  }
  if(py>=205&&py<=265&&px>=25&&px<=445){
    const u=Math.max(0,Math.min(1,(px-38)/(432-38)));
    setModalSweep(Math.round(u*360));
    const onMove=ev=>{
      const nx=ev.clientX-rect.left;
      const nu=Math.max(0,Math.min(1,(nx-38)/(432-38)));
      setModalSweep(Math.round(nu*360));
    };
    const onUp=()=>{
      window.removeEventListener("pointermove",onMove);
      window.removeEventListener("pointerup",onUp);
    };
    window.addEventListener("pointermove",onMove);
    window.addEventListener("pointerup",onUp);
    return;
  }`;
checkAndReplace(targetModalCanvas, replaceModalCanvas, '4. VolumeDialog canvas tab & slider hit testing');

// 5. In toggleVolAnim: fix animation cache deletion, state synchronization and cancellation
const targetToggleAnim = `function toggleVolAnim(ee, page, item) {
  if (item._playing) {
    stopVolAnim();
    const it = ee.doc.pages[page]?.items.find(x => x.id === item.id);
    if (it) it._playing = false;
    ee.replaceItem(page, { ...item, _playing: false });
    return;
  }
  stopVolAnim();
  const isCross = (item.axis || "").startsWith("sec-");
  const na = typeof item.a === "number" ? item.a : -2;
  const nb = typeof item.b === "number" ? item.b : 2;
  const span = nb - na;

  const targetIt = ee.doc.pages[page]?.items.find(x => x.id === item.id);
  if (!targetIt) return;
  targetIt._playing = true;

  if (isCross) {
    let curX = targetIt.cutPos != null && targetIt.cutPos >= na && targetIt.cutPos < nb ? targetIt.cutPos : na;
    targetIt.cutPos = curX;
    ee.redraw();
    let lastT = performance.now();
    function loop(t) {
      const dt = Math.min(0.08, (t - lastT) / 1000);
      lastT = t;
      curX += dt * (span / 2.6); // travel in 2.6s
      if (curX > nb) curX = na; // loop
      targetIt.cutPos = Math.round(curX * 100) / 100;
      ee.redraw();
      _volAnimId = requestAnimationFrame(loop);
    }
    _volAnimId = requestAnimationFrame(loop);
  } else {
    let sweep = (targetIt.sweepAngle ?? 0) >= 355 ? 0 : (targetIt.sweepAngle ?? 0);
    targetIt.sweepAngle = sweep;
    ee.redraw();
    let lastT = performance.now();
    function loop(t) {
      const dt = Math.min(0.08, (t - lastT) / 1000);
      lastT = t;
      sweep += dt * 140; // 140 deg/s
      if (sweep >= 360) {
        sweep = 0; // Tự động xoay lặp lại liên tục
      }
      targetIt.sweepAngle = Math.round(sweep);
      ee.redraw();
      _volAnimId = requestAnimationFrame(loop);
    }
    _volAnimId = requestAnimationFrame(loop);
  }
}`;

const replaceToggleAnim = `function toggleVolAnim(ee, page, item) {
  const curIt = ee.doc.pages[page]?.items.find(x => x.id === item.id);
  if (!curIt) return;

  if (curIt._playing || item._playing) {
    stopVolAnim();
    curIt._playing = false;
    const _pg = ee.doc.pages[page];
    if (_pg) ee.cache.delete(_pg.id);
    ee.replaceItem(page, { ...curIt, _playing: false });
    return;
  }
  stopVolAnim();
  const isCross = (curIt.axis || "").startsWith("sec-");
  const na = typeof curIt.a === "number" ? curIt.a : -2;
  const nb = typeof curIt.b === "number" ? curIt.b : 2;
  const span = nb - na;

  curIt._playing = true;

  if (isCross) {
    let curX = curIt.cutPos != null && curIt.cutPos >= na && curIt.cutPos < nb ? curIt.cutPos : na;
    curIt.cutPos = curX;
    const _pg = ee.doc.pages[page];
    if (_pg) ee.cache.delete(_pg.id);
    ee.redraw();
    let lastT = performance.now();
    function loop(t) {
      const liveIt = ee.doc.pages[page]?.items.find(x => x.id === item.id);
      if (!liveIt || !liveIt._playing) {
        stopVolAnim();
        return;
      }
      const dt = Math.min(0.08, (t - lastT) / 1000);
      lastT = t;
      curX += dt * (span / 2.6);
      if (curX > nb) curX = na;
      liveIt.cutPos = Math.round(curX * 100) / 100;
      const _p = ee.doc.pages[page];
      if (_p) ee.cache.delete(_p.id);
      ee.redraw();
      _volAnimId = requestAnimationFrame(loop);
    }
    _volAnimId = requestAnimationFrame(loop);
  } else {
    let sweep = (curIt.sweepAngle ?? 0) >= 355 ? 0 : (curIt.sweepAngle ?? 0);
    curIt.sweepAngle = sweep;
    const _pg = ee.doc.pages[page];
    if (_pg) ee.cache.delete(_pg.id);
    ee.redraw();
    let lastT = performance.now();
    function loop(t) {
      const liveIt = ee.doc.pages[page]?.items.find(x => x.id === item.id);
      if (!liveIt || !liveIt._playing) {
        stopVolAnim();
        return;
      }
      const dt = Math.min(0.08, (t - lastT) / 1000);
      lastT = t;
      sweep += dt * 140;
      if (sweep >= 360) {
        sweep = 0;
      }
      liveIt.sweepAngle = Math.round(sweep);
      const _p = ee.doc.pages[page];
      if (_p) ee.cache.delete(_p.id);
      ee.redraw();
      _volAnimId = requestAnimationFrame(loop);
    }
    _volAnimId = requestAnimationFrame(loop);
  }
  const _pg = ee.doc.pages[page];
  if (_pg) ee.cache.delete(_pg.id);
  ee.replaceItem(page, { ...curIt, _playing: true });
}`;
checkAndReplace(targetToggleAnim, replaceToggleAnim, '5. toggleVolAnim cache invalidation & loop fix');

// 6. In Selection Bar toolbar: Quick Angle preset buttons (0°, 90°, 180°, 270°, 360°)
const targetAngleButtons = `        f.jsx("button",{className:sw<=5?"on":"",title:"Góc 0°: Chỉ hiển thị hình phẳng (H) trong Oxy",onClick:()=>{stopVolAnim();ee.replaceItem(_s.page,{...it,sweepAngle:0,_playing:false});},children:"0°"}),
        f.jsx("button",{className:Math.abs(sw-90)<=15?"on":"",title:"Quay 90°: 1/4 khối tròn xoay",onClick:()=>{stopVolAnim();ee.replaceItem(_s.page,{...it,sweepAngle:90,_playing:false});},children:"90°"}),
        f.jsx("button",{className:Math.abs(sw-180)<=15?"on":"",title:"Quay 180°: 1/2 khối tròn xoay (bổ đôi)",onClick:()=>{stopVolAnim();ee.replaceItem(_s.page,{...it,sweepAngle:180,_playing:false});},children:"180°"}),
        f.jsx("button",{className:Math.abs(sw-270)<=15?"on":"",title:"Quay 270°: 3/4 khối tròn xoay",onClick:()=>{stopVolAnim();ee.replaceItem(_s.page,{...it,sweepAngle:270,_playing:false});},children:"270°"}),
        f.jsx("button",{className:sw>=355?"on":"",title:"Quay 360°: Khối tròn xoay trọn vẹn",onClick:()=>{stopVolAnim();ee.replaceItem(_s.page,{...it,sweepAngle:360,_playing:false});},children:"360°"}),`;

const replaceAngleButtons = `        f.jsx("button",{className:sw<=5?"on":"",title:"Góc 0°: Chỉ hiển thị hình phẳng (H) trong Oxy",onClick:()=>{stopVolAnim();const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,sweepAngle:0,_playing:false});},children:"0°"}),
        f.jsx("button",{className:Math.abs(sw-90)<=15?"on":"",title:"Quay 90°: 1/4 khối tròn xoay",onClick:()=>{stopVolAnim();const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,sweepAngle:90,_playing:false});},children:"90°"}),
        f.jsx("button",{className:Math.abs(sw-180)<=15?"on":"",title:"Quay 180°: 1/2 khối tròn xoay (bổ đôi)",onClick:()=>{stopVolAnim();const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,sweepAngle:180,_playing:false});},children:"180°"}),
        f.jsx("button",{className:Math.abs(sw-270)<=15?"on":"",title:"Quay 270°: 3/4 khối tròn xoay",onClick:()=>{stopVolAnim();const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,sweepAngle:270,_playing:false});},children:"270°"}),
        f.jsx("button",{className:sw>=355?"on":"",title:"Quay 360°: Khối tròn xoay trọn vẹn",onClick:()=>{stopVolAnim();const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,sweepAngle:360,_playing:false});},children:"360°"}),`;
checkAndReplace(targetAngleButtons, replaceAngleButtons, '6. Toolbar quick angle buttons cache delete');

// 7. In Selection Bar toolbar: Slider onPointerUp cache deletion
const targetSliderUp = `onPointerUp:e=>{try{e.currentTarget.releasePointerCapture(e.pointerId);}catch{}it._dragging=false;const v=Number(e.target.value);ee.replaceItem(_s.page,{...it,sweepAngle:v,_playing:false});}}`;
const replaceSliderUp = `onPointerUp:e=>{try{e.currentTarget.releasePointerCapture(e.pointerId);}catch{}it._dragging=false;const v=Number(e.target.value);const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,sweepAngle:v,_playing:false});}}`;
checkAndReplace(targetSliderUp, replaceSliderUp, '7. Toolbar slider onPointerUp cache delete');

// 8. In Toolbar: switching to Quay trục tab should default nextSw to 360, NOT 0
const targetNextSw = 'const nextSw=(it.lastSweepAngle!=null&&it.lastSweepAngle<355)?it.lastSweepAngle:((it.sweepAngle==null||it.sweepAngle>=355)?0:it.sweepAngle);';
const replaceNextSw = 'const nextSw=(it.lastSweepAngle!=null&&it.lastSweepAngle>0)?it.lastSweepAngle:360;';
checkAndReplace(targetNextSw, replaceNextSw, '8. Toolbar Quay trục tab default nextSw to 360');

// 9. In selectDown (selected item): switching to Quay trục tab should default sweepAngle to 360, NOT 0
const targetTab1Sel = '_vItem.sweepAngle=(_vItem.lastSweepAngle!=null&&_vItem.lastSweepAngle<355)?_vItem.lastSweepAngle:0;';
const replaceTab1Sel = '_vItem.sweepAngle=(_vItem.lastSweepAngle!=null&&_vItem.lastSweepAngle>0)?_vItem.lastSweepAngle:360;';
checkAndReplace(targetTab1Sel, replaceTab1Sel, '9. Canvas Tab 1 (selected) default sweepAngle to 360');

// 10. In selectDown (unselected item): switching to Quay trục tab should default sweepAngle to 360, NOT 0
const targetTab2Unsel = 'v.sweepAngle=(v.lastSweepAngle!=null&&v.lastSweepAngle<355)?v.lastSweepAngle:0;';
const replaceTab2Unsel = 'v.sweepAngle=(v.lastSweepAngle!=null&&v.lastSweepAngle>0)?v.lastSweepAngle:360;';
checkAndReplace(targetTab2Unsel, replaceTab2Unsel, '10. Canvas Tab 1 (unselected) default sweepAngle to 360');

// 11. In VolumeDialog onSave handler: delete page cache when replacing existing volume
const targetOnSaveReplace = `(ze==null?void 0:ze.k)==="volume"&&f.jsx(VolumeDialog,{item:ze.item,onClose:()=>Je(null),onSave:_=>{ze.item?ee==null||ee.replaceItem(ze.page,_):ee==null||ee.insertItem(_),Je(null)}})`;
const replaceOnSaveReplace = `(ze==null?void 0:ze.k)==="volume"&&f.jsx(VolumeDialog,{item:ze.item,onClose:()=>Je(null),onSave:_=>{if(ze.item){if(ee&&ee.doc&&ee.doc.pages[ze.page])ee.cache.delete(ee.doc.pages[ze.page].id);ee==null||ee.replaceItem(ze.page,_)}else{ee==null||ee.insertItem(_)}Je(null)}})`;
checkAndReplace(targetOnSaveReplace, replaceOnSaveReplace, '11. VolumeDialog onSave page cache delete');

fs.writeFileSync(file, content, 'utf8');
console.log('🎉 ALL INTEGRAL REVOLUTION (PHẦN QUAY) FIXES APPLIED SUCCESSFULLY!');
