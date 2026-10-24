const fs = require('fs');

const file = 'dist/assets/index-D9JME9Hm.js';
let content = fs.readFileSync(file, 'utf8');

const targetOld = `        const isBackCap = sweepDeg > 5 && (thCap === 0 || normZ_cap < -0.05);
        faces.push({
          z: capZ / ptsCap.length,
          pts: ptsCap,
          fill: thCap === 0 ? (isRevOx ? "rgba(191, 219, 254, 0.40)" : "rgba(167, 243, 208, 0.40)") : (isRevOx ? "rgba(191, 219, 254, 0.45)" : "rgba(167, 243, 208, 0.45)"),
          stroke: thCap === 0 ? (isRevOx ? "rgba(29, 78, 216, 0.92)" : "rgba(4, 120, 87, 0.92)") : (isRevOx ? "rgba(37, 99, 235, 0.92)" : "rgba(5, 150, 105, 0.92)"),
          strokeWidth: isBackCap ? 1.6 : 1.8,
          type: "cap",
          dashed: isBackCap,
          nArch: NCap,
          hasInner: Boolean(expr2 && expr2.trim() && !(fn2raw instanceof Error))
        });`;

const targetNew = `        const isBackCap = false; // Cap profile arches are always solid visible contours in SGK
        faces.push({
          z: capZ / ptsCap.length,
          pts: ptsCap,
          fill: thCap === 0 ? (isRevOx ? "rgba(191, 219, 254, 0.40)" : "rgba(167, 243, 208, 0.40)") : (isRevOx ? "rgba(191, 219, 254, 0.45)" : "rgba(167, 243, 208, 0.45)"),
          stroke: thCap === 0 ? (isRevOx ? "rgba(29, 78, 216, 0.92)" : "rgba(4, 120, 87, 0.92)") : (isRevOx ? "rgba(37, 99, 235, 0.92)" : "rgba(5, 150, 105, 0.92)"),
          strokeWidth: 1.8,
          type: "cap",
          dashed: false,
          nArch: NCap,
          hasInner: Boolean(expr2 && expr2.trim() && !(fn2raw instanceof Error))
        });`;

if (!content.includes(targetOld)) {
  console.error('[FAIL] targetOld not found!');
  process.exit(1);
}

content = content.replace(targetOld, targetNew);
fs.writeFileSync(file, content, 'utf8');
console.log('[OK] Successfully fixed cap arches to be solid lines (nét liền)!');
