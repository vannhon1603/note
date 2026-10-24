/**
 * Fix nét liền/đứt cho vòng tròn ở x=a và x=b của khối xoay
 * 
 * VẤN ĐỀ:
 * - Khi quay < 360°: cung tròn từ phi=0 đến phi=sweepRad luôn nhìn thấy được
 *   nên phải là nét LIỀN hoàn toàn. Code cũ dùng nz2>=0 vẫn có thể vẽ nét đứt
 *   sai trên phần cung này.
 * - Khi quay đủ 360°: nửa trước (nz2>=0) = nét liền, nửa sau (nz2<0) = nét đứt.
 *   Đây là trường hợp đúng.
 *
 * FIX:
 * - Nếu !isFullRev: tất cả cung đều nét LIỀN
 * - Nếu isFullRev: giữ logic nz2>=0
 */

const fs = require('fs');

const file = 'dist/assets/index-D9JME9Hm.js';
let content = fs.readFileSync(file, 'utf8');

// Backup
fs.writeFileSync(file + '.bak_before_arc_fix', content, 'utf8');
console.log('[OK] Backup created');

// Find the drawRevolutionArc function
const fnMarker = '// Helper to draw a circular arc/circle with visible part = solid, hidden part = dashed\n    const drawRevolutionArc = (coord, rOuter, strokeCol) => {';
const fnIdx = content.indexOf(fnMarker);
if (fnIdx < 0) {
  console.error('[ERROR] drawRevolutionArc function not found!');
  process.exit(1);
}
console.log('[OK] Found drawRevolutionArc at:', fnIdx);

// Old isVis logic (wrong for partial revolution)
const oldIsVis = `        // Chúng ta dùng convention SGK: mặt nhìn thấy là nửa trước camera (nz2 >= 0),
        // phần khuất/che phải vẽ nét đứt.
        const isVis = nz2 >= 0;`;

// New isVis logic:
// - For full revolution (360°): front-facing (nz2 >= 0) = solid, back = dashed
// - For partial revolution (< 360°): the swept arc is always VISIBLE (solid)
//   because it forms the visible boundary of the partial solid
const newIsVis = `        // SGK Convention: 
        // - Nếu quay đủ 360°: nửa phía trước camera (nz2 >= 0) = nét liền, nửa sau = nét đứt
        // - Nếu quay < 360°: cung quét luôn nhìn thấy hoàn toàn => nét LIỀN
        const isVis = !isFullRev || nz2 >= 0;`;

if (!content.includes(oldIsVis)) {
  console.error('[ERROR] oldIsVis not found!');
  // Show nearby context to debug
  const nz2Idx = content.indexOf('const isVis = nz2 >= 0;', fnIdx);
  if (nz2Idx > 0) {
    console.log('Found nz2>=0 at:', nz2Idx);
    console.log('Context:', content.substring(nz2Idx - 300, nz2Idx + 100));
  }
  process.exit(1);
}

content = content.replace(oldIsVis, newIsVis);
console.log('[OK] Fixed isVis logic in drawRevolutionArc');

// Also fix the cross-section sweep contour (section 6) - the circular outline of the cut cross-section
// For full revolution: dashed/solid based on nz2
// For partial revolution: solid only (the arc is visible)
// This was already fixed in a previous patch but let's verify

// Check current state of section 6 isVis
const sec6Marker = '// Crisp golden amber contour border (Front = Solid, Hidden = Dashed for full circle)';
const sec6Idx = content.indexOf(sec6Marker);
if (sec6Idx > 0) {
  console.log('[INFO] Section 6 contour marker found at:', sec6Idx);
  console.log('Context:', content.substring(sec6Idx, sec6Idx + 400));
} else {
  console.log('[INFO] Section 6 contour marker NOT found - may already be patched');
}

fs.writeFileSync(file, content, 'utf8');
console.log('[SUCCESS] fix_arc_visibility.js applied!');
