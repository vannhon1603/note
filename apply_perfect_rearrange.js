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

// ─────────────────────────────────────────────────────────────────────────────
// 1. General Solids: (P) ⊥ Ox to top-left corner (planeSheet[1])
// ─────────────────────────────────────────────────────────────────────────────
const targetGeneralPlane = `      // Label for cutting plane (P) placed at top-left outer corner (planeSheet[3], completely outside 3D solid)
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

const replGeneralPlane = `      // Label for cutting plane (P) placed at top-left corner (planeSheet[1], completely outside 3D solid)
      const pCorner = planeSheet[1];
      const planeTag = "(P) ⊥ Ox";
      ctx.font = "bold 9.5px system-ui, sans-serif";
      const ptw = ctx.measureText(planeTag).width + 8;
      const pCornerX = pCorner.sx - ptw / 2 - 4;
      const pCornerY = pCorner.sy - 8;
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

replaceOrThrow(targetGeneralPlane, replGeneralPlane, 'General solids (P) ⊥ Ox to planeSheet[1]');

// ─────────────────────────────────────────────────────────────────────────────
// 2. General Solids: d = ... outward vector away from slice centroid
// ─────────────────────────────────────────────────────────────────────────────
const targetGeneralDim = `        // Base label pill: placed OUTSIDE the slice polygon, below the base line (never covers slice face)
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

const replGeneralDim = `        // Base label pill: placed OUTSIDE the slice polygon away from centroid (never covers slice face)
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
        }`;

replaceOrThrow(targetGeneralDim, replGeneralDim, 'General solids d = ... outward from centroid');

// ─────────────────────────────────────────────────────────────────────────────
// 3. isSecRev: (P) ⊥ Ox/Oy to top-left corner (planeSheet[1])
// ─────────────────────────────────────────────────────────────────────────────
const targetSecRevPlane = `      // Label for cutting plane (P) in top-left outer corner (planeSheet[3], completely outside 3D solid)
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

const replSecRevPlane = `      // Label for cutting plane (P) in top-left outer corner (planeSheet[1], completely outside 3D solid)
      const pCorner = planeSheet[1];
      const planeTag = isRevY ? "(P) ⊥ Oy" : "(P) ⊥ Ox";
      ctx.font = "bold 9.5px system-ui, sans-serif";
      const ptw = ctx.measureText(planeTag).width + 8;
      const pCornerX = pCorner.sx - ptw / 2 - 4;
      const pCornerY = pCorner.sy - 8;
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

replaceOrThrow(targetSecRevPlane, replSecRevPlane, 'isSecRev planeTag to planeSheet[1]');

fs.writeFileSync(targetFile, code, 'utf8');
console.log('🎉 PERFECT REARRANGEMENT APPLIED SUCCESSFULLY!');
