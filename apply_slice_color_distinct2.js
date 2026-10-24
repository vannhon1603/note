/**
 * Update showSlice (Lát dx cylinder) to amber-orange color.
 * The front face opacity in the bundle is 0.55 not 0.50, and the radius line is #1d4ed8.
 */
const fs = require('fs');
const filePath = 'dist/assets/index-D9JME9Hm.js';
let code = fs.readFileSync(filePath, 'utf8');

function replaceOrDie(old, neo, desc) {
  if (!code.includes(old)) {
    console.error('NOT FOUND:', desc);
    process.exit(1);
  }
  code = code.replace(old, neo);
  console.log('✓', desc);
}

// 1. Lateral band fill
replaceOrDie(
  `Draw lateral band - unified sapphire crystal glass
      for (let ai = 0; ai < _nSliceAng; ai++) {
        ctx.beginPath();
        ctx.moveTo(pts1[ai].sx, pts1[ai].sy);
        ctx.lineTo(pts1[ai + 1].sx, pts1[ai + 1].sy);
        ctx.lineTo(pts2[ai + 1].sx, pts2[ai + 1].sy);
        ctx.lineTo(pts2[ai].sx, pts2[ai].sy);
        ctx.closePath();
        ctx.fillStyle = "rgba(191, 219, 254, 0.45)";
        ctx.fill();
      }

      // Front Face
      const pCenter = project(midX, 0, 0);
      ctx.beginPath();
      ctx.moveTo(pCenter.sx, pCenter.sy);
      for (let ai = 0; ai <= _nSliceAng; ai++) ctx.lineTo(pts2[ai].sx, pts2[ai].sy);
      ctx.closePath();
      ctx.fillStyle = "rgba(147, 197, 253, 0.55)";
      ctx.fill();

      // Rim outline (chuẩn nét liền sư phạm cho hình trụ vi phân nhìn thấy)
      ctx.beginPath();
      ctx.moveTo(pts2[0].sx, pts2[0].sy);
      for (let ai = 1; ai <= _nSliceAng; ai++) ctx.lineTo(pts2[ai].sx, pts2[ai].sy);
      if (curSweep >= Math.PI * 2 * 0.98) ctx.closePath();
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // Bán kính r = f(x) từ tâm trục Ox đến đỉnh đồ thị
      const pEdge = project(midX, sR, 0);
      ctx.beginPath();
      ctx.moveTo(pCenter.sx, pCenter.sy);
      ctx.lineTo(pEdge.sx, pEdge.sy);
      ctx.strokeStyle = "#1d4ed8";
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Điểm tâm và điểm trên đường cong
      ctx.fillStyle = "#1d4ed8";
      ctx.beginPath(); ctx.arc(pCenter.sx, pCenter.sy, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(pEdge.sx, pEdge.sy, 3.2, 0, Math.PI * 2); ctx.fill();

      // Nhãn r = f(x) và độ dày dx
      ctx.font = "italic bold 12px 'Times New Roman', serif";
      ctx.fillStyle = "#1e40af";`,
  `Draw lateral band - amber slice (distinct from blue solid)
      for (let ai = 0; ai < _nSliceAng; ai++) {
        ctx.beginPath();
        ctx.moveTo(pts1[ai].sx, pts1[ai].sy);
        ctx.lineTo(pts1[ai + 1].sx, pts1[ai + 1].sy);
        ctx.lineTo(pts2[ai + 1].sx, pts2[ai + 1].sy);
        ctx.lineTo(pts2[ai].sx, pts2[ai].sy);
        ctx.closePath();
        ctx.fillStyle = "rgba(254, 215, 170, 0.45)";
        ctx.fill();
      }

      // Front Face
      const pCenter = project(midX, 0, 0);
      ctx.beginPath();
      ctx.moveTo(pCenter.sx, pCenter.sy);
      for (let ai = 0; ai <= _nSliceAng; ai++) ctx.lineTo(pts2[ai].sx, pts2[ai].sy);
      ctx.closePath();
      ctx.fillStyle = "rgba(251, 146, 60, 0.55)";
      ctx.fill();

      // Rim outline (chuẩn nét liền sư phạm cho hình trụ vi phân nhìn thấy)
      ctx.beginPath();
      ctx.moveTo(pts2[0].sx, pts2[0].sy);
      for (let ai = 1; ai <= _nSliceAng; ai++) ctx.lineTo(pts2[ai].sx, pts2[ai].sy);
      if (curSweep >= Math.PI * 2 * 0.98) ctx.closePath();
      ctx.strokeStyle = "#f97316";
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // Bán kính r = f(x) từ tâm trục Ox đến đỉnh đồ thị
      const pEdge = project(midX, sR, 0);
      ctx.beginPath();
      ctx.moveTo(pCenter.sx, pCenter.sy);
      ctx.lineTo(pEdge.sx, pEdge.sy);
      ctx.strokeStyle = "#ea580c";
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Điểm tâm và điểm trên đường cong
      ctx.fillStyle = "#ea580c";
      ctx.beginPath(); ctx.arc(pCenter.sx, pCenter.sy, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(pEdge.sx, pEdge.sy, 3.2, 0, Math.PI * 2); ctx.fill();

      // Nhãn r = f(x) và độ dày dx
      ctx.font = "italic bold 12px 'Times New Roman', serif";
      ctx.fillStyle = "#c2410c";`,
  'showSlice Ox lateral band, front face, rim, radius line, dots, label - amber'
);

// 2. dV badge (was blue rgba(37,99,235,..))
replaceOrDie(
  `ctx.fillStyle = "rgba(37, 99, 235, 0.95)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pBadgeX - bW / 2, pBadgeY - 9, bW, 18, 5);
      else ctx.rect(pBadgeX - bW / 2, pBadgeY - 9, bW, 18);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(dVText, pBadgeX, pBadgeY);`,
  `ctx.fillStyle = "rgba(249, 115, 22, 0.95)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pBadgeX - bW / 2, pBadgeY - 9, bW, 18, 5);
      else ctx.rect(pBadgeX - bW / 2, pBadgeY - 9, bW, 18);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(dVText, pBadgeX, pBadgeY);`,
  'showSlice dV badge amber'
);

// 3. Oy branch radius line + dots + label (was #1d4ed8)
replaceOrDie(
  `ctx.strokeStyle = "#1d4ed8"; ctx.lineWidth = 1.8; ctx.setLineDash([4, 3]); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#1d4ed8";
      ctx.beginPath(); ctx.arc(pCenter.sx, pCenter.sy, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(pEdge.sx, pEdge.sy, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.font = "italic bold 12px 'Times New Roman', serif";
      ctx.fillStyle = "#1e40af";`,
  `ctx.strokeStyle = "#ea580c"; ctx.lineWidth = 1.8; ctx.setLineDash([4, 3]); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#ea580c";
      ctx.beginPath(); ctx.arc(pCenter.sx, pCenter.sy, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(pEdge.sx, pEdge.sy, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.font = "italic bold 12px 'Times New Roman', serif";
      ctx.fillStyle = "#c2410c";`,
  'showSlice Oy branch radius line+dots+label amber'
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('\nDone – showSlice cylinder is now amber.');
