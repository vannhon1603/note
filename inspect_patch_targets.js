const fs = require("fs");
const code = fs.readFileSync("dist/assets/index-D9JME9Hm.js", "utf8");

// 1. computeVolume
const cvIdx = code.indexOf("if(axis===\"ox\"){integrand=x=>Math.PI*Math.abs(f1(x)*f1(x)-g2(x)*g2(x));}");
console.log("cvIdx:", cvIdx);

// 2. VOLUME_AXES
const vaIdx = code.indexOf('["ox","oy","sec-square"');
console.log("vaIdx:", vaIdx);

// 3. Canvas tab click
const tabClickIdx = code.indexOf('i.x>=_midTab&&!_isCurCross');
console.log("tabClickIdx:", tabClickIdx);

// 4. Toolbar Tab buttons
const tbTabIdx = code.indexOf('children:"🔄 Quay quanh trục"}');
console.log("tbTabIdx:", tbTabIdx);

// 5. drawVolume3D isCross
const dVolIdx = code.indexOf('const currentAxis = axis || "ox";');
console.log("dVolIdx:", dVolIdx);
