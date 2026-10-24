const fs = require('fs');

const jsFile = 'dist/assets/index-D9JME9Hm.js';
const cssFile = 'dist/assets/theme-modern.css';

let js = fs.readFileSync(jsFile, 'utf8');
let css = fs.readFileSync(cssFile, 'utf8');

// Find start and end of volume selection snippet
const startStr = '(ee==null?void 0:ee.selectedItem())&&ee.selectedItem().item.type==="volume"&&(()=>{';
const endStr = '})(),(ee==null?void 0:ee.selectionPoints())';

const pStart = js.indexOf(startStr);
const pEnd = js.indexOf(endStr, pStart);

if (pStart === -1 || pEnd === -1) {
  console.error('Cannot find start/end indices!', { pStart, pEnd });
  process.exit(1);
}

console.log('Found volume block at:', pStart, 'to', pEnd + 4);

const newVolBlock = `(ee==null?void 0:ee.selectedItem())&&ee.selectedItem().item.type==="volume"&&(()=>{
  const _s=ee.selectedItem();
  const it=_s.item;
  const curAx=it.axis||"ox";
  const isCross=curAx.startsWith("sec-");
  const na=it.a??-2;
  const nb=it.b??2;
  const cutX=it.cutPos!=null?it.cutPos:(Math.round(((na+nb)/2)*100)/100);
  const sw=Math.round(it.sweepAngle??0);
  const curSlices=it.nSlices||48;
  const setSlices=sl=>{
    stopVolAnim();
    const _pg=ee.doc.pages[_s.page];
    if(_pg)ee.cache.delete(_pg.id);
    ee.replaceItem(_s.page,{...it,nSlices:sl,_playing:false});
  };
  const vy=it.viewYaw??0.44;
  const vp=it.viewPitch??0.34;
  const isSGK=Math.abs(vy-0.44)<0.08&&Math.abs(vp-0.34)<0.08;
  const isFront=Math.abs(vy)<0.08&&Math.abs(vp)<0.08;
  const isAxial=curAx==="oy"?(Math.abs(vy)<0.12&&vp>1.35):(Math.abs(vy-1.57)<0.12&&Math.abs(vp)<0.12);
  const isTop=Math.abs(vy)<0.12&&Math.abs(vp-1.45)<0.12;
  const isIso=Math.abs(vy-0.785)<0.12&&Math.abs(vp-0.52)<0.12;
  const setView=(y,p)=>{
    stopVolAnim();
    const _pg=ee.doc.pages[_s.page];
    if(_pg)ee.cache.delete(_pg.id);
    ee.replaceItem(_s.page,{...it,viewYaw:y,viewPitch:p,_playing:false});
  };
  const setAxis=ax=>{
    const v=computeVolume(it.expr,it.expr2||"",na,nb,ax,it.nSlices||48);
    stopVolAnim();
    const update={...it,axis:ax,volume:v,_playing:false};
    if(ax.startsWith("sec-"))update.lastSecAxis=ax;
    else update.lastRevAxis=ax;
    const _pg=ee.doc.pages[_s.page];
    if(_pg)ee.cache.delete(_pg.id);
    ee.replaceItem(_s.page,update);
  };

  return f.jsxs(f.Fragment,{children:[
    /* ══════ HÀNG 1: HÌNH HỌC, THIẾT DIỆN & LÁT CẮT ══════ */
    /* Nhóm 1: Hướng tính */
    f.jsxs("div",{className:"vol-group",children:[
      f.jsx("span",{className:"vol-group-label",title:"Biểu diễn tính thể tích theo 2 hướng toán học",children:"Hướng tính:"}),
      f.jsx("button",{
        className:!isCross?"on":"",
        disabled:isCross&&curAx!=="sec-ox"&&curAx!=="sec-oy",
        style:(isCross&&curAx!=="sec-ox"&&curAx!=="sec-oy")?{opacity:0.45,cursor:"not-allowed"}:undefined,
        title:(isCross&&curAx!=="sec-ox"&&curAx!=="sec-oy")?"Khối này là vật thể lát cắt tịnh tiến, không thể quay quanh trục":"Hướng 1: Tính thể tích bằng cách quay hình phẳng quanh trục (Khối tròn xoay)",
        onClick:()=>{
          if(isCross&&curAx!=="sec-ox"&&curAx!=="sec-oy")return;
          const targetAx=(it.lastRevAxis&&!it.lastRevAxis.startsWith("sec-"))?it.lastRevAxis:(it.axis==="sec-oy"?"oy":"ox");
          const nextSw=(it.sweepAngle==null||it.sweepAngle>=355)?0:it.sweepAngle;
          setAxis(targetAx);
          ee.replaceItem(_s.page,{...it,axis:targetAx,sweepAngle:nextSw});
        },
        children:(isCross&&curAx!=="sec-ox"&&curAx!=="sec-oy")?"🔒 Không xoay":"🔄 Quay trục"
      }),
      f.jsx("button",{
        className:isCross?"on":"",
        title:"Hướng 2: Tính thể tích bằng các lát cắt thiết diện tịnh tiến (Cùng hình 3D)",
        onClick:()=>{
          const targetAx=(it.axis==="oy"||it.axis==="sec-oy"||it.lastSecAxis==="sec-oy")?"sec-oy":"sec-ox";
          setAxis(targetAx);
        },
        children:"📐 Lát cắt"
      })
    ]}),

    /* Nhóm 2 & 3: Tùy theo Hướng tính (Quay tròn xoay vs Lát cắt tịnh tiến) */
    (!isCross ? f.jsxs(f.Fragment,{children:[
      /* Nhóm Trục xoay */
      f.jsxs("div",{className:"vol-group",children:[
        f.jsx("span",{className:"vol-group-label",children:"Trục:"}),
        f.jsx("button",{className:curAx==="ox"?"on":"",title:"Xoay quanh trục hoành Ox",onClick:()=>setAxis("ox"),children:"Ox"}),
        f.jsx("button",{className:curAx==="oy"?"on":"",title:"Xoay quanh trục tung Oy",onClick:()=>setAxis("oy"),children:"Oy"})
      ]}),

      /* Nhóm Góc xoay & Quét */
      f.jsxs("div",{className:"vol-group",children:[
        f.jsx("span",{className:"vol-group-label",children:"Góc xoay:"}),
        f.jsx("button",{className:it._playing?"on":"",title:"Quay quét góc xoay từ 0° đến 360°",onClick:()=>toggleVolAnim(ee,_s.page,it),children:it._playing?"⏸ Dừng":"▶ Quay"}),
        f.jsx("button",{className:sw<=5?"on":"",title:"Góc 0°: Chỉ hiển thị hình phẳng (H) trong Oxy",onClick:()=>{stopVolAnim();ee.replaceItem(_s.page,{...it,sweepAngle:0,_playing:false});},children:"0°"}),
        f.jsx("button",{className:Math.abs(sw-90)<=15?"on":"",title:"Quay 90°: 1/4 khối tròn xoay",onClick:()=>{stopVolAnim();ee.replaceItem(_s.page,{...it,sweepAngle:90,_playing:false});},children:"90°"}),
        f.jsx("button",{className:Math.abs(sw-180)<=15?"on":"",title:"Quay 180°: 1/2 khối tròn xoay (bổ đôi)",onClick:()=>{stopVolAnim();ee.replaceItem(_s.page,{...it,sweepAngle:180,_playing:false});},children:"180°"}),
        f.jsx("button",{className:Math.abs(sw-270)<=15?"on":"",title:"Quay 270°: 3/4 khối tròn xoay",onClick:()=>{stopVolAnim();ee.replaceItem(_s.page,{...it,sweepAngle:270,_playing:false});},children:"270°"}),
        f.jsx("button",{className:sw>=355?"on":"",title:"Quay 360°: Khối tròn xoay trọn vẹn",onClick:()=>{stopVolAnim();ee.replaceItem(_s.page,{...it,sweepAngle:360,_playing:false});},children:"360°"}),
        f.jsxs("label",{style:{display:"inline-flex",alignItems:"center",gap:"2px",fontSize:"11px",padding:"0 2px",cursor:"pointer"},children:[
          f.jsx("b",{style:{minWidth:"24px",textAlign:"right"},children:sw+"°"}),
          f.jsx("input",{type:"range",min:0,max:360,step:5,ref:el=>{if(el&&!it._dragging)el.value=sw;},defaultValue:sw,style:{width:"50px"},onPointerDown:e=>{try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}stopVolAnim();it._dragging=true;},onInput:e=>{stopVolAnim();it._dragging=true;it._playing=false;const v=Number(e.target.value);it.sweepAngle=v;if(e.currentTarget.previousSibling)e.currentTarget.previousSibling.textContent=v+"°";const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.redraw();},onPointerUp:e=>{try{e.currentTarget.releasePointerCapture(e.pointerId);}catch{}it._dragging=false;const v=Number(e.target.value);ee.replaceItem(_s.page,{...it,sweepAngle:v,_playing:false});}})
        ]})
      ]}),

      /* Nhóm Lát cắt đĩa dx */
      f.jsxs("div",{className:"vol-group",children:[
        f.jsx("button",{className:it.showSlice?"on":"",title:"Bật/tắt lát cắt đĩa vi phân dx (thiết diện tròn của khối tròn xoay)",onClick:()=>ee.replaceItem(_s.page,{...it,showSlice:!it.showSlice}),children:"📐 Lát dx"}),
        (it.showSlice ? f.jsxs("label",{style:{display:"inline-flex",alignItems:"center",gap:"2px",fontSize:"11px",padding:"0 2px",cursor:"pointer"},title:"Trượt vị trí lát cắt đĩa tròn x trên [a, b]",children:[
          f.jsx("span",{children:"x:"}),
          f.jsx("b",{style:{minWidth:"22px",textAlign:"right"},children:String(Math.round(cutX*100)/100)}),
          f.jsx("input",{type:"range",min:na,max:nb,step:(nb-na)/100,ref:el=>{if(el&&!it._dragging)el.value=cutX;},defaultValue:cutX,style:{width:"50px"},onPointerDown:e=>{try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}stopVolAnim();it._dragging=true;},onInput:e=>{stopVolAnim();it._dragging=true;it._playing=false;const v=Number(e.target.value);it.cutPos=Math.round(v*100)/100;if(e.currentTarget.previousSibling){e.currentTarget.previousSibling.textContent=String(Math.round(v*100)/100);}const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.redraw();},onPointerUp:e=>{try{e.currentTarget.releasePointerCapture(e.pointerId);}catch{}it._dragging=false;const v=Number(e.target.value);ee.replaceItem(_s.page,{...it,cutPos:v,_playing:false});}})
        ]}) : null)
      ]})
    ]}): f.jsxs(f.Fragment,{children:[
      /* Nhóm Dạng thiết diện */
      f.jsxs("div",{className:"vol-group",children:[
        f.jsx("span",{className:"vol-group-label",children:"Thiết diện:"}),
        f.jsx("button",{className:(curAx==="sec-ox"||curAx==="sec-oy")?"on":"",title:"Lát cắt đĩa tròn tịnh tiến của chính khối tròn xoay (Cùng hình 3D)",onClick:()=>setAxis(it.axis==="oy"||it.axis==="sec-oy"?"sec-oy":"sec-ox"),children:"◎ Tròn xoay"}),
        f.jsx("button",{className:curAx==="sec-square"?"on":"",title:"Mặt cắt hình vuông",onClick:()=>setAxis("sec-square"),children:"◻ Vuông"}),
        f.jsx("button",{className:curAx==="sec-tri"?"on":"",title:"Mặt cắt tam giác đều",onClick:()=>setAxis("sec-tri"),children:"△ Tam giác"}),
        f.jsx("button",{className:curAx==="sec-semi"?"on":"",title:"Mặt cắt nửa hình tròn",onClick:()=>setAxis("sec-semi"),children:"⌒ Nửa tròn"}),
        f.jsx("button",{className:curAx==="sec-circle"?"on":"",title:"Mặt cắt hình tròn",onClick:()=>setAxis("sec-circle"),children:"○ Tròn"}),
        f.jsx("button",{className:curAx==="sec-tri-right"?"on":"",title:"Mặt cắt tam giác vuông cân (cạnh góc vuông trên đáy)",onClick:()=>setAxis("sec-tri-right"),children:"◺ Góc vuông"}),
        f.jsx("button",{className:curAx==="sec-tri-iso"?"on":"",title:"Mặt cắt tam giác vuông cân (cạnh huyền trên đáy)",onClick:()=>setAxis("sec-tri-iso"),children:"◿ Huyền đáy"})
      ]}),

      /* Nhóm Quét & Vị trí mặt cắt */
      f.jsxs("div",{className:"vol-group",children:[
        f.jsx("span",{className:"vol-group-label",children:"Lát cắt:"}),
        f.jsx("button",{className:it._playing?"on":"",title:"Quét mặt phẳng cắt tự động từ a đến b",onClick:()=>toggleVolAnim(ee,_s.page,it),children:it._playing?"⏸ Dừng":"▶ Quét"}),
        f.jsxs("label",{style:{display:"inline-flex",alignItems:"center",gap:"2px",fontSize:"11px",padding:"0 2px",cursor:"pointer"},children:[
          f.jsx("span",{children:"x:"}),
          f.jsx("b",{style:{minWidth:"22px",textAlign:"right"},children:String(Math.round(cutX*100)/100)}),
          f.jsx("input",{type:"range",min:na,max:nb,step:(nb-na)/100,ref:el=>{if(el&&!it._dragging)el.value=cutX;},defaultValue:cutX,style:{width:"50px"},onPointerDown:e=>{try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}stopVolAnim();it._dragging=true;},onInput:e=>{stopVolAnim();it._dragging=true;it._playing=false;const v=Number(e.target.value);it.cutPos=Math.round(v*100)/100;if(e.currentTarget.previousSibling){e.currentTarget.previousSibling.textContent=String(Math.round(v*100)/100);}const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.redraw();},onPointerUp:e=>{try{e.currentTarget.releasePointerCapture(e.pointerId);}catch{}it._dragging=false;const v=Number(e.target.value);ee.replaceItem(_s.page,{...it,cutPos:v,_playing:false});}})
        ]}),
        f.jsx("button",{className:it.showRiemann?"on":"",title:"Hiển thị các lát cắt lăng trụ rời rạc (Tổng Riemann)",onClick:()=>ee.replaceItem(_s.page,{...it,showRiemann:!it.showRiemann}),children:"Lát Riemann"})
      ]})
    ]})),

    /* ══════ PHÂN CÁCH HÀNG: Cắt xuống Hàng 2 ngăn nắp ══════ */
    f.jsx("div",{className:"vol-break"}),

    /* ══════ HÀNG 2: GÓC NHÌN 3D, THU PHÓNG & ĐỘ MỊN ══════ */
    /* Nhóm Góc nhìn 3D SGK */
    f.jsxs("div",{className:"vol-group",children:[
      f.jsx("span",{className:"vol-group-label",title:"Các góc nhìn không gian phối cảnh chuẩn SGK Toán 12",children:"🎥 Góc nhìn:"}),
      f.jsx("button",{className:isSGK?"on":"",title:"Góc nhìn 3D phối cảnh chuẩn SGK Toán 12 (mặc định)",onClick:()=>setView(0.44,0.34),children:"SGK"}),
      f.jsx("button",{className:isFront?"on":"",title:"Góc nhìn phẳng chính diện Oxy (chiếu đứng / hình phẳng H)",onClick:()=>setView(0,0),children:"Oxy"}),
      f.jsx("button",{className:isAxial?"on":"",title:curAx==="oy"?"Góc nhìn dọc trục tung Oy":"Góc nhìn dọc trục hoành Ox (nhìn trực diện thiết diện/lát cắt)",onClick:()=>setView(curAx==="oy"?0:1.5708,curAx==="oy"?1.45:0),children:curAx==="oy"?"Dọc Oy":"Dọc Ox"}),
      f.jsx("button",{className:isTop?"on":"",title:"Góc nhìn từ trên xuống (mặt phẳng Oxz / hình chiếu bằng)",onClick:()=>setView(0,1.45),children:"Từ trên"}),
      f.jsx("button",{className:isIso?"on":"",title:"Góc nhìn nghiêng 45° không gian trục đo",onClick:()=>setView(0.785,0.52),children:"45°"}),
      f.jsx("span",{className:"vol-sep"}),
      f.jsxs("span",{className:"vol-dpad",children:[
        f.jsx("button",{title:"Xoay góc nhìn 3D sang trái 15°",onClick:()=>{const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,viewYaw:(it.viewYaw??0.44)-0.26});},children:"⟲"}),
        f.jsx("button",{title:"Xoay góc nhìn 3D sang phải 15°",onClick:()=>{const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,viewYaw:(it.viewYaw??0.44)+0.26});},children:"⟳"}),
        f.jsx("button",{title:"Nâng góc nhìn lên 10°",onClick:()=>{const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,viewPitch:Math.max(-0.6,(it.viewPitch??0.34)-0.15)});},children:"▲"}),
        f.jsx("button",{title:"Hạ góc nhìn xuống 10°",onClick:()=>{const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,viewPitch:Math.min(1.4,(it.viewPitch??0.34)+0.15)});},children:"▼"})
      ]})
    ]}),

    /* Nhóm Thu phóng */
    f.jsxs("div",{className:"vol-group",children:[
      f.jsx("span",{className:"vol-group-label",title:"Thu phóng khối 3D (Phóng to / Thu nhỏ)",children:"🔍 Thu phóng:"}),
      f.jsx("button",{title:"Thu nhỏ hình khối 3D (-15%)",onClick:()=>{const nz=Math.max(0.4,Math.min(3.5,Math.round(((it.zoom3D??1.0)-0.15)*100)/100));const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,zoom3D:nz});},children:"−"}),
      f.jsx("button",{className:(Math.abs((it.zoom3D??1.0)-1.0)<0.05)?"on":"",title:"Đặt lại kích thước chuẩn (100%)",onClick:()=>{const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,zoom3D:1.0});},children:Math.round((it.zoom3D??1.0)*100)+"%"}),
      f.jsx("button",{title:"Phóng to hình khối 3D (+15%)",onClick:()=>{const nz=Math.max(0.4,Math.min(3.5,Math.round(((it.zoom3D??1.0)+0.15)*100)/100));const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.replaceItem(_s.page,{...it,zoom3D:nz});},children:"+"}),
      f.jsxs("label",{style:{display:"inline-flex",alignItems:"center",gap:"2px",fontSize:"11px",padding:"0 2px",cursor:"pointer"},title:"Thanh trượt thu phóng hình khối 3D (50% - 300%)",children:[
        f.jsx("input",{type:"range",min:0.5,max:3.0,step:0.05,ref:el=>{if(el&&!it._dragging)el.value=it.zoom3D??1.0;},defaultValue:it.zoom3D??1.0,style:{width:"45px"},onPointerDown:e=>{try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}it._dragging=true;},onInput:e=>{it._dragging=true;const v=Math.round(Number(e.target.value)*100)/100;it.zoom3D=v;const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.redraw();},onPointerUp:e=>{try{e.currentTarget.releasePointerCapture(e.pointerId);}catch{}it._dragging=false;const v=Math.round(Number(e.target.value)*100)/100;ee.replaceItem(_s.page,{...it,zoom3D:v});}})
      ]})
    ]}),

    /* Nhóm Độ mịn */
    f.jsxs("div",{className:"vol-group",children:[
      f.jsx("span",{className:"vol-group-label",title:"Số lát cắt 3D (Độ mịn bề mặt khối tròn xoay)",children:"⚡ Độ mịn:"}),
      f.jsx("button",{className:curSlices<=32?"on":"",title:"Độ mịn chuẩn (32 lát)",onClick:()=>setSlices(32),children:"32"}),
      f.jsx("button",{className:curSlices===64?"on":"",title:"Độ mịn cao (64 lát)",onClick:()=>setSlices(64),children:"64"}),
      f.jsx("button",{className:curSlices>=128?"on":"",title:"Độ mịn siêu nét (128 lát)",onClick:()=>setSlices(128),children:"128"}),
      f.jsxs("label",{style:{display:"inline-flex",alignItems:"center",gap:"2px",fontSize:"11px",padding:"0 2px",cursor:"pointer"},title:"Thanh trượt tùy chỉnh số lát cắt 3D từ 16 đến 240 lát",children:[
        f.jsx("b",{style:{minWidth:"22px",textAlign:"right"},children:curSlices}),
        f.jsx("input",{type:"range",min:16,max:240,step:4,ref:el=>{if(el&&!it._dragging)el.value=curSlices;},defaultValue:curSlices,style:{width:"45px"},onPointerDown:e=>{try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}it._dragging=true;},onInput:e=>{it._dragging=true;const v=Number(e.target.value);it.nSlices=v;if(e.currentTarget.previousSibling)e.currentTarget.previousSibling.textContent=String(v);const _pg=ee.doc.pages[_s.page];if(_pg)ee.cache.delete(_pg.id);ee.redraw();},onPointerUp:e=>{try{e.currentTarget.releasePointerCapture(e.pointerId);}catch{}it._dragging=false;const v=Number(e.target.value);ee.replaceItem(_s.page,{...it,nSlices:v});}})
      ]})
    ]}),

    f.jsx("span",{className:"turn-sep"})
  ]});
})()`;

js = js.slice(0, pStart) + newVolBlock + js.slice(pEnd + 4);
fs.writeFileSync(jsFile, js, 'utf8');
console.log('✓ Updated index-D9JME9Hm.js');

// CSS update
const cssMarker = '/* ==========================================================================\n   ✨ VOLUME TOOLBAR GROUPED CARDS & PILLS (.vol-group, .vol-break)';
const newCssRules = `/* ==========================================================================
   ✨ VOLUME TOOLBAR GROUPED CARDS & PILLS (.vol-group, .vol-break)
   ========================================================================== */
.selection-bar {
  display: flex !important;
  flex-wrap: wrap !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 4px 5px !important;
  padding: 4px 7px !important;
  max-width: min(1360px, calc(100vw - 20px)) !important;
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.08) !important;
  border-radius: 12px !important;
}

.vol-break {
  width: 100% !important;
  height: 0 !important;
  margin: 1px 0 !important;
  flex-basis: 100% !important;
  display: block !important;
}

.vol-group {
  display: inline-flex !important;
  align-items: center !important;
  gap: 2px !important;
  background: rgba(248, 250, 252, 0.95) !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 8px !important;
  padding: 2px 4px !important;
  white-space: nowrap !important;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
}

.vol-group-label {
  font-size: 11px !important;
  font-weight: 700 !important;
  color: #475569 !important;
  padding: 0 2px !important;
  letter-spacing: 0.01em !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 2px !important;
  user-select: none !important;
}

.vol-group button {
  display: inline-flex !important;
  align-items: center !important;
  gap: 2px !important;
  padding: 2px 6px !important;
  min-height: 24px !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  border-radius: 5px !important;
  color: #334155 !important;
  border: 1px solid transparent !important;
  transition: all 0.12s cubic-bezier(0.16, 1, 0.3, 1) !important;
  background: transparent !important;
  cursor: pointer !important;
}

.vol-group button:hover:not(:disabled) {
  background: #ffffff !important;
  color: #0f172a !important;
  border-color: #cbd5e1 !important;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06) !important;
  transform: translateY(-0.5px) !important;
}

.vol-group button.on {
  background: #ffffff !important;
  color: #1d4ed8 !important;
  border-color: #93c5fd !important;
  font-weight: 600 !important;
  box-shadow: 0 1px 4px rgba(37, 99, 235, 0.16) !important;
}

.vol-group button:disabled {
  opacity: 0.45 !important;
  cursor: not-allowed !important;
}

.vol-sep {
  width: 1px !important;
  height: 14px !important;
  background: #cbd5e1 !important;
  margin: 0 2px !important;
  align-self: center !important;
}

.vol-dpad {
  display: inline-flex !important;
  align-items: center !important;
  gap: 1px !important;
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 5px !important;
  padding: 1px !important;
}

.vol-dpad button {
  padding: 1px 3px !important;
  min-height: 20px !important;
  min-width: 20px !important;
  justify-content: center !important;
  font-size: 10px !important;
  border-radius: 4px !important;
}

.selection-bar > button {
  padding: 2px 7px !important;
  min-height: 24px !important;
  font-size: 11px !important;
  border-radius: 6px !important;
  background: rgba(248, 250, 252, 0.95) !important;
  border: 1px solid #e2e8f0 !important;
  color: #334155 !important;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
  transition: all 0.12s ease !important;
}

.selection-bar > button:hover:not(:disabled) {
  background: #ffffff !important;
  color: #0f172a !important;
  border-color: #cbd5e1 !important;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06) !important;
  transform: translateY(-0.5px) !important;
}
`;

if (css.includes(cssMarker)) {
  const p = css.indexOf(cssMarker);
  css = css.slice(0, p) + newCssRules;
} else {
  css += '\n' + newCssRules;
}

fs.writeFileSync(cssFile, css, 'utf8');
console.log('✓ Updated theme-modern.css');
