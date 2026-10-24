const fs = require('fs');

const path = 'dist/assets/index-D9JME9Hm.js';
let js = fs.readFileSync(path, 'utf8');

// In case "volSweep":
const oldSweepBlock = `case"volSweep":{
    const it=this.doc.pages[s.page].items.find(x=>x.id===s.id);
    if(it) it._dragging=true;
    const p=this.toPage(o,s.page);
    const dx=p.x-s.fromX;
    const it=this.doc.pages[s.page].items.find(x=>x.id===s.id);
    if(!it)return;
    const newSweep=Math.max(0,Math.min(360,s.startSweep+(dx/(s.w*0.58))*360));
    it.sweepAngle=Math.round(newSweep);
    this.redraw();
    return;
  }`;

const cleanSweepBlock = `case"volSweep":{
    const it=this.doc.pages[s.page].items.find(x=>x.id===s.id);
    if(!it)return;
    it._dragging=true;
    const p=this.toPage(o,s.page);
    const dx=p.x-s.fromX;
    const newSweep=Math.max(0,Math.min(360,s.startSweep+(dx/(s.w*0.58))*360));
    it.sweepAngle=Math.round(newSweep);
    this.redraw();
    return;
  }`;

if (js.indexOf(oldSweepBlock) !== -1) {
  js = js.replace(oldSweepBlock, cleanSweepBlock);
  console.log('✓ Cleaned duplicate "it" in volSweep');
} else {
  console.warn('oldSweepBlock not exact match, searching alternative...');
}

// In case "volOrbit":
const oldOrbitBlock = `case"volOrbit":{
    const it=this.doc.pages[s.page].items.find(x=>x.id===s.id);
    if(it) it._dragging=true;const dx=r-s.rawSX;const dy=i-s.rawSY;const it=this.doc.pages[s.page].items.find(x=>x.id===s.id);if(!it)return;it.viewYaw=s.startYaw+dx*0.012;it.viewPitch=Math.max(-0.6,Math.min(1.2,s.startPitch-dy*0.01));this.redraw();return;}`;

const cleanOrbitBlock = `case"volOrbit":{
    const it=this.doc.pages[s.page].items.find(x=>x.id===s.id);
    if(!it)return;
    it._dragging=true;
    const dx=r-s.rawSX;
    const dy=i-s.rawSY;
    it.viewYaw=s.startYaw+dx*0.012;
    it.viewPitch=Math.max(-0.6,Math.min(1.2,s.startPitch-dy*0.01));
    this.redraw();
    return;
  }`;

if (js.indexOf(oldOrbitBlock) !== -1) {
  js = js.replace(oldOrbitBlock, cleanOrbitBlock);
  console.log('✓ Cleaned duplicate "it" in volOrbit');
} else {
  console.warn('oldOrbitBlock not exact match, searching alternative...');
}

fs.writeFileSync(path, js, 'utf8');
console.log('Done cleaning duplicates!');
