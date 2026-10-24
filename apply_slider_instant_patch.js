const fs = require('fs');

let content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// 1. Selection bar sweepAngle range slider: instantaneous input + deferred commit on release
const oldSweepSlider = 'f.jsx("input",{type:"range",min:10,max:360,step:5,value:sw,style:{width:"70px"},onChange:e=>{stopVolAnim();ee.replaceItem(_s.page,{...it,sweepAngle:Number(e.target.value),_playing:false})}})';
const newSweepSlider = 'f.jsx("input",{type:"range",min:0,max:360,step:5,value:sw,style:{width:"70px"},onPointerDown:()=>{stopVolAnim();it._dragging=true;},onInput:e=>{stopVolAnim();it._dragging=true;it._playing=false;const v=Number(e.target.value);it.sweepAngle=v;if(e.currentTarget.previousSibling){e.currentTarget.previousSibling.textContent=v+"°";}ee.redraw();},onPointerUp:e=>{it._dragging=false;const v=Number(e.target.value);ee.replaceItem(_s.page,{...it,sweepAngle:v,_playing:false});},onChange:e=>{stopVolAnim();if(it._dragging)return;ee.replaceItem(_s.page,{...it,sweepAngle:Number(e.target.value),_playing:false});}})';

if (!content.includes(oldSweepSlider)) {
  console.error('Error: oldSweepSlider not found');
  process.exit(1);
}
content = content.replace(oldSweepSlider, newSweepSlider);
console.log('Replaced sweepAngle slider successfully');

// 2. Selection bar cutPos range slider: instantaneous input + deferred commit on release
const oldCutSlider = 'f.jsx("input",{type:"range",min:na,max:nb,step:(nb-na)/100,value:cutX,style:{width:"80px"},onChange:e=>{stopVolAnim();ee.replaceItem(_s.page,{...it,cutPos:Number(e.target.value),_playing:false})}})';
const newCutSlider = 'f.jsx("input",{type:"range",min:na,max:nb,step:(nb-na)/100,value:cutX,style:{width:"80px"},onPointerDown:()=>{stopVolAnim();it._dragging=true;},onInput:e=>{stopVolAnim();it._dragging=true;it._playing=false;const v=Number(e.target.value);it.cutPos=Math.round(v*100)/100;if(e.currentTarget.previousSibling){e.currentTarget.previousSibling.textContent=String(Math.round(v*100)/100);}ee.redraw();},onPointerUp:e=>{it._dragging=false;const v=Number(e.target.value);ee.replaceItem(_s.page,{...it,cutPos:v,_playing:false});},onChange:e=>{stopVolAnim();if(it._dragging)return;ee.replaceItem(_s.page,{...it,cutPos:Number(e.target.value),_playing:false});}})';

if (!content.includes(oldCutSlider)) {
  console.error('Error: oldCutSlider not found');
  process.exit(1);
}
content = content.replace(oldCutSlider, newCutSlider);
console.log('Replaced cutPos slider successfully');

// 3. selectDown volCut and volSweep for selected item (_vItem)
const oldSD1 = `if(_isCross){
          if(_nearBottom||_nearHandle){
            this.capture(this.fingerId??1);
            this.drag={k:"volCut",page:t,id:_vItem.id,fromX:i.x,startCut:_cutX,a:_vItem.a??-2,b:_vItem.b??2,w:_vItem.w};
            return;
          }
        }else{
          const _nearRotHandle=_vItem._rotHandle&&Math.hypot((i.x-_vItem.x)-_vItem._rotHandle.x,(i.y-_vItem.y)-_vItem._rotHandle.y)<=42;
          if(_nearBottom||_nearRotHandle){
            this.capture(this.fingerId??1);
            this.drag={k:"volSweep",page:t,id:_vItem.id,fromX:i.x,startSweep:_vItem.sweepAngle!=null?_vItem.sweepAngle:360,w:_vItem.w};
            return;
          }
        }`;

const newSD1 = `if(_isCross){
          if(_nearBottom||_nearHandle){
            this.capture(this.fingerId??1);
            const _tX0=_vItem.x+40,_tX1=_vItem.x+_vItem.w-255,_tW=Math.max(60,_tX1-_tX0);
            const _na=_vItem.a??-2,_nb=_vItem.b??2;
            if(_nearBottom){
              const _frac=Math.max(0,Math.min(1,(i.x-_tX0)/_tW));
              _vItem.cutPos=Math.round((_na+_frac*(_nb-_na))*100)/100;
              _vItem._dragging=true;
              this.redraw();
            }
            this.drag={k:"volCut",page:t,id:_vItem.id,fromX:i.x,startCut:_cutX,a:_na,b:_nb,w:_vItem.w,tX0:_tX0,tW:_tW,isRail:_nearBottom};
            return;
          }
        }else{
          const _nearRotHandle=_vItem._rotHandle&&Math.hypot((i.x-_vItem.x)-_vItem._rotHandle.x,(i.y-_vItem.y)-_vItem._rotHandle.y)<=42;
          if(_nearBottom||_nearRotHandle){
            this.capture(this.fingerId??1);
            const _tVolW=(_vItem.volume!=null&&isFinite(_vItem.volume))?225:40;
            const _tX0=_vItem.x+35,_tX1=_vItem.x+_vItem.w-_tVolW-20,_tW=Math.max(60,_tX1-_tX0);
            if(_nearBottom){
              const _frac=Math.max(0,Math.min(1,(i.x-_tX0)/_tW));
              _vItem.sweepAngle=Math.round(_frac*360);
              _vItem._dragging=true;
              this.redraw();
            }
            this.drag={k:"volSweep",page:t,id:_vItem.id,fromX:i.x,startSweep:_vItem.sweepAngle!=null?_vItem.sweepAngle:360,w:_vItem.w,tX0:_tX0,tW:_tW,isRail:_nearBottom};
            return;
          }
        }`;

if (!content.includes(oldSD1)) {
  console.error('Error: oldSD1 not found');
  process.exit(1);
}
content = content.replace(oldSD1, newSD1);
console.log('Replaced selectDown 1 successfully');

// 4. selectDown volCut and volSweep for unselected item (v)
const oldSD2 = `if(_isCross){
          if(_nearBottom||_nearHandle){
            this.capture(this.fingerId??1);
            this.drag={k:"volCut",page:t,id:v.id,fromX:i.x,startCut:_cutX,a:v.a??-2,b:v.b??2,w:v.w};
          }else{
            const _ep=this.pointerSeen??{sx:i.x,sy:i.y};
            this.capture(this.fingerId??1);
            this.drag={k:"volOrbit",page:t,id:v.id,rawSX:_ep.sx,rawSY:_ep.sy,startYaw:v.viewYaw??0.44,startPitch:v.viewPitch??0.34};
          }
        }else{
          const _nearRotHandle=v._rotHandle&&Math.hypot((i.x-v.x)-v._rotHandle.x,(i.y-v.y)-v._rotHandle.y)<=42;
          if(_nearBottom||_nearRotHandle){
            this.capture(this.fingerId??1);
            this.drag={k:"volSweep",page:t,id:v.id,fromX:i.x,startSweep:v.sweepAngle!=null?v.sweepAngle:360,w:v.w};
          }else{`;

const newSD2 = `if(_isCross){
          if(_nearBottom||_nearHandle){
            this.capture(this.fingerId??1);
            const _tX0=v.x+40,_tX1=v.x+v.w-255,_tW=Math.max(60,_tX1-_tX0);
            const _na=v.a??-2,_nb=v.b??2;
            if(_nearBottom){
              const _frac=Math.max(0,Math.min(1,(i.x-_tX0)/_tW));
              v.cutPos=Math.round((_na+_frac*(_nb-_na))*100)/100;
              v._dragging=true;
              this.redraw();
            }
            this.drag={k:"volCut",page:t,id:v.id,fromX:i.x,startCut:_cutX,a:_na,b:_nb,w:v.w,tX0:_tX0,tW:_tW,isRail:_nearBottom};
          }else{
            const _ep=this.pointerSeen??{sx:i.x,sy:i.y};
            this.capture(this.fingerId??1);
            this.drag={k:"volOrbit",page:t,id:v.id,rawSX:_ep.sx,rawSY:_ep.sy,startYaw:v.viewYaw??0.44,startPitch:v.viewPitch??0.34};
          }
        }else{
          const _nearRotHandle=v._rotHandle&&Math.hypot((i.x-v.x)-v._rotHandle.x,(i.y-v.y)-v._rotHandle.y)<=42;
          if(_nearBottom||_nearRotHandle){
            this.capture(this.fingerId??1);
            const _tVolW=(v.volume!=null&&isFinite(v.volume))?225:40;
            const _tX0=v.x+35,_tX1=v.x+v.w-_tVolW-20,_tW=Math.max(60,_tX1-_tX0);
            if(_nearBottom){
              const _frac=Math.max(0,Math.min(1,(i.x-_tX0)/_tW));
              v.sweepAngle=Math.round(_frac*360);
              v._dragging=true;
              this.redraw();
            }
            this.drag={k:"volSweep",page:t,id:v.id,fromX:i.x,startSweep:v.sweepAngle!=null?v.sweepAngle:360,w:v.w,tX0:_tX0,tW:_tW,isRail:_nearBottom};
          }else{`;

if (!content.includes(oldSD2)) {
  console.error('Error: oldSD2 not found');
  process.exit(1);
}
content = content.replace(oldSD2, newSD2);
console.log('Replaced selectDown 2 successfully');

// 5. move(t) volSweep: 1:1 instantaneous absolute rail tracking + relative handle
const oldMoveSweep = `case"volSweep":{
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

const newMoveSweep = `case"volSweep":{
    const it=this.doc.pages[s.page].items.find(x=>x.id===s.id);
    if(!it)return;
    it._dragging=true;
    const p=this.toPage(o,s.page);
    let newSweep;
    if(s.isRail&&s.tW){
      const frac=Math.max(0,Math.min(1,(p.x-s.tX0)/s.tW));
      newSweep=Math.round(frac*360);
    }else{
      const dx=p.x-s.fromX;
      newSweep=Math.max(0,Math.min(360,s.startSweep+(dx/(s.w*0.58))*360));
    }
    it.sweepAngle=Math.round(newSweep);
    this.redraw();
    return;
  }`;

if (!content.includes(oldMoveSweep)) {
  console.error('Error: oldMoveSweep not found');
  process.exit(1);
}
content = content.replace(oldMoveSweep, newMoveSweep);
console.log('Replaced move volSweep successfully');

// 6. move(t) volCut: 1:1 instantaneous absolute rail tracking + relative handle
const oldMoveCut = `case"volCut":{const p=this.toPage(o,s.page);const dx=p.x-s.fromX;const span=s.b-s.a;const newCut=Math.max(s.a,Math.min(s.b,s.startCut+(dx/(s.w*0.75))*span));const it=this.doc.pages[s.page].items.find(x=>x.id===s.id);if(it){it.cutPos=Math.round(newCut*100)/100;this.redraw();}return;}`;

const newMoveCut = `case"volCut":{const p=this.toPage(o,s.page);const it=this.doc.pages[s.page].items.find(x=>x.id===s.id);if(it){it._dragging=true;let newCut;if(s.isRail&&s.tW){const frac=Math.max(0,Math.min(1,(p.x-s.tX0)/s.tW));newCut=Math.max(s.a,Math.min(s.b,s.a+frac*(s.b-s.a)));}else{const dx=p.x-s.fromX;const span=s.b-s.a;newCut=Math.max(s.a,Math.min(s.b,s.startCut+(dx/(s.w*0.75))*span));}it.cutPos=Math.round(newCut*100)/100;this.redraw();}return;}`;

if (!content.includes(oldMoveCut)) {
  console.error('Error: oldMoveCut not found');
  process.exit(1);
}
content = content.replace(oldMoveCut, newMoveCut);
console.log('Replaced move volCut successfully');

// Write back
fs.writeFileSync('dist/assets/index-D9JME9Hm.js', content, 'utf8');
console.log('ALL PATCHES APPLIED SUCCESSFULLY!');
