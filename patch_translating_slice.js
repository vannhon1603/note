const fs = require("fs");

let bundle = fs.readFileSync("dist/assets/index-D9JME9Hm.js", "utf8");

// 1. Update computeVolume to support "sec-ox" and "sec-oy"
const cvTarget = 'if(axis==="ox"){integrand=x=>Math.PI*Math.abs(f1(x)*f1(x)-g2(x)*g2(x));}\n  else if(axis==="oy"){integrand=x=>2*Math.PI*Math.abs(x)*Math.abs(f1(x)-g2(x));}';
const cvRepl = 'if(axis==="ox"||axis==="sec-ox"){integrand=x=>Math.PI*Math.abs(f1(x)*f1(x)-g2(x)*g2(x));}\n  else if(axis==="oy"||axis==="sec-oy"){integrand=x=>2*Math.PI*Math.abs(x)*Math.abs(f1(x)-g2(x));}';

if (!bundle.includes(cvTarget)) {
  console.error("Could not find cvTarget!");
} else {
  bundle = bundle.replace(cvTarget, cvRepl);
  console.log("computeVolume updated.");
}

// 2. Update VOLUME_AXES to include "sec-ox"
const vaTarget = 'const VOLUME_AXES=["ox","oy","sec-square"';
const vaRepl = 'const VOLUME_AXES=["ox","oy","sec-ox","sec-square"';
if (!bundle.includes(vaTarget)) {
  console.error("Could not find vaTarget!");
} else {
  bundle = bundle.replace(vaTarget, vaRepl);
  console.log("VOLUME_AXES updated.");
}

// 3. Update Canvas Tab Click so Tab 2 switches to "sec-ox" (CÙNG HÌNH ĐÓ) instead of "sec-square"
const tabClickTarget = `  }else if(i.x>=_midTab&&!_isCurCross){
    _newAxis=(_vItem.lastSecAxis&&_vItem.lastSecAxis.startsWith("sec-"))?_vItem.lastSecAxis:"sec-square";
    _vItem.lastRevAxis=_vItem.axis;
  }`;

const tabClickRepl = `  }else if(i.x>=_midTab&&!_isCurCross){
    _newAxis=(_vItem.lastSecAxis&&_vItem.lastSecAxis.startsWith("sec-"))?_vItem.lastSecAxis:(_vItem.axis==="oy"?"sec-oy":"sec-ox");
    _vItem.lastRevAxis=_vItem.axis;
  }`;

if (!bundle.includes(tabClickTarget)) {
  console.error("Could not find tabClickTarget!");
} else {
  bundle = bundle.replace(tabClickTarget, tabClickRepl);
  console.log("Canvas Tab Click (Tab 2) updated.");
}

const tabClick1Target = `  }else if(i.x<_midTab&&_isCurCross){
    _newAxis=(_vItem.lastRevAxis&&!_vItem.lastRevAxis.startsWith("sec-"))?_vItem.lastRevAxis:"ox";
    _vItem.lastSecAxis=_vItem.axis;
  }`;

const tabClick1Repl = `  }else if(i.x<_midTab&&_isCurCross){
    _newAxis=(_vItem.lastRevAxis&&!_vItem.lastRevAxis.startsWith("sec-"))?_vItem.lastRevAxis:(_vItem.axis==="sec-oy"?"oy":"ox");
    _vItem.lastSecAxis=_vItem.axis;
  }`;

if (!bundle.includes(tabClick1Target)) {
  console.error("Could not find tabClick1Target!");
} else {
  bundle = bundle.replace(tabClick1Target, tabClick1Repl);
  console.log("Canvas Tab Click (Tab 1) updated.");
}

// 4. Update Floating Toolbar Buttons:
// Tab 1 & Tab 2 buttons
const tbTabTarget = `f.jsx("button",{className:!isCross?"on":"",title:"Hướng 1: Tính thể tích bằng cách quay hình phẳng quanh trục (Khối tròn xoay)",onClick:()=>{
    const targetAx=(it.lastRevAxis&&!it.lastRevAxis.startsWith("sec-"))?it.lastRevAxis:"ox";
    setAxis(targetAx);
  },children:"🔄 Quay quanh trục"}),
  f.jsx("button",{className:isCross?"on":"",title:"Hướng 2: Tính thể tích bằng các lát cắt thiết diện vuông góc trục Ox",onClick:()=>{
    const targetAx=(it.lastSecAxis&&it.lastSecAxis.startsWith("sec-"))?it.lastSecAxis:"sec-square";
    setAxis(targetAx);
  },children:"📐 Lát cắt thiết diện"}),`;

const tbTabRepl = `f.jsx("button",{className:!isCross?"on":"",title:"Hướng 1: Tính thể tích bằng cách quay hình phẳng quanh trục (Khối tròn xoay)",onClick:()=>{
    const targetAx=(it.lastRevAxis&&!it.lastRevAxis.startsWith("sec-"))?it.lastRevAxis:(it.axis==="sec-oy"?"oy":"ox");
    setAxis(targetAx);
  },children:"🔄 Quay quanh trục"}),
  f.jsx("button",{className:isCross?"on":"",title:"Hướng 2: Tính thể tích bằng các lát cắt thiết diện tịnh tiến (Cùng hình 3D)",onClick:()=>{
    const targetAx=(it.lastSecAxis&&it.lastSecAxis.startsWith("sec-"))?it.lastSecAxis:(it.axis==="oy"?"sec-oy":"sec-ox");
    setAxis(targetAx);
  },children:"📐 Lát cắt tịnh tiến"}),`;

if (!bundle.includes(tbTabTarget)) {
  console.error("Could not find tbTabTarget!");
} else {
  bundle = bundle.replace(tbTabTarget, tbTabRepl);
  console.log("Toolbar Tab buttons updated.");
}

// 5. Update isCross button list in Toolbar to add "🔵 Khối tròn xoay (Cùng hình)" as the default first option
const crossBtnTarget = `}): f.jsxs(f.Fragment,{children:[
    f.jsx("button",{className:curAx==="sec-square"?"on":"",title:"Mặt cắt hình vuông",onClick:()=>setAxis("sec-square"),children:"⬛ Vuông"}),`;

const crossBtnRepl = `}): f.jsxs(f.Fragment,{children:[
    f.jsx("button",{className:(curAx==="sec-ox"||curAx==="sec-oy")?"on":"",title:"Lát cắt đĩa tròn tịnh tiến của chính khối tròn xoay (Cùng hình 3D)",onClick:()=>setAxis(it.axis==="oy"||it.axis==="sec-oy"?"sec-oy":"sec-ox"),children:"🔵 Khối tròn xoay (Cùng hình)"}),
    f.jsx("button",{className:curAx==="sec-square"?"on":"",title:"Mặt cắt hình vuông",onClick:()=>setAxis("sec-square"),children:"⬛ Vuông"}),`;

if (!bundle.includes(crossBtnTarget)) {
  console.error("Could not find crossBtnTarget!");
} else {
  bundle = bundle.replace(crossBtnTarget, crossBtnRepl);
  console.log("Toolbar crossBtn updated with Khối tròn xoay (Cùng hình).");
}

// 6. Update drawVolume3D variables and logic
// Canvas tab title
bundle = bundle.replace('ctx.fillText("📐 2. Lát cắt thiết diện", tab2X + tabW / 2, tabY + tabH / 2);', 'ctx.fillText("📐 2. Lát cắt tịnh tiến", tab2X + tabW / 2, tabY + tabH / 2);');
console.log("Canvas Tab 2 title updated.");

// Update axis checks in drawVolume3D
const axisDefTarget = `  const currentAxis = axis || "ox";
  const isRevOx = currentAxis === "ox";
  const isRevOy = currentAxis === "oy";
  const isRev = isRevOx || isRevOy;
  const isCross = currentAxis.startsWith("sec-");`;

const axisDefRepl = `  const currentAxis = axis || "ox";
  const isRevOx = currentAxis === "ox" || currentAxis === "sec-ox";
  const isRevOy = currentAxis === "oy" || currentAxis === "sec-oy";
  const isRev = isRevOx || isRevOy;
  const isCross = currentAxis.startsWith("sec-");
  const isSecRev = currentAxis === "sec-ox" || currentAxis === "sec-oy";`;

if (!bundle.includes(axisDefTarget)) {
  console.error("Could not find axisDefTarget!");
} else {
  bundle = bundle.replace(axisDefTarget, axisDefRepl);
  console.log("axisDef updated in drawVolume3D.");
}

// Update outer face alpha when isSecRev (semi-transparent so you see inside)
const faceFillTarget = `        faces.push({
          z: zAvg,
          pts: [s00, s10, s11, s01],
          fill: "hsla(" + hue + ",85%," + litLightness + "%,0.88)",
          stroke: "hsla(" + hue + ",90%," + Math.round(litLightness * 0.7) + "%,0.25)",
          type: "outer"
        });`;

const faceFillRepl = `        const fAlpha = isSecRev ? 0.35 : 0.88;
        const sAlpha = isSecRev ? 0.22 : 0.25;
        faces.push({
          z: zAvg,
          pts: [s00, s10, s11, s01],
          fill: "hsla(" + hue + ",85%," + litLightness + "%," + fAlpha + ")",
          stroke: "hsla(" + hue + ",90%," + Math.round(litLightness * 0.7) + "%," + sAlpha + ")",
          type: "outer"
        });`;

if (!bundle.includes(faceFillTarget)) {
  console.error("Could not find faceFillTarget!");
} else {
  bundle = bundle.replace(faceFillTarget, faceFillRepl);
  console.log("faceFill updated with semi-transparency for isSecRev.");
}

// Update Section 6 to render circular cross section disc and slicing plane when isSecRev
const sec6Target = `  // ─── 6. INTERACTIVE CUTTING PLANE & CROSS-SECTION AT activeCutX ──
  if (isCross) {
    ctx.save();
    const cutW = Math.abs(f1(activeCutX) - f2(activeCutX));
    const cutYm = (f1(activeCutX) + f2(activeCutX)) / 2;
    const cutShape = getCrossSectionShape(currentAxis, cutW);
    const cutArea = computeCrossArea(currentAxis, cutW);`;

const sec6Repl = `  // ─── 6. INTERACTIVE CUTTING PLANE & CROSS-SECTION AT activeCutX ──
  if (isCross) {
    ctx.save();
    if (isSecRev) {
      // ══════ Slicing Plane & Circular Cross Section for Revolved Solid ══════
      const R1 = Math.abs(f1(activeCutX));
      const R2 = Math.abs(f2(activeCutX));
      const Ro = Math.max(R1, R2);
      const Ri = Math.min(R1, R2);
      const cutArea = Math.PI * (Ro * Ro - Ri * Ri);

      // 1. Semi-transparent cutting plane sheet perpendicular to Ox
      const pExtent = Math.max(boundR * 1.35, Ro * 1.3, 1.2);
      const planeSheet = [
        project(activeCutX, -pExtent, -pExtent),
        project(activeCutX, pExtent, -pExtent),
        project(activeCutX, pExtent, pExtent),
        project(activeCutX, -pExtent, pExtent)
      ];
      ctx.beginPath();
      ctx.moveTo(planeSheet[0].sx, planeSheet[0].sy);
      for (let k = 1; k < planeSheet.length; k++) ctx.lineTo(planeSheet[k].sx, planeSheet[k].sy);
      ctx.closePath();
      ctx.fillStyle = "rgba(6, 182, 212, 0.16)";
      ctx.fill();
      ctx.strokeStyle = "rgba(6, 182, 212, 0.75)";
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Circular Cross-Section Disc at activeCutX
      if (Ro > 0.001) {
        const nCirclePts = 36;
        const outerCircle = [];
        for (let ci = 0; ci <= nCirclePts; ci++) {
          const ang = (ci / nCirclePts) * Math.PI * 2;
          outerCircle.push(project(activeCutX, Ro * Math.cos(ang), Ro * Math.sin(ang)));
        }

        ctx.beginPath();
        ctx.moveTo(outerCircle[0].sx, outerCircle[0].sy);
        for (let k = 1; k < outerCircle.length; k++) ctx.lineTo(outerCircle[k].sx, outerCircle[k].sy);
        ctx.closePath();

        if (Ri > 0.001) {
          const innerCircle = [];
          for (let ci = nCirclePts; ci >= 0; ci--) {
            const ang = (ci / nCirclePts) * Math.PI * 2;
            innerCircle.push(project(activeCutX, Ri * Math.cos(ang), Ri * Math.sin(ang)));
          }
          ctx.moveTo(innerCircle[0].sx, innerCircle[0].sy);
          for (let k = 1; k < innerCircle.length; k++) ctx.lineTo(innerCircle[k].sx, innerCircle[k].sy);
          ctx.closePath();
        }

        ctx.fillStyle = "rgba(245, 158, 11, 0.88)";
        ctx.fill();
        ctx.strokeStyle = "#b45309";
        ctx.lineWidth = 2.4;
        ctx.stroke();

        // Radius line from center to edge
        const pCenter = project(activeCutX, 0, 0);
        const pRadius = project(activeCutX, Ro, 0);
        ctx.beginPath();
        ctx.moveTo(pCenter.sx, pCenter.sy);
        ctx.lineTo(pRadius.sx, pRadius.sy);
        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 2.4;
        ctx.stroke();

        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.arc(pCenter.sx, pCenter.sy, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#dc2626";
        ctx.font = "bold 11px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText("R=" + (Math.round(Ro * 100) / 100), (pCenter.sx + pRadius.sx) / 2, (pCenter.sy + pRadius.sy) / 2 - 2);

        // Floating badge on top
        const topPt = project(activeCutX, Ro, 0);
        const badgeText = "S(" + (Math.round(activeCutX * 10) / 10) + ") = π·R² ≈ " + (Math.round(cutArea * 100) / 100);
        ctx.font = "bold 11px system-ui, sans-serif";
        const bw = ctx.measureText(badgeText).width + 12;
        ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
        ctx.fillRect(topPt.sx - bw / 2, topPt.sy - 22, bw, 18);
        ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 1;
        ctx.strokeRect(topPt.sx - bw / 2, topPt.sy - 22, bw, 18);
        ctx.fillStyle = "#b45309";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(badgeText, topPt.sx, topPt.sy - 13);

        item._cutHandle = { x: topPt.sx - x, y: topPt.sy - y };
        ctx.beginPath();
        ctx.arc(topPt.sx, topPt.sy, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(topPt.sx, topPt.sy, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#d97706";
        ctx.fill();
      }

      // Mark position on Ox
      const pCutOx = project(activeCutX, 0, 0);
      ctx.fillStyle = "#ea580c";
      ctx.beginPath();
      ctx.arc(pCutOx.sx, pCutOx.sy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
    const cutW = Math.abs(f1(activeCutX) - f2(activeCutX));
    const cutYm = (f1(activeCutX) + f2(activeCutX)) / 2;
    const cutShape = getCrossSectionShape(currentAxis, cutW);
    const cutArea = computeCrossArea(currentAxis, cutW);`;

if (!bundle.includes(sec6Target)) {
  console.error("Could not find sec6Target!");
} else {
  // We need to also close the else block in Section 6
  // Let's find where Section 6 ends (at line 1435134)
  const endSec6Target = `    // Mark current x position on Ox axis with indicator tick
    const pCutOx = project(activeCutX, 0, 0);
    ctx.fillStyle = "#ea580c";
    ctx.beginPath();
    ctx.arc(pCutOx.sx, pCutOx.sy, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }`;

  const endSec6Repl = `    // Mark current x position on Ox axis with indicator tick
    const pCutOx = project(activeCutX, 0, 0);
    ctx.fillStyle = "#ea580c";
    ctx.beginPath();
    ctx.arc(pCutOx.sx, pCutOx.sy, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    } // end else
  }`;

  bundle = bundle.replace(sec6Target, sec6Repl);
  bundle = bundle.replace(endSec6Target, endSec6Repl);
  console.log("Section 6 updated with isSecRev translating cutting disc!");
}

// Update Badge Title and formula in drawVolume3D
const badgeTarget = `  if (isRevOx) {
    badgeTitle = "🔄 Xoay quanh Ox (" + sweepDeg + "°)";
    formulaShort = "V = π ∫ [f² - g²] dx";
  } else if (isRevOy) {
    badgeTitle = "🔄 Xoay quanh Oy (" + sweepDeg + "°)";
    formulaShort = "V = 2π ∫ x [f - g] dx";
  }`;

const badgeRepl = `  if (currentAxis === "sec-ox") {
    badgeTitle = "📐 Lát cắt tịnh tiến: Khối tròn xoay Ox";
    formulaShort = "V = ∫ S(x) dx = π ∫ [f² - g²] dx";
  } else if (currentAxis === "sec-oy") {
    badgeTitle = "📐 Lát cắt tịnh tiến: Khối tròn xoay Oy";
    formulaShort = "V = ∫ S(y) dy = 2π ∫ x [f - g] dx";
  } else if (isRevOx) {
    badgeTitle = "🔄 Xoay quanh Ox (" + sweepDeg + "°)";
    formulaShort = "V = π ∫ [f² - g²] dx";
  } else if (isRevOy) {
    badgeTitle = "🔄 Xoay quanh Oy (" + sweepDeg + "°)";
    formulaShort = "V = 2π ∫ x [f - g] dx";
  }`;

if (!bundle.includes(badgeTarget)) {
  console.error("Could not find badgeTarget!");
} else {
  bundle = bundle.replace(badgeTarget, badgeRepl);
  console.log("Badge and formula updated for sec-ox / sec-oy.");
}

// Update translation slider text
bundle = bundle.replace('"↔ Kéo trượt mặt cắt x = "', '"↔ Kéo tịnh tiến mặt cắt x = "');

// Save updated bundle
fs.writeFileSync("dist/assets/index-D9JME9Hm.js", bundle, "utf8");
console.log("dist/assets/index-D9JME9Hm.js patched successfully! Total length:", bundle.length);
