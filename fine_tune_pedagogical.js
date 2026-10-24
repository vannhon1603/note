const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('dist/assets/index-D9JME9Hm.js');
let code = fs.readFileSync(targetFile, 'utf8');

console.log('--- Fine-tuning Pedagogical Visuals ---');

// 1. Rotation arc clearance: na - 0.45 instead of na - 0.28
const oldRotX = 'const rotX = na - 0.28;';
const newRotX = 'const rotX = na - 0.45; // Đủ khoảng cách với mốc a và nhãn a';
if (code.includes(oldRotX)) {
  code = code.replace(oldRotX, newRotX);
  console.log('✓ Adjusted rotX clearance');
}

// 2. Collision avoidance for (H) badge when showSlice is active & add y = f(x) curve label
const oldHBadge = `    // D. Huy hiệu ký hiệu miền phẳng (H)
    const midX = (na + nb) / 2;
    const midY = (f1(midX) + (hasF2 ? f2(midX) : 0)) / 2;
    const pH = isRevOy ? project(midY, midX, 0) : project(midX, midY, 0);
    ctx.save();
    ctx.font = isInitial2D ? "italic bold 15px 'Times New Roman', serif" : "italic bold 12px 'Times New Roman', serif";
    ctx.fillStyle = isInitial2D ? "#1e40af" : "rgba(30, 64, 175, 0.70)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("(H)", pH.sx, pH.sy);
    ctx.restore();`;

const newHBadge = `    // D. Huy hiệu ký hiệu miền phẳng (H) (tự động né lát cắt vi phân nếu trùng tâm)
    let hX = (na + nb) / 2;
    if (showSlice && Math.abs(activeCutX - hX) < 0.6) {
      hX = activeCutX >= hX ? hX - 0.55 : hX + 0.55;
    }
    const midY = (f1(hX) + (hasF2 ? f2(hX) : 0)) / 2;
    const pH = isRevOy ? project(midY, hX, 0) : project(hX, midY, 0);
    ctx.save();
    ctx.font = isInitial2D ? "italic bold 15px 'Times New Roman', serif" : "italic bold 12px 'Times New Roman', serif";
    ctx.fillStyle = isInitial2D ? "#1e40af" : "rgba(30, 64, 175, 0.75)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("(H)", pH.sx, pH.sy);

    // Ở góc nhìn 2D ban đầu (hoặc góc quay nhỏ), hiển thị nhãn đường cong y = f(x)
    if (isInitial2D) {
      const peakX = (na + nb) / 2;
      const peakY = f1(peakX);
      const pPeak = isRevOy ? project(peakY, peakX, 0) : project(peakX, peakY, 0);
      ctx.font = "italic bold 13px 'Times New Roman', serif";
      ctx.fillStyle = "#1e40af";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText("y = f(x)", pPeak.sx, pPeak.sy - 5);
    }
    ctx.restore();`;

if (code.includes(oldHBadge)) {
  code = code.replace(oldHBadge, newHBadge);
  console.log('✓ Adjusted (H) collision avoidance and added y = f(x) curve label');
}

// 3. dV badge styling and padding
const oldDVBadge = `      // Nhãn thể tích vi phân dV
      const pBadgeX = pCenter.sx, pBadgeY = pCenter.sy + 22;
      const dVText = "dV ≈ π[f(x)]²dx";
      ctx.font = "bold 10px system-ui, sans-serif";
      const bW = ctx.measureText(dVText).width + 8;
      ctx.fillStyle = "rgba(245, 158, 11, 0.95)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pBadgeX - bW / 2, pBadgeY - 8, bW, 16, 4);
      else ctx.rect(pBadgeX - bW / 2, pBadgeY - 8, bW, 16);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(dVText, pBadgeX, pBadgeY);`;

const newDVBadge = `      // Nhãn thể tích vi phân dV (gọn gàng, thoáng đãng, sắc nét)
      const pBadgeX = pCenter.sx + 24;
      const pBadgeY = pCenter.sy + 26;
      const dVText = "dV ≈ π[f(x)]²dx";
      ctx.font = "bold 10.5px system-ui, sans-serif";
      const bW = ctx.measureText(dVText).width + 12;
      ctx.fillStyle = "rgba(217, 119, 6, 0.95)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pBadgeX - bW / 2, pBadgeY - 9, bW, 18, 5);
      else ctx.rect(pBadgeX - bW / 2, pBadgeY - 9, bW, 18);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(dVText, pBadgeX, pBadgeY);`;

if (code.includes(oldDVBadge)) {
  code = code.replace(oldDVBadge, newDVBadge);
  console.log('✓ Adjusted dV badge styling');
}

fs.writeFileSync(targetFile, code, 'utf8');
console.log('=== Fine-tuning completed ===');
