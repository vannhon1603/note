const fs = require("fs");
const code = fs.readFileSync("dist/assets/index-D9JME9Hm.js", "utf8");

const volIdx = code.indexOf("function drawVolume3D(");
// Find where showSlice or activeCutX is rendered
const searchStr = "activeCutX";
let idx = volIdx;
while ((idx = code.indexOf(searchStr, idx)) !== -1 && idx < volIdx + 30000) {
  console.log("Match activeCutX at", idx, ":");
  console.log(code.substring(idx - 100, idx + 600));
  idx += searchStr.length;
}
