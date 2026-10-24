const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('dist/assets/index-D9JME9Hm.js');
let code = fs.readFileSync(targetFile, 'utf8');

// Backup
fs.writeFileSync(targetFile + '.bak_ruby_color', code, 'utf8');

function replaceOrThrow(target, replacement, desc) {
  if (!code.includes(target)) {
    throw new Error('Target string not found for: ' + desc);
  }
  code = code.replace(target, replacement);
  console.log('✓ Successfully replaced:', desc);
}

// 1. Cap fill & stroke in Section 3
const targetCapFill = 'fill: thCap === 0 ? (isRevOx ? "rgba(186, 230, 253, 0.35)" : "rgba(167, 243, 208, 0.35)") : (isRevOx ? "rgba(254, 243, 199, 0.42)" : "rgba(254, 215, 170, 0.42)"),\n          stroke: thCap === 0 ? (isRevOx ? "rgba(14, 165, 233, 0.85)" : "rgba(5, 150, 105, 0.85)") : (isRevOx ? "rgba(245, 158, 11, 0.9)" : "rgba(234, 88, 12, 0.9)"),';
const replCapFill = 'fill: thCap === 0 ? (isRevOx ? "rgba(186, 230, 253, 0.35)" : "rgba(167, 243, 208, 0.35)") : (isRevOx ? "rgba(255, 228, 230, 0.45)" : "rgba(255, 228, 230, 0.45)"),\n          stroke: thCap === 0 ? (isRevOx ? "rgba(14, 165, 233, 0.85)" : "rgba(5, 150, 105, 0.85)") : (isRevOx ? "rgba(225, 29, 72, 0.95)" : "rgba(225, 29, 72, 0.95)"),';
replaceOrThrow(targetCapFill, replCapFill, 'Cap fill and stroke vibrant ruby');

// 2. Section 6: Circular/Sector Cross-Section at cutCoord (isSecRev)
const targetSecRevSlice = `          // 3. Draw Un-swept Ghost Trajectory Guide (360° circle dashed outline) if sweepDeg < 355
        if (!isFullRev && sweepDeg < 355) {
          const ghostArc = [];
          const nGhost = Math.max(16, Math.round(48 * (1 - sweepDeg / 360)));
          for (let gi = 0; gi <= nGhost; gi++) {
            const ang = curSweepRad + (gi / nGhost) * (Math.PI * 2 - curSweepRad);
            const p = isRevY
              ? project(Ro * Math.cos(ang), cutCoord, Ro * Math.sin(ang))
              : project(cutCoord, Ro * Math.cos(ang), Ro * Math.sin(ang));
            ghostArc.push(p);
          }
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(ghostArc[0].sx, ghostArc[0].sy);
          for (let k = 1; k < ghostArc.length; k++) ctx.lineTo(ghostArc[k].sx, ghostArc[k].sy);
          ctx.strokeStyle = "rgba(217, 119, 6, 0.45)";
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
            ctx.strokeStyle = "rgba(180, 83, 9, 0.3)";
            ctx.lineWidth = 1.2;
            ctx.setLineDash([3, 2]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
          }
        }

        // 4. Draw Slice / Sector Fill with Gradient + SGK Cross-hatching
        if (slicePoly.length >= 3 && sweepDeg > 3) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(slicePoly[0].sx, slicePoly[0].sy);
          for (let k = 1; k < slicePoly.length; k++) ctx.lineTo(slicePoly[k].sx, slicePoly[k].sy);
          ctx.closePath();

          if (isFullRev && innerCircle) {
            ctx.moveTo(innerCircle[0].sx, innerCircle[0].sy);
            for (let k = 1; k < innerCircle.length; k++) ctx.lineTo(innerCircle[k].sx, innerCircle[k].sy);
            ctx.closePath();
          }

          // Illuminated amber-gold gradient
          const grad = ctx.createLinearGradient(topPt.sx, topPt.sy, pCenter.sx, pCenter.sy + (pCenter.sy - topPt.sy));
          grad.addColorStop(0, "rgba(251, 191, 36, 0.92)");
          grad.addColorStop(1, "rgba(217, 119, 6, 0.85)");
          ctx.fillStyle = grad;
          ctx.fill();

          // Subtle hatching lines across slice (vân gạch chéo chuẩn SGK)
          ctx.save();
          ctx.clip();
          ctx.strokeStyle = "rgba(180, 83, 9, 0.22)";
          ctx.lineWidth = 1;
          let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
          for (const pt of slicePoly) {
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

          // Crisp contour border
          ctx.beginPath();
          ctx.moveTo(slicePoly[0].sx, slicePoly[0].sy);
          for (let k = 1; k < slicePoly.length; k++) ctx.lineTo(slicePoly[k].sx, slicePoly[k].sy);
          ctx.closePath();
          ctx.strokeStyle = "#b45309";
          ctx.lineWidth = 2.4;
          ctx.stroke();`;

const replSecRevSlice = `          // 3. Draw Un-swept Ghost Trajectory Guide (360° circle dashed outline) if sweepDeg < 355
        if (!isFullRev && sweepDeg < 355) {
          const ghostArc = [];
          const nGhost = Math.max(16, Math.round(48 * (1 - sweepDeg / 360)));
          for (let gi = 0; gi <= nGhost; gi++) {
            const ang = curSweepRad + (gi / nGhost) * (Math.PI * 2 - curSweepRad);
            const p = isRevY
              ? project(Ro * Math.cos(ang), cutCoord, Ro * Math.sin(ang))
              : project(cutCoord, Ro * Math.cos(ang), Ro * Math.sin(ang));
            ghostArc.push(p);
          }
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(ghostArc[0].sx, ghostArc[0].sy);
          for (let k = 1; k < ghostArc.length; k++) ctx.lineTo(ghostArc[k].sx, ghostArc[k].sy);
          ctx.strokeStyle = "rgba(225, 29, 72, 0.50)";
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
            ctx.strokeStyle = "rgba(190, 18, 60, 0.35)";
            ctx.lineWidth = 1.2;
            ctx.setLineDash([3, 2]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
          }
        }

        // 4. Draw Slice / Sector Fill with Gradient + SGK Cross-hatching
        if (slicePoly.length >= 3 && sweepDeg > 3) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(slicePoly[0].sx, slicePoly[0].sy);
          for (let k = 1; k < slicePoly.length; k++) ctx.lineTo(slicePoly[k].sx, slicePoly[k].sy);
          ctx.closePath();

          if (isFullRev && innerCircle) {
            ctx.moveTo(innerCircle[0].sx, innerCircle[0].sy);
            for (let k = 1; k < innerCircle.length; k++) ctx.lineTo(innerCircle[k].sx, innerCircle[k].sy);
            ctx.closePath();
          }

          // Illuminated vibrant ruby-rose gradient
          const grad = ctx.createLinearGradient(topPt.sx, topPt.sy, pCenter.sx, pCenter.sy + (pCenter.sy - topPt.sy));
          grad.addColorStop(0, "rgba(251, 113, 133, 0.95)");
          grad.addColorStop(1, "rgba(225, 29, 72, 0.90)");
          ctx.fillStyle = grad;
          ctx.fill();

          // Subtle hatching lines across slice (vân gạch chéo chuẩn SGK)
          ctx.save();
          ctx.clip();
          ctx.strokeStyle = "rgba(159, 18, 57, 0.28)";
          ctx.lineWidth = 1;
          let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
          for (const pt of slicePoly) {
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

          // Crisp contour border
          ctx.beginPath();
          ctx.moveTo(slicePoly[0].sx, slicePoly[0].sy);
          for (let k = 1; k < slicePoly.length; k++) ctx.lineTo(slicePoly[k].sx, slicePoly[k].sy);
          ctx.closePath();
          ctx.strokeStyle = "#be123c";
          ctx.lineWidth = 2.4;
          ctx.stroke();`;
replaceOrThrow(targetSecRevSlice, replSecRevSlice, 'Section 6 isSecRev slice ruby styling');

// 3. Section 6: Inner border, initial segment, tactile handle, and badge
const targetSecRevHandle = `          // Inner border if full washer
          if (isFullRev && innerCircle) {
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
          ctx.strokeStyle = "#b45309";
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // ── 3. Radius Dimension Line: from center directly to topPt (Apex) ──
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
        ctx.beginPath();
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

        // ── 5. Floating Formula & Area Badge: S(x) ──
        const xValStr = (Math.round(cutCoord * 10) / 10);
        const areaValStr = (Math.round(cutArea * 100) / 100);
        let badgeText = "";
        if (isFullRev) {
          badgeText = Ri > 0.001
            ? "S(" + xValStr + ") = π(R² - r²) ≈ " + areaValStr
            : "S(" + xValStr + ") = π·R² ≈ " + areaValStr;
        } else {
          const degStr = Math.round(sweepDeg) + "°";
          badgeText = Ri > 0.001
            ? "S(" + xValStr + ") = (" + degStr + "/360°)·π(R² - r²) ≈ " + areaValStr
            : "S(" + xValStr + ") = (" + degStr + "/360°)·π·R² ≈ " + areaValStr;
        }
        
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
        ctx.beginPath();
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
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.beginPath();
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
      ctx.restore();`;

const replSecRevHandle = `          // Inner border if full washer
          if (isFullRev && innerCircle) {
            ctx.beginPath();
            ctx.moveTo(innerCircle[0].sx, innerCircle[0].sy);
            for (let k = 1; k < innerCircle.length; k++) ctx.lineTo(innerCircle[k].sx, innerCircle[k].sy);
            ctx.closePath();
            ctx.strokeStyle = "#9f1239";
            ctx.lineWidth = 1.8;
            ctx.setLineDash([3, 2]);
            ctx.stroke();
            ctx.setLineDash([]);
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
          ctx.strokeStyle = "#be123c";
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // ── 3. Radius Dimension Line: from center directly to topPt (Apex) ──
        ctx.beginPath();
        ctx.moveTo(pCenter.sx, pCenter.sy);
        ctx.lineTo(topPt.sx, topPt.sy);
        ctx.strokeStyle = "#e11d48";
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Center point dot
        ctx.fillStyle = "#e11d48";
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
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(rMidX - rlw / 2, rMidY - 9, rlw, 18, 5);
        else ctx.rect(rMidX - rlw / 2, rMidY - 9, rlw, 18);
        ctx.fill();
        ctx.strokeStyle = "#fda4af";
        ctx.lineWidth = 1;
        if (ctx.roundRect) ctx.roundRect(rMidX - rlw / 2, rMidY - 9, rlw, 18, 5);
        else ctx.rect(rMidX - rlw / 2, rMidY - 9, rlw, 18);
        ctx.stroke();
        ctx.fillStyle = "#9f1239";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(rLabel, rMidX, rMidY);

        // ── 4. Tactile Drag Handle at topPt (Apex) ──
        item._cutHandle = { x: topPt.sx - x, y: topPt.sy - y };
        
        ctx.save();
        ctx.shadowColor = "rgba(225, 29, 72, 0.45)";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(topPt.sx, topPt.sy, 7.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#e11d48";
        ctx.lineWidth = 2.4;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(topPt.sx, topPt.sy, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = "#e11d48";
        ctx.fill();
        ctx.restore();

        // ── 5. Floating Formula & Area Badge: S(x) ──
        const xValStr = (Math.round(cutCoord * 10) / 10);
        const areaValStr = (Math.round(cutArea * 100) / 100);
        let badgeText = "";
        if (isFullRev) {
          badgeText = Ri > 0.001
            ? "S(" + xValStr + ") = π(R² - r²) ≈ " + areaValStr
            : "S(" + xValStr + ") = π·R² ≈ " + areaValStr;
        } else {
          const degStr = Math.round(sweepDeg) + "°";
          badgeText = Ri > 0.001
            ? "S(" + xValStr + ") = (" + degStr + "/360°)·π(R² - r²) ≈ " + areaValStr
            : "S(" + xValStr + ") = (" + degStr + "/360°)·π·R² ≈ " + areaValStr;
        }
        
        ctx.font = "bold 11px system-ui, sans-serif";
        const bw = ctx.measureText(badgeText).width + 16;
        const bh = 22;
        // Position badge cleanly 12px above handle with no overlap
        const badgeY = topPt.sy - 12 - bh;
        
        // Connecting stem from badge to handle
        ctx.beginPath();
        ctx.moveTo(topPt.sx, badgeY + bh);
        ctx.lineTo(topPt.sx, topPt.sy - 8);
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Badge card
        ctx.save();
        ctx.shadowColor = "rgba(15, 23, 42, 0.12)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(topPt.sx - bw / 2, badgeY, bw, bh, 6);
        else ctx.rect(topPt.sx - bw / 2, badgeY, bw, bh);
        ctx.fill();
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 1.4;
        if (ctx.roundRect) ctx.roundRect(topPt.sx - bw / 2, badgeY, bw, bh, 6);
        else ctx.rect(topPt.sx - bw / 2, badgeY, bw, bh);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = "#9f1239";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(badgeText, topPt.sx, badgeY + bh / 2);
      }

      // ── 6. Coordinate tag on axis ──
      const pCutAxis = isRevY ? project(0, cutCoord, 0) : project(cutCoord, 0, 0);
      ctx.save();
      ctx.fillStyle = "#e11d48";
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
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pCutAxis.sx - atw / 2, aty - 8, atw, 16, 4);
      else ctx.rect(pCutAxis.sx - atw / 2, aty - 8, atw, 16);
      ctx.fill();
      ctx.strokeStyle = "#fda4af";
      ctx.lineWidth = 1;
      if (ctx.roundRect) ctx.roundRect(pCutAxis.sx - atw / 2, aty - 8, atw, 16, 4);
      else ctx.rect(pCutAxis.sx - atw / 2, aty - 8, atw, 16);
      ctx.stroke();
      ctx.fillStyle = "#9f1239";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(axisTag, pCutAxis.sx, aty);
      ctx.restore();`;
replaceOrThrow(targetSecRevHandle, replSecRevHandle, 'Section 6 isSecRev handle and badge ruby styling');

// 4. Section 6 for Lofted solids (Square, Tri, Semi, Circle)
const targetLoftSec = `        // Illuminated amber-gold gradient
        const grad = ctx.createLinearGradient(topPt.sx, topPt.sy, pMidBase.sx, pMidBase.sy);
        grad.addColorStop(0, "rgba(251, 191, 36, 0.92)");
        grad.addColorStop(1, "rgba(217, 119, 6, 0.85)");
        ctx.fillStyle = grad;
        ctx.fill();

        // Subtle hatching lines across slice
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
        const hatchStep = 10;
        ctx.beginPath();
        for (let hx = minX - (maxY - minY); hx < maxX + (maxY - minY); hx += hatchStep) {
          ctx.moveTo(hx, minY - 5);
          ctx.lineTo(hx + (maxY - minY) + 10, maxY + 5);
        }
        ctx.stroke();
        ctx.restore();

        // Crisp contour border
        ctx.beginPath();
        ctx.moveTo(cutPts[0].sx, cutPts[0].sy);
        for (let k = 1; k < cutPts.length; k++) ctx.lineTo(cutPts[k].sx, cutPts[k].sy);
        ctx.closePath();
        ctx.strokeStyle = "#b45309";
        ctx.lineWidth = 2.4;
        ctx.stroke();
        ctx.restore();

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
        else if (currentAxis === "sec-circle") formPrefix = "S(" + xValStr + ") = π·R² ≈ ";
        else if (currentAxis === "sec-semi") formPrefix = "S(" + xValStr + ") = (π·R²)/2 ≈ ";
        else if (currentAxis === "sec-tri") formPrefix = "S(" + xValStr + ") = (√3·d²)/4 ≈ ";
        else if (currentAxis === "sec-tri-right") formPrefix = "S(" + xValStr + ") = d²/2 ≈ ";
        else if (currentAxis === "sec-tri-iso") formPrefix = "S(" + xValStr + ") = d²/4 ≈ ";
        else formPrefix = "S(" + xValStr + ") ≈ ";
        const badgeText = formPrefix + areaValStr;

        ctx.font = "bold 11px system-ui, sans-serif";
        const bw = ctx.measureText(badgeText).width + 16;
        const bh = 22;
        const badgeY = topPt.sy - 12 - bh;

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
        ctx.beginPath();
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
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.beginPath();
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
      ctx.restore();`;

const replLoftSec = `        // Illuminated vibrant ruby-rose gradient
        const grad = ctx.createLinearGradient(topPt.sx, topPt.sy, pMidBase.sx, pMidBase.sy);
        grad.addColorStop(0, "rgba(251, 113, 133, 0.95)");
        grad.addColorStop(1, "rgba(225, 29, 72, 0.90)");
        ctx.fillStyle = grad;
        ctx.fill();

        // Subtle hatching lines across slice
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = "rgba(159, 18, 57, 0.28)";
        ctx.lineWidth = 1;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const pt of cutPts) {
          if (pt.sx < minX) minX = pt.sx;
          if (pt.sx > maxX) maxX = pt.sx;
          if (pt.sy < minY) minY = pt.sy;
          if (pt.sy > maxY) maxY = pt.sy;
        }
        const hatchStep = 10;
        ctx.beginPath();
        for (let hx = minX - (maxY - minY); hx < maxX + (maxY - minY); hx += hatchStep) {
          ctx.moveTo(hx, minY - 5);
          ctx.lineTo(hx + (maxY - minY) + 10, maxY + 5);
        }
        ctx.stroke();
        ctx.restore();

        // Crisp contour border
        ctx.beginPath();
        ctx.moveTo(cutPts[0].sx, cutPts[0].sy);
        for (let k = 1; k < cutPts.length; k++) ctx.lineTo(cutPts[k].sx, cutPts[k].sy);
        ctx.closePath();
        ctx.strokeStyle = "#be123c";
        ctx.lineWidth = 2.4;
        ctx.stroke();
        ctx.restore();

        // ── 3. Tactile Drag Handle at topPt ──
        item._cutHandle = { x: topPt.sx - x, y: topPt.sy - y };
        
        ctx.save();
        ctx.shadowColor = "rgba(225, 29, 72, 0.45)";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(topPt.sx, topPt.sy, 7.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#e11d48";
        ctx.lineWidth = 2.4;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(topPt.sx, topPt.sy, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = "#e11d48";
        ctx.fill();
        ctx.restore();

        // ── 4. Floating Formula & Area Badge ──
        const xValStr = (Math.round(activeCutX * 10) / 10);
        const areaValStr = (Math.round(cutArea * 100) / 100);
        let formPrefix = "";
        if (currentAxis === "sec-square") formPrefix = "S(" + xValStr + ") = d² ≈ ";
        else if (currentAxis === "sec-circle") formPrefix = "S(" + xValStr + ") = π·R² ≈ ";
        else if (currentAxis === "sec-semi") formPrefix = "S(" + xValStr + ") = (π·R²)/2 ≈ ";
        else if (currentAxis === "sec-tri") formPrefix = "S(" + xValStr + ") = (√3·d²)/4 ≈ ";
        else if (currentAxis === "sec-tri-right") formPrefix = "S(" + xValStr + ") = d²/2 ≈ ";
        else if (currentAxis === "sec-tri-iso") formPrefix = "S(" + xValStr + ") = d²/4 ≈ ";
        else formPrefix = "S(" + xValStr + ") ≈ ";
        const badgeText = formPrefix + areaValStr;

        ctx.font = "bold 11px system-ui, sans-serif";
        const bw = ctx.measureText(badgeText).width + 16;
        const bh = 22;
        const badgeY = topPt.sy - 12 - bh;

        ctx.beginPath();
        ctx.moveTo(topPt.sx, badgeY + bh);
        ctx.lineTo(topPt.sx, topPt.sy - 8);
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.save();
        ctx.shadowColor = "rgba(15, 23, 42, 0.12)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(topPt.sx - bw / 2, badgeY, bw, bh, 6);
        else ctx.rect(topPt.sx - bw / 2, badgeY, bw, bh);
        ctx.fill();
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 1.4;
        if (ctx.roundRect) ctx.roundRect(topPt.sx - bw / 2, badgeY, bw, bh, 6);
        else ctx.rect(topPt.sx - bw / 2, badgeY, bw, bh);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = "#9f1239";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(badgeText, topPt.sx, badgeY + bh / 2);
      }

      // ── 5. Coordinate tag on Ox axis ──
      const pCutOx = project(activeCutX, 0, 0);
      ctx.save();
      ctx.fillStyle = "#e11d48";
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
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pCutOx.sx - atw / 2, aty - 8, atw, 16, 4);
      else ctx.rect(pCutOx.sx - atw / 2, aty - 8, atw, 16);
      ctx.fill();
      ctx.strokeStyle = "#fda4af";
      ctx.lineWidth = 1;
      if (ctx.roundRect) ctx.roundRect(pCutOx.sx - atw / 2, aty - 8, atw, 16, 4);
      else ctx.rect(pCutOx.sx - atw / 2, aty - 8, atw, 16);
      ctx.stroke();
      ctx.fillStyle = "#9f1239";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(axisTag, pCutOx.sx, aty);
      ctx.restore();`;
replaceOrThrow(targetLoftSec, replLoftSec, 'Section 6 lofted slice ruby styling');

// 5. Tab 2 button in top card
const targetTab2 = `    if (isCross) {
      ctx.fillStyle = "#d97706"; ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 10px system-ui, sans-serif";
    }`;
const replTab2 = `    if (isCross) {
      ctx.fillStyle = "#e11d48"; ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 10px system-ui, sans-serif";
    }`;
replaceOrThrow(targetTab2, replTab2, 'Tab 2 button ruby background');

// 6. Bottom slider & Result card
const targetBottomSlider = `      const knobX = tX0 + ((activeCutX - na) / (nb - na)) * tW;
      ctx.strokeStyle = "rgba(203,213,225,0.85)"; ctx.lineWidth = 4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(tX1, tY); ctx.stroke();
      ctx.strokeStyle = "#d97706"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(knobX, tY); ctx.stroke();
      ctx.save();
      ctx.shadowColor = "rgba(217, 119, 6, 0.4)"; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(knobX, tY, 8, 0, Math.PI * 2); ctx.fillStyle = "#ffffff"; ctx.fill();
      ctx.strokeStyle = "#d97706"; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.fillStyle = "#d97706"; ctx.beginPath(); ctx.arc(knobX, tY, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      ctx.fillStyle = "#64748b"; ctx.font = "bold 9px system-ui, sans-serif";
      ctx.textAlign = "right"; ctx.fillText("a=" + na, tX0 - 10, tY + 3);
      ctx.textAlign = "left"; ctx.fillText("b=" + nb, tX1 + 13, tY + 3);

      const cTxt = "↔ Trượt mặt cắt x = " + (Math.round(activeCutX * 100) / 100);
      ctx.font = "bold 9.5px system-ui, sans-serif";
      const cW = ctx.measureText(cTxt).width + 12;
      const badgeX = Math.max(tX0 + cW / 2 - 8, Math.min(tX1 - cW / 2 + 8, knobX));
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
      ctx.strokeStyle = "rgba(203, 213, 225, 0.9)"; ctx.lineWidth = 0.8;
      if (ctx.roundRect) ctx.roundRect(badgeX - cW / 2, tY - 21, cW, 16, 4); else ctx.rect(badgeX - cW / 2, tY - 21, cW, 16); ctx.fill(); ctx.stroke(); ctx.restore();
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#b45309";
      ctx.fillText(cTxt, badgeX, tY - 13);`;

const replBottomSlider = `      const knobX = tX0 + ((activeCutX - na) / (nb - na)) * tW;
      ctx.strokeStyle = "rgba(203,213,225,0.85)"; ctx.lineWidth = 4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(tX1, tY); ctx.stroke();
      ctx.strokeStyle = "#e11d48"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(knobX, tY); ctx.stroke();
      ctx.save();
      ctx.shadowColor = "rgba(225, 29, 72, 0.45)"; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(knobX, tY, 8, 0, Math.PI * 2); ctx.fillStyle = "#ffffff"; ctx.fill();
      ctx.strokeStyle = "#e11d48"; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.fillStyle = "#e11d48"; ctx.beginPath(); ctx.arc(knobX, tY, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      ctx.fillStyle = "#64748b"; ctx.font = "bold 9px system-ui, sans-serif";
      ctx.textAlign = "right"; ctx.fillText("a=" + na, tX0 - 10, tY + 3);
      ctx.textAlign = "left"; ctx.fillText("b=" + nb, tX1 + 13, tY + 3);

      const cTxt = "↔ Trượt mặt cắt x = " + (Math.round(activeCutX * 100) / 100);
      ctx.font = "bold 9.5px system-ui, sans-serif";
      const cW = ctx.measureText(cTxt).width + 12;
      const badgeX = Math.max(tX0 + cW / 2 - 8, Math.min(tX1 - cW / 2 + 8, knobX));
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
      ctx.strokeStyle = "rgba(203, 213, 225, 0.9)"; ctx.lineWidth = 0.8;
      if (ctx.roundRect) ctx.roundRect(badgeX - cW / 2, tY - 21, cW, 16, 4); else ctx.rect(badgeX - cW / 2, tY - 21, cW, 16); ctx.fill(); ctx.stroke(); ctx.restore();
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#9f1239";
      ctx.fillText(cTxt, badgeX, tY - 13);`;
replaceOrThrow(targetBottomSlider, replBottomSlider, 'Bottom slider ruby styling');

// 7. Result card for isCross
const targetResultCard = `    ctx.shadowColor = isCross ? "rgba(245, 158, 11, 0.18)" : "rgba(37, 99, 235, 0.15)";
    ctx.shadowBlur = 8;
    ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
    ctx.strokeStyle = isCross ? "rgba(245, 158, 11, 0.45)" : "rgba(37, 99, 235, 0.4)";
    ctx.lineWidth = 1.2;
    if (ctx.roundRect) ctx.roundRect(cardX, cardY, cardW, cardH, 6);
    else ctx.rect(cardX, cardY, cardW, cardH);
    ctx.fill(); ctx.stroke();
    ctx.restore();

    ctx.fillStyle = isCross ? "#b45309" : "#1e40af";`;

const replResultCard = `    ctx.shadowColor = isCross ? "rgba(225, 29, 72, 0.20)" : "rgba(37, 99, 235, 0.15)";
    ctx.shadowBlur = 8;
    ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
    ctx.strokeStyle = isCross ? "rgba(225, 29, 72, 0.45)" : "rgba(37, 99, 235, 0.4)";
    ctx.lineWidth = 1.2;
    if (ctx.roundRect) ctx.roundRect(cardX, cardY, cardW, cardH, 6);
    else ctx.rect(cardX, cardY, cardW, cardH);
    ctx.fill(); ctx.stroke();
    ctx.restore();

    ctx.fillStyle = isCross ? "#9f1239" : "#1e40af";`;
replaceOrThrow(targetResultCard, replResultCard, 'Result card ruby styling');

// 8. Card top header border for isCross
const targetTopCardBorder = `ctx.strokeStyle = isCross ? "rgba(245, 158, 11, 0.28)" : "rgba(59, 130, 246, 0.25)";`;
const replTopCardBorder = `ctx.strokeStyle = isCross ? "rgba(225, 29, 72, 0.35)" : "rgba(59, 130, 246, 0.25)";`;
replaceOrThrow(targetTopCardBorder, replTopCardBorder, 'Top card border ruby styling');

fs.writeFileSync(targetFile, code, 'utf8');
console.log('Successfully wrote updated dist/assets/index-D9JME9Hm.js');
