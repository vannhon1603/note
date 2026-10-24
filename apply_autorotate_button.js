const fs = require('fs');

const file = 'dist/assets/index-D9JME9Hm.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Add _autoRotateId, stopAutoRotate, toggleAutoRotate, and make sweep loop in toggleVolAnim
const oldAnimTarget = `let _volAnimId = null;
function stopVolAnim() {
  if (_volAnimId) {
    cancelAnimationFrame(_volAnimId);
    _volAnimId = null;
  }
}
function toggleVolAnim(ee, page, item) {
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
        sweep = 360;
        targetIt.sweepAngle = 360;
        targetIt._playing = false;
        ee.replaceItem(page, { ...targetIt, _playing: false, sweepAngle: 360 });
        _volAnimId = null;
        ee.redraw();
        return;
      }
      targetIt.sweepAngle = Math.round(sweep);
      ee.redraw();
      _volAnimId = requestAnimationFrame(loop);
    }
    _volAnimId = requestAnimationFrame(loop);
  }
}`;

const newAnimTarget = `let _volAnimId = null;
function stopVolAnim() {
  if (_volAnimId) {
    cancelAnimationFrame(_volAnimId);
    _volAnimId = null;
  }
}
let _autoRotateId = null;
function stopAutoRotate() {
  if (_autoRotateId) {
    cancelAnimationFrame(_autoRotateId);
    _autoRotateId = null;
  }
}
function toggleAutoRotate(ee, page, item) {
  if (item._autoRotate) {
    stopAutoRotate();
    const it = ee.doc.pages[page]?.items.find(x => x.id === item.id);
    if (it) it._autoRotate = false;
    ee.replaceItem(page, { ...item, _autoRotate: false });
    return;
  }
  stopAutoRotate();
  const targetIt = ee.doc.pages[page]?.items.find(x => x.id === item.id);
  if (!targetIt) return;
  targetIt._autoRotate = true;

  let yaw = targetIt.viewYaw ?? 0.44;
  let lastT = performance.now();
  function loop(t) {
    const curIt = ee.doc.pages[page]?.items.find(x => x.id === targetIt.id);
    if (!curIt || !curIt._autoRotate) {
      stopAutoRotate();
      return;
    }
    const dt = Math.min(0.08, (t - lastT) / 1000);
    lastT = t;
    yaw = (yaw + dt * 0.55) % (Math.PI * 2);
    targetIt.viewYaw = Math.round(yaw * 1000) / 1000;
    const _pg = ee.doc.pages[page];
    if (_pg) ee.cache.delete(_pg.id);
    ee.redraw();
    _autoRotateId = requestAnimationFrame(loop);
  }
  _autoRotateId = requestAnimationFrame(loop);
  ee.replaceItem(page, { ...item, _autoRotate: true });
}
function toggleVolAnim(ee, page, item) {
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

if (!content.includes(oldAnimTarget)) {
  console.error('[ERROR] oldAnimTarget not found!');
  process.exit(1);
}
content = content.replace(oldAnimTarget, newAnimTarget);
console.log('[OK] 1. toggleAutoRotate and auto-looping animation added successfully!');

// 2. Add stopAutoRotate in setView and setAxis
const oldSetView = `  const setView=(y,p)=>{
    stopVolAnim();
    const _pg=ee.doc.pages[_s.page];
    if(_pg)ee.cache.delete(_pg.id);
    ee.replaceItem(_s.page,{...it,viewYaw:y,viewPitch:p,_playing:false});
  };`;

const newSetView = `  const setView=(y,p)=>{
    stopAutoRotate();
    stopVolAnim();
    const _pg=ee.doc.pages[_s.page];
    if(_pg)ee.cache.delete(_pg.id);
    ee.replaceItem(_s.page,{...it,viewYaw:y,viewPitch:p,_playing:false,_autoRotate:false});
  };`;

if (!content.includes(oldSetView)) {
  console.error('[ERROR] oldSetView not found!');
  process.exit(1);
}
content = content.replace(oldSetView, newSetView);
console.log('[OK] 2. setView updated with stopAutoRotate!');

// 3. Add autoRotate button in the Góc nhìn group
const oldDpad = `      f.jsxs("span",{className:"vol-dpad",children:[
        f.jsx("button",{title:"Xoay góc nhìn 3D sang trái 15°",onClick:()=>{const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,viewYaw:(it.viewYaw??0.44)-0.26});},children:"⟲"}),
        f.jsx("button",{title:"Xoay góc nhìn 3D sang phải 15°",onClick:()=>{const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,viewYaw:(it.viewYaw??0.44)+0.26});},children:"⟳"}),
        f.jsx("button",{title:"Nâng góc nhìn lên 10°",onClick:()=>{const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,viewPitch:Math.max(-0.6,(it.viewPitch??0.34)-0.15)});},children:"▲"}),
        f.jsx("button",{title:"Hạ góc nhìn xuống 10°",onClick:()=>{const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,viewPitch:Math.min(1.4,(it.viewPitch??0.34)+0.15)});},children:"▼"})
      ]})
    ]}),`;

const newDpad = `      f.jsxs("span",{className:"vol-dpad",children:[
        f.jsx("button",{title:"Xoay góc nhìn 3D sang trái 15°",onClick:()=>{stopAutoRotate();const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,viewYaw:(it.viewYaw??0.44)-0.26,_autoRotate:false});},children:"⟲"}),
        f.jsx("button",{title:"Xoay góc nhìn 3D sang phải 15°",onClick:()=>{stopAutoRotate();const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,viewYaw:(it.viewYaw??0.44)+0.26,_autoRotate:false});},children:"⟳"}),
        f.jsx("button",{title:"Nâng góc nhìn lên 10°",onClick:()=>{stopAutoRotate();const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,viewPitch:Math.max(-0.6,(it.viewPitch??0.34)-0.15),_autoRotate:false});},children:"▲"}),
        f.jsx("button",{title:"Hạ góc nhìn xuống 10°",onClick:()=>{stopAutoRotate();const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,viewPitch:Math.min(1.4,(it.viewPitch??0.34)+0.15),_autoRotate:false});},children:"▼"})
      ]}),
      f.jsx("button",{
        className:it._autoRotate?"on":"",
        style:{marginLeft:"4px",display:"inline-flex",alignItems:"center",gap:"3px",fontWeight:"600"},
        title:"Tự động xoay góc nhìn 3D không gian 360° (Bật / Tắt)",
        onClick:()=>toggleAutoRotate(ee,_s.page,it),
        children:it._autoRotate?"⏸ Dừng xoay":"🔄 Tự xoay"
      })
    ]}),`;

if (!content.includes(oldDpad)) {
  console.error('[ERROR] oldDpad not found!');
  process.exit(1);
}
content = content.replace(oldDpad, newDpad);
console.log('[OK] 3. Auto-rotate button added to Góc nhìn toolbar group!');

fs.writeFileSync(file, content, 'utf8');
console.log('[SUCCESS] All patches applied to dist/assets/index-D9JME9Hm.js!');
