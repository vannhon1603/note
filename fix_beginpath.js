const fs = require('fs');

let bundle = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// Replace the planeTag drawing in both branches to ensure ctx.beginPath() is called
const oldPlaneTag1 = `      const planeTag = isRevY ? "Mặt phẳng (P) ⊥ Oy" : "Mặt phẳng (P) ⊥ Ox";
      ctx.font = "bold 10px system-ui, sans-serif";
      const ptw = ctx.measureText(planeTag).width + 10;
      ctx.fillStyle = "rgba(6, 182, 212, 0.9)";
      if (ctx.roundRect) ctx.roundRect(planeTop.sx - ptw / 2, planeTop.sy - 18, ptw, 16, 4);
      else ctx.rect(planeTop.sx - ptw / 2, planeTop.sy - 18, ptw, 16);
      ctx.fill();`;

const newPlaneTag1 = `      const planeTag = isRevY ? "Mặt phẳng (P) ⊥ Oy" : "Mặt phẳng (P) ⊥ Ox";
      ctx.font = "bold 10px system-ui, sans-serif";
      const ptw = ctx.measureText(planeTag).width + 12;
      ctx.fillStyle = "rgba(8, 145, 178, 0.9)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(planeTop.sx - ptw / 2, planeTop.sy - 20, ptw, 16, 4);
      else ctx.rect(planeTop.sx - ptw / 2, planeTop.sy - 20, ptw, 16);
      ctx.fill();`;

if (bundle.includes(oldPlaneTag1)) {
  bundle = bundle.replace(oldPlaneTag1, newPlaneTag1);
  console.log('Fixed planeTag1 beginPath');
}

const oldPlaneTag2 = `      const planeTag = "Mặt phẳng (P) ⊥ Ox";
      ctx.font = "bold 10px system-ui, sans-serif";
      const ptw = ctx.measureText(planeTag).width + 10;
      ctx.fillStyle = "rgba(6, 182, 212, 0.9)";
      if (ctx.roundRect) ctx.roundRect(planeTop.sx - ptw / 2, planeTop.sy - 18, ptw, 16, 4);
      else ctx.rect(planeTop.sx - ptw / 2, planeTop.sy - 18, ptw, 16);
      ctx.fill();`;

const newPlaneTag2 = `      const planeTag = "Mặt phẳng (P) ⊥ Ox";
      ctx.font = "bold 10px system-ui, sans-serif";
      const ptw = ctx.measureText(planeTag).width + 12;
      ctx.fillStyle = "rgba(8, 145, 178, 0.9)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(planeTop.sx - ptw / 2, planeTop.sy - 20, ptw, 16, 4);
      else ctx.rect(planeTop.sx - ptw / 2, planeTop.sy - 20, ptw, 16);
      ctx.fill();`;

if (bundle.includes(oldPlaneTag2)) {
  bundle = bundle.replace(oldPlaneTag2, newPlaneTag2);
  console.log('Fixed planeTag2 beginPath');
}

// Ensure ctx.beginPath() for all pills
bundle = bundle.replace(
  'ctx.fillStyle = "rgba(255, 255, 255, 0.95)";\n        if (ctx.roundRect) ctx.roundRect(rMidX - rlw / 2, rMidY - 9, rlw, 18, 5);',
  'ctx.fillStyle = "rgba(255, 255, 255, 0.95)";\n        ctx.beginPath();\n        if (ctx.roundRect) ctx.roundRect(rMidX - rlw / 2, rMidY - 9, rlw, 18, 5);'
);

bundle = bundle.replace(
  'ctx.fillStyle = "rgba(255, 255, 255, 0.95)";\n        if (ctx.roundRect) ctx.roundRect(pMidBase.sx - blw / 2, pMidBase.sy - 9, blw, 18, 5);',
  'ctx.fillStyle = "rgba(255, 255, 255, 0.95)";\n        ctx.beginPath();\n        if (ctx.roundRect) ctx.roundRect(pMidBase.sx - blw / 2, pMidBase.sy - 9, blw, 18, 5);'
);

bundle = bundle.replace(
  'ctx.fillStyle = "rgba(255, 255, 255, 0.92)";\n      if (ctx.roundRect) ctx.roundRect(pCutAxis.sx - atw / 2, aty - 8, atw, 16, 4);',
  'ctx.fillStyle = "rgba(255, 255, 255, 0.92)";\n      ctx.beginPath();\n      if (ctx.roundRect) ctx.roundRect(pCutAxis.sx - atw / 2, aty - 8, atw, 16, 4);'
);

bundle = bundle.replace(
  'ctx.fillStyle = "rgba(255, 255, 255, 0.92)";\n      if (ctx.roundRect) ctx.roundRect(pCutOx.sx - atw / 2, aty - 8, atw, 16, 4);',
  'ctx.fillStyle = "rgba(255, 255, 255, 0.92)";\n      ctx.beginPath();\n      if (ctx.roundRect) ctx.roundRect(pCutOx.sx - atw / 2, aty - 8, atw, 16, 4);'
);

fs.writeFileSync('dist/assets/index-D9JME9Hm.js', bundle, 'utf8');
console.log('All beginPath calls ensured!');
