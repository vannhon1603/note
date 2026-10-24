const fs = require("fs");
const css = fs.readFileSync("dist/assets/index-Bcmxra3u.css", "utf8");

// Let's find styles for toolbar, app, canvas, header, sidebar, button, dialog, etc.
const keywords = ["toolbar", "header", "app", "canvas", "sidebar", "btn", "primary", "dialog", "drawer", "sheet", "page", "active", "panel"];

for (const kw of keywords) {
  const reg = new RegExp(`\\.[a-zA-Z0-9_-]*${kw}[a-zA-Z0-9_-]*\\s*\\{[^}]+\\}`, "gi");
  const matches = css.match(reg);
  console.log(`=== Matches for ${kw} (${matches ? matches.length : 0}) ===`);
  if (matches) {
    console.log(matches.slice(0, 5).join("\n"));
  }
}
