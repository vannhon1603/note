const fs = require('fs');

const filePath = 'dist/assets/index-D9JME9Hm.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. drawVolume3D sweepDeg
const oldSweepDeg = 'const sweepDeg = Math.max(0, Math.min(360, sweepAngle != null ? sweepAngle : 0));';
const newSweepDeg = 'const sweepDeg = isCross ? 360 : Math.max(0, Math.min(360, sweepAngle != null ? sweepAngle : 0));';

if (!content.includes(oldSweepDeg)) {
  console.error('ERROR: oldSweepDeg not found!');
  process.exit(1);
}
content = content.replace(oldSweepDeg, newSweepDeg);
console.log('✓ Replaced sweepDeg in drawVolume3D');

// 2. Tab switch location 1 (_vItem)
const oldTab1 = `    if(i.x<_midTab&&_isCurCross){
      const _canRot=_vItem.axis==="sec-ox"||_vItem.axis==="sec-oy";
      if(!_canRot)return;
      _newAxis=(_vItem.axis==="sec-oy"||_vItem.lastRevAxis==="oy")?"oy":"ox";
      _vItem.lastSecAxis=_vItem.axis;
      if(_vItem.sweepAngle==null||_vItem.sweepAngle>=355)_vItem.sweepAngle=0;
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
    }`;

const newTab1 = `    if(i.x<_midTab&&_isCurCross){
      const _canRot=_vItem.axis==="sec-ox"||_vItem.axis==="sec-oy";
      if(!_canRot)return;
      _newAxis=(_vItem.axis==="sec-oy"||_vItem.lastRevAxis==="oy")?"oy":"ox";
      _vItem.lastSecAxis=_vItem.axis;
      _vItem.sweepAngle=(_vItem.lastSweepAngle!=null&&_vItem.lastSweepAngle<355)?_vItem.lastSweepAngle:0;
    }else if(i.x>=_midTab&&!_isCurCross){
      _newAxis=(_vItem.axis==="oy"||_vItem.lastSecAxis==="sec-oy")?"sec-oy":"sec-ox";
      _vItem.lastRevAxis=_vItem.axis;
      _vItem.lastSweepAngle=_vItem.sweepAngle;
      _vItem.sweepAngle=360;
    }
    if(_newAxis){
      _vItem.axis=_newAxis;
      const _na=_vItem.a??-2,_nb=_vItem.b??2;
      _vItem.volume=computeVolume(_vItem.expr,_vItem.expr2||"",_na,_nb,_newAxis,_vItem.nSlices||48);
      if(this.doc.pages[t])this.cache.delete(this.doc.pages[t].id);
      this.replaceItem(t,{..._vItem,axis:_newAxis,volume:_vItem.volume,lastRevAxis:_vItem.lastRevAxis,lastSecAxis:_vItem.lastSecAxis,sweepAngle:_vItem.sweepAngle,lastSweepAngle:_vItem.lastSweepAngle});
      this.redraw();
      this.emit();
      return;
    }`;

if (!content.includes(oldTab1)) {
  console.error('ERROR: oldTab1 not found!');
  process.exit(1);
}
content = content.replace(oldTab1, newTab1);
console.log('✓ Replaced Tab 1 (_vItem)');

// 3. Tab switch location 2 (v)
const oldTab2 = `    if(i.x<_midTab&&_isCurCross){
      const _canRot=v.axis==="sec-ox"||v.axis==="sec-oy";
      if(!_canRot)return;
      _newAxis=(v.axis==="sec-oy"||v.lastRevAxis==="oy")?"oy":"ox";
      v.lastSecAxis=v.axis;
      if(v.sweepAngle==null||v.sweepAngle>=355)v.sweepAngle=0;
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
    }`;

const newTab2 = `    if(i.x<_midTab&&_isCurCross){
      const _canRot=v.axis==="sec-ox"||v.axis==="sec-oy";
      if(!_canRot)return;
      _newAxis=(v.axis==="sec-oy"||v.lastRevAxis==="oy")?"oy":"ox";
      v.lastSecAxis=v.axis;
      v.sweepAngle=(v.lastSweepAngle!=null&&v.lastSweepAngle<355)?v.lastSweepAngle:0;
    }else if(i.x>=_midTab&&!_isCurCross){
      _newAxis=(v.axis==="oy"||v.lastSecAxis==="sec-oy")?"sec-oy":"sec-ox";
      v.lastRevAxis=v.axis;
      v.lastSweepAngle=v.sweepAngle;
      v.sweepAngle=360;
    }
    if(_newAxis){
      v.axis=_newAxis;
      const _na=v.a??-2,_nb=v.b??2;
      v.volume=computeVolume(v.expr,v.expr2||"",_na,_nb,_newAxis,v.nSlices||48);
      if(this.doc.pages[t])this.cache.delete(this.doc.pages[t].id);
      this.replaceItem(t,{...v,axis:_newAxis,volume:v.volume,lastRevAxis:v.lastRevAxis,lastSecAxis:v.lastSecAxis,sweepAngle:v.sweepAngle,lastSweepAngle:v.lastSweepAngle});
      this.redraw();
      this.emit();
      return;
    }`;

if (!content.includes(oldTab2)) {
  console.error('ERROR: oldTab2 not found!');
  process.exit(1);
}
content = content.replace(oldTab2, newTab2);
console.log('✓ Replaced Tab 2 (v)');

// 4. Toolbar "Quay trục" and "Lát cắt" buttons
const oldToolbarBtns = `        onClick:()=>{
          if(isCross&&curAx!=="sec-ox"&&curAx!=="sec-oy")return;
          const targetAx=(it.lastRevAxis&&!it.lastRevAxis.startsWith("sec-"))?it.lastRevAxis:(it.axis==="sec-oy"?"oy":"ox");
          const nextSw=(it.sweepAngle==null||it.sweepAngle>=355)?0:it.sweepAngle;
          setAxis(targetAx);
          ee.replaceItem(_s.page,{...it,axis:targetAx,sweepAngle:nextSw});
        },
        children:(isCross&&curAx!=="sec-ox"&&curAx!=="sec-oy")?"🔒 Không xoay":"Quay trục"
      }),
      f.jsx("button",{
        className:isCross?"on":"",
        title:"Hướng 2: Tính thể tích bằng các lát cắt thiết diện tịnh tiến (Cùng hình 3D)",
        onClick:()=>{
          const targetAx=(it.axis==="oy"||it.axis==="sec-oy"||it.lastSecAxis==="sec-oy")?"sec-oy":"sec-ox";
          setAxis(targetAx);
        },
        children:"Lát cắt"
      })`;

const newToolbarBtns = `        onClick:()=>{
          if(isCross&&curAx!=="sec-ox"&&curAx!=="sec-oy")return;
          const targetAx=(it.lastRevAxis&&!it.lastRevAxis.startsWith("sec-"))?it.lastRevAxis:(it.axis==="sec-oy"?"oy":"ox");
          const nextSw=(it.lastSweepAngle!=null&&it.lastSweepAngle<355)?it.lastSweepAngle:((it.sweepAngle==null||it.sweepAngle>=355)?0:it.sweepAngle);
          setAxis(targetAx);
          ee.replaceItem(_s.page,{...it,axis:targetAx,sweepAngle:nextSw,lastSweepAngle:it.sweepAngle});
        },
        children:(isCross&&curAx!=="sec-ox"&&curAx!=="sec-oy")?"🔒 Không xoay":"Quay trục"
      }),
      f.jsx("button",{
        className:isCross?"on":"",
        title:"Hướng 2: Tính thể tích bằng các lát cắt thiết diện tịnh tiến (Cùng hình 3D)",
        onClick:()=>{
          const targetAx=(it.axis==="oy"||it.axis==="sec-oy"||it.lastSecAxis==="sec-oy")?"sec-oy":"sec-ox";
          setAxis(targetAx);
          ee.replaceItem(_s.page,{...it,axis:targetAx,sweepAngle:360,lastSweepAngle:it.sweepAngle});
        },
        children:"Lát cắt"
      })`;

if (!content.includes(oldToolbarBtns)) {
  console.error('ERROR: oldToolbarBtns not found!');
  process.exit(1);
}
content = content.replace(oldToolbarBtns, newToolbarBtns);
console.log('✓ Replaced Toolbar Buttons');

// Backup & write
fs.writeFileSync(filePath + '.bak_before_sweep_fix', fs.readFileSync(filePath));
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully wrote changes to', filePath);
