/**
 * PATCH: Volume Integral 3D Tool
 * Adds "The tich" (Volume) item type with 3D visualization and calculus
 */
const fs = require('fs');
let js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// ─── Helper to safely find and replace one occurrence ───────────────────────
function mustReplace(target, replacement, label) {
  const idx = js.indexOf(target);
  if (idx < 0) throw new Error('TARGET NOT FOUND: ' + label);
  js = js.slice(0, idx) + replacement + js.slice(idx + target.length);
  console.log('✓ Patched:', label);
}

// ─── 1. Vietnamese labels ────────────────────────────────────────────────────
mustReplace(
  'graphTitle:"Đồ thị hàm số",vartableTitle:"Bảng biến thiên"',
  'graphTitle:"Đồ thị hàm số",vartableTitle:"Bảng biến thiên",' +
  'volumeTitle:"Thể tích — Tích phân",' +
  'volumeTip:"Vẽ và tính thể tích vật thể xoay hoặc theo mặt cắt",' +
  'volFnLabel:"f(x) =",' +
  'volFnPlaceholder:"ví dụ: sqrt(4 - x^2), x^2, sin(x)",' +
  'volFn2Label:"g(x) — hàm dưới (để trống nếu không có)",' +
  'volAxisLabel:"Loại / Trục xoay",' +
  'volAxisOx:"Xoay quanh Ox (đĩa / vành)",' +
  'volAxisOy:"Xoay quanh Oy (vỏ trụ)",' +
  'volSecSquare:"Mặt cắt: hình vuông",' +
  'volSecCircle:"Mặt cắt: hình tròn",' +
  'volSecTriEq:"Mặt cắt: tam giác đều",' +
  'volSecSemiCircle:"Mặt cắt: nửa hình tròn",' +
  'volALabel:"a =",' +
  'volBLabel:"b =",' +
  'volNSlices:"Số lát 3D",' +
  'volCompute:"Tính thể tích",' +
  'volHelp:"Nhập f(x) ≥ 0, cận [a,b]. g(x) để trừ phần rỗng (vành). Tính số trị bằng tổng Riemann."',
  'labels'
);

// ─── 2. Dialog render: add VolumeDialog before formula dialog ────────────────
mustReplace(
  '(ze==null?void 0:ze.k)==="formula"&&f.jsx(_z,{item:ze.item',
  '(ze==null?void 0:ze.k)==="volume"&&f.jsx(VolumeDialog,{item:ze.item,onClose:()=>Je(null),onSave:_=>{ze.item?ee==null||ee.replaceItem(ze.page,_):ee==null||ee.insertItem(_),Je(null)}}),' +
  '(ze==null?void 0:ze.k)==="formula"&&f.jsx(_z,{item:ze.item',
  'volume dialog render'
);

// ─── 3. M8 type recognition (selection bounding box) ────────────────────────
mustReplace(
  'const M8=e=>e.type==="image"||e.type==="graph"||e.type==="vartable"',
  'const M8=e=>e.type==="image"||e.type==="graph"||e.type==="vartable"||e.type==="volume"',
  'M8 type recognition'
);

// ─── 4. Patch pv() to handle volume item type ────────────────────────────────
mustReplace(
  'function pv(e,t,n){if(t.type==="graph")return g_(e,t);if(t.type==="text")return tP(e,t);if(t.type==="vartable")return y_(e,t);',
  'function pv(e,t,n){' +
    'if(t.type==="volume"){' +
      'drawVolume3D(e,{...t,expr:t.expr||"",expr2:t.expr2||"",a:t.a!=null?t.a:-2,b:t.b!=null?t.b:2,axis:t.axis||"ox",nSlices:t.nSlices||30});' +
      'if(t.volume!=null&&isFinite(t.volume)){' +
        'e.save();' +
        'e.fillStyle="rgba(30,64,175,0.92)";' +
        'e.font="bold "+Math.min(14,t.h*0.055)+"px system-ui,sans-serif";' +
        'e.textAlign="right";' +
        'e.textBaseline="bottom";' +
        'e.fillText("V \u2248 "+fmtVolume(t.volume),t.x+t.w-8,t.y+t.h-6);' +
        'e.restore();' +
      '}' +
      'return;' +
    '}' +
    'if(t.type==="graph")return g_(e,t);if(t.type==="text")return tP(e,t);if(t.type==="vartable")return y_(e,t);',
  'pv volume dispatch'
);

// ─── 5. Inject VolumeDialog + helpers before function aF ─────────────────────
const AFN = 'function aF({item:e,onSave:t,onClose:n})';
const volumeCode = `
/*** === VOLUME INTEGRAL 3D TOOL === ***/

function volumeSimpsons(fv,a,b,n){
  if(n%2!==0)n++;
  const h=(b-a)/n;
  let sum=fv(a)+fv(b);
  for(let i=1;i<n;i++){
    const x=a+i*h,fx=fv(x);
    if(!isFinite(fx))continue;
    sum+=(i%2===0?2:4)*fx;
  }
  return(h/3)*sum;
}

function computeVolume(expr,expr2,a,b,axis,N){
  const fn=bo(expr);if(fn instanceof Error)return null;
  const fn2raw=expr2&&expr2.trim()?bo(expr2):null;
  if(fn2raw instanceof Error)return null;
  const f1=x=>Math.max(0,fn(x));
  const g2=fn2raw?(x=>Math.max(0,fn2raw(x))):()=>0;
  let integrand;
  if(axis==="ox"){integrand=x=>Math.PI*(f1(x)*f1(x)-g2(x)*g2(x));}
  else if(axis==="oy"){integrand=x=>2*Math.PI*Math.abs(x)*Math.max(0,f1(x)-g2(x));}
  else if(axis==="sec-square"){integrand=x=>{const s=Math.max(0,f1(x)-g2(x));return s*s;};}
  else if(axis==="sec-circle"){integrand=x=>{const d=Math.max(0,f1(x)-g2(x));return Math.PI/4*d*d;};}
  else if(axis==="sec-tri"){integrand=x=>{const s=Math.max(0,f1(x)-g2(x));return(Math.sqrt(3)/4)*s*s;};}
  else if(axis==="sec-semi"){integrand=x=>{const d=Math.max(0,f1(x)-g2(x));return(Math.PI/8)*d*d;};}
  else return null;
  const vol=volumeSimpsons(integrand,a,b,(N||30)*100);
  return isFinite(vol)?vol:null;
}

function fmtVolume(v){
  if(v===null||!isFinite(v))return"—";
  if(Math.abs(v)<0.0001)return v.toExponential(3);
  if(Math.abs(v)>1e6)return v.toExponential(4);
  const pi=v/Math.PI,pr=Math.round(pi*10000)/10000;
  if(Math.abs(pi-pr)<0.0005){
    const label=pr===1?"":pr===-1?"-":String(pr);
    return label+"π \\u2248 "+String(Math.round(v*10000)/10000);
  }
  return String(Math.round(v*10000)/10000);
}

function drawVolume3D(ctx,item){
  const{x,y,w,h,expr,expr2,a,b,axis,nSlices}=item;
  const fn=bo(expr);
  if(fn instanceof Error||!expr||!expr.trim()){
    ctx.save();
    ctx.fillStyle="#f3f4f6";ctx.fillRect(x,y,w,h);
    ctx.fillStyle="#9ca3af";
    ctx.font=Math.min(14,h*0.08)+"px system-ui";
    ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.fillText("Nhập hàm số để xem 3D",x+w/2,y+h/2);
    ctx.restore();return;
  }
  const fn2raw=expr2&&expr2.trim()?bo(expr2):null;
  const f1=xv=>Math.max(0,fn(xv));
  const f2=(fn2raw instanceof Error||!fn2raw)?()=>0:xv=>Math.max(0,fn2raw(xv));
  const N=Math.max(16,Math.min(60,nSlices||30));
  const na=typeof a==="number"&&isFinite(a)?a:-2;
  const nb=typeof b==="number"&&isFinite(b)?b:2;
  if(nb<=na)return;
  let maxR=0.01;
  for(let i=0;i<=N*2;i++){const xv=na+(nb-na)*i/(N*2),r=Math.max(f1(xv),f2(xv));if(isFinite(r)&&r>maxR)maxR=r;}
  const mg=Math.min(w,h)*0.08,pw=w-2*mg,ph=h-2*mg;
  const ox=x+mg,oy=y+mg+ph;
  const xsc=pw/(nb-na),rsc=ph*0.42/maxR;
  const tilt=ph*0.14/(nb-na);
  const isRev=axis==="ox"||axis==="oy";
  const nAng=isRev?28:1;
  ctx.save();
  ctx.fillStyle="#f0f4ff";ctx.fillRect(x,y,w,h);
  /* grid lines */
  ctx.strokeStyle="#dde4f8";ctx.lineWidth=0.6;
  for(let i=0;i<=6;i++){
    const xv=na+(nb-na)*i/6,sx=ox+(xv-na)*xsc,sy=oy-(xv-na)*tilt;
    ctx.beginPath();ctx.moveTo(sx,oy);ctx.lineTo(sx,oy-6);ctx.stroke();
  }
  /* slices back-to-front */
  for(let ai=nAng-1;ai>=0;ai--){
    const a0=isRev?(2*Math.PI*ai/nAng):0;
    const a1=isRev?(2*Math.PI*(ai+1)/nAng):Math.PI*2;
    const am=(a0+a1)/2,cosA=Math.cos(am),sinA=Math.sin(am);
    if(isRev&&sinA>0.65)continue;
    const opa=isRev?Math.max(0.15,0.85-sinA*0.7):0.75;
    for(let si=0;si<N;si++){
      const t0=na+(nb-na)*si/N,t1=na+(nb-na)*(si+1)/N;
      const ro0=f1(t0),ro1=f1(t1),ri0=f2(t0),ri1=f2(t1);
      if(!isFinite(ro0)||!isFinite(ro1))continue;
      const proj=(xv,r,ang)=>{
        const sx=ox+(xv-na)*xsc-(xv-na)*tilt*0;
        const sy=oy-(xv-na)*tilt;
        return{sx:sx+r*Math.cos(ang)*rsc*0.3,sy:sy-r*Math.sin(ang)*rsc};
      };
      let hue=axis==="ox"?220:axis==="oy"?160:axis==="sec-square"?30:axis==="sec-circle"?280:axis==="sec-tri"?120:340;
      const sat=70,lit=55;
      if(isRev){
        const lf=Math.max(0.5,Math.abs(cosA)*0.5+0.5);
        const p0=proj(t0,ro0,a0),p1=proj(t1,ro1,a0),p2=proj(t1,ro1,a1),p3=proj(t0,ro0,a1);
        ctx.beginPath();ctx.moveTo(p0.sx,p0.sy);ctx.lineTo(p1.sx,p1.sy);ctx.lineTo(p2.sx,p2.sy);ctx.lineTo(p3.sx,p3.sy);ctx.closePath();
        ctx.fillStyle="hsla("+hue+","+sat+"%,"+Math.round(lit*lf)+"%,"+opa+")";ctx.fill();
        ctx.strokeStyle="hsla("+hue+","+sat+"%,"+(lit-20)+"%,"+(opa*0.25)+")";ctx.lineWidth=0.3;ctx.stroke();
        if(ri0>0.001||ri1>0.001){
          const q0=proj(t0,ri0,a0),q1=proj(t1,ri1,a0),q2=proj(t1,ri1,a1),q3=proj(t0,ri0,a1);
          ctx.beginPath();ctx.moveTo(q0.sx,q0.sy);ctx.lineTo(q1.sx,q1.sy);ctx.lineTo(q2.sx,q2.sy);ctx.lineTo(q3.sx,q3.sy);ctx.closePath();
          ctx.fillStyle="hsla("+hue+",15%,92%,"+(opa*0.5)+")";ctx.fill();
        }
      } else {
        const xm=(t0+t1)/2,ht2=Math.max(0,f1(xm)-f2(xm));
        if(ht2<0.001)continue;
        const sH=ht2*rsc,sW=(t1-t0)*xsc;
        const bsx=ox+(xm-na)*xsc,bsy=oy-(xm-na)*tilt;
        ctx.save();ctx.translate(bsx,bsy);
        ctx.fillStyle="hsla("+hue+","+sat+"%,"+lit+"%,0.72)";
        ctx.strokeStyle="hsla("+hue+","+sat+"%,"+(lit-20)+"%,0.45)";ctx.lineWidth=0.5;
        if(axis==="sec-square"){ctx.fillRect(-sW/2,-sH,sW,sH);ctx.strokeRect(-sW/2,-sH,sW,sH);}
        else if(axis==="sec-circle"){ctx.beginPath();ctx.ellipse(0,-sH/2,sW/2,sH/2,0,0,Math.PI*2);ctx.fill();ctx.stroke();}
        else if(axis==="sec-tri"){ctx.beginPath();ctx.moveTo(0,-sH);ctx.lineTo(sW/2,0);ctx.lineTo(-sW/2,0);ctx.closePath();ctx.fill();ctx.stroke();}
        else if(axis==="sec-semi"){ctx.beginPath();ctx.arc(0,0,sH/2,Math.PI,0);ctx.closePath();ctx.fill();}
        ctx.restore();
      }
    }
  }
  /* end caps for revolution */
  if(isRev){
    for(const tv of[na,nb]){
      const ro=f1(tv),ri=f2(tv);
      if(!isFinite(ro)||ro<0.001)continue;
      const cx2=ox+(tv-na)*xsc,cy2=oy-(tv-na)*tilt;
      const rx=ro*rsc*0.3,ry=ro*rsc;
      const hue2=axis==="ox"?220:160;
      ctx.beginPath();ctx.ellipse(cx2,cy2,rx,ry,0,0,Math.PI*2);
      ctx.fillStyle="hsla("+hue2+",70%,60%,0.55)";ctx.fill();
    }
  }
  /* f(x) curve */
  ctx.beginPath();let fp=true;
  for(let i=0;i<=N*2;i++){
    const xv=na+(nb-na)*i/(N*2),rv=f1(xv);
    if(!isFinite(rv)){fp=true;continue;}
    const sx=ox+(xv-na)*xsc,sy=oy-(xv-na)*tilt-rv*rsc;
    fp?(ctx.moveTo(sx,sy),fp=false):ctx.lineTo(sx,sy);
  }
  ctx.strokeStyle="#1d4ed8";ctx.lineWidth=2;ctx.stroke();
  /* g(x) curve */
  if(expr2&&expr2.trim()&&!(fn2raw instanceof Error)&&fn2raw){
    ctx.beginPath();fp=true;
    for(let i=0;i<=N*2;i++){
      const xv=na+(nb-na)*i/(N*2),rv=f2(xv);
      if(!isFinite(rv)){fp=true;continue;}
      const sx=ox+(xv-na)*xsc,sy=oy-(xv-na)*tilt-rv*rsc;
      fp?(ctx.moveTo(sx,sy),fp=false):ctx.lineTo(sx,sy);
    }
    ctx.strokeStyle="#dc2626";ctx.lineWidth=1.5;ctx.setLineDash([5,3]);ctx.stroke();ctx.setLineDash([]);
  }
  /* x-axis baseline */
  ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox+pw,oy-pw*tilt/(xsc*(nb-na)>0?1:1));
  ctx.strokeStyle="#374151";ctx.lineWidth=1.5;ctx.stroke();
  /* label */
  ctx.fillStyle="#1d4ed8";
  ctx.font="bold "+Math.min(12,h*0.06)+"px 'Times New Roman',serif";
  ctx.textAlign="left";ctx.textBaseline="bottom";
  const lx=0.65,lxv=na+(nb-na)*lx,lsy=oy-lxv*tilt-(f1(lxv)+0.3)*rsc;
  ctx.fillText("f(x)",ox+(lxv-na)*xsc,lsy);
  ctx.restore();
}

const VOLUME_AXES=["ox","oy","sec-square","sec-circle","sec-tri","sec-semi"];

function VolumeDialog({item,onSave,onClose}){
  const r=ht();
  const isNew=!item||item.type!=="volume";
  const[expr,setExpr]=H.useState(item&&item.type==="volume"?item.expr:"sqrt(4 - x^2)");
  const[expr2,setExpr2]=H.useState(item&&item.type==="volume"?(item.expr2||""):"");
  const[axis,setAxis]=H.useState(item&&item.type==="volume"?(item.axis||"ox"):"ox");
  const[aStr,setAStr]=H.useState(item&&item.type==="volume"?String(item.a!=-null?item.a:"-2"):"-2");
  const[bStr,setBStr]=H.useState(item&&item.type==="volume"?String(item.b!=null?item.b:"2"):"2");
  const[nSlices,setNSlices]=H.useState(item&&item.type==="volume"?(item.nSlices||30):30);
  const[result,setResult]=H.useState(null);
  const[err,setErr]=H.useState("");
  const canvasRef=H.useRef(null);
  const getAB=()=>{
    const av=sh(aStr.replace(",","."));
    const bv=sh(bStr.replace(",","."));
    return{av,bv,valid:isFinite(av)&&isFinite(bv)&&bv>av};
  };
  H.useEffect(()=>{
    const cv=canvasRef.current;if(!cv)return;
    const dpr=window.devicePixelRatio||1;
    const W=470,Hc=270;
    cv.width=W*dpr;cv.height=Hc*dpr;
    const ctx=cv.getContext("2d");
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const{av,bv}=getAB();
    drawVolume3D(ctx,{x:0,y:0,w:W,h:Hc,expr,expr2,a:av,b:bv,axis,nSlices});
  });
  const handleCompute=()=>{
    setErr("");setResult(null);
    const fn=bo(expr);
    if(fn instanceof Error){setErr("Hàm f(x) không hợp lệ: "+fn.message);return;}
    const{av,bv,valid}=getAB();
    if(!valid){setErr("Cận a < b không hợp lệ.");return;}
    const vol=computeVolume(expr,expr2,av,bv,axis,nSlices);
    if(vol===null){setErr("Không tính được thể tích.");return;}
    setResult(vol);
  };
  const handleSave=()=>{
    const fn=bo(expr);
    if(fn instanceof Error){setErr("Hàm không hợp lệ.");return;}
    const{av,bv,valid}=getAB();
    const vol=valid?computeVolume(expr,expr2,av,bv,axis,nSlices):null;
    const base=item&&item.type==="volume"?item:{id:Ge(),type:"volume",x:0,y:0,w:500,h:340};
    onSave({...base,expr,expr2,axis,a:av!=null?av:-2,b:bv!=null?bv:2,nSlices,volume:vol});
  };
  const axisLabels={
    "ox":r.volAxisOx,"oy":r.volAxisOy,
    "sec-square":r.volSecSquare,"sec-circle":r.volSecCircle,
    "sec-tri":r.volSecTriEq,"sec-semi":r.volSecSemiCircle
  };
  const inputStyle={fontFamily:"monospace",padding:"6px 8px",borderRadius:"6px",border:"1.5px solid #cbd5e1",fontSize:"14px",width:"100%",boxSizing:"border-box"};
  return f.jsxs(vi,{title:r.volumeTitle,onClose,wide:true,children:[
    f.jsxs("div",{style:{display:"flex",gap:"18px",alignItems:"flex-start",flexWrap:"wrap"},children:[
      f.jsxs("div",{style:{flex:"0 0 250px",display:"flex",flexDirection:"column",gap:"10px"},children:[
        f.jsxs("label",{style:{display:"flex",flexDirection:"column",gap:"3px"},children:[
          f.jsx("span",{style:{fontWeight:"600",fontSize:"13px"},children:r.volFnLabel}),
          f.jsx("input",{value:expr,placeholder:r.volFnPlaceholder,autoFocus:true,onChange:e=>setExpr(e.target.value),style:inputStyle})
        ]}),
        f.jsxs("label",{style:{display:"flex",flexDirection:"column",gap:"3px"},children:[
          f.jsx("span",{style:{fontWeight:"600",fontSize:"13px"},children:r.volFn2Label}),
          f.jsx("input",{value:expr2,placeholder:"0",onChange:e=>setExpr2(e.target.value),style:inputStyle})
        ]}),
        f.jsxs("label",{style:{display:"flex",flexDirection:"column",gap:"3px"},children:[
          f.jsx("span",{style:{fontWeight:"600",fontSize:"13px"},children:r.volAxisLabel}),
          f.jsx("select",{value:axis,onChange:e=>setAxis(e.target.value),style:{...inputStyle,fontFamily:"system-ui"},children:
            VOLUME_AXES.map(k=>f.jsx("option",{value:k,children:axisLabels[k]},k))
          })
        ]}),
        f.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"},children:[
          f.jsxs("label",{style:{display:"flex",flexDirection:"column",gap:"3px"},children:[
            f.jsx("span",{style:{fontWeight:"600",fontSize:"13px"},children:r.volALabel}),
            f.jsx("input",{value:aStr,onChange:e=>setAStr(e.target.value),style:inputStyle})
          ]}),
          f.jsxs("label",{style:{display:"flex",flexDirection:"column",gap:"3px"},children:[
            f.jsx("span",{style:{fontWeight:"600",fontSize:"13px"},children:r.volBLabel}),
            f.jsx("input",{value:bStr,onChange:e=>setBStr(e.target.value),style:inputStyle})
          ]})
        ]}),
        f.jsxs("label",{style:{display:"flex",flexDirection:"column",gap:"3px"},children:[
          f.jsx("span",{style:{fontWeight:"600",fontSize:"12px"},children:r.volNSlices+": "+nSlices}),
          f.jsx("input",{type:"range",min:8,max:60,step:4,value:nSlices,onChange:e=>setNSlices(Number(e.target.value))})
        ]}),
        f.jsx("button",{className:"primary",onClick:handleCompute,style:{padding:"8px 16px",borderRadius:"8px",fontWeight:"600",fontSize:"14px",cursor:"pointer"},children:r.volCompute}),
        result!==null&&f.jsxs("div",{style:{background:"linear-gradient(135deg,#dbeafe,#ede9fe)",borderRadius:"10px",padding:"10px 14px",fontFamily:"monospace",fontSize:"15px",fontWeight:"bold",color:"#1e40af",boxShadow:"0 2px 8px rgba(59,130,246,0.15)"},children:[
          f.jsx("div",{style:{fontSize:"11px",color:"#6b7280",fontWeight:"normal",marginBottom:"3px"},children:"Thể tích"}),
          "V \u2248 "+fmtVolume(result)
        ]}),
        err&&f.jsx("p",{style:{color:"#dc2626",fontSize:"12px",margin:0},children:err}),
        f.jsx("p",{style:{color:"#6b7280",fontSize:"11px",margin:0,lineHeight:"1.5"},children:r.volHelp})
      ]}),
      f.jsxs("div",{style:{flex:"1 1 300px",display:"flex",flexDirection:"column",gap:"8px"},children:[
        f.jsx("div",{style:{fontSize:"12px",fontWeight:"600",color:"#374151",paddingBottom:"4px",borderBottom:"1px solid #e5e7eb"},children:"\uD83D\uDCCF Biểu diễn 3D (xấp xỉ)"}),
        f.jsx("canvas",{ref:canvasRef,style:{border:"1.5px solid #e2e8f0",borderRadius:"12px",boxShadow:"0 4px 16px rgba(0,0,0,0.08)",background:"#f0f4ff",display:"block",width:"470px",height:"270px",maxWidth:"100%"}}),
        f.jsx("p",{style:{color:"#9ca3af",fontSize:"11px",margin:0},children:"\uD83D\uDCA1 Thay đổi tham số để cập nhật hình 3D. Nhấn Xong để chèn vào sổ."})
      ]})
    ]}),
    f.jsxs("footer",{className:"dialog-actions",children:[
      f.jsx("button",{onClick:onClose,children:r.cancel}),
      f.jsx("button",{className:"primary",onClick:handleSave,children:r.done})
    ]})
  ]});
}

`;

mustReplace(AFN, volumeCode + AFN, 'VolumeDialog + helpers injection');

// ─── 6. Save ─────────────────────────────────────────────────────────────────
fs.writeFileSync('dist/assets/index-D9JME9Hm.js', js, 'utf8');
console.log('\n✅ All patches applied successfully!');
