const fs = require('fs');
const content = fs.readFileSync('dump_drawVolume3D_full.js', 'utf8');

console.log('--- ALL ctx.font IN drawVolume3D ---');
let idx = 0;
while ((idx = content.indexOf('ctx.font', idx)) !== -1) {
  const lineEnd = content.indexOf(';', idx);
  console.log(content.slice(idx, lineEnd + 1));
  idx += 8;
}

console.log('\n--- ALL ctx.lineWidth IN drawVolume3D ---');
idx = 0;
while ((idx = content.indexOf('ctx.lineWidth', idx)) !== -1) {
  const lineEnd = content.indexOf(';', idx);
  console.log(content.slice(idx, lineEnd + 1));
  idx += 13;
}
