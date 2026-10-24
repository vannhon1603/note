const fs = require('fs');

const path = 'dist/assets/index-D9JME9Hm.js';
let js = fs.readFileSync(path, 'utf8');

// 1. Replace volumeSimpsons and computeVolume with 100% mathematically correct logic
const oldSimpsonsStart = 'function volumeSimpsons(fv,a,b,n){';
const oldSimpsonsIdx = js.indexOf(oldSimpsonsStart);
if (oldSimpsonsIdx === -1) {
  console.error('Could not find volumeSimpsons');
  process.exit(1);
}

// Find end of computeVolume
const oldCompVolEnd = 'const vol=volumeSimpsons(integrand,a,b,(N||30)*100);\n  return isFinite(vol)?vol:null;\n}';
const oldCompVolEndIdx = js.indexOf(oldCompVolEnd, oldSimpsonsIdx);
if (oldCompVolEndIdx === -1) {
  console.error('Could not find oldCompVolEnd');
  process.exit(1);
}
const oldChunk1 = js.slice(oldSimpsonsIdx, oldCompVolEndIdx + oldCompVolEnd.length);

const newChunk1 = `function volumeSimpsons(fv,a,b,n){
  if(n%2!==0)n++;
  const h=(b-a)/n;
  let fa=fv(a);
  if(!isFinite(fa))fa=fv(a+1e-6*(b-a));
  let fb=fv(b);
  if(!isFinite(fb))fb=fv(b-1e-6*(b-a));
  let sum=(isFinite(fa)?fa:0)+(isFinite(fb)?fb:0);
  for(let i=1;i<n;i++){
    const x=a+i*h;
    let fx=fv(x);
    if(!isFinite(fx))fx=fv(x+1e-7*(b-a));
    if(!isFinite(fx))continue;
    sum+=(i%2===0?2:4)*fx;
  }
  return(h/3)*sum;
}

function computeVolume(expr,expr2,a,b,axis,N){
  const fn=bo(expr);if(fn instanceof Error)return null;
  const fn2raw=expr2&&expr2.trim()?bo(expr2):null;
  if(fn2raw instanceof Error)return null;
  const f1=x=>{const v=fn(x);return Number.isFinite(v)?v:0;};
  const g2=fn2raw?(x=>{const v=fn2raw(x);return Number.isFinite(v)?v:0;}):(()=>0);
  let integrand;
  if(axis==="ox"){integrand=x=>Math.PI*Math.abs(f1(x)*f1(x)-g2(x)*g2(x));}
  else if(axis==="oy"){integrand=x=>2*Math.PI*Math.abs(x)*Math.abs(f1(x)-g2(x));}
  else if(axis==="sec-square"){integrand=x=>{const s=Math.abs(f1(x)-g2(x));return s*s;};}
  else if(axis==="sec-circle"){integrand=x=>{const d=Math.abs(f1(x)-g2(x));return(Math.PI/4)*d*d;};}
  else if(axis==="sec-tri"){integrand=x=>{const s=Math.abs(f1(x)-g2(x));return(Math.sqrt(3)/4)*s*s;};}
  else if(axis==="sec-semi"){integrand=x=>{const d=Math.abs(f1(x)-g2(x));return(Math.PI/8)*d*d;};}
  else if(axis==="sec-tri-right"){integrand=x=>{const s=Math.abs(f1(x)-g2(x));return 0.5*s*s;};}
  else if(axis==="sec-tri-iso"){integrand=x=>{const s=Math.abs(f1(x)-g2(x));return 0.25*s*s;};}
  else return null;
  const vol=volumeSimpsons(integrand,a,b,(N||30)*100);
  return isFinite(vol)?vol:null;
}`;

js = js.replace(oldChunk1, newChunk1);
console.log('Chunk 1 replaced successfully');

// 2. Replace getCrossSectionShape and computeCrossArea
const oldCrossShapeStart = '/** Helper: Generate 2D cross-section profile points (u, v) around perimeter */\nfunction getCrossSectionShape(secType, baseW) {';
const oldCrossShapeIdx = js.indexOf(oldCrossShapeStart);
const oldCrossAreaEnd = 'if (secType === "sec-tri-right") return 0.5 * baseW * baseW;\n  return baseW * baseW;\n}';
const oldCrossAreaEndIdx = js.indexOf(oldCrossAreaEnd, oldCrossShapeIdx);
if (oldCrossShapeIdx === -1 || oldCrossAreaEndIdx === -1) {
  console.error('Could not find cross shape/area');
  process.exit(1);
}
const oldChunk2 = js.slice(oldCrossShapeIdx, oldCrossAreaEndIdx + oldCrossAreaEnd.length);

const newChunk2 = `/** Helper: Generate 2D cross-section profile points (u, v) around perimeter */
function getCrossSectionShape(secType, baseW) {
  const hw = baseW / 2;
  if (secType === "sec-square") {
    return [
      { u: -hw, v: 0 },
      { u: hw, v: 0 },
      { u: hw, v: baseW },
      { u: -hw, v: baseW }
    ];
  } else if (secType === "sec-tri") {
    const H = (Math.sqrt(3) / 2) * baseW;
    return [
      { u: -hw, v: 0 },
      { u: hw, v: 0 },
      { u: 0, v: H }
    ];
  } else if (secType === "sec-semi") {
    const R = hw;
    const pts = [];
    const steps = 14;
    for (let i = 0; i <= steps; i++) {
      const ang = (i / steps) * Math.PI;
      pts.push({ u: -R * Math.cos(ang), v: R * Math.sin(ang) });
    }
    return pts;
  } else if (secType === "sec-circle") {
    const R = hw;
    const pts = [];
    const steps = 18;
    for (let i = 0; i <= steps; i++) {
      const ang = (i / steps) * Math.PI * 2;
      pts.push({ u: R * Math.cos(ang), v: hw + R * Math.sin(ang) });
    }
    return pts;
  } else if (secType === "sec-tri-iso") {
    // Tam giác vuông cân cạnh huyền trên đáy: đỉnh tại (0, hw), diện tích 0.25*baseW^2
    return [
      { u: -hw, v: 0 },
      { u: hw, v: 0 },
      { u: 0, v: hw }
    ];
  } else {
    // sec-tri-right: Tam giác vuông cân cạnh góc vuông trên đáy: diện tích 0.5*baseW^2
    return [
      { u: -hw, v: 0 },
      { u: hw, v: 0 },
      { u: -hw, v: baseW }
    ];
  }
}

/** Compute cross sectional area S(x) */
function computeCrossArea(secType, baseW) {
  if (baseW <= 0.0001) return 0;
  if (secType === "sec-square") return baseW * baseW;
  if (secType === "sec-tri") return (Math.sqrt(3) / 4) * baseW * baseW;
  if (secType === "sec-semi") return (Math.PI / 8) * baseW * baseW;
  if (secType === "sec-circle") return (Math.PI / 4) * baseW * baseW;
  if (secType === "sec-tri-iso") return 0.25 * baseW * baseW;
  if (secType === "sec-tri-right") return 0.5 * baseW * baseW;
  return baseW * baseW;
}`;

js = js.replace(oldChunk2, newChunk2);
console.log('Chunk 2 replaced successfully');

// 3. Update drawVolume3D for f1 and f2 sampling and 3D revolution/lofting
const oldF1F2 = 'const fn2raw = expr2 && expr2.trim() ? bo(expr2) : null;\n  const f1 = xv => Math.max(0, fn(xv));\n  const f2 = (fn2raw instanceof Error || !fn2raw) ? (() => 0) : (xv => Math.max(0, fn2raw(xv)));';
const newF1F2 = 'const fn2raw = expr2 && expr2.trim() ? bo(expr2) : null;\n  const f1 = xv => { const v = fn(xv); return Number.isFinite(v) ? v : 0; };\n  const f2 = (fn2raw instanceof Error || !fn2raw) ? (() => 0) : (xv => { const v = fn2raw(xv); return Number.isFinite(v) ? v : 0; });';

if (js.indexOf(oldF1F2) !== -1) {
  js = js.replace(oldF1F2, newF1F2);
  console.log('f1/f2 sampling replaced successfully');
} else {
  console.warn('oldF1F2 not found');
}

// In drawVolume3D: update revolution radii ro0, ro1, ri0, ri1
const oldRoRi = 'const ro0 = f1(x0), ro1 = f1(x1);\n        const ri0 = f2(x0), ri1 = f2(x1);';
const newRoRi = 'const ro0 = isRevOx ? Math.max(Math.abs(f1(x0)), Math.abs(f2(x0))) : f1(x0);\n        const ro1 = isRevOx ? Math.max(Math.abs(f1(x1)), Math.abs(f2(x1))) : f1(x1);\n        const ri0 = isRevOx ? Math.min(Math.abs(f1(x0)), Math.abs(f2(x0))) : f2(x0);\n        const ri1 = isRevOx ? Math.min(Math.abs(f1(x1)), Math.abs(f2(x1))) : f2(x1);';

if (js.indexOf(oldRoRi) !== -1) {
  js = js.replace(oldRoRi, newRoRi);
  console.log('ro0/ri0 revolution radii replaced successfully');
} else {
  console.warn('oldRoRi not found');
}

// In drawVolume3D: update cross section widths w0, w1, cutW
const oldW0W1 = 'const w0 = Math.max(0, f1(x0) - f2(x0));\n        const w1 = Math.max(0, f1(x1) - f2(x1));';
const newW0W1 = 'const w0 = Math.abs(f1(x0) - f2(x0));\n        const w1 = Math.abs(f1(x1) - f2(x1));';
if (js.indexOf(oldW0W1) !== -1) {
  js = js.replace(oldW0W1, newW0W1);
  console.log('w0/w1 replaced successfully');
}

const oldCutW = 'const cutW = Math.max(0, f1(activeCutX) - f2(activeCutX));';
const newCutW = 'const cutW = Math.abs(f1(activeCutX) - f2(activeCutX));';
if (js.indexOf(oldCutW) !== -1) {
  js = js.replace(oldCutW, newCutW);
  console.log('cutW replaced successfully');
}

const oldCapCw = 'const cw = Math.max(0, f1(capX) - f2(capX));';
const newCapCw = 'const cw = Math.abs(f1(capX) - f2(capX));';
if (js.indexOf(oldCapCw) !== -1) {
  js = js.replace(oldCapCw, newCapCw);
  console.log('cap cw replaced successfully');
}

const oldRiemannBw = 'const bW = Math.max(0, f1(xM) - f2(xM));';
const newRiemannBw = 'const bW = Math.abs(f1(xM) - f2(xM));';
if (js.indexOf(oldRiemannBw) !== -1) {
  js = js.replace(oldRiemannBw, newRiemannBw);
  console.log('riemann bW replaced successfully');
}

// Formula card overlay badge
const oldBadgeElse = 'badgeTitle = "⊿ Mặt cắt: Tam giác vuông";\n    formulaShort = "V = (1/2) ∫ [f - g]² dx";';
const newBadgeElse = `if (currentAxis === "sec-tri-iso") {
    badgeTitle = "⊿ Mặt cắt: Tam giác vuông cân (cạnh huyền)";
    formulaShort = "V = (1/4) ∫ [f - g]² dx";
  } else {
    badgeTitle = "⊿ Mặt cắt: Tam giác vuông cân (cạnh góc vuông)";
    formulaShort = "V = (1/2) ∫ [f - g]² dx";
  }`;

if (js.indexOf(oldBadgeElse) !== -1) {
  js = js.replace(oldBadgeElse, newBadgeElse);
  console.log('badgeElse replaced successfully');
}

// 4. Update VOLUME_AXES
const oldVolAxes = 'const VOLUME_AXES=["ox","oy","sec-square","sec-tri","sec-semi","sec-circle","sec-tri-right"];';
const newVolAxes = 'const VOLUME_AXES=["ox","oy","sec-square","sec-tri","sec-semi","sec-circle","sec-tri-right","sec-tri-iso"];';
if (js.indexOf(oldVolAxes) !== -1) {
  js = js.replace(oldVolAxes, newVolAxes);
  console.log('VOLUME_AXES updated');
}

// 5. Update axisLabels in VolumeDialog
const oldAxisLabels = '"sec-tri":r.volSecTriEq,"sec-semi":r.volSecSemiCircle,"sec-tri-right":r.volSecTriRight||"Mặt cắt: tam giác vuông cân"';
const newAxisLabels = '"sec-tri":r.volSecTriEq,"sec-semi":r.volSecSemiCircle,"sec-tri-right":"Mặt cắt: tam giác vuông cân (cạnh góc vuông)","sec-tri-iso":"Mặt cắt: tam giác vuông cân (cạnh huyền đáy)"';
if (js.indexOf(oldAxisLabels) !== -1) {
  js = js.replace(oldAxisLabels, newAxisLabels);
  console.log('axisLabels in VolumeDialog updated');
}

// 6. Update selection bar buttons
const oldSelBtn = 'f.jsx("button",{className:curAx==="sec-tri-right"?"on":"",title:"Mặt cắt tam giác vuông cân",onClick:()=>setAxis("sec-tri-right"),children:"⊿ Vuông cân"})';
const newSelBtn = 'f.jsx("button",{className:curAx==="sec-tri-right"?"on":"",title:"Mặt cắt tam giác vuông cân (cạnh góc vuông trên đáy)",onClick:()=>setAxis("sec-tri-right"),children:"⊿ Góc vuông"}),f.jsx("button",{className:curAx==="sec-tri-iso"?"on":"",title:"Mặt cắt tam giác vuông cân (cạnh huyền trên đáy)",onClick:()=>setAxis("sec-tri-iso"),children:"⊿ Huyền đáy"})';
if (js.indexOf(oldSelBtn) !== -1) {
  js = js.replace(oldSelBtn, newSelBtn);
  console.log('Selection bar buttons updated');
}

fs.writeFileSync(path, js, 'utf8');
console.log('Done! All updates written to dist/assets/index-D9JME9Hm.js');
