const fs = require("fs");
let code = fs.readFileSync("dist/assets/index-D9JME9Hm.js", "utf8");

// 1. Update axisLabels to include "sec-ox"
const alOld = `"ox":r.volAxisOx,"oy":r.volAxisOy,\n    "sec-square":r.volSecSquare`;
const alNew = `"ox":r.volAxisOx,"oy":r.volAxisOy,\n    "sec-ox":"Lát cắt tịnh tiến: Khối tròn xoay (Cùng hình 3D - S(x)=π·y²)",\n    "sec-square":r.volSecSquare`;

if (code.includes(alOld)) {
  code = code.replace(alOld, alNew);
  console.log("axisLabels updated with sec-ox!");
} else {
  console.log("alOld not found");
}

// 2. Add onPointerDown to canvasRef in VolumeDialog
const cvOld = `f.jsx("canvas",{ref:canvasRef,style:{border:"1.5px solid #e2e8f0"`;
const cvNew = `f.jsx("canvas",{ref:canvasRef,onPointerDown:e=>{const rect=e.currentTarget.getBoundingClientRect();const px=e.clientX-rect.left;const py=e.clientY-rect.top;if(py>=12&&py<=38){if(px>=12&&px<125){setAxis("ox");}else if(px>=125&&px<245){setAxis("sec-ox");}}},style:{cursor:"pointer",border:"1.5px solid #e2e8f0"`;

if (code.includes(cvOld)) {
  code = code.replace(cvOld, cvNew);
  console.log("VolumeDialog canvasRef onPointerDown added!");
} else {
  console.log("cvOld not found");
}

fs.writeFileSync("dist/assets/index-D9JME9Hm.js", code, "utf8");
console.log("Saved.");
