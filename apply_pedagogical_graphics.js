const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('dist/assets/index-D9JME9Hm.js');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Backup original before pedagogical patch
fs.writeFileSync(targetFile + '.bak_pedagogical', code, 'utf8');

console.log('--- Applying Pedagogical Graphics Enhancements for Students ---');

// ── Target 1: Axes colors and styling (Slate dark instead of blue) ──
const oldAxesColors = `  const colOx = "#1d4ed8";
  const colOy = "#1d4ed8";
  const colOz = "#334155";`;

const newAxesColors = `  const colOx = "#1e293b"; // Slate-800: Rõ nét, không lẫn với đồ thị hay mặt khối tròn xoay
  const colOy = "#1e293b";
  const colOz = "#475569";`;

if (code.includes(oldAxesColors)) {
  code = code.replace(oldAxesColors, newAxesColors);
  console.log('✓ Target 1: Updated axes colors to slate dark (#1e293b)');
} else {
  console.log('✗ Target 1 not found');
}

// ── Target 2: Dashed axis inside solid & Boundary drop lines [a, b] ──
// Let's inspect the inside dashed line for Ox:
const oldOxDashed = `    // Inside solid [a, b] (hidden part - nét đứt chuẩn SGK)
    ctx.save();
    ctx.beginPath(); ctx.moveTo(pa.sx, pa.sy); ctx.lineTo(pb.sx, pb.sy);
    ctx.strokeStyle = colOx; ctx.lineWidth = 1.8;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.restore();`;

const newOxDashed = `    // Inside solid [a, b] (hidden part - nét đứt chuẩn SGK không gian)
    ctx.save();
    ctx.beginPath(); ctx.moveTo(pa.sx, pa.sy); ctx.lineTo(pb.sx, pb.sy);
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 1.8;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.restore();`;

if (code.includes(oldOxDashed)) {
  code = code.replace(oldOxDashed, newOxDashed);
  console.log('✓ Target 2a: Updated inside Ox hidden dashed stroke');
}

// Add boundary vertical drop lines at x = a and x = b in Section 2:
const oldTickMarks = `  // Vạch chia & nhãn mốc a, b trên Ox (kèm vạch tick đánh dấu chuẩn SGK)
  const hideA = isCross && Math.abs(cutVal - na) < 0.45;
  const hideB = isCross && Math.abs(cutVal - nb) < 0.45;
  ctx.save();
  ctx.font = "bold 11px system-ui, sans-serif";
  ctx.fillStyle = "#0f172a";
  ctx.strokeStyle = colOx;
  ctx.lineWidth = 1.6;
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

const newTickMarks = `  // Vạch chia & nhãn mốc a, b trên Ox (kèm vạch dóng nét đứt chuẩn SGK Toán 12)
  const hideA = isCross && Math.abs(cutVal - na) < 0.45;
  const hideB = isCross && Math.abs(cutVal - nb) < 0.45;
  ctx.save();
  ctx.font = "bold 11.5px system-ui, sans-serif";
  ctx.fillStyle = "#0f172a";
  ctx.strokeStyle = colOx;
  ctx.lineWidth = 1.6;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Dóng biên nét đứt từ trục Ox lên đồ thị hàm số tại x = a và x = b
  if (isRevOx) {
    const raVal = Math.abs(f1(na));
    if (raVal > 0.05) {
      const pCurveA = project(na, raVal, 0);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pa.sx, pa.sy);
      ctx.lineTo(pCurveA.sx, pCurveA.sy);
      ctx.strokeStyle = "rgba(71, 85, 105, 0.65)";
      ctx.lineWidth = 1.3;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(pCurveA.sx, pCurveA.sy, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = "#2563eb";
      ctx.fill();
      ctx.restore();
    }
    const rbVal = Math.abs(f1(nb));
    if (rbVal > 0.05) {
      const pCurveB = project(nb, rbVal, 0);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pb.sx, pb.sy);
      ctx.lineTo(pCurveB.sx, pCurveB.sy);
      ctx.strokeStyle = "rgba(71, 85, 105, 0.65)";
      ctx.lineWidth = 1.3;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(pCurveB.sx, pCurveB.sy, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = "#2563eb";
      ctx.fill();
      ctx.restore();
    }
  }

  if (!hideA) {
    ctx.beginPath();
    ctx.moveTo(pa.sx - perpX * 4, pa.sy - perpY * 4);
    ctx.lineTo(pa.sx + perpX * 4, pa.sy + perpY * 4);
    ctx.stroke();
    ctx.fillText("a=" + na, pa.sx + perpX * 14, pa.sy + perpY * 14);
  }
  if (!hideB) {
    ctx.beginPath();
    ctx.moveTo(pb.sx - perpX * 4, pb.sy - perpY * 4);
    ctx.lineTo(pb.sx + perpX * 4, pb.sy + perpY * 4);
    ctx.stroke();
    ctx.fillText("b=" + nb, pb.sx + perpX * 14, pb.sy + perpY * 14);
  }
  ctx.restore();`;

if (code.includes(oldTickMarks)) {
  code = code.replace(oldTickMarks, newTickMarks);
  console.log('✓ Target 2b: Added boundary vertical drop lines at a and b');
} else {
  console.log('✗ Target 2b not found');
}

// ── Target 3: Equator / Latitude circle always drawn (not just when isFullRev) ──
const oldEquator = `    // C. Equator / Maximum radius circle (only for FULL 360° sphere and not in cross-section slice mode)
    let rMax = 0, xMax = na;
    for (let si = 0; si <= 40; si++) {
      const xv = na + (nb - na) * (si / 40);
      const rv = Math.max(Math.abs(f1(xv)), Math.abs(f2(xv)));
      if (rv > rMax) { rMax = rv; xMax = xv; }
    }
    if (isFullRev && !isCross && rMax > 0.15 && ((ra <= 0.08 && rb <= 0.08) || rMax > 1.25 * Math.max(ra, rb))) {
      drawRevolutionArc(xMax, rMax, circCol);
    }`;

const newEquator = `    // C. Equator / Maximum radius circle (chuẩn hình học không gian SGK Toán 12, hỗ trợ mọi góc quay)
    let rMax = 0, xMax = na;
    for (let si = 0; si <= 40; si++) {
      const xv = na + (nb - na) * (si / 40);
      const rv = Math.max(Math.abs(f1(xv)), Math.abs(f2(xv)));
      if (rv > rMax) { rMax = rv; xMax = xv; }
    }
    if (!isCross && rMax > 0.15 && ((ra <= 0.08 && rb <= 0.08) || rMax > 1.25 * Math.max(ra, rb))) {
      drawRevolutionArc(xMax, rMax, circCol);
    }`;

if (code.includes(oldEquator)) {
  code = code.replace(oldEquator, newEquator);
  console.log('✓ Target 3: Equator circle enabled for all sweep angles');
} else {
  console.log('✗ Target 3 not found');
}

// ── Target 4: Permanent 2D region (H) reference in Oxy plane ──
const oldSec5 = `  // ─── 5. Draw 2D Boundary Curves in Base ───────────────────────────
  if (!isSecRev && (!isRev || sweepDeg <= 5)) {
    if (isRev && sweepDeg <= 5) {
      const midX = (na + nb) / 2;
      const midY = (f1(midX) + f2(midX)) / 2;
      const pH = project(midX, isRevOx ? midY : 0, isRevOx ? 0 : midY);
      ctx.save();
      ctx.fillStyle = isRevOx ? "#1d4ed8" : "#047857";
      ctx.font = "italic bold 14px 'Times New Roman', serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("(H)", pH.sx, pH.sy);
      ctx.restore();
    }
    const N2D = isFastMode ? 60 : 160;
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
    }
  }`;

const newSec5 = `  // ─── 5. Draw 2D Boundary Curves in Base & Permanent (H) Reference Sheet ──
  if (!isSecRev) {
    const isInitial2D = !isRev || sweepDeg <= 5;
    const N2D = isFastMode ? 48 : 120;

    // A. Fill miền phẳng (H) trong mặt phẳng Oxy để học sinh luôn thấy hình phẳng gốc sinh ra khối 3D
    ctx.save();
    ctx.beginPath();
    // Đường cong f1
    for (let si = 0; si <= N2D; si++) {
      const u = si / N2D;
      const xv = na + (nb - na) * u;
      const rv = f1(xv);
      const p = isRevOy ? project(rv, xv, 0) : project(xv, rv, 0);
      if (si === 0) ctx.moveTo(p.sx, p.sy);
      else ctx.lineTo(p.sx, p.sy);
    }
    // Đường cong f2 hoặc trục
    const hasF2 = expr2 && expr2.trim() && !(fn2raw instanceof Error) && fn2raw;
    for (let si = N2D; si >= 0; si--) {
      const u = si / N2D;
      const xv = na + (nb - na) * u;
      const rv = hasF2 ? f2(xv) : 0;
      const p = isRevOy ? project(rv, xv, 0) : project(xv, rv, 0);
      ctx.lineTo(p.sx, p.sy);
    }
    ctx.closePath();
    ctx.fillStyle = isInitial2D ? "rgba(37, 99, 235, 0.14)" : "rgba(37, 99, 235, 0.06)";
    ctx.fill();
    ctx.restore();

    // B. Đường cong hàm số chính y = f(x)
    ctx.save();
    ctx.beginPath();
    for (let si = 0; si <= N2D; si++) {
      const u = si / N2D;
      const xv = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u * Math.PI);
      const rv = f1(xv);
      const p = isRevOy ? project(rv, xv, 0) : project(xv, rv, 0);
      if (si === 0) ctx.moveTo(p.sx, p.sy);
      else ctx.lineTo(p.sx, p.sy);
    }
    ctx.strokeStyle = isInitial2D ? "#2563eb" : "rgba(37, 99, 235, 0.75)";
    ctx.lineWidth = isInitial2D ? 2.5 : 1.6;
    if (!isInitial2D) ctx.setLineDash([5, 4]); // Nét đứt biểu thị hình phẳng (H) tham chiếu gốc khi quay 3D
    ctx.stroke();
    ctx.restore();

    // C. Đường giới hạn phụ y = g(x) nếu có
    if (hasF2) {
      ctx.save();
      ctx.beginPath();
      for (let si = 0; si <= N2D; si++) {
        const u = si / N2D;
        const xv = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u * Math.PI);
        const rv = f2(xv);
        const p = isRevOy ? project(rv, xv, 0) : project(xv, rv, 0);
        if (si === 0) ctx.moveTo(p.sx, p.sy);
        else ctx.lineTo(p.sx, p.sy);
      }
      ctx.strokeStyle = isInitial2D ? "#dc2626" : "rgba(220, 38, 38, 0.65)";
      ctx.lineWidth = isInitial2D ? 2.0 : 1.4;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.restore();
    }

    // D. Huy hiệu ký hiệu miền phẳng (H)
    const midX = (na + nb) / 2;
    const midY = (f1(midX) + (hasF2 ? f2(midX) : 0)) / 2;
    const pH = isRevOy ? project(midY, midX, 0) : project(midX, midY, 0);
    ctx.save();
    ctx.font = isInitial2D ? "italic bold 15px 'Times New Roman', serif" : "italic bold 12px 'Times New Roman', serif";
    ctx.fillStyle = isInitial2D ? "#1e40af" : "rgba(30, 64, 175, 0.70)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("(H)", pH.sx, pH.sy);
    ctx.restore();
  }`;

if (code.includes(oldSec5)) {
  code = code.replace(oldSec5, newSec5);
  console.log('✓ Target 4: Permanent (H) reference sheet added to Section 5');
} else {
  console.log('✗ Target 4 not found');
}

// ── Target 5: Representative Differential Slice dx (Section 7) ──
const oldSec7 = `// ─── 7. Representative Slice dx for Revolutions ──────────────────
  if (showSlice && isRev && !isSecRev) {
    const midX = activeCutX;
    const sR = f1(midX);
    ctx.save();
    if (isRevOx) {
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 2.5;
      const capSlice = [];
      const _nSliceAng1 = Math.max(36, Math.min(144, Math.round(N * 1.1)));
      for (let ai = 0; ai <= _nSliceAng1; ai++) {
        const th = (ai / _nSliceAng1) * sweepRad;
        capSlice.push(project(midX, sR * Math.cos(th), sR * Math.sin(th)));
      }
      ctx.beginPath();
      ctx.moveTo(capSlice[0].sx, capSlice[0].sy);
      for (let k = 1; k < capSlice.length; k++) ctx.lineTo(capSlice[k].sx, capSlice[k].sy);
      ctx.fillStyle = "rgba(6, 182, 212, 0.4)";
      ctx.fill();
      ctx.stroke();

      const pCenter = project(midX, 0, 0);
      const pEdge = project(midX, sR, 0);
      ctx.beginPath(); ctx.moveTo(pCenter.sx, pCenter.sy); ctx.lineTo(pEdge.sx, pEdge.sy);
      ctx.strokeStyle = "#0891b2"; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.fillStyle = "#0891b2"; ctx.font = "bold 11px system-ui";
      ctx.fillText("R=f(x)", (pCenter.sx + pEdge.sx) / 2 + 10, (pCenter.sy + pEdge.sy) / 2);
    } else {
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 2.2;
      const ringTop = [], ringBot = [];
      const _nSliceAng2 = Math.max(36, Math.min(144, Math.round(N * 1.1)));
      for (let ai = 0; ai <= _nSliceAng2; ai++) {
        const th = (ai / _nSliceAng2) * sweepRad;
        ringTop.push(project(midX * Math.cos(th), f1(midX), midX * Math.sin(th)));
        ringBot.push(project(midX * Math.cos(th), f2(midX), midX * Math.sin(th)));
      }
      ctx.beginPath();
      ctx.moveTo(ringTop[0].sx, ringTop[0].sy);
      for (let k = 1; k < ringTop.length; k++) ctx.lineTo(ringTop[k].sx, ringTop[k].sy);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(ringBot[0].sx, ringBot[0].sy);
      for (let k = 1; k < ringBot.length; k++) ctx.lineTo(ringBot[k].sx, ringBot[k].sy);
      ctx.stroke();

      const pYCenter = project(0, f1(midX) / 2, 0);
      const pShellEdge = project(midX, f1(midX) / 2, 0);
      ctx.beginPath(); ctx.moveTo(pYCenter.sx, pYCenter.sy); ctx.lineTo(pShellEdge.sx, pShellEdge.sy);
      ctx.strokeStyle = "#e11d48"; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.fillStyle = "#e11d48"; ctx.font = "bold 11px system-ui";
      ctx.fillText("r=x", (pYCenter.sx + pShellEdge.sx) / 2, pYCenter.sy - 4);
    }
    ctx.restore();
  }`;

const newSec7 = `// ─── 7. Representative Slice dx for Revolutions (Lát cắt vi phân hình trụ chuẩn SGK Toán 12) ──
  if (showSlice && isRev && !isSecRev) {
    const midX = activeCutX;
    const sR = Math.abs(f1(midX));
    const isRevY = currentAxis === "oy";
    const curSweep = sweepDeg >= 355 ? Math.PI * 2 : sweepRad;
    const dxThickness = Math.max(0.06, (nb - na) * 0.04);

    ctx.save();
    if (!isRevY) {
      // ── Hình trụ vi phân mỏng bề dày dx quanh Ox ──
      const x1 = midX - dxThickness / 2;
      const x2 = midX + dxThickness / 2;
      const _nSliceAng = Math.max(36, Math.min(108, Math.round(N * 1.1)));

      // Front & Back faces
      const pts1 = [], pts2 = [];
      for (let ai = 0; ai <= _nSliceAng; ai++) {
        const th = (ai / _nSliceAng) * curSweep;
        pts1.push(project(x1, sR * Math.cos(th), sR * Math.sin(th)));
        pts2.push(project(x2, sR * Math.cos(th), sR * Math.sin(th)));
      }

      // Draw lateral band
      for (let ai = 0; ai < _nSliceAng; ai++) {
        ctx.beginPath();
        ctx.moveTo(pts1[ai].sx, pts1[ai].sy);
        ctx.lineTo(pts1[ai + 1].sx, pts1[ai + 1].sy);
        ctx.lineTo(pts2[ai + 1].sx, pts2[ai + 1].sy);
        ctx.lineTo(pts2[ai].sx, pts2[ai].sy);
        ctx.closePath();
        ctx.fillStyle = "rgba(245, 158, 11, 0.40)";
        ctx.fill();
      }

      // Front Face
      const pCenter = project(midX, 0, 0);
      ctx.beginPath();
      ctx.moveTo(pCenter.sx, pCenter.sy);
      for (let ai = 0; ai <= _nSliceAng; ai++) ctx.lineTo(pts2[ai].sx, pts2[ai].sy);
      ctx.closePath();
      ctx.fillStyle = "rgba(251, 191, 36, 0.50)";
      ctx.fill();

      // Rim outline
      ctx.beginPath();
      ctx.moveTo(pts2[0].sx, pts2[0].sy);
      for (let ai = 1; ai <= _nSliceAng; ai++) ctx.lineTo(pts2[ai].sx, pts2[ai].sy);
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // Bán kính r = f(x) từ tâm trục Ox đến đỉnh đồ thị
      const pEdge = project(midX, sR, 0);
      ctx.beginPath();
      ctx.moveTo(pCenter.sx, pCenter.sy);
      ctx.lineTo(pEdge.sx, pEdge.sy);
      ctx.strokeStyle = "#b45309";
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Điểm tâm và điểm trên đường cong
      ctx.fillStyle = "#b45309";
      ctx.beginPath(); ctx.arc(pCenter.sx, pCenter.sy, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(pEdge.sx, pEdge.sy, 3.2, 0, Math.PI * 2); ctx.fill();

      // Nhãn r = f(x) và độ dày dx
      ctx.font = "italic bold 12px 'Times New Roman', serif";
      ctx.fillStyle = "#92400e";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("r = f(x)", (pCenter.sx + pEdge.sx) / 2 + 6, (pCenter.sy + pEdge.sy) / 2);

      // Nhãn thể tích vi phân dV
      const pBadgeX = pCenter.sx, pBadgeY = pCenter.sy + 22;
      const dVText = "dV ≈ π[f(x)]²dx";
      ctx.font = "bold 10px system-ui, sans-serif";
      const bW = ctx.measureText(dVText).width + 8;
      ctx.fillStyle = "rgba(245, 158, 11, 0.95)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pBadgeX - bW / 2, pBadgeY - 8, bW, 16, 4);
      else ctx.rect(pBadgeX - bW / 2, pBadgeY - 8, bW, 16);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(dVText, pBadgeX, pBadgeY);
    } else {
      // Oy rotation slice
      const pCenter = project(0, midX, 0);
      const pEdge = project(sR, midX, 0);
      ctx.beginPath(); ctx.moveTo(pCenter.sx, pCenter.sy); ctx.lineTo(pEdge.sx, pEdge.sy);
      ctx.strokeStyle = "#b45309"; ctx.lineWidth = 1.8; ctx.setLineDash([4, 3]); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#b45309";
      ctx.beginPath(); ctx.arc(pCenter.sx, pCenter.sy, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(pEdge.sx, pEdge.sy, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.font = "italic bold 12px 'Times New Roman', serif";
      ctx.fillStyle = "#92400e";
      ctx.fillText("r = x", (pCenter.sx + pEdge.sx) / 2 + 6, (pCenter.sy + pEdge.sy) / 2);
    }
    ctx.restore();
  }`;

if (code.includes(oldSec7)) {
  code = code.replace(oldSec7, newSec7);
  console.log('✓ Target 5: Enhanced differential slice dx with SGK disk & radius formula');
} else {
  console.log('✗ Target 5 not found');
}

// ── Target 6: 3D Rotation Arc Indicator around Axis (Section 8) ──
const oldSec8 = `  // ─── 8. Rotation Arc Indicator (Removed - erroneous dashed circle) ───`;

const newSec8 = `  // ─── 8. Rotation Arc Indicator (Mũi tên chỉ chiều quay quanh trục chuẩn SGK) ───
  if (isRev && !isCross && sweepDeg > 5) {
    const isRevY = currentAxis === "oy";
    ctx.save();
    if (!isRevY) {
      // Vòng cung chỉ chiều quay quanh trục Ox
      const rotX = na - 0.28;
      const rotR = Math.min(1.2, Math.max(0.65, boundR * 0.42));
      const curAng = sweepDeg >= 355 ? Math.PI * 1.6 : sweepRad;
      const arcPts = [];
      const nArc = 36;
      for (let ai = 0; ai <= nArc; ai++) {
        const th = (ai / nArc) * curAng;
        arcPts.push(project(rotX, rotR * Math.cos(th), rotR * Math.sin(th)));
      }
      ctx.beginPath();
      ctx.moveTo(arcPts[0].sx, arcPts[0].sy);
      for (let k = 1; k < arcPts.length; k++) ctx.lineTo(arcPts[k].sx, arcPts[k].sy);
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // Mũi tên ở đầu cung quay
      if (arcPts.length >= 2) {
        const pTip = arcPts[arcPts.length - 1];
        const pPrev = arcPts[arcPts.length - 2];
        const adx = pTip.sx - pPrev.sx, ady = pTip.sy - pPrev.sy;
        const alen = Math.hypot(adx, ady) || 1;
        const aux = adx / alen, auy = ady / alen;
        const anx = -auy, any = aux;
        ctx.fillStyle = "#2563eb";
        ctx.beginPath();
        ctx.moveTo(pTip.sx, pTip.sy);
        ctx.lineTo(pTip.sx - 9 * aux + 4.5 * anx, pTip.sy - 9 * auy + 4.5 * any);
        ctx.lineTo(pTip.sx - 7 * aux, pTip.sy - 7 * auy);
        ctx.lineTo(pTip.sx - 9 * aux - 4.5 * anx, pTip.sy - 9 * auy - 4.5 * any);
        ctx.closePath();
        ctx.fill();
      }

      // Huy hiệu góc quay quanh Ox
      const pMid = arcPts[Math.floor(arcPts.length / 2)];
      ctx.font = "bold 10.5px system-ui, sans-serif";
      const lblRot = "↺ " + Math.round(sweepDeg) + "°";
      const rtw = ctx.measureText(lblRot).width + 8;
      ctx.fillStyle = "rgba(37, 99, 235, 0.92)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pMid.sx - rtw / 2, pMid.sy - 19, rtw, 16, 4);
      else ctx.rect(pMid.sx - rtw / 2, pMid.sy - 19, rtw, 16);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(lblRot, pMid.sx, pMid.sy - 11);
    } else {
      // Vòng cung chỉ chiều quay quanh trục Oy
      const rotY = Math.max(na, 0) + 0.3;
      const rotR = Math.min(1.2, Math.max(0.65, boundR * 0.42));
      const curAng = sweepDeg >= 355 ? Math.PI * 1.6 : sweepRad;
      const arcPts = [];
      const nArc = 36;
      for (let ai = 0; ai <= nArc; ai++) {
        const th = (ai / nArc) * curAng;
        arcPts.push(project(rotR * Math.cos(th), rotY, rotR * Math.sin(th)));
      }
      ctx.beginPath();
      ctx.moveTo(arcPts[0].sx, arcPts[0].sy);
      for (let k = 1; k < arcPts.length; k++) ctx.lineTo(arcPts[k].sx, arcPts[k].sy);
      ctx.strokeStyle = "#059669";
      ctx.lineWidth = 2.0;
      ctx.stroke();

      if (arcPts.length >= 2) {
        const pTip = arcPts[arcPts.length - 1];
        const pPrev = arcPts[arcPts.length - 2];
        const adx = pTip.sx - pPrev.sx, ady = pTip.sy - pPrev.sy;
        const alen = Math.hypot(adx, ady) || 1;
        const aux = adx / alen, auy = ady / alen;
        const anx = -auy, any = aux;
        ctx.fillStyle = "#059669";
        ctx.beginPath();
        ctx.moveTo(pTip.sx, pTip.sy);
        ctx.lineTo(pTip.sx - 9 * aux + 4.5 * anx, pTip.sy - 9 * auy + 4.5 * any);
        ctx.lineTo(pTip.sx - 7 * aux, pTip.sy - 7 * auy);
        ctx.lineTo(pTip.sx - 9 * aux - 4.5 * anx, pTip.sy - 9 * auy - 4.5 * any);
        ctx.closePath();
        ctx.fill();
      }

      const pMid = arcPts[Math.floor(arcPts.length / 2)];
      ctx.font = "bold 10.5px system-ui, sans-serif";
      const lblRot = "↺ " + Math.round(sweepDeg) + "°";
      const rtw = ctx.measureText(lblRot).width + 8;
      ctx.fillStyle = "rgba(5, 150, 105, 0.92)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pMid.sx - rtw / 2, pMid.sy - 19, rtw, 16, 4);
      else ctx.rect(pMid.sx - rtw / 2, pMid.sy - 19, rtw, 16);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(lblRot, pMid.sx, pMid.sy - 11);
    }
    ctx.restore();
  }`;

if (code.includes(oldSec8)) {
  code = code.replace(oldSec8, newSec8);
  console.log('✓ Target 6: Added 3D rotation arc indicator to Section 8');
} else {
  console.log('✗ Target 6 not found');
}

// Write file
fs.writeFileSync(targetFile, code, 'utf8');
console.log('=== All Pedagogical Graphics patches applied successfully ===');
