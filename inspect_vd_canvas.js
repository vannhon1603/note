const fs = require("fs");
const code = fs.readFileSync("dist/assets/index-D9JME9Hm.js", "utf8");

const cvIdx = code.indexOf("ref:canvasRef");
console.log(code.substring(cvIdx - 200, cvIdx + 400));
