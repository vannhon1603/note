const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('dist/assets/index-D9JME9Hm.js');
let code = fs.readFileSync(targetFile, 'utf8');

function replaceOrThrow(target, replacement, desc) {
  if (!code.includes(target)) {
    throw new Error('Target string not found for: ' + desc);
  }
  code = code.replace(target, replacement);
  console.log('✓ Successfully replaced:', desc);
}

// 1. Interactive Cross-Section Polygon for Lofted Solids (Square, Tri, Semi, Circle...)
// Replace amber gradient with sapphire blue gradient
const targetPolyGrad = `        const grad = ctx.createLinearGradient(topPt.sx, topPt.sy, pMidBase.sx, pMidBase.sy);
        grad.addColorStop(0, "rgba(251, 191, 36, 0.95)");
        grad.addColorStop(1, "rgba(245, 158, 11, 0.92)");
        ctx.fillStyle = grad;
        ctx.fill();

        // Smooth clean cross-section (removed diagonal stripes per user request)

        // Contour border
        ctx.beginPath();
        ctx.moveTo(cutPts[0].sx, cutPts[0].sy);
        for (let k = 1; k < cutPts.length; k++) ctx.lineTo(cutPts[k].sx, cutPts[k].sy);
        ctx.closePath();
        ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 2.4;
        ctx.stroke();`;

const replPolyGrad = `        const grad = ctx.createLinearGradient(topPt.sx, topPt.sy, pMidBase.sx, pMidBase.sy);
        grad.addColorStop(0, "rgba(191, 219, 254, 0.85)");
        grad.addColorStop(1, "rgba(147, 197, 253, 0.80)");
        ctx.fillStyle = grad;
        ctx.fill();

        // Smooth clean cross-section (removed diagonal stripes per user request)

        // Contour border - unified sapphire blue
        ctx.beginPath();
        ctx.moveTo(cutPts[0].sx, cutPts[0].sy);
        for (let k = 1; k < cutPts.length; k++) ctx.lineTo(cutPts[k].sx, cutPts[k].sy);
        ctx.closePath();
        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 2.4;
        ctx.stroke();`;

replaceOrThrow(targetPolyGrad, replPolyGrad, 'Lofted cross-section polygon sapphire blue fill & border');

// 2. Drag handle and floating area badge for lofted solids
const targetLoftHandleBadge = `          // ── 3. Tactile Drag Handle at topPt ──
          ctx.save();
          ctx.shadowColor = "rgba(245, 158, 11, 0.35)";
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(topPt.sx, topPt.sy, 7.5, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.strokeStyle = "#d97706";
          ctx.lineWidth = 1.6;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(topPt.sx, topPt.sy, 2.0, 0, Math.PI * 2);
          ctx.fillStyle = "#ea580c";
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
          else if (currentAxis === "sec-wedge2") formPrefix = "S(" + xValStr + ") = (3π/8 - ½)d² ≈ ";
          else if (currentAxis === "sec-tri-iso") formPrefix = "S(" + xValStr + ") = ¼d² ≈ ";
          else formPrefix = "S(" + xValStr + ") ≈ ";
          const badgeText = formPrefix + areaValStr;

          ctx.font = "bold 10px system-ui, sans-serif";
          const bw = ctx.measureText(badgeText).width + 14;
          const bh = 20;
          const badgeY = Math.max(y + 36, topPt.sy - 24 - bh);

          ctx.beginPath();
          ctx.moveTo(topPt.sx, badgeY + bh);
          ctx.lineTo(topPt.sx, topPt.sy - 8.5);
          ctx.strokeStyle = "rgba(217, 119, 6, 0.70)";
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.save();
          ctx.shadowColor = "rgba(15, 23, 42, 0.10)";
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 2;
          ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
          if (ctx.roundRect) ctx.roundRect(topPt.sx - bw / 2, badgeY, bw, bh, 5);
          else ctx.rect(topPt.sx - bw / 2, badgeY, bw, bh);
          ctx.fill();
          ctx.strokeStyle = "rgba(245, 158, 11, 0.75)";
          ctx.lineWidth = 1.2;
          if (ctx.roundRect) ctx.roundRect(topPt.sx - bw / 2, badgeY, bw, bh, 5);
          else ctx.rect(topPt.sx - bw / 2, badgeY, bw, bh);
          ctx.stroke();
          ctx.restore();

          ctx.fillStyle = "#b45309";`;

const replLoftHandleBadge = `          // ── 3. Tactile Drag Handle at topPt ──
          ctx.save();
          ctx.shadowColor = "rgba(37, 99, 235, 0.35)";
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(topPt.sx, topPt.sy, 7.5, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.strokeStyle = "#2563eb";
          ctx.lineWidth = 1.6;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(topPt.sx, topPt.sy, 2.0, 0, Math.PI * 2);
          ctx.fillStyle = "#1d4ed8";
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
          else if (currentAxis === "sec-wedge2") formPrefix = "S(" + xValStr + ") = (3π/8 - ½)d² ≈ ";
          else if (currentAxis === "sec-tri-iso") formPrefix = "S(" + xValStr + ") = ¼d² ≈ ";
          else formPrefix = "S(" + xValStr + ") ≈ ";
          const badgeText = formPrefix + areaValStr;

          ctx.font = "bold 10px system-ui, sans-serif";
          const bw = ctx.measureText(badgeText).width + 14;
          const bh = 20;
          const badgeY = Math.max(y + 36, topPt.sy - 24 - bh);

          ctx.beginPath();
          ctx.moveTo(topPt.sx, badgeY + bh);
          ctx.lineTo(topPt.sx, topPt.sy - 8.5);
          ctx.strokeStyle = "rgba(37, 99, 235, 0.50)";
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.save();
          ctx.shadowColor = "rgba(15, 23, 42, 0.10)";
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 2;
          ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
          if (ctx.roundRect) ctx.roundRect(topPt.sx - bw / 2, badgeY, bw, bh, 5);
          else ctx.rect(topPt.sx - bw / 2, badgeY, bw, bh);
          ctx.fill();
          ctx.strokeStyle = "rgba(37, 99, 235, 0.40)";
          ctx.lineWidth = 1.2;
          if (ctx.roundRect) ctx.roundRect(topPt.sx - bw / 2, badgeY, bw, bh, 5);
          else ctx.rect(topPt.sx - bw / 2, badgeY, bw, bh);
          ctx.stroke();
          ctx.restore();

          ctx.fillStyle = "#1e40af";`;

replaceOrThrow(targetLoftHandleBadge, replLoftHandleBadge, 'Lofted drag handle & floating badge sapphire blue');

// 3. Circular cross section for isSecRev (sec-ox, sec-oy)
const targetSecRevGhost = `          ctx.strokeStyle = "rgba(245, 158, 11, 0.65)";
          ctx.lineWidth = 1.4;
          ctx.setLineDash([4, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();

          if (Ri > 0.001) {
            const ghostInnerArc = [];
            for (let gi = 0; gi <= nGhost; gi++) {
              const ang = curSweepRad + (gi / nGhost) * (Math.PI * 2 - curSweepRad);
              const p = isRevY
                ? project(Ri * Math.cos(ang), cutCoord, Ri * Math.sin(ang))
                : project(cutCoord, Ri * Math.cos(ang), Ri * Math.sin(ang));
              ghostInnerArc.push(p);
            }
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(ghostInnerArc[0].sx, ghostInnerArc[0].sy);
            for (let k = 1; k < ghostInnerArc.length; k++) ctx.lineTo(ghostInnerArc[k].sx, ghostInnerArc[k].sy);
            ctx.strokeStyle = "rgba(217, 119, 6, 0.45)";`;

const replSecRevGhost = `          ctx.strokeStyle = "rgba(100, 116, 139, 0.65)";
          ctx.lineWidth = 1.4;
          ctx.setLineDash([4, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();

          if (Ri > 0.001) {
            const ghostInnerArc = [];
            for (let gi = 0; gi <= nGhost; gi++) {
              const ang = curSweepRad + (gi / nGhost) * (Math.PI * 2 - curSweepRad);
              const p = isRevY
                ? project(Ri * Math.cos(ang), cutCoord, Ri * Math.sin(ang))
                : project(cutCoord, Ri * Math.cos(ang), Ri * Math.sin(ang));
              ghostInnerArc.push(p);
            }
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(ghostInnerArc[0].sx, ghostInnerArc[0].sy);
            for (let k = 1; k < ghostInnerArc.length; k++) ctx.lineTo(ghostInnerArc[k].sx, ghostInnerArc[k].sy);
            ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";`;

replaceOrThrow(targetSecRevGhost, replSecRevGhost, 'isSecRev ghost arcs neutral dashed');

// 4. isSecRev slice fill, borders, and dot
const targetSecRevSlice = `          // Illuminated glowing amber-gold gradient
          const grad = ctx.createLinearGradient(topPt.sx, topPt.sy, pCenter.sx, pCenter.sy + (pCenter.sy - topPt.sy));
          grad.addColorStop(0, "rgba(251, 191, 36, 0.95)");
          grad.addColorStop(1, "rgba(245, 158, 11, 0.92)");
          ctx.fillStyle = grad;
          ctx.fill();

// Smooth clean cross-section (removed diagonal stripes per user request)

          // Crisp golden amber contour border (chuẩn nét liền sư phạm cho lát cắt nhìn thấy)
          if (isFullRev) {
            ctx.beginPath();
            ctx.moveTo(outerArc[0].sx, outerArc[0].sy);
            for (let ci = 1; ci <= nCirclePts; ci++) ctx.lineTo(outerArc[ci].sx, outerArc[ci].sy);
            ctx.closePath();
            ctx.strokeStyle = "#d97706";
            ctx.lineWidth = 2.4;
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.moveTo(slicePoly[0].sx, slicePoly[0].sy);
            for (let k = 1; k < slicePoly.length; k++) ctx.lineTo(slicePoly[k].sx, slicePoly[k].sy);
            ctx.closePath();
            ctx.strokeStyle = "#d97706";
            ctx.lineWidth = 2.4;
            ctx.stroke();
          }

          // Inner border if full washer
          if (isFullRev && innerCircle) {
            ctx.beginPath();
            ctx.moveTo(innerCircle[0].sx, innerCircle[0].sy);
            for (let k = 1; k < innerCircle.length; k++) ctx.lineTo(innerCircle[k].sx, innerCircle[k].sy);
            ctx.closePath();
            ctx.strokeStyle = "#b45309";
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }
          ctx.restore();
        } else if (sweepDeg <= 3) {
          // If not rotated, draw initial 2D segment in Oxy plane
          const pEdge0 = outerArc[0];
          const pInner0 = Ri > 0.001
            ? (isRevY ? project(Ri, cutCoord, 0) : project(cutCoord, Ri, 0))
            : pCenter;
          ctx.beginPath();
          ctx.moveTo(pInner0.sx, pInner0.sy);
          ctx.lineTo(pEdge0.sx, pEdge0.sy);
          ctx.strokeStyle = "#d97706";
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // ── 3. Center point dot ──
        ctx.fillStyle = "#ea580c";`;

const replSecRevSlice = `          // Illuminated crystalline sapphire blue gradient
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
          }
          ctx.restore();
        } else if (sweepDeg <= 3) {
          // If not rotated, draw initial 2D segment in Oxy plane
          const pEdge0 = outerArc[0];
          const pInner0 = Ri > 0.001
            ? (isRevY ? project(Ri, cutCoord, 0) : project(cutCoord, Ri, 0))
            : pCenter;
          ctx.beginPath();
          ctx.moveTo(pInner0.sx, pInner0.sy);
          ctx.lineTo(pEdge0.sx, pEdge0.sy);
          ctx.strokeStyle = "#2563eb";
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // ── 3. Center point dot ──
        ctx.fillStyle = "#2563eb";`;

replaceOrThrow(targetSecRevSlice, replSecRevSlice, 'isSecRev slice fill, borders & dot sapphire blue');

// 5. isSecRev radius badge and handle
const targetSecRevHandle = `            ctx.strokeStyle = "rgba(245, 158, 11, 0.70)";
            ctx.lineWidth = 1;
            if (ctx.roundRect) ctx.roundRect(rTagX - rlw / 2, rTagY - 7.5, rlw, 15, 4);
            else ctx.rect(rTagX - rlw / 2, rTagY - 7.5, rlw, 15);
            ctx.stroke();
            ctx.fillStyle = "#b45309";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(rLabel, rTagX, rTagY);
          }

          // ── 4. Tactile Drag Handle at topPt (Apex) - Sleek & Compact ──
          ctx.save();
          ctx.shadowColor = "rgba(245, 158, 11, 0.35)";
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(topPt.sx, topPt.sy, 6.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(245, 158, 11, 0.15)";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(topPt.sx, topPt.sy, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.strokeStyle = "#d97706";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(topPt.sx, topPt.sy, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = "#ea580c";
          ctx.fill();
          ctx.restore();

          // ── 5. Floating Formula & Area Badge: S(x) ──
          const xValStr = (Math.round(cutCoord * 10) / 10);
          const areaValStr = (Math.round(cutArea * 100) / 100);
          let badgeText = "";
          if (isFullRev) {
            badgeText = (Ri > 0.001 ? "S(" + xValStr + ") = π(R²-r²) ≈ " : "S(" + xValStr + ") = πR² ≈ ") + areaValStr;
          } else {
            const degStr = Math.round(sweepDeg) + "°";
            badgeText = "S(" + xValStr + ") ≈ " + areaValStr + " (" + degStr + ")";
          }
          
          ctx.font = "bold 10px system-ui, sans-serif";
          const bw = ctx.measureText(badgeText).width + 14;
          const bh = 20;
          const badgeY = Math.max(y + 36, topPt.sy - 24 - bh);
          
          ctx.beginPath();
          ctx.moveTo(topPt.sx, badgeY + bh);
          ctx.lineTo(topPt.sx, topPt.sy - 8.5);
          ctx.strokeStyle = "rgba(217, 119, 6, 0.70)";
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
          ctx.strokeStyle = "rgba(245, 158, 11, 0.75)";
          ctx.lineWidth = 1.2;
          if (ctx.roundRect) ctx.roundRect(topPt.sx - bw / 2, badgeY, bw, bh, 5);
          else ctx.rect(topPt.sx - bw / 2, badgeY, bw, bh);
          ctx.stroke();
          ctx.restore();

          ctx.fillStyle = "#b45309";`;

const replSecRevHandle = `            ctx.strokeStyle = "rgba(37, 99, 235, 0.40)";
            ctx.lineWidth = 1;
            if (ctx.roundRect) ctx.roundRect(rTagX - rlw / 2, rTagY - 7.5, rlw, 15, 4);
            else ctx.rect(rTagX - rlw / 2, rTagY - 7.5, rlw, 15);
            ctx.stroke();
            ctx.fillStyle = "#1e40af";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(rLabel, rTagX, rTagY);
          }

          // ── 4. Tactile Drag Handle at topPt (Apex) - Sleek & Compact ──
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
          ctx.restore();

          // ── 5. Floating Formula & Area Badge: S(x) ──
          const xValStr = (Math.round(cutCoord * 10) / 10);
          const areaValStr = (Math.round(cutArea * 100) / 100);
          let badgeText = "";
          if (isFullRev) {
            badgeText = (Ri > 0.001 ? "S(" + xValStr + ") = π(R²-r²) ≈ " : "S(" + xValStr + ") = πR² ≈ ") + areaValStr;
          } else {
            const degStr = Math.round(sweepDeg) + "°";
            badgeText = "S(" + xValStr + ") ≈ " + areaValStr + " (" + degStr + ")";
          }
          
          ctx.font = "bold 10px system-ui, sans-serif";
          const bw = ctx.measureText(badgeText).width + 14;
          const bh = 20;
          const badgeY = Math.max(y + 36, topPt.sy - 24 - bh);
          
          ctx.beginPath();
          ctx.moveTo(topPt.sx, badgeY + bh);
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

          ctx.fillStyle = "#1e40af";`;

replaceOrThrow(targetSecRevHandle, replSecRevHandle, 'isSecRev radius badge, handle & formula badge sapphire blue');

// 6. isSecRev axis tag color
const targetSecRevAxisTag = `        ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(atx - atw / 2, aty - 7.5, atw, 15, 4);
        else ctx.rect(atx - atw / 2, aty - 7.5, atw, 15);
        ctx.fill();
        ctx.strokeStyle = "rgba(37, 99, 235, 0.35)";
        ctx.lineWidth = 1;
        if (ctx.roundRect) ctx.roundRect(atx - atw / 2, aty - 7.5, atw, 15, 4);
        else ctx.rect(atx - atw / 2, aty - 7.5, atw, 15);
        ctx.stroke();
        ctx.fillStyle = "#b45309";`;

const replSecRevAxisTag = `        ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(atx - atw / 2, aty - 7.5, atw, 15, 4);
        else ctx.rect(atx - atw / 2, aty - 7.5, atw, 15);
        ctx.fill();
        ctx.strokeStyle = "rgba(37, 99, 235, 0.35)";
        ctx.lineWidth = 1;
        if (ctx.roundRect) ctx.roundRect(atx - atw / 2, aty - 7.5, atw, 15, 4);
        else ctx.rect(atx - atw / 2, aty - 7.5, atw, 15);
        ctx.stroke();
        ctx.fillStyle = "#1e40af";`;

replaceOrThrow(targetSecRevAxisTag, replSecRevAxisTag, 'isSecRev axis tag text color blue');

// 7. Section 7: Representative differential slice dx
const targetSliceDx = `      // Draw lateral band
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

      // Rim outline (chuẩn nét liền sư phạm cho hình trụ vi phân nhìn thấy)
      ctx.beginPath();
      ctx.moveTo(pts2[0].sx, pts2[0].sy);
      for (let ai = 1; ai <= _nSliceAng; ai++) ctx.lineTo(pts2[ai].sx, pts2[ai].sy);
      if (curSweep >= Math.PI * 2 * 0.98) ctx.closePath();
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

      // Nhãn thể tích vi phân dV (gọn gàng, thoáng đãng, sắc nét)
      const pBadgeX = pCenter.sx + 24;
      const pBadgeY = pCenter.sy + 26;
      const dVText = "dV ≈ π[f(x)]²dx";
      ctx.font = "bold 10.5px system-ui, sans-serif";
      const bW = ctx.measureText(dVText).width + 12;
      ctx.fillStyle = "rgba(217, 119, 6, 0.95)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pBadgeX - bW / 2, pBadgeY - 9, bW, 18, 5);
      else ctx.rect(pBadgeX - bW / 2, pBadgeY - 9, bW, 18);
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
      ctx.fillStyle = "#92400e";`;

const replSliceDx = `      // Draw lateral band - unified sapphire crystal glass
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
      ctx.fillStyle = "rgba(147, 197, 253, 0.55)";
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
      ctx.strokeStyle = "#1d4ed8";
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Điểm tâm và điểm trên đường cong
      ctx.fillStyle = "#1d4ed8";
      ctx.beginPath(); ctx.arc(pCenter.sx, pCenter.sy, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(pEdge.sx, pEdge.sy, 3.2, 0, Math.PI * 2); ctx.fill();

      // Nhãn r = f(x) và độ dày dx
      ctx.font = "italic bold 12px 'Times New Roman', serif";
      ctx.fillStyle = "#1e40af";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("r = f(x)", (pCenter.sx + pEdge.sx) / 2 + 6, (pCenter.sy + pEdge.sy) / 2);

      // Nhãn thể tích vi phân dV (gọn gàng, thoáng đãng, sắc nét)
      const pBadgeX = pCenter.sx + 24;
      const pBadgeY = pCenter.sy + 26;
      const dVText = "dV ≈ π[f(x)]²dx";
      ctx.font = "bold 10.5px system-ui, sans-serif";
      const bW = ctx.measureText(dVText).width + 12;
      ctx.fillStyle = "rgba(37, 99, 235, 0.95)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pBadgeX - bW / 2, pBadgeY - 9, bW, 18, 5);
      else ctx.rect(pBadgeX - bW / 2, pBadgeY - 9, bW, 18);
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
      ctx.strokeStyle = "#1d4ed8"; ctx.lineWidth = 1.8; ctx.setLineDash([4, 3]); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#1d4ed8";
      ctx.beginPath(); ctx.arc(pCenter.sx, pCenter.sy, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(pEdge.sx, pEdge.sy, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.font = "italic bold 12px 'Times New Roman', serif";
      ctx.fillStyle = "#1e40af";`;

replaceOrThrow(targetSliceDx, replSliceDx, 'Section 7 representative slice dx sapphire blue');

// 8. Stepped Riemann Prismatic Slices (Section 3)
const targetRiemann = `          faces.push({
            z: qz,
            pts: quadPts,
            fill: "hsla(" + hue + ",75%,72%,0.45)",
            stroke: "hsla(" + hue + ",80%,40%,0.5)",
            type: "riemann-side"
          });
        }
        faces.push({
          z: zMid,
          pts: frontPts,
          fill: "hsla(" + hue + ",85%,68%,0.55)",
          stroke: "hsla(" + hue + ",85%,35%,0.75)",
          strokeWidth: 1.2,
          type: "riemann-face"
        });`;

const replRiemann = `          faces.push({
            z: qz,
            pts: quadPts,
            fill: "hsla(" + hue + ",82%,54%,0.45)",
            stroke: "hsla(" + hue + ",85%,32%,0.6)",
            type: "riemann-side"
          });
        }
        faces.push({
          z: zMid,
          pts: frontPts,
          fill: "hsla(" + hue + ",85%,48%,0.55)",
          stroke: "hsla(" + hue + ",90%,28%,0.8)",
          strokeWidth: 1.2,
          type: "riemann-face"
        });`;

replaceOrThrow(targetRiemann, replRiemann, 'Riemann slices rich sapphire glass shading');

// 9. Tab 2 (Lát cắt) active gradient
const targetTab2Grad = `    if (isCross) {
      // Active state: Vibrant ocean sapphire gradient
      const gradTab2 = ctx.createLinearGradient(tab2X, tabY, tab2X + tab2W, tabY + tabH);
      gradTab2.addColorStop(0, "#0284c7");
      gradTab2.addColorStop(1, "#0369a1");
      ctx.fillStyle = gradTab2;
      ctx.shadowColor = "rgba(2, 132, 199, 0.35)";`;

const replTab2Grad = `    if (isCross) {
      // Active state: Vibrant sapphire gradient (identical to Tab 1)
      const gradTab2 = ctx.createLinearGradient(tab2X, tabY, tab2X + tab2W, tabY + tabH);
      gradTab2.addColorStop(0, "#2563eb");
      gradTab2.addColorStop(1, "#1d4ed8");
      ctx.fillStyle = gradTab2;
      ctx.shadowColor = "rgba(37, 99, 235, 0.35)";`;

replaceOrThrow(targetTab2Grad, replTab2Grad, 'Tab 2 Lát cắt identical sapphire gradient to Tab 1');

// 10. Quick Formula Card on Canvas
const targetQFCard = `      ctx.fillStyle = "rgba(255, 251, 235, 0.96)";
      ctx.strokeStyle = "rgba(245, 158, 11, 0.75)";
      ctx.lineWidth = 1.2;
      ctx.shadowColor = "rgba(180, 83, 9, 0.15)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(cardX, cardY, cardW, cardH, 6);
      else ctx.rect(cardX, cardY, cardW, cardH);
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.stroke();

      // Vector Zap Icon on canvas
      ctx.fillStyle = "#b45309";
      ctx.beginPath();
      const zx = cardX + 8, zy = cardY + 5.5;
      ctx.moveTo(zx + 3.8, zy);
      ctx.lineTo(zx, zy + 5.2);
      ctx.lineTo(zx + 3.2, zy + 5.2);
      ctx.lineTo(zx + 2.2, zy + 9.5);
      ctx.lineTo(zx + 7, zy + 4);
      ctx.lineTo(zx + 3.8, zy + 4);
      ctx.closePath();
      ctx.fill();

      // Drag grip indicator dots (top-right corner of card)
      ctx.fillStyle = "rgba(180, 83, 9, 0.45)";
      const gx = cardX + cardW - 14, gy = cardY + 6.5;
      for (let gr = 0; gr < 2; gr++) {
        for (let gc = 0; gc < 3; gc++) {
          ctx.beginPath();
          ctx.arc(gx + gr * 3.5, gy + gc * 3.5, 1.0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.font = "800 8.5px system-ui, sans-serif";
      ctx.fillStyle = "#b45309";
      ctx.fillText(titleTxt, cardX + 18, cardY + 5);

      ctx.font = "bold 10px system-ui, sans-serif";
      ctx.fillStyle = "#78350f";
      ctx.fillText(fTxt, cardX + 8, cardY + 17);

      if (cTxt) {
        ctx.font = "500 9px system-ui, sans-serif";
        ctx.fillStyle = "#92400e";
        ctx.fillText(cTxt, cardX + 8, cardY + 31);
      }`;

const replQFCard = `      ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
      ctx.strokeStyle = "rgba(37, 99, 235, 0.35)";
      ctx.lineWidth = 1.2;
      ctx.shadowColor = "rgba(37, 99, 235, 0.12)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(cardX, cardY, cardW, cardH, 6);
      else ctx.rect(cardX, cardY, cardW, cardH);
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.stroke();

      // Vector Zap Icon on canvas
      ctx.fillStyle = "#2563eb";
      ctx.beginPath();
      const zx = cardX + 8, zy = cardY + 5.5;
      ctx.moveTo(zx + 3.8, zy);
      ctx.lineTo(zx, zy + 5.2);
      ctx.lineTo(zx + 3.2, zy + 5.2);
      ctx.lineTo(zx + 2.2, zy + 9.5);
      ctx.lineTo(zx + 7, zy + 4);
      ctx.lineTo(zx + 3.8, zy + 4);
      ctx.closePath();
      ctx.fill();

      // Drag grip indicator dots (top-right corner of card)
      ctx.fillStyle = "rgba(37, 99, 235, 0.40)";
      const gx = cardX + cardW - 14, gy = cardY + 6.5;
      for (let gr = 0; gr < 2; gr++) {
        for (let gc = 0; gc < 3; gc++) {
          ctx.beginPath();
          ctx.arc(gx + gr * 3.5, gy + gc * 3.5, 1.0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.font = "800 8.5px system-ui, sans-serif";
      ctx.fillStyle = "#1d4ed8";
      ctx.fillText(titleTxt, cardX + 18, cardY + 5);

      ctx.font = "bold 10px system-ui, sans-serif";
      ctx.fillStyle = "#1e40af";
      ctx.fillText(fTxt, cardX + 8, cardY + 17);

      if (cTxt) {
        ctx.font = "500 9px system-ui, sans-serif";
        ctx.fillStyle = "#1e3a8a";
        ctx.fillText(cTxt, cardX + 8, cardY + 31);
      }`;

replaceOrThrow(targetQFCard, replQFCard, 'Quick Formula Card on canvas sapphire blue');

// 11. Quick Formula Box in VolumeDialog
const targetDialogQF = `              f.jsxs("label",{style:{display:"inline-flex",alignItems:"center",gap:"5px",fontSize:"12px",fontWeight:"700",color:showQuickFormula?"#b45309":"#64748b",cursor:"pointer",userSelect:"none"},children:[
                f.jsx("input",{type:"checkbox",checked:showQuickFormula,onChange:e=>setShowQuickFormula(e.target.checked),style:{accentColor:"#d97706",cursor:"pointer",width:"14px",height:"14px"}}),
                f.jsx(ZapIcon,{size:13,color:showQuickFormula?"#d97706":"#94a3b8"}),
                "Công thức nhanh"
              ]}),
              f.jsxs("label",{style:{display:"inline-flex",alignItems:"center",gap:"5px",fontSize:"12px",fontWeight:"700",color:showSolution?"#059669":"#64748b",cursor:"pointer",userSelect:"none"},children:[
                f.jsx("input",{type:"checkbox",checked:showSolution,onChange:e=>setShowSolution(e.target.checked),style:{accentColor:"#059669",cursor:"pointer",width:"14px",height:"14px"}}),
                f.jsx(DocIcon,{size:13,color:showSolution?"#059669":"#94a3b8"}),
                "Cách giải chi tiết"
              ]})
            ]}),
            showQuickFormula&&f.jsxs("div",{style:{background:"linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",border:"1px solid #fde68a",borderRadius:"8px",padding:"7px 9px",display:"flex",flexDirection:"column",gap:"3px"},children:[
              f.jsxs("div",{style:{fontSize:"11px",fontWeight:"800",color:"#b45309",display:"flex",alignItems:"center",gap:"5px"},children:[
                f.jsx(ZapIcon,{size:13,color:"#b45309"}),
                "CÔNG THỨC TÍNH NHANH:"
              ]}),
              f.jsx("div",{style:{fontFamily:"system-ui, -apple-system, sans-serif",fontSize:"12px",fontWeight:"700",color:"#92400e",lineHeight:"1.35"},children:ped.quickFormula}),
              ped.quickCalc&&f.jsx("div",{style:{fontSize:"11px",color:"#78350f",fontWeight:"600",marginTop:"2px"},children:ped.quickCalc})
            ]}),`;

const replDialogQF = `              f.jsxs("label",{style:{display:"inline-flex",alignItems:"center",gap:"5px",fontSize:"12px",fontWeight:"700",color:showQuickFormula?"#1d4ed8":"#64748b",cursor:"pointer",userSelect:"none"},children:[
                f.jsx("input",{type:"checkbox",checked:showQuickFormula,onChange:e=>setShowQuickFormula(e.target.checked),style:{accentColor:"#2563eb",cursor:"pointer",width:"14px",height:"14px"}}),
                f.jsx(ZapIcon,{size:13,color:showQuickFormula?"#2563eb":"#94a3b8"}),
                "Công thức nhanh"
              ]}),
              f.jsxs("label",{style:{display:"inline-flex",alignItems:"center",gap:"5px",fontSize:"12px",fontWeight:"700",color:showSolution?"#059669":"#64748b",cursor:"pointer",userSelect:"none"},children:[
                f.jsx("input",{type:"checkbox",checked:showSolution,onChange:e=>setShowSolution(e.target.checked),style:{accentColor:"#059669",cursor:"pointer",width:"14px",height:"14px"}}),
                f.jsx(DocIcon,{size:13,color:showSolution?"#059669":"#94a3b8"}),
                "Cách giải chi tiết"
              ]})
            ]}),
            showQuickFormula&&f.jsxs("div",{style:{background:"linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",border:"1px solid #bfdbfe",borderRadius:"8px",padding:"7px 9px",display:"flex",flexDirection:"column",gap:"3px"},children:[
              f.jsxs("div",{style:{fontSize:"11px",fontWeight:"800",color:"#1d4ed8",display:"flex",alignItems:"center",gap:"5px"},children:[
                f.jsx(ZapIcon,{size:13,color:"#2563eb"}),
                "CÔNG THỨC TÍNH NHANH:"
              ]}),
              f.jsx("div",{style:{fontFamily:"system-ui, -apple-system, sans-serif",fontSize:"12px",fontWeight:"700",color:"#1e40af",lineHeight:"1.35"},children:ped.quickFormula}),
              ped.quickCalc&&f.jsx("div",{style:{fontSize:"11px",color:"#1e3a8a",fontWeight:"600",marginTop:"2px"},children:ped.quickCalc})
            ]}),`;

replaceOrThrow(targetDialogQF, replDialogQF, 'VolumeDialog quick formula box sapphire blue');

// 12. 360 Rotation handle button on canvas
const targetRotBtn = `  cs._rotHandle={x:rotPt.x, y:rotPt.y, r:14};
  t.save();
  t.shadowColor="rgba(234, 88, 12, 0.35)";
  t.shadowBlur=8;
  t.beginPath();
  t.arc(rotPt.x, rotPt.y, 12, 0, Math.PI*2);
  t.fillStyle="#ea580c";
  t.fill();
  t.strokeStyle="#ffffff";
  t.lineWidth=2;
  t.stroke();
  t.restore();`;

const replRotBtn = `  cs._rotHandle={x:rotPt.x, y:rotPt.y, r:14};
  t.save();
  t.shadowColor="rgba(37, 99, 235, 0.35)";
  t.shadowBlur=8;
  t.beginPath();
  t.arc(rotPt.x, rotPt.y, 12, 0, Math.PI*2);
  t.fillStyle="#2563eb";
  t.fill();
  t.strokeStyle="#ffffff";
  t.lineWidth=2;
  t.stroke();
  t.restore();`;

replaceOrThrow(targetRotBtn, replRotBtn, '360 rotation handle button sapphire blue');

// 13. Negative Oz axis
const targetOzNeg = `ctx.strokeStyle = isCross ? "rgba(8, 145, 178, 0.45)" : "rgba(148, 163, 184, 0.4)";`;
const replOzNeg = `ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";`;
replaceOrThrow(targetOzNeg, replOzNeg, 'Negative Oz axis neutral gray');

// Write updated file
fs.writeFileSync(targetFile, code, 'utf8');
console.log('🎉 ALL CROSS-SECTION VOLUME COLORS HARMONIZED WITH REVOLUTION SOLIDS SUCCESSFULLY!');
