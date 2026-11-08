const fs = require('fs');
const css = fs.readFileSync('dist/assets/theme-modern.css', 'utf8');

const regex = /\.selection-bar\s*\{[^}]*\}/g;
let m;
while ((m = regex.exec(css)) !== null) {
  console.log(m[0]);
  console.log('---');
}
