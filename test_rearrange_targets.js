const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const t1 = 'const pCorner = planeSheet[2];\n      const planeTag = "(P) ⊥ Ox";';
console.log('Target 1 (planeTag general):', js.includes(t1));

const t2 = 'if (cutW >= 0.35) {\n          const bLabel = "d=" + (Math.round(cutW * 100) / 100);';
console.log('Target 2 (bLabel general):', js.includes(t2));

const t3 = 'const bw = ctx.measureText(badgeText).width + 14;\n        const bh = 20;\n        const badgeY = topPt.sy - 18 - bh;';
console.log('Target 3 (badgeY general):', js.includes(t3));

const t4 = 'const axisTag = "x = " + (Math.round(activeCutX * 10) / 10);\n      ctx.font = "bold 9.5px system-ui, sans-serif";\n      const atw = ctx.measureText(axisTag).width + 8;\n      const atx = pCutOx.sx - atw / 2 - 10;\n      const aty = pCutOx.sy + 15;';
console.log('Target 4 (axisTag general):', js.includes(t4));

const t5 = 'const pCorner = planeSheet[2];\n      const planeTag = isRevY ? "(P) ⊥ Oy" : "(P) ⊥ Ox";';
console.log('Target 5 (planeTag secRev):', js.includes(t5));

const t6 = 'const bw = ctx.measureText(badgeText).width + 14;\n        const bh = 20;\n        // Position badge with generous 18px clearance above handle\n        const badgeY = topPt.sy - 18 - bh;';
console.log('Target 6 (badgeY secRev):', js.includes(t6));

const t7 = 'const axisTag = axisVar + " = " + (Math.round(cutCoord * 10) / 10);\n      ctx.font = "bold 9.5px system-ui, sans-serif";\n      const atw = ctx.measureText(axisTag).width + 8;\n      const atx = pCutAxis.sx - atw / 2 - 10;\n      const aty = pCutAxis.sy + 15;';
console.log('Target 7 (axisTag secRev):', js.includes(t7));
