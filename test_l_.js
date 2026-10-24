const fs = require("fs");
// Run a test inside node by loading index-D9JME9Hm.js or isolating l_
// Let's inspect where l_ and its dependencies are defined
const code = fs.readFileSync("dist/assets/index-D9JME9Hm.js", "utf8");

// Let's see what l_ does
console.log("Checking l_ call...");
