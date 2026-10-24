const fs = require('fs');

const path = 'dist/assets/index-D9JME9Hm.js';
let js = fs.readFileSync(path, 'utf8');

// Backup
fs.writeFileSync(path + '.bak_before_dashed', js, 'utf8');

function mustReplace(target, replacement, label) {
  const count = js.split(target).length - 1;
  if (count !== 1) {
    throw new Error(`Target for "${label}" found ${count} times (expected exactly 1).`);
  }
  js = js.replace(target, replacement);
  console.log(`✓ Patched: ${label}`);
}

// ─── 1. Ox and Oy Axes: inside solid [a, b] is dashed line (nét đứt) ───
const oldAxes = `  // Ox
  ctx.beginPath(); ctx.moveTo(oxStart.sx, oxStart.sy); ctx.lineTo(oxEnd.sx, oxEnd.sy);
  ctx.strokeStyle = isRevOx || isCross ? "#2563eb" : "#64748b";
  ctx.lineWidth = isRevOx || isCross ? 2.2 : 1.2;
  ctx.stroke();

  // Oy
  ctx.beginPath(); ctx.moveTo(oyStart.sx, oyStart.sy); ctx.lineTo(oyEnd.sx, oyEnd.sy);
  ctx.strokeStyle = isRevOy ? "#059669" : "#64748b";
  ctx.lineWidth = isRevOy ? 2.2 : 1.2;
  ctx.stroke();`;

const newAxes = `  // Ox
  if (isRevOx && sweepDeg > 5 && nb > na) {
    const pa = project(na, 0, 0);
    const pb = project(nb, 0, 0);
    // Before a (outside - solid)
    if (Math.hypot(oxStart.sx - pa.sx, oxStart.sy - pa.sy) > 1) {
      ctx.beginPath(); ctx.moveTo(oxStart.sx, oxStart.sy); ctx.lineTo(pa.sx, pa.sy);
      ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2.2; ctx.stroke();
    }
    // Inside solid [a, b] (hidden part - nét đứt!)
    ctx.save();
    ctx.beginPath(); ctx.moveTo(pa.sx, pa.sy); ctx.lineTo(pb.sx, pb.sy);
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2.0;
    ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.restore();
    // After b (outside - solid)
    if (Math.hypot(pb.sx - oxEnd.sx, pb.sy - oxEnd.sy) > 1) {
      ctx.beginPath(); ctx.moveTo(pb.sx, pb.sy); ctx.lineTo(oxEnd.sx, oxEnd.sy);
      ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 2.2; ctx.stroke();
    }
  } else {
    ctx.beginPath(); ctx.moveTo(oxStart.sx, oxStart.sy); ctx.lineTo(oxEnd.sx, oxEnd.sy);
    ctx.strokeStyle = isRevOx || isCross ? "#2563eb" : "#64748b";
    ctx.lineWidth = isRevOx || isCross ? 2.2 : 1.2;
    ctx.stroke();
  }

  // Oy
  if (isRevOy && sweepDeg > 5 && maxVal > 0) {
    const py0 = project(0, Math.min(0, na), 0);
    const py1 = project(0, maxVal, 0);
    // Below solid (outside - solid)
    if (Math.hypot(oyStart.sx - py0.sx, oyStart.sy - py0.sy) > 1) {
      ctx.beginPath(); ctx.moveTo(oyStart.sx, oyStart.sy); ctx.lineTo(py0.sx, py0.sy);
      ctx.strokeStyle = "#059669"; ctx.lineWidth = 2.2; ctx.stroke();
    }
    // Inside solid (hidden part - nét đứt!)
    ctx.save();
    ctx.beginPath(); ctx.moveTo(py0.sx, py0.sy); ctx.lineTo(py1.sx, py1.sy);
    ctx.strokeStyle = "#059669"; ctx.lineWidth = 2.0;
    ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.restore();
    // Above solid (outside - solid)
    if (Math.hypot(py1.sx - oyEnd.sx, py1.sy - oyEnd.sy) > 1) {
      ctx.beginPath(); ctx.moveTo(py1.sx, py1.sy); ctx.lineTo(oyEnd.sx, oyEnd.sy);
      ctx.strokeStyle = "#059669"; ctx.lineWidth = 2.2; ctx.stroke();
    }
  } else {
    ctx.beginPath(); ctx.moveTo(oyStart.sx, oyStart.sy); ctx.lineTo(oyEnd.sx, oyEnd.sy);
    ctx.strokeStyle = isRevOy ? "#059669" : "#64748b";
    ctx.lineWidth = isRevOy ? 2.2 : 1.2;
    ctx.stroke();
  }`;

mustReplace(oldAxes, newAxes, 'Ox and Oy axes with dashed segment inside solid');

// ─── 2. Cap at theta = 0: marked as dashed when sweepDeg > 5 ───
const oldCapPush = `        faces.push({
          z: capZ / ptsCap.length,
          pts: ptsCap,
          fill: thCap === 0 ? (isRevOx ? "rgba(186, 230, 253, 0.35)" : "rgba(167, 243, 208, 0.35)") : (isRevOx ? "rgba(254, 243, 199, 0.42)" : "rgba(254, 215, 170, 0.42)"),
          stroke: thCap === 0 ? (isRevOx ? "rgba(14, 165, 233, 0.85)" : "rgba(5, 150, 105, 0.85)") : (isRevOx ? "rgba(245, 158, 11, 0.9)" : "rgba(234, 88, 12, 0.9)"),
          strokeWidth: 1.8,
          type: "cap"
        });`;

const newCapPush = `        const isBackCap = thCap === 0 && sweepDeg > 5;
        faces.push({
          z: capZ / ptsCap.length,
          pts: ptsCap,
          fill: thCap === 0 ? (isRevOx ? "rgba(186, 230, 253, 0.35)" : "rgba(167, 243, 208, 0.35)") : (isRevOx ? "rgba(254, 243, 199, 0.42)" : "rgba(254, 215, 170, 0.42)"),
          stroke: thCap === 0 ? (isRevOx ? "rgba(14, 165, 233, 0.85)" : "rgba(5, 150, 105, 0.85)") : (isRevOx ? "rgba(245, 158, 11, 0.9)" : "rgba(234, 88, 12, 0.9)"),
          strokeWidth: isBackCap ? 1.6 : 1.8,
          type: "cap",
          dashed: isBackCap
        });`;

mustReplace(oldCapPush, newCapPush, 'cap at theta=0 dashed property');

// ─── 3. Painter face stroke: respect face.dashed ───
const oldFaceStroke = `    if (face.stroke && (!isFastMode || face.type === "cap" || face.type === "riemann-face")) {
      ctx.strokeStyle = face.stroke;
      ctx.lineWidth = face.strokeWidth || 0.4;
      ctx.stroke();
    }`;

const newFaceStroke = `    if (face.stroke && (!isFastMode || face.type === "cap" || face.type === "riemann-face")) {
      ctx.save();
      if (face.dashed) {
        ctx.setLineDash([5, 4]); // Nét đứt cho mặt khuất!
      }
      ctx.strokeStyle = face.stroke;
      ctx.lineWidth = face.strokeWidth || 0.4;
      ctx.stroke();
      ctx.restore();
    }`;

mustReplace(oldFaceStroke, newFaceStroke, 'painter face stroke support for dashed');

// ─── 4. Revolution Circles & Sweep Arcs (Base circles & Equator / Parallel circles) ───
const oldSec5Start = '  // ─── 5. Draw 2D Boundary Curves in Base ───────────────────────────';

const revolutionCirclesCode = `  // ─── 4b. Draw Revolution Circles & Arcs (Front = Solid, Hidden = Dashed) ───
  if (isRev && sweepDeg > 5) {
    const isRevY = currentAxis === "oy" || currentAxis === "sec-oy";
    const curSweepRad = sweepDeg >= 355 ? Math.PI * 2 : sweepRad;
    const isFullRev = sweepDeg >= 355;

    // Helper to draw a circular arc/circle with visible part = solid, hidden part = dashed
    const drawRevolutionArc = (coord, rOuter, strokeCol) => {
      if (rOuter <= 0.05) return;
      const nSteps = Math.max(36, Math.min(120, Math.round(N * 1.5)));

      // 1. Swept arc [0, curSweepRad]
      let curVis = null;
      let curPts = [];
      for (let i = 0; i <= nSteps; i++) {
        const phi = (i / nSteps) * curSweepRad;
        const cosA = Math.cos(phi), sinA = Math.sin(phi);
        const pt = isRevY ? project(rOuter * cosA, coord, rOuter * sinA) : project(coord, rOuter * cosA, rOuter * sinA);

        const normX = isRevY ? cosA : 0;
        const normY = isRevY ? 0 : cosA;
        const normZ = sinA;
        const nx1 = normX * Math.cos(yaw) + normZ * Math.sin(yaw);
        const nz1 = -normX * Math.sin(yaw) + normZ * Math.cos(yaw);
        const ny1 = normY * Math.cos(pitch) - nz1 * Math.sin(pitch);
        const nz2 = normY * Math.sin(pitch) + nz1 * Math.cos(pitch);
        const isVis = nz2 >= 0;

        if (curVis === null) {
          curVis = isVis;
          curPts.push(pt);
        } else if (isVis === curVis) {
          curPts.push(pt);
        } else {
          curPts.push(pt);
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(curPts[0].sx, curPts[0].sy);
          for (let k = 1; k < curPts.length; k++) ctx.lineTo(curPts[k].sx, curPts[k].sy);
          ctx.strokeStyle = strokeCol;
          ctx.lineWidth = 1.6;
          if (!curVis) ctx.setLineDash([5, 4]); // NÉT ĐỨT CHO PHẦN KHUẤT!
          ctx.stroke();
          ctx.restore();
          curVis = isVis;
          curPts = [pt];
        }
      }
      if (curPts.length > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(curPts[0].sx, curPts[0].sy);
        for (let k = 1; k < curPts.length; k++) ctx.lineTo(curPts[k].sx, curPts[k].sy);
        ctx.strokeStyle = strokeCol;
        ctx.lineWidth = 1.6;
        if (!curVis) ctx.setLineDash([5, 4]); // NÉT ĐỨT CHO PHẦN KHUẤT!
        ctx.stroke();
        ctx.restore();
      }

      // 2. Un-swept ghost trajectory [curSweepRad, 2*PI] if not full circle
      if (!isFullRev) {
        const nGhost = Math.max(16, Math.round(48 * (1 - sweepDeg / 360)));
        const ghostPts = [];
        for (let gi = 0; gi <= nGhost; gi++) {
          const phi = curSweepRad + (gi / nGhost) * (Math.PI * 2 - curSweepRad);
          const cosA = Math.cos(phi), sinA = Math.sin(phi);
          const pt = isRevY ? project(rOuter * cosA, coord, rOuter * sinA) : project(coord, rOuter * cosA, rOuter * sinA);
          ghostPts.push(pt);
        }
        if (ghostPts.length > 1) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(ghostPts[0].sx, ghostPts[0].sy);
          for (let k = 1; k < ghostPts.length; k++) ctx.lineTo(ghostPts[k].sx, ghostPts[k].sy);
          ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
          ctx.lineWidth = 1.2;
          ctx.setLineDash([4, 3]); // NÉT ĐỨT!
          ctx.stroke();
          ctx.restore();
        }
      }
    };

    const circCol = isRevY ? "rgba(5, 150, 105, 0.85)" : "rgba(37, 99, 235, 0.85)";

    // A. Base circle at na
    const ra = Math.max(Math.abs(f1(na)), Math.abs(f2(na)));
    if (ra > 0.08) drawRevolutionArc(na, ra, circCol);

    // B. Base circle at nb
    const rb = Math.max(Math.abs(f1(nb)), Math.abs(f2(nb)));
    if (rb > 0.08) drawRevolutionArc(nb, rb, circCol);

    // C. Equator / Maximum radius circle (e.g. for sphere where ra=0, rb=0)
    let rMax = 0, xMax = na;
    for (let si = 0; si <= 40; si++) {
      const xv = na + (nb - na) * (si / 40);
      const rv = Math.max(Math.abs(f1(xv)), Math.abs(f2(xv)));
      if (rv > rMax) { rMax = rv; xMax = xv; }
    }
    if (rMax > 0.15 && ((ra <= 0.08 && rb <= 0.08) || rMax > 1.25 * Math.max(ra, rb))) {
      drawRevolutionArc(xMax, rMax, circCol);
    }
  }

  // ─── 5. Draw 2D Boundary Curves in Base ───────────────────────────`;

mustReplace(oldSec5Start, revolutionCirclesCode, 'revolution circles and arcs with front=solid back=dashed');

fs.writeFileSync(path, js, 'utf8');
console.log('\n🎉 Successfully applied dashed hidden parts patch!');
