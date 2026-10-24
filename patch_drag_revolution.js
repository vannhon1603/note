const fs = require('fs');

const path = 'dist/assets/index-D9JME9Hm.js';
let js = fs.readFileSync(path, 'utf8');

console.log('Original js length:', js.length);

// ─── 1. Patch move(t) to handle volSweep ───────────────────────────
const oldMoveTarget = 'case"volCut":{';
const newMoveChunk = `case"volSweep":{
    const p=this.toPage(o,s.page);
    const dx=p.x-s.fromX;
    const it=this.doc.pages[s.page].items.find(x=>x.id===s.id);
    if(!it)return;
    const newSweep=Math.max(0,Math.min(360,s.startSweep+(dx/(s.w*0.58))*360));
    it.sweepAngle=Math.round(newSweep);
    this.redraw();
    return;
  }
  case"volCut":{`;

if (js.indexOf('case"volSweep":{') === -1) {
  if (js.indexOf(oldMoveTarget) !== -1) {
    js = js.replace(oldMoveTarget, newMoveChunk);
    console.log('✓ Added case "volSweep" in move(t)');
  } else {
    console.error('oldMoveTarget not found');
    process.exit(1);
  }
} else {
  console.log('case "volSweep" already present in move(t)');
}

// ─── 2. Patch up(t) to commit volSweep ─────────────────────────────
const oldUpTarget = 'case"volCut":case"volOrbit":{';
const newUpTarget = 'case"volCut":case"volOrbit":case"volSweep":{';

if (js.indexOf(oldUpTarget) !== -1) {
  js = js.replace(oldUpTarget, newUpTarget);
  console.log('✓ Updated up(t) to handle volSweep');
} else if (js.indexOf(newUpTarget) !== -1) {
  console.log('up(t) already handles volSweep');
} else {
  console.warn('up target not found');
}

// ─── 3. Patch selectDown inside selection box ──────────────────────
const oldSelInsideTarget = 'if(_isCross&&(_nearBottom||_nearHandle)){this.capture(this.fingerId??1);this.drag={k:"volCut",page:t,id:_vItem.id,fromX:i.x,startCut:_cutX,a:_vItem.a??-2,b:_vItem.b??2,w:_vItem.w};return;}';
const newSelInsideChunk = `if(_isCross){
          if(_nearBottom||_nearHandle){
            this.capture(this.fingerId??1);
            this.drag={k:"volCut",page:t,id:_vItem.id,fromX:i.x,startCut:_cutX,a:_vItem.a??-2,b:_vItem.b??2,w:_vItem.w};
            return;
          }
        }else{
          const _nearRotHandle=_vItem._rotHandle&&Math.hypot((i.x-_vItem.x)-_vItem._rotHandle.x,(i.y-_vItem.y)-_vItem._rotHandle.y)<=42;
          if(_nearBottom||_nearRotHandle){
            this.capture(this.fingerId??1);
            this.drag={k:"volSweep",page:t,id:_vItem.id,fromX:i.x,startSweep:_vItem.sweepAngle!=null?_vItem.sweepAngle:360,w:_vItem.w};
            return;
          }
        }`;

if (js.indexOf(oldSelInsideTarget) !== -1) {
  js = js.replace(oldSelInsideTarget, newSelInsideChunk);
  console.log('✓ Added revolution drag interaction to selectDown (selected)');
} else {
  console.log('Checking alternative for selInsideTarget');
}

// ─── 4. Patch selectDown for unselected volume (first click) ───────
const oldUnselTarget = 'if(_isCross&&(_nearBottom||_nearHandle)){this.capture(this.fingerId??1);this.drag={k:"volCut",page:t,id:v.id,fromX:i.x,startCut:_cutX,a:v.a??-2,b:v.b??2,w:v.w};}else{';
const newUnselChunk = `if(_isCross){
          if(_nearBottom||_nearHandle){
            this.capture(this.fingerId??1);
            this.drag={k:"volCut",page:t,id:v.id,fromX:i.x,startCut:_cutX,a:v.a??-2,b:v.b??2,w:v.w};
          }else{
            const _ep=this.pointerSeen??{sx:i.x,sy:i.y};
            this.capture(this.fingerId??1);
            this.drag={k:"volOrbit",page:t,id:v.id,rawSX:_ep.sx,rawSY:_ep.sy,startYaw:v.viewYaw??0.44,startPitch:v.viewPitch??0.34};
          }
        }else{
          const _nearRotHandle=v._rotHandle&&Math.hypot((i.x-v.x)-v._rotHandle.x,(i.y-v.y)-v._rotHandle.y)<=42;
          if(_nearBottom||_nearRotHandle){
            this.capture(this.fingerId??1);
            this.drag={k:"volSweep",page:t,id:v.id,fromX:i.x,startSweep:v.sweepAngle!=null?v.sweepAngle:360,w:v.w};
          }else{
            const _ep=this.pointerSeen??{sx:i.x,sy:i.y};
            this.capture(this.fingerId??1);
            this.drag={k:"volOrbit",page:t,id:v.id,rawSX:_ep.sx,rawSY:_ep.sy,startYaw:v.viewYaw??0.44,startPitch:v.viewPitch??0.34};
          }
        }`;

if (js.indexOf(oldUnselTarget) !== -1) {
  // Replace the else branch as well
  const oldFullUnsel = oldUnselTarget + 'const _ep=this.pointerSeen??{sx:i.x,sy:i.y};this.capture(this.fingerId??1);this.drag={k:"volOrbit",page:t,id:v.id,rawSX:_ep.sx,rawSY:_ep.sy,startYaw:v.viewYaw??0.44,startPitch:v.viewPitch??0.34};}';
  if (js.indexOf(oldFullUnsel) !== -1) {
    js = js.replace(oldFullUnsel, newUnselChunk);
    console.log('✓ Added revolution drag interaction to selectDown (unselected first-click)');
  }
}

// ─── 5. Update drawVolume3D for revolution 3D handle & bottom slider ─
// 5a. When drawing caps for revolutions: store _rotHandle and draw rotating face badge
const oldCapLoop = 'if (sweepDeg < 359) {\n      for (const thCap of [0, sweepRad]) {';
const newCapLoop = `if (sweepDeg < 359) {
      for (const thCap of [0, sweepRad]) {`;

// Let's check where the cap loop is in drawVolume3D
const capIdx = js.indexOf('if (sweepDeg < 359) {');
console.log('Cap loop at', capIdx);

// Store _rotHandle at thCap = sweepRad
const oldCapFacesPush = 'faces.push({\n          z: capZ / ptsCap.length,\n          pts: ptsCap,\n          fill: thCap === 0 ? "rgba(59, 130, 246, 0.55)" : "rgba(245, 158, 11, 0.65)",\n          stroke: thCap === 0 ? "#1d4ed8" : "#d97706",\n          strokeWidth: 1.5,\n          type: "cap"\n        });';
const newCapFacesPush = `faces.push({
          z: capZ / ptsCap.length,
          pts: ptsCap,
          fill: thCap === 0 ? "rgba(59, 130, 246, 0.45)" : "rgba(245, 158, 11, 0.72)",
          stroke: thCap === 0 ? "#1d4ed8" : "#d97706",
          strokeWidth: 1.8,
          type: "cap"
        });
        if (thCap > 0 && ptsCap.length > 0) {
          const midPt = ptsCap[Math.floor(ptsCap.length / 4)] || ptsCap[0];
          item._rotHandle = { x: midPt.sx - x, y: midPt.sy - y };
        }`;

if (js.indexOf(oldCapFacesPush) !== -1) {
  js = js.replace(oldCapFacesPush, newCapFacesPush);
  console.log('✓ Updated cap faces and stored _rotHandle');
} else {
  console.log('oldCapFacesPush exact string not found, searching alternative...');
  const fIdx = js.indexOf('type: "cap"\n        });');
  if (fIdx !== -1) {
    console.log('Found cap push nearby:', js.slice(fIdx - 200, fIdx + 50));
  }
}

// 5b. Update the bottom slider in drawVolume3D to support BOTH isCross and isRev!
const oldSliderStart = 'if(isCross){const tVolW = (item.volume != null && isFinite(item.volume)) ? 175 : 40;';
const oldSliderEnd = 'ctx.fillText("↔ Kéo trượt mặt cắt x = "+(Math.round(activeCutX*100)/100),(tX0+tX1)/2,tY-9);}';
const oldSliderIdx = js.indexOf(oldSliderStart);
const oldSliderEndIdx = js.indexOf(oldSliderEnd, oldSliderIdx);

if (oldSliderIdx !== -1 && oldSliderEndIdx !== -1) {
  const oldSliderChunk = js.slice(oldSliderIdx, oldSliderEndIdx + oldSliderEnd.length);
  const newSliderChunk = `if(isCross){
    const tVolW = (item.volume != null && isFinite(item.volume)) ? 175 : 40;
    const tY=y+h-18,tX0=x+40,tX1=x+w-tVolW-15,tW=Math.max(60, tX1-tX0);
    const knobX=tX0+((activeCutX-na)/(nb-na))*tW;
    ctx.strokeStyle="rgba(203,213,225,0.8)";ctx.lineWidth=4;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(tX0,tY);ctx.lineTo(tX1,tY);ctx.stroke();
    ctx.strokeStyle="#d97706";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(tX0,tY);ctx.lineTo(knobX,tY);ctx.stroke();
    ctx.fillStyle="#ffffff";ctx.beginPath();ctx.arc(knobX,tY,8,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#d97706";ctx.lineWidth=2.5;ctx.stroke();
    ctx.fillStyle="#d97706";ctx.beginPath();ctx.arc(knobX,tY,3.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#64748b";ctx.font="bold 10px system-ui";ctx.textAlign="right";ctx.fillText("a="+na,tX0-6,tY+3);
    ctx.textAlign="left";ctx.fillText("b="+nb,tX1+6,tY+3);
    ctx.textAlign="center";ctx.fillStyle="#b45309";ctx.fillText("↔ Kéo trượt mặt cắt x = "+(Math.round(activeCutX*100)/100),(tX0+tX1)/2,tY-9);
  } else {
    // ══════ Interactive Revolution Angle Slider ══════
    const tVolW = (item.volume != null && isFinite(item.volume)) ? 175 : 40;
    const tY=y+h-18,tX0=x+40,tX1=x+w-tVolW-15,tW=Math.max(60, tX1-tX0);
    const frac=sweepDeg/360;
    const knobX=tX0+frac*tW;
    const trCol=isRevOx?"#2563eb":"#059669";
    ctx.strokeStyle="rgba(203,213,225,0.8)";ctx.lineWidth=4;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(tX0,tY);ctx.lineTo(tX1,tY);ctx.stroke();
    ctx.strokeStyle=trCol;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(tX0,tY);ctx.lineTo(knobX,tY);ctx.stroke();
    ctx.fillStyle="#ffffff";ctx.beginPath();ctx.arc(knobX,tY,8,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=trCol;ctx.lineWidth=2.5;ctx.stroke();
    ctx.fillStyle=trCol;ctx.beginPath();ctx.arc(knobX,tY,3.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#64748b";ctx.font="bold 10px system-ui";ctx.textAlign="right";ctx.fillText("0°",tX0-6,tY+3);
    ctx.textAlign="left";ctx.fillText("360°",tX1+6,tY+3);
    const fracText=sweepDeg>=355?"Trọn vẹn 1 vòng":sweepDeg===180?"1/2 khối":sweepDeg===90?"1/4 khối":sweepDeg===270?"3/4 khối":Math.round(frac*100)+"%";
    const axName=isRevOx?"Ox":"Oy";
    ctx.textAlign="center";ctx.fillStyle=trCol;ctx.font="bold 10px system-ui";
    ctx.fillText("🔄 Kéo xoay quanh "+axName+": θ = "+Math.round(sweepDeg)+"° ("+fracText+")",(tX0+tX1)/2,tY-9);

    // Draw visual handle on rotating 3D rim if available
    if(item._rotHandle && sweepDeg < 355){
      const hX = x + item._rotHandle.x, hY = y + item._rotHandle.y;
      ctx.beginPath();ctx.arc(hX,hY,11,0,Math.PI*2);ctx.fillStyle=isRevOx?"rgba(37,99,235,0.2)":"rgba(5,150,105,0.2)";ctx.fill();
      ctx.beginPath();ctx.arc(hX,hY,7.5,0,Math.PI*2);ctx.fillStyle="#ffffff";ctx.fill();
      ctx.strokeStyle=trCol;ctx.lineWidth=2.2;ctx.stroke();
      ctx.beginPath();ctx.arc(hX,hY,3,0,Math.PI*2);ctx.fillStyle=trCol;ctx.fill();
      ctx.fillStyle=trCol;ctx.font="bold 10px system-ui";ctx.textAlign="center";
      ctx.fillText("↺ "+Math.round(sweepDeg)+"°",hX,hY-11);
    }
  }`;

  js = js.replace(oldSliderChunk, newSliderChunk);
  console.log('✓ Added revolution slider and 3D rotation handle to drawVolume3D');
} else {
  console.error('oldSliderChunk not found');
}

// 5c. Update Volume Display Badge when sweepDeg < 360
const oldVolDisplay = 'const volDisplay = "V ≈ " + fmtVolume(item.volume);';
const newVolDisplay = `const effVol = (sweepDeg < 355 && isRev) ? (sweepDeg / 360) * item.volume : item.volume;
    const volDisplay = (sweepDeg < 355 && isRev) ? ("V(" + Math.round(sweepDeg) + "°) ≈ " + fmtVolume(effVol)) : ("V ≈ " + fmtVolume(item.volume));`;

if (js.indexOf(oldVolDisplay) !== -1) {
  js = js.replace(oldVolDisplay, newVolDisplay);
  console.log('✓ Updated volume display to show partial volume during sweep');
}

// 5d. Update top hint badge text
const oldHintText = 'const hintText=isCross?"🔄 Kéo xoay 3D • ↔ Trượt mặt cắt":"🔄 Kéo xoay 3D";';
const newHintText = 'const hintText=isCross?"🔄 Kéo xoay 3D • ↔ Trượt mặt cắt":"🔄 Kéo chuột xoay quanh trục hoặc xoay 3D";';
if (js.indexOf(oldHintText) !== -1) {
  js = js.replace(oldHintText, newHintText);
  console.log('✓ Updated hint text for revolution');
}

// ─── 6. Update Selection Bar with Quick Angle Preset Buttons ────────
const oldSwSlider = 'f.jsxs("label",{style:{display:"inline-flex",alignItems:"center",gap:"5px",fontSize:"12px",padding:"0 4px",cursor:"pointer"},children:[f.jsx("span",{children:"Góc:"}),f.jsx("b",{style:{minWidth:"32px",textAlign:"right"},children:sw+"°"}),f.jsx("input",{type:"range",min:10,max:360,step:5,value:sw,style:{width:"75px"},onChange:e=>{stopVolAnim();ee.replaceItem(_s.page,{...it,sweepAngle:Number(e.target.value),_playing:false})}})]})';

const newSwPresetsAndSlider = `f.jsxs(f.Fragment,{children:[
  f.jsx("button",{className:sw<=15?"on":"",title:"Góc 0°: Chỉ hiển thị hình phẳng (H) trong Oxy",onClick:()=>{stopVolAnim();ee.replaceItem(_s.page,{...it,sweepAngle:10,_playing:false});},children:"0°"}),
  f.jsx("button",{className:Math.abs(sw-90)<=15?"on":"",title:"Quay 90°: 1/4 khối tròn xoay",onClick:()=>{stopVolAnim();ee.replaceItem(_s.page,{...it,sweepAngle:90,_playing:false});},children:"90°"}),
  f.jsx("button",{className:Math.abs(sw-180)<=15?"on":"",title:"Quay 180°: 1/2 khối tròn xoay (bổ đôi)",onClick:()=>{stopVolAnim();ee.replaceItem(_s.page,{...it,sweepAngle:180,_playing:false});},children:"180°"}),
  f.jsx("button",{className:Math.abs(sw-270)<=15?"on":"",title:"Quay 270°: 3/4 khối tròn xoay",onClick:()=>{stopVolAnim();ee.replaceItem(_s.page,{...it,sweepAngle:270,_playing:false});},children:"270°"}),
  f.jsx("button",{className:sw>=355?"on":"",title:"Quay 360°: Khối tròn xoay trọn vẹn",onClick:()=>{stopVolAnim();ee.replaceItem(_s.page,{...it,sweepAngle:360,_playing:false});},children:"360°"}),
  f.jsxs("label",{style:{display:"inline-flex",alignItems:"center",gap:"4px",fontSize:"12px",padding:"0 2px",cursor:"pointer"},children:[
    f.jsx("b",{style:{minWidth:"28px",textAlign:"right"},children:sw+"°"}),
    f.jsx("input",{type:"range",min:10,max:360,step:5,value:sw,style:{width:"70px"},onChange:e=>{stopVolAnim();ee.replaceItem(_s.page,{...it,sweepAngle:Number(e.target.value),_playing:false})}})
  ]})
]})`;

if (js.indexOf(oldSwSlider) !== -1) {
  js = js.replace(oldSwSlider, newSwPresetsAndSlider);
  console.log('✓ Added quick angle buttons (0°, 90°, 180°, 270°, 360°) and slider to selection bar');
}

fs.writeFileSync(path, js, 'utf8');
console.log('🎉 Successfully applied Drag-to-Revolve around Ox and Oy!');
