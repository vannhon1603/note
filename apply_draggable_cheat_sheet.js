const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('dist/assets/index-D9JME9Hm.js');
let code = fs.readFileSync(targetFile, 'utf8');

// Backup
fs.writeFileSync(targetFile + '.bak_drag_cards', code, 'utf8');

console.log('--- Applying Draggable Quick Formula and Detailed Solution Cards ---');

// ─── 1. Update Iu hit-test to include card bounds for volume items ───
const oldIu = 'const Iu=(e,t)=>{const n=z_(e,t);return n.x>=e.x&&n.x<=e.x+e.w&&n.y>=e.y&&n.y<=e.y+e.h}';
const newIu = 'const Iu=(e,t)=>{if(e.type==="volume"){if(e.showQuickFormula&&e._quickFormulaRect){const r=e._quickFormulaRect;if(t.x>=r.x&&t.x<=r.x+r.w&&t.y>=r.y&&t.y<=r.y+r.h)return!0;}if(e.showSolution&&e._solutionRect){const r=e._solutionRect;if(t.x>=r.x&&t.x<=r.x+r.w&&t.y>=r.y&&t.y<=r.y+r.h)return!0;}}const n=z_(e,t);return n.x>=e.x&&n.x<=e.x+e.w&&n.y>=e.y&&n.y<=e.y+e.h}';

if (!code.includes(oldIu)) {
  throw new Error('oldIu not found');
}
code = code.replace(oldIu, newIu);
console.log('✓ 1. Enhanced Iu hit-testing for formula & solution cards');

// ─── 2. Update drawVolume3D to render with offsets and store rects ───
const oldPedBlockStart = '  /* ─── Pedagogy Overlays (Công thức tính nhanh & Cách giải chi tiết) ─── */';
const oldPedBlockEnd = 'ped.solutionSteps.forEach((st, sidx) => {\n        ctx.fillText(st, cardX + 8, cardY + 18 + sidx * lineH);\n      });\n      ctx.restore();\n    }\n  }\n\n  ctx.restore();\n}';

const sIdx = code.indexOf(oldPedBlockStart);
const eIdx = code.indexOf(oldPedBlockEnd, sIdx);
if (sIdx === -1 || eIdx === -1) {
  throw new Error('Pedagogy block not found in drawVolume3D');
}

const newPedBlock = `  /* ─── Pedagogy Overlays (Công thức tính nhanh & Cách giải chi tiết - Kéo thả tự do) ─── */
  item._quickFormulaRect = null;
  item._solutionRect = null;

  if (item.showQuickFormula || item.showSolution) {
    const ped = getPresetPedagogy(
      findPreset(item.presetName, expr, expr2, currentAxis),
      expr, expr2, na, nb, currentAxis, item.volume
    );

    let defaultY = y + 42;
    if (item.showQuickFormula && ped.quickFormula) {
      const titleTxt = "CÔNG THỨC TÍNH NHANH";
      const fTxt = ped.quickFormula;
      const cTxt = ped.quickCalc || "";
      ctx.save();
      ctx.font = "800 8.5px system-ui, sans-serif";
      const w1 = ctx.measureText(titleTxt).width + 16;
      ctx.font = "bold 10.5px system-ui, sans-serif";
      const w2 = ctx.measureText(fTxt).width;
      ctx.font = "9.5px system-ui, sans-serif";
      const w3 = cTxt ? ctx.measureText(cTxt).width : 0;
      const cardW = Math.max(w1, w2, w3, 140) + 24;
      const cardH = cTxt ? 48 : 34;
      const baseCardX = x + w - cardW - 12;
      const baseCardY = defaultY;
      const qfDx = (item.quickFormulaOffset && typeof item.quickFormulaOffset.dx === "number") ? item.quickFormulaOffset.dx : 0;
      const qfDy = (item.quickFormulaOffset && typeof item.quickFormulaOffset.dy === "number") ? item.quickFormulaOffset.dy : 0;
      const cardX = baseCardX + qfDx;
      const cardY = baseCardY + qfDy;
      item._quickFormulaRect = { x: cardX, y: cardY, w: cardW, h: cardH };

      ctx.fillStyle = "rgba(255, 251, 235, 0.96)";
      ctx.strokeStyle = "rgba(245, 158, 11, 0.75)";
      ctx.lineWidth = 1.2;
      ctx.shadowColor = "rgba(180, 83, 9, 0.15)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(cardX, cardY, cardW, cardH, 6);
      else ctx.rect(cardX, cardY, cardW, cardH);
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.stroke();

      // Vector Zap Icon on canvas
      ctx.fillStyle = "#b45309";
      ctx.beginPath();
      const zx = cardX + 8, zy = cardY + 5.5;
      ctx.moveTo(zx + 3.8, zy);
      ctx.lineTo(zx, zy + 5.2);
      ctx.lineTo(zx + 3.2, zy + 5.2);
      ctx.lineTo(zx + 2.2, zy + 9.5);
      ctx.lineTo(zx + 7, zy + 4);
      ctx.lineTo(zx + 3.8, zy + 4);
      ctx.closePath();
      ctx.fill();

      // Drag grip indicator dots (top-right corner of card)
      ctx.fillStyle = "rgba(180, 83, 9, 0.45)";
      const gx = cardX + cardW - 14, gy = cardY + 6.5;
      for (let gr = 0; gr < 2; gr++) {
        for (let gc = 0; gc < 3; gc++) {
          ctx.beginPath();
          ctx.arc(gx + gr * 3.5, gy + gc * 3.5, 1.0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.font = "800 8.5px system-ui, sans-serif";
      ctx.fillStyle = "#b45309";
      ctx.fillText(titleTxt, cardX + 18, cardY + 5);

      ctx.font = "bold 10px system-ui, sans-serif";
      ctx.fillStyle = "#78350f";
      ctx.fillText(fTxt, cardX + 8, cardY + 17);

      if (cTxt) {
        ctx.font = "500 9px system-ui, sans-serif";
        ctx.fillStyle = "#92400e";
        ctx.fillText(cTxt, cardX + 8, cardY + 31);
      }
      ctx.restore();
      defaultY += cardH + 7;
    }

    if (item.showSolution && ped.solutionSteps && ped.solutionSteps.length > 0) {
      const titleTxt = "CÁCH GIẢI CHI TIẾT (TÍCH PHÂN)";
      ctx.save();
      ctx.font = "800 8.5px system-ui, sans-serif";
      let maxLineW = ctx.measureText(titleTxt).width + 16;
      ctx.font = "9.5px system-ui, sans-serif";
      ped.solutionSteps.forEach(st => {
        const lw = ctx.measureText(st).width;
        if (lw > maxLineW) maxLineW = lw;
      });
      const cardW = Math.min(w - 24, Math.max(maxLineW + 24, 160));
      const lineH = 13;
      const cardH = 20 + ped.solutionSteps.length * lineH + 4;
      const baseCardX = x + w - cardW - 12;
      const baseCardY = defaultY;
      const solDx = (item.solutionOffset && typeof item.solutionOffset.dx === "number") ? item.solutionOffset.dx : 0;
      const solDy = (item.solutionOffset && typeof item.solutionOffset.dy === "number") ? item.solutionOffset.dy : 0;
      const cardX = baseCardX + solDx;
      const cardY = baseCardY + solDy;
      item._solutionRect = { x: cardX, y: cardY, w: cardW, h: cardH };

      ctx.fillStyle = "rgba(240, 253, 244, 0.96)";
      ctx.strokeStyle = "rgba(16, 185, 129, 0.75)";
      ctx.lineWidth = 1.2;
      ctx.shadowColor = "rgba(4, 120, 87, 0.15)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(cardX, cardY, cardW, cardH, 6);
      else ctx.rect(cardX, cardY, cardW, cardH);
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.stroke();

      // Vector Document Icon on canvas
      ctx.strokeStyle = "#047857";
      ctx.fillStyle = "#ecfdf5";
      ctx.lineWidth = 1;
      const dx = cardX + 8, dy = cardY + 5.5;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(dx, dy, 7.5, 9.5, 1.5);
      else ctx.rect(dx, dy, 7.5, 9.5);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(dx + 1.8, dy + 3.2); ctx.lineTo(dx + 5.5, dy + 3.2);
      ctx.moveTo(dx + 1.8, dy + 5.8); ctx.lineTo(dx + 5.5, dy + 5.8);
      ctx.stroke();

      // Drag grip indicator dots (top-right corner of card)
      ctx.fillStyle = "rgba(4, 120, 87, 0.45)";
      const gx = cardX + cardW - 14, gy = cardY + 6.5;
      for (let gr = 0; gr < 2; gr++) {
        for (let gc = 0; gc < 3; gc++) {
          ctx.beginPath();
          ctx.arc(gx + gr * 3.5, gy + gc * 3.5, 1.0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.font = "800 8.5px system-ui, sans-serif";
      ctx.fillStyle = "#047857";
      ctx.fillText(titleTxt, cardX + 19, cardY + 5);

      ctx.font = "500 9.5px system-ui, sans-serif";
      ctx.fillStyle = "#065f46";
      ped.solutionSteps.forEach((st, sidx) => {
        ctx.fillText(st, cardX + 8, cardY + 18 + sidx * lineH);
      });
      ctx.restore();
    }
  }

  ctx.restore();
}`;

code = code.slice(0, sIdx) + newPedBlock + code.slice(eIdx + oldPedBlockEnd.length);
console.log('✓ 2. Updated drawVolume3D with relative offsets, rect tracking & grip dots');

// ─── 3. In selectDown: handle card clicks for selected and unselected volume items ───
// 3a. Selected volume item
const oldSelZoomEnd = `    _vItem.zoom3D=nextZ;
    if(this.doc.pages[t])this.cache.delete(this.doc.pages[t].id);
    this.replaceItem(t,{..._vItem,zoom3D:nextZ});
    this.redraw();
    this.emit();
    return;
  }`;

const newSelZoomEnd = `    _vItem.zoom3D=nextZ;
    if(this.doc.pages[t])this.cache.delete(this.doc.pages[t].id);
    this.replaceItem(t,{..._vItem,zoom3D:nextZ});
    this.redraw();
    this.emit();
    return;
  }
  if(_vItem.showQuickFormula&&_vItem._quickFormulaRect){
    const _qR=_vItem._quickFormulaRect;
    if(i.x>=_qR.x&&i.x<=_qR.x+_qR.w&&i.y>=_qR.y&&i.y<=_qR.y+_qR.h){
      this.capture(this.fingerId??1);
      const _curDx=(_vItem.quickFormulaOffset&&typeof _vItem.quickFormulaOffset.dx==="number")?_vItem.quickFormulaOffset.dx:0;
      const _curDy=(_vItem.quickFormulaOffset&&typeof _vItem.quickFormulaOffset.dy==="number")?_vItem.quickFormulaOffset.dy:0;
      this.drag={k:"cardDrag",target:"quickFormula",page:t,id:_vItem.id,fromX:i.x,fromY:i.y,startDx:_curDx,startDy:_curDy};
      return;
    }
  }
  if(_vItem.showSolution&&_vItem._solutionRect){
    const _sR=_vItem._solutionRect;
    if(i.x>=_sR.x&&i.x<=_sR.x+_sR.w&&i.y>=_sR.y&&i.y<=_sR.y+_sR.h){
      this.capture(this.fingerId??1);
      const _curDx=(_vItem.solutionOffset&&typeof _vItem.solutionOffset.dx==="number")?_vItem.solutionOffset.dx:0;
      const _curDy=(_vItem.solutionOffset&&typeof _vItem.solutionOffset.dy==="number")?_vItem.solutionOffset.dy:0;
      this.drag={k:"cardDrag",target:"solution",page:t,id:_vItem.id,fromX:i.x,fromY:i.y,startDx:_curDx,startDy:_curDy};
      return;
    }
  }`;

if (!code.includes(oldSelZoomEnd)) throw new Error('oldSelZoomEnd not found');
code = code.replace(oldSelZoomEnd, newSelZoomEnd);
console.log('✓ 3a. Added card drag handler to selected volume in selectDown');

// 3b. Unselected volume item
const oldUnselZoomEnd = `    v.zoom3D=nextZ;
    if(this.doc.pages[t])this.cache.delete(this.doc.pages[t].id);
    this.replaceItem(t,{...v,zoom3D:nextZ});
    this.redraw();
    this.emit();
    return;
  }`;

const newUnselZoomEnd = `    v.zoom3D=nextZ;
    if(this.doc.pages[t])this.cache.delete(this.doc.pages[t].id);
    this.replaceItem(t,{...v,zoom3D:nextZ});
    this.redraw();
    this.emit();
    return;
  }
  if(v.showQuickFormula&&v._quickFormulaRect){
    const _qR=v._quickFormulaRect;
    if(i.x>=_qR.x&&i.x<=_qR.x+_qR.w&&i.y>=_qR.y&&i.y<=_qR.y+_qR.h){
      this.capture(this.fingerId??1);
      const _curDx=(v.quickFormulaOffset&&typeof v.quickFormulaOffset.dx==="number")?v.quickFormulaOffset.dx:0;
      const _curDy=(v.quickFormulaOffset&&typeof v.quickFormulaOffset.dy==="number")?v.quickFormulaOffset.dy:0;
      this.drag={k:"cardDrag",target:"quickFormula",page:t,id:v.id,fromX:i.x,fromY:i.y,startDx:_curDx,startDy:_curDy};
      this.redraw();this.emit();return;
    }
  }
  if(v.showSolution&&v._solutionRect){
    const _sR=v._solutionRect;
    if(i.x>=_sR.x&&i.x<=_sR.x+_sR.w&&i.y>=_sR.y&&i.y<=_sR.y+_sR.h){
      this.capture(this.fingerId??1);
      const _curDx=(v.solutionOffset&&typeof v.solutionOffset.dx==="number")?v.solutionOffset.dx:0;
      const _curDy=(v.solutionOffset&&typeof v.solutionOffset.dy==="number")?v.solutionOffset.dy:0;
      this.drag={k:"cardDrag",target:"solution",page:t,id:v.id,fromX:i.x,fromY:i.y,startDx:_curDx,startDy:_curDy};
      this.redraw();this.emit();return;
    }
  }`;

if (!code.includes(oldUnselZoomEnd)) throw new Error('oldUnselZoomEnd not found');
code = code.replace(oldUnselZoomEnd, newUnselZoomEnd);
console.log('✓ 3b. Added card drag handler to unselected volume in selectDown');

// ─── 4. In move(t): handle cardDrag & hover cursor ───
// 4a. Hover cursor
const oldHoverVolume = `      const _mBW=78,_mBX=_vIt.x+10;
      if(_ptP.y>=_vIt.y+6&&_ptP.y<=_vIt.y+38&&_ptP.x>=_mBX&&_ptP.x<=_mBX+_mBW){
        this.scroller.style.cursor="grab";this.hoverAt(o);return;
      }`;

const newHoverVolume = `      const _mBW=78,_mBX=_vIt.x+10;
      if(_ptP.y>=_vIt.y+6&&_ptP.y<=_vIt.y+38&&_ptP.x>=_mBX&&_ptP.x<=_mBX+_mBW){
        this.scroller.style.cursor="grab";this.hoverAt(o);return;
      }
      if((_vIt.showQuickFormula&&_vIt._quickFormulaRect&&_ptP.x>=_vIt._quickFormulaRect.x&&_ptP.x<=_vIt._quickFormulaRect.x+_vIt._quickFormulaRect.w&&_ptP.y>=_vIt._quickFormulaRect.y&&_ptP.y<=_vIt._quickFormulaRect.y+_vIt._quickFormulaRect.h)||(_vIt.showSolution&&_vIt._solutionRect&&_ptP.x>=_vIt._solutionRect.x&&_ptP.x<=_vIt._solutionRect.x+_vIt._solutionRect.w&&_ptP.y>=_vIt._solutionRect.y&&_ptP.y<=_vIt._solutionRect.y+_vIt._solutionRect.h)){
        this.scroller.style.cursor="grab";this.hoverAt(o);return;
      }`;

if (!code.includes(oldHoverVolume)) throw new Error('oldHoverVolume not found');
code = code.replace(oldHoverVolume, newHoverVolume);
console.log('✓ 4a. Added card hover grab cursor in move(t)');

// 4b. case "cardDrag" in switch(s.k)
const oldMoveVolCut = 'case"volCut":{const p=this.toPage(o,s.page);';
const newMoveVolCut = `case"cardDrag":{
    const p=this.toPage(o,s.page);
    const it=this.doc.pages[s.page].items.find(x=>x.id===s.id);
    if(!it)return;
    it._dragging=true;
    this.scroller.style.cursor="grabbing";
    const deltaX=p.x-s.fromX;
    const deltaY=p.y-s.fromY;
    if(s.target==="quickFormula"){
      it.quickFormulaOffset={dx:Math.round(s.startDx+deltaX),dy:Math.round(s.startDy+deltaY)};
    }else if(s.target==="solution"){
      it.solutionOffset={dx:Math.round(s.startDx+deltaX),dy:Math.round(s.startDy+deltaY)};
    }
    if(this.doc.pages[s.page])this.cache.delete(this.doc.pages[s.page].id);
    this.redraw();
    return;
  }
  case"volCut":{const p=this.toPage(o,s.page);`;

if (!code.includes(oldMoveVolCut)) throw new Error('oldMoveVolCut not found');
code = code.replace(oldMoveVolCut, newMoveVolCut);
console.log('✓ 4b. Added case "cardDrag" to move(t)');

// ─── 5. In up(t): commit cardDrag ───
const oldUpVol = 'case"volCut":case"volOrbit":case"volSweep":{';
const newUpVol = 'case"cardDrag":case"volCut":case"volOrbit":case"volSweep":{';

if (!code.includes(oldUpVol)) throw new Error('oldUpVol not found');
code = code.replace(oldUpVol, newUpVol);
console.log('✓ 5. Added case "cardDrag" to up(t) commit handler');

fs.writeFileSync(targetFile, code, 'utf8');
console.log('=== All patches applied successfully ===');
