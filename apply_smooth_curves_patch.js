const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('dist/assets/index-D9JME9Hm.js');
let code = fs.readFileSync(targetFile, 'utf8');

// Backup first
fs.writeFileSync(targetFile + '.bak_smooth', code, 'utf8');

function replaceOrThrow(target, replacement, desc) {
  if (!code.includes(target)) {
    throw new Error('Target string not found for: ' + desc);
  }
  code = code.replace(target, replacement);
  console.log('✓ Successfully replaced:', desc);
}

// 1. Upgrade N
const targetN = 'const isFastMode = !!(item._playing || item._dragging);\n  const userN = nSlices || 48;\n  const N = isFastMode ? Math.max(18, Math.min(48, Math.round(userN * 0.45))) : Math.max(16, Math.min(240, userN));';
const replN = 'const isFastMode = !!(item._playing || item._dragging);\n  const userN = nSlices || 48;\n  const N = isFastMode ? Math.max(32, Math.min(64, Math.round(userN * 0.8))) : Math.max(64, Math.min(240, Math.round(userN * 2)));';
replaceOrThrow(targetN, replN, 'N definition with higher resolution');

// 2. Revolution solid angular resolution and cosine spacing for xs
const targetRevMesh = `    // ══════ REVOLUTION SOLID (Ox or Oy) ══════
    const hue = isRevOx ? 204 : 158;
    const maxAng = isFastMode ? Math.max(20, Math.min(48, Math.round(N * 0.9))) : Math.max(24, Math.min(240, Math.max(48, Math.round(N * 1.25))));
    const nAng = sweepDeg <= 0.01 ? 0 : Math.max(12, Math.round(maxAng * (sweepDeg / 360)));

    // Pre-sample function values along x axis (N+1 points)
    const xs = new Float64Array(N + 1);
    const f1s = new Float64Array(N + 1);
    const f2s = new Float64Array(N + 1);
    for (let si = 0; si <= N; si++) {
      const xv = na + (nb - na) * si / N;
      xs[si] = xv;
      f1s[si] = f1(xv);
      f2s[si] = f2(xv);
    }`;

const replRevMesh = `    // ══════ REVOLUTION SOLID (Ox or Oy) ══════
    const hue = isRevOx ? 204 : 158;
    const maxAng = isFastMode ? Math.max(32, Math.min(64, Math.round(N * 0.9))) : Math.max(72, Math.min(240, Math.round(N * 1.5)));
    const nAng = sweepDeg <= 0.01 ? 0 : Math.max(18, Math.round(maxAng * (sweepDeg / 360)));

    // Pre-sample function values along x axis (N+1 points) with Chebyshev/Cosine spacing
    // clusters points near endpoints for silky smooth curvature (eliminates kinks at x=a,b)
    const xs = new Float64Array(N + 1);
    const f1s = new Float64Array(N + 1);
    const f2s = new Float64Array(N + 1);
    for (let si = 0; si <= N; si++) {
      const u = si / N;
      const xv = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u * Math.PI);
      xs[si] = xv;
      f1s[si] = f1(xv);
      f2s[si] = f2(xv);
    }`;
replaceOrThrow(targetRevMesh, replRevMesh, 'Revolution solid angular resolution and cosine spacing');

// 3. Cap generation with high resolution (NCap) and cosine spacing
const targetCaps = `    if (sweepDeg < 359) {
      const capAngles = sweepDeg <= 0.5 ? [0] : [0, sweepRad];
      for (const thCap of capAngles) {
        const ptsCap = [];
        let capZ = 0;
        for (let si = 0; si <= N; si++) {
          const xv = na + (nb - na) * si / N;
          const p = isRevOx
            ? project(xv, f1(xv) * Math.cos(thCap), f1(xv) * Math.sin(thCap))
            : project(xv * Math.cos(thCap), f1(xv), xv * Math.sin(thCap));
          ptsCap.push(p);
          capZ += p.z;
        }
        for (let si = N; si >= 0; si--) {
          const xv = na + (nb - na) * si / N;
          const p = isRevOx
            ? project(xv, f2(xv) * Math.cos(thCap), f2(xv) * Math.sin(thCap))
            : project(xv * Math.cos(thCap), f2(xv), xv * Math.sin(thCap));
          ptsCap.push(p);
          capZ += p.z;
        }
        const isBackCap = thCap === 0 && sweepDeg > 5;
        faces.push({
          z: capZ / ptsCap.length,
          pts: ptsCap,
          fill: thCap === 0 ? (isRevOx ? "rgba(186, 230, 253, 0.35)" : "rgba(167, 243, 208, 0.35)") : (isRevOx ? "rgba(254, 243, 199, 0.42)" : "rgba(254, 215, 170, 0.42)"),
          stroke: thCap === 0 ? (isRevOx ? "rgba(14, 165, 233, 0.85)" : "rgba(5, 150, 105, 0.85)") : (isRevOx ? "rgba(245, 158, 11, 0.9)" : "rgba(234, 88, 12, 0.9)"),
          strokeWidth: isBackCap ? 1.6 : 1.8,
          type: "cap",
          dashed: isBackCap
        });
        if (thCap > 0 && ptsCap.length > 0) {
          const midPt = ptsCap[Math.floor(ptsCap.length / 4)] || ptsCap[0];
          item._rotHandle = { x: midPt.sx - x, y: midPt.sy - y };
        }
      }
    }`;

const replCaps = `    if (sweepDeg < 359) {
      const capAngles = sweepDeg <= 0.5 ? [0] : [0, sweepRad];
      const NCap = isFastMode ? Math.max(64, N) : Math.max(160, N * 2);
      for (const thCap of capAngles) {
        const ptsCap = [];
        let capZ = 0;
        for (let si = 0; si <= NCap; si++) {
          const u = si / NCap;
          const xv = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u * Math.PI);
          const p = isRevOx
            ? project(xv, f1(xv) * Math.cos(thCap), f1(xv) * Math.sin(thCap))
            : project(xv * Math.cos(thCap), f1(xv), xv * Math.sin(thCap));
          ptsCap.push(p);
          capZ += p.z;
        }
        for (let si = NCap; si >= 0; si--) {
          const u = si / NCap;
          const xv = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u * Math.PI);
          const p = isRevOx
            ? project(xv, f2(xv) * Math.cos(thCap), f2(xv) * Math.sin(thCap))
            : project(xv * Math.cos(thCap), f2(xv), xv * Math.sin(thCap));
          ptsCap.push(p);
          capZ += p.z;
        }
        const isBackCap = thCap === 0 && sweepDeg > 5;
        faces.push({
          z: capZ / ptsCap.length,
          pts: ptsCap,
          fill: thCap === 0 ? (isRevOx ? "rgba(186, 230, 253, 0.35)" : "rgba(167, 243, 208, 0.35)") : (isRevOx ? "rgba(254, 243, 199, 0.42)" : "rgba(254, 215, 170, 0.42)"),
          stroke: thCap === 0 ? (isRevOx ? "rgba(14, 165, 233, 0.85)" : "rgba(5, 150, 105, 0.85)") : (isRevOx ? "rgba(245, 158, 11, 0.9)" : "rgba(234, 88, 12, 0.9)"),
          strokeWidth: isBackCap ? 1.6 : 1.8,
          type: "cap",
          dashed: isBackCap
        });
        if (thCap > 0 && ptsCap.length > 0) {
          const midPt = ptsCap[Math.floor(NCap / 2)] || ptsCap[0];
          item._rotHandle = { x: midPt.sx - x, y: midPt.sy - y };
        }
      }
    }`;
replaceOrThrow(targetCaps, replCaps, 'Cap generation with NCap=160 and cosine spacing');

// 4. Cross section base floor
const targetBase = `    // 1. Base floor in X-Y plane (Z = 0)
    const basePts = [];
    let baseZ = 0;
    for (let si = 0; si <= N; si++) {
      const xv = na + (nb - na) * si / N;
      const p = project(xv, f1(xv), 0);
      basePts.push(p);
      baseZ += p.z;
    }
    for (let si = N; si >= 0; si--) {
      const xv = na + (nb - na) * si / N;
      const p = project(xv, f2(xv), 0);
      basePts.push(p);
      baseZ += p.z;
    }`;

const replBase = `    // 1. Base floor in X-Y plane (Z = 0)
    const basePts = [];
    let baseZ = 0;
    const NBase = isFastMode ? Math.max(48, N) : Math.max(120, N * 2);
    for (let si = 0; si <= NBase; si++) {
      const u = si / NBase;
      const xv = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u * Math.PI);
      const p = project(xv, f1(xv), 0);
      basePts.push(p);
      baseZ += p.z;
    }
    for (let si = NBase; si >= 0; si--) {
      const u = si / NBase;
      const xv = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u * Math.PI);
      const p = project(xv, f2(xv), 0);
      basePts.push(p);
      baseZ += p.z;
    }`;
replaceOrThrow(targetBase, replBase, 'Cross-section base floor with NBase=120 and cosine spacing');

// 5. Continuous lofted cross section
const targetLoft = `      // ── Continuous Lofted 3D Solid ──
      for (let si = 0; si < N; si++) {
        const x0 = na + (nb - na) * si / N;
        const x1 = na + (nb - na) * (si + 1) / N;`;

const replLoft = `      // ── Continuous Lofted 3D Solid ──
      for (let si = 0; si < N; si++) {
        const u0 = si / N, u1 = (si + 1) / N;
        const x0 = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u0 * Math.PI);
        const x1 = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u1 * Math.PI);`;
replaceOrThrow(targetLoft, replLoft, 'Continuous lofted cross-section cosine spacing');

// 6. Revolution circle/arc smoothness
const targetArc = `    const drawRevolutionArc = (coord, rOuter, strokeCol) => {
      if (rOuter <= 0.05) return;
      const nSteps = Math.max(36, Math.min(120, Math.round(N * 1.5)));`;

const replArc = `    const drawRevolutionArc = (coord, rOuter, strokeCol) => {
      if (rOuter <= 0.05) return;
      const nSteps = isFastMode ? Math.max(48, Math.min(96, Math.round(N * 1.2))) : Math.max(72, Math.min(180, Math.round(N * 2)));`;
replaceOrThrow(targetArc, replArc, 'Revolution arc nSteps');

const targetGhost = 'const nGhost = Math.max(16, Math.round(48 * (1 - sweepDeg / 360)));';
const replGhost = 'const nGhost = isFastMode ? Math.max(24, Math.round(48 * (1 - sweepDeg / 360))) : Math.max(48, Math.round(96 * (1 - sweepDeg / 360)));';
replaceOrThrow(targetGhost, replGhost, 'Ghost revolution arc nGhost');

// 7. Section 5 2D boundary curves
const target2D = `    ctx.beginPath();
    let first = true;
    for (let si = 0; si <= N * 2; si++) {
      const xv = na + (nb - na) * si / (N * 2);
      const rv = f1(xv);
      const p = project(xv, rv, 0);
      if (first) { ctx.moveTo(p.sx, p.sy); first = false; }
      else ctx.lineTo(p.sx, p.sy);
    }
    ctx.strokeStyle = "#1d4ed8";
    ctx.lineWidth = 2.2;
    ctx.stroke();

    if (expr2 && expr2.trim() && !(fn2raw instanceof Error) && fn2raw) {
      ctx.beginPath();
      first = true;
      for (let si = 0; si <= N * 2; si++) {
        const xv = na + (nb - na) * si / (N * 2);
        const rv = f2(xv);
        const p = project(xv, rv, 0);
        if (first) { ctx.moveTo(p.sx, p.sy); first = false; }
        else ctx.lineTo(p.sx, p.sy);
      }
      ctx.strokeStyle = "#dc2626";
      ctx.lineWidth = 1.6;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }`;

const repl2D = `    const N2D = isFastMode ? 60 : 160;
    ctx.beginPath();
    let first = true;
    for (let si = 0; si <= N2D; si++) {
      const u = si / N2D;
      const xv = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u * Math.PI);
      const rv = f1(xv);
      const p = project(xv, rv, 0);
      if (first) { ctx.moveTo(p.sx, p.sy); first = false; }
      else ctx.lineTo(p.sx, p.sy);
    }
    ctx.strokeStyle = "#1d4ed8";
    ctx.lineWidth = 2.2;
    ctx.stroke();

    if (expr2 && expr2.trim() && !(fn2raw instanceof Error) && fn2raw) {
      ctx.beginPath();
      first = true;
      for (let si = 0; si <= N2D; si++) {
        const u = si / N2D;
        const xv = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u * Math.PI);
        const rv = f2(xv);
        const p = project(xv, rv, 0);
        if (first) { ctx.moveTo(p.sx, p.sy); first = false; }
        else ctx.lineTo(p.sx, p.sy);
      }
      ctx.strokeStyle = "#dc2626";
      ctx.lineWidth = 1.6;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }`;
replaceOrThrow(target2D, repl2D, '2D boundary curves in section 5');

// 8. getCrossSectionShape higher steps
const targetCrossShape = `  } else if (secType === "sec-semi") {
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
    const steps = 18;`;

const replCrossShape = `  } else if (secType === "sec-semi") {
    const R = hw;
    const pts = [];
    const steps = 32;
    for (let i = 0; i <= steps; i++) {
      const ang = (i / steps) * Math.PI;
      pts.push({ u: -R * Math.cos(ang), v: R * Math.sin(ang) });
    }
    return pts;
  } else if (secType === "sec-circle") {
    const R = hw;
    const pts = [];
    const steps = 40;`;
replaceOrThrow(targetCrossShape, replCrossShape, 'getCrossSectionShape steps (32 and 40)');

fs.writeFileSync(targetFile, code, 'utf8');
console.log('Successfully wrote updated dist/assets/index-D9JME9Hm.js');
