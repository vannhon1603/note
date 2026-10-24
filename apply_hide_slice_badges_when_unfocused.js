const fs = require('fs');

const file = 'dist/assets/index-D9JME9Hm.js';
fs.copyFileSync(file, file + '.bak_hide_unfocused_badges');
console.log('✓ Backup created: ' + file + '.bak_hide_unfocused_badges');

let js = fs.readFileSync(file, 'utf8');

// ── Target 1: Revolution solids slice badges ──
const t1_start = `        // Radius label in a sleek offset pill badge
        const rScreenDist = Math.hypot(topPt.sx - pCenter.sx, topPt.sy - pCenter.sy);`;
const t1_end = `ctx.fillText(axisTag, atx, aty);
      ctx.restore();`;

const p1_start = js.indexOf(t1_start);
if (p1_start === -1) {
  console.error('Target 1 start NOT found!');
  process.exit(1);
}
const p1_end = js.indexOf(t1_end, p1_start) + t1_end.length;
const t1_exact = js.substring(p1_start, p1_end);

const r1 = `        item._cutHandle = { x: topPt.sx - x, y: topPt.sy - y };

        if (isItemFocused) {
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

          ctx.fillStyle = "#b45309";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(badgeText, topPt.sx, badgeY + bh / 2);
        }
      }

      // ── 6. Coordinate tag on axis ──
      const pCutAxis = isRevY ? project(0, cutCoord, 0) : project(cutCoord, 0, 0);
      if (isItemFocused) {
        ctx.save();
        ctx.fillStyle = "#1d4ed8";
        ctx.beginPath();
        ctx.arc(pCutAxis.sx, pCutAxis.sy, 3.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const axisVar = isRevY ? "y" : "x";
        const axisTag = axisVar + " = " + (Math.round(cutCoord * 10) / 10);
        ctx.font = "bold 9.5px system-ui, sans-serif";
        const atw = ctx.measureText(axisTag).width + 8;
        const atx = pCutAxis.sx + atw / 2 + 8;
        const aty = pCutAxis.sy + 14;

        ctx.beginPath();
        ctx.moveTo(pCutAxis.sx, pCutAxis.sy);
        ctx.lineTo(atx - atw / 2, aty);
        ctx.strokeStyle = "rgba(37, 99, 235, 0.40)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(atx - atw / 2, aty - 7.5, atw, 15, 4);
        else ctx.rect(atx - atw / 2, aty - 7.5, atw, 15);
        ctx.fill();
        ctx.strokeStyle = "rgba(37, 99, 235, 0.35)";
        ctx.lineWidth = 1;
        if (ctx.roundRect) ctx.roundRect(atx - atw / 2, aty - 7.5, atw, 15, 4);
        else ctx.rect(atx - atw / 2, aty - 7.5, atw, 15);
        ctx.stroke();
        ctx.fillStyle = "#b45309";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(axisTag, atx, aty);
        ctx.restore();
      }`;

js = js.replace(t1_exact, r1);
console.log('✓ Target 1 (Revolution solids badges) replaced');

// ── Target 2: Lofted solids slice badges ──
const t2_start = `        // Base label pill: placed OUTSIDE the slice polygon away from centroid (never covers slice face)
        if (cutW >= 0.35) {`;

const p2_start = js.indexOf(t2_start);
if (p2_start === -1) {
  console.error('Target 2 start NOT found!');
  process.exit(1);
}
const p2_end = js.indexOf(t1_end, p2_start) + t1_end.length;
const t2_exact = js.substring(p2_start, p2_end);

const r2 = `        item._cutHandle = { x: topPt.sx - x, y: topPt.sy - y };

        if (isItemFocused) {
          // Base label pill: placed OUTSIDE the slice polygon away from centroid (never covers slice face)
          if (cutW >= 0.35) {
            const bLabel = "d=" + (Math.round(cutW * 100) / 100);
            ctx.font = "bold 9.5px system-ui, sans-serif";
            const blw = ctx.measureText(bLabel).width + 8;
            
            // Centroid of cross-section slice on screen
            const cX = cutPts.reduce((s, p) => s + p.sx, 0) / cutPts.length;
            const cY = cutPts.reduce((s, p) => s + p.sy, 0) / cutPts.length;
            let outVx = pMidBase.sx - cX;
            let outVy = pMidBase.sy - cY;
            const outVlen = Math.hypot(outVx, outVy);
            if (outVlen > 2) {
              outVx /= outVlen;
              outVy /= outVlen;
            } else {
              outVx = -1;
              outVy = 0;
            }
            const bTagX = pMidBase.sx + outVx * (blw / 2 + 14);
            const bTagY = pMidBase.sy + outVy * (blw / 2 + 14);

            ctx.beginPath();
            ctx.moveTo(pMidBase.sx, pMidBase.sy);
            ctx.lineTo(bTagX - outVx * (blw / 2), bTagY - outVy * 6);
            ctx.strokeStyle = "rgba(37, 99, 235, 0.40)";
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(bTagX - blw / 2, bTagY - 7.5, blw, 15, 4);
            else ctx.rect(bTagX - blw / 2, bTagY - 7.5, blw, 15);
            ctx.fill();
            ctx.strokeStyle = "rgba(37, 99, 235, 0.40)";
            ctx.lineWidth = 1;
            if (ctx.roundRect) ctx.roundRect(bTagX - blw / 2, bTagY - 7.5, blw, 15, 4);
            else ctx.rect(bTagX - blw / 2, bTagY - 7.5, blw, 15);
            ctx.stroke();
            ctx.fillStyle = "#1e40af";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(bLabel, bTagX, bTagY);
          }

          // ── 3. Tactile Drag Handle at topPt ──
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

          ctx.fillStyle = "#b45309";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(badgeText, topPt.sx, badgeY + bh / 2);
          ctx.restore();
        }
      }

      // ── 5. Coordinate tag on Ox axis ──
      const pCutOx = project(activeCutX, 0, 0);
      if (isItemFocused) {
        ctx.save();
        ctx.fillStyle = "#1d4ed8";
        ctx.beginPath();
        ctx.arc(pCutOx.sx, pCutOx.sy, 3.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const axisTag = "x = " + (Math.round(activeCutX * 10) / 10);
        ctx.font = "bold 9.5px system-ui, sans-serif";
        const atw = ctx.measureText(axisTag).width + 8;
        const atx = pCutOx.sx + atw / 2 + 8;
        const aty = pCutOx.sy + 14;

        ctx.beginPath();
        ctx.moveTo(pCutOx.sx, pCutOx.sy);
        ctx.lineTo(atx - atw / 2, aty);
        ctx.strokeStyle = "rgba(37, 99, 235, 0.40)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(atx - atw / 2, aty - 7.5, atw, 15, 4);
        else ctx.rect(atx - atw / 2, aty - 7.5, atw, 15);
        ctx.fill();
        ctx.strokeStyle = "rgba(37, 99, 235, 0.40)";
        ctx.lineWidth = 1;
        if (ctx.roundRect) ctx.roundRect(atx - atw / 2, aty - 7.5, atw, 15, 4);
        else ctx.rect(atx - atw / 2, aty - 7.5, atw, 15);
        ctx.stroke();
        ctx.fillStyle = "#1e40af";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(axisTag, atx, aty);
        ctx.restore();
      }`;

js = js.replace(t2_exact, r2);
console.log('✓ Target 2 (Lofted solids badges) replaced');

// ── Target 3: Top formula badge when !isItemFocused ──
const t3 = `  } else {
    // When not focused: clean formula title centered at top
    let formulaShort = "";
    if (currentAxis === "sec-ox") formulaShort = "V = ∫ S(x) dx = π ∫ [f² - g²] dx";
    else if (currentAxis === "sec-oy") formulaShort = "V = ∫ S(y) dy = 2π ∫ x·(f - g) dx";
    else if (isRevOx) formulaShort = (sweepDeg < 355 ? "θ = " + Math.round(sweepDeg) + "° • " : "") + "V = π ∫ [f² - g²] dx";
    else if (isRevOy) formulaShort = (sweepDeg < 355 ? "θ = " + Math.round(sweepDeg) + "° • " : "") + "V = 2π ∫ x·(f - g) dx";
    else if (currentAxis === "sec-square") formulaShort = "V = ∫ S(x) dx = ∫ [f - g]² dx";
    else if (currentAxis === "sec-tri") formulaShort = "V = ∫ S(x) dx = (√3/4) ∫ [f - g]² dx";
    else if (currentAxis === "sec-semi") formulaShort = "V = ∫ S(x) dx = (π/8) ∫ [f - g]² dx";
    else if (currentAxis === "sec-circle") formulaShort = "V = ∫ S(x) dx = (π/4) ∫ [f - g]² dx";
    else formulaShort = "V = ∫ S(x) dx";

    ctx.save();
    ctx.font = "bold 11px system-ui, sans-serif";
    let drawF = formulaShort;
    if (ctx.measureText(drawF).width > w - 40) {
      if (isRevOx) drawF = "V = π ∫ y² dx";
      else if (isRevOy) drawF = "V = 2π ∫ x·y dx";
      else drawF = "V = ∫ S(x) dx";
    }
    const fW = ctx.measureText(drawF).width + 20;
    const fH = 24, fY = y + 8;
    const fX = x + (w - fW) / 2;
    ctx.shadowColor = "rgba(15, 23, 42, 0.04)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.strokeStyle = "rgba(59, 130, 246, 0.25)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(fX, fY, fW, fH, 6);
    else ctx.rect(fX, fY, fW, fH);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#1e40af";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(drawF, x + w / 2, fY + fH / 2);
    ctx.restore();
  }`;

const r3 = `  } else {
    /* When not focused: do not draw top formula badge per user request */
  }`;

if (!js.includes(t3)) {
  console.error('Target 3 NOT found!');
  process.exit(1);
}
js = js.replace(t3, r3);
console.log('✓ Target 3 (Top formula badge when unfocused) replaced');

fs.writeFileSync(file, js, 'utf8');
console.log('✓ Successfully wrote modified ' + file);
