const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sIdx = js.indexOf('const faceHue = Math.round(hue - 5 * rim);');
console.log('--- REVOLUTION LIGHTING AND GLASS SHADING ---');
console.log(js.slice(sIdx - 1000, sIdx + 400));
