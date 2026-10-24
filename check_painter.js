const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sIdx = js.indexOf('// ─── 4. Painter\'s Algorithm: Sort faces back to front');
console.log('--- PAINTER ALGORITHM AND SILHOUETTE ---');
console.log(js.slice(sIdx - 600, sIdx + 1200));
