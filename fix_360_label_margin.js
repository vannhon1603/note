const fs = require('fs');

const path = 'dist/assets/index-D9JME9Hm.js';
let js = fs.readFileSync(path, 'utf8');

// Adjust tX1 in revolution slider
const oldRevSlider = 'const tVolW = (item.volume != null && isFinite(item.volume)) ? 180 : 40;\n    const tY=y+h-18,tX0=x+40,tX1=x+w-tVolW-45,tW=Math.max(60, tX1-tX0);';
const newRevSlider = 'const tY=y+h-18,tX0=x+40,tX1=x+w-255,tW=Math.max(60, tX1-tX0);';

if (js.indexOf(oldRevSlider) !== -1) {
  js = js.replace(oldRevSlider, newRevSlider);
  console.log('✓ Adjusted tX1 to x + w - 255');
}

// Solid white background for volume box to ensure crystal clear contrast
const oldVolBg = 'ctx.fillStyle = "rgba(255, 255, 255, 0.92)";\n    ctx.fillRect(x + w - textW - 20, y + h - 34, textW + 14, 26);';
const newVolBg = 'ctx.fillStyle = "#ffffff";\n    ctx.fillRect(x + w - textW - 20, y + h - 34, textW + 14, 26);';

if (js.indexOf(oldVolBg) !== -1) {
  js = js.replace(oldVolBg, newVolBg);
  console.log('✓ Opaque white background for volume badge');
}

fs.writeFileSync(path, js, 'utf8');
console.log('Done!');
