const fs = require('fs');

const file = 'dist/assets/index-D9JME9Hm.js';
let content = fs.readFileSync(file, 'utf8');

const target = `        let isFaceVisible = true;
        if (sweepDeg <= 5) {
          isFaceVisible = true;
        } else if (sweepDeg >= 355) {
          isFaceVisible = false; // Khi xoay kín 360°, thiết diện kinh tuyến nằm trong ruột khối => nét đứt
        } else {
          if (face.isRotatingCap) {
            const normZ = isRevOy
              ? getCameraNormalZ(-Math.sin(sweepRad), 0, Math.cos(sweepRad))
              : getCameraNormalZ(0, -Math.sin(sweepRad), Math.cos(sweepRad));
            isFaceVisible = normZ > 0.02;
          } else {
            const normZ = getCameraNormalZ(0, 0, -1);
            isFaceVisible = normZ > 0.02;
          }
        }`;

const replacement = `        let isFaceVisible = true;
        if (sweepDeg <= 5) {
          isFaceVisible = true;
        } else if (sweepDeg >= 355) {
          isFaceVisible = false; // Khi xoay kín 360°, thiết diện kinh tuyến nằm trong ruột khối => nét đứt
        } else {
          if (face.isRotatingCap) {
            // Chuẩn hình học không gian SGK Toán 12:
            // Khi góc quay vượt quá 180° (mặt xoay nằm ở nửa sau khối, ví dụ 270°, 274°):
            // Mặt xoay nằm khuất phía sau lưng khối vật thể => NÉT ĐỨT (dashed)
            isFaceVisible = sweepDeg <= 180;
          } else {
            // Mặt gốc cố định tại theta = 0: nằm sau khối quay => luôn là NÉT ĐỨT
            isFaceVisible = false;
          }
        }`;

const count = content.split(target).length - 1;
console.log('Target count:', count);
if (count !== 1) {
  console.error('Target count is not 1!');
  process.exit(1);
}

content = content.replace(target, replacement);
fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated rotating cap visibility rule for SGK Toán 12 standard!');
