const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// Find volume drawing function
// It typically checks item.type === 'volume' or item.expr
const p = 1430689;
const startFunc = js.lastIndexOf('function', p - 20000);
console.log('Search start around:', p);

// Let's find all ctx.lineWidth and ctx.font between p - 30000 and p + 70000
const rangeStart = p - 25000;
const rangeEnd = p + 60000;
const sub = js.slice(rangeStart, rangeEnd);

const fontRegex = /ctx\.font\s*=\s*([^;]+);/g;
let match;
const fonts = new Set();
while ((match = fontRegex.exec(sub)) !== null) {
  fonts.add(match[1].trim());
}
console.log('Fonts in volume renderer:', Array.from(fonts));

const lwRegex = /ctx\.lineWidth\s*=\s*([^;]+);/g;
const lws = new Set();
while ((match = lwRegex.exec(sub)) !== null) {
  lws.add(match[1].trim());
}
console.log('LineWidths in volume renderer:', Array.from(lws));
