const fs = require("fs");
const code = fs.readFileSync("dist/assets/index-D9JME9Hm.js", "utf8");

const volIdx = code.indexOf("function drawVolume3D(");
console.log("drawVolume3D index:", volIdx);
if (volIdx !== -1) {
  // Find where method or isCross or switch is handled
  const snippet = code.substring(volIdx, volIdx + 12000);
  fs.writeFileSync("vol_snippet.js", snippet);
  console.log("Saved vol_snippet.js, length:", snippet.length);
}

// Also check where "method" or "Lát cắt" is used in the UI or interaction
let searchIdx = 0;
while ((searchIdx = code.indexOf("Lát cắt", searchIdx)) !== -1) {
  console.log("Match 'Lát cắt' at", searchIdx, ":", code.substring(searchIdx - 40, searchIdx + 100));
  searchIdx += 8;
}
