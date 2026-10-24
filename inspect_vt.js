const fs = require("fs");
const code = fs.readFileSync("dist/assets/index-D9JME9Hm.js", "utf8");

// find y_ definition
const yIdx = code.indexOf("function y_(");
console.log("y_ index:", yIdx);
if (yIdx !== -1) {
  fs.writeFileSync("vt_y_.js", code.substring(yIdx, yIdx + 4000));
}

// find oF and sF definitions
const oFIdx = code.indexOf("oF=");
console.log("oF index:", oFIdx);
if (oFIdx !== -1) {
  console.log("oF snippet:", code.substring(oFIdx - 50, oFIdx + 300));
}

// find l_ definition
const lIdx = code.indexOf("function l_(");
console.log("l_ index:", lIdx);
if (lIdx !== -1) {
  fs.writeFileSync("vt_l_.js", code.substring(lIdx, lIdx + 4000));
}
