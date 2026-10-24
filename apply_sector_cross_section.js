const fs = require('fs');

let bundle = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const targetStart = '      // ── 2. Circular Cross-Section Disc at cutCoord ──';
const targetEnd = '      // ── 6. Coordinate tag on axis ──';

const pStart = bundle.indexOf(targetStart);
const pEnd = bundle.indexOf(targetEnd);

if (pStart === -1 || pEnd === -1) {
  console.error('Could not find target boundaries');
  process.exit(1);
}

const replacement = `      // ── 2. Circular / Sector Cross-Section at cutCoord (Correct for all sweep angles) ──
      if (Ro > 0.001) {
        const isFullRev = sweepDeg >= 355;
        const curSweepRad = isFullRev ? Math.PI * 2 : sweepRad;
        const sweepFrac = isFullRev ? 1 : (sweepDeg / 360);
        const cutArea = sweepFrac * Math.PI * (Ro * Ro - Ri * Ri);

        const pCenter = isRevY ? project(0, cutCoord, 0) : project(cutCoord, 0, 0);

        const nCirclePts = Math.max(32, Math.min(180, Math.round(N * (curSweepRad / (Math.PI * 2)) * 1.5)));

        // 1. Points along outer arc from phi = 0 to phi = curSweepRad
        const outerArc = [];
        for (let ci = 0; ci <= nCirclePts; ci++) {
          const ang = (ci / nCirclePts) * curSweepRad;
          const p = isRevY
            ? project(Ro * Math.cos(ang), cutCoord, Ro * Math.sin(ang))
            : project(cutCoord, Ro * Math.cos(ang), Ro * Math.sin(ang));
          outerArc.push(p);
        }

        // 2. Closed slice boundary polygon
        const slicePoly = [];
        let innerCircle = null;

        if (isFullRev) {
          for (let k = 0; k < outerArc.length; k++) slicePoly.push(outerArc[k]);
          if (Ri > 0.001) {
            innerCircle = [];
            for (let ci = nCirclePts; ci >= 0; ci--) {
              const ang = (ci / nCirclePts) * Math.PI * 2;
              const p = isRevY
                ? project(Ri * Math.cos(ang), cutCoord, Ri * Math.sin(ang))
                : project(cutCoord, Ri * Math.cos(ang), Ri * Math.sin(ang));
              innerCircle.push(p);
            }
          }
        } else {
          // Sector polygon vertices: outer arc -> line to inner rim/center -> inner arc (reverse) -> close
          for (let k = 0; k <= nCirclePts; k++) slicePoly.push(outerArc[k]);
          if (Ri > 0.001) {
            for (let ci = nCirclePts; ci >= 0; ci--) {
              const ang = (ci / nCirclePts) * curSweepRad;
              const p = isRevY
                ? project(Ri * Math.cos(ang), cutCoord, Ri * Math.sin(ang))
                : project(cutCoord, Ri * Math.cos(ang), Ri * Math.sin(ang));
              slicePoly.push(p);
            }
          } else {
            slicePoly.push(pCenter);
          }
        }

        // Find TRUE APEX (minimum sy) on outer arc for handle and badge
        let apexIdx = 0;
        for (let ci = 1; ci < outerArc.length; ci++) {
          if (outerArc[ci].sy < outerArc[apexIdx].sy) {
            apexIdx = ci;
          }
        }
        const topPt = outerArc[apexIdx];

        // 3. Draw Un-swept Ghost Trajectory Guide (360° circle dashed outline) if sweepDeg < 355
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
          ctx.stroke();

          // Inner border if full washer
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

`;

bundle = bundle.substring(0, pStart) + replacement + bundle.substring(pEnd);
fs.writeFileSync('dist/assets/index-D9JME9Hm.js', bundle, 'utf8');
console.log('✓ Successfully updated circular / sector cross-section for partial rotation!');
