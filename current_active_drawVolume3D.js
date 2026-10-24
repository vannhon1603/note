drawVolume3D(ctx, item, isFocused) {
  const isItemFocused = Boolean(isFocused || item._dragging || item._forceFocused);
  const strokeScale = Math.max(0.2, Math.min(3.5, item.strokeScale ?? 0.6));
  const labelScale = Math.max(0.5, Math.min(3.0, item.labelScale ?? 1.0));
  const origCtx = ctx;
  ctx = new Proxy(origCtx, {
    get(target, prop) {
      const val = target[prop];
      if (typeof val === 'function') {
        return val.bind(target);
      }
      return val;
    },
    set(target, prop, value) {
      if (prop === 'lineWidth' && typeof value === 'number') {
        target.lineWidth = Math.round(value * strokeScale * 100) / 100;
        return true;
      }
      if (prop === 'font' && typeof value === 'string') {
        target.font = value.replace(/(\d+(?:\.\d+)?)\s*px/g, (m, px) => {
          return (Math.round(parseFloat(px) * labelScale * 10) / 10) + 'px';
        });
        return true;
      }
      target[prop] = value;
      return true;
    }
  });
  const { x, y, w, h, expr, expr2, axis, a, b, nSlices, sweepAngle, viewYaw, viewPitch, showSlice, cutPos, showRiemann } = item;
  const fn = bo(expr);
  if (fn instanceof Error || !expr || !expr.trim()) {
    ctx.save();
    ctx.fillStyle = "#94a3b8";
    ctx.font = Math.min(14, h * 0.08) + "px system-ui, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("Nhập hàm số để biểu diễn 3D", x + w / 2, y + h / 2);
    ctx.restore();
    return;
  }

  const fn2raw = expr2 && expr2.trim() ? bo(expr2) : null;
  const f1 = xv => { const v = fn(xv); return Number.isFinite(v) ? v : 0; };
  const f2 = (fn2raw instanceof Error || !fn2raw) ? (() => 0) : (xv => { const v = fn2raw(xv); return Number.isFinite(v) ? v : 0; });

  const na = typeof a === "number" && isFinite(a) ? a : -2;
  const nb = typeof b === "number" && isFinite(b) ? b : 2;
  if (nb <= na) return;

  const currentAxis = axis || "ox";
  const isRevOx = currentAxis === "ox" || currentAxis === "sec-ox";
  const isRevOy = currentAxis === "oy" || currentAxis === "sec-oy";
  const isRev = isRevOx || isRevOy;
  const isCross = currentAxis.startsWith("sec-");
  const isSecRev = currentAxis === "sec-ox" || currentAxis === "sec-oy";

  const isFastMode = !!(item._playing || item._dragging);
  const userN = nSlices || 48;
  const N = isFastMode ? Math.max(32, Math.min(64, Math.round(userN * 0.8))) : Math.max(64, Math.min(240, Math.round(userN * 2)));
  const sweepDeg = Math.max(0, Math.min(360, sweepAngle != null ? sweepAngle : 0));
  const sweepRad = (sweepDeg * Math.PI) / 180;

  // View angles
  const yaw = viewYaw != null ? viewYaw : 0.44;
  const pitch = viewPitch != null ? viewPitch : 0.34;

  // Active cut position
  const activeCutX = cutPos != null && cutPos >= na && cutPos <= nb ? cutPos : (na + nb) / 2;

  // Find max bounds for scaling
  let maxVal = 0.01;
  for (let i = 0; i <= N * 2; i++) {
    const xv = na + (nb - na) * i / (N * 2);
    const r1 = f1(xv), r2 = f2(xv);
    if (isFinite(r1) && r1 > maxVal) maxVal = r1;
    if (isFinite(r2) && r2 > maxVal) maxVal = r2;
    if (isRevOy && Math.abs(xv) > maxVal) maxVal = Math.abs(xv);
  }
  const xSpan = nb - na;
  const boundR = Math.max(maxVal, xSpan / 2, 0.5);

  // Center & Scale with dedicated top & bottom clearance
  const marginX = w * 0.08;
  const topH = 40, botH = 42;
  const viewH = Math.max(100, h - topH - botH);
  const cx = x + w / 2;
  const cy = y + topH + viewH / 2 + 10;
  const zoomUser = Math.max(0.4, Math.min(3.5, typeof item.zoom3D === "number" ? item.zoom3D : 1.0));
  const projH = Math.max(1, (isRevOx ? boundR * 2.0 : maxVal * 1.25) * Math.cos(pitch) + boundR * 1.15 * Math.sin(pitch));
  const projW = Math.max(1, (isRevOy ? boundR * 2.2 : (xSpan + boundR * 1.1)) * Math.cos(yaw) + boundR * 1.1 * Math.sin(yaw));
  const baseScale = Math.min((w - 2 * marginX) / projW, (viewH * 0.86) / projH);
  const scale = baseScale * zoomUser;

  // Center of rotation in 3D
  const cenX = (na + nb) / 2;
  const cenY = isRevOx ? 0 : boundR * 0.35;
  const cenZ = (isCross && !isSecRev) ? boundR * 0.35 : 0;

  // 3D Projection function: (X, Y, Z) -> { sx, sy, zDepth }
  const project = (X, Y, Z) => {
    const dx = X - cenX;
    const dy = Y - cenY;
    const dz = Z - cenZ;
    // Yaw around Y
    const x1 = dx * Math.cos(yaw) + dz * Math.sin(yaw);
    const z1 = -dx * Math.sin(yaw) + dz * Math.cos(yaw);
    // Pitch around X
    const y1 = dy * Math.cos(pitch) - z1 * Math.sin(pitch);
    const z2 = dy * Math.sin(pitch) + z1 * Math.cos(pitch);
    return {
      sx: cx + x1 * scale,
      sy: cy - y1 * scale,
      z: z2
    };
  };

  ctx.save();

  // ─── 1. Draw Grid floor (X-Z plane) ──────────────────────────────
  ctx.strokeStyle = "rgba(148, 163, 184, 0.28)";
  ctx.lineWidth = 0.75;
  const gMin = Math.min(na - 0.5, -boundR);
  const gMax = Math.max(nb + 0.5, boundR);
  const gStep = Math.max(0.5, (gMax - gMin) / 6);
  for (let gv = gMin; gv <= gMax + 0.01; gv += gStep) {
    const p0 = project(gv, 0, gMin);
    const p1 = project(gv, 0, gMax);
    ctx.beginPath(); ctx.moveTo(p0.sx, p0.sy); ctx.lineTo(p1.sx, p1.sy); ctx.stroke();
    const q0 = project(gMin, 0, gv);
    const q1 = project(gMax, 0, gv);
    ctx.beginPath(); ctx.moveTo(q0.sx, q0.sy); ctx.lineTo(q1.sx, q1.sy); ctx.stroke();
  }

  // ─── 2. Draw Coordinate Axes (Ox, Oy, Oz) chuẩn SGK Toán 12 ───────────────────────────
  const oxStart = project(Math.min(na - 0.8, -0.8), 0, 0);
  const maxOxCoord = Math.min(nb + 0.9, (w / 2 - 28) / (Math.max(0.2, Math.cos(yaw)) * scale) + cenX);
  const oxEnd = project(Math.max(nb + 0.35, maxOxCoord), 0, 0);
  const oyStart = project(0, Math.min(-0.4, -boundR * 0.25), 0);
  const maxOyCoord = Math.min(Math.max(maxVal * 1.14 + 0.3, boundR * 1.14), (viewH * 0.42) / (Math.max(0.2, Math.cos(pitch)) * scale) + cenY);
  const oyEnd = project(0, Math.max(maxVal + 0.35, maxOyCoord), 0);
  const ozStart = project(0, 0, -boundR * 0.95);
  const ozEnd = project(0, 0, boundR * 1.18);
  const pOrigin = project(0, 0, 0);

  // Helper: Draw crisp, elegant math arrowhead (mũi tên trục chuẩn SGK)
  const drawAxisArrow = (pFrom, pTo, color, len = 11, halfW = 4.2) => {
    len = len * Math.max(0.4, Math.min(2.2, strokeScale));
    halfW = halfW * Math.max(0.4, Math.min(2.2, strokeScale));
    const dx = pTo.sx - pFrom.sx, dy = pTo.sy - pFrom.sy;
    const d = Math.hypot(dx, dy) || 1;
    const ux = dx / d, uy = dy / d;
    const nx = -uy, ny = ux;
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(pTo.sx, pTo.sy);
    ctx.lineTo(pTo.sx - len * ux + halfW * nx, pTo.sy - len * uy + halfW * ny);
    ctx.lineTo(pTo.sx - (len * 0.78) * ux, pTo.sy - (len * 0.78) * uy);
    ctx.lineTo(pTo.sx - len * ux - halfW * nx, pTo.sy - len * uy - halfW * ny);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  const colOx = "#1e293b"; // Slate-800: Rõ nét, không lẫn với đồ thị hay mặt khối tròn xoay
  const colOy = "#1e293b";
  const colOz = "#475569";

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // ── Axis Ox ──
  if (isRevOx && (sweepDeg > 5 || isCross) && nb > na) {
    const pa = project(na, 0, 0);
    const pb = project(nb, 0, 0);
    // Before a (outside - solid)
    if (Math.hypot(oxStart.sx - pa.sx, oxStart.sy - pa.sy) > 1) {
      ctx.beginPath(); ctx.moveTo(oxStart.sx, oxStart.sy); ctx.lineTo(pa.sx, pa.sy);
      ctx.strokeStyle = colOx; ctx.lineWidth = 2.0; ctx.stroke();
    }
    // Inside solid [a, b] (hidden part - nét đứt chuẩn SGK không gian)
    ctx.save();
    ctx.beginPath(); ctx.moveTo(pa.sx, pa.sy); ctx.lineTo(pb.sx, pb.sy);
    ctx.strokeStyle = "#475569"; ctx.lineWidth = 1.8;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.restore();
    // After b (outside - solid)
    if (Math.hypot(pb.sx - oxEnd.sx, pb.sy - oxEnd.sy) > 1) {
      ctx.beginPath(); ctx.moveTo(pb.sx, pb.sy); ctx.lineTo(oxEnd.sx, oxEnd.sy);
      ctx.strokeStyle = colOx; ctx.lineWidth = 2.0; ctx.stroke();
    }
  } else {
    ctx.beginPath(); ctx.moveTo(oxStart.sx, oxStart.sy); ctx.lineTo(oxEnd.sx, oxEnd.sy);
    ctx.strokeStyle = colOx;
    ctx.lineWidth = isRevOx || isCross ? 2.0 : 1.4;
    ctx.stroke();
  }
  // Mũi tên trục Ox
  drawAxisArrow(oxStart, oxEnd, colOx, 11, 4.2);

  // ── Axis Oy ──
  if (isRevOy && (sweepDeg > 5 || isCross) && maxVal > 0) {
    const py0 = project(0, Math.min(0, na), 0);
    const py1 = project(0, maxVal, 0);
    // Below solid (outside - solid)
    if (Math.hypot(oyStart.sx - py0.sx, oyStart.sy - py0.sy) > 1) {
      ctx.beginPath(); ctx.moveTo(oyStart.sx, oyStart.sy); ctx.lineTo(py0.sx, py0.sy);
      ctx.strokeStyle = colOy; ctx.lineWidth = 2.0; ctx.stroke();
    }
    // Inside solid (hidden part - nét đứt)
    ctx.save();
    ctx.beginPath(); ctx.moveTo(py0.sx, py0.sy); ctx.lineTo(py1.sx, py1.sy);
    ctx.strokeStyle = colOy; ctx.lineWidth = 1.8;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.restore();
    // Above solid (outside - solid)
    if (Math.hypot(py1.sx - oyEnd.sx, py1.sy - oyEnd.sy) > 1) {
      ctx.beginPath(); ctx.moveTo(py1.sx, py1.sy); ctx.lineTo(oyEnd.sx, oyEnd.sy);
      ctx.strokeStyle = colOy; ctx.lineWidth = 2.0; ctx.stroke();
    }
  } else {
    ctx.beginPath(); ctx.moveTo(oyStart.sx, oyStart.sy); ctx.lineTo(oyEnd.sx, oyEnd.sy);
    ctx.strokeStyle = colOy;
    ctx.lineWidth = isRevOy ? 2.0 : 1.4;
    ctx.stroke();
  }
  // Mũi tên trục Oy
  drawAxisArrow(oyStart, oyEnd, colOy, 11, 4.2);

  // ── Axis Oz (chiều sâu không gian Oxyz) ──
  // Phần âm (nửa trục sau - nét đứt thanh nhã)
  ctx.save();
  ctx.beginPath(); ctx.moveTo(pOrigin.sx, pOrigin.sy); ctx.lineTo(ozStart.sx, ozStart.sy);
  ctx.strokeStyle = isCross ? "rgba(8, 145, 178, 0.45)" : "rgba(148, 163, 184, 0.4)";
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 3]);
  ctx.stroke();
  ctx.restore();

  // Phần dương (hướng về phía trước - nét liền kèm mũi tên)
  ctx.beginPath(); ctx.moveTo(pOrigin.sx, pOrigin.sy); ctx.lineTo(ozEnd.sx, ozEnd.sy);
  ctx.strokeStyle = colOz;
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

  // ─── 3. Construct 3D mesh faces ──────────────────────────────────
  const faces = [];

  if (isRev) {
    // ══════ REVOLUTION SOLID (Ox or Oy) ══════
    const hue = 214; // Unified educational Sapphire Blue for both Ox and Oy revolutions
    const maxAng = isFastMode ? Math.max(32, Math.min(64, Math.round(N * 0.9))) : Math.max(72, Math.min(240, Math.round(N * 1.5)));
    const nAng = sweepDeg <= 0.01 ? 0 : Math.max(18, Math.round(maxAng * (sweepDeg / 360)));

    // Pre-sample 