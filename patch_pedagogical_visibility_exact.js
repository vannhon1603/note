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
            // Chuẩn hình học không gian SGK Toán 12:
            // Khi góc quay vượt quá 180° (mặt xoay nằm ở nửa sau khối, ví dụ 270°, 274°):
            // Mặt xoay nằm khuất phía sau lưng khối vật thể => NÉT ĐỨT (dashed)
            isFaceVisible = sweepDeg <= 180;
          } else {
            // Mặt gốc cố định tại theta = 0: nằm sau khối quay => luôn là NÉT ĐỨT
            isFaceVisible = false;
          }
        }`;

const replacement = `        let isFaceVisible = true;
        if (sweepDeg <= 5) {
          isFaceVisible = true;
        } else if (sweepDeg >= 355) {
          isFaceVisible = false; // Khi xoay kín 360°, thiết diện kinh tuyến nằm trong ruột khối => nét đứt
        } else {
          if (face.isRotatingCap) {
            // Đường mép cắt đang xoay (đường gạch đỏ):
            // - Khi quay ở nửa sau (sweepDeg > 180°, ví dụ 270°, 274°): nằm khuất phía sau thân khối => NÉT ĐỨT
            // - Khi quay ở nửa trước (sweepDeg <= 180°, ví dụ 90°): nhìn thấy trực tiếp => NÉT LIỀN
            isFaceVisible = sweepDeg <= 180;
          } else {
            // Đường đỉnh phẳng (H) tại θ = 0° nhìn thấy trực tiếp ở mép góc mở => NÉT LIỀN
            isFaceVisible = true;
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
console.log('Successfully updated visibility: (H) at theta=0 is SOLID, rotating cap at >180 is DASHED!');
