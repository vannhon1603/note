const fs = require('fs');

const path = 'dist/assets/index-D9JME9Hm.js';
let js = fs.readFileSync(path, 'utf8');

const oldSliderLine = 'const tVolW = (item.volume != null && isFinite(item.volume)) ? 175 : 40;\n    const tY=y+h-18,tX0=x+40,tX1=x+w-tVolW-15,tW=Math.max(60, tX1-tX0);';
const newSliderLine = 'const tVolW = (item.volume != null && isFinite(item.volume)) ? 225 : 40;\n    const tY=y+h-18,tX0=x+35,tX1=x+w-tVolW-20,tW=Math.max(60, tX1-tX0);';

if (js.indexOf(oldSliderLine) !== -1) {
  js = js.replace(oldSliderLine, newSliderLine);
  console.log('✓ Successfully adjusted tX1 to clear the volume box by 25px');
} else {
  console.error('oldSliderLine not found');
  process.exit(1);
}

const oldVolBg = 'ctx.fillStyle = "rgba(255, 255, 255, 0.92)";\n    ctx.fillRect(x + w - textW - 20, y + h - 34, textW + 14, 26);';
const newVolBg = 'ctx.fillStyle = "#ffffff";\n    ctx.fillRect(x + w - textW - 20, y + h - 34, textW + 14, 26);';

if (js.indexOf(oldVolBg) !== -1) {
  js = js.replace(oldVolBg, newVolBg);
  console.log('✓ Volume box background set to solid #ffffff');
}

fs.writeFileSync(path, js, 'utf8');
console.log('Done!');
