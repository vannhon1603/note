const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const targets = ['"x (Ox)"', '"y (Oy)"', '"z (Oz)"', 'x (Ox)', 'y (Oy)', 'z (Oz)'];
for (const t of targets) {
  let idx = 0;
  while ((idx = js.indexOf(t, idx)) !== -1) {
    console.log(`Found "${t}" at ${idx}:`, js.slice(idx - 40, idx + 60));
    idx += t.length;
  }
}
