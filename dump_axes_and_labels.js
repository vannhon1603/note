okeStyle = colOz;
  ctx.lineWidth = isCross ? 1.6 : 1.2;
  ctx.stroke();
  // Mũi tên trục Oz
  drawAxisArrow(pOrigin, ozEnd, colOz, 10, 3.8);

  // Gốc tọa độ O (nếu không bị điểm cắt đè)
  const cutVal = isRev ? (item.cutCoord ?? activeCutX) : activeCutX;
  if (!isCross || Math.abs(cutVal) > 0.35) {
    ctx.save();
    ctx.font = "italic bold 12px 'Times New Roman', serif";
    ctx.fillStyle = "#334155";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("O", pOrigin.sx - 4, pOrigin.sy + 3);
    ctx.restore();
  }

  // ── Nhãn trục (Labels) & Mốc chia đoạn [a, b] ──
  const pa = project(na, 0, 0);
  const pb = project(nb, 0, 0);

  // Hướng trục Ox trên màn hình 2D
  const vOxX = oxEnd.sx - pb.sx, vOxY = oxEnd.sy - pb.sy;
  const vOxLen = Math.hypot(vOxX, vOxY) || 1;
  const uOxX = vOxX / vOxLen, uOxY = vOxY / vOxLen;
  const perpX = -uOxY, perpY = uOxX;

  // Hướng trục Oy
  const vOyX = oyEnd.sx - oyStart.sx, vOyY = oyEnd.sy - oyStart.sy;
  const vOyLen = Math.hypot(vOyX, vOyY) || 1;
  const uOyX = vOyX / vOyLen, uOyY = vOyY / vOyLen;

  // Hướng trục Oz
  const vOzX = ozEnd.sx - pOrigin.sx, vOzY = ozEnd.sy - pOrigin.sy;
  const vOzLen = Math.hypot(vOzX, vOzY) || 1;
  const uOzX = vOzX / vOzLen, uOzY = vOzY / vOzLen;

  // Nhãn các trục x, y, z chuẩn ký hiệu SGK Toán
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
  }

  // Vạch chia & nhãn mốc a, b trên Ox (kèm vạch dóng nét đứt chuẩn SGK Toán 12)
  const hideA = isCross && Math.abs(cutVal - na) < 0.45;
  const hideB = isCross && Math.abs(cutVal - nb) < 0.45;
  ctx.save();
  ctx.font = "bold 11.5px system-ui, sans-serif";
  ctx.fillStyle = "#0f172a";
  ctx.strokeStyle = colOx;
  ctx.lineWidth = 1.6;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Dóng biên nét đứt từ trục Ox lên đồ thị hàm số tại x = a và x = b
  if (isRevOx) {
    const raVal = Math.abs(f1(na));
    if (raVal > 0.05) {
      const pCurveA = project(na, raVal, 0);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pa.sx, pa.sy);
      ctx.lineTo(pCurveA.sx, pCurveA.sy);
      ctx.strokeStyle = "rgba(71, 85, 105, 0.65)";
      ctx.lineWidth = 1.3;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(pCurveA.sx, pCurveA.sy, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = "#2563eb";
      ctx.fill();
      ctx.restore();
    }
    const rbVal = Math.abs(f1(nb));
    if (rbVal > 0.05) {
      const pCurveB = project(nb, rbVal, 0);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pb.sx, pb.sy);
      ctx.lineTo(pCurveB.sx, pCurveB.sy);
      ctx.strokeStyle = "rgba(71, 85, 105, 0.65)";
      ctx.lineWidth = 1.3;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(pCurveB.sx, pCurveB.sy, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = "#2563eb";
      ctx.fill();
      ctx.restore();
    }
  }

  if (!hideA) {
    ctx.beginPath();
    ctx.moveTo(pa.sx - perpX * 4, pa.sy - perpY * 4);
    ctx.lineTo(pa.sx + perpX * 4, pa.sy + perpY * 4);
    ctx.stroke();
    ctx.fillText("a=" + na, pa.sx + perpX * 14, pa.sy + perpY * 14);
  }
  if (!hideB) {
    ctx.beginPath();
    ctx.moveTo(pb.sx - perpX * 4, pb.sy - perpY * 4);
    ctx.lineTo(pb.sx + perpX * 4, pb.sy + perpY * 4);
    ctx.stroke();
    ctx.fillText("b=" + nb, pb.sx + perpX * 14, pb.sy + perpY * 14);
  }
  ctx.restore();

  // ─── 3. Construct 3D mesh faces ──────