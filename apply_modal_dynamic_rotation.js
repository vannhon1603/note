const fs = require('fs');

const file = 'dist/assets/index-D9JME9Hm.js';
let content = fs.readFileSync(file, 'utf8');

// Target 1: Add modalSweep, modalYaw, modalPitch state to VolumeDialog
const targetState = `  const[aStr,setAStr]=H.useState(item&&item.type==="volume"?String(item.a!=-null?item.a:"-2"):"-2");
  const[bStr,setBStr]=H.useState(item&&item.type==="volume"?String(item.b!=null?item.b:"2"):"2");
  const[nSlices,setNSlices]=H.useState(item&&item.type==="volume"?(item.nSlices||30):30);`;

const replaceState = `  const[aStr,setAStr]=H.useState(item&&item.type==="volume"?String(item.a!=-null?item.a:"-2"):"-2");
  const[bStr,setBStr]=H.useState(item&&item.type==="volume"?String(item.b!=null?item.b:"2"):"2");
  const[nSlices,setNSlices]=H.useState(item&&item.type==="volume"?(item.nSlices||30):30);
  const[modalSweep,setModalSweep]=H.useState(item&&item.sweepAngle!=null?item.sweepAngle:0);
  const[modalYaw,setModalYaw]=H.useState(item&&item.viewYaw!=null?item.viewYaw:0.44);
  const[modalPitch,setModalPitch]=H.useState(item&&item.viewPitch!=null?item.viewPitch:0.34);`;

// Target 2: Pass sweepAngle, viewYaw, viewPitch in useEffect drawVolume3D
const targetDraw = `    const{av,bv}=getAB();
    drawVolume3D(ctx,{x:0,y:0,w:W,h:Hc,expr,expr2,a:av,b:bv,axis,nSlices,strokeScale:(item&&item.strokeScale!=null)?item.strokeScale:0.6},true);
  });`;

const replaceDraw = `    const{av,bv}=getAB();
    drawVolume3D(ctx,{x:0,y:0,w:W,h:Hc,expr,expr2,a:av,b:bv,axis,nSlices,sweepAngle:modalSweep,viewYaw:modalYaw,viewPitch:modalPitch,strokeScale:(item&&item.strokeScale!=null)?item.strokeScale:0.6},true);
  },[expr,expr2,axis,aStr,bStr,nSlices,modalSweep,modalYaw,modalPitch]);`;

// Target 3: In handleSave, pass modalSweep, modalYaw, modalPitch
const targetSave = `presetIndex:selectedPreset,sweepAngle:(item&&item.sweepAngle!=null)?item.sweepAngle:0,viewYaw:(item&&item.viewYaw!=null)?item.viewYaw:0.42,viewPitch:(item&&item.viewPitch!=null)?item.viewPitch:0.32,showSlice:item?!!item.showSlice:false,`;

const replaceSave = `presetIndex:selectedPreset,sweepAngle:modalSweep,viewYaw:modalYaw,viewPitch:modalPitch,showSlice:item?!!item.showSlice:false,`;

// Target 4: Canvas interactive mouse dragging (slider & 3D orbit)
const targetCanvas = `f.jsx("canvas",{ref:canvasRef,onPointerDown:e=>{const rect=e.currentTarget.getBoundingClientRect();const px=e.clientX-rect.left;const py=e.clientY-rect.top;if(py>=12&&py<=38){if(px>=12&&px<125){if(isRotatable)setAxis(axis==="sec-oy"?"oy":"ox");}else if(px>=125&&px<245){setAxis(axis==="oy"||axis==="sec-oy"?"sec-oy":"sec-ox");}}},style:{cursor:isRotatable?"pointer":"default",border:"1.5px solid #cbd5e1",borderRadius:"12px",boxShadow:"0 4px 16px rgba(0,0,0,0.08)",background:"#f0f4ff",display:"block",width:"470px",height:"270px",maxWidth:"100%"}}),`;

const replaceCanvas = `f.jsx("canvas",{ref:canvasRef,onPointerDown:e=>{
  const rect=e.currentTarget.getBoundingClientRect();
  const px=e.clientX-rect.left;
  const py=e.clientY-rect.top;
  if(py>=10&&py<=42){
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
  }
  let lastX=e.clientX,lastY=e.clientY;
  const onMove=ev=>{
    const dx=ev.clientX-lastX,dy=ev.clientY-lastY;
    lastX=ev.clientX;lastY=ev.clientY;
    setModalYaw(y=>y+dx*0.014);
    setModalPitch(p=>Math.max(-1.4,Math.min(1.4,p+dy*0.014)));
  };
  const onUp=()=>{
    window.removeEventListener("pointermove",onMove);
    window.removeEventListener("pointerup",onUp);
  };
  window.addEventListener("pointermove",onMove);
  window.addEventListener("pointerup",onUp);
},style:{cursor:"grab",border:"1.5px solid #cbd5e1",borderRadius:"12px",boxShadow:"0 4px 16px rgba(0,0,0,0.08)",background:"#f0f4ff",display:"block",width:"470px",height:"270px",maxWidth:"100%"}}),`;

// Target 5: Make "Xoay 360°" clickable badge/text
const targetXoay360 = `f.jsx("span",{style:{fontWeight:"600",color:"#3b82f6"},children:"Xoay 360°"})`;
const replaceXoay360 = `f.jsx("button",{type:"button",onClick:()=>setModalSweep(s=>s>=355?0:360),style:{fontWeight:"600",color:"#2563eb",background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:"6px",padding:"2px 8px",cursor:"pointer",fontSize:"11px"},children:modalSweep>=355?"Quay lại 0°":"Xoay 360°"})`;

function checkAndReplace(target, replacement, label) {
  const count = content.split(target).length - 1;
  if (count !== 1) {
    console.error(`[ERROR] Target for "${label}" count is ${count} (expected 1).`);
    process.exit(1);
  }
  content = content.replace(target, replacement);
  console.log(`[OK] Replaced: ${label}`);
}

checkAndReplace(targetState, replaceState, '1. Modal sweep and view state');
checkAndReplace(targetDraw, replaceDraw, '2. Modal drawVolume3D sweep and view angles');
checkAndReplace(targetSave, replaceSave, '3. Modal handleSave pass sweep and view angles');
checkAndReplace(targetCanvas, replaceCanvas, '4. Modal interactive canvas slider & rotation');
checkAndReplace(targetXoay360, replaceXoay360, '5. Clickable Xoay 360 button in modal');

fs.writeFileSync(file, content, 'utf8');
console.log('[SUCCESS] All modal dynamic rotation patches applied successfully!');
