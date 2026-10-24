const fs = require('fs');

const file = 'dist/assets/index-D9JME9Hm.js';
fs.copyFileSync(file, file + '.bak_stroke_label');
console.log('✓ Backup created.');

let js = fs.readFileSync(file, 'utf8');

// 1. Target 1: drawVolume3D start
const target1 = `function drawVolume3D(ctx, item, isFocused) {
  const isItemFocused = Boolean(isFocused || item._dragging || item._forceFocused);
  const { x, y, w, h, expr, expr2, axis, a, b, nSlices, sweepAngle, viewYaw, viewPitch, showSlice, cutPos, showRiemann } = item;`;

const repl1 = `function drawVolume3D(ctx, item, isFocused) {
  const isItemFocused = Boolean(isFocused || item._dragging || item._forceFocused);
  const strokeScale = Math.max(0.4, Math.min(3.5, item.strokeScale ?? 1.0));
  const labelScale = Math.max(0.5, Math.min(3.0, item.labelScale ?? 1.0));
  const origCtx = ctx;
  ctx = new Proxy(origCtx, {
    get(target, prop) {
      const val = target[prop];
      if (typeof val === 'function') {
        return val.bind(target);
      }
      return val;
    },
    set(target, prop, value) {
      if (prop === 'lineWidth' && typeof value === 'number') {
        target.lineWidth = Math.round(value * strokeScale * 100) / 100;
        return true;
      }
      if (prop === 'font' && typeof value === 'string') {
        target.font = value.replace(/(\\d+(?:\\.\\d+)?)\\s*px/g, (m, px) => {
          return (Math.round(parseFloat(px) * labelScale * 10) / 10) + 'px';
        });
        return true;
      }
      target[prop] = value;
      return true;
    }
  });
  const { x, y, w, h, expr, expr2, axis, a, b, nSlices, sweepAngle, viewYaw, viewPitch, showSlice, cutPos, showRiemann } = item;`;

if (!js.includes(target1)) {
  console.error('Target 1 not found!');
  process.exit(1);
}
js = js.replace(target1, repl1);
console.log('✓ Injected strokeScale & labelScale proxy into drawVolume3D.');

// 2. Target 2: drawAxisArrow scaling
const target2 = `  const drawAxisArrow = (pFrom, pTo, color, len = 11, halfW = 4.2) => {`;
const repl2 = `  const drawAxisArrow = (pFrom, pTo, color, len = 11, halfW = 4.2) => {
    len = len * Math.max(0.6, Math.min(2.2, strokeScale));
    halfW = halfW * Math.max(0.6, Math.min(2.2, strokeScale));`;

if (!js.includes(target2)) {
  console.error('Target 2 not found!');
  process.exit(1);
}
js = js.replace(target2, repl2);
console.log('✓ Scaled drawAxisArrow with strokeScale.');

// 3. Target 3: Toolbar setters for stroke & label
const target3 = `  const curSlices=it.nSlices||48;
  const setSlices=sl=>{
    stopVolAnim();
    const _pg=ee.doc.pages[_s.page];
    if(_pg)ee.cache.delete(_pg.id);
    ee.replaceItem(_s.page,{...it,nSlices:sl,_playing:false});
  };`;

const repl3 = `  const curSlices=it.nSlices||48;
  const setSlices=sl=>{
    stopVolAnim();
    const _pg=ee.doc.pages[_s.page];
    if(_pg)ee.cache.delete(_pg.id);
    ee.replaceItem(_s.page,{...it,nSlices:sl,_playing:false});
  };
  const curStroke=it.strokeScale!=null?it.strokeScale:1.0;
  const setStroke=sc=>{
    const _pg=ee.doc.pages[_s.page];
    if(_pg)ee.cache.delete(_pg.id);
    ee.replaceItem(_s.page,{...it,strokeScale:sc});
  };
  const curLabel=it.labelScale!=null?it.labelScale:1.0;
  const setLabel=ls=>{
    const _pg=ee.doc.pages[_s.page];
    if(_pg)ee.cache.delete(_pg.id);
    ee.replaceItem(_s.page,{...it,labelScale:ls});
  };`;

if (!js.includes(target3)) {
  console.error('Target 3 not found!');
  process.exit(1);
}
js = js.replace(target3, repl3);
console.log('✓ Added setStroke and setLabel handlers in toolbar IIFE.');

// 4. Target 4: Toolbar UI group for Nét & Chữ
const target4 = `      f.jsxs("label",{style:{display:"inline-flex",alignItems:"center",gap:"2px",fontSize:"11px",padding:"0 2px",cursor:"pointer"},title:"Thanh trượt tùy chỉnh số lát cắt 3D từ 16 đến 240 lát",children:[
        f.jsx("b",{style:{minWidth:"22px",textAlign:"right"},children:curSlices}),
        f.jsx("input",{type:"range",min:16,max:240,step:4,ref:el=>{if(el&&!it._dragging)el.value=curSlices;},defaultValue:curSlices,style:{width:"45px"},onPointerDown:e=>{try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}it._dragging=true;},onInput:e=>{it._dragging=true;const v=Number(e.target.value);it.nSlices=v;if(e.currentTarget.previousSibling)e.currentTarget.previousSibling.textContent=String(v);const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.redraw();},onPointerUp:e=>{try{e.currentTarget.releasePointerCapture(e.pointerId);}catch{}it._dragging=false;const v=Number(e.target.value);ee.replaceItem(_s.page,{...it,nSlices:v});}})
      ]})
    ]}),

    f.jsx("span",{className:"turn-sep"})`;

const repl4 = `      f.jsxs("label",{style:{display:"inline-flex",alignItems:"center",gap:"2px",fontSize:"11px",padding:"0 2px",cursor:"pointer"},title:"Thanh trượt tùy chỉnh số lát cắt 3D từ 16 đến 240 lát",children:[
        f.jsx("b",{style:{minWidth:"22px",textAlign:"right"},children:curSlices}),
        f.jsx("input",{type:"range",min:16,max:240,step:4,ref:el=>{if(el&&!it._dragging)el.value=curSlices;},defaultValue:curSlices,style:{width:"45px"},onPointerDown:e=>{try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}it._dragging=true;},onInput:e=>{it._dragging=true;const v=Number(e.target.value);it.nSlices=v;if(e.currentTarget.previousSibling)e.currentTarget.previousSibling.textContent=String(v);const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.redraw();},onPointerUp:e=>{try{e.currentTarget.releasePointerCapture(e.pointerId);}catch{}it._dragging=false;const v=Number(e.target.value);ee.replaceItem(_s.page,{...it,nSlices:v});}})
      ]})
    ]}),

    /* Nhóm Độ to nét vẽ & Cỡ nhãn chữ */
    f.jsxs("div",{className:"vol-group",children:[
      f.jsx("span",{className:"vol-group-label",title:"Độ to của nét vẽ 3D (trục, đường cong, mặt cắt...)",children:"📏 Nét:"}),
      f.jsx("button",{title:"Giảm độ to nét vẽ (-0.2x)",onClick:()=>{const nv=Math.max(0.4,Math.min(3.0,Math.round(((it.strokeScale??1.0)-0.2)*10)/10));setStroke(nv);},children:"−"}),
      f.jsx("button",{className:(Math.abs((it.strokeScale??1.0)-1.0)<0.05)?"on":"",title:"Đặt lại độ to nét chuẩn (1.0x)",onClick:()=>setStroke(1.0),children:(it.strokeScale??1.0).toFixed(1)+"x"}),
      f.jsx("button",{title:"Tăng độ to nét vẽ (+0.2x)",onClick:()=>{const nv=Math.max(0.4,Math.min(3.0,Math.round(((it.strokeScale??1.0)+0.2)*10)/10));setStroke(nv);},children:"+"}),
      f.jsxs("label",{style:{display:"inline-flex",alignItems:"center",gap:"2px",fontSize:"11px",padding:"0 2px",cursor:"pointer"},title:"Thanh trượt độ to nét vẽ (0.5x - 3.0x)",children:[
        f.jsx("input",{type:"range",min:0.5,max:2.8,step:0.1,ref:el=>{if(el&&!it._dragging)el.value=it.strokeScale??1.0;},defaultValue:it.strokeScale??1.0,style:{width:"40px"},onPointerDown:e=>{try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}it._dragging=true;},onInput:e=>{it._dragging=true;const v=Math.round(Number(e.target.value)*10)/10;it.strokeScale=v;const btn=e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling;if(btn)btn.textContent=v.toFixed(1)+"x";const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.redraw();},onPointerUp:e=>{try{e.currentTarget.releasePointerCapture(e.pointerId);}catch{}it._dragging=false;const v=Math.round(Number(e.target.value)*10)/10;setStroke(v);}})
      ]}),
      f.jsx("span",{className:"vol-sep"}),
      f.jsx("span",{className:"vol-group-label",title:"Độ to của nhãn chữ và ký hiệu (x, y, z, O, a, b, f(x)...)",children:"🔤 Chữ:"}),
      f.jsx("button",{title:"Giảm cỡ nhãn chữ (-0.2x)",onClick:()=>{const nv=Math.max(0.5,Math.min(2.5,Math.round(((it.labelScale??1.0)-0.2)*10)/10));setLabel(nv);},children:"−"}),
      f.jsx("button",{className:(Math.abs((it.labelScale??1.0)-1.0)<0.05)?"on":"",title:"Đặt lại cỡ chữ chuẩn (1.0x)",onClick:()=>setLabel(1.0),children:(it.labelScale??1.0).toFixed(1)+"x"}),
      f.jsx("button",{title:"Tăng cỡ nhãn chữ (+0.2x)",onClick:()=>{const nv=Math.max(0.5,Math.min(2.5,Math.round(((it.labelScale??1.0)+0.2)*10)/10));setLabel(nv);},children:"+"}),
      f.jsxs("label",{style:{display:"inline-flex",alignItems:"center",gap:"2px",fontSize:"11px",padding:"0 2px",cursor:"pointer"},title:"Thanh trượt cỡ nhãn chữ (0.6x - 2.4x)",children:[
        f.jsx("input",{type:"range",min:0.6,max:2.4,step:0.1,ref:el=>{if(el&&!it._dragging)el.value=it.labelScale??1.0;},defaultValue:it.labelScale??1.0,style:{width:"40px"},onPointerDown:e=>{try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}it._dragging=true;},onInput:e=>{it._dragging=true;const v=Math.round(Number(e.target.value)*10)/10;it.labelScale=v;const btn=e.currentTarget.parentElement?.previousElementSibling?.previousElementSibling;if(btn)btn.textContent=v.toFixed(1)+"x";const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.redraw();},onPointerUp:e=>{try{e.currentTarget.releasePointerCapture(e.pointerId);}catch{}it._dragging=false;const v=Math.round(Number(e.target.value)*10)/10;setLabel(v);}})
      ]})
    ]}),

    f.jsx("span",{className:"turn-sep"})`;

if (!js.includes(target4)) {
  console.error('Target 4 not found!');
  process.exit(1);
}
js = js.replace(target4, repl4);
console.log('✓ Added Nét & Chữ UI control group to selection toolbar.');

fs.writeFileSync(file, js, 'utf8');
console.log('✓ Successfully saved index-D9JME9Hm.js');
