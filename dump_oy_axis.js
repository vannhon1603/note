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
  ctx.fillText("x 