const fs = require('fs');

let bundle = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// Ensure Step 8 (Rotation Arc Indicator which drew an errant dashed circle inside the base) is removed
const p8Start = bundle.indexOf('// ─── 8. Rotation Arc Indicator');
if (p8Start !== -1) {
  const p9Start = bundle.indexOf('// ─── 9. Sleek Unified Top Header Bar', p8Start);
  if (p9Start !== -1) {
    const sec8Content = bundle.substring(p8Start, p9Start);
    if (sec8Content.includes('arcRadius') || sec8Content.includes('setLineDash')) {
      bundle = bundle.replace(sec8Content, '  // ─── 8. Rotation Arc Indicator (Removed - erroneous dashed circle) ───\n\n');
      fs.writeFileSync('dist/assets/index-D9JME9Hm.js', bundle, 'utf8');
      console.log('✓ Successfully removed errant Step 8 rotation arc indicator!');
    } else {
      console.log('Step 8 is already cleanly removed.');
    }
  }
} else {
  console.log('Step 8 not found, already removed.');
}
