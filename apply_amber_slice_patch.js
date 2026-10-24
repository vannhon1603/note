const fs = require('fs');

const file = 'dist/assets/index-D9JME9Hm.js';
let content = fs.readFileSync(file, 'utf8');

let replaceCount = 0;

function safeReplace(oldStr, newStr, name) {
  if (content.includes(oldStr)) {
    content = content.replace(oldStr, newStr);
    replaceCount++;
    console.log(`[OK] Replaced: ${name}`);
  } else {
    console.error(`[FAIL] Could not find target for: ${name}`);
  }
}

// 1. Sphere end cap: make it sapphire blue instead of red
safeReplace(
  `fill: thCap === 0 ? (isRevOx ? "rgba(191, 219, 254, 0.35)" : "rgba(167, 243, 208, 0.35)") : (isRevOx ? "rgba(255, 228, 230, 0.50)" : "rgba(255, 228, 230, 0.50)"),
          stroke: thCap === 0 ? (isRevOx ? "rgba(29, 78, 216, 0.92)" : "rgba(4, 120, 87, 0.92)") : (isRevOx ? "rgba(225, 29, 72, 0.95)" : "rgba(225, 29, 72, 0.95)"),`,
  `fill: thCap === 0 ? (isRevOx ? "rgba(191, 219, 254, 0.40)" : "rgba(167, 243, 208, 0.40)") : (isRevOx ? "rgba(191, 219, 254, 0.45)" : "rgba(167, 243, 208, 0.45)"),
          stroke: thCap === 0 ? (isRevOx ? "rgba(29, 78, 216, 0.92)" : "rgba(4, 120, 87, 0.92)") : (isRevOx ? "rgba(37, 99, 235, 0.92)" : "rgba(5, 150, 105, 0.92)"),`,
  'Sphere end cap sapphire blue'
);

// 2. Cutting plane sheet & tag for isSecRev
safeReplace(
  `ctx.fillStyle = "rgba(6, 182, 212, 0.08)";
      ctx.fill();
      ctx.strokeStyle = "rgba(8, 145, 178, 0.75)";
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label for cutting plane (P) in outer corner (không che đỉnh lát cắt)
      const pCorner = planeSheet[2];
      const planeTag = isRevY ? "(P) ⊥ Oy" : "(P) ⊥ Ox";
      ctx.font = "bold 9.5px system-ui, sans-serif";
      const ptw = ctx.measureText(planeTag).width + 8;
      ctx.fillStyle = "rgba(8, 145, 178, 0.85)";`,
  `ctx.fillStyle = "rgba(241, 245, 249, 0.40)";
      ctx.fill();
      ctx.strokeStyle = "rgba(100, 116, 139, 0.75)";
      ctx.lineWidth = 1.3;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label for cutting plane (P) in outer corner (không che đỉnh lát cắt)
      const pCorner = planeSheet[2];
      const planeTag = isRevY ? "(P) ⊥ Oy" : "(P) ⊥ Ox";
      ctx.font = "bold 9.5px system-ui, sans-serif";
      const ptw = ctx.measureText(planeTag).width + 8;
      ctx.fillStyle = "rgba(51, 65, 85, 0.88)";`,
  'Cutting plane sheet & tag (isSecRev)'
);

// 3. Circular/sector slice in isSecRev
safeReplace(
  `// 3. Draw Un-swept Ghost Trajectory Guide (360° circle dashed outline) if sweepDeg < 355
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
            ctx.strokeStyle = "rgba(159, 18, 57, 0.35)";
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
          ctx.stroke();

          // Inner border if full washer
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

        // ── 3. Center point dot ──
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.arc(pCenter.sx, pCenter.sy, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Radius label in a sleek offset pill badge
        const rScreenDist = Math.hypot(topPt.sx - pCenter.sx, topPt.sy - pCenter.sy);
        if (rScreenDist >= 26) {
          const rValStr = (Math.round(Ro * 100) / 100);
          const rLabel = "R=" + rValStr;
          ctx.font = "bold 9.5px system-ui, sans-serif";
          const rlw = ctx.measureText(rLabel).width + 8;
          const rMidX = (pCenter.sx + topPt.sx) / 2;
          const rMidY = (pCenter.sy + topPt.sy) / 2;
          const rTagX = rMidX + rlw / 2 + 12;
          const rTagY = rMidY;

          ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(rTagX - rlw / 2, rTagY - 7.5, rlw, 15, 4);
          else ctx.rect(rTagX - rlw / 2, rTagY - 7.5, rlw, 15);
          ctx.fill();
          ctx.strokeStyle = "#fda4af";
          ctx.lineWidth = 1;
          if (ctx.roundRect) ctx.roundRect(rTagX - rlw / 2, rTagY - 7.5, rlw, 15, 4);
          else ctx.rect(rTagX - rlw / 2, rTagY - 7.5, rlw, 15);
          ctx.stroke();
          ctx.fillStyle = "#9f1239";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(rLabel, rTagX, rTagY);
        }

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

        // ── 5. Floating Formula & Area Badge: S(x) (gọn gàng, thoáng đãng) ──
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
        // Position badge with generous 18px clearance above handle
        const badgeY = topPt.sy - 18 - bh;
        
        // Connecting stem from badge to handle
        ctx.beginPath();
        ctx.moveTo(topPt.sx, badgeY + bh);
        ctx.lineTo(topPt.sx, topPt.sy - 8.5);
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Badge card
        ctx.save();
        ctx.shadowColor = "rgba(15, 23, 42, 0.12)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(topPt.sx - bw / 2, badgeY, bw, bh, 5);
        else ctx.rect(topPt.sx - bw / 2, badgeY, bw, bh);
        ctx.fill();
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 1.2;
        if (ctx.roundRect) ctx.roundRect(topPt.sx - bw / 2, badgeY, bw, bh, 5);
        else ctx.rect(topPt.sx - bw / 2, badgeY, bw, bh);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = "#9f1239";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(badgeText, topPt.sx, badgeY + bh / 2);
      }

      // ── 6. Coordinate tag on axis (offset to lower-left to never block axis or center dot) ──
      const pCutAxis = isRevY ? project(0, cutCoord, 0) : project(cutCoord, 0, 0);
      ctx.save();
      ctx.fillStyle = "#e11d48";
      ctx.beginPath();
      ctx.arc(pCutAxis.sx, pCutAxis.sy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const axisVar = isRevY ? "y" : "x";
      const axisTag = axisVar + " = " + (Math.round(cutCoord * 10) / 10);
      ctx.font = "bold 9.5px system-ui, sans-serif";
      const atw = ctx.measureText(axisTag).width + 8;
      const atx = pCutAxis.sx - atw / 2 - 10;
      const aty = pCutAxis.sy + 15;

      // Delicate leader tick to offset axis tag
      ctx.beginPath();
      ctx.moveTo(pCutAxis.sx, pCutAxis.sy);
      ctx.lineTo(atx + atw / 2, aty - 7.5);
      ctx.strokeStyle = "rgba(225, 29, 72, 0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(atx - atw / 2, aty - 7.5, atw, 15, 4);
      else ctx.rect(atx - atw / 2, aty - 7.5, atw, 15);
      ctx.fill();
      ctx.strokeStyle = "#fda4af";
      ctx.lineWidth = 1;
      if (ctx.roundRect) ctx.roundRect(atx - atw / 2, aty - 7.5, atw, 15, 4);
      else ctx.rect(atx - atw / 2, aty - 7.5, atw, 15);
      ctx.stroke();
      ctx.fillStyle = "#9f1239";`,
  `// 3. Draw Un-swept Ghost Trajectory Guide (360° circle dashed outline) if sweepDeg < 355
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
          ctx.strokeStyle = "rgba(245, 158, 11, 0.65)";
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
            ctx.strokeStyle = "rgba(217, 119, 6, 0.45)";
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

          // Illuminated glowing amber-gold gradient
          const grad = ctx.createLinearGradient(topPt.sx, topPt.sy, pCenter.sx, pCenter.sy + (pCenter.sy - topPt.sy));
          grad.addColorStop(0, "rgba(251, 191, 36, 0.95)");
          grad.addColorStop(1, "rgba(245, 158, 11, 0.92)");
          ctx.fillStyle = grad;
          ctx.fill();

          // Subtle hatching lines across slice (vân gạch chéo chuẩn SGK)
          ctx.save();
          ctx.clip();
          ctx.strokeStyle = "rgba(180, 83, 9, 0.35)";
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

          // Crisp golden amber contour border
          ctx.beginPath();
          ctx.moveTo(slicePoly[0].sx, slicePoly[0].sy);
          for (let k = 1; k < slicePoly.length; k++) ctx.lineTo(slicePoly[k].sx, slicePoly[k].sy);
          ctx.closePath();
          ctx.strokeStyle = "#d97706";
          ctx.lineWidth = 2.4;
          ctx.stroke();

          // Inner border if full washer
          if (isFullRev && innerCircle) {
            ctx.beginPath();
            ctx.moveTo(innerCircle[0].sx, innerCircle[0].sy);
            for (let k = 1; k < innerCircle.length; k++) ctx.lineTo(innerCircle[k].sx, innerCircle[k].sy);
            ctx.closePath();
            ctx.strokeStyle = "#b45309";
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
          ctx.strokeStyle = "#d97706";
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // ── 3. Center point dot ──
        ctx.fillStyle = "#ea580c";
        ctx.beginPath();
        ctx.arc(pCenter.sx, pCenter.sy, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Radius label in a sleek offset pill badge
        const rScreenDist = Math.hypot(topPt.sx - pCenter.sx, topPt.sy - pCenter.sy);
        if (rScreenDist >= 26) {
          const rValStr = (Math.round(Ro * 100) / 100);
          const rLabel = "R=" + rValStr;
          ctx.font = "bold 9.5px system-ui, sans-serif";
          const rlw = ctx.measureText(rLabel).width + 8;
          const rMidX = (pCenter.sx + topPt.sx) / 2;
          const rMidY = (pCenter.sy + topPt.sy) / 2;
          const rTagX = rMidX + rlw / 2 + 12;
          const rTagY = rMidY;

          ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(rTagX - rlw / 2, rTagY - 7.5, rlw, 15, 4);
          else ctx.rect(rTagX - rlw / 2, rTagY - 7.5, rlw, 15);
          ctx.fill();
          ctx.strokeStyle = "rgba(245, 158, 11, 0.70)";
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
        item._cutHandle = { x: topPt.sx - x, y: topPt.sy - y };
        
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

        // ── 5. Floating Formula & Area Badge: S(x) (gọn gàng, thoáng đãng) ──
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
        // Position badge with generous 18px clearance above handle
        const badgeY = topPt.sy - 18 - bh;
        
        // Connecting stem from badge to handle
        ctx.beginPath();
        ctx.moveTo(topPt.sx, badgeY + bh);
        ctx.lineTo(topPt.sx, topPt.sy - 8.5);
        ctx.strokeStyle = "rgba(217, 119, 6, 0.70)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Badge card
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

        ctx.fillStyle = "#b45309";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(badgeText, topPt.sx, badgeY + bh / 2);
      }

      // ── 6. Coordinate tag on axis (offset to lower-left to never block axis or center dot) ──
      const pCutAxis = isRevY ? project(0, cutCoord, 0) : project(cutCoord, 0, 0);
      ctx.save();
      ctx.fillStyle = "#ea580c";
      ctx.beginPath();
      ctx.arc(pCutAxis.sx, pCutAxis.sy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const axisVar = isRevY ? "y" : "x";
      const axisTag = axisVar + " = " + (Math.round(cutCoord * 10) / 10);
      ctx.font = "bold 9.5px system-ui, sans-serif";
      const atw = ctx.measureText(axisTag).width + 8;
      const atx = pCutAxis.sx - atw / 2 - 10;
      const aty = pCutAxis.sy + 15;

      // Delicate leader tick to offset axis tag
      ctx.beginPath();
      ctx.moveTo(pCutAxis.sx, pCutAxis.sy);
      ctx.lineTo(atx + atw / 2, aty - 7.5);
      ctx.strokeStyle = "rgba(245, 158, 11, 0.50)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(atx - atw / 2, aty - 7.5, atw, 15, 4);
      else ctx.rect(atx - atw / 2, aty - 7.5, atw, 15);
      ctx.fill();
      ctx.strokeStyle = "rgba(245, 158, 11, 0.65)";
      ctx.lineWidth = 1;
      if (ctx.roundRect) ctx.roundRect(atx - atw / 2, aty - 7.5, atw, 15, 4);
      else ctx.rect(atx - atw / 2, aty - 7.5, atw, 15);
      ctx.stroke();
      ctx.fillStyle = "#b45309";`,
  'Circular/sector slice in isSecRev'
);

// 4. Tab 2 at top of 3D Card
safeReplace(
  `if (isCross) {
      ctx.fillStyle = "#e11d48"; ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 10px system-ui, sans-serif";`,
  `if (isCross) {
      ctx.fillStyle = "#d97706"; ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 10px system-ui, sans-serif";`,
  'Tab 2 active amber'
);

// 5. Cross-section slider
safeReplace(
  `ctx.strokeStyle = "#e11d48"; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(knobX, tY); ctx.stroke();
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(knobX, tY, 6.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#e11d48"; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.fillStyle = "#e11d48"; ctx.beginPath(); ctx.arc(knobX, tY, 2.4, 0, Math.PI * 2); ctx.fill();`,
  `ctx.strokeStyle = "#d97706"; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(knobX, tY); ctx.stroke();
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(knobX, tY, 6.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#d97706"; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.fillStyle = "#d97706"; ctx.beginPath(); ctx.arc(knobX, tY, 2.4, 0, Math.PI * 2); ctx.fill();`,
  'Cross-section slider track and knob'
);

// 6. Cross-section slider badge
safeReplace(
  `ctx.save(); ctx.fillStyle = "rgba(255,255,255,0.96)"; ctx.strokeStyle = "rgba(225, 29, 72, 0.65)"; ctx.lineWidth = 1;
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(badgeX - cW / 2, tY - 21, cW, 16, 4); else ctx.rect(badgeX - cW / 2, tY - 21, cW, 16); ctx.fill(); ctx.stroke(); ctx.restore();
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#9f1239";`,
  `ctx.save(); ctx.fillStyle = "rgba(255,255,255,0.98)"; ctx.strokeStyle = "rgba(245, 158, 11, 0.75)"; ctx.lineWidth = 1;
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(badgeX - cW / 2, tY - 21, cW, 16, 4); else ctx.rect(badgeX - cW / 2, tY - 21, cW, 16); ctx.fill(); ctx.stroke(); ctx.restore();
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#b45309";`,
  'Cross-section slider badge'
);

// 7. Volume badge box in isCross
safeReplace(
  `ctx.save();
      ctx.shadowColor = isCross ? "rgba(225, 29, 72, 0.14)" : "rgba(37, 99, 235, 0.12)";
      ctx.shadowBlur = 10; ctx.shadowOffsetY = 2;
      ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
      ctx.strokeStyle = isCross ? "rgba(225, 29, 72, 0.35)" : "rgba(37, 99, 235, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(volBadgeX, fY, volBadgeW, fH, 8);
      else ctx.rect(volBadgeX, fY, volBadgeW, fH);
      ctx.fill(); ctx.stroke();
      ctx.restore();

      ctx.fillStyle = isCross ? "#9f1239" : "#1e40af";`,
  `ctx.save();
      ctx.shadowColor = isCross ? "rgba(245, 158, 11, 0.16)" : "rgba(37, 99, 235, 0.12)";
      ctx.shadowBlur = 10; ctx.shadowOffsetY = 2;
      ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
      ctx.strokeStyle = isCross ? "rgba(245, 158, 11, 0.45)" : "rgba(37, 99, 235, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(volBadgeX, fY, volBadgeW, fH, 8);
      else ctx.rect(volBadgeX, fY, volBadgeW, fH);
      ctx.fill(); ctx.stroke();
      ctx.restore();

      ctx.fillStyle = isCross ? "#b45309" : "#1e40af";`,
  'Volume badge in isCross'
);

// 8. Top formula text in isCross:
safeReplace(
  `ctx.fillStyle = isCross ? "#9f1239" : "#1e40af";`,
  `ctx.fillStyle = isCross ? "#b45309" : "#1e40af";`,
  'Top formula text in isCross'
);

// 9. Cutting plane sheet & polygon in Cross-Section solids (Square, Tri, Semicircle, etc.)
safeReplace(
  `ctx.fillStyle = "rgba(6, 182, 212, 0.08)";
      ctx.fill();
      ctx.strokeStyle = "rgba(8, 145, 178, 0.75)";
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label for cutting plane (P) in outer corner (không che đỉnh lát cắt)
      const pCorner = planeSheet[2];
      const planeTag = "(P) ⊥ Ox";
      ctx.font = "bold 9.5px system-ui, sans-serif";
      const ptw = ctx.measureText(planeTag).width + 8;
      ctx.fillStyle = "rgba(8, 145, 178, 0.85)";`,
  `ctx.fillStyle = "rgba(241, 245, 249, 0.40)";
      ctx.fill();
      ctx.strokeStyle = "rgba(100, 116, 139, 0.75)";
      ctx.lineWidth = 1.3;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label for cutting plane (P) in outer corner (không che đỉnh lát cắt)
      const pCorner = planeSheet[2];
      const planeTag = "(P) ⊥ Ox";
      ctx.font = "bold 9.5px system-ui, sans-serif";
      const ptw = ctx.measureText(planeTag).width + 8;
      ctx.fillStyle = "rgba(51, 65, 85, 0.88)";`,
  'Cutting plane sheet & tag (cross solids)'
);

// 10. Gradient & contours in cross solids
safeReplace(
  `const grad = ctx.createLinearGradient(topPt.sx, topPt.sy, pMidBase.sx, pMidBase.sy);
        grad.addColorStop(0, "rgba(251, 113, 133, 0.95)");
        grad.addColorStop(1, "rgba(225, 29, 72, 0.90)");
        ctx.fillStyle = grad;
        ctx.fill();

        // Subtle cross-hatching lines across slice polygon (vân gạch chéo chuẩn SGK)
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = "rgba(159, 18, 57, 0.28)";`,
  `const grad = ctx.createLinearGradient(topPt.sx, topPt.sy, pMidBase.sx, pMidBase.sy);
        grad.addColorStop(0, "rgba(251, 191, 36, 0.95)");
        grad.addColorStop(1, "rgba(245, 158, 11, 0.92)");
        ctx.fillStyle = grad;
        ctx.fill();

        // Subtle cross-hatching lines across slice polygon (vân gạch chéo chuẩn SGK)
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = "rgba(180, 83, 9, 0.35)";`,
  'Cross solids gradient & hatching'
);

safeReplace(
  `ctx.strokeStyle = "#be123c";
        ctx.lineWidth = 2.4;
        ctx.stroke();`,
  `ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 2.4;
        ctx.stroke();`,
  'Cross solids contour stroke'
);

safeReplace(
  `ctx.strokeStyle = "#e11d48";
        ctx.lineWidth = 2.4;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(topPt.sx, topPt.sy, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = "#e11d48";`,
  `ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(topPt.sx, topPt.sy, 2.0, 0, Math.PI * 2);
        ctx.fillStyle = "#ea580c";`,
  'Cross solids handle'
);

// 11. Coordinate tag on Ox in cross solids
safeReplace(
  `const pCutOx = project(activeCutX, 0, 0);
      ctx.save();
      ctx.fillStyle = "#e11d48";
      ctx.beginPath();
      ctx.arc(pCutOx.sx, pCutOx.sy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();`,
  `const pCutOx = project(activeCutX, 0, 0);
      ctx.save();
      ctx.fillStyle = "#ea580c";
      ctx.beginPath();
      ctx.arc(pCutOx.sx, pCutOx.sy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();`,
  'Cross solids Ox point'
);

fs.writeFileSync(file, content, 'utf8');
console.log(`\nSuccessfully applied ${replaceCount} replacements!`);
