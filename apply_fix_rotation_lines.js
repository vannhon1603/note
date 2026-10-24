const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('dist/assets/index-D9JME9Hm.js');
let code = fs.readFileSync(targetFile, 'utf8');

// Backup
fs.writeFileSync(targetFile + '.bak_rot_lines', code, 'utf8');

function replaceOrThrow(target, replacement, desc) {
  if (!code.includes(target)) {
    throw new Error('Target string not found for: ' + desc);
  }
  code = code.replace(target, replacement);
  console.log('✓ Successfully replaced:', desc);
}

// 1. Fix equator arc condition: only for full revolution (isFullRev) and NOT in cross-section mode (!isCross)
const targetEquator = `    // C. Equator / Maximum radius circle (e.g. for sphere where ra=0, rb=0)
    let rMax = 0, xMax = na;
    for (let si = 0; si <= 40; si++) {
      const xv = na + (nb - na) * (si / 40);
      const rv = Math.max(Math.abs(f1(xv)), Math.abs(f2(xv)));
      if (rv > rMax) { rMax = rv; xMax = xv; }
    }
    if (rMax > 0.15 && ((ra <= 0.08 && rb <= 0.08) || rMax > 1.25 * Math.max(ra, rb))) {
      drawRevolutionArc(xMax, rMax, circCol);
    }`;

const replEquator = `    // C. Equator / Maximum radius circle (only for FULL 360° sphere and not in cross-section slice mode)
    let rMax = 0, xMax = na;
    for (let si = 0; si <= 40; si++) {
      const xv = na + (nb - na) * (si / 40);
      const rv = Math.max(Math.abs(f1(xv)), Math.abs(f2(xv)));
      if (rv > rMax) { rMax = rv; xMax = xv; }
    }
    if (isFullRev && !isCross && rMax > 0.15 && ((ra <= 0.08 && rb <= 0.08) || rMax > 1.25 * Math.max(ra, rb))) {
      drawRevolutionArc(xMax, rMax, circCol);
    }`;
replaceOrThrow(targetEquator, replEquator, 'Equator circle arc only when isFullRev && !isCross');

// 2. Fix Axis and Bound Label Collision
const targetAxisLabels = `  // Axis Labels
  ctx.font = "bold 13px 'Times New Roman', serif";
  ctx.fillStyle = isRevOx || isCross ? "#2563eb" : "#475569";
  ctx.fillText("x (Ox)", oxEnd.sx + 4, oxEnd.sy - 2);
  ctx.fillStyle = isRevOy ? "#059669" : "#475569";
  ctx.fillText("y (Oy)", oyEnd.sx + 4, oyEnd.sy);
  if (isCross) {
    ctx.fillStyle = "#0891b2";
    ctx.fillText("z (Oz)", ozEnd.sx + 4, ozEnd.sy);
  }

  // Bound marks a and b on Ox
  const pa = project(na, 0, 0);
  const pb = project(nb, 0, 0);
  ctx.fillStyle = "#1e293b";
  ctx.font = "11px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("a=" + na, pa.sx, pa.sy + 14);
  ctx.fillText("b=" + nb, pb.sx, pb.sy + 14);`;

const replAxisLabels = `  // Bound marks a and b on Ox
  const pa = project(na, 0, 0);
  const pb = project(nb, 0, 0);

  // Compute screen direction of Ox axis to place labels cleanly without collision
  const vOxX = oxEnd.sx - pb.sx, vOxY = oxEnd.sy - pb.sy;
  const vOxLen = Math.hypot(vOxX, vOxY) || 1;
  const uOxX = vOxX / vOxLen, uOxY = vOxY / vOxLen;
  const perpX = -uOxY, perpY = uOxX;

  // Axis Labels
  ctx.font = "bold 13px 'Times New Roman', serif";
  ctx.fillStyle = isRevOx || isCross ? "#2563eb" : "#475569";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("x (Ox)", oxEnd.sx + uOxX * 10, oxEnd.sy + uOxY * 10);
  ctx.fillStyle = isRevOy ? "#059669" : "#475569";
  ctx.fillText("y (Oy)", oyEnd.sx + 4, oyEnd.sy);
  if (isCross) {
    ctx.fillStyle = "#0891b2";
    ctx.fillText("z (Oz)", ozEnd.sx + 4, ozEnd.sy);
  }

  // Bound marks a and b on Ox (offset perpendicularly to axis so they NEVER collide with x (Ox))
  ctx.fillStyle = "#1e293b";
  ctx.font = "bold 11px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("a=" + na, pa.sx + perpX * 14, pa.sy + perpY * 14);
  ctx.fillText("b=" + nb, pb.sx + perpX * 14, pb.sy + perpY * 14);`;
replaceOrThrow(targetAxisLabels, replAxisLabels, 'Clean non-colliding axis and bound labels');

// 3. Dynamic cap visibility & stroke only outer arch (preserving dashed axis)
const targetCapPush = `        const isBackCap = thCap === 0 && sweepDeg > 5;
        faces.push({
          z: capZ / ptsCap.length,
          pts: ptsCap,
          fill: thCap === 0 ? (isRevOx ? "rgba(186, 230, 253, 0.35)" : "rgba(167, 243, 208, 0.35)") : (isRevOx ? "rgba(254, 243, 199, 0.42)" : "rgba(254, 215, 170, 0.42)"),
          stroke: thCap === 0 ? (isRevOx ? "rgba(14, 165, 233, 0.85)" : "rgba(5, 150, 105, 0.85)") : (isRevOx ? "rgba(245, 158, 11, 0.9)" : "rgba(234, 88, 12, 0.9)"),
          strokeWidth: isBackCap ? 1.6 : 1.8,
          type: "cap",
          dashed: isBackCap
        });`;

const replCapPush = `        // Dynamic normal calculation for cap to determine front vs back visibility when camera rotates
        const normZ_cap = isRevOx
          ? (thCap === 0
              ? -Math.cos(yaw) * Math.cos(pitch)
              : (-Math.sin(thCap) * Math.sin(pitch) + Math.cos(thCap) * Math.cos(yaw) * Math.cos(pitch)))
          : (thCap === 0
              ? Math.sin(yaw)
              : (-Math.sin(thCap) * Math.cos(yaw) + Math.cos(thCap) * Math.sin(yaw)));
        const isBackCap = sweepDeg > 5 && (thCap === 0 || normZ_cap < -0.05);
        faces.push({
          z: capZ / ptsCap.length,
          pts: ptsCap,
          fill: thCap === 0 ? (isRevOx ? "rgba(186, 230, 253, 0.35)" : "rgba(167, 243, 208, 0.35)") : (isRevOx ? "rgba(254, 243, 199, 0.42)" : "rgba(254, 215, 170, 0.42)"),
          stroke: thCap === 0 ? (isRevOx ? "rgba(14, 165, 233, 0.85)" : "rgba(5, 150, 105, 0.85)") : (isRevOx ? "rgba(245, 158, 11, 0.9)" : "rgba(234, 88, 12, 0.9)"),
          strokeWidth: isBackCap ? 1.6 : 1.8,
          type: "cap",
          dashed: isBackCap,
          nArch: NCap,
          hasInner: Boolean(expr2 && expr2.trim() && !(fn2raw instanceof Error))
        });`;
replaceOrThrow(targetCapPush, replCapPush, 'Dynamic cap visibility and nArch metadata');

// 4. In Section 4 Painter loop, stroke only the outer arch of the cap, preserving dashed internal axis
const targetFaceStroke = `    if (face.stroke && (!isFastMode || face.type === "cap" || face.type === "riemann-face")) {
      ctx.save();
      if (face.dashed) {
        ctx.setLineDash([5, 4]); // Nét đứt cho mặt khuất!
      }
      ctx.strokeStyle = face.stroke;
      ctx.lineWidth = face.strokeWidth || 0.4;
      ctx.stroke();
      ctx.restore();
    }`;

const replFaceStroke = `    if (face.stroke && (!isFastMode || face.type === "cap" || face.type === "riemann-face")) {
      ctx.save();
      if (face.dashed) {
        ctx.setLineDash([5, 4]); // Nét đứt cho mặt khuất!
      }
      ctx.strokeStyle = face.stroke;
      ctx.lineWidth = face.strokeWidth || 0.4;
      if (face.type === "cap" && face.nArch) {
        // Stroke only the curved arch of the cap, so the dashed rotation axis inside [a, b] is preserved!
        ctx.beginPath();
        ctx.moveTo(pts[0].sx, pts[0].sy);
        for (let k = 1; k <= face.nArch; k++) ctx.lineTo(pts[k].sx, pts[k].sy);
        ctx.stroke();
        if (face.hasInner && pts.length > face.nArch * 2) {
          ctx.beginPath();
          ctx.moveTo(pts[face.nArch + 1].sx, pts[face.nArch + 1].sy);
          for (let k = face.nArch + 2; k < pts.length; k++) ctx.lineTo(pts[k].sx, pts[k].sy);
          ctx.stroke();
        }
      } else {
        ctx.stroke();
      }
      ctx.restore();
    }`;
replaceOrThrow(targetFaceStroke, replFaceStroke, 'Cap strokes only the arch, preserving dashed axis');

fs.writeFileSync(targetFile, code, 'utf8');
console.log('Successfully wrote updated dist/assets/index-D9JME9Hm.js');
