const fs = require('fs');

const file = 'dist/assets/index-D9JME9Hm.js';
fs.copyFileSync(file, file + '.bak_axis_labels');
console.log('✓ Backup created.');

let js = fs.readFileSync(file, 'utf8');

// 1. Target 1: Axis labels "x (Ox)", "y (Oy)", "z (Oz)"
const target1 = `  // Nhãn các trục x, y, z chuẩn ký hiệu SGK Toán
  ctx.font = "italic bold 13.5px 'Times New Roman', serif";
  ctx.fillStyle = colOx;
  ctx.textAlign = uOxX >= 0 ? "left" : "right";
  ctx.textBaseline = "middle";
  ctx.fillText("x (Ox)", oxEnd.sx + uOxX * 16, oxEnd.sy + uOxY * 16);

  ctx.fillStyle = colOy;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  const _lblY = Math.max(y + topH + 13, oyEnd.sy + uOyY * 12);
  ctx.fillText("y (Oy)", oyEnd.sx + uOyX * 12, _lblY);

  if (isCross) {
    ctx.fillStyle = colOz;
    ctx.textAlign = uOzX >= 0 ? "left" : "right";
    ctx.textBaseline = "top";
    ctx.fillText("z (Oz)", ozEnd.sx + uOzX * 14, ozEnd.sy + uOzY * 14);
  }`;

const repl1 = `  // Nhãn các trục x, y, z chuẩn ký hiệu SGK Toán
  ctx.font = "italic bold 14px 'Times New Roman', serif";
  ctx.fillStyle = colOx;
  ctx.textAlign = uOxX >= 0 ? "left" : "right";
  ctx.textBaseline = "middle";
  ctx.fillText("x", oxEnd.sx + uOxX * 14, oxEnd.sy + uOxY * 14);

  ctx.fillStyle = colOy;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  const _lblY = Math.max(y + topH + 13, oyEnd.sy + uOyY * 10);
  ctx.fillText("y", oyEnd.sx + uOyX * 10, _lblY);

  if (isCross) {
    ctx.fillStyle = colOz;
    ctx.textAlign = uOzX >= 0 ? "left" : "right";
    ctx.textBaseline = "top";
    ctx.fillText("z", ozEnd.sx + uOzX * 14, ozEnd.sy + uOzY * 14);
  }`;

if (!js.includes(target1)) {
  console.error('Target 1 (axis labels) not found!');
  process.exit(1);
}

js = js.replace(target1, repl1);
console.log('✓ Updated axis labels: x (Ox) -> x, y (Oy) -> y, z (Oz) -> z');

// 2. Target 2: Curve label "y = f(x)" collision
const target2 = `    // Ở góc nhìn 2D ban đầu (hoặc góc quay nhỏ), hiển thị nhãn đường cong y = f(x)
    if (isInitial2D) {
      const peakX = (na + nb) / 2;
      const peakY = f1(peakX);
      const pPeak = isRevOy ? project(peakY, peakX, 0) : project(peakX, peakY, 0);
      ctx.font = "italic bold 13px 'Times New Roman', serif";
      ctx.fillStyle = "#1e40af";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText("y = f(x)", pPeak.sx, pPeak.sy - 5);
    }`;

const repl2 = `    // Ở góc nhìn 2D ban đầu (hoặc góc quay nhỏ), hiển thị nhãn đường cong y = f(x)
    if (isInitial2D) {
      // Đặt nhãn trên sườn đường cong để tránh đè lên trục tung Oy và mũi tên đỉnh
      let lblX = (na + nb) / 2;
      if (Math.abs(lblX) < 0.45 * Math.max(1, (nb - na) / 2)) {
        lblX = na + (nb - na) * 0.72;
      }
      const lblY = f1(lblX);
      const pCurveLbl = isRevOy ? project(lblY, lblX, 0) : project(lblX, lblY, 0);
      ctx.font = "italic bold 13px 'Times New Roman', serif";
      ctx.fillStyle = "#1e40af";
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillText("y = f(x)", pCurveLbl.sx + 8, pCurveLbl.sy - 6);
    }`;

if (!js.includes(target2)) {
  console.error('Target 2 (curve label) not found!');
  process.exit(1);
}

js = js.replace(target2, repl2);
console.log('✓ Updated curve label position: placed on curve shoulder to avoid overlap.');

fs.writeFileSync(file, js, 'utf8');
console.log('✓ Successfully wrote to dist/assets/index-D9JME9Hm.js');
