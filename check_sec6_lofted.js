const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sIdx = js.indexOf('// ══════ Cross-Section Slicing Plane');
if (sIdx !== -1) {
  console.log('--- FOUND CROSS SECTION SLICING PLANE AT', sIdx, '---');
  console.log(js.slice(sIdx, sIdx + 2500));
} else {
  console.log('Not found by exact comment, let us search for getCrossSectionShape');
  let p = js.indexOf('// ─── 6.');
  const p2 = js.indexOf('getCrossSectionShape', p);
  console.log(js.slice(p2 - 200, p2 + 2500));
}
