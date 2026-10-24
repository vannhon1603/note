/**
 * PATCH: Direct On-Canvas Manipulation for 3D Volume & Cross-Sections
 * Allows:
 *  - Dragging directly on the 3D drawing to spin and orbit the 3D solid (yaw & pitch)
 *  - Grabbing and dragging the cross-section plane / handle directly to slide along the axis
 *  - On-canvas interactive slider track and drag handle
 *  - Header bar dragging to move the card
 */
const fs = require('fs');
let js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

function mustReplace(target, replacement, label) {
  const idx = js.indexOf(target);
  if (idx < 0) throw new Error('TARGET NOT FOUND: ' + label);
  js = js.slice(0, idx) + replacement + js.slice(idx + target.length);
  console.log('✓ Patched:', label);
}

// ─── 1. Patch move(t) to handle volCut and volOrbit ──────────────────────────
const moveTarget = 'case"crossSection":{';
const moveReplacement =
  'case"volCut":{' +
    'const p=this.toPage(o,s.page);' +
    'const dx=p.x-s.fromX;' +
    'const span=s.b-s.a;' +
    'const newCut=Math.max(s.a,Math.min(s.b,s.startCut+(dx/(s.w*0.75))*span));' +
    'const it=this.doc.pages[s.page].items.find(x=>x.id===s.id);' +
    'if(it){it.cutPos=Math.round(newCut*100)/100;this.redraw();}' +
    'return;' +
  '}' +
  'case"volOrbit":{' +
    'const dx=r-s.rawSX;' +
    'const dy=i-s.rawSY;' +
    'const it=this.doc.pages[s.page].items.find(x=>x.id===s.id);' +
    'if(!it)return;' +
    'it.viewYaw=s.startYaw+dx*0.012;' +
    'it.viewPitch=Math.max(-0.6,Math.min(1.2,s.startPitch-dy*0.01));' +
    'this.redraw();' +
    'return;' +
  '}' +
  'case"crossSection":{';

mustReplace(moveTarget, moveReplacement, 'move(t) volCut and volOrbit handler');

// ─── 2. Patch up(t) to commit changes ────────────────────────────────────────
const upTarget = 'case"crossSection":this.drag=null,this.redraw(),this.emit();return;';
const upReplacement =
  'case"crossSection":this.drag=null,this.redraw(),this.emit();return;' +
  'case"volCut":case"volOrbit":{' +
    'const it=this.doc.pages[r.page].items.find(x=>x.id===r.id);' +
    'this.drag=null;' +
    'if(it){this.commit(this.updatePage(r.page,p=>({...p,items:p.items.map(x=>x.id===it.id?{...it}:x)})));}' +
    'this.redraw();this.emit();return;' +
  '}';

mustReplace(upTarget, upReplacement, 'up(t) volCut and volOrbit commit');

// ─── 3. Patch selectDown inside selection box ────────────────────────────────
const selInsideTarget = 'if(!(this.selectMode==="object"&&this.unselectedAt(n,r,i,this.sel))&&i.x>=M.x0&&i.x<=M.x1&&i.y>=M.y0&&i.y<=M.y1){';
const selInsideReplacement =
  'if(!(this.selectMode==="object"&&this.unselectedAt(n,r,i,this.sel))&&i.x>=M.x0&&i.x<=M.x1&&i.y>=M.y0&&i.y<=M.y1){' +
    'const _vB=this.sel;' +
    'if(_vB&&_vB.items.size===1&&_vB.shapes.size===0&&_vB.strokes.size===0){' +
      'const _vId=[..._vB.items][0];' +
      'const _vItem=n.items.find(x=>x.id===_vId);' +
      'if(_vItem&&_vItem.type==="volume"){' +
        'if(i.y<=_vItem.y+36){' +
          'this.drag={k:"move",page:t,from:i,moved:!1,pick:void 0};' +
          'return;' +
        '}' +
        'const _isCross=(_vItem.axis||"").startsWith("sec-");' +
        'const _cutX=_vItem.cutPos!=null?_vItem.cutPos:((_vItem.a??-2)+(_vItem.b??2))/2;' +
        'const _nearBottom=i.y>=_vItem.y+_vItem.h-38;' +
        'const _nearHandle=_vItem._cutHandle&&Math.hypot((i.x-_vItem.x)-_vItem._cutHandle.x,(i.y-_vItem.y)-_vItem._cutHandle.y)<=38;' +
        'if(_isCross&&(_nearBottom||_nearHandle)){' +
          'this.capture(this.fingerId??1);' +
          'this.drag={k:"volCut",page:t,id:_vItem.id,fromX:i.x,startCut:_cutX,a:_vItem.a??-2,b:_vItem.b??2,w:_vItem.w};' +
          'return;' +
        '}' +
        'const _ep=this.pointerSeen??{sx:i.x,sy:i.y};' +
        'this.capture(this.fingerId??1);' +
        'this.drag={k:"volOrbit",page:t,id:_vItem.id,rawSX:_ep.sx,rawSY:_ep.sy,startYaw:_vItem.viewYaw??0.44,startPitch:_vItem.viewPitch??0.34};' +
        'return;' +
      '}' +
    '}';

mustReplace(selInsideTarget, selInsideReplacement, 'selectDown inside volume interaction');

// ─── 4. Patch selectDown for unselected volume item (first click) ────────────
const unselTarget = 'else if(v&&!w)d.items.add(v.id);';
const unselReplacement =
  'else if(v&&!w){' +
    'd.items.add(v.id);' +
    'if(v.type==="volume"){' +
      'this.sel=d;' +
      'if(i.y>v.y+36){' +
        'const _isCross=(v.axis||"").startsWith("sec-");' +
        'const _cutX=v.cutPos!=null?v.cutPos:((v.a??-2)+(v.b??2))/2;' +
        'const _nearBottom=i.y>=v.y+v.h-38;' +
        'const _nearHandle=v._cutHandle&&Math.hypot((i.x-v.x)-v._cutHandle.x,(i.y-v.y)-v._cutHandle.y)<=38;' +
        'if(_isCross&&(_nearBottom||_nearHandle)){' +
          'this.capture(this.fingerId??1);' +
          'this.drag={k:"volCut",page:t,id:v.id,fromX:i.x,startCut:_cutX,a:v.a??-2,b:v.b??2,w:v.w};' +
        '}else{' +
          'const _ep=this.pointerSeen??{sx:i.x,sy:i.y};' +
          'this.capture(this.fingerId??1);' +
          'this.drag={k:"volOrbit",page:t,id:v.id,rawSX:_ep.sx,rawSY:_ep.sy,startYaw:v.viewYaw??0.44,startPitch:v.viewPitch??0.34};' +
        '}' +
        'this.redraw();this.emit();return;' +
      '}' +
    '}' +
  '}';

mustReplace(unselTarget, unselReplacement, 'selectDown unselected volume first-click interaction');

// ─── 5. Update drawVolume3D to store _cutHandle and draw tactile handles ──────
const cutBadgeOld = 'ctx.fillText(badgeText, topPt.sx, topPt.sy - 13);';
const cutBadgeNew =
  'ctx.fillText(badgeText, topPt.sx, topPt.sy - 13);' +
  'item._cutHandle = { x: topPt.sx - x, y: topPt.sy - y };' +
  'ctx.beginPath();ctx.arc(topPt.sx, topPt.sy, 8, 0, Math.PI * 2);ctx.fillStyle = "#ffffff";ctx.fill();' +
  'ctx.strokeStyle = "#d97706";ctx.lineWidth = 2.5;ctx.stroke();' +
  'ctx.beginPath();ctx.arc(topPt.sx, topPt.sy, 3.5, 0, Math.PI * 2);ctx.fillStyle = "#d97706";ctx.fill();';

mustReplace(cutBadgeOld, cutBadgeNew, 'drawVolume3D _cutHandle and handle pin');

// ─── 6. Add on-canvas slider rail and 3D rotation hint to drawVolume3D ────────
const endCardOld = 'ctx.restore();\n}';
const endCardNew =
  'if(isCross){' +
    'const tY=y+h-18,tX0=x+40,tX1=x+w-40,tW=tX1-tX0;' +
    'const knobX=tX0+((activeCutX-na)/(nb-na))*tW;' +
    'ctx.strokeStyle="rgba(203,213,225,0.8)";ctx.lineWidth=4;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(tX0,tY);ctx.lineTo(tX1,tY);ctx.stroke();' +
    'ctx.strokeStyle="#d97706";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(tX0,tY);ctx.lineTo(knobX,tY);ctx.stroke();' +
    'ctx.fillStyle="#ffffff";ctx.beginPath();ctx.arc(knobX,tY,8,0,Math.PI*2);ctx.fill();' +
    'ctx.strokeStyle="#d97706";ctx.lineWidth=2.5;ctx.stroke();' +
    'ctx.fillStyle="#d97706";ctx.beginPath();ctx.arc(knobX,tY,3.5,0,Math.PI*2);ctx.fill();' +
    'ctx.fillStyle="#64748b";ctx.font="bold 10px system-ui";ctx.textAlign="right";ctx.fillText("a="+na,tX0-6,tY+3);' +
    'ctx.textAlign="left";ctx.fillText("b="+nb,tX1+6,tY+3);' +
    'ctx.textAlign="center";ctx.fillStyle="#b45309";ctx.fillText("\u2194 Kéo trượt mặt cắt x = "+(Math.round(activeCutX*100)/100),(tX0+tX1)/2,tY-9);' +
  '}' +
  'const hintText=isCross?"\uD83D\uDD04 Kéo hình để xoay 3D \u2022 Kéo \u2194 trượt mặt cắt":"\uD83D\uDD04 Kéo chuột trên hình để xoay 3D";' +
  'ctx.font="11px system-ui, sans-serif";' +
  'const hintW=ctx.measureText(hintText).width+16;' +
  'ctx.fillStyle="rgba(241,245,249,0.92)";ctx.strokeStyle="#cbd5e1";ctx.lineWidth=1;' +
  'ctx.fillRect(x+w-hintW-10,y+10,hintW,22);ctx.strokeRect(x+w-hintW-10,y+10,hintW,22);' +
  'ctx.fillStyle="#475569";ctx.textAlign="center";ctx.textBaseline="middle";' +
  'ctx.fillText(hintText,x+w-hintW/2-10,y+21);' +
  'ctx.restore();\n}';

mustReplace(endCardOld, endCardNew, 'drawVolume3D on-canvas slider and 3D hint badge');

fs.writeFileSync('dist/assets/index-D9JME9Hm.js', js, 'utf8');
console.log('\n🎉 Successfully applied Direct On-Canvas Manipulation for 3D Volume!');
