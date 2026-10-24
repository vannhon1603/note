const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('dist/assets/index-D9JME9Hm.js');
let code = fs.readFileSync(targetFile, 'utf8');

// Backup
fs.writeFileSync(targetFile + '.bak_axes', code, 'utf8');

const targetAxes = `  // ─── 2. Draw Axes (Ox, Oy, Oz) ───────────────────────────────────
  const oxStart = project(Math.min(na - 1, -1), 0, 0);
  const oxEnd = project(nb + 1.2, 0, 0);
  const oyStart = project(0, -0.2, 0);
  const oyEnd = project(0, maxVal * 1.32 + 0.5, 0);
  const ozStart = project(0, 0, -boundR * 1.2);
  const ozEnd = project(0, 0, boundR * 1.35);

  // Ox
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
  }

  // Oz (depth axis)
  ctx.beginPath(); ctx.moveTo(ozStart.sx, ozStart.sy); ctx.lineTo(ozEnd.sx, ozEnd.sy);
  ctx.strokeStyle = isCross ? "#0891b2" : "#cbd5e1";
  ctx.lineWidth = isCross ? 1.6 : 1;
  ctx.stroke();

  // Bound marks a and b on Ox
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

  // Bound marks a and b on Ox (dynamically suppress if cut coordinate is close to prevent overlapping)
  ctx.fillStyle = "#1e293b";
  ctx.font = "bold 11px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const cutVal = isRev ? (item.cutCoord ?? activeCutX) : activeCutX;
  const hideA = isCross && Math.abs(cutVal - na) < 0.45;
  const hideB = isCross && Math.abs(cutVal - nb) < 0.45;
  if (!hideA) ctx.fillText("a=" + na, pa.sx + perpX * 14, pa.sy + perpY * 14);
  if (!hideB) ctx.fillText("b=" + nb, pb.sx + perpX * 14, pb.sy + perpY * 14);`;

const replacementAxes = `  // ─── 2. Draw Coordinate Axes (Ox, Oy, Oz) chuẩn SGK Toán 12 ───────────────────────────
  const oxStart = project(Math.min(na - 1.2, -1.2), 0, 0);
  const oxEnd = project(nb + 1.4, 0, 0);
  const oyStart = project(0, Math.min(-0.8, -boundR * 0.45), 0);
  const oyEnd = project(0, Math.max(maxVal * 1.38 + 0.6, boundR * 1.38), 0);
  const ozStart = project(0, 0, -boundR * 1.2);
  const ozEnd = project(0, 0, boundR * 1.4);
  const pOrigin = project(0, 0, 0);

  // Helper: Draw crisp, elegant math arrowhead (mũi tên trục chuẩn SGK)
  const drawAxisArrow = (pFrom, pTo, color, len = 11, halfW = 4.2) => {
    const dx = pTo.sx - pFrom.sx, dy = pTo.sy - pFrom.sy;
    const d = Math.hypot(dx, dy) || 1;
    const ux = dx / d, uy = dy / d;
    const nx = -uy, ny = ux;
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(pTo.sx, pTo.sy);
    ctx.lineTo(pTo.sx - len * ux + halfW * nx, pTo.sy - len * uy + halfW * ny);
    ctx.lineTo(pTo.sx - (len * 0.78) * ux, pTo.sy - (len * 0.78) * uy);
    ctx.lineTo(pTo.sx - len * ux - halfW * nx, pTo.sy - len * uy - halfW * ny);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  const colOx = isRevOx || isCross ? "#2563eb" : "#3b82f6";
  const colOy = isRevOy ? "#059669" : "#2563eb";
  const colOz = isCross ? "#0891b2" : "#64748b";

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // ── Axis Ox ──
  if (isRevOx && sweepDeg > 5 && nb > na) {
    const pa = project(na, 0, 0);
    const pb = project(nb, 0, 0);
    // Before a (outside - solid)
    if (Math.hypot(oxStart.sx - pa.sx, oxStart.sy - pa.sy) > 1) {
      ctx.beginPath(); ctx.moveTo(oxStart.sx, oxStart.sy); ctx.lineTo(pa.sx, pa.sy);
      ctx.strokeStyle = colOx; ctx.lineWidth = 2.0; ctx.stroke();
    }
    // Inside solid [a, b] (hidden part - nét đứt chuẩn SGK)
    ctx.save();
    ctx.beginPath(); ctx.moveTo(pa.sx, pa.sy); ctx.lineTo(pb.sx, pb.sy);
    ctx.strokeStyle = colOx; ctx.lineWidth = 1.8;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.restore();
    // After b (outside - solid)
    if (Math.hypot(pb.sx - oxEnd.sx, pb.sy - oxEnd.sy) > 1) {
      ctx.beginPath(); ctx.moveTo(pb.sx, pb.sy); ctx.lineTo(oxEnd.sx, oxEnd.sy);
      ctx.strokeStyle = colOx; ctx.lineWidth = 2.0; ctx.stroke();
    }
  } else {
    ctx.beginPath(); ctx.moveTo(oxStart.sx, oxStart.sy); ctx.lineTo(oxEnd.sx, oxEnd.sy);
    ctx.strokeStyle = colOx;
    ctx.lineWidth = isRevOx || isCross ? 2.0 : 1.4;
    ctx.stroke();
  }
  // Mũi tên trục Ox
  drawAxisArrow(oxStart, oxEnd, colOx, 11, 4.2);

  // ── Axis Oy ──
  if (isRevOy && sweepDeg > 5 && maxVal > 0) {
    const py0 = project(0, Math.min(0, na), 0);
    const py1 = project(0, maxVal, 0);
    // Below solid (outside - solid)
    if (Math.hypot(oyStart.sx - py0.sx, oyStart.sy - py0.sy) > 1) {
      ctx.beginPath(); ctx.moveTo(oyStart.sx, oyStart.sy); ctx.lineTo(py0.sx, py0.sy);
      ctx.strokeStyle = colOy; ctx.lineWidth = 2.0; ctx.stroke();
    }
    // Inside solid (hidden part - nét đứt)
    ctx.save();
    ctx.beginPath(); ctx.moveTo(py0.sx, py0.sy); ctx.lineTo(py1.sx, py1.sy);
    ctx.strokeStyle = colOy; ctx.lineWidth = 1.8;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.restore();
    // Above solid (outside - solid)
    if (Math.hypot(py1.sx - oyEnd.sx, py1.sy - oyEnd.sy) > 1) {
      ctx.beginPath(); ctx.moveTo(py1.sx, py1.sy); ctx.lineTo(oyEnd.sx, oyEnd.sy);
      ctx.strokeStyle = colOy; ctx.lineWidth = 2.0; ctx.stroke();
    }
  } else {
    ctx.beginPath(); ctx.moveTo(oyStart.sx, oyStart.sy); ctx.lineTo(oyEnd.sx, oyEnd.sy);
    ctx.strokeStyle = colOy;
    ctx.lineWidth = isRevOy ? 2.0 : 1.4;
    ctx.stroke();
  }
  // Mũi tên trục Oy
  drawAxisArrow(oyStart, oyEnd, colOy, 11, 4.2);

  // ── Axis Oz (chiều sâu không gian Oxyz) ──
  // Phần âm (nửa trục sau - nét đứt thanh nhã)
  ctx.save();
  ctx.beginPath(); ctx.moveTo(pOrigin.sx, pOrigin.sy); ctx.lineTo(ozStart.sx, ozStart.sy);
  ctx.strokeStyle = isCross ? "rgba(8, 145, 178, 0.45)" : "rgba(148, 163, 184, 0.4)";
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 3]);
  ctx.stroke();
  ctx.restore();

  // Phần dương (hướng về phía trước - nét liền kèm mũi tên)
  ctx.beginPath(); ctx.moveTo(pOrigin.sx, pOrigin.sy); ctx.lineTo(ozEnd.sx, ozEnd.sy);
  ctx.strokeStyle = colOz;
  ctx.lineWidth = isCross ? 1.6 : 1.2;
  ctx.stroke();
  // Mũi tên trục Oz
  drawAxisArrow(pOrigin, ozEnd, colOz, 10, 3.8);

  // Gốc tọa độ O (nếu không bị điểm cắt đè)
  const cutVal = isRev ? (item.cutCoord ?? activeCutX) : activeCutX;
  if (!isCross || Math.abs(cutVal) > 0.35) {
    ctx.save();
    ctx.font = "italic bold 12px 'Times New Roman', serif";
    ctx.fillStyle = "#334155";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("O", pOrigin.sx - 4, pOrigin.sy + 3);
    ctx.restore();
  }

  // ── Nhãn trục (Labels) & Mốc chia đoạn [a, b] ──
  const pa = project(na, 0, 0);
  const pb = project(nb, 0, 0);

  // Hướng trục Ox trên màn hình 2D
  const vOxX = oxEnd.sx - pb.sx, vOxY = oxEnd.sy - pb.sy;
  const vOxLen = Math.hypot(vOxX, vOxY) || 1;
  const uOxX = vOxX / vOxLen, uOxY = vOxY / vOxLen;
  const perpX = -uOxY, perpY = uOxX;

  // Hướng trục Oy
  const vOyX = oyEnd.sx - oyStart.sx, vOyY = oyEnd.sy - oyStart.sy;
  const vOyLen = Math.hypot(vOyX, vOyY) || 1;
  const uOyX = vOyX / vOyLen, uOyY = vOyY / vOyLen;

  // Hướng trục Oz
  const vOzX = ozEnd.sx - pOrigin.sx, vOzY = ozEnd.sy - pOrigin.sy;
  const vOzLen = Math.hypot(vOzX, vOzY) || 1;
  const uOzX = vOzX / vOzLen, uOzY = vOzY / vOzLen;

  // Nhãn các trục x, y, z chuẩn ký hiệu SGK Toán
  ctx.font = "italic bold 13.5px 'Times New Roman', serif";
  ctx.fillStyle = colOx;
  ctx.textAlign = uOxX >= 0 ? "left" : "right";
  ctx.textBaseline = "middle";
  ctx.fillText("x (Ox)", oxEnd.sx + uOxX * 16, oxEnd.sy + uOxY * 16);

  ctx.fillStyle = colOy;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("y (Oy)", oyEnd.sx + uOyX * 16, oyEnd.sy + uOyY * 16);

  if (isCross) {
    ctx.fillStyle = colOz;
    ctx.textAlign = uOzX >= 0 ? "left" : "right";
    ctx.textBaseline = "top";
    ctx.fillText("z (Oz)", ozEnd.sx + uOzX * 14, ozEnd.sy + uOzY * 14);
  }

  // Vạch chia & nhãn mốc a, b trên Ox (kèm vạch tick đánh dấu chuẩn SGK)
  const hideA = isCross && Math.abs(cutVal - na) < 0.45;
  const hideB = isCross && Math.abs(cutVal - nb) < 0.45;
  ctx.save();
  ctx.font = "bold 11px system-ui, sans-serif";
  ctx.fillStyle = "#1e293b";
  ctx.strokeStyle = colOx;
  ctx.lineWidth = 1.4;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (!hideA) {
    ctx.beginPath();
    ctx.moveTo(pa.sx - perpX * 3.5, pa.sy - perpY * 3.5);
    ctx.lineTo(pa.sx + perpX * 3.5, pa.sy + perpY * 3.5);
    ctx.stroke();
    ctx.fillText("a=" + na, pa.sx + perpX * 14, pa.sy + perpY * 14);
  }
  if (!hideB) {
    ctx.beginPath();
    ctx.moveTo(pb.sx - perpX * 3.5, pb.sy - perpY * 3.5);
    ctx.lineTo(pb.sx + perpX * 3.5, pb.sy + perpY * 3.5);
    ctx.stroke();
    ctx.fillText("b=" + nb, pb.sx + perpX * 14, pb.sy + perpY * 14);
  }
  ctx.restore();`;

if (!code.includes(targetAxes)) {
  throw new Error('Target axes block not found in bundle!');
}

code = code.replace(targetAxes, replacementAxes);
fs.writeFileSync(targetFile, code, 'utf8');
console.log('✓ Successfully updated axes with arrows, refined strokes, and SGK styling!');
