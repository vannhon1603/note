const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('dist/assets/index-D9JME9Hm.js');
const backupFile = path.resolve('dist/assets/index-D9JME9Hm.js.bak_before_unified_colors');

// Restore from backup to start from clean state
let code = fs.readFileSync(backupFile, 'utf8');

function replaceOrThrow(target, replacement, desc) {
  if (!code.includes(target)) {
    throw new Error('Target string not found for: ' + desc);
  }
  code = code.replace(target, replacement);
  console.log('✓ Successfully replaced:', desc);
}

// 1. Unified 3D mesh face hue for solids of revolution (both Ox and Oy use hue 214)
replaceOrThrow(
  'const hue = isRevOx ? 214 : 156;',
  'const hue = 214; // Unified educational Sapphire Blue for both Ox and Oy revolutions',
  'Revolution solids hue 214'
);

// 2. Unified 3D mesh face hue for cross-section solids (Square, Tri, Semicircle, Circle, Tri-Right, Tri-Iso all use hue 214)
const targetLoftedHue = `    // Crystalline translucent glass palette (trong sáng, không bị tối đen/nâu bùn)
    const hue = currentAxis === "sec-square" ? 208 // Crystalline Sky Blue (hài hòa với khối cầu)
      : currentAxis === "sec-tri" ? 168 // Mint Emerald Glass
      : currentAxis === "sec-semi" ? 255 // Lavender Indigo Glass
      : currentAxis === "sec-circle" ? 220 // Royal Sapphire
      : 195; // Aqua Cyan`;

const replLoftedHue = `    // Unified crystalline educational Sapphire Blue palette across all 3D spatial solids
    const hue = 214;`;

replaceOrThrow(targetLoftedHue, replLoftedHue, 'Cross-section solids unified hue 214');

// 3. Unified axes colors: colOx, colOy, colOz
const targetAxesCols = `  const colOx = isRevOx || isCross ? "#1d4ed8" : "#2563eb";
  const colOy = isRevOy ? "#047857" : "#1d4ed8";
  const colOz = isCross ? "#0e7490" : "#334155";`;

const replAxesCols = `  const colOx = "#1d4ed8";
  const colOy = "#1d4ed8";
  const colOz = "#334155";`;

replaceOrThrow(targetAxesCols, replAxesCols, 'Coordinate axes colors unified');

// 4. End caps for revolution solid: sapphire blue for both Ox and Oy
const targetCapFill = `fill: thCap === 0 ? (isRevOx ? "rgba(191, 219, 254, 0.40)" : "rgba(167, 243, 208, 0.40)") : (isRevOx ? "rgba(191, 219, 254, 0.45)" : "rgba(167, 243, 208, 0.45)"),
          stroke: thCap === 0 ? (isRevOx ? "rgba(29, 78, 216, 0.92)" : "rgba(4, 120, 87, 0.92)") : (isRevOx ? "rgba(37, 99, 235, 0.92)" : "rgba(5, 150, 105, 0.92)"),`;

const replCapFill = `fill: thCap === 0 ? "rgba(191, 219, 254, 0.40)" : "rgba(191, 219, 254, 0.45)",
          stroke: thCap === 0 ? "rgba(29, 78, 216, 0.92)" : "rgba(37, 99, 235, 0.92)",`;

replaceOrThrow(targetCapFill, replCapFill, 'End caps unified sapphire blue');

// 5. Card Tab 2 button: use unified theme blue #0284c7 instead of orange #d97706
const targetTab2Fill = `    // Tab 2: Lát cắt tịnh tiến
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(tab2X, tabY, tab2W, tabH, 5);
    else ctx.rect(tab2X, tabY, tab2W, tabH);
    if (isCross) {
      ctx.fillStyle = "#d97706"; ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 10px system-ui, sans-serif";
    } else {`;

const replTab2Fill = `    // Tab 2: Lát cắt tịnh tiến
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(tab2X, tabY, tab2W, tabH, 5);
    else ctx.rect(tab2X, tabY, tab2W, tabH);
    if (isCross) {
      ctx.fillStyle = "#0284c7"; ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 10px system-ui, sans-serif";
    } else {`;

replaceOrThrow(targetTab2Fill, replTab2Fill, 'Card Tab 2 unified theme blue');

// 6. Focused center formula text: #1e40af instead of brown #b45309
replaceOrThrow(
  'ctx.fillStyle = isCross ? "#b45309" : "#1e40af";\n      ctx.font = "bold 10.5px system-ui, sans-serif";',
  'ctx.fillStyle = "#1e40af";\n      ctx.font = "bold 10.5px system-ui, sans-serif";',
  'Focused center formula text unified blue'
);

// 7. Non-focused formula pill at top
const targetUnfocusedPill = `    ctx.shadowColor = "rgba(15, 23, 42, 0.04)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.strokeStyle = isCross ? "rgba(225, 29, 72, 0.35)" : "rgba(59, 130, 246, 0.25)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(fX, fY, fW, fH, 6);
    else ctx.rect(fX, fY, fW, fH);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = isCross ? "#9f1239" : "#1e40af";`;

const replUnfocusedPill = `    ctx.shadowColor = "rgba(15, 23, 42, 0.04)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.strokeStyle = "rgba(59, 130, 246, 0.25)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(fX, fY, fW, fH, 6);
    else ctx.rect(fX, fY, fW, fH);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#1e40af";`;

replaceOrThrow(targetUnfocusedPill, replUnfocusedPill, 'Unfocused formula pill unified blue');

// 8. Volume Result Pill in Bottom-Right
const targetVolResultPill = `      ctx.save();
      ctx.shadowColor = isCross ? "rgba(245, 158, 11, 0.16)" : "rgba(37, 99, 235, 0.12)";
      ctx.shadowBlur = 10; ctx.shadowOffsetY = 2;
      ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
      ctx.strokeStyle = isCross ? "rgba(245, 158, 11, 0.45)" : "rgba(37, 99, 235, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(volBadgeX, fY, volBadgeW, fH, 8);
      else ctx.rect(volBadgeX, fY, volBadgeW, fH);
      ctx.fill(); ctx.stroke();
      ctx.restore();

      ctx.fillStyle = isCross ? "#b45309" : "#1e40af";`;

const replVolResultPill = `      ctx.save();
      ctx.shadowColor = "rgba(37, 99, 235, 0.12)";
      ctx.shadowBlur = 10; ctx.shadowOffsetY = 2;
      ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
      ctx.strokeStyle = "rgba(37, 99, 235, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(volBadgeX, fY, volBadgeW, fH, 8);
      else ctx.rect(volBadgeX, fY, volBadgeW, fH);
      ctx.fill(); ctx.stroke();
      ctx.restore();

      ctx.fillStyle = "#1e40af";`;

replaceOrThrow(targetVolResultPill, replVolResultPill, 'Volume result pill unified blue');

// 9. Slider track and knob in isCross: use unified theme blue #2563eb / #1e40af
const targetCrossSlider = `      ctx.strokeStyle = "rgba(226,232,240,0.95)"; ctx.lineWidth = 3.5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(tX1, tY); ctx.stroke();
      ctx.strokeStyle = "#d97706"; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(knobX, tY); ctx.stroke();
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(knobX, tY, 6.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#d97706"; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.fillStyle = "#d97706"; ctx.beginPath(); ctx.arc(knobX, tY, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#64748b"; ctx.font = "bold 10px system-ui"; ctx.textAlign = "right"; ctx.fillText("a=" + na, tX0 - 13, tY + 3);
      ctx.textAlign = "left"; ctx.fillText("b=" + nb, tX1 + 13, tY + 3);

      const cTxt = "↔ Trượt mặt cắt x = " + (Math.round(activeCutX * 100) / 100);
      ctx.font = "bold 9.5px system-ui, sans-serif";
      const cW = ctx.measureText(cTxt).width + 12;
      const badgeX = Math.max(tX0 + cW / 2 - 8, Math.min(tX1 - cW / 2 + 8, knobX));
      ctx.save(); ctx.fillStyle = "rgba(255,255,255,0.98)"; ctx.strokeStyle = "rgba(245, 158, 11, 0.75)"; ctx.lineWidth = 1;
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(badgeX - cW / 2, tY - 21, cW, 16, 4); else ctx.rect(badgeX - cW / 2, tY - 21, cW, 16); ctx.fill(); ctx.stroke(); ctx.restore();
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#b45309";
      ctx.fillText(cTxt, badgeX, tY - 13);`;

const replCrossSlider = `      ctx.strokeStyle = "rgba(226,232,240,0.95)"; ctx.lineWidth = 3.5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(tX1, tY); ctx.stroke();
      ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(knobX, tY); ctx.stroke();
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(knobX, tY, 6.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.fillStyle = "#2563eb"; ctx.beginPath(); ctx.arc(knobX, tY, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#64748b"; ctx.font = "bold 10px system-ui"; ctx.textAlign = "right"; ctx.fillText("a=" + na, tX0 - 13, tY + 3);
      ctx.textAlign = "left"; ctx.fillText("b=" + nb, tX1 + 13, tY + 3);

      const cTxt = "↔ Trượt mặt cắt x = " + (Math.round(activeCutX * 100) / 100);
      ctx.font = "bold 9.5px system-ui, sans-serif";
      const cW = ctx.measureText(cTxt).width + 12;
      const badgeX = Math.max(tX0 + cW / 2 - 8, Math.min(tX1 - cW / 2 + 8, knobX));
      ctx.save(); ctx.fillStyle = "rgba(255,255,255,0.98)"; ctx.strokeStyle = "rgba(37, 99, 235, 0.35)"; ctx.lineWidth = 1;
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(badgeX - cW / 2, tY - 21, cW, 16, 4); else ctx.rect(badgeX - cW / 2, tY - 21, cW, 16); ctx.fill(); ctx.stroke(); ctx.restore();
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#1e40af";
      ctx.fillText(cTxt, badgeX, tY - 13);`;

replaceOrThrow(targetCrossSlider, replCrossSlider, 'Cross-section slider unified blue');

// 10. Rotation slider trCol: unified #2563eb for both Ox and Oy
replaceOrThrow(
  'const trCol = isRevOx ? "#2563eb" : "#059669";',
  'const trCol = "#2563eb"; // Unified theme blue for all rotations',
  'Rotation slider trCol unified blue'
);

// 11. Dimension line along base in lofted solids (clean blue d=... instead of red)
const targetBaseDim = `        // Dimension line along base (đoạn đáy)
        ctx.beginPath();
        ctx.moveTo(pBase0.sx, pBase0.sy);
        ctx.lineTo(pBase1.sx, pBase1.sy);
        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 2.4;
        ctx.stroke();

        // Base label pill (offset below/aside base line to avoid blocking)
        if (cutW >= 0.35) {
          const bLabel = "d=" + (Math.round(cutW * 100) / 100);
          ctx.font = "bold 9.5px system-ui, sans-serif";
          const blw = ctx.measureText(bLabel).width + 8;
          const bTagX = pMidBase.sx + blw / 2 + 12;
          const bTagY = pMidBase.sy;

          ctx.beginPath();
          ctx.moveTo(pMidBase.sx, pMidBase.sy);
          ctx.lineTo(bTagX - blw / 2, bTagY);
          ctx.strokeStyle = "rgba(225, 29, 72, 0.4)";
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(bTagX - blw / 2, bTagY - 7.5, blw, 15, 4);
          else ctx.rect(bTagX - blw / 2, bTagY - 7.5, blw, 15);
          ctx.fill();
          ctx.strokeStyle = "#fda4af";
          ctx.lineWidth = 1;
          if (ctx.roundRect) ctx.roundRect(bTagX - blw / 2, bTagY - 7.5, blw, 15, 4);
          else ctx.rect(bTagX - blw / 2, bTagY - 7.5, blw, 15);
          ctx.stroke();
          ctx.fillStyle = "#9f1239";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(bLabel, bTagX, bTagY);
        }`;

const replBaseDim = `        // Dimension line along base (đoạn đáy) - unified sapphire blue
        ctx.beginPath();
        ctx.moveTo(pBase0.sx, pBase0.sy);
        ctx.lineTo(pBase1.sx, pBase1.sy);
        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Base label pill (offset below/aside base line to avoid blocking)
        if (cutW >= 0.35) {
          const bLabel = "d=" + (Math.round(cutW * 100) / 100);
          ctx.font = "bold 9.5px system-ui, sans-serif";
          const blw = ctx.measureText(bLabel).width + 8;
          const bTagX = pMidBase.sx + blw / 2 + 12;
          const bTagY = pMidBase.sy;

          ctx.beginPath();
          ctx.moveTo(pMidBase.sx, pMidBase.sy);
          ctx.lineTo(bTagX - blw / 2, bTagY);
          ctx.strokeStyle = "rgba(37, 99, 235, 0.35)";
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(bTagX - blw / 2, bTagY - 7.5, blw, 15, 4);
          else ctx.rect(bTagX - blw / 2, bTagY - 7.5, blw, 15);
          ctx.fill();
          ctx.strokeStyle = "rgba(37, 99, 235, 0.35)";
          ctx.lineWidth = 1;
          if (ctx.roundRect) ctx.roundRect(bTagX - blw / 2, bTagY - 7.5, blw, 15, 4);
          else ctx.rect(bTagX - blw / 2, bTagY - 7.5, blw, 15);
          ctx.stroke();
          ctx.fillStyle = "#1e40af";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(bLabel, bTagX, bTagY);
        }`;

replaceOrThrow(targetBaseDim, replBaseDim, 'Base dimension line unified blue');

// 12. Toolbar buttons: replace rainbow emojis with clean, uniform mathematical geometric icons
const targetTbButtons = `    f.jsx("button",{className:(curAx==="sec-ox"||curAx==="sec-oy")?"on":"",title:"Lát cắt đĩa tròn tịnh tiến của chính khối tròn xoay (Cùng hình 3D)",onClick:()=>setAxis(it.axis==="oy"||it.axis==="sec-oy"?"sec-oy":"sec-ox"),children:"🔵 Khối tròn xoay (Cùng hình)"}),
    f.jsx("button",{className:curAx==="sec-square"?"on":"",title:"Mặt cắt hình vuông",onClick:()=>setAxis("sec-square"),children:"⬛ Vuông"}),
    f.jsx("button",{className:curAx==="sec-tri"?"on":"",title:"Mặt cắt tam giác đều",onClick:()=>setAxis("sec-tri"),children:"🔺 Tam giác"}),
    f.jsx("button",{className:curAx==="sec-semi"?"on":"",title:"Mặt cắt nửa hình tròn",onClick:()=>setAxis("sec-semi"),children:"🌗 Nửa tròn"}),
    f.jsx("button",{className:curAx==="sec-circle"?"on":"",title:"Mặt cắt hình tròn",onClick:()=>setAxis("sec-circle"),children:"🟡 Tròn"}),
    f.jsx("button",{className:curAx==="sec-tri-right"?"on":"",title:"Mặt cắt tam giác vuông cân (cạnh góc vuông trên đáy)",onClick:()=>setAxis("sec-tri-right"),children:"⊿ Góc vuông"}),
    f.jsx("button",{className:curAx==="sec-tri-iso"?"on":"",title:"Mặt cắt tam giác vuông cân (cạnh huyền trên đáy)",onClick:()=>setAxis("sec-tri-iso"),children:"⊿ Huyền đáy"}),`;

const replTbButtons = `    f.jsx("button",{className:(curAx==="sec-ox"||curAx==="sec-oy")?"on":"",title:"Lát cắt đĩa tròn tịnh tiến của chính khối tròn xoay (Cùng hình 3D)",onClick:()=>setAxis(it.axis==="oy"||it.axis==="sec-oy"?"sec-oy":"sec-ox"),children:"◎ Khối tròn xoay (Cùng hình)"}),
    f.jsx("button",{className:curAx==="sec-square"?"on":"",title:"Mặt cắt hình vuông",onClick:()=>setAxis("sec-square"),children:"◻ Vuông"}),
    f.jsx("button",{className:curAx==="sec-tri"?"on":"",title:"Mặt cắt tam giác đều",onClick:()=>setAxis("sec-tri"),children:"△ Tam giác"}),
    f.jsx("button",{className:curAx==="sec-semi"?"on":"",title:"Mặt cắt nửa hình tròn",onClick:()=>setAxis("sec-semi"),children:"⌒ Nửa tròn"}),
    f.jsx("button",{className:curAx==="sec-circle"?"on":"",title:"Mặt cắt hình tròn",onClick:()=>setAxis("sec-circle"),children:"○ Tròn"}),
    f.jsx("button",{className:curAx==="sec-tri-right"?"on":"",title:"Mặt cắt tam giác vuông cân (cạnh góc vuông trên đáy)",onClick:()=>setAxis("sec-tri-right"),children:"◺ Góc vuông"}),
    f.jsx("button",{className:curAx==="sec-tri-iso"?"on":"",title:"Mặt cắt tam giác vuông cân (cạnh huyền trên đáy)",onClick:()=>setAxis("sec-tri-iso"),children:"◿ Huyền đáy"}),`;

replaceOrThrow(targetTbButtons, replTbButtons, 'Toolbar buttons icons unified');

// 13. Dialog optgroups: replace 🟢 and 🟠 with clean unified 📐
replaceOrThrow(
  'optgroup",{label:"🟢 Khối tròn xoay (Có thể xoay 360°)"',
  'optgroup",{label:"📐 Khối tròn xoay (Có thể xoay 360°)"',
  'Optgroup 1 unified icon'
);

replaceOrThrow(
  'optgroup",{label:"🟠 Khối lát cắt tịnh tiến (Không thể xoay)"',
  'optgroup",{label:"📐 Khối lát cắt tịnh tiến (Không thể xoay)"',
  'Optgroup 2 unified icon'
);

// Save bundle
fs.writeFileSync(targetFile, code, 'utf8');
console.log('🎉 ALL 3D SPATIAL SOLIDS AND ICONS SUCCESSFULLY UNIFIED IN COLOR!');
