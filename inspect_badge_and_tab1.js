const fs = require("fs");
const code = fs.readFileSync("dist/assets/index-D9JME9Hm.js", "utf8");

// Check where badgeTitle is set
let idx = 0;
while ((idx = code.indexOf("badgeTitle = \"🔄 Xoay quanh Ox", idx)) !== -1) {
  console.log("Found badgeTitle at", idx, ":", code.substring(idx - 40, idx + 240));
  idx += 20;
}

// Check where Tab 1 click is handled (i.x < _midTab)
let idx2 = 0;
while ((idx2 = code.indexOf("_midTab", idx2)) !== -1) {
  console.log("Found _midTab at", idx2, ":", code.substring(idx2 - 30, idx2 + 150));
  idx2 += 8;
}
