const fs = require('fs');

let bundle = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// 1. Update cenZ so isSecRev is not shifted off-center
const oldCenZ = 'const cenZ = isCross ? boundR * 0.35 : 0;';
const newCenZ = 'const cenZ = (isCross && !isSecRev) ? boundR * 0.35 : 0;';
if (!bundle.includes(oldCenZ)) {
  console.error('Could not find oldCenZ');
  process.exit(1);
}
bundle = bundle.replace(oldCenZ, newCenZ);
console.log('1. cenZ updated');

// 2. Clear height for Oy axis label
const oldOyEnd = 'const oyEnd = project(0, maxVal * 1.15 + 0.35, 0);';
const newOyEnd = 'const oyEnd = project(0, maxVal * 1.32 + 0.5, 0);';
if (bundle.includes(oldOyEnd)) {
  bundle = bundle.replace(oldOyEnd, newOyEnd);
  console.log('2. oyEnd updated');
}

// 3. Update Step 5 so 2D curves are not slicing through 3D revolved solids
const oldStep5 = `  // ─── 5. Draw 2D Boundary Curves in Base ───────────────────────────
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
  ctx.beginPath();
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

const newStep5 = `  // ─── 5. Draw 2D Boundary Curves in Base ───────────────────────────
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
    ctx.beginPath();
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
    }
  }`;

if (!bundle.includes(oldStep5)) {
  console.error('Could not find oldStep5');
  process.exit(1);
}
bundle = bundle.replace(oldStep5, newStep5);
console.log('3. Step 5 boundary curves updated');

// 4. Update Section 6 completely
const p6Start = bundle.indexOf('  // ─── 6. INTERACTIVE CUTTING PLANE & CROSS-SECTION AT activeCutX ──');
const p7Start = bundle.indexOf('  // ─── 7. Representative Slice dx for Revolutions ──────────────────');
if (p6Start === -1 || p7Start === -1) {
  console.error('Could not find Section 6 boundaries');
  process.exit(1);
}

const oldSec6 = bundle.substring(p6Start, p7Start);

const newSec6 = `  // ─── 6. INTERACTIVE CUTTING PLANE & CROSS-SECTION AT activeCutX ──
  if (isCross) {
    ctx.save();
    if (isSecRev) {
      // ══════ Slicing Plane & Circular Cross Section for Revolved Solid ══════
      const isRevY = currentAxis === "sec-oy";
      const cutCoord = activeCutX;
      const R1 = Math.abs(f1(cutCoord));
      const R2 = Math.abs(f2(cutCoord));
      const Ro = Math.max(R1, R2);
      const Ri = Math.min(R1, R2);
      const cutArea = Math.PI * (Ro * Ro - Ri * Ri);

      // ── 1. Semi-transparent cutting plane sheet (P) ⊥ axis ──
      const pExtent = Math.max(boundR * 1.35, Ro * 1.3, 1.2);
      const planeSheet = isRevY ? [
        project(-pExtent, cutCoord, -pExtent),
        project(pExtent, cutCoord, -pExtent),
        project(pExtent, cutCoord, pExtent),
        project(-pExtent, cutCoord, pExtent)
      ] : [
        project(cutCoord, -pExtent, -pExtent),
        project(cutCoord, pExtent, -pExtent),
        project(cutCoord, pExtent, pExtent),
        project(cutCoord, -pExtent, pExtent)
      ];

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(planeSheet[0].sx, planeSheet[0].sy);
      for (let k = 1; k < planeSheet.length; k++) ctx.lineTo(planeSheet[k].sx, planeSheet[k].sy);
      ctx.closePath();
      ctx.fillStyle = "rgba(6, 182, 212, 0.12)";
      ctx.fill();
      ctx.strokeStyle = "rgba(8, 145, 178, 0.75)";
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label for cutting plane (P) in top corner
      let planeTop = planeSheet[0];
      for (const pt of planeSheet) {
        if (pt.sy < planeTop.sy) planeTop = pt;
      }
      const planeTag = isRevY ? "Mặt phẳng (P) ⊥ Oy" : "Mặt phẳng (P) ⊥ Ox";
      ctx.font = "bold 10px system-ui, sans-serif";
      const ptw = ctx.measureText(planeTag).width + 10;
      ctx.fillStyle = "rgba(6, 182, 212, 0.9)";
      if (ctx.roundRect) ctx.roundRect(planeTop.sx - ptw / 2, planeTop.sy - 18, ptw, 16, 4);
      else ctx.rect(planeTop.sx - ptw / 2, planeTop.sy - 18, ptw, 16);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(planeTag, planeTop.sx, planeTop.sy - 10);
      ctx.restore();

      // ── 2. Circular Cross-Section Disc at cutCoord ──
      if (Ro > 0.001) {
        const nCirclePts = Math.max(64, Math.min(180, Math.round(N * 1.25)));
        const outerCircle = [];
        for (let ci = 0; ci <= nCirclePts; ci++) {
          const ang = (ci / nCirclePts) * Math.PI * 2;
          const p = isRevY
            ? project(Ro * Math.cos(ang), cutCoord, Ro * Math.sin(ang))
            : project(cutCoord, Ro * Math.cos(ang), Ro * Math.sin(ang));
          outerCircle.push(p);
        }

        // Find TRUE APEX of the ellipse on screen (minimum sy)
        let apexIdx = 0;
        for (let ci = 1; ci < outerCircle.length; ci++) {
          if (outerCircle[ci].sy < outerCircle[apexIdx].sy) {
            apexIdx = ci;
          }
        }
        const topPt = outerCircle[apexIdx];
        const pCenter = isRevY ? project(0, cutCoord, 0) : project(cutCoord, 0, 0);

        // Draw cross-section disk fill
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(outerCircle[0].sx, outerCircle[0].sy);
        for (let k = 1; k < outerCircle.length; k++) ctx.lineTo(outerCircle[k].sx, outerCircle[k].sy);
        ctx.closePath();

        // Inner circle (hole) if washer
        let innerCircle = null;
        if (Ri > 0.001) {
          innerCircle = [];
          for (let ci = nCirclePts; ci >= 0; ci--) {
            const ang = (ci / nCirclePts) * Math.PI * 2;
            const p = isRevY
              ? project(Ri * Math.cos(ang), cutCoord, Ri * Math.sin(ang))
              : project(cutCoord, Ri * Math.cos(ang), Ri * Math.sin(ang));
            innerCircle.push(p);
          }
          ctx.moveTo(innerCircle[0].sx, innerCircle[0].sy);
          for (let k = 1; k < innerCircle.length; k++) ctx.lineTo(innerCircle[k].sx, innerCircle[k].sy);
          ctx.closePath();
        }

        // Rich illuminated amber gradient
        const grad = ctx.createLinearGradient(topPt.sx, topPt.sy, pCenter.sx, pCenter.sy + (pCenter.sy - topPt.sy));
        grad.addColorStop(0, "rgba(251, 191, 36, 0.92)");
        grad.addColorStop(1, "rgba(217, 119, 6, 0.85)");
        ctx.fillStyle = grad;
        ctx.fill();

        // Subtle hatching lines across the slice (vân gạch chéo chuẩn SGK)
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = "rgba(180, 83, 9, 0.22)";
        ctx.lineWidth = 1;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const pt of outerCircle) {
          if (pt.sx < minX) minX = pt.sx;
          if (pt.sx > maxX) maxX = pt.sx;
          if (pt.sy < minY) minY = pt.sy;
          if (pt.sy > maxY) maxY = pt.sy;
        }
        const hatchStep = 11;
        ctx.beginPath();
        for (let hx = minX - (maxY - minY); hx < maxX + (maxY - minY); hx += hatchStep) {
          ctx.moveTo(hx, minY - 5);
          ctx.lineTo(hx + (maxY - minY) + 10, maxY + 5);
        }
        ctx.stroke();
        ctx.restore();

        // Crisp outer border
        ctx.beginPath();
        ctx.moveTo(outerCircle[0].sx, outerCircle[0].sy);
        for (let k = 1; k < outerCircle.length; k++) ctx.lineTo(outerCircle[k].sx, outerCircle[k].sy);
        ctx.closePath();
        ctx.strokeStyle = "#b45309";
        ctx.lineWidth = 2.4;
        ctx.stroke();

        // Inner border if washer
        if (innerCircle) {
          ctx.beginPath();
          ctx.moveTo(innerCircle[0].sx, innerCircle[0].sy);
          for (let k = 1; k < innerCircle.length; k++) ctx.lineTo(innerCircle[k].sx, innerCircle[k].sy);
          ctx.closePath();
          ctx.strokeStyle = "#92400e";
          ctx.lineWidth = 1.8;
          ctx.setLineDash([3, 2]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // ── 3. Radius Dimension Line: from center directly to apex topPt ──
        ctx.beginPath();
        ctx.moveTo(pCenter.sx, pCenter.sy);
        ctx.lineTo(topPt.sx, topPt.sy);
        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Center point dot
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.arc(pCenter.sx, pCenter.sy, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Radius label in a crisp white pill badge
        const rValStr = (Math.round(Ro * 100) / 100);
        const rLabel = "R=" + rValStr;
        ctx.font = "bold 11px system-ui, sans-serif";
        const rlw = ctx.measureText(rLabel).width + 8;
        const rMidX = (pCenter.sx + topPt.sx) / 2;
        const rMidY = (pCenter.sy + topPt.sy) / 2;
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        if (ctx.roundRect) ctx.roundRect(rMidX - rlw / 2, rMidY - 9, rlw, 18, 5);
        else ctx.rect(rMidX - rlw / 2, rMidY - 9, rlw, 18);
        ctx.fill();
        ctx.strokeStyle = "#fca5a5";
        ctx.lineWidth = 1;
        if (ctx.roundRect) ctx.roundRect(rMidX - rlw / 2, rMidY - 9, rlw, 18, 5);
        else ctx.rect(rMidX - rlw / 2, rMidY - 9, rlw, 18);
        ctx.stroke();
        ctx.fillStyle = "#b91c1c";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(rLabel, rMidX, rMidY);

        // ── 4. Tactile Drag Handle at topPt (Apex) ──
        item._cutHandle = { x: topPt.sx - x, y: topPt.sy - y };
        
        ctx.save();
        ctx.shadowColor = "rgba(217, 119, 6, 0.4)";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(topPt.sx, topPt.sy, 7.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 2.4;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(topPt.sx, topPt.sy, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = "#d97706";
        ctx.fill();
        ctx.restore();

        // ── 5. Floating Formula & Area Badge: S(x) = π·R² ──
        const xValStr = (Math.round(cutCoord * 10) / 10);
        const areaValStr = (Math.round(cutArea * 100) / 100);
        const badgeText = Ri > 0.001
          ? "S(" + xValStr + ") = π(R² - r²) ≈ " + areaValStr
          : "S(" + xValStr + ") = π·R² ≈ " + areaValStr;
        
        ctx.font = "bold 11px system-ui, sans-serif";
        const bw = ctx.measureText(badgeText).width + 16;
        const bh = 22;
        // Position badge cleanly 12px above handle with no overlap
        const badgeY = topPt.sy - 12 - bh;
        
        // Connecting stem from badge to handle
        ctx.beginPath();
        ctx.moveTo(topPt.sx, badgeY + bh);
        ctx.lineTo(topPt.sx, topPt.sy - 8);
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Badge card
        ctx.save();
        ctx.shadowColor = "rgba(15, 23, 42, 0.12)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
        if (ctx.roundRect) ctx.roundRect(topPt.sx - bw / 2, badgeY, bw, bh, 6);
        else ctx.rect(topPt.sx - bw / 2, badgeY, bw, bh);
        ctx.fill();
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 1.4;
        if (ctx.roundRect) ctx.roundRect(topPt.sx - bw / 2, badgeY, bw, bh, 6);
        else ctx.rect(topPt.sx - bw / 2, badgeY, bw, bh);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = "#b45309";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(badgeText, topPt.sx, badgeY + bh / 2);
        ctx.restore();
      }

      // ── 6. Coordinate tag on axis ──
      const pCutAxis = isRevY ? project(0, cutCoord, 0) : project(cutCoord, 0, 0);
      ctx.save();
      ctx.fillStyle = "#ea580c";
      ctx.beginPath();
      ctx.arc(pCutAxis.sx, pCutAxis.sy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const axisVar = isRevY ? "y" : "x";
      const axisTag = axisVar + " = " + (Math.round(cutCoord * 10) / 10);
      ctx.font = "bold 10px system-ui, sans-serif";
      const atw = ctx.measureText(axisTag).width + 8;
      const aty = pCutAxis.sy + 14;
      ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
      if (ctx.roundRect) ctx.roundRect(pCutAxis.sx - atw / 2, aty - 8, atw, 16, 4);
      else ctx.rect(pCutAxis.sx - atw / 2, aty - 8, atw, 16);
      ctx.fill();
      ctx.strokeStyle = "#fdba74";
      ctx.lineWidth = 1;
      if (ctx.roundRect) ctx.roundRect(pCutAxis.sx - atw / 2, aty - 8, atw, 16, 4);
      else ctx.rect(pCutAxis.sx - atw / 2, aty - 8, atw, 16);
      ctx.stroke();
      ctx.fillStyle = "#c2410c";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(axisTag, pCutAxis.sx, aty);
      ctx.restore();

      ctx.restore();
    } else {
      // ══════ Slicing Plane & Cross-Section Polygon for Lofted Solids ══════
      const cutW = Math.abs(f1(activeCutX) - f2(activeCutX));
      const cutYm = (f1(activeCutX) + f2(activeCutX)) / 2;
      const cutShape = getCrossSectionShape(currentAxis, cutW);
      const cutArea = computeCrossArea(currentAxis, cutW);

      // ── 1. Semi-transparent cutting plane sheet perpendicular to Ox ──
      const planeH = Math.max(boundR * 1.5, maxVal * 1.3);
      const planeSheet = [
        project(activeCutX, -0.2, -0.2),
        project(activeCutX, maxVal * 1.25, -0.2),
        project(activeCutX, maxVal * 1.25, planeH),
        project(activeCutX, -0.2, planeH)
      ];
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(planeSheet[0].sx, planeSheet[0].sy);
      for (let k = 1; k < planeSheet.length; k++) ctx.lineTo(planeSheet[k].sx, planeSheet[k].sy);
      ctx.closePath();
      ctx.fillStyle = "rgba(6, 182, 212, 0.12)";
      ctx.fill();
      ctx.strokeStyle = "rgba(8, 145, 178, 0.75)";
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label for cutting plane (P)
      let planeTop = planeSheet[0];
      for (const pt of planeSheet) {
        if (pt.sy < planeTop.sy) planeTop = pt;
      }
      const planeTag = "Mặt phẳng (P) ⊥ Ox";
      ctx.font = "bold 10px system-ui, sans-serif";
      const ptw = ctx.measureText(planeTag).width + 10;
      ctx.fillStyle = "rgba(6, 182, 212, 0.9)";
      if (ctx.roundRect) ctx.roundRect(planeTop.sx - ptw / 2, planeTop.sy - 18, ptw, 16, 4);
      else ctx.rect(planeTop.sx - ptw / 2, planeTop.sy - 18, ptw, 16);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(planeTag, planeTop.sx, planeTop.sy - 10);
      ctx.restore();

      // ── 2. Highlighted Cut Polygon with Hatching ──
      if (cutW > 0.001) {
        const cutPts = cutShape.map(pt => project(activeCutX, cutYm + pt.u, pt.v));
        
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cutPts[0].sx, cutPts[0].sy);
        for (let k = 1; k < cutPts.length; k++) ctx.lineTo(cutPts[k].sx, cutPts[k].sy);
        ctx.closePath();

        // Find TRUE APEX of the polygon on screen (minimum sy)
        let topPt = cutPts[0];
        for (let k = 1; k < cutPts.length; k++) {
          if (cutPts[k].sy < topPt.sy) topPt = cutPts[k];
        }

        const pBase0 = project(activeCutX, f2(activeCutX), 0);
        const pBase1 = project(activeCutX, f1(activeCutX), 0);
        const pMidBase = { sx: (pBase0.sx + pBase1.sx) / 2, sy: (pBase0.sy + pBase1.sy) / 2 };

        const grad = ctx.createLinearGradient(topPt.sx, topPt.sy, pMidBase.sx, pMidBase.sy);
        grad.addColorStop(0, "rgba(251, 191, 36, 0.92)");
        grad.addColorStop(1, "rgba(217, 119, 6, 0.85)");
        ctx.fillStyle = grad;
        ctx.fill();

        // Subtle hatching lines
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = "rgba(180, 83, 9, 0.22)";
        ctx.lineWidth = 1;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const pt of cutPts) {
          if (pt.sx < minX) minX = pt.sx;
          if (pt.sx > maxX) maxX = pt.sx;
          if (pt.sy < minY) minY = pt.sy;
          if (pt.sy > maxY) maxY = pt.sy;
        }
        const hatchStep = 11;
        ctx.beginPath();
        for (let hx = minX - (maxY - minY); hx < maxX + (maxY - minY); hx += hatchStep) {
          ctx.moveTo(hx, minY - 5);
          ctx.lineTo(hx + (maxY - minY) + 10, maxY + 5);
        }
        ctx.stroke();
        ctx.restore();

        // Contour border
        ctx.beginPath();
        ctx.moveTo(cutPts[0].sx, cutPts[0].sy);
        for (let k = 1; k < cutPts.length; k++) ctx.lineTo(cutPts[k].sx, cutPts[k].sy);
        ctx.closePath();
        ctx.strokeStyle = "#b45309";
        ctx.lineWidth = 2.4;
        ctx.stroke();

        // Dimension line along base (đoạn đáy)
        ctx.beginPath();
        ctx.moveTo(pBase0.sx, pBase0.sy);
        ctx.lineTo(pBase1.sx, pBase1.sy);
        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 2.4;
        ctx.stroke();

        // Base label pill
        const bLabel = "d=" + (Math.round(cutW * 100) / 100);
        ctx.font = "bold 11px system-ui, sans-serif";
        const blw = ctx.measureText(bLabel).width + 8;
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        if (ctx.roundRect) ctx.roundRect(pMidBase.sx - blw / 2, pMidBase.sy - 9, blw, 18, 5);
        else ctx.rect(pMidBase.sx - blw / 2, pMidBase.sy - 9, blw, 18);
        ctx.fill();
        ctx.strokeStyle = "#fca5a5";
        ctx.lineWidth = 1;
        if (ctx.roundRect) ctx.roundRect(pMidBase.sx - blw / 2, pMidBase.sy - 9, blw, 18, 5);
        else ctx.rect(pMidBase.sx - blw / 2, pMidBase.sy - 9, blw, 18);
        ctx.stroke();
        ctx.fillStyle = "#b91c1c";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(bLabel, pMidBase.sx, pMidBase.sy);

        // ── 3. Tactile Drag Handle at topPt ──
        item._cutHandle = { x: topPt.sx - x, y: topPt.sy - y };
        ctx.save();
        ctx.shadowColor = "rgba(217, 119, 6, 0.4)";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(topPt.sx, topPt.sy, 7.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 2.4;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(topPt.sx, topPt.sy, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = "#d97706";
        ctx.fill();
        ctx.restore();

        // ── 4. Floating Formula & Area Badge ──
        const xValStr = (Math.round(activeCutX * 10) / 10);
        const areaValStr = (Math.round(cutArea * 100) / 100);
        let formPrefix = "";
        if (currentAxis === "sec-square") formPrefix = "S(" + xValStr + ") = d² ≈ ";
        else if (currentAxis === "sec-tri") formPrefix = "S(" + xValStr + ") = (√3/4)d² ≈ ";
        else if (currentAxis === "sec-semi") formPrefix = "S(" + xValStr + ") = (π/8)d² ≈ ";
        else if (currentAxis === "sec-circle") formPrefix = "S(" + xValStr + ") = (π/4)d² ≈ ";
        else if (currentAxis === "sec-tri-right") formPrefix = "S(" + xValStr + ") = ½d² ≈ ";
        else if (currentAxis === "sec-tri-iso") formPrefix = "S(" + xValStr + ") = ¼d² ≈ ";
        else formPrefix = "S(" + xValStr + ") ≈ ";
        const badgeText = formPrefix + areaValStr;

        ctx.font = "bold 11px system-ui, sans-serif";
        const bw = ctx.measureText(badgeText).width + 16;
        const bh = 22;
        const badgeY = topPt.sy - 12 - bh;

        // Stem from badge to handle
        ctx.beginPath();
        ctx.moveTo(topPt.sx, badgeY + bh);
        ctx.lineTo(topPt.sx, topPt.sy - 8);
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.save();
        ctx.shadowColor = "rgba(15, 23, 42, 0.12)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
        if (ctx.roundRect) ctx.roundRect(topPt.sx - bw / 2, badgeY, bw, bh, 6);
        else ctx.rect(topPt.sx - bw / 2, badgeY, bw, bh);
        ctx.fill();
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 1.4;
        if (ctx.roundRect) ctx.roundRect(topPt.sx - bw / 2, badgeY, bw, bh, 6);
        else ctx.rect(topPt.sx - bw / 2, badgeY, bw, bh);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = "#b45309";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(badgeText, topPt.sx, badgeY + bh / 2);
        ctx.restore();
      }

      // ── 5. Coordinate tag on Ox axis ──
      const pCutOx = project(activeCutX, 0, 0);
      ctx.save();
      ctx.fillStyle = "#ea580c";
      ctx.beginPath();
      ctx.arc(pCutOx.sx, pCutOx.sy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const axisTag = "x = " + (Math.round(activeCutX * 10) / 10);
      ctx.font = "bold 10px system-ui, sans-serif";
      const atw = ctx.measureText(axisTag).width + 8;
      const aty = pCutOx.sy + 14;
      ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
      if (ctx.roundRect) ctx.roundRect(pCutOx.sx - atw / 2, aty - 8, atw, 16, 4);
      else ctx.rect(pCutOx.sx - atw / 2, aty - 8, atw, 16);
      ctx.fill();
      ctx.strokeStyle = "#fdba74";
      ctx.lineWidth = 1;
      if (ctx.roundRect) ctx.roundRect(pCutOx.sx - atw / 2, aty - 8, atw, 16, 4);
      else ctx.rect(pCutOx.sx - atw / 2, aty - 8, atw, 16);
      ctx.stroke();
      ctx.fillStyle = "#c2410c";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(axisTag, pCutOx.sx, aty);
      ctx.restore();

      ctx.restore();
    } // end else
  }\n\n`;

bundle = bundle.substring(0, p6Start) + newSec6 + bundle.substring(p7Start);
console.log('4. Section 6 successfully replaced!');

fs.writeFileSync('dist/assets/index-D9JME9Hm.js', bundle, 'utf8');
console.log('ALL DONE! dist/assets/index-D9JME9Hm.js successfully patched.');
