const fs = require("fs");
let code = fs.readFileSync("dist/assets/index-D9JME9Hm.js", "utf8");

// 1. Tab 1 click:
const t1Old = `if(i.x<_midTab&&_isCurCross){\n    _newAxis=(_vItem.lastRevAxis&&!_vItem.lastRevAxis.startsWith("sec-"))?_vItem.lastRevAxis:"ox";\n    _vItem.lastSecAxis=_vItem.axis;\n  }`;
const t1New = `if(i.x<_midTab&&_isCurCross){\n    _newAxis=(_vItem.lastRevAxis&&!_vItem.lastRevAxis.startsWith("sec-"))?_vItem.lastRevAxis:(_vItem.axis==="sec-oy"?"oy":"ox");\n    _vItem.lastSecAxis=_vItem.axis;\n  }`;

if (code.includes(t1Old)) {
  code = code.replace(t1Old, t1New);
  console.log("Tab 1 click updated successfully!");
} else {
  console.log("t1Old not found");
}

// 2. Badge title and formula:
const bOld = `  if (isRevOx) {
    badgeTitle = "🔄 Xoay quanh Ox (" + sweepDeg + "°)";
    formulaShort = "V = π ∫ [f² - g²] dx";
  } else if (isRevOy) {
    badgeTitle = "🔄 Xoay quanh Oy (" + sweepDeg + "°)";
    formulaShort = "V = 2π ∫ x·(f - g) dx";
  }`;

const bNew = `  if (currentAxis === "sec-ox") {
    badgeTitle = "📐 Lát cắt tịnh tiến: Khối tròn xoay Ox";
    formulaShort = "V = ∫ S(x) dx = π ∫ [f² - g²] dx";
  } else if (currentAxis === "sec-oy") {
    badgeTitle = "📐 Lát cắt tịnh tiến: Khối tròn xoay Oy";
    formulaShort = "V = ∫ S(y) dy = 2π ∫ x·(f - g) dx";
  } else if (isRevOx) {
    badgeTitle = "🔄 Xoay quanh Ox (" + sweepDeg + "°)";
    formulaShort = "V = π ∫ [f² - g²] dx";
  } else if (isRevOy) {
    badgeTitle = "🔄 Xoay quanh Oy (" + sweepDeg + "°)";
    formulaShort = "V = 2π ∫ x·(f - g) dx";
  }`;

if (code.includes(bOld)) {
  code = code.replace(bOld, bNew);
  console.log("Badge title and formula updated successfully!");
} else {
  console.log("bOld not found");
}

fs.writeFileSync("dist/assets/index-D9JME9Hm.js", code, "utf8");
console.log("Saved.");
