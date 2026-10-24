const fs = require('fs');

const path = 'dist/assets/index-D9JME9Hm.js';
let js = fs.readFileSync(path, 'utf8');

// Backup
fs.writeFileSync(path + '.bak_before_focus_hide', js, 'utf8');

function mustReplace(target, replacement, label) {
  const count = js.split(target).length - 1;
  if (count !== 1) {
    throw new Error(`Target for "${label}" found ${count} times (expected exactly 1).`);
  }
  js = js.replace(target, replacement);
  console.log(`✓ Patched: ${label}`);
}

// 1. pageCanvas cache key: append selected items ID list
const oldKeyTarget = '|${t.lineColor??""}|${t.lineWeight??""}|${d_(t)}|${n}`,s=this.cache.get(i.id)';
const newKeyTarget = '|${t.lineColor??""}|${t.lineWeight??""}|${d_(t)}|${n}|sel:${(this.sel&&this.sel.page===n)?[...this.sel.items].sort().join(","):""}`,s=this.cache.get(i.id)';
mustReplace(oldKeyTarget, newKeyTarget, 'pageCanvas cache key');

// 2. pageCanvas call to w_: pass selected items set as 8th argument
const oldWCall = 'const w=this.gapOf(t);w_(x,t,i,n,t.infinite||w||!this.pageBreaks?0:1.5/this.zoom,w,(S,L,D)=>{var F;return((F=LB(t.pdfs,S,L,D))==null?void 0:F.canvas)??null});';
const newWCall = 'const w=this.gapOf(t);w_(x,t,i,n,t.infinite||w||!this.pageBreaks?0:1.5/this.zoom,w,(S,L,D)=>{var F;return((F=LB(t.pdfs,S,L,D))==null?void 0:F.canvas)??null},this.sel&&this.sel.page===n?this.sel.items:null);';
mustReplace(oldWCall, newWCall, 'pageCanvas call to w_ with selection');

// 3. w_ definition: accept u (sel), pass u to pv
const oldWDef = 'function w_(e,t,n,r,i=0,o=0,s){';
const newWDef = 'function w_(e,t,n,r,i=0,o=0,s,u){';
mustReplace(oldWDef, newWDef, 'w_ definition');

const oldPvLoop = 'for(const l of n.items)pv(e,l,s);';
const newPvLoop = 'for(const l of n.items)pv(e,l,s,u);';
mustReplace(oldPvLoop, newPvLoop, 'w_ loop calling pv with u');

// 4. pv definition: accept u, compute isFocused for volume
const oldPvTarget = 'function pv(e,t,n){if(t.type==="volume"){drawVolume3D(e,{...t,expr:t.expr||"",expr2:t.expr2||"",a:t.a!=null?t.a:-2,b:t.b!=null?t.b:2,axis:t.axis||"ox",nSlices:t.nSlices||30});return;}';
const newPvTarget = 'function pv(e,t,n,u){if(t.type==="volume"){const isFocused=Boolean(u&&u.has(t.id));drawVolume3D(e,{...t,expr:t.expr||"",expr2:t.expr2||"",a:t.a!=null?t.a:-2,b:t.b!=null?t.b:2,axis:t.axis||"ox",nSlices:t.nSlices||30},isFocused);return;}';
mustReplace(oldPvTarget, newPvTarget, 'pv definition with isFocused');

// 5. VolumeDialog drawVolume3D call: pass true for isFocused
const oldVdTarget = 'drawVolume3D(ctx,{x:0,y:0,w:W,h:Hc,expr,expr2,a:av,b:bv,axis,nSlices});';
const newVdTarget = 'drawVolume3D(ctx,{x:0,y:0,w:W,h:Hc,expr,expr2,a:av,b:bv,axis,nSlices},true);';
mustReplace(oldVdTarget, newVdTarget, 'VolumeDialog drawVolume3D preview');

// 6. selectDown unselect click outside: invalidate page cache immediately
const oldSelDownElse = '}}else{this.sel=null,this.drag={k:"lasso",page:t,path:[i],free:!1,touch:!1,...w?{item:w.id}:{}},this.emit();return}';
const newSelDownElse = '}}else{if(this.sel&&this.doc.pages[t])this.cache.delete(this.doc.pages[t].id);this.sel=null;this.redraw();this.drag={k:"lasso",page:t,path:[i],free:!1,touch:!1,...w?{item:w.id}:{}},this.emit();return}';
mustReplace(oldSelDownElse, newSelDownElse, 'selectDown else invalidate cache on deselect');

// 7. drawVolume3D signature and Section 9 & 10
const oldFnSig = 'function drawVolume3D(ctx, item) {';
const newFnSig = 'function drawVolume3D(ctx, item, isFocused) {\n  const isItemFocused = Boolean(isFocused || item._dragging || item._forceFocused);';
mustReplace(oldFnSig, newFnSig, 'drawVolume3D signature and isItemFocused');

// Section 9 & 10 replacement in drawVolume3D
const oldSec9And10Start = '  // ─── 9. Sleek Unified Top Header Bar (Tabs, Formula, SGK View) ───\n  const hY = y + 7, hH = 28;';
const oldSec10End = '      ctx.fillText(badgeTxt, hX, hY - 13);\n      ctx.restore();\n    }\n  }\n  ctx.restore();\n}';

const idxStart = js.indexOf(oldSec9And10Start);
const idxEnd = js.indexOf(oldSec10End, idxStart);

if (idxStart < 0 || idxEnd < 0) {
  throw new Error(`Could not find Section 9 & 10 boundaries: idxStart=${idxStart}, idxEnd=${idxEnd}`);
}

const targetSec9And10 = js.slice(idxStart, idxEnd + oldSec10End.length);

const replacementSec9And10 = `  // ─── 9. Sleek Unified Top Header Bar (Tabs, Formula, SGK View) ───
  const hY = y + 7, hH = 28;
  if (isItemFocused) {
    ctx.save();
    ctx.beginPath();
    ctx.shadowColor = "rgba(15, 23, 42, 0.05)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
    ctx.strokeStyle = isCross ? "rgba(245, 158, 11, 0.35)" : "rgba(59, 130, 246, 0.3)";
    ctx.lineWidth = 1;
    if (ctx.roundRect) ctx.roundRect(x + 7, hY, w - 14, hH, 7);
    else ctx.rect(x + 7, hY, w - 14, hH);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Mode Tabs (Left side of top bar)
    const tab1W = Math.min(115, Math.max(85, (w - 30) * 0.22));
    const tab2W = Math.min(125, Math.max(90, (w - 30) * 0.24));
    const tabH = 22, tabY = hY + 3;
    const tab1X = x + 10, tab2X = tab1X + tab1W + 4;

    // Tab 1: Quay quanh trục
    const canRotate = !isCross || isSecRev;
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(tab1X, tabY, tab1W, tabH, 5);
    else ctx.rect(tab1X, tabY, tab1W, tabH);
    if (!canRotate) {
      ctx.fillStyle = "rgba(241, 245, 249, 0.45)"; ctx.fill();
      ctx.strokeStyle = "rgba(203, 213, 225, 0.4)"; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.fillStyle = "#94a3b8"; ctx.font = "9.5px system-ui, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("🔒 1. Quay trục", tab1X + tab1W / 2, tabY + tabH / 2);
    } else if (!isCross) {
      ctx.fillStyle = "#2563eb"; ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 10px system-ui, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("🔄 1. Quay trục", tab1X + tab1W / 2, tabY + tabH / 2);
    } else {
      ctx.fillStyle = "rgba(241, 245, 249, 0.85)"; ctx.fill();
      ctx.strokeStyle = "rgba(203, 213, 225, 0.7)"; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.fillStyle = "#64748b"; ctx.font = "10px system-ui, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("🔄 1. Quay trục", tab1X + tab1W / 2, tabY + tabH / 2);
    }
    ctx.restore();

    // Tab 2: Lát cắt tịnh tiến
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(tab2X, tabY, tab2W, tabH, 5);
    else ctx.rect(tab2X, tabY, tab2W, tabH);
    if (isCross) {
      ctx.fillStyle = "#d97706"; ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 10px system-ui, sans-serif";
    } else {
      ctx.fillStyle = "rgba(241, 245, 249, 0.85)"; ctx.fill();
      ctx.strokeStyle = "rgba(203, 213, 225, 0.7)"; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.fillStyle = "#64748b"; ctx.font = "10px system-ui, sans-serif";
    }
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("📐 2. Lát cắt tịnh tiến", tab2X + tab2W / 2, tabY + tabH / 2);
    ctx.restore();

    // SGK View Angle Button (Right side of top bar)
    const _vy = yaw, _vp = pitch;
    let _vName = "";
    if (Math.abs(_vy - 0.44) < 0.08 && Math.abs(_vp - 0.34) < 0.08) _vName = "📐 Chuẩn SGK (3D)";
    else if (Math.abs(_vy) < 0.08 && Math.abs(_vp) < 0.08) _vName = "◫ Chính diện Oxy";
    else if (axis === "oy" ? (Math.abs(_vy) < 0.12 && _vp > 1.35) : (Math.abs(_vy - 1.57) < 0.12 && Math.abs(_vp) < 0.12)) _vName = axis === "oy" ? "◎ Dọc trục Oy" : "◎ Dọc trục Ox";
    else if (Math.abs(_vy) < 0.12 && Math.abs(_vp - 1.45) < 0.12) _vName = "⬒ Từ trên (Oxz)";
    else if (Math.abs(_vy - 0.785) < 0.12 && Math.abs(_vp - 0.52) < 0.12) _vName = "◇ Nghiêng 45°";
    else _vName = "🔄 Xoay 3D (" + Math.round(((yaw % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) * 180 / Math.PI) + "°)";

    const bW = Math.min(130, Math.max(95, (w - 30) * 0.24));
    const bH = 22, bY = hY + 3;
    const bX = x + w - bW - 10;

    ctx.save();
    ctx.fillStyle = "rgba(241, 245, 249, 0.9)";
    ctx.strokeStyle = "rgba(203, 213, 225, 0.85)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bX, bY, bW, bH, 5);
    else ctx.rect(bX, bY, bW, bH);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#334155";
    ctx.font = "10px system-ui, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(_vName, bX + bW / 2, bY + bH / 2);
    ctx.restore();

    // Formula & Info Title (Middle between Tabs and View Button)
    const midLeft = tab2X + tab2W + 6;
    const midRight = bX - 6;
    const midSpace = midRight - midLeft;
    if (midSpace > 100) {
      let formulaShort = "";
      if (currentAxis === "sec-ox") formulaShort = "V = ∫ S(x) dx = π ∫ [f² - g²] dx";
      else if (currentAxis === "sec-oy") formulaShort = "V = ∫ S(y) dy = 2π ∫ x·(f - g) dx";
      else if (isRevOx) formulaShort = (sweepDeg < 355 ? "θ = " + Math.round(sweepDeg) + "° • " : "") + "V = π ∫ [f² - g²] dx";
      else if (isRevOy) formulaShort = (sweepDeg < 355 ? "θ = " + Math.round(sweepDeg) + "° • " : "") + "V = 2π ∫ x·(f - g) dx";
      else if (currentAxis === "sec-square") formulaShort = "V = ∫ S(x) dx = ∫ [f - g]² dx";
      else if (currentAxis === "sec-tri") formulaShort = "V = ∫ S(x) dx = (√3/4) ∫ [f - g]² dx";
      else if (currentAxis === "sec-semi") formulaShort = "V = ∫ S(x) dx = (π/8) ∫ [f - g]² dx";
      else if (currentAxis === "sec-circle") formulaShort = "V = ∫ S(x) dx = (π/4) ∫ [f - g]² dx";
      else formulaShort = "V = ∫ S(x) dx";

      ctx.save();
      ctx.fillStyle = isCross ? "#b45309" : "#1e40af";
      ctx.font = "bold 10.5px system-ui, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      let drawF = formulaShort;
      if (ctx.measureText(drawF).width > midSpace - 8) {
        if (isRevOx) drawF = "V = π ∫ y² dx";
        else if (isRevOy) drawF = "V = 2π ∫ x·y dx";
        else drawF = "V = ∫ S(x) dx";
      }
      ctx.fillText(drawF, (midLeft + midRight) / 2, hY + hH / 2);
      ctx.restore();
    }
  } else {
    // When not focused: clean formula title centered at top
    let formulaShort = "";
    if (currentAxis === "sec-ox") formulaShort = "V = ∫ S(x) dx = π ∫ [f² - g²] dx";
    else if (currentAxis === "sec-oy") formulaShort = "V = ∫ S(y) dy = 2π ∫ x·(f - g) dx";
    else if (isRevOx) formulaShort = (sweepDeg < 355 ? "θ = " + Math.round(sweepDeg) + "° • " : "") + "V = π ∫ [f² - g²] dx";
    else if (isRevOy) formulaShort = (sweepDeg < 355 ? "θ = " + Math.round(sweepDeg) + "° • " : "") + "V = 2π ∫ x·(f - g) dx";
    else if (currentAxis === "sec-square") formulaShort = "V = ∫ S(x) dx = ∫ [f - g]² dx";
    else if (currentAxis === "sec-tri") formulaShort = "V = ∫ S(x) dx = (√3/4) ∫ [f - g]² dx";
    else if (currentAxis === "sec-semi") formulaShort = "V = ∫ S(x) dx = (π/8) ∫ [f - g]² dx";
    else if (currentAxis === "sec-circle") formulaShort = "V = ∫ S(x) dx = (π/4) ∫ [f - g]² dx";
    else formulaShort = "V = ∫ S(x) dx";

    ctx.save();
    ctx.font = "bold 11px system-ui, sans-serif";
    let drawF = formulaShort;
    if (ctx.measureText(drawF).width > w - 40) {
      if (isRevOx) drawF = "V = π ∫ y² dx";
      else if (isRevOy) drawF = "V = 2π ∫ x·y dx";
      else drawF = "V = ∫ S(x) dx";
    }
    const fW = ctx.measureText(drawF).width + 20;
    const fH = 24, fY = y + 8;
    const fX = x + (w - fW) / 2;
    ctx.shadowColor = "rgba(15, 23, 42, 0.04)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.strokeStyle = isCross ? "rgba(245, 158, 11, 0.28)" : "rgba(59, 130, 246, 0.25)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(fX, fY, fW, fH, 6);
    else ctx.rect(fX, fY, fW, fH);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = isCross ? "#b45309" : "#1e40af";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(drawF, x + w / 2, fY + fH / 2);
    ctx.restore();
  }

  // ─── 10. Sleek Bottom Footer Bar (Slider + Volume Result Pill) ─────
  if (isItemFocused) {
    const fY = y + h - 34, fH = 26;
    const effVol = (sweepDeg < 355 && isRev) ? (sweepDeg / 360) * item.volume : item.volume;
    const volDisplay = (item.volume != null && isFinite(item.volume))
      ? ((sweepDeg <= 5 && isRev) ? ("V(0°) = 0 • V_tp ≈ " + (Math.round(item.volume * 100) / 100)) : (sweepDeg < 355 && isRev) ? ("V(" + Math.round(sweepDeg) + "°) ≈ " + (Math.round(effVol * 100) / 100)) : ("V ≈ " + fmtVolume(item.volume)))
      : "";

    const volBadgeW = volDisplay ? 165 : 0;
    if (volDisplay) {
      const volBadgeX = x + w - volBadgeW - 8;

      ctx.save();
      ctx.shadowColor = isCross ? "rgba(245, 158, 11, 0.18)" : "rgba(37, 99, 235, 0.15)";
      ctx.shadowBlur = 8; ctx.shadowOffsetY = 1;
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.strokeStyle = isCross ? "rgba(245, 158, 11, 0.45)" : "rgba(37, 99, 235, 0.4)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(volBadgeX, fY, volBadgeW, fH, 6);
      else ctx.rect(volBadgeX, fY, volBadgeW, fH);
      ctx.fill(); ctx.stroke();
      ctx.restore();

      ctx.fillStyle = isCross ? "#b45309" : "#1e40af";
      ctx.font = "bold 11px system-ui, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(volDisplay, volBadgeX + volBadgeW / 2, fY + fH / 2);
    }

    // Interactive Slider: Exactly synchronized coordinates (tX0 = x+38, tX1 = x+w-228)
    const tX0 = x + 38;
    const tX1 = x + w - (volBadgeW > 0 ? 228 : 38);
    const tW = Math.max(60, tX1 - tX0);
    const tY = fY + fH / 2;

    if (isCross) {
      const knobX = tX0 + ((activeCutX - na) / (nb - na)) * tW;
      ctx.strokeStyle = "rgba(203,213,225,0.85)"; ctx.lineWidth = 4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(tX1, tY); ctx.stroke();
      ctx.strokeStyle = "#d97706"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(knobX, tY); ctx.stroke();
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(knobX, tY, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#d97706"; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.fillStyle = "#d97706"; ctx.beginPath(); ctx.arc(knobX, tY, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#64748b"; ctx.font = "bold 10px system-ui"; ctx.textAlign = "right"; ctx.fillText("a=" + na, tX0 - 13, tY + 3);
      ctx.textAlign = "left"; ctx.fillText("b=" + nb, tX1 + 13, tY + 3);

      const cTxt = "↔ Trượt mặt cắt x = " + (Math.round(activeCutX * 100) / 100);
      ctx.font = "bold 9.5px system-ui, sans-serif";
      const cW = ctx.measureText(cTxt).width + 12;
      const badgeX = Math.max(tX0 + cW / 2 - 8, Math.min(tX1 - cW / 2 + 8, knobX));
      ctx.save(); ctx.fillStyle = "rgba(255,255,255,0.96)"; ctx.strokeStyle = "rgba(245,158,11,0.6)"; ctx.lineWidth = 1;
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(badgeX - cW / 2, tY - 21, cW, 16, 4); else ctx.rect(badgeX - cW / 2, tY - 21, cW, 16); ctx.fill(); ctx.stroke(); ctx.restore();
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#b45309";
      ctx.fillText(cTxt, badgeX, tY - 13);
    } else {
      const frac = sweepDeg / 360;
      const knobX = tX0 + frac * tW;
      const trCol = isRevOx ? "#2563eb" : "#059669";
      ctx.strokeStyle = "rgba(203,213,225,0.85)"; ctx.lineWidth = 4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(tX1, tY); ctx.stroke();
      ctx.strokeStyle = trCol; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(knobX, tY); ctx.stroke();
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(knobX, tY, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = trCol; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.fillStyle = trCol; ctx.beginPath(); ctx.arc(knobX, tY, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#64748b"; ctx.font = "bold 10px system-ui"; ctx.textAlign = "right"; ctx.fillText("0°", tX0 - 13, tY + 3);
      ctx.textAlign = "left"; ctx.fillText("360°", tX1 + 13, tY + 3);

      const axName = isRevOx ? "Ox" : "Oy";
      const rTxt = "🔄 Kéo xoay quanh " + axName + ": θ = " + Math.round(sweepDeg) + "°";
      ctx.font = "bold 9.5px system-ui, sans-serif";
      const rW = ctx.measureText(rTxt).width + 12;
      const badgeX = Math.max(tX0 + rW / 2 - 8, Math.min(tX1 - rW / 2 + 8, knobX));
      ctx.save(); ctx.fillStyle = "rgba(255,255,255,0.96)"; ctx.strokeStyle = isRevOx ? "rgba(59,130,246,0.6)" : "rgba(16,185,129,0.6)"; ctx.lineWidth = 1;
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(badgeX - rW / 2, tY - 21, rW, 16, 4); else ctx.rect(badgeX - rW / 2, tY - 21, rW, 16); ctx.fill(); ctx.stroke(); ctx.restore();
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = trCol;
      ctx.fillText(rTxt, badgeX, tY - 13);

      if (item._rotHandle && sweepDeg < 355) {
        const hX = x + item._rotHandle.x, hY = y + item._rotHandle.y;
        ctx.save();
        ctx.shadowColor = isRevOx ? "rgba(37,99,235,0.35)" : "rgba(5,150,105,0.35)";
        ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(hX, hY, 12, 0, Math.PI * 2); ctx.fillStyle = isRevOx ? "rgba(37,99,235,0.18)" : "rgba(5,150,105,0.18)"; ctx.fill();
        ctx.beginPath(); ctx.arc(hX, hY, 8, 0, Math.PI * 2); ctx.fillStyle = "#ffffff"; ctx.fill();
        ctx.strokeStyle = trCol; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(hX, hY, 3.5, 0, Math.PI * 2); ctx.fillStyle = trCol; ctx.fill();
        const badgeTxt = (sweepDeg <= 2) ? "↺ Kéo xoay 3D" : ("↺ " + Math.round(sweepDeg) + "°");
        ctx.font = "bold 10px system-ui, sans-serif";
        const bW = ctx.measureText(badgeTxt).width + 8;
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.strokeStyle = "rgba(203, 213, 225, 0.9)"; ctx.lineWidth = 1;
        if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(hX - bW / 2, hY - 20, bW, 14, 4); ctx.fill(); ctx.stroke(); }
        else { ctx.fillRect(hX - bW / 2, hY - 20, bW, 14); ctx.strokeRect(hX - bW / 2, hY - 20, bW, 14); }
        ctx.fillStyle = trCol; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(badgeTxt, hX, hY - 13);
        ctx.restore();
      }
    }
  } else if (!isCross && item._rotHandle && sweepDeg < 355) {
    const hX = x + item._rotHandle.x, hY = y + item._rotHandle.y;
    const trCol = isRevOx ? "#2563eb" : "#059669";
    const badgeTxt = "↺ " + Math.round(sweepDeg) + "°";
    ctx.save();
    ctx.font = "bold 9.5px system-ui, sans-serif";
    const bW = ctx.measureText(badgeTxt).width + 8;
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.strokeStyle = "rgba(203, 213, 225, 0.85)"; ctx.lineWidth = 0.8;
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(hX - bW / 2, hY - 18, bW, 14, 4); ctx.fill(); ctx.stroke(); }
    else { ctx.fillRect(hX - bW / 2, hY - 18, bW, 14); ctx.strokeRect(hX - bW / 2, hY - 18, bW, 14); }
    ctx.fillStyle = trCol; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(badgeTxt, hX, hY - 11);
    ctx.restore();
  }
  ctx.restore();
}`;

js = js.slice(0, idxStart) + replacementSec9And10 + js.slice(idxStart + targetSec9And10.length);
console.log('✓ Patched: Section 9 & 10 conditional rendering on isItemFocused');

fs.writeFileSync(path, js, 'utf8');
console.log('\n🎉 Successfully applied focus hide patch!');
