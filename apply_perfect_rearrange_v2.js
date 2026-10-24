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
// 1. General Solids: (P) ⊥ Ox at top-right corner of plane (P) with upward clearance
// ─────────────────────────────────────────────────────────────────────────────
const targetGeneralPlane = `      // Label for cutting plane (P) placed at top-left corner (planeSheet[1], completely outside 3D solid)
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

const replGeneralPlane = `      // Label for cutting plane (P) placed at top-right corner of plane (P) with upward clearance (SGK convention, clear of solid and S(x))
      const pCorner = planeSheet[2];
      const planeTag = "(P) ⊥ Ox";
      ctx.font = "bold 9.5px system-ui, sans-serif";
      const ptw = ctx.measureText(planeTag).width + 8;
      const pCornerX = pCorner.sx + ptw / 2 + 4;
      const pCornerY = pCorner.sy - 12;
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

replaceOrThrow(targetGeneralPlane, replGeneralPlane, 'General solids (P) ⊥ Ox to top-right corner of plane');

// ─────────────────────────────────────────────────────────────────────────────
// 2. isSecRev: (P) ⊥ Ox/Oy at top-right corner with upward clearance
// ─────────────────────────────────────────────────────────────────────────────
const targetSecRevPlane = `      // Label for cutting plane (P) in top-left outer corner (planeSheet[1], completely outside 3D solid)
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

const replSecRevPlane = `      // Label for cutting plane (P) in top-right corner with upward clearance (clear of solid and S(x))
      const pCorner = planeSheet[2];
      const planeTag = isRevY ? "(P) ⊥ Oy" : "(P) ⊥ Ox";
      ctx.font = "bold 9.5px system-ui, sans-serif";
      const ptw = ctx.measureText(planeTag).width + 8;
      const pCornerX = pCorner.sx + ptw / 2 + 4;
      const pCornerY = pCorner.sy - 12;
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

replaceOrThrow(targetSecRevPlane, replSecRevPlane, 'isSecRev planeTag to top-right corner of plane');

fs.writeFileSync(targetFile, code, 'utf8');
console.log('🎉 UPDATED (P) ⊥ Ox POSITION TO TOP-RIGHT OF PLANE (P) CLEAR OF S(x) AND SOLID!');
