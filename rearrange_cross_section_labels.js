const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('dist/assets/index-D9JME9Hm.js');
const backupFile = path.resolve('dist/assets/index-D9JME9Hm.js.bak_before_rearrange');

// Restore from clean backup
let code = fs.readFileSync(backupFile, 'utf8');

function replaceOrThrow(target, replacement, desc) {
  if (!code.includes(target)) {
    throw new Error('Target string not found for: ' + desc);
  }
  code = code.replace(target, replacement);
  console.log('✓ Successfully replaced:', desc);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. General Solids: Move (P) ⊥ Ox to top-left outer corner (planeSheet[3])
// ─────────────────────────────────────────────────────────────────────────────
const targetGeneralPlane = `      // Label for cutting plane (P) in outer corner (không che đỉnh lát cắt)
      const pCorner = planeSheet[2];
      const planeTag = "(P) ⊥ Ox";
      ctx.font = "bold 9.5px system-ui, sans-serif";
      const ptw = ctx.measureText(planeTag).width + 8;
      ctx.fillStyle = "rgba(51, 65, 85, 0.88)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pCorner.sx - ptw / 2, pCorner.sy - 8, ptw, 15, 4);
      else ctx.rect(pCorner.sx - ptw / 2, pCorner.sy - 8, ptw, 15);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(planeTag, pCorner.sx, pCorner.sy);
      ctx.restore();`;

const replGeneralPlane = `      // Label for cutting plane (P) placed at top-left outer corner (planeSheet[3], completely outside 3D solid)
      const pCorner = planeSheet[3];
      const planeTag = "(P) ⊥ Ox";
      ctx.font = "bold 9.5px system-ui, sans-serif";
      const ptw = ctx.measureText(planeTag).width + 8;
      const pCornerX = pCorner.sx + ptw / 2 + 4;
      const pCornerY = pCorner.sy + 10;
      ctx.fillStyle = "rgba(30, 41, 59, 0.88)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pCornerX - ptw / 2, pCornerY - 7.5, ptw, 15, 4);
      else ctx.rect(pCornerX - ptw / 2, pCornerY - 7.5, ptw, 15);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(planeTag, pCornerX, pCornerY);
      ctx.restore();`;

replaceOrThrow(targetGeneralPlane, replGeneralPlane, 'General solids (P) ⊥ Ox to top-left outer corner');

// ─────────────────────────────────────────────────────────────────────────────
// 2. General Solids: Move d = ... OUTSIDE the slice polygon, below the base line
// ─────────────────────────────────────────────────────────────────────────────
const targetGeneralDim = `        // Dimension line along base (đoạn đáy) - unified sapphire blue
        ctx.beginPath();
        ctx.moveTo(pBase0.sx, pBase0.sy);
        ctx.lineTo(pBase1.sx, pBase1.sy);
        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Base label pill (offset below/aside base line to avoid blocking)
        if (cutW >= 0.35) {
          const bLabel = "d=" + (Math.round(cutW * 100) / 100);
          ctx.font = "bold 9.5px system-ui, sans-serif";
          const blw = ctx.measureText(bLabel).width + 8;
          const bTagX = pMidBase.sx + blw / 2 + 12;
          const bTagY = pMidBase.sy;

          ctx.beginPath();
          ctx.moveTo(pMidBase.sx, pMidBase.sy);
          ctx.lineTo(bTagX - blw / 2, bTagY);
          ctx.strokeStyle = "rgba(37, 99, 235, 0.35)";
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(bTagX - blw / 2, bTagY - 7.5, blw, 15, 4);
          else ctx.rect(bTagX - blw / 2, bTagY - 7.5, blw, 15);
          ctx.fill();
          ctx.strokeStyle = "rgba(37, 99, 235, 0.35)";
          ctx.lineWidth = 1;
          if (ctx.roundRect) ctx.roundRect(bTagX - blw / 2, bTagY - 7.5, blw, 15, 4);
          else ctx.rect(bTagX - blw / 2, bTagY - 7.5, blw, 15);
          ctx.stroke();
          ctx.fillStyle = "#1e40af";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(bLabel, bTagX, bTagY);
        }`;

const replGeneralDim = `        // Dimension line along base (đoạn đáy) - unified sapphire blue
        ctx.beginPath();
        ctx.moveTo(pBase0.sx, pBase0.sy);
        ctx.lineTo(pBase1.sx, pBase1.sy);
        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Base label pill: placed OUTSIDE the slice polygon, below the base line (never covers slice face)
        if (cutW >= 0.35) {
          const bLabel = "d=" + (Math.round(cutW * 100) / 100);
          ctx.font = "bold 9.5px system-ui, sans-serif";
          const blw = ctx.measureText(bLabel).width + 8;
          
          // Outward unit vector away from apex topPt into open floor space
          const outVx = pMidBase.sx - topPt.sx;
          const outVy = pMidBase.sy - topPt.sy;
          const outVlen = Math.hypot(outVx, outVy) || 1;
          const bTagX = pMidBase.sx + (outVx / outVlen) * 22;
          const bTagY = pMidBase.sy + (outVy / outVlen) * 22;

          ctx.beginPath();
          ctx.moveTo(pMidBase.sx, pMidBase.sy);
          ctx.lineTo(bTagX, bTagY);
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
        }`;

replaceOrThrow(targetGeneralDim, replGeneralDim, 'General solids d = ... outward offset away from slice');

// ─────────────────────────────────────────────────────────────────────────────
// 3. General Solids: Rearrange S(x) badge with 24px clearance above apex
// ─────────────────────────────────────────────────────────────────────────────
const targetGeneralBadge = `        ctx.font = "bold 10px system-ui, sans-serif";
        const bw = ctx.measureText(badgeText).width + 14;
        const bh = 20;
        const badgeY = topPt.sy - 18 - bh;

        // Stem from badge to handle
        ctx.beginPath();
        ctx.moveTo(topPt.sx, badgeY + bh);
        ctx.lineTo(topPt.sx, topPt.sy - 8.5);
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.save();
        ctx.shadowColor = "rgba(15, 23, 42, 0.12)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
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
        ctx.fillText(badgeText, topPt.sx, badgeY + bh / 2);`;

const replGeneralBadge = `        ctx.font = "bold 10px system-ui, sans-serif";
        const bw = ctx.measureText(badgeText).width + 14;
        const bh = 20;
        // Generous 24px clearance above apex handle, clamped to safe bounds
        const badgeY = Math.max(y + 36, topPt.sy - 24 - bh);

        // Clean amber-gold leader stem from badge to handle
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
        ctx.fillText(badgeText, topPt.sx, badgeY + bh / 2);`;

replaceOrThrow(targetGeneralBadge, replGeneralBadge, 'General solids S(x) badge generous clearance');

// ─────────────────────────────────────────────────────────────────────────────
// 4. General Solids: Move x = ... to lower-right along Ox (avoiding Oz)
// ─────────────────────────────────────────────────────────────────────────────
const targetGeneralAxis = `      // ── 5. Coordinate tag on Ox axis (offset to lower-left) ──
      const pCutOx = project(activeCutX, 0, 0);
      ctx.save();
      ctx.fillStyle = "#ea580c";
      ctx.beginPath();
      ctx.arc(pCutOx.sx, pCutOx.sy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const axisTag = "x = " + (Math.round(activeCutX * 10) / 10);
      ctx.font = "bold 9.5px system-ui, sans-serif";
      const atw = ctx.measureText(axisTag).width + 8;
      const atx = pCutOx.sx - atw / 2 - 10;
      const aty = pCutOx.sy + 15;

      // Delicate leader tick to offset axis tag
      ctx.beginPath();
      ctx.moveTo(pCutOx.sx, pCutOx.sy);
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
      ctx.fillStyle = "#9f1239";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(axisTag, atx, aty);
      ctx.restore();`;

const replGeneralAxis = `      // ── 5. Coordinate tag on Ox axis (neatly offset to bottom-right along Ox, avoiding Oz and origin) ──
      const pCutOx = project(activeCutX, 0, 0);
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
      // Offset to bottom-right: clear of Oz axis and O origin
      const atx = pCutOx.sx + atw / 2 + 8;
      const aty = pCutOx.sy + 14;

      // Delicate leader tick connecting cut point to axis tag
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
      ctx.strokeStyle = "rgba(37, 99, 235, 0.35)";
      ctx.lineWidth = 1;
      if (ctx.roundRect) ctx.roundRect(atx - atw / 2, aty - 7.5, atw, 15, 4);
      else ctx.rect(atx - atw / 2, aty - 7.5, atw, 15);
      ctx.stroke();
      ctx.fillStyle = "#1e40af";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(axisTag, atx, aty);
      ctx.restore();`;

replaceOrThrow(targetGeneralAxis, replGeneralAxis, 'General solids x = ... offset to lower-right along Ox');

// ─────────────────────────────────────────────────────────────────────────────
// 5. isSecRev (Circular Revolutions): Move (P) to top-left outer corner (planeSheet[3])
// ─────────────────────────────────────────────────────────────────────────────
const targetSecRevPlane = `      // Label for cutting plane (P) in outer corner (không che đỉnh lát cắt)
      const pCorner = planeSheet[2];
      const planeTag = isRevY ? "(P) ⊥ Oy" : "(P) ⊥ Ox";
      ctx.font = "bold 9.5px system-ui, sans-serif";
      const ptw = ctx.measureText(planeTag).width + 8;
      ctx.fillStyle = "rgba(51, 65, 85, 0.88)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pCorner.sx - ptw / 2, pCorner.sy - 8, ptw, 15, 4);
      else ctx.rect(pCorner.sx - ptw / 2, pCorner.sy - 8, ptw, 15);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(planeTag, pCorner.sx, pCorner.sy);
      ctx.restore();`;

const replSecRevPlane = `      // Label for cutting plane (P) in top-left outer corner (planeSheet[3], completely outside 3D solid)
      const pCorner = planeSheet[3];
      const planeTag = isRevY ? "(P) ⊥ Oy" : "(P) ⊥ Ox";
      ctx.font = "bold 9.5px system-ui, sans-serif";
      const ptw = ctx.measureText(planeTag).width + 8;
      const pCornerX = pCorner.sx + ptw / 2 + 4;
      const pCornerY = pCorner.sy + 10;
      ctx.fillStyle = "rgba(30, 41, 59, 0.88)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pCornerX - ptw / 2, pCornerY - 7.5, ptw, 15, 4);
      else ctx.rect(pCornerX - ptw / 2, pCornerY - 7.5, ptw, 15);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(planeTag, pCornerX, pCornerY);
      ctx.restore();`;

replaceOrThrow(targetSecRevPlane, replSecRevPlane, 'isSecRev planeTag to top-left outer corner');

// ─────────────────────────────────────────────────────────────────────────────
// 6. isSecRev: Generous clearance for S(x) badge above apex
// ─────────────────────────────────────────────────────────────────────────────
const targetSecRevBadge = `        ctx.font = "bold 10px system-ui, sans-serif";
        const bw = ctx.measureText(badgeText).width + 14;
        const bh = 20;
        // Position badge with generous 18px clearance above handle
        const badgeY = topPt.sy - 18 - bh;`;

const replSecRevBadge = `        ctx.font = "bold 10px system-ui, sans-serif";
        const bw = ctx.measureText(badgeText).width + 14;
        const bh = 20;
        // Generous 24px clearance above handle, clamped to safe bounds
        const badgeY = Math.max(y + 36, topPt.sy - 24 - bh);`;

replaceOrThrow(targetSecRevBadge, replSecRevBadge, 'isSecRev S(x) badge generous clearance');

// ─────────────────────────────────────────────────────────────────────────────
// 7. isSecRev: Move coordinate tag to lower-right along axis
// ─────────────────────────────────────────────────────────────────────────────
const targetSecRevAxis = `      // ── 6. Coordinate tag on axis (offset to lower-left to never block axis or center dot) ──
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
      else ctx.rect(atx - atw / 2, aty - 7.5, atw, 15);`;

const replSecRevAxis = `      // ── 6. Coordinate tag on axis (offset to lower-right along axis direction) ──
      const pCutAxis = isRevY ? project(0, cutCoord, 0) : project(cutCoord, 0, 0);
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

      // Delicate leader tick to offset axis tag
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
      else ctx.rect(atx - atw / 2, aty - 7.5, atw, 15);`;

replaceOrThrow(targetSecRevAxis, replSecRevAxis, 'isSecRev axis tag offset to lower-right');

// Save modified file
fs.writeFileSync(targetFile, code, 'utf8');
console.log('🎉 ALL 4 CIRCLED LABELS REARRANGED FOR PERFECT CLARITY & BREATHABILITY!');
