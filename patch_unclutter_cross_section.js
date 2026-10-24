const fs = require('fs');

let js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const targetStr = `// Draw interactive Center Drag Handle
const hcx=(bx0+bx1)/2, hcy=(by0+by1)/2;
cs._centerHandle={x:hcx, y:hcy, r:18};
cs._planeCorners=planeCorners;
t.save();
t.shadowColor="rgba(2, 132, 199, 0.4)";
t.shadowBlur=12;
t.beginPath();
t.arc(hcx, hcy, 16, 0, Math.PI*2);
t.fillStyle="#0284c7";
t.fill();
t.strokeStyle="#ffffff";
t.lineWidth=2.5;
t.stroke();
t.restore();
t.fillStyle="#ffffff";
t.font="bold 15px system-ui, sans-serif";
t.textAlign="center";
t.textBaseline="middle";
t.fillText(cs.type==="vert"?"↔":cs.type==="diag"?"⤡":"↕", hcx, hcy);
// Center Badge with position %
const badgeText=(cs.pos??50)+"% • Kéo dời";
t.font="bold 11px system-ui, sans-serif";
const btw=t.measureText(badgeText).width;
t.fillStyle="rgba(15, 23, 42, 0.88)";
t.beginPath();
t.roundRect?t.roundRect(hcx-btw/2-8, hcy+22, btw+16, 20, 10):t.rect(hcx-btw/2-8, hcy+22, btw+16, 20);
t.fill();
t.fillStyle="#ffffff";
t.fillText(badgeText, hcx, hcy+32);
// Draw Rotate Handle for Diagonal mode
if(cs.type==="diag" && planeCorners && planeCorners[2]){
  const rotPt=planeCorners[2];
  cs._rotHandle={x:rotPt.x, y:rotPt.y, r:16};
  t.save();
  t.shadowColor="rgba(234, 88, 12, 0.45)";
  t.shadowBlur=10;
  t.beginPath();
  t.arc(rotPt.x, rotPt.y, 14, 0, Math.PI*2);
  t.fillStyle="#ea580c";
  t.fill();
  t.strokeStyle="#ffffff";
  t.lineWidth=2;
  t.stroke();
  t.restore();
  t.fillStyle="#ffffff";
  t.font="bold 14px system-ui, sans-serif";
  t.fillText("⟳", rotPt.x, rotPt.y);
  const rotBadge=(cs.angle??45)+"° • Kéo xoay";
  const rtw=t.measureText(rotBadge).width;
  t.fillStyle="rgba(15, 23, 42, 0.88)";
  t.beginPath();
  t.roundRect?t.roundRect(rotPt.x-rtw/2-8, rotPt.y+20, rtw+16, 20, 10):t.rect(rotPt.x-rtw/2-8, rotPt.y+20, rtw+16, 20);
  t.fill();
  t.fillStyle="#ffffff";
  t.fillText(rotBadge, rotPt.x, rotPt.y+30);
}`;

const replacementStr = `// Interactive Drag Handle: placed neatly at the outer corner/edge of plane, NOT covering solid center
const isDragging=this.drag && this.drag.k==="crossSection";
let hcx, hcy;
if(planeCorners && planeCorners[1]){
  hcx=planeCorners[1].x;
  hcy=planeCorners[1].y;
} else {
  hcx=bx1+24;
  hcy=(by0+by1)/2;
}
cs._centerHandle={x:hcx, y:hcy, r:14};
cs._planeCorners=planeCorners;
t.save();
t.shadowColor="rgba(2, 132, 199, 0.35)";
t.shadowBlur=8;
t.beginPath();
t.arc(hcx, hcy, 12, 0, Math.PI*2);
t.fillStyle="#0284c7";
t.fill();
t.strokeStyle="#ffffff";
t.lineWidth=2;
t.stroke();
t.restore();
t.fillStyle="#ffffff";
t.font="bold 12px system-ui, sans-serif";
t.textAlign="center";
t.textBaseline="middle";
t.fillText(cs.type==="vert"?"↔":cs.type==="diag"?"⤡":"↕", hcx, hcy);
// Only display position badge while dragging to keep view completely clear
if(isDragging && this.drag.mode==="pos"){
  const badgeText=(cs.pos??50)+"%";
  t.font="bold 11px system-ui, sans-serif";
  const btw=t.measureText(badgeText).width;
  t.fillStyle="rgba(15, 23, 42, 0.82)";
  t.beginPath();
  t.roundRect?t.roundRect(hcx-btw/2-6, hcy+16, btw+12, 18, 9):t.rect(hcx-btw/2-6, hcy+16, btw+12, 18);
  t.fill();
  t.fillStyle="#ffffff";
  t.fillText(badgeText, hcx, hcy+25);
}
// Draw Rotate Handle for Diagonal mode
if(cs.type==="diag" && planeCorners && planeCorners[2]){
  const rotPt=planeCorners[2];
  cs._rotHandle={x:rotPt.x, y:rotPt.y, r:14};
  t.save();
  t.shadowColor="rgba(234, 88, 12, 0.35)";
  t.shadowBlur=8;
  t.beginPath();
  t.arc(rotPt.x, rotPt.y, 12, 0, Math.PI*2);
  t.fillStyle="#ea580c";
  t.fill();
  t.strokeStyle="#ffffff";
  t.lineWidth=2;
  t.stroke();
  t.restore();
  t.fillStyle="#ffffff";
  t.font="bold 12px system-ui, sans-serif";
  t.fillText("⟳", rotPt.x, rotPt.y);
  if(isDragging && this.drag.mode==="angle"){
    const rotBadge=(cs.angle??45)+"°";
    const rtw=t.measureText(rotBadge).width;
    t.fillStyle="rgba(15, 23, 42, 0.82)";
    t.beginPath();
    t.roundRect?t.roundRect(rotPt.x-rtw/2-6, rotPt.y+16, rtw+12, 18, 9):t.rect(rotPt.x-rtw/2-6, rotPt.y+16, rtw+12, 18);
    t.fill();
    t.fillStyle="#ffffff";
    t.fillText(rotBadge, rotPt.x, rotPt.y+25);
  }
}`;

if (!js.includes(targetStr)) {
  console.error('Target string not found in dist/assets/index-D9JME9Hm.js');
  process.exit(1);
}

js = js.replace(targetStr, replacementStr);
fs.writeFileSync('dist/assets/index-D9JME9Hm.js', js, 'utf8');
console.log('Successfully uncluttered cross section handle and badges!');
