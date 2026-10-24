const fs = require('fs');

const path = 'dist/assets/index-D9JME9Hm.js';
let js = fs.readFileSync(path, 'utf8');

// 1. Remove duplicate volume text in rj.renderItem
const oldDupText = 'if(t.volume!=null&&isFinite(t.volume)){e.save();e.fillStyle="rgba(30,64,175,0.92)";e.font="bold "+Math.min(14,t.h*0.055)+"px system-ui,sans-serif";e.textAlign="right";e.textBaseline="bottom";e.fillText("V ≈ "+fmtVolume(t.volume),t.x+t.w-8,t.y+t.h-6);e.restore();}return;}if(t.type==="graph")';
const newDupText = 'return;}if(t.type==="graph")';

if (js.indexOf(oldDupText) !== -1) {
  js = js.replace(oldDupText, newDupText);
  console.log('Duplicate volume render removed from rj.renderItem');
} else {
  console.warn('oldDupText not found, checking alternatives...');
}

// 2. Adjust cardW in drawVolume3D so longer title doesn't clip
const oldCardW = 'const cardW = 180, cardH = 50;';
const newCardW = 'const cardW = Math.max(220, Math.min(300, w * 0.56)), cardH = 50;';

if (js.indexOf(oldCardW) !== -1) {
  js = js.replace(oldCardW, newCardW);
  console.log('cardW adjusted to dynamic width');
}

// 3. Prevent slider rail from colliding with bottom-right volume badge
const oldSliderX1 = 'const tY=y+h-18,tX0=x+40,tX1=x+w-40,tW=tX1-tX0;';
const newSliderX1 = 'const tVolW = (item.volume != null && isFinite(item.volume)) ? 175 : 40; const tY=y+h-18,tX0=x+40,tX1=x+w-tVolW-15,tW=Math.max(60, tX1-tX0);';

if (js.indexOf(oldSliderX1) !== -1) {
  js = js.replace(oldSliderX1, newSliderX1);
  console.log('Slider rail end adjusted to avoid volume badge overlap');
}

fs.writeFileSync(path, js, 'utf8');
console.log('Visual overlap fixes written successfully');
