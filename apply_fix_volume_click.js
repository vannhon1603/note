const fs = require('fs');

let js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// Backup first
fs.writeFileSync('dist/assets/index-D9JME9Hm.js.bak_fix_click', js);

// Check toolbar Tab 2 button
const oldToolbarTab2 = 'const targetAx=(it.lastSecAxis&&it.lastSecAxis.startsWith("sec-"))?it.lastSecAxis:(it.axis==="oy"?"sec-oy":"sec-ox");';
const newToolbarTab2 = 'const targetAx=(it.axis==="oy"||it.axis==="sec-oy"||it.lastSecAxis==="sec-oy")?"sec-oy":"sec-ox";';

if (!js.includes(oldToolbarTab2)) {
  console.error('Could not find oldToolbarTab2');
} else {
  js = js.replace(oldToolbarTab2, newToolbarTab2);
  console.log('✓ Replaced oldToolbarTab2');
}

// Now replace the Selected block in selectDown
// From: const _vId=[..._vB.items][0];const _vItem=n.items.find(x=>x.id===_vId);if(_vItem&&_vItem.type==="volume"){
// To before: const B=this.sel,j=this.tol()

const targetSelectedStart = 'const _vId=[..._vB.items][0];const _vItem=n.items.find(x=>x.id===_vId);if(_vItem&&_vItem.type==="volume"){';
const targetSelectedEnd = 'this.drag={k:"volOrbit",page:t,id:_vItem.id,rawSX:_ep.sx,rawSY:_ep.sy,startYaw:_vItem.viewYaw??0.44,startPitch:_vItem.viewPitch??0.34};return;}}';

const idxSelStart = js.indexOf(targetSelectedStart);
const idxSelEnd = js.indexOf(targetSelectedEnd, idxSelStart);

console.log('idxSelStart:', idxSelStart, 'idxSelEnd:', idxSelEnd);

if (idxSelStart < 0 || idxSelEnd < 0) {
  throw new Error('Could not find selected block in index-D9JME9Hm.js');
}

const fullTargetSelected = js.slice(idxSelStart, idxSelEnd + targetSelectedEnd.length);

const replacementSelected = 
`const _vId=[..._vB.items][0];const _vItem=n.items.find(x=>x.id===_vId);if(_vItem&&_vItem.type==="volume"){
  const _cardW=Math.max(225,Math.min(270,_vItem.w*0.48));
  if(i.x>=_vItem.x+10&&i.x<=_vItem.x+10+_cardW&&i.y>=_vItem.y+10&&i.y<=_vItem.y+38){
    const _midTab=_vItem.x+10+_cardW/2;
    const _isCurCross=(_vItem.axis||"ox").startsWith("sec-");
    let _newAxis=null;
    if(i.x<_midTab&&_isCurCross){
      _newAxis=(_vItem.axis==="sec-oy"||_vItem.lastRevAxis==="oy")?"oy":"ox";
      _vItem.lastSecAxis=_vItem.axis;
    }else if(i.x>=_midTab&&!_isCurCross){
      _newAxis=(_vItem.axis==="oy"||_vItem.lastSecAxis==="sec-oy")?"sec-oy":"sec-ox";
      _vItem.lastRevAxis=_vItem.axis;
    }
    if(_newAxis){
      _vItem.axis=_newAxis;
      const _na=_vItem.a??-2,_nb=_vItem.b??2;
      _vItem.volume=computeVolume(_vItem.expr,_vItem.expr2||"",_na,_nb,_newAxis,_vItem.nSlices||48);
      if(this.doc.pages[t])this.cache.delete(this.doc.pages[t].id);
      this.replaceItem(t,{..._vItem,axis:_newAxis,volume:_vItem.volume,lastRevAxis:_vItem.lastRevAxis,lastSecAxis:_vItem.lastSecAxis});
      this.redraw();
      this.emit();
      return;
    }
    return;
  }
  const _bW=240,_bX=_vItem.x+_vItem.w-_bW-10,_bY=_vItem.y+10;
  if(i.x>=_bX&&i.x<=_bX+_bW&&i.y>=_bY&&i.y<=_bY+30){
    const _cy=_vItem.viewYaw??0.44,_cp=_vItem.viewPitch??0.34;
    let _ny=0.44,_np=0.34;
    if(Math.abs(_cy-0.44)<0.08&&Math.abs(_cp-0.34)<0.08){_ny=0;_np=0;}
    else if(Math.abs(_cy)<0.08&&Math.abs(_cp)<0.08){_ny=_vItem.axis==="oy"?0:1.5708;_np=_vItem.axis==="oy"?1.45:0;}
    else if(_vItem.axis==="oy"?(Math.abs(_cy)<0.12&&_cp>1.35):(Math.abs(_cy-1.57)<0.12&&Math.abs(_cp)<0.12)){_ny=0;_np=1.45;}
    else if(Math.abs(_cy)<0.12&&Math.abs(_cp-1.45)<0.12){_ny=0.785;_np=0.52;}
    else{_ny=0.44;_np=0.34;}
    _vItem.viewYaw=_ny;_vItem.viewPitch=_np;
    if(this.doc.pages[t])this.cache.delete(this.doc.pages[t].id);
    this.replaceItem(t,{..._vItem,viewYaw:_ny,viewPitch:_np});
    this.redraw();
    this.emit();
    return;
  }
  if(i.y<=_vItem.y+36){
    this.drag={k:"move",page:t,from:i,moved:!1,pick:void 0};
    return;
  }
  const _isCross=(_vItem.axis||"").startsWith("sec-");
  const _cutX=_vItem.cutPos!=null?_vItem.cutPos:((_vItem.a??-2)+(_vItem.b??2))/2;
  const _nearBottom=i.y>=_vItem.y+_vItem.h-48;
  const _nearHandle=_vItem._cutHandle&&Math.hypot((i.x-_vItem.x)-_vItem._cutHandle.x,(i.y-_vItem.y)-_vItem._cutHandle.y)<=42;
  if(_isCross){
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
    }else{
      const _ep=this.pointerSeen??{sx:i.x,sy:i.y};
      this.capture(this.fingerId??1);
      this.drag={k:"volOrbit",page:t,id:_vItem.id,rawSX:_ep.sx,rawSY:_ep.sy,startYaw:_vItem.viewYaw??0.44,startPitch:_vItem.viewPitch??0.34};
      return;
    }
  }else{
    const _tVolW=(_vItem.volume!=null&&isFinite(_vItem.volume))?225:40;
    const _tX0=_vItem.x+35,_tX1=_vItem.x+_vItem.w-_tVolW-20,_tW=Math.max(60,_tX1-_tX0);
    const _isRailBottom=i.y>=_vItem.y+_vItem.h-48&&i.x>=_tX0-20&&i.x<=_tX1+20;
    const _nearRotHandle=_vItem._rotHandle&&Math.hypot((i.x-_vItem.x)-_vItem._rotHandle.x,(i.y-_vItem.y)-_vItem._rotHandle.y)<=42;
    if(_isRailBottom||_nearBottom||_nearRotHandle){
      this.capture(this.fingerId??1);
      if(_isRailBottom||_nearBottom){
        const _frac=Math.max(0,Math.min(1,(i.x-_tX0)/_tW));
        _vItem.sweepAngle=Math.round(_frac*360);
        _vItem._dragging=true;
        if(this.doc.pages[t])this.cache.delete(this.doc.pages[t].id);
        this.redraw();
      }
      this.drag={k:"volSweep",page:t,id:_vItem.id,fromX:i.x,fromY:i.y,startSweep:_vItem.sweepAngle!=null?_vItem.sweepAngle:360,w:_vItem.w,tX0:_tX0,tW:_tW,isRail:(_isRailBottom||_nearBottom)};
      return;
    }else{
      const _ep=this.pointerSeen??{sx:i.x,sy:i.y};
      this.capture(this.fingerId??1);
      this.drag={k:"volOrbit",page:t,id:_vItem.id,rawSX:_ep.sx,rawSY:_ep.sy,startYaw:_vItem.viewYaw??0.44,startPitch:_vItem.viewPitch??0.34};
      return;
    }
  }
}}`;

js = js.replace(fullTargetSelected, replacementSelected);
console.log('✓ Replaced selected block');

// Now replace unselected block
const targetUnselStart = 'if(v.type==="volume"){this.sel=d;if(i.y>v.y+36){';
const targetUnselEnd = '}this.redraw();this.emit();return;}}}else{this.sel=null,this.drag={k:"lasso"';

const idxUnselStart = js.indexOf(targetUnselStart);
const idxUnselEnd = js.indexOf(targetUnselEnd, idxUnselStart);

console.log('idxUnselStart:', idxUnselStart, 'idxUnselEnd:', idxUnselEnd);

if (idxUnselStart < 0 || idxUnselEnd < 0) {
  throw new Error('Could not find unselected block in index-D9JME9Hm.js');
}

const fullTargetUnsel = js.slice(idxUnselStart, idxUnselEnd + targetUnselEnd.length);

const replacementUnsel = 
`if(v.type==="volume"){
  this.sel=d;
  const _cardW=Math.max(225,Math.min(270,v.w*0.48));
  if(i.x>=v.x+10&&i.x<=v.x+10+_cardW&&i.y>=v.y+10&&i.y<=v.y+38){
    const _midTab=v.x+10+_cardW/2;
    const _isCurCross=(v.axis||"ox").startsWith("sec-");
    let _newAxis=null;
    if(i.x<_midTab&&_isCurCross){
      _newAxis=(v.axis==="sec-oy"||v.lastRevAxis==="oy")?"oy":"ox";
      v.lastSecAxis=v.axis;
    }else if(i.x>=_midTab&&!_isCurCross){
      _newAxis=(v.axis==="oy"||v.lastSecAxis==="sec-oy")?"sec-oy":"sec-ox";
      v.lastRevAxis=v.axis;
    }
    if(_newAxis){
      v.axis=_newAxis;
      const _na=v.a??-2,_nb=v.b??2;
      v.volume=computeVolume(v.expr,v.expr2||"",_na,_nb,_newAxis,v.nSlices||48);
      if(this.doc.pages[t])this.cache.delete(this.doc.pages[t].id);
      this.replaceItem(t,{...v,axis:_newAxis,volume:v.volume,lastRevAxis:v.lastRevAxis,lastSecAxis:v.lastSecAxis});
      this.redraw();
      this.emit();
      return;
    }
    this.redraw();this.emit();return;
  }
  const _bW=240,_bX=v.x+v.w-_bW-10,_bY=v.y+10;
  if(i.x>=_bX&&i.x<=_bX+_bW&&i.y>=_bY&&i.y<=_bY+30){
    const _cy=v.viewYaw??0.44,_cp=v.viewPitch??0.34;
    let _ny=0.44,_np=0.34;
    if(Math.abs(_cy-0.44)<0.08&&Math.abs(_cp-0.34)<0.08){_ny=0;_np=0;}
    else if(Math.abs(_cy)<0.08&&Math.abs(_cp)<0.08){_ny=v.axis==="oy"?0:1.5708;_np=v.axis==="oy"?1.45:0;}
    else if(v.axis==="oy"?(Math.abs(_cy)<0.12&&_cp>1.35):(Math.abs(_cy-1.57)<0.12&&Math.abs(_cp)<0.12)){_ny=0;_np=1.45;}
    else if(Math.abs(_cy)<0.12&&Math.abs(_cp-1.45)<0.12){_ny=0.785;_np=0.52;}
    else{_ny=0.44;_np=0.34;}
    v.viewYaw=_ny;v.viewPitch=_np;
    if(this.doc.pages[t])this.cache.delete(this.doc.pages[t].id);
    this.replaceItem(t,{...v,viewYaw:_ny,viewPitch:_np});
    this.redraw();
    this.emit();
    return;
  }
  if(i.y<=v.y+36){
    this.drag={k:"move",page:t,from:i,moved:!1,whole:d};
    this.redraw();this.emit();return;
  }
  const _isCross=(v.axis||"").startsWith("sec-");
  const _cutX=v.cutPos!=null?v.cutPos:((v.a??-2)+(v.b??2))/2;
  const _nearBottom=i.y>=v.y+v.h-48;
  const _nearHandle=v._cutHandle&&Math.hypot((i.x-v.x)-v._cutHandle.x,(i.y-v.y)-v._cutHandle.y)<=42;
  if(_isCross){
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
    const _tVolW=(v.volume!=null&&isFinite(v.volume))?225:40;
    const _tX0=v.x+35,_tX1=v.x+v.w-_tVolW-20,_tW=Math.max(60,_tX1-_tX0);
    const _isRailBottom=i.y>=v.y+v.h-48&&i.x>=_tX0-20&&i.x<=_tX1+20;
    const _nearRotHandle=v._rotHandle&&Math.hypot((i.x-v.x)-v._rotHandle.x,(i.y-v.y)-v._rotHandle.y)<=42;
    if(_isRailBottom||_nearBottom||_nearRotHandle){
      this.capture(this.fingerId??1);
      if(_isRailBottom||_nearBottom){
        const _frac=Math.max(0,Math.min(1,(i.x-_tX0)/_tW));
        v.sweepAngle=Math.round(_frac*360);
        v._dragging=true;
        if(this.doc.pages[t])this.cache.delete(this.doc.pages[t].id);
        this.redraw();
      }
      this.drag={k:"volSweep",page:t,id:v.id,fromX:i.x,fromY:i.y,startSweep:v.sweepAngle!=null?v.sweepAngle:360,w:v.w,tX0:_tX0,tW:_tW,isRail:(_isRailBottom||_nearBottom)};
    }else{
      const _ep=this.pointerSeen??{sx:i.x,sy:i.y};
      this.capture(this.fingerId??1);
      this.drag={k:"volOrbit",page:t,id:v.id,rawSX:_ep.sx,rawSY:_ep.sy,startYaw:v.viewYaw??0.44,startPitch:v.viewPitch??0.34};
    }
  }
  this.redraw();this.emit();return;
}}else{this.sel=null,this.drag={k:"lasso"`;

js = js.replace(fullTargetUnsel, replacementUnsel);
console.log('✓ Replaced unselected block');

fs.writeFileSync('dist/assets/index-D9JME9Hm.js', js);
console.log('✓ SUCCESS: Updated index-D9JME9Hm.js');
