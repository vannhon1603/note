const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('dist/assets/index-D9JME9Hm.js');
const backupFile = path.resolve('dist/assets/index-D9JME9Hm.js.bak_before_preset_color_match');

// Create backup
fs.copyFileSync(targetFile, backupFile);
console.log('✓ Created backup:', backupFile);

let code = fs.readFileSync(targetFile, 'utf8');

function replaceOrThrow(target, replacement, desc) {
  if (!code.includes(target)) {
    throw new Error('Target string not found for: ' + desc);
  }
  code = code.replace(target, replacement);
  console.log('✓ Successfully replaced:', desc);
}

// 1. Badge "Không thể xoay" trong Dialog "✨ Hình mẫu có sẵn:"
// Cập nhật màu giống với "Có thể xoay": nền xanh #dbeafe, chữ xanh #1d4ed8, viền #bfdbfe
const targetBadgeColor = 'background:isRotatable?"#dbeafe":"#fef3c7",color:isRotatable?"#1d4ed8":"#b45309",border:isRotatable?"1px solid #bfdbfe":"1px solid #fde68a"';
const replBadgeColor = 'background:"#dbeafe",color:"#1d4ed8",border:"1px solid #bfdbfe"';
replaceOrThrow(targetBadgeColor, replBadgeColor, 'Preset badge color unified to match rotatable');

// 2. Viền top header bar trên 3D canvas khi hiển thị khối mặt cắt (không thể xoay)
// Chuyển từ màu đỏ rgba(225, 29, 72, 0.40) sang cùng màu xanh rgba(59, 130, 246, 0.3) như khối tròn xoay
const targetHeaderStroke = 'ctx.strokeStyle = isCross ? "rgba(225, 29, 72, 0.40)" : "rgba(59, 130, 246, 0.3)";';
const replHeaderStroke = 'ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";';
replaceOrThrow(targetHeaderStroke, replHeaderStroke, '3D header bar stroke unified blue');

// 3. Shadow tay cầm kéo mặt cắt (cut handle) trên khối không thể xoay
// Chuyển từ màu đỏ rgba(225, 29, 72, 0.45) sang màu hổ phách vàng rgba(245, 158, 11, 0.35) đồng bộ với tay cầm lát cắt tròn xoay
const targetHandleShadow = 'ctx.shadowColor = "rgba(225, 29, 72, 0.45)";';
const replHandleShadow = 'ctx.shadowColor = "rgba(245, 158, 11, 0.35)";';
replaceOrThrow(targetHandleShadow, replHandleShadow, 'Cut handle shadow color unified');

fs.writeFileSync(targetFile, code, 'utf8');
console.log('✓ Saved updated file:', targetFile);
