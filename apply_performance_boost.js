const fs = require('fs');

const path = 'dist/assets/index-D9JME9Hm.js';
let js = fs.readFileSync(path, 'utf8');

console.log('Original js length:', js.length);

// ─── 1. Optimize toggleVolAnim (stop flooding React state on every frame) ───
const oldAnimStart = 'function toggleVolAnim(ee, page, item) {';
const oldAnimEnd = '    _volAnimId = requestAnimationFrame(loop);\n  }\n}';
const oldAnimIdx = js.indexOf(oldAnimStart);
const oldAnimEndIdx = js.indexOf(oldAnimEnd, oldAnimIdx);

if (oldAnimIdx === -1 || oldAnimEndIdx === -1) {
  console.error('Could not find toggleVolAnim');
  process.exit(1);
}

const oldAnimChunk = js.slice(oldAnimIdx, oldAnimEndIdx + oldAnimEnd.length);

const newAnimChunk = `function toggleVolAnim(ee, page, item) {
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
    let sweep = (targetIt.sweepAngle ?? 360) >= 355 ? 0 : (targetIt.sweepAngle ?? 0);
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

js = js.replace(oldAnimChunk, newAnimChunk);
console.log('✓ toggleVolAnim optimized: runs directly on canvas without React state churn');

// ─── 2. Mark _dragging in selectDown, move, and up ─────────────────
// In move:
const oldVolSweepMove = 'case"volSweep":{';
const newVolSweepMove = `case"volSweep":{
    const it=this.doc.pages[s.page].items.find(x=>x.id===s.id);
    if(it) it._dragging=true;`;

if (js.indexOf('if(it) it._dragging=true;') === -1) {
  js = js.replace(oldVolSweepMove, newVolSweepMove);
  console.log('✓ Marked _dragging in volSweep move');
}

const oldVolOrbitMove = 'case"volOrbit":{';
const newVolOrbitMove = `case"volOrbit":{
    const it=this.doc.pages[s.page].items.find(x=>x.id===s.id);
    if(it) it._dragging=true;`;

if (js.indexOf('case"volOrbit":{\n    const it=this.doc.pages[s.page].items.find(x=>x.id===s.id);\n    if(it) it._dragging=true;') === -1) {
  js = js.replace(oldVolOrbitMove, newVolOrbitMove);
  console.log('✓ Marked _dragging in volOrbit move');
}

// In up: clear _dragging
const oldUpVol = 'case"volCut":case"volOrbit":case"volSweep":{';
const newUpVol = `case"volCut":case"volOrbit":case"volSweep":{
    const it=this.doc.pages[r.page].items.find(x=>x.id===r.id);
    this.drag=null;
    if(it){ it._dragging=false; this.commit(this.updatePage(r.page,p=>({...p,items:p.items.map(x=>x.id===it.id?{...it}:x)}))); }
    this.redraw();this.emit();return;
  }
  case"_oldUpDummy":{`;

const oldUpBlock = 'case"volCut":case"volOrbit":case"volSweep":{const it=this.doc.pages[r.page].items.find(x=>x.id===r.id);this.drag=null;if(it){this.commit(this.updatePage(r.page,p=>({...p,items:p.items.map(x=>x.id===it.id?{...it}:x)})));}this.redraw();this.emit();return;}';

if (js.indexOf(oldUpBlock) !== -1) {
  const cleanNewUp = 'case"volCut":case"volOrbit":case"volSweep":{const it=this.doc.pages[r.page].items.find(x=>x.id===r.id);this.drag=null;if(it){it._dragging=false;this.commit(this.updatePage(r.page,p=>({...p,items:p.items.map(x=>x.id===it.id?{...it}:x)})));}this.redraw();this.emit();return;}';
  js = js.replace(oldUpBlock, cleanNewUp);
  console.log('✓ Cleared _dragging in up(t)');
}

// ─── 3. Optimize drawVolume3D: Dynamic LOD & Pre-sampling ──────────
// Find resolution settings in drawVolume3D
const oldResTarget = 'const N = Math.max(16, Math.min(48, nSlices || 24));\n  const sweepDeg = Math.max(0, Math.min(360, sweepAngle != null ? sweepAngle : 360));\n  const sweepRad = (sweepDeg * Math.PI) / 180;';

const newResTarget = `const isFastMode = !!(item._playing || item._dragging);
  const N = isFastMode ? Math.max(12, Math.min(18, Math.round((nSlices || 24) * 0.6))) : Math.max(16, Math.min(26, nSlices || 22));
  const sweepDeg = Math.max(0, Math.min(360, sweepAngle != null ? sweepAngle : 360));
  const sweepRad = (sweepDeg * Math.PI) / 180;`;

if (js.indexOf(oldResTarget) !== -1) {
  js = js.replace(oldResTarget, newResTarget);
  console.log('✓ Added dynamic LOD to drawVolume3D');
}

// Pre-sample xs, f1s, f2s for revolution
const oldRevLoopStart = 'const hue = isRevOx ? 218 : 162;\n    const nAng = Math.max(12, Math.round(36 * (sweepDeg / 360)));';
const newRevLoopStart = `const hue = isRevOx ? 218 : 162;
    const nAng = isFastMode ? Math.max(10, Math.round(18 * (sweepDeg / 360))) : Math.max(12, Math.round(28 * (sweepDeg / 360)));

    // Pre-sample function values along x axis (N+1 points)
    const xs = new Float64Array(N + 1);
    const f1s = new Float64Array(N + 1);
    const f2s = new Float64Array(N + 1);
    for (let si = 0; si <= N; si++) {
      const xv = na + (nb - na) * si / N;
      xs[si] = xv;
      f1s[si] = f1(xv);
      f2s[si] = f2(xv);
    }

    // Pre-sample trigonometric values for all angles
    const cosTh = new Float64Array(nAng + 1);
    const sinTh = new Float64Array(nAng + 1);
    for (let ai = 0; ai <= nAng; ai++) {
      const th = (ai / nAng) * sweepRad;
      cosTh[ai] = Math.cos(th);
      sinTh[ai] = Math.sin(th);
    }`;

if (js.indexOf(oldRevLoopStart) !== -1) {
  js = js.replace(oldRevLoopStart, newRevLoopStart);
  console.log('✓ Pre-sampling added for revolution');
}

// Optimize inside the revolution inner loop:
const oldInnerRev = `const x0 = na + (nb - na) * si / N;
        const x1 = na + (nb - na) * (si + 1) / N;

        const ro0 = isRevOx ? Math.max(Math.abs(f1(x0)), Math.abs(f2(x0))) : f1(x0);
        const ro1 = isRevOx ? Math.max(Math.abs(f1(x1)), Math.abs(f2(x1))) : f1(x1);
        const ri0 = isRevOx ? Math.min(Math.abs(f1(x0)), Math.abs(f2(x0))) : f2(x0);
        const ri1 = isRevOx ? Math.min(Math.abs(f1(x1)), Math.abs(f2(x1))) : f2(x1);

        const get3D = (xv, rv, th) => {
          if (isRevOx) {
            return { X: xv, Y: rv * Math.cos(th), Z: rv * Math.sin(th) };
          } else {
            return { X: xv * Math.cos(th), Y: rv, Z: xv * Math.sin(th) };
          }
        };

        const pt00 = get3D(x0, ro0, th0);
        const pt10 = get3D(x1, ro1, th0);
        const pt11 = get3D(x1, ro1, th1);
        const pt01 = get3D(x0, ro0, th1);`;

const newInnerRev = `const x0 = xs[si], x1 = xs[si + 1];
        const ro0 = isRevOx ? Math.max(Math.abs(f1s[si]), Math.abs(f2s[si])) : f1s[si];
        const ro1 = isRevOx ? Math.max(Math.abs(f1s[si + 1]), Math.abs(f2s[si + 1])) : f1s[si + 1];
        const ri0 = isRevOx ? Math.min(Math.abs(f1s[si]), Math.abs(f2s[si])) : f2s[si];
        const ri1 = isRevOx ? Math.min(Math.abs(f1s[si + 1]), Math.abs(f2s[si + 1])) : f2s[si + 1];

        const c0 = cosTh[ai], s0 = sinTh[ai];
        const c1 = cosTh[ai + 1], s1 = sinTh[ai + 1];

        const pt00 = isRevOx ? { X: x0, Y: ro0 * c0, Z: ro0 * s0 } : { X: x0 * c0, Y: ro0, Z: x0 * s0 };
        const pt10 = isRevOx ? { X: x1, Y: ro1 * c0, Z: ro1 * s0 } : { X: x1 * c0, Y: ro1, Z: x1 * s0 };
        const pt11 = isRevOx ? { X: x1, Y: ro1 * c1, Z: ro1 * s1 } : { X: x1 * c1, Y: ro1, Z: x1 * s1 };
        const pt01 = isRevOx ? { X: x0, Y: ro0 * c1, Z: ro0 * s1 } : { X: x0 * c1, Y: ro0, Z: x0 * s1 };`;

if (js.indexOf(oldInnerRev) !== -1) {
  js = js.replace(oldInnerRev, newInnerRev);
  console.log('✓ Inner revolution loop optimized with pre-sampled buffers');
}

// Inner radius points in revolution
const oldInnerPtRev = `const ipt00 = get3D(x0, ri0, th0);
          const ipt10 = get3D(x1, ri1, th0);
          const ipt11 = get3D(x1, ri1, th1);
          const ipt01 = get3D(x0, ri0, th1);`;

const newInnerPtRev = `const ipt00 = isRevOx ? { X: x0, Y: ri0 * c0, Z: ri0 * s0 } : { X: x0 * c0, Y: ri0, Z: x0 * s0 };
          const ipt10 = isRevOx ? { X: x1, Y: ri1 * c0, Z: ri1 * s0 } : { X: x1 * c0, Y: ri1, Z: x1 * s0 };
          const ipt11 = isRevOx ? { X: x1, Y: ri1 * c1, Z: ri1 * s1 } : { X: x1 * c1, Y: ri1, Z: x1 * s1 };
          const ipt01 = isRevOx ? { X: x0, Y: ri0 * c1, Z: ri0 * s1 } : { X: x0 * c1, Y: ri0, Z: x0 * s1 };`;

if (js.indexOf(oldInnerPtRev) !== -1) {
  js = js.replace(oldInnerPtRev, newInnerPtRev);
  console.log('✓ Inner radius points optimized');
}

// Optimize canvas stroke during fast mode
const oldStrokeCond = 'if (face.stroke) {\n      ctx.strokeStyle = face.stroke;\n      ctx.lineWidth = face.strokeWidth || 0.4;\n      ctx.stroke();\n    }';
const newStrokeCond = 'if (face.stroke && (!isFastMode || face.type === "cap" || face.type === "riemann-face")) {\n      ctx.strokeStyle = face.stroke;\n      ctx.lineWidth = face.strokeWidth || 0.4;\n      ctx.stroke();\n    }';

if (js.indexOf(oldStrokeCond) !== -1) {
  js = js.replace(oldStrokeCond, newStrokeCond);
  console.log('✓ Canvas stroke calls optimized during motion');
}

fs.writeFileSync(path, js, 'utf8');
console.log('Done! All performance optimizations applied successfully');
