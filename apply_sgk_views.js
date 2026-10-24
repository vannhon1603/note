const fs = require('fs');

const jsPath = 'dist/assets/index-D9JME9Hm.js';
let content = fs.readFileSync(jsPath, 'utf8');

// Backup original
if (!fs.existsSync('dist/assets/index-D9JME9Hm.js.bak_sgk')) {
  fs.writeFileSync('dist/assets/index-D9JME9Hm.js.bak_sgk', content);
  console.log('Created backup dist/assets/index-D9JME9Hm.js.bak_sgk');
}

// 1. Selection bar injection: state definitions
const selVarTarget = 'const sw=Math.round(it.sweepAngle??360);';
const selVarRepl = 'const sw=Math.round(it.sweepAngle??360);const vy=it.viewYaw??0.44;const vp=it.viewPitch??0.34;const isSGK=Math.abs(vy-0.44)<0.08&&Math.abs(vp-0.34)<0.08;const isFront=Math.abs(vy)<0.08&&Math.abs(vp)<0.08;const isAxial=curAx==="oy"?(Math.abs(vy)<0.12&&vp>1.35):(Math.abs(vy-1.57)<0.12&&Math.abs(vp)<0.12);const isTop=Math.abs(vy)<0.12&&Math.abs(vp-1.45)<0.12;const isIso=Math.abs(vy-0.785)<0.12&&Math.abs(vp-0.52)<0.12;const setView=(y,p)=>{stopVolAnim();const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,viewYaw:y,viewPitch:p,_playing:false});};';

if (!content.includes(selVarTarget)) {
  console.error('Target 1 not found');
  process.exit(1);
}
content = content.replace(selVarTarget, selVarRepl);
console.log('Target 1 replaced');

// 2. Selection bar injection: buttons
const btnTarget = 'f.jsx("button",{title:"Xoay góc nhìn 3D sang trái",onClick:()=>ee.replaceItem(_s.page,{...it,viewYaw:(it.viewYaw??0.44)-0.25}),children:"⟲ 3D"}),f.jsx("button",{title:"Xoay góc nhìn 3D sang phải",onClick:()=>ee.replaceItem(_s.page,{...it,viewYaw:(it.viewYaw??0.44)+0.25}),children:"⟳ 3D"}),f.jsx("button",{title:"Xoay góc nhìn 3D lên",onClick:()=>ee.replaceItem(_s.page,{...it,viewPitch:Math.max(-0.6,(it.viewPitch??0.34)-0.15)}),children:"▲"}),f.jsx("button",{title:"Xoay góc nhìn 3D xuống",onClick:()=>ee.replaceItem(_s.page,{...it,viewPitch:Math.min(1.2,(it.viewPitch??0.34)+0.15)}),children:"▼"}),f.jsx("span",{className:"turn-sep"})';

const btnRepl = 'f.jsx("span",{className:"turn-label",title:"Các góc nhìn không gian phối cảnh chuẩn SGK Toán 12",children:"Góc nhìn SGK:"}),f.jsx("button",{className:isSGK?"on":"",title:"Góc nhìn 3D phối cảnh chuẩn SGK Toán 12 (mặc định)",onClick:()=>setView(0.44,0.34),children:"Chuẩn SGK"}),f.jsx("button",{className:isFront?"on":"",title:"Góc nhìn phẳng chính diện Oxy (chiếu đứng / hình phẳng H)",onClick:()=>setView(0,0),children:"Mặt Oxy"}),f.jsx("button",{className:isAxial?"on":"",title:curAx==="oy"?"Góc nhìn dọc trục tung Oy":"Góc nhìn dọc trục hoành Ox (nhìn trực diện thiết diện/lát cắt)",onClick:()=>setView(curAx==="oy"?0:1.5708,curAx==="oy"?1.45:0),children:curAx==="oy"?"Dọc trục Oy":"Dọc trục Ox"}),f.jsx("button",{className:isTop?"on":"",title:"Góc nhìn từ trên xuống (mặt phẳng Oxz / hình chiếu bằng)",onClick:()=>setView(0,1.45),children:"Từ trên (Oxz)"}),f.jsx("button",{className:isIso?"on":"",title:"Góc nhìn nghiêng 45° không gian trục đo",onClick:()=>setView(0.785,0.52),children:"Nghiêng 45°"}),f.jsx("button",{title:"Xoay góc nhìn 3D sang trái 15°",onClick:()=>{const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,viewYaw:(it.viewYaw??0.44)-0.26});},children:"⟲"}),f.jsx("button",{title:"Xoay góc nhìn 3D sang phải 15°",onClick:()=>{const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,viewYaw:(it.viewYaw??0.44)+0.26});},children:"⟳"}),f.jsx("button",{title:"Nâng góc nhìn lên 10°",onClick:()=>{const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,viewPitch:Math.max(-0.6,(it.viewPitch??0.34)-0.15)});},children:"▲"}),f.jsx("button",{title:"Hạ góc nhìn xuống 10°",onClick:()=>{const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,viewPitch:Math.min(1.4,(it.viewPitch??0.34)+0.15)});},children:"▼"}),f.jsx("span",{className:"turn-sep"})';

if (!content.includes(btnTarget)) {
  console.error('Target 2 not found');
  process.exit(1);
}
content = content.replace(btnTarget, btnRepl);
console.log('Target 2 replaced');

// 3. drawVolume3D hintText
const hintTarget = 'const hintText=isCross?"🔄 Kéo xoay 3D • ↔ Trượt mặt cắt":"🔄 Kéo chuột xoay quanh trục hoặc xoay 3D";';
const hintRepl = 'const _vy=yaw,_vp=pitch;let _vName="";if(Math.abs(_vy-0.44)<0.08&&Math.abs(_vp-0.34)<0.08)_vName="📐 Chuẩn SGK (3D)";else if(Math.abs(_vy)<0.08&&Math.abs(_vp)<0.08)_vName="◫ Chính diện Oxy (2D)";else if(axis==="oy"?(Math.abs(_vy)<0.12&&_vp>1.35):(Math.abs(_vy-1.57)<0.12&&Math.abs(_vp)<0.12))_vName=axis==="oy"?"◎ Dọc trục Oy":"◎ Dọc trục Ox";else if(Math.abs(_vy)<0.12&&Math.abs(_vp-1.45)<0.12)_vName="⬒ Từ trên (Oxz)";else if(Math.abs(_vy-0.785)<0.12&&Math.abs(_vp-0.52)<0.12)_vName="◇ Nghiêng 45°";else _vName="🔄 Xoay tự do ("+Math.round(((yaw%(2*Math.PI))+2*Math.PI)%(2*Math.PI)*180/Math.PI)+"°)";const hintText=_vName+" • "+(isCross?"↔ Trượt mặt cắt":"Kéo xoay 3D");';

if (!content.includes(hintTarget)) {
  console.error('Target 3 not found');
  process.exit(1);
}
content = content.replace(hintTarget, hintRepl);
console.log('Target 3 replaced');

// 4. onPointerDown click on badge to cycle viewpoints
const orbitTarget = 'const _ep=this.pointerSeen??{sx:i.x,sy:i.y};this.capture(this.fingerId??1);this.drag={k:"volOrbit",page:t,id:_vItem.id,rawSX:_ep.sx,rawSY:_ep.sy,startYaw:_vItem.viewYaw??0.44,startPitch:_vItem.viewPitch??0.34};return;';
const orbitRepl = 'const _bW=240,_bX=_vItem.x+_vItem.w-_bW-10,_bY=_vItem.y+10;if(i.x>=_bX&&i.x<=_bX+_bW&&i.y>=_bY&&i.y<=_bY+28){const _cy=_vItem.viewYaw??0.44,_cp=_vItem.viewPitch??0.34;let _ny=0.44,_np=0.34;if(Math.abs(_cy-0.44)<0.08&&Math.abs(_cp-0.34)<0.08){_ny=0;_np=0;}else if(Math.abs(_cy)<0.08&&Math.abs(_cp)<0.08){_ny=_vItem.axis==="oy"?0:1.5708;_np=_vItem.axis==="oy"?1.45:0;}else if(_vItem.axis==="oy"?(Math.abs(_cy)<0.12&&_cp>1.35):(Math.abs(_cy-1.57)<0.12&&Math.abs(_cp)<0.12)){_ny=0;_np=1.45;}else if(Math.abs(_cy)<0.12&&Math.abs(_cp-1.45)<0.12){_ny=0.785;_np=0.52;}else{_ny=0.44;_np=0.34;}_vItem.viewYaw=_ny;_vItem.viewPitch=_np;if(this.doc.pages[t])this.cache.delete(this.doc.pages[t].id);this.replaceItem(t,{..._vItem,viewYaw:_ny,viewPitch:_np});this.redraw();return;}const _ep=this.pointerSeen??{sx:i.x,sy:i.y};this.capture(this.fingerId??1);this.drag={k:"volOrbit",page:t,id:_vItem.id,rawSX:_ep.sx,rawSY:_ep.sy,startYaw:_vItem.viewYaw??0.44,startPitch:_vItem.viewPitch??0.34};return;';

if (!content.includes(orbitTarget)) {
  console.error('Target 4 not found');
  process.exit(1);
}
content = content.replace(orbitTarget, orbitRepl);
console.log('Target 4 replaced');

fs.writeFileSync(jsPath, content, 'utf8');
console.log('Successfully updated dist/assets/index-D9JME9Hm.js');
