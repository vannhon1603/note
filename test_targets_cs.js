// Prototype script to verify all math and replacements for Section 6
const fs = require('fs');

const code = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// Verify that all targets can be found
const targetCenZ = 'const cenZ = isCross ? boundR * 0.35 : 0;';
console.log('Found cenZ:', code.includes(targetCenZ));

const targetSec6 = '  // ─── 6. INTERACTIVE CUTTING PLANE & CROSS-SECTION AT activeCutX ──\n  if (isCross) {';
console.log('Found targetSec6:', code.includes(targetSec6));

const targetStep5 = '  // ─── 5. Draw 2D Boundary Curves in Base ───────────────────────────';
console.log('Found targetStep5:', code.includes(targetStep5));
