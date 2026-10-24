/**
 * Change the cross-section slice color to amber/orange so it's visually
 * distinct from the main sapphire-blue solid of revolution.
 *
 * Solid (Quay trục): sapphire blue  (#2563eb / rgba(191,219,254,...))
 * Slice  (Lát cắt): amber orange    (#f97316 / rgba(254,215,170,...))
 */
const fs = require('fs');
const filePath = 'dist/assets/index-D9JME9Hm.js';
let code = fs.readFileSync(filePath, 'utf8');

function replaceOrDie(old, neo, desc) {
  if (!code.includes(old)) {
    console.error('NOT FOUND:', desc);
    process.exit(1);
  }
  code = code.replace(old, neo);
  console.log('✓', desc);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. isSecRev  circular / sector slice fill  (sec-ox / sec-oy)
//    This is the main disc that slides through the revolution solid.
// ─────────────────────────────────────────────────────────────────────────────
replaceOrDie(
  `// Illuminated crystalline sapphire blue gradient
          const grad = ctx.createLinearGradient(topPt.sx, topPt.sy, pCenter.sx, pCenter.sy + (pCenter.sy - topPt.sy));
          grad.addColorStop(0, "rgba(191, 219, 254, 0.85)");
          grad.addColorStop(1, "rgba(147, 197, 253, 0.80)");
          ctx.fillStyle = grad;
          ctx.fill();

// Smooth clean cross-section (removed diagonal stripes per user request)

          // Crisp sapphire contour border (chuẩn nét liền sư phạm cho lát cắt nhìn thấy)
          if (isFullRev) {
            ctx.beginPath();
            ctx.moveTo(outerArc[0].sx, outerArc[0].sy);
            for (let ci = 1; ci <= nCirclePts; ci++) ctx.lineTo(outerArc[ci].sx, outerArc[ci].sy);
            ctx.closePath();
            ctx.strokeStyle = "#2563eb";
            ctx.lineWidth = 2.4;
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.moveTo(slicePoly[0].sx, slicePoly[0].sy);
            for (let k = 1; k < slicePoly.length; k++) ctx.lineTo(slicePoly[k].sx, slicePoly[k].sy);
            ctx.closePath();
            ctx.strokeStyle = "#2563eb";
            ctx.lineWidth = 2.4;
            ctx.stroke();
          }

          // Inner border if full washer
          if (isFullRev && innerCircle) {
            ctx.beginPath();
            ctx.moveTo(innerCircle[0].sx, innerCircle[0].sy);
            for (let k = 1; k < innerCircle.length; k++) ctx.lineTo(innerCircle[k].sx, innerCircle[k].sy);
            ctx.closePath();
            ctx.strokeStyle = "#1d4ed8";
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }`,
  `// Illuminated amber-orange slice gradient (distinct from blue solid)
          const grad = ctx.createLinearGradient(topPt.sx, topPt.sy, pCenter.sx, pCenter.sy + (pCenter.sy - topPt.sy));
          grad.addColorStop(0, "rgba(254, 215, 170, 0.90)");
          grad.addColorStop(1, "rgba(251, 146, 60, 0.82)");
          ctx.fillStyle = grad;
          ctx.fill();

// Smooth clean cross-section (removed diagonal stripes per user request)

          // Crisp amber contour border (lát cắt nổi bật khác màu hình chính)
          if (isFullRev) {
            ctx.beginPath();
            ctx.moveTo(outerArc[0].sx, outerArc[0].sy);
            for (let ci = 1; ci <= nCirclePts; ci++) ctx.lineTo(outerArc[ci].sx, outerArc[ci].sy);
            ctx.closePath();
            ctx.strokeStyle = "#f97316";
            ctx.lineWidth = 2.4;
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.moveTo(slicePoly[0].sx, slicePoly[0].sy);
            for (let k = 1; k < slicePoly.length; k++) ctx.lineTo(slicePoly[k].sx, slicePoly[k].sy);
            ctx.closePath();
            ctx.strokeStyle = "#f97316";
            ctx.lineWidth = 2.4;
            ctx.stroke();
          }

          // Inner border if full washer
          if (isFullRev && innerCircle) {
            ctx.beginPath();
            ctx.moveTo(innerCircle[0].sx, innerCircle[0].sy);
            for (let k = 1; k < innerCircle.length; k++) ctx.lineTo(innerCircle[k].sx, innerCircle[k].sy);
            ctx.closePath();
            ctx.strokeStyle = "#ea580c";
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }`,
  'isSecRev: circular slice fill amber-orange'
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. Center dot on the revolution-slice (was #2563eb)
// ─────────────────────────────────────────────────────────────────────────────
// Also update the segment border if the sweepDeg <= 3 (initial 2D line)
replaceOrDie(
  `          ctx.lineTo(pEdge0.sx, pEdge0.sy);
          ctx.strokeStyle = "#2563eb";
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // ── 3. Center point dot ──
        ctx.fillStyle = "#2563eb";`,
  `          ctx.lineTo(pEdge0.sx, pEdge0.sy);
          ctx.strokeStyle = "#f97316";
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // ── 3. Center point dot ──
        ctx.fillStyle = "#f97316";`,
  'isSecRev: initial 2D segment + center dot amber'
);

// ─────────────────────────────────────────────────────────────────────────────
// 3. isSecRev drag handle (apex handle) color
// ─────────────────────────────────────────────────────────────────────────────
replaceOrDie(
  `          // ── 4. Tactile Drag Handle at topPt (Apex) - Sleek & Compact ──
          ctx.save();
          ctx.shadowColor = "rgba(37, 99, 235, 0.35)";
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(topPt.sx, topPt.sy, 6.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(37, 99, 235, 0.15)";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(topPt.sx, topPt.sy, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.strokeStyle = "#2563eb";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(topPt.sx, topPt.sy, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = "#1d4ed8";
          ctx.fill();
          ctx.restore();`,
  `          // ── 4. Tactile Drag Handle at topPt (Apex) - Sleek & Compact ──
          ctx.save();
          ctx.shadowColor = "rgba(249, 115, 22, 0.35)";
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(topPt.sx, topPt.sy, 6.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(249, 115, 22, 0.15)";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(topPt.sx, topPt.sy, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.strokeStyle = "#f97316";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(topPt.sx, topPt.sy, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = "#ea580c";
          ctx.fill();
          ctx.restore();`,
  'isSecRev: apex drag handle amber'
);

// ─────────────────────────────────────────────────────────────────────────────
// 4. isSecRev S(x) badge connector line + badge border (was blue)
// ─────────────────────────────────────────────────────────────────────────────
//  The badge stalk line + the badge border border around S(x)
replaceOrDie(
  `          ctx.moveTo(topPt.sx, badgeY + bh);
          ctx.lineTo(topPt.sx, topPt.sy - 8.5);
          ctx.strokeStyle = "rgba(37, 99, 235, 0.50)";
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.save();
          ctx.shadowColor = "rgba(15, 23, 42, 0.10)";
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 2;
          ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(topPt.sx - bw / 2, badgeY, bw, bh, 5);
          else ctx.rect(topPt.sx - bw / 2, badgeY, bw, bh);
          ctx.fill();
          ctx.strokeStyle = "rgba(37, 99, 235, 0.40)";
          ctx.lineWidth = 1.2;
          if (ctx.roundRect) ctx.roundRect(topPt.sx - bw / 2, badgeY, bw, bh, 5);
          else ctx.rect(topPt.sx - bw / 2, badgeY, bw, bh);
          ctx.stroke();
          ctx.restore();

          ctx.fillStyle = "#1e40af";`,
  `          ctx.moveTo(topPt.sx, badgeY + bh);
          ctx.lineTo(topPt.sx, topPt.sy - 8.5);
          ctx.strokeStyle = "rgba(249, 115, 22, 0.60)";
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.save();
          ctx.shadowColor = "rgba(15, 23, 42, 0.10)";
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 2;
          ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(topPt.sx - bw / 2, badgeY, bw, bh, 5);
          else ctx.rect(topPt.sx - bw / 2, badgeY, bw, bh);
          ctx.fill();
          ctx.strokeStyle = "rgba(249, 115, 22, 0.55)";
          ctx.lineWidth = 1.2;
          if (ctx.roundRect) ctx.roundRect(topPt.sx - bw / 2, badgeY, bw, bh, 5);
          else ctx.rect(topPt.sx - bw / 2, badgeY, bw, bh);
          ctx.stroke();
          ctx.restore();

          ctx.fillStyle = "#c2410c";`,
  'isSecRev: S(x) badge amber (connector + border + text)'
);

// ─────────────────────────────────────────────────────────────────────────────
// 5. isSecRev radius label badge border (was blue)
// ─────────────────────────────────────────────────────────────────────────────
replaceOrDie(
  `            ctx.strokeStyle = "rgba(37, 99, 235, 0.40)";
            ctx.lineWidth = 1;
            if (ctx.roundRect) ctx.roundRect(rTagX - rlw / 2, rTagY - 7.5, rlw, 15, 4);
            else ctx.rect(rTagX - rlw / 2, rTagY - 7.5, rlw, 15);
            ctx.stroke();
            ctx.fillStyle = "#1e40af";`,
  `            ctx.strokeStyle = "rgba(249, 115, 22, 0.55)";
            ctx.lineWidth = 1;
            if (ctx.roundRect) ctx.roundRect(rTagX - rlw / 2, rTagY - 7.5, rlw, 15, 4);
            else ctx.rect(rTagX - rlw / 2, rTagY - 7.5, rlw, 15);
            ctx.stroke();
            ctx.fillStyle = "#c2410c";`,
  'isSecRev: radius R badge border + text amber'
);

// ─────────────────────────────────────────────────────────────────────────────
// 6. Lofted cross-section polygon fill (sec-square, sec-tri, sec-semi, etc.)
//    These are distinct from the revolution slice – keep them sapphire-blue
//    so they look consistent with their own solids.  (No change needed here.)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// 7. showSlice cylinder slice fill (Lát dx representative slice in Quay trục mode)
//    This is the translucent cylinder dx shown in rotation mode.
//    We keep this as a semi-transparent amber to match the slice theme.
// ─────────────────────────────────────────────────────────────────────────────
replaceOrDie(
  `// Draw lateral band - unified sapphire crystal glass
      for (let ai = 0; ai < _nSliceAng; ai++) {
        ctx.beginPath();
        ctx.moveTo(pts1[ai].sx, pts1[ai].sy);
        ctx.lineTo(pts1[ai + 1].sx, pts1[ai + 1].sy);
        ctx.lineTo(pts2[ai + 1].sx, pts2[ai + 1].sy);
        ctx.lineTo(pts2[ai].sx, pts2[ai].sy);
        ctx.closePath();
        ctx.fillStyle = "rgba(191, 219, 254, 0.45)";
        ctx.fill();
      }

      // Front Face
      const pCenter = project(midX, 0, 0);
      ctx.beginPath();
      ctx.moveTo(pCenter.sx, pCenter.sy);
      for (let ai = 0; ai <= _nSliceAng; ai++) ctx.lineTo(pts2[ai].sx, pts2[ai].sy);
      ctx.closePath();
      ctx.fillStyle = "rgba(147, 197, 253, 0.50)";
      ctx.fill();

      // Rim outline (chuẩn nét liền sư phạm cho hình trụ vi phân nhìn thấy)
      ctx.beginPath();
      ctx.moveTo(pts2[0].sx, pts2[0].sy);
      for (let ai = 1; ai <= _nSliceAng; ai++) ctx.lineTo(pts2[ai].sx, pts2[ai].sy);
      if (curSweep >= Math.PI * 2 * 0.98) ctx.closePath();
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // Bán kính r = f(x) từ tâm trục Ox đến đỉnh đồ thị
      const pEdge = project(midX, sR, 0);
      ctx.beginPath();
      ctx.moveTo(pCenter.sx, pCenter.sy);
      ctx.lineTo(pEdge.sx, pEdge.sy);
      ctx.strokeStyle = "#1e40af";
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Điểm tâm và điểm trên đường cong
      ctx.fillStyle = "#1e40af";
      ctx.beginPath(); ctx.arc(pCenter.sx, pCenter.sy, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(pEdge.sx, pEdge.sy, 3.2, 0, Math.PI * 2); ctx.fill();

      // Nhãn r = f(x) và độ dày dx
      ctx.font = "italic bold 12px 'Times New Roman', serif";
      ctx.fillStyle = "#1e40af";`,
  `// Draw lateral band - amber crystal glass (slice distinct from blue solid)
      for (let ai = 0; ai < _nSliceAng; ai++) {
        ctx.beginPath();
        ctx.moveTo(pts1[ai].sx, pts1[ai].sy);
        ctx.lineTo(pts1[ai + 1].sx, pts1[ai + 1].sy);
        ctx.lineTo(pts2[ai + 1].sx, pts2[ai + 1].sy);
        ctx.lineTo(pts2[ai].sx, pts2[ai].sy);
        ctx.closePath();
        ctx.fillStyle = "rgba(254, 215, 170, 0.45)";
        ctx.fill();
      }

      // Front Face
      const pCenter = project(midX, 0, 0);
      ctx.beginPath();
      ctx.moveTo(pCenter.sx, pCenter.sy);
      for (let ai = 0; ai <= _nSliceAng; ai++) ctx.lineTo(pts2[ai].sx, pts2[ai].sy);
      ctx.closePath();
      ctx.fillStyle = "rgba(251, 146, 60, 0.50)";
      ctx.fill();

      // Rim outline (chuẩn nét liền sư phạm cho hình trụ vi phân nhìn thấy)
      ctx.beginPath();
      ctx.moveTo(pts2[0].sx, pts2[0].sy);
      for (let ai = 1; ai <= _nSliceAng; ai++) ctx.lineTo(pts2[ai].sx, pts2[ai].sy);
      if (curSweep >= Math.PI * 2 * 0.98) ctx.closePath();
      ctx.strokeStyle = "#f97316";
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // Bán kính r = f(x) từ tâm trục Ox đến đỉnh đồ thị
      const pEdge = project(midX, sR, 0);
      ctx.beginPath();
      ctx.moveTo(pCenter.sx, pCenter.sy);
      ctx.lineTo(pEdge.sx, pEdge.sy);
      ctx.strokeStyle = "#ea580c";
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Điểm tâm và điểm trên đường cong
      ctx.fillStyle = "#ea580c";
      ctx.beginPath(); ctx.arc(pCenter.sx, pCenter.sy, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(pEdge.sx, pEdge.sy, 3.2, 0, Math.PI * 2); ctx.fill();

      // Nhãn r = f(x) và độ dày dx
      ctx.font = "italic bold 12px 'Times New Roman', serif";
      ctx.fillStyle = "#c2410c";`,
  'showSlice dx cylinder: amber fill, rim, radius dot & label'
);

// ─────────────────────────────────────────────────────────────────────────────
// 8. showSlice dV badge (background amber, text white)
// ─────────────────────────────────────────────────────────────────────────────
replaceOrDie(
  `      ctx.fillStyle = "rgba(217, 119, 6, 0.95)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pBadgeX - bW / 2, pBadgeY - 9, bW, 18, 5);
      else ctx.rect(pBadgeX - bW / 2, pBadgeY - 9, bW, 18);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(dVText, pBadgeX, pBadgeY);`,
  `      ctx.fillStyle = "rgba(249, 115, 22, 0.95)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pBadgeX - bW / 2, pBadgeY - 9, bW, 18, 5);
      else ctx.rect(pBadgeX - bW / 2, pBadgeY - 9, bW, 18);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(dVText, pBadgeX, pBadgeY);`,
  'showSlice dV badge amber background'
);

// ─────────────────────────────────────────────────────────────────────────────
// 9. showSlice Oy branch — radius line + dots + label (was blue)
// ─────────────────────────────────────────────────────────────────────────────
replaceOrDie(
  `      ctx.strokeStyle = "#1e40af"; ctx.lineWidth = 1.8; ctx.setLineDash([4, 3]); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#1e40af";
      ctx.beginPath(); ctx.arc(pCenter.sx, pCenter.sy, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(pEdge.sx, pEdge.sy, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.font = "italic bold 12px 'Times New Roman', serif";
      ctx.fillStyle = "#1e40af";`,
  `      ctx.strokeStyle = "#ea580c"; ctx.lineWidth = 1.8; ctx.setLineDash([4, 3]); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#ea580c";
      ctx.beginPath(); ctx.arc(pCenter.sx, pCenter.sy, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(pEdge.sx, pEdge.sy, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.font = "italic bold 12px 'Times New Roman', serif";
      ctx.fillStyle = "#c2410c";`,
  'showSlice Oy: radius line + dots + label amber'
);

// Write out
fs.copyFileSync(filePath, filePath + '.bak_before_slice_color_distinct');
fs.writeFileSync(filePath, code, 'utf8');
console.log('\nAll done — slice is now amber-orange, solid stays sapphire-blue.');
