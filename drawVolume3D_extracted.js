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

    // Pre-sample function values along x axis (N+1 points) with Chebyshev/Cosine spacing
    // clusters points near endpoints for silky smooth curvature (eliminates kinks at x=a,b)
    const xs = new Float64Array(N + 1);
    const f1s = new Float64Array(N + 1);
    const f2s = new Float64Array(N + 1);
    for (let si = 0; si <= N; si++) {
      const u = si / N;
      const xv = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u * Math.PI);
      xs[si] = xv;
      f1s[si] = f1(xv);
      f2s[si] = f2(xv);
    }

    // Pre-sample trigonometric values for all angles
    const cosTh = new Float64Array(nAng + 1);
    const sinTh = new Float64Array(nAng + 1);
    for (let ai = 0; ai <= nAng; ai++) {
      const th = (ai / nAng) * sweepRad;
      cosTh[ai] = Math.cos(th);
      sinTh[ai] = Math.sin(th);
    }

    for (let ai = 0; ai < nAng; ai++) {
      const th0 = (ai / nAng) * sweepRad;
      const th1 = ((ai + 1) / nAng) * sweepRad;
      const thMid = (th0 + th1) / 2;

      for (let si = 0; si < N; si++) {
        const x0 = xs[si], x1 = xs[si + 1];
        const ro0 = isRevOx ? Math.max(Math.abs(f1s[si]), Math.abs(f2s[si])) : f1s[si];
        const ro1 = isRevOx ? Math.max(Math.abs(f1s[si + 1]), Math.abs(f2s[si + 1])) : f1s[si + 1];
        const ri0 = isRevOx ? Math.min(Math.abs(f1s[si]), Math.abs(f2s[si])) : f2s[si];
        const ri1 = isRevOx ? Math.min(Math.abs(f1s[si + 1]), Math.abs(f2s[si + 1])) : f2s[si + 1];

        const c0 = cosTh[ai], s0 = sinTh[ai];
        const c1 = cosTh[ai + 1], s1 = sinTh[ai + 1];

        const pt00 = isRevOx ? { X: x0, Y: ro0 * c0, Z: ro0 * s0 } : { X: x0 * c0, Y: ro0, Z: x0 * s0 };
        const pt10 = isRevOx ? { X: x1, Y: ro1 * c0, Z: ro1 * s0 } : { X: x1 * c0, Y: ro1, Z: x1 * s0 };
        const pt11 = isRevOx ? { X: x1, Y: ro1 * c1, Z: ro1 * s1 } : { X: x1 * c1, Y: ro1, Z: x1 * s1 };
        const pt01 = isRevOx ? { X: x0, Y: ro0 * c1, Z: ro0 * s1 } : { X: x0 * c1, Y: ro0, Z: x0 * s1 };

        const s00 = project(pt00.X, pt00.Y, pt00.Z);
        const s10 = project(pt10.X, pt10.Y, pt10.Z);
        const s11 = project(pt11.X, pt11.Y, pt11.Z);
        const s01 = project(pt01.X, pt01.Y, pt01.Z);

        const zAvg = (s00.z + s10.z + s11.z + s01.z) / 4;
        const cosAng = Math.cos(thMid), sinAng = Math.sin(thMid);
        
        // ── High-Contrast 3D Shader: Balanced lighting, rich shadows, no white glare ──
        const dxVal = x1 - x0;
        const drVal = ro1 - ro0;
        const slopeR = Math.abs(dxVal) > 1e-5 ? (drVal / dxVal) : 0;
        const normLen = Math.sqrt(slopeR * slopeR + 1);
        const normWorldX = isRevOx ? (-slopeR / normLen) : (cosAng / normLen);
        const normWorldY = isRevOx ? (cosAng / normLen) : (-slopeR / normLen);
        const normWorldZ = sinAng / normLen;

        // Transform normal to camera space
        const nx1 = normWorldX * Math.cos(yaw) + normWorldZ * Math.sin(yaw);
        const nz1 = -normWorldX * Math.sin(yaw) + normWorldZ * Math.cos(yaw);
        const ny1 = normWorldY * Math.cos(pitch) - nz1 * Math.sin(pitch);
        const nz2 = normWorldY * Math.sin(pitch) + nz1 * Math.cos(pitch);

        // Fresnel term: glancing angle edge definition
        const rim = Math.pow(Math.max(0, Math.min(1, 1 - Math.abs(nz2))), 1.5);

        // Diffuse key light with deeper shadow falloff (high contrast)
        const light = Math.max(0.18, Math.min(1.0, 0.52 + 0.38 * cosAng - 0.20 * sinAng));

        // Specular highlight: focused & subtle (exponent 24 prevents blinding milky white glare)
        const ndotH = Math.max(0, -0.22 * nx1 + 0.46 * ny1 - 0.86 * nz2);
        const spec = Math.pow(ndotH, 24);

        // High-contrast, crystal-clear 3D shading: rich shadows, vibrant sapphire midtones, soft highlights (no white glare)
        const sat = Math.round(82 + 10 * light - 14 * spec);
        const litLightness = Math.round(38 + 26 * light + 10 * spec);
        const faceHue = Math.round(hue - 5 * rim);

        // Optimal transparency: high contrast without dense murkiness
        const glassAlpha = isSecRev
          ? (0.20 + 0.22 * rim)
          : (0.26 + 0.26 * rim);

        // Subtle, elegant contour stroke (eliminates white glare while preserving smooth crystal form)
        const strokeColor = "hsla(" + faceHue + ",85%,32%," + (isFastMode ? "0.08" : (0.08 + 0.16 * rim).toFixed(3)) + ")";

        faces.push({
          z: zAvg,
          pts: [s00, s10, s11, s01],
          fill: "hsla(" + faceHue + "," + sat + "%," + litLightness + "%," + glassAlpha.toFixed(3) + ")",
          stroke: null,
          strokeWidth: 0,
          type: "outer"
        });

        if (ri0 > 0.001 || ri1 > 0.001) {
          const ipt00 = isRevOx ? { X: x0, Y: ri0 * c0, Z: ri0 * s0 } : { X: x0 * c0, Y: ri0, Z: x0 * s0 };
          const ipt10 = isRevOx ? { X: x1, Y: ri1 * c0, Z: ri1 * s0 } : { X: x1 * c0, Y: ri1, Z: x1 * s0 };
          const ipt11 = isRevOx ? { X: x1, Y: ri1 * c1, Z: ri1 * s1 } : { X: x1 * c1, Y: ri1, Z: x1 * s1 };
          const ipt01 = isRevOx ? { X: x0, Y: ri0 * c1, Z: ri0 * s1 } : { X: x0 * c1, Y: ri0, Z: x0 * s1 };

          const is00 = project(ipt00.X, ipt00.Y, ipt00.Z);
          const is10 = project(ipt10.X, ipt10.Y, ipt10.Z);
          const is11 = project(ipt11.X, ipt11.Y, ipt11.Z);
          const is01 = project(ipt01.X, ipt01.Y, ipt01.Z);

          const izAvg = (is00.z + is10.z + is11.z + is01.z) / 4;

          faces.push({
            z: izAvg,
            pts: [is00, is10, is11, is01],
            fill: "hsla(" + hue + ",55%,42%,0.42)",
            stroke: null,
            strokeWidth: 0,
            type: "inner"
          });
        }
      }
    }

    if (sweepDeg < 359) {
      const capAngles = sweepDeg <= 0.5 ? [0] : [0, sweepRad];
      const NCap = isFastMode ? Math.max(64, N) : Math.max(160, N * 2);
      for (const thCap of capAngles) {
        const ptsCap = [];
        let capZ = 0;
        for (let si = 0; si <= NCap; si++) {
          const u = si / NCap;
          const xv = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u * Math.PI);
          const p = isRevOx
            ? project(xv, f1(xv) * Math.cos(thCap), f1(xv) * Math.sin(thCap))
            : project(xv * Math.cos(thCap), f1(xv), xv * Math.sin(thCap));
          ptsCap.push(p);
          capZ += p.z;
        }
        for (let si = NCap; si >= 0; si--) {
          const u = si / NCap;
          const xv = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u * Math.PI);
          const p = isRevOx
            ? project(xv, f2(xv) * Math.cos(thCap), f2(xv) * Math.sin(thCap))
            : project(xv * Math.cos(thCap), f2(xv), xv * Math.sin(thCap));
          ptsCap.push(p);
          capZ += p.z;
        }
        // Dynamic normal calculation for cap to determine front vs back visibility when camera rotates
        const normZ_cap = isRevOx
          ? (thCap === 0
              ? -Math.cos(yaw) * Math.cos(pitch)
              : (-Math.sin(thCap) * Math.sin(pitch) + Math.cos(thCap) * Math.cos(yaw) * Math.cos(pitch)))
          : (thCap === 0
              ? Math.sin(yaw)
              : (-Math.sin(thCap) * Math.cos(yaw) + Math.cos(thCap) * Math.sin(yaw)));
        const isBackCap = false; // Cap profile arches are always solid visible contours in SGK
        faces.push({
          z: capZ / ptsCap.length,
          pts: ptsCap,
          fill: thCap === 0 ? "rgba(191, 219, 254, 0.40)" : "rgba(191, 219, 254, 0.45)",
          stroke: thCap === 0 ? "rgba(29, 78, 216, 0.92)" : "rgba(37, 99, 235, 0.92)",
          strokeWidth: 1.8,
          type: "cap",
          dashed: false,
          nArch: NCap,
          hasInner: Boolean(expr2 && expr2.trim() && !(fn2raw instanceof Error))
        });
        if (thCap > 0 && ptsCap.length > 0) {
          const midPt = ptsCap[Math.floor(NCap / 2)] || ptsCap[0];
          item._rotHandle = { x: midPt.sx - x, y: midPt.sy - y };
        }
      }
    }
  } else {
    // ══════ CROSS-SECTION SOLID (Square, Tri, Semicircle, Circle, etc.) ══════
    // Unified crystalline educational Sapphire Blue palette across all 3D spatial solids
    const hue = 214;

    // 1. Base floor in X-Y plane (Z = 0)
    const basePts = [];
    let baseZ = 0;
    const NBase = isFastMode ? Math.max(48, N) : Math.max(120, N * 2);
    for (let si = 0; si <= NBase; si++) {
      const u = si / NBase;
      const xv = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u * Math.PI);
      const p = project(xv, f1(xv), 0);
      basePts.push(p);
      baseZ += p.z;
    }
    for (let si = NBase; si >= 0; si--) {
      const u = si / NBase;
      const xv = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u * Math.PI);
      const p = project(xv, f2(xv), 0);
      basePts.push(p);
      baseZ += p.z;
    }
    faces.push({
      z: baseZ / basePts.length - 100,
      pts: basePts,
      fill: "rgba(37, 99, 235, 0.12)",
      stroke: "rgba(37, 99, 235, 0.75)",
      strokeWidth: 1.6,
      type: "floor"
    });

    if (showRiemann) {
      // ── Stepped Riemann Prismatic Slices ──
      const nSteps = Math.min(14, Math.max(6, Math.round(N / 2)));
      for (let si = 0; si < nSteps; si++) {
        const xA = na + (nb - na) * si / nSteps;
        const xB = na + (nb - na) * (si + 1) / nSteps;
        const xM = (xA + xB) / 2;
        const bW = Math.abs(f1(xM) - f2(xM));
        if (bW < 0.001) continue;
        const yM = (f1(xM) + f2(xM)) / 2;
        const shape = getCrossSectionShape(currentAxis, bW);

        const frontPts = shape.map(pt => project(xB, yM + pt.u, pt.v));
        const backPts = shape.map(pt => project(xA, yM + pt.u, pt.v));
        const zMid = frontPts.reduce((acc, p) => acc + p.z, 0) / frontPts.length;

        for (let k = 0; k < shape.length; k++) {
          const kn = (k + 1) % shape.length;
          const quadPts = [backPts[k], frontPts[k], frontPts[kn], backPts[kn]];
          const qz = (backPts[k].z + frontPts[k].z + frontPts[kn].z + backPts[kn].z) / 4;
          faces.push({
            z: qz,
            pts: quadPts,
            fill: "hsla(" + hue + ",75%,72%,0.45)",
            stroke: "hsla(" + hue + ",80%,40%,0.5)",
            type: "riemann-side"
          });
        }
        faces.push({
          z: zMid,
          pts: frontPts,
          fill: "hsla(" + hue + ",85%,68%,0.55)",
          stroke: "hsla(" + hue + ",85%,35%,0.75)",
          strokeWidth: 1.2,
          type: "riemann-face"
        });
      }
    } else {
      // ── Continuous Lofted 3D Solid (PBR Glass Shader matching solids of revolution) ──
      for (let si = 0; si < N; si++) {
        const u0 = si / N, u1 = (si + 1) / N;
        const x0 = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u0 * Math.PI);
        const x1 = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u1 * Math.PI);

        const w0 = Math.abs(f1(x0) - f2(x0));
        const w1 = Math.abs(f1(x1) - f2(x1));
        const ym0 = (f1(x0) + f2(x0)) / 2;
        const ym1 = (f1(x1) + f2(x1)) / 2;

        const shape0 = getCrossSectionShape(currentAxis, w0);
        const shape1 = getCrossSectionShape(currentAxis, w1);

        for (let k = 0; k < shape0.length; k++) {
          const kn = (k + 1) % shape0.length;

          const p00 = project(x0, ym0 + shape0[k].u, shape0[k].v);
          const p10 = project(x1, ym1 + shape1[k].u, shape1[k].v);
          const p11 = project(x1, ym1 + shape1[kn].u, shape1[kn].v);
          const p01 = project(x0, ym0 + shape0[kn].u, shape0[kn].v);

          const zAvg = (p00.z + p10.z + p11.z + p01.z) / 4;

          // Compute quad normal in 3D world coordinates
          const v1x = x1 - x0, v1y = (ym1 + shape1[k].u) - (ym0 + shape0[k].u), v1z = shape1[k].v - shape0[k].v;
          const v2x = 0, v2y = shape0[kn].u - shape0[k].u, v2z = shape0[kn].v - shape0[k].v;
          let qnx = v1y * v2z - v1z * v2y;
          let qny = -v1x * v2z;
          let qnz = v1x * v2y;
          const qlen = Math.hypot(qnx, qny, qnz) || 1;
          qnx /= qlen; qny /= qlen; qnz /= qlen;

          const midU = (shape0[k].u + shape0[kn].u) / 2;
          const midV = (shape0[k].v + shape0[kn].v) / 2;
          if (qny * midU + qnz * midV < 0) {
            qnx = -qnx; qny = -qny; qnz = -qnz;
          }

          // Camera rotated normal (identical to revolution solid)
          const nx1 = qnx * Math.cos(yaw) + qnz * Math.sin(yaw);
          const nz1 = -qnx * Math.sin(yaw) + qnz * Math.cos(yaw);
          const ny1 = qny * Math.cos(pitch) - nz1 * Math.sin(pitch);
          const nz2 = qny * Math.sin(pitch) + nz1 * Math.cos(pitch);

          const rim = Math.pow(Math.max(0, Math.min(1, 1 - Math.abs(nz2))), 1.5);
          const light = Math.max(0.18, Math.min(1.0, 0.52 + 0.38 * nx1 - 0.20 * ny1));
          const ndotH = Math.max(0, -0.22 * nx1 + 0.46 * ny1 - 0.86 * nz2);
          const spec = Math.pow(ndotH, 24);

          const sat = Math.round(82 + 10 * light - 14 * spec);
          const litLightness = Math.round(38 + 26 * light + 10 * spec);
          const faceHue = Math.round(hue - 5 * rim);
          const glassAlpha = 0.26 + 0.26 * rim;

          faces.push({
            z: zAvg,
            pts: [p00, p10, p11, p01],
            fill: "hsla(" + faceHue + "," + sat + "%," + litLightness + "%," + glassAlpha.toFixed(3) + ")",
            stroke: null, // Smooth crystal glass without ugly cage stripes, identical to solids of revolution
            strokeWidth: 0,
            type: "loft"
          });
        }
      }

      // End caps at a and b (matching revolution caps)
      for (const capX of [na, nb]) {
        const cw = Math.abs(f1(capX) - f2(capX));
        if (cw > 0.001) {
          const cym = (f1(capX) + f2(capX)) / 2;
          const cshape = getCrossSectionShape(currentAxis, cw);
          const cpts = cshape.map(pt => project(capX, cym + pt.u, pt.v));
          const cz = cpts.reduce((acc, p) => acc + p.z, 0) / cpts.length;
          faces.push({
            z: cz,
            pts: cpts,
            fill: "rgba(191, 219, 254, 0.40)",
            stroke: "rgba(29, 78, 216, 0.92)",
            strokeWidth: 1.8,
            type: "loft-cap"
          });
        }
      }
    }
  }

  // ─── 4. Painter's Algorithm: Sort faces back to front ────────────
  faces.sort((p1, p2) => p1.z - p2.z);

  for (const face of faces) {
    const pts = face.pts;
    if (!pts || pts.length < 3) continue;
    ctx.beginPath();
    ctx.moveTo(pts[0].sx, pts[0].sy);
    for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k].sx, pts[k].sy);
    ctx.closePath();
    ctx.fillStyle = face.fill;
    ctx.fill();
    if (face.stroke && (!isFastMode || face.type === "cap" || face.type === "riemann-face")) {
      ctx.save();
      if (face.dashed) {
        ctx.setLineDash([5, 4]); // Nét đứt cho mặt khuất!
      }
      ctx.strokeStyle = face.stroke;
      ctx.lineWidth = face.strokeWidth || 0.4;
      if (face.type === "cap" && face.nArch) {
        // Stroke only the curved arch of the cap, so the dashed rotation axis inside [a, b] is preserved!
        ctx.beginPath();
        ctx.moveTo(pts[0].sx, pts[0].sy);
        for (let k = 1; k <= face.nArch; k++) ctx.lineTo(pts[k].sx, pts[k].sy);
        ctx.stroke();
        if (face.hasInner && pts.length > face.nArch * 2) {
          ctx.beginPath();
          ctx.moveTo(pts[face.nArch + 1].sx, pts[face.nArch + 1].sy);
          for (let k = face.nArch + 2; k < pts.length; k++) ctx.lineTo(pts[k].sx, pts[k].sy);
          ctx.stroke();
        }
      } else {
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // ─── 4c. Longitudinal Ridge Outlines for Translating Solids ───
  if (!isRev && isCross) {
    const wMid = Math.abs(f1((na + nb) / 2) - f2((na + nb) / 2));
    const testShape = getCrossSectionShape(currentAxis, wMid);
    if (testShape.length <= 8) {
      ctx.save();
      for (let k = 0; k < testShape.length; k++) {
        if (testShape[k].v > 0.02) {
          ctx.beginPath();
          const nRidge = isFastMode ? 32 : 80;
          for (let si = 0; si <= nRidge; si++) {
            const u = si / nRidge;
            const xv = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u * Math.PI);
            const wv = Math.abs(f1(xv) - f2(xv));
            const ymv = (f1(xv) + f2(xv)) / 2;
            const sh = getCrossSectionShape(currentAxis, wv);
            if (sh[k]) {
              const p = project(xv, ymv + sh[k].u, sh[k].v);
              if (si === 0) ctx.moveTo(p.sx, p.sy);
              else ctx.lineTo(p.sx, p.sy);
            }
          }
          ctx.strokeStyle = "rgba(29, 78, 216, 0.90)";
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  // ─── 4b. Draw Revolution Circles & Arcs (Front = Solid, Hidden = Dashed) ───
  if (isRev && (sweepDeg > 5 || isCross)) {
    const isRevY = currentAxis === "oy" || currentAxis === "sec-oy";
    const curSweepRad = (sweepDeg >= 355 || isCross) ? Math.PI * 2 : sweepRad;
    const isFullRev = (sweepDeg >= 355 || isCross);

    // Helper to draw a circular arc/circle with visible part = solid, hidden part = dashed
    const drawRevolutionArc = (coord, rOuter, strokeCol) => {
      if (rOuter <= 0.05) return;
      const nSteps = isFastMode ? Math.max(48, Math.min(96, Math.round(N * 1.2))) : Math.max(72, Math.min(180, Math.round(N * 2)));

      // Determine if this base plane points towards the camera
      // 1. Swept arc [0, curSweepRad]
      let curVis = null;
      let curPts = [];
      for (let i = 0; i <= nSteps; i++) {
        const phi = (i / nSteps) * curSweepRad;
        const cosA = Math.cos(phi), sinA = Math.sin(phi);
        const pt = isRevY ? project(rOuter * cosA, coord, rOuter * sinA) : project(coord, rOuter * cosA, rOuter * sinA);

        const normX = isRevY ? cosA : 0;
        const normY = isRevY ? 0 : cosA;
        const normZ = sinA;
        const nx1 = normX * Math.cos(yaw) + normZ * Math.sin(yaw);
        const nz1 = -normX * Math.sin(yaw) + normZ * Math.cos(yaw);
        const ny1 = normY * Math.cos(pitch) - nz1 * Math.sin(pitch);
        const nz2 = normY * Math.sin(pitch) + nz1 * Math.cos(pitch);

        // Convention SGK: phần nhìn thấy là mặt ở nửa trước camera (nz2 >= 0),
        // phần bị che khuất phải vẽ nét đứt.
        const isVis = nz2 >= 0;

        if (curVis === null) {
          curVis = isVis;
          curPts.push(pt);
        } else if (isVis === curVis) {
          curPts.push(pt);
        } else {
          curPts.push(pt);
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(curPts[0].sx, curPts[0].sy);
          for (let k = 1; k < curPts.length; k++) ctx.lineTo(curPts[k].sx, curPts[k].sy);
          ctx.strokeStyle = strokeCol;
          ctx.lineWidth = 1.6;
          if (!curVis) ctx.setLineDash([5, 4]); // NÉT ĐỨT CHO PHẦN KHUẤT!
          ctx.stroke();
          ctx.restore();
          curVis = isVis;
          curPts = [pt];
        }
      }
      if (curPts.length > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(curPts[0].sx, curPts[0].sy);
        for (let k = 1; k < curPts.length; k++) ctx.lineTo(curPts[k].sx, curPts[k].sy);
        ctx.strokeStyle = strokeCol;
        ctx.lineWidth = 1.6;
        if (!curVis) ctx.setLineDash([5, 4]); // NÉT ĐỨT CHO PHẦN KHUẤT!
        ctx.stroke();
        ctx.restore();
      }

      // 2. Un-swept ghost trajectory [curSweepRad, 2*PI] if not full circle
      if (!isFullRev) {
        const nGhost = isFastMode ? Math.max(24, Math.round(48 * (1 - sweepDeg / 360))) : Math.max(48, Math.round(96 * (1 - sweepDeg / 360)));
        const ghostPts = [];
        for (let gi = 0; gi <= nGhost; gi++) {
          const phi = curSweepRad + (gi / nGhost) * (Math.PI * 2 - curSweepRad);
          const cosA = Math.cos(phi), sinA = Math.sin(phi);
          const pt = isRevY ? project(rOuter * cosA, coord, rOuter * sinA) : project(coord, rOuter * cosA, rOuter * sinA);
          ghostPts.push(pt);
        }
        if (ghostPts.length > 1) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(ghostPts[0].sx, ghostPts[0].sy);
          for (let k = 1; k < ghostPts.length; k++) ctx.lineTo(ghostPts[k].sx, ghostPts[k].sy);
          ctx.strokeStyle = "rgba(100, 116, 139, 0.65)";
          ctx.lineWidth = 1.3;
          ctx.setLineDash([4, 3]); // NÉT ĐỨT!
          ctx.stroke();
          ctx.restore();
        }
      }
    };

    const circCol = isRevY ? "rgba(4, 120, 87, 0.90)" : "rgba(29, 78, 216, 0.90)";

    // A. Base circle at na
    const ra = Math.max(Math.abs(f1(na)), Math.abs(f2(na)));
    if (ra > 0.08) drawRevolutionArc(na, ra, circCol);

    // B. Base circle at nb
    const rb = Math.max(Math.abs(f1(nb)), Math.abs(f2(nb)));
    if (rb > 0.08) drawRevolutionArc(nb, rb, circCol);

    // C. Equator / Maximum radius circle (chuẩn hình học không gian SGK Toán 12, hỗ trợ mọi góc quay)
    let rMax = 0, xMax = na;
    for (let si = 0; si <= 40; si++) {
      const xv = na + (nb - na) * (si / 40);
      const rv = Math.max(Math.abs(f1(xv)), Math.abs(f2(xv)));
      if (rv > rMax) { rMax = rv; xMax = xv; }
    }
    // Equator circle omitted to keep 3D solid surface clean and smooth without artificial cuts
  }

  // ─── 5. Draw 2D Boundary Curves in Base & Permanent (H) Reference Sheet ──
  if (!isSecRev) {
    const isInitial2D = !isRev || sweepDeg <= 5;
    const N2D = isFastMode ? 48 : 120;

    // A. Fill miền phẳng (H) trong mặt phẳng Oxy để học sinh luôn thấy hình phẳng gốc sinh ra khối 3D
    ctx.save();
    ctx.beginPath();
    // Đường cong f1
    for (let si = 0; si <= N2D; si++) {
      const u = si / N2D;
      const xv = na + (nb - na) * u;
      const rv = f1(xv);
      const p = isRevOy ? project(rv, xv, 0) : project(xv, rv, 0);
      if (si === 0) ctx.moveTo(p.sx, p.sy);
      else ctx.lineTo(p.sx, p.sy);
    }
    // Đường cong f2 hoặc trục
    const hasF2 = expr2 && expr2.trim() && !(fn2raw instanceof Error) && fn2raw;
    for (let si = N2D; si >= 0; si--) {
      const u = si / N2D;
      const xv = na + (nb - na) * u;
      const rv = hasF2 ? f2(xv) : 0;
      const p = isRevOy ? project(rv, xv, 0) : project(xv, rv, 0);
      ctx.lineTo(p.sx, p.sy);
    }
    ctx.closePath();
    ctx.fillStyle = isInitial2D ? "rgba(37, 99, 235, 0.14)" : "rgba(37, 99, 235, 0.06)";
    ctx.fill();
    ctx.restore();

    // B. Đường cong hàm số chính y = f(x)
    ctx.save();
    ctx.beginPath();
    for (let si = 0; si <= N2D; si++) {
      const u = si / N2D;
      const xv = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u * Math.PI);
      const rv = f1(xv);
      const p = isRevOy ? project(rv, xv, 0) : project(xv, rv, 0);
      if (si === 0) ctx.moveTo(p.sx, p.sy);
      else ctx.lineTo(p.sx, p.sy);
    }
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2.2;
    if (isInitial2D) {
      ctx.stroke();
    }
    ctx.restore();

    // C. Đường giới hạn phụ y = g(x) nếu có
    if (hasF2) {
      ctx.save();
      ctx.beginPath();
      for (let si = 0; si <= N2D; si++) {
        const u = si / N2D;
        const xv = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u * Math.PI);
        const rv = f2(xv);
        const p = isRevOy ? project(rv, xv, 0) : project(xv, rv, 0);
        if (si === 0) ctx.moveTo(p.sx, p.sy);
        else ctx.lineTo(p.sx, p.sy);
      }
      ctx.strokeStyle = isInitial2D ? "#dc2626" : "rgba(220, 38, 38, 0.65)";
      ctx.lineWidth = isInitial2D ? 2.0 : 1.4;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.restore();
    }

    // D. Huy hiệu ký hiệu miền phẳng (H) (tự động né lát cắt vi phân nếu trùng tâm)
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
    }
    ctx.restore();
  }

  // ─── 6. INTERACTIVE CUTTING PLANE & CROSS-SECTION AT activeCutX ──
  if (isCross) {
    ctx.save();
    if (isSecRev) {
      // ══════ Slicing Plane & Circular Cross Section for Revolved Solid ══════
      const isRevY = currentAxis === "sec-oy";
      const cutCoord = activeCutX;
      const R1 = Math.abs(f1(cutCoord));
      const R2 = Math.abs(f2(cutCoord));
      const Ro = Math.max(R1, R2);
      const Ri = Math.min(R1, R2);
      const cutArea = Math.PI * (Ro * Ro - Ri * Ri);

      // ── 1. Semi-transparent cutting plane sheet (P) ⊥ axis ──
      const pExtent = Math.max(boundR * 1.35, Ro * 1.3, 1.2);
      const planeSheet = isRevY ? [
        project(-pExtent, cutCoord, -pExtent),
        project(pExtent, cutCoord, -pExtent),
        project(pExtent, cutCoord, pExtent),
        project(-pExtent, cutCoord, pExtent)
      ] : [
        project(cutCoord, -pExtent, -pExtent),
        project(cutCoord, pExtent, -pExtent),
        project(cutCoord, pExtent, pExtent),
        project(cutCoord, -pExtent, pExtent)
      ];

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(planeSheet[0].sx, planeSheet[0].sy);
      for (let k = 1; k < planeSheet.length; k++) ctx.lineTo(planeSheet[k].sx, planeSheet[k].sy);
      ctx.closePath();
      ctx.fillStyle = "rgba(241, 245, 249, 0.40)";
      ctx.fill();
      ctx.strokeStyle = "rgba(100, 116, 139, 0.75)";
      ctx.lineWidth = 1.3;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label for cutting plane (P) in top-right corner with upward clearance (clear of solid and S(x))
      const pCorner = planeSheet[2];
      const planeTag = isRevY ? "(P) ⊥ Oy" : "(P) ⊥ Ox";
      ctx.font = "bold 9.5px system-ui, sans-serif";
      const ptw = ctx.measureText(planeTag).width + 8;
      const pCornerX = pCorner.sx + ptw / 2 + 4;
      const pCornerY = pCorner.sy - 12;
      ctx.fillStyle = "rgba(30, 41, 59, 0.88)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pCornerX - ptw / 2, pCornerY - 7.5, ptw, 15, 4);
      else ctx.rect(pCornerX - ptw / 2, pCornerY - 7.5, ptw, 15);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(planeTag, pCornerX, pCornerY);
      ctx.restore();

      // ── 2. Circular / Sector Cross-Section at cutCoord (Correct for all sweep angles) ──
      if (Ro > 0.001) {
        const isFullRev = sweepDeg >= 355 || isCross;
        const curSweepRad = isFullRev ? Math.PI * 2 : sweepRad;
        const sweepFrac = isFullRev ? 1 : (sweepDeg / 360);
        const cutArea = sweepFrac * Math.PI * (Ro * Ro - Ri * Ri);

        const pCenter = isRevY ? project(0, cutCoord, 0) : project(cutCoord, 0, 0);

        const nCirclePts = Math.max(32, Math.min(180, Math.round(N * (curSweepRad / (Math.PI * 2)) * 1.5)));

        // 1. Points along outer arc from phi = 0 to phi = curSweepRad
        const outerArc = [];
        for (let ci = 0; ci <= nCirclePts; ci++) {
          const ang = (ci / nCirclePts) * curSweepRad;
          const p = isRevY
            ? project(Ro * Math.cos(ang), cutCoord, Ro * Math.sin(ang))
            : project(cutCoord, Ro * Math.cos(ang), Ro * Math.sin(ang));
          outerArc.push(p);
        }

        // 2. Closed slice boundary polygon
        const slicePoly = [];
        let innerCircle = null;

        if (isFullRev) {
          for (let k = 0; k < outerArc.length; k++) slicePoly.push(outerArc[k]);
          if (Ri > 0.001) {
            innerCircle = [];
            for (let ci = nCirclePts; ci >= 0; ci--) {
              const ang = (ci / nCirclePts) * Math.PI * 2;
              const p = isRevY
                ? project(Ri * Math.cos(ang), cutCoord, Ri * Math.sin(ang))
                : project(cutCoord, Ri * Math.cos(ang), Ri * Math.sin(ang));
              innerCircle.push(p);
            }
          }
        } else {
          // Sector polygon vertices: outer arc -> line to inner rim/center -> inner arc (reverse) -> close
          for (let k = 0; k <= nCirclePts; k++) slicePoly.push(outerArc[k]);
          if (Ri > 0.001) {
            for (let ci = nCirclePts; ci >= 0; ci--) {
              const ang = (ci / nCirclePts) * curSweepRad;
              const p = isRevY
                ? project(Ri * Math.cos(ang), cutCoord, Ri * Math.sin(ang))
                : project(cutCoord, Ri * Math.cos(ang), Ri * Math.sin(ang));
              slicePoly.push(p);
            }
          } else {
            slicePoly.push(pCenter);
          }
        }

        // Find APEX on outer arc: for sector (<355°), anchor firmly at outerArc[0] (phi=0); for full rev, find top-most point
        let apexIdx = 0;
        if (isFullRev) {
          for (let ci = 1; ci < outerArc.length; ci++) {
            if (outerArc[ci].sy < outerArc[apexIdx].sy) {
              apexIdx = ci;
            }
          }
        }
        const topPt = outerArc[apexIdx];

        // 3. Draw Un-swept Ghost Trajectory Guide (360° circle dashed outline) if sweepDeg < 355
        if (!isFullRev && sweepDeg < 355) {
          const ghostArc = [];
          const nGhost = Math.max(16, Math.round(48 * (1 - sweepDeg / 360)));
          for (let gi = 0; gi <= nGhost; gi++) {
            const ang = curSweepRad + (gi / nGhost) * (Math.PI * 2 - curSweepRad);
            const p = isRevY
              ? project(Ro * Math.cos(ang), cutCoord, Ro * Math.sin(ang))
              : project(cutCoord, Ro * Math.cos(ang), Ro * Math.sin(ang));
            ghostArc.push(p);
          }
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(ghostArc[0].sx, ghostArc[0].sy);
          for (let k = 1; k < ghostArc.length; k++) ctx.lineTo(ghostArc[k].sx, ghostArc[k].sy);
          ctx.strokeStyle = "rgba(245, 158, 11, 0.65)";
          ctx.lineWidth = 1.4;
          ctx.setLineDash([4, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();

          if (Ri > 0.001) {
            const ghostInnerArc = [];
            for (let gi = 0; gi <= nGhost; gi++) {
              const ang = curSweepRad + (gi / nGhost) * (Math.PI * 2 - curSweepRad);
              const p = isRevY
                ? project(Ri * Math.cos(ang), cutCoord, Ri * Math.sin(ang))
                : project(cutCoord, Ri * Math.cos(ang), Ri * Math.sin(ang));
              ghostInnerArc.push(p);
            }
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(ghostInnerArc[0].sx, ghostInnerArc[0].sy);
            for (let k = 1; k < ghostInnerArc.length; k++) ctx.lineTo(ghostInnerArc[k].sx, ghostInnerArc[k].sy);
            ctx.strokeStyle = "rgba(217, 119, 6, 0.45)";
            ctx.lineWidth = 1.2;
            ctx.setLineDash([3, 2]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
          }
        }

        // 4. Draw Slice / Sector Fill with Gradient + SGK Cross-hatching
        if (slicePoly.length >= 3 && sweepDeg > 3) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(slicePoly[0].sx, slicePoly[0].sy);
          for (let k = 1; k < slicePoly.length; k++) ctx.lineTo(slicePoly[k].sx, slicePoly[k].sy);
          ctx.closePath();

          if (isFullRev && innerCircle) {
            ctx.moveTo(innerCircle[0].sx, innerCircle[0].sy);
            for (let k = 1; k < innerCircle.length; k++) ctx.lineTo(innerCircle[k].sx, innerCircle[k].sy);
            ctx.closePath();
          }

          // Illuminated glowing amber-gold gradient
          const grad = ctx.createLinearGradient(topPt.sx, topPt.sy, pCenter.sx, pCenter.sy + (pCenter.sy - topPt.sy));
          grad.addColorStop(0, "rgba(251, 191, 36, 0.95)");
          grad.addColorStop(1, "rgba(245, 158, 11, 0.92)");
          ctx.fillStyle = grad;
          ctx.fill();

// Smooth clean cross-section (removed diagonal stripes per user request)

          // Crisp golden amber contour border (chuẩn nét liền sư phạm cho lát cắt nhìn thấy)
          if (isFullRev) {
            ctx.beginPath();
            ctx.moveTo(outerArc[0].sx, outerArc[0].sy);
            for (let ci = 1; ci <= nCirclePts; ci++) ctx.lineTo(outerArc[ci].sx, outerArc[ci].sy);
            ctx.closePath();
            ctx.strokeStyle = "#d97706";
            ctx.lineWidth = 2.4;
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.moveTo(slicePoly[0].sx, slicePoly[0].sy);
            for (let k = 1; k < slicePoly.length; k++) ctx.lineTo(slicePoly[k].sx, slicePoly[k].sy);
            ctx.closePath();
            ctx.strokeStyle = "#d97706";
            ctx.lineWidth = 2.4;
            ctx.stroke();
          }

          // Inner border if full washer
          if (isFullRev && innerCircle) {
            ctx.beginPath();
            ctx.moveTo(innerCircle[0].sx, innerCircle[0].sy);
            for (let k = 1; k < innerCircle.length; k++) ctx.lineTo(innerCircle[k].sx, innerCircle[k].sy);
            ctx.closePath();
            ctx.strokeStyle = "#b45309";
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }
          ctx.restore();
        } else if (sweepDeg <= 3) {
          // If not rotated, draw initial 2D segment in Oxy plane
          const pEdge0 = outerArc[0];
          const pInner0 = Ri > 0.001
            ? (isRevY ? project(Ri, cutCoord, 0) : project(cutCoord, Ri, 0))
            : pCenter;
          ctx.beginPath();
          ctx.moveTo(pInner0.sx, pInner0.sy);
          ctx.lineTo(pEdge0.sx, pEdge0.sy);
          ctx.strokeStyle = "#d97706";
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // ── 3. Center point dot ──
        ctx.fillStyle = "#ea580c";
        ctx.beginPath();
        ctx.arc(pCenter.sx, pCenter.sy, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        item._cutHandle = { x: topPt.sx - x, y: topPt.sy - y };

        if (isItemFocused) {
          // Radius label in a sleek offset pill badge
          const rScreenDist = Math.hypot(topPt.sx - pCenter.sx, topPt.sy - pCenter.sy);
          if (rScreenDist >= 26) {
            const rValStr = (Math.round(Ro * 100) / 100);
            const rLabel = "R=" + rValStr;
            ctx.font = "bold 9.5px system-ui, sans-serif";
            const rlw = ctx.measureText(rLabel).width + 8;
            const rMidX = (pCenter.sx + topPt.sx) / 2;
            const rMidY = (pCenter.sy + topPt.sy) / 2;
            const rTagX = rMidX + rlw / 2 + 12;
            const rTagY = rMidY;

            ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(rTagX - rlw / 2, rTagY - 7.5, rlw, 15, 4);
            else ctx.rect(rTagX - rlw / 2, rTagY - 7.5, rlw, 15);
            ctx.fill();
            ctx.strokeStyle = "rgba(245, 158, 11, 0.70)";
            ctx.lineWidth = 1;
            if (ctx.roundRect) ctx.roundRect(rTagX - rlw / 2, rTagY - 7.5, rlw, 15, 4);
            else ctx.rect(rTagX - rlw / 2, rTagY - 7.5, rlw, 15);
            ctx.stroke();
            ctx.fillStyle = "#b45309";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(rLabel, rTagX, rTagY);
          }

          // ── 4. Tactile Drag Handle at topPt (Apex) - Sleek & Compact ──
          ctx.save();
          ctx.shadowColor = "rgba(245, 158, 11, 0.35)";
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(topPt.sx, topPt.sy, 6.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(245, 158, 11, 0.15)";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(topPt.sx, topPt.sy, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.strokeStyle = "#d97706";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(topPt.sx, topPt.sy, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = "#ea580c";
          ctx.fill();
          ctx.restore();

          // ── 5. Floating Formula & Area Badge: S(x) ──
          const xValStr = (Math.round(cutCoord * 10) / 10);
          const areaValStr = (Math.round(cutArea * 100) / 100);
          let badgeText = "";
          if (isFullRev) {
            badgeText = (Ri > 0.001 ? "S(" + xValStr + ") = π(R²-r²) ≈ " : "S(" + xValStr + ") = πR² ≈ ") + areaValStr;
          } else {
            const degStr = Math.round(sweepDeg) + "°";
            badgeText = "S(" + xValStr + ") ≈ " + areaValStr + " (" + degStr + ")";
          }
          
          ctx.font = "bold 10px system-ui, sans-serif";
          const bw = ctx.measureText(badgeText).width + 14;
          const bh = 20;
          const badgeY = Math.max(y + 36, topPt.sy - 24 - bh);
          
          ctx.beginPath();
          ctx.moveTo(topPt.sx, badgeY + bh);
          ctx.lineTo(topPt.sx, topPt.sy - 8.5);
          ctx.strokeStyle = "rgba(217, 119, 6, 0.70)";
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.save();
          ctx.shadowColor = "rgba(15, 23, 42, 0.10)";
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 2;
          ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(topPt.sx - bw / 2, badgeY, bw, bh, 5);
          else ctx.rect(topPt.sx - bw / 2, badgeY, bw, bh);
          ctx.fill();
          ctx.strokeStyle = "rgba(245, 158, 11, 0.75)";
          ctx.lineWidth = 1.2;
          if (ctx.roundRect) ctx.roundRect(topPt.sx - bw / 2, badgeY, bw, bh, 5);
          else ctx.rect(topPt.sx - bw / 2, badgeY, bw, bh);
          ctx.stroke();
          ctx.restore();

          ctx.fillStyle = "#b45309";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(badgeText, topPt.sx, badgeY + bh / 2);
        }
      }

      // ── 6. Coordinate tag on axis ──
      const pCutAxis = isRevY ? project(0, cutCoord, 0) : project(cutCoord, 0, 0);
      if (isItemFocused) {
        ctx.save();
        ctx.fillStyle = "#1d4ed8";
        ctx.beginPath();
        ctx.arc(pCutAxis.sx, pCutAxis.sy, 3.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const axisVar = isRevY ? "y" : "x";
        const axisTag = axisVar + " = " + (Math.round(cutCoord * 10) / 10);
        ctx.font = "bold 9.5px system-ui, sans-serif";
        const atw = ctx.measureText(axisTag).width + 8;
        const atx = pCutAxis.sx + atw / 2 + 8;
        const aty = pCutAxis.sy + 14;

        ctx.beginPath();
        ctx.moveTo(pCutAxis.sx, pCutAxis.sy);
        ctx.lineTo(atx - atw / 2, aty);
        ctx.strokeStyle = "rgba(37, 99, 235, 0.40)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(atx - atw / 2, aty - 7.5, atw, 15, 4);
        else ctx.rect(atx - atw / 2, aty - 7.5, atw, 15);
        ctx.fill();
        ctx.strokeStyle = "rgba(37, 99, 235, 0.35)";
        ctx.lineWidth = 1;
        if (ctx.roundRect) ctx.roundRect(atx - atw / 2, aty - 7.5, atw, 15, 4);
        else ctx.rect(atx - atw / 2, aty - 7.5, atw, 15);
        ctx.stroke();
        ctx.fillStyle = "#b45309";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(axisTag, atx, aty);
        ctx.restore();
      }

      ctx.restore();
    } else {
      // ══════ Slicing Plane & Cross-Section Polygon for Lofted Solids ══════
      const cutW = Math.abs(f1(activeCutX) - f2(activeCutX));
      const cutYm = (f1(activeCutX) + f2(activeCutX)) / 2;
      const cutShape = getCrossSectionShape(currentAxis, cutW);
      const cutArea = computeCrossArea(currentAxis, cutW);

      // ── 1. Semi-transparent cutting plane sheet perpendicular to Ox ──
      const planeH = Math.max(boundR * 1.5, maxVal * 1.3);
      const planeSheet = [
        project(activeCutX, -0.2, -0.2),
        project(activeCutX, maxVal * 1.25, -0.2),
        project(activeCutX, maxVal * 1.25, planeH),
        project(activeCutX, -0.2, planeH)
      ];
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(planeSheet[0].sx, planeSheet[0].sy);
      for (let k = 1; k < planeSheet.length; k++) ctx.lineTo(planeSheet[k].sx, planeSheet[k].sy);
      ctx.closePath();
      ctx.fillStyle = "rgba(241, 245, 249, 0.40)";
      ctx.fill();
      ctx.strokeStyle = "rgba(100, 116, 139, 0.75)";
      ctx.lineWidth = 1.3;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label for cutting plane (P) placed at top-right corner of plane (P) with upward clearance (SGK convention, clear of solid and S(x))
      const pCorner = planeSheet[2];
      const planeTag = "(P) ⊥ Ox";
      ctx.font = "bold 9.5px system-ui, sans-serif";
      const ptw = ctx.measureText(planeTag).width + 8;
      const pCornerX = pCorner.sx + ptw / 2 + 4;
      const pCornerY = pCorner.sy - 12;
      ctx.fillStyle = "rgba(30, 41, 59, 0.88)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pCornerX - ptw / 2, pCornerY - 7.5, ptw, 15, 4);
      else ctx.rect(pCornerX - ptw / 2, pCornerY - 7.5, ptw, 15);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(planeTag, pCornerX, pCornerY);
      ctx.restore();

      // ── 2. Highlighted Cut Polygon with Hatching ──
      if (cutW > 0.001) {
        const cutPts = cutShape.map(pt => project(activeCutX, cutYm + pt.u, pt.v));
        
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cutPts[0].sx, cutPts[0].sy);
        for (let k = 1; k < cutPts.length; k++) ctx.lineTo(cutPts[k].sx, cutPts[k].sy);
        ctx.closePath();

        // Find TRUE APEX of the polygon on screen (minimum sy)
        let topPt = cutPts[0];
        for (let k = 1; k < cutPts.length; k++) {
          if (cutPts[k].sy < topPt.sy) topPt = cutPts[k];
        }

        const pBase0 = project(activeCutX, f2(activeCutX), 0);
        const pBase1 = project(activeCutX, f1(activeCutX), 0);
        const pMidBase = { sx: (pBase0.sx + pBase1.sx) / 2, sy: (pBase0.sy + pBase1.sy) / 2 };

        const grad = ctx.createLinearGradient(topPt.sx, topPt.sy, pMidBase.sx, pMidBase.sy);
        grad.addColorStop(0, "rgba(251, 191, 36, 0.95)");
        grad.addColorStop(1, "rgba(245, 158, 11, 0.92)");
        ctx.fillStyle = grad;
        ctx.fill();

        // Smooth clean cross-section (removed diagonal stripes per user request)

        // Contour border
        ctx.beginPath();
        ctx.moveTo(cutPts[0].sx, cutPts[0].sy);
        for (let k = 1; k < cutPts.length; k++) ctx.lineTo(cutPts[k].sx, cutPts[k].sy);
        ctx.closePath();
        ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 2.4;
        ctx.stroke();

        // Dimension line along base (đoạn đáy) - unified sapphire blue
        ctx.beginPath();
        ctx.moveTo(pBase0.sx, pBase0.sy);
        ctx.lineTo(pBase1.sx, pBase1.sy);
        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 2.2;
        ctx.stroke();

        item._cutHandle = { x: topPt.sx - x, y: topPt.sy - y };

        if (isItemFocused) {
          // Base label pill: placed OUTSIDE the slice polygon away from centroid (never covers slice face)
          if (cutW >= 0.35) {
            const bLabel = "d=" + (Math.round(cutW * 100) / 100);
            ctx.font = "bold 9.5px system-ui, sans-serif";
            const blw = ctx.measureText(bLabel).width + 8;
            
            // Centroid of cross-section slice on screen
            const cX = cutPts.reduce((s, p) => s + p.sx, 0) / cutPts.length;
            const cY = cutPts.reduce((s, p) => s + p.sy, 0) / cutPts.length;
            let outVx = pMidBase.sx - cX;
            let outVy = pMidBase.sy - cY;
            const outVlen = Math.hypot(outVx, outVy);
            if (outVlen > 2) {
              outVx /= outVlen;
              outVy /= outVlen;
            } else {
              outVx = -1;
              outVy = 0;
            }
            const bTagX = pMidBase.sx + outVx * (blw / 2 + 14);
            const bTagY = pMidBase.sy + outVy * (blw / 2 + 14);

            ctx.beginPath();
            ctx.moveTo(pMidBase.sx, pMidBase.sy);
            ctx.lineTo(bTagX - outVx * (blw / 2), bTagY - outVy * 6);
            ctx.strokeStyle = "rgba(37, 99, 235, 0.40)";
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(bTagX - blw / 2, bTagY - 7.5, blw, 15, 4);
            else ctx.rect(bTagX - blw / 2, bTagY - 7.5, blw, 15);
            ctx.fill();
            ctx.strokeStyle = "rgba(37, 99, 235, 0.40)";
            ctx.lineWidth = 1;
            if (ctx.roundRect) ctx.roundRect(bTagX - blw / 2, bTagY - 7.5, blw, 15, 4);
            else ctx.rect(bTagX - blw / 2, bTagY - 7.5, blw, 15);
            ctx.stroke();
            ctx.fillStyle = "#1e40af";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(bLabel, bTagX, bTagY);
          }

          // ── 3. Tactile Drag Handle at topPt ──
          ctx.save();
          ctx.shadowColor = "rgba(245, 158, 11, 0.35)";
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(topPt.sx, topPt.sy, 7.5, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.strokeStyle = "#d97706";
          ctx.lineWidth = 1.6;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(topPt.sx, topPt.sy, 2.0, 0, Math.PI * 2);
          ctx.fillStyle = "#ea580c";
          ctx.fill();
          ctx.restore();

          // ── 4. Floating Formula & Area Badge ──
          const xValStr = (Math.round(activeCutX * 10) / 10);
          const areaValStr = (Math.round(cutArea * 100) / 100);
          let formPrefix = "";
          if (currentAxis === "sec-square") formPrefix = "S(" + xValStr + ") = d² ≈ ";
          else if (currentAxis === "sec-tri") formPrefix = "S(" + xValStr + ") = (√3/4)d² ≈ ";
          else if (currentAxis === "sec-semi") formPrefix = "S(" + xValStr + ") = (π/8)d² ≈ ";
          else if (currentAxis === "sec-circle") formPrefix = "S(" + xValStr + ") = (π/4)d² ≈ ";
          else if (currentAxis === "sec-tri-right") formPrefix = "S(" + xValStr + ") = ½d² ≈ ";
          else if (currentAxis === "sec-wedge2") formPrefix = "S(" + xValStr + ") = (3π/8 - ½)d² ≈ ";
          else if (currentAxis === "sec-tri-iso") formPrefix = "S(" + xValStr + ") = ¼d² ≈ ";
          else formPrefix = "S(" + xValStr + ") ≈ ";
          const badgeText = formPrefix + areaValStr;

          ctx.font = "bold 10px system-ui, sans-serif";
          const bw = ctx.measureText(badgeText).width + 14;
          const bh = 20;
          const badgeY = Math.max(y + 36, topPt.sy - 24 - bh);

          ctx.beginPath();
          ctx.moveTo(topPt.sx, badgeY + bh);
          ctx.lineTo(topPt.sx, topPt.sy - 8.5);
          ctx.strokeStyle = "rgba(217, 119, 6, 0.70)";
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.save();
          ctx.shadowColor = "rgba(15, 23, 42, 0.10)";
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 2;
          ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
          if (ctx.roundRect) ctx.roundRect(topPt.sx - bw / 2, badgeY, bw, bh, 5);
          else ctx.rect(topPt.sx - bw / 2, badgeY, bw, bh);
          ctx.fill();
          ctx.strokeStyle = "rgba(245, 158, 11, 0.75)";
          ctx.lineWidth = 1.2;
          if (ctx.roundRect) ctx.roundRect(topPt.sx - bw / 2, badgeY, bw, bh, 5);
          else ctx.rect(topPt.sx - bw / 2, badgeY, bw, bh);
          ctx.stroke();
          ctx.restore();

          ctx.fillStyle = "#b45309";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(badgeText, topPt.sx, badgeY + bh / 2);
          ctx.restore();
        }
      }

      // ── 5. Coordinate tag on Ox axis ──
      const pCutOx = project(activeCutX, 0, 0);
      if (isItemFocused) {
        ctx.save();
        ctx.fillStyle = "#1d4ed8";
        ctx.beginPath();
        ctx.arc(pCutOx.sx, pCutOx.sy, 3.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const axisTag = "x = " + (Math.round(activeCutX * 10) / 10);
        ctx.font = "bold 9.5px system-ui, sans-serif";
        const atw = ctx.measureText(axisTag).width + 8;
        const atx = pCutOx.sx + atw / 2 + 8;
        const aty = pCutOx.sy + 14;

        ctx.beginPath();
        ctx.moveTo(pCutOx.sx, pCutOx.sy);
        ctx.lineTo(atx - atw / 2, aty);
        ctx.strokeStyle = "rgba(37, 99, 235, 0.40)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(atx - atw / 2, aty - 7.5, atw, 15, 4);
        else ctx.rect(atx - atw / 2, aty - 7.5, atw, 15);
        ctx.fill();
        ctx.strokeStyle = "rgba(37, 99, 235, 0.40)";
        ctx.lineWidth = 1;
        if (ctx.roundRect) ctx.roundRect(atx - atw / 2, aty - 7.5, atw, 15, 4);
        else ctx.rect(atx - atw / 2, aty - 7.5, atw, 15);
        ctx.stroke();
        ctx.fillStyle = "#1e40af";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(axisTag, atx, aty);
        ctx.restore();
      }

      ctx.restore();
    } // end else
  }

  // ─── 7. Representative Slice dx for Revolutions (Lát cắt vi phân hình trụ chuẩn SGK Toán 12) ──
  if (showSlice && isRev && !isSecRev) {
    const midX = activeCutX;
    const sR = Math.abs(f1(midX));
    const isRevY = currentAxis === "oy";
    const curSweep = sweepDeg >= 355 ? Math.PI * 2 : sweepRad;
    const dxThickness = Math.max(0.06, (nb - na) * 0.04);

    ctx.save();
    if (!isRevY) {
      // ── Hình trụ vi phân mỏng bề dày dx quanh Ox ──
      const x1 = midX - dxThickness / 2;
      const x2 = midX + dxThickness / 2;
      const _nSliceAng = Math.max(36, Math.min(108, Math.round(N * 1.1)));

      // Front & Back faces
      const pts1 = [], pts2 = [];
      for (let ai = 0; ai <= _nSliceAng; ai++) {
        const th = (ai / _nSliceAng) * curSweep;
        pts1.push(project(x1, sR * Math.cos(th), sR * Math.sin(th)));
        pts2.push(project(x2, sR * Math.cos(th), sR * Math.sin(th)));
      }

      // Draw lateral band
      for (let ai = 0; ai < _nSliceAng; ai++) {
        ctx.beginPath();
        ctx.moveTo(pts1[ai].sx, pts1[ai].sy);
        ctx.lineTo(pts1[ai + 1].sx, pts1[ai + 1].sy);
        ctx.lineTo(pts2[ai + 1].sx, pts2[ai + 1].sy);
        ctx.lineTo(pts2[ai].sx, pts2[ai].sy);
        ctx.closePath();
        ctx.fillStyle = "rgba(245, 158, 11, 0.40)";
        ctx.fill();
      }

      // Front Face
      const pCenter = project(midX, 0, 0);
      ctx.beginPath();
      ctx.moveTo(pCenter.sx, pCenter.sy);
      for (let ai = 0; ai <= _nSliceAng; ai++) ctx.lineTo(pts2[ai].sx, pts2[ai].sy);
      ctx.closePath();
      ctx.fillStyle = "rgba(251, 191, 36, 0.50)";
      ctx.fill();

      // Rim outline (chuẩn nét liền sư phạm cho hình trụ vi phân nhìn thấy)
      ctx.beginPath();
      ctx.moveTo(pts2[0].sx, pts2[0].sy);
      for (let ai = 1; ai <= _nSliceAng; ai++) ctx.lineTo(pts2[ai].sx, pts2[ai].sy);
      if (curSweep >= Math.PI * 2 * 0.98) ctx.closePath();
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // Bán kính r = f(x) từ tâm trục Ox đến đỉnh đồ thị
      const pEdge = project(midX, sR, 0);
      ctx.beginPath();
      ctx.moveTo(pCenter.sx, pCenter.sy);
      ctx.lineTo(pEdge.sx, pEdge.sy);
      ctx.strokeStyle = "#b45309";
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Điểm tâm và điểm trên đường cong
      ctx.fillStyle = "#b45309";
      ctx.beginPath(); ctx.arc(pCenter.sx, pCenter.sy, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(pEdge.sx, pEdge.sy, 3.2, 0, Math.PI * 2); ctx.fill();

      // Nhãn r = f(x) và độ dày dx
      ctx.font = "italic bold 12px 'Times New Roman', serif";
      ctx.fillStyle = "#92400e";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("r = f(x)", (pCenter.sx + pEdge.sx) / 2 + 6, (pCenter.sy + pEdge.sy) / 2);

      // Nhãn thể tích vi phân dV (gọn gàng, thoáng đãng, sắc nét)
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
      ctx.fillText(dVText, pBadgeX, pBadgeY);
    } else {
      // Oy rotation slice
      const pCenter = project(0, midX, 0);
      const pEdge = project(sR, midX, 0);
      ctx.beginPath(); ctx.moveTo(pCenter.sx, pCenter.sy); ctx.lineTo(pEdge.sx, pEdge.sy);
      ctx.strokeStyle = "#b45309"; ctx.lineWidth = 1.8; ctx.setLineDash([4, 3]); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#b45309";
      ctx.beginPath(); ctx.arc(pCenter.sx, pCenter.sy, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(pEdge.sx, pEdge.sy, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.font = "italic bold 12px 'Times New Roman', serif";
      ctx.fillStyle = "#92400e";
      ctx.fillText("r = x", (pCenter.sx + pEdge.sx) / 2 + 6, (pCenter.sy + pEdge.sy) / 2);
    }
    ctx.restore();
  }

  // ─── 8. Rotation Arc Indicator (Mũi tên chỉ chiều quay quanh trục chuẩn SGK) ───
  if (isItemFocused && isRev && !isCross && sweepDeg > 5) {
    const isRevY = currentAxis === "oy";
    ctx.save();
    if (!isRevY) {
      // Vòng cung chỉ chiều quay quanh trục Ox
      const rotX = na - 0.45; // Đủ khoảng cách với mốc a và nhãn a
      const rotR = Math.min(1.2, Math.max(0.65, boundR * 0.42));
      const curAng = sweepDeg >= 355 ? Math.PI * 1.6 : sweepRad;
      const arcPts = [];
      const nArc = 36;
      for (let ai = 0; ai <= nArc; ai++) {
        const th = (ai / nArc) * curAng;
        arcPts.push(project(rotX, rotR * Math.cos(th), rotR * Math.sin(th)));
      }
      ctx.beginPath();
      ctx.moveTo(arcPts[0].sx, arcPts[0].sy);
      for (let k = 1; k < arcPts.length; k++) ctx.lineTo(arcPts[k].sx, arcPts[k].sy);
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // Mũi tên ở đầu cung quay
      if (arcPts.length >= 2) {
        const pTip = arcPts[arcPts.length - 1];
        const pPrev = arcPts[arcPts.length - 2];
        const adx = pTip.sx - pPrev.sx, ady = pTip.sy - pPrev.sy;
        const alen = Math.hypot(adx, ady) || 1;
        const aux = adx / alen, auy = ady / alen;
        const anx = -auy, any = aux;
        ctx.fillStyle = "#2563eb";
        ctx.beginPath();
        ctx.moveTo(pTip.sx, pTip.sy);
        ctx.lineTo(pTip.sx - 9 * aux + 4.5 * anx, pTip.sy - 9 * auy + 4.5 * any);
        ctx.lineTo(pTip.sx - 7 * aux, pTip.sy - 7 * auy);
        ctx.lineTo(pTip.sx - 9 * aux - 4.5 * anx, pTip.sy - 9 * auy - 4.5 * any);
        ctx.closePath();
        ctx.fill();
      }

      // Huy hiệu góc quay quanh Ox
      const pMid = arcPts[Math.floor(arcPts.length / 2)];
      ctx.font = "bold 10.5px system-ui, sans-serif";
      const lblRot = "↺ " + Math.round(sweepDeg) + "°";
      const rtw = ctx.measureText(lblRot).width + 8;
      ctx.fillStyle = "rgba(37, 99, 235, 0.92)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pMid.sx - rtw / 2, pMid.sy - 19, rtw, 16, 4);
      else ctx.rect(pMid.sx - rtw / 2, pMid.sy - 19, rtw, 16);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(lblRot, pMid.sx, pMid.sy - 11);
    } else {
      // Vòng cung chỉ chiều quay quanh trục Oy
      const rotY = Math.max(na, 0) + 0.3;
      const rotR = Math.min(1.2, Math.max(0.65, boundR * 0.42));
      const curAng = sweepDeg >= 355 ? Math.PI * 1.6 : sweepRad;
      const arcPts = [];
      const nArc = 36;
      for (let ai = 0; ai <= nArc; ai++) {
        const th = (ai / nArc) * curAng;
        arcPts.push(project(rotR * Math.cos(th), rotY, rotR * Math.sin(th)));
      }
      ctx.beginPath();
      ctx.moveTo(arcPts[0].sx, arcPts[0].sy);
      for (let k = 1; k < arcPts.length; k++) ctx.lineTo(arcPts[k].sx, arcPts[k].sy);
      ctx.strokeStyle = "#059669";
      ctx.lineWidth = 2.0;
      ctx.stroke();

      if (arcPts.length >= 2) {
        const pTip = arcPts[arcPts.length - 1];
        const pPrev = arcPts[arcPts.length - 2];
        const adx = pTip.sx - pPrev.sx, ady = pTip.sy - pPrev.sy;
        const alen = Math.hypot(adx, ady) || 1;
        const aux = adx / alen, auy = ady / alen;
        const anx = -auy, any = aux;
        ctx.fillStyle = "#059669";
        ctx.beginPath();
        ctx.moveTo(pTip.sx, pTip.sy);
        ctx.lineTo(pTip.sx - 9 * aux + 4.5 * anx, pTip.sy - 9 * auy + 4.5 * any);
        ctx.lineTo(pTip.sx - 7 * aux, pTip.sy - 7 * auy);
        ctx.lineTo(pTip.sx - 9 * aux - 4.5 * anx, pTip.sy - 9 * auy - 4.5 * any);
        ctx.closePath();
        ctx.fill();
      }

      const pMid = arcPts[Math.floor(arcPts.length / 2)];
      ctx.font = "bold 10.5px system-ui, sans-serif";
      const lblRot = "↺ " + Math.round(sweepDeg) + "°";
      const rtw = ctx.measureText(lblRot).width + 8;
      ctx.fillStyle = "rgba(5, 150, 105, 0.92)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pMid.sx - rtw / 2, pMid.sy - 19, rtw, 16, 4);
      else ctx.rect(pMid.sx - rtw / 2, pMid.sy - 19, rtw, 16);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(lblRot, pMid.sx, pMid.sy - 11);
    }
    ctx.restore();
  }

  // ─── 9. Sleek Unified Top Header Bar (Tabs, Formula, SGK View) ───
  const hY = y + 7, hH = 30;
  if (isItemFocused) {
    // Elegant frosted glassmorphism container
    ctx.save();
    ctx.beginPath();
    ctx.shadowColor = "rgba(15, 23, 42, 0.08)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.strokeStyle = "rgba(226, 232, 240, 0.95)";
    ctx.lineWidth = 1;
    if (ctx.roundRect) ctx.roundRect(x + 7, hY, w - 14, hH, 8);
    else ctx.rect(x + 7, hY, w - 14, hH);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 1. Move Handle Button (Far-left of top bar: clean slate pill)
    const mBtnW = 78, mBtnH = 24, mBtnY = hY + 3, mBtnX = x + 10;
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(mBtnX, mBtnY, mBtnW, mBtnH, 6);
    else ctx.rect(mBtnX, mBtnY, mBtnW, mBtnH);
    ctx.fillStyle = "rgba(248, 250, 252, 0.95)";
    ctx.strokeStyle = "rgba(226, 232, 240, 0.95)";
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#475569";
    ctx.font = "bold 9.5px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("❖ Di chuyển", mBtnX + mBtnW / 2, mBtnY + mBtnH / 2);
    ctx.restore();

    // 2. Mode Segmented Tabs (Unified pill container)
    const tab1W = Math.min(105, Math.max(75, (w - 110) * 0.20));
    const tab2W = Math.min(115, Math.max(80, (w - 110) * 0.22));
    const tabH = 24, tabY = hY + 3;
    const tab1X = mBtnX + mBtnW + 5, tab2X = tab1X + tab1W + 4;
    const segContainerW = (tab2X + tab2W) - tab1X;

    // Outer segmented pill rail
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(tab1X - 2, tabY - 1, segContainerW + 4, tabH + 2, 7);
    else ctx.rect(tab1X - 2, tabY - 1, segContainerW + 4, tabH + 2);
    ctx.fillStyle = "rgba(241, 245, 249, 0.85)";
    ctx.strokeStyle = "rgba(226, 232, 240, 0.9)";
    ctx.lineWidth = 0.8;
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Tab 1: Quay quanh trục
    const canRotate = !isCross || isSecRev;
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(tab1X, tabY, tab1W, tabH, 5);
    else ctx.rect(tab1X, tabY, tab1W, tabH);
    if (!canRotate) {
      ctx.fillStyle = "rgba(226, 232, 240, 0.5)"; ctx.fill();
      ctx.fillStyle = "#94a3b8"; ctx.font = "bold 9.5px system-ui, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("Quay trục (Khóa)", tab1X + tab1W / 2, tabY + tabH / 2);
    } else if (!isCross) {
      // Active state: Vibrant sapphire gradient with soft glow
      const gradTab = ctx.createLinearGradient(tab1X, tabY, tab1X + tab1W, tabY + tabH);
      gradTab.addColorStop(0, "#2563eb");
      gradTab.addColorStop(1, "#1d4ed8");
      ctx.fillStyle = gradTab;
      ctx.shadowColor = "rgba(37, 99, 235, 0.35)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 1;
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 10px system-ui, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("Quay trục", tab1X + tab1W / 2, tabY + tabH / 2);
    } else {
      ctx.fillStyle = "#64748b"; ctx.font = "600 10px system-ui, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("Quay trục", tab1X + tab1W / 2, tabY + tabH / 2);
    }
    ctx.restore();

    // Tab 2: Lát cắt
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(tab2X, tabY, tab2W, tabH, 5);
    else ctx.rect(tab2X, tabY, tab2W, tabH);
    if (isCross) {
      // Active state: Vibrant ocean sapphire gradient
      const gradTab2 = ctx.createLinearGradient(tab2X, tabY, tab2X + tab2W, tabY + tabH);
      gradTab2.addColorStop(0, "#0284c7");
      gradTab2.addColorStop(1, "#0369a1");
      ctx.fillStyle = gradTab2;
      ctx.shadowColor = "rgba(2, 132, 199, 0.35)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 1;
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 10px system-ui, sans-serif";
    } else {
      ctx.fillStyle = "#64748b"; ctx.font = "600 10px system-ui, sans-serif";
    }
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("Lát cắt", tab2X + tab2W / 2, tabY + tabH / 2);
    ctx.restore();

    // Floating Zoom Controls (+ / -) in 3D viewport
    const _zBoxW = 26, _zBoxH = 50;
    const _zBoxX = x + w - _zBoxW - 10, _zBoxY = y + 44;
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.strokeStyle = "rgba(203, 213, 225, 0.85)";
    ctx.lineWidth = 1;
    ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(_zBoxX, _zBoxY, _zBoxW, _zBoxH, 6);
    else ctx.rect(_zBoxX, _zBoxY, _zBoxW, _zBoxH);
    ctx.fill(); ctx.stroke();
    ctx.shadowColor = "transparent";

    // Divider line between + and -
    ctx.beginPath();
    ctx.moveTo(_zBoxX, _zBoxY + _zBoxH / 2);
    ctx.lineTo(_zBoxX + _zBoxW, _zBoxY + _zBoxH / 2);
    ctx.strokeStyle = "rgba(226, 232, 240, 0.9)";
    ctx.stroke();

    // Plus and Minus symbols
    ctx.fillStyle = "#0f766e";
    ctx.font = "bold 15px system-ui, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("+", _zBoxX + _zBoxW / 2, _zBoxY + _zBoxH / 4);
    ctx.fillText("−", _zBoxX + _zBoxW / 2, _zBoxY + (_zBoxH * 3) / 4);

    // Zoom badge if not 100%
    if (Math.abs(zoomUser - 1.0) > 0.04) {
      const zText = Math.round(zoomUser * 100) + "%";
      ctx.font = "bold 9px system-ui, sans-serif";
      const ztW = ctx.measureText(zText).width + 6;
      ctx.fillStyle = "rgba(15, 118, 110, 0.92)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(_zBoxX + _zBoxW / 2 - ztW / 2, _zBoxY + _zBoxH + 3, ztW, 14, 3);
      else ctx.rect(_zBoxX + _zBoxW / 2 - ztW / 2, _zBoxY + _zBoxH + 3, ztW, 14);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(zText, _zBoxX + _zBoxW / 2, _zBoxY + _zBoxH + 10);
    }
    ctx.restore();

    // 3. View Angle Preset Button (Right side of top bar)
    const _vy = yaw, _vp = pitch;
    let _vName = "";
    if (Math.abs(_vy - 0.44) < 0.08 && Math.abs(_vp - 0.34) < 0.08) _vName = "🎥 Chuẩn SGK ▾";
    else if (Math.abs(_vy) < 0.08 && Math.abs(_vp) < 0.08) _vName = "🎥 Chính diện Oxy ▾";
    else if (axis === "oy" ? (Math.abs(_vy) < 0.12 && _vp > 1.35) : (Math.abs(_vy - 1.57) < 0.12 && Math.abs(_vp) < 0.12)) _vName = axis === "oy" ? "🎥 Dọc trục Oy ▾" : "🎥 Dọc trục Ox ▾";
    else if (Math.abs(_vy) < 0.12 && Math.abs(_vp - 1.45) < 0.12) _vName = "🎥 Từ trên (Oxz) ▾";
    else if (Math.abs(_vy - 0.785) < 0.12 && Math.abs(_vp - 0.52) < 0.12) _vName = "🎥 Nghiêng 45° ▾";
    else _vName = "🔄 Góc xoay (" + Math.round(((yaw % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) * 180 / Math.PI) + "°) ▾";

    const bW = Math.min(130, Math.max(95, (w - 30) * 0.24));
    const bH = 24, bY = hY + 3;
    const bX = x + w - bW - 10;

    ctx.save();
    ctx.fillStyle = "rgba(248, 250, 252, 0.95)";
    ctx.strokeStyle = "rgba(203, 213, 225, 0.85)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bX, bY, bW, bH, 6);
    else ctx.rect(bX, bY, bW, bH);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#334155";
    ctx.font = "bold 9.5px system-ui, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(_vName, bX + bW / 2, bY + bH / 2);
    ctx.restore();

    // 4. Mathematical Formula Capsule (Middle between Tabs and View Button)
    const midLeft = tab2X + tab2W + 10;
    const midRight = bX - 10;
    const midSpace = midRight - midLeft;
    if (midSpace > 75) {
      let formulaShort = "";
      if (currentAxis === "sec-ox") formulaShort = "V = ∫ S(x) dx = π ∫ [f² - g²] dx";
      else if (currentAxis === "sec-oy") formulaShort = "V = ∫ S(y) dy = 2π ∫ x·(f - g) dx";
      else if (isRevOx) formulaShort = (sweepDeg < 355 ? "θ = " + Math.round(sweepDeg) + "° • " : "") + "V = π ∫ [f² - g²] dx";
      else if (isRevOy) formulaShort = (sweepDeg < 355 ? "θ = " + Math.round(sweepDeg) + "° • " : "") + "V = 2π ∫ x·(f - g) dx";
      else if (currentAxis === "sec-square") formulaShort = "V = ∫ S(x) dx = ∫ [f - g]² dx";
      else if (currentAxis === "sec-tri") formulaShort = "V = ∫ S(x) dx = (√3/4) ∫ [f - g]² dx";
      else if (currentAxis === "sec-semi") formulaShort = "V = ∫ S(x) dx = (π/8) ∫ [f - g]² dx";
      else if (currentAxis === "sec-circle") formulaShort = "V = ∫ S(x) dx = (π/4) ∫ [f - g]² dx";
      else formulaShort = "V = ∫ S(x) dx";

      ctx.save();
      ctx.font = "italic bold 11px 'Times New Roman', 'KaTeX_Math', serif";
      let drawF = formulaShort;
      let textW = ctx.measureText(drawF).width;
      if (textW > midSpace - 20) {
        if (isRevOx) drawF = "V = π ∫ y² dx";
        else if (isRevOy) drawF = "V = 2π ∫ x·y dx";
        else drawF = "V = ∫ S(x) dx";
        textW = ctx.measureText(drawF).width;
      }
      
      const pillW = Math.min(midSpace, Math.max(65, textW + 18));
      const pillH = 22;
      const pillX = (midLeft + midRight - pillW) / 2;
      const pillY = hY + (hH - pillH) / 2;
      
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pillX, pillY, pillW, pillH, 11);
      else ctx.rect(pillX, pillY, pillW, pillH);
      ctx.fillStyle = "rgba(239, 246, 255, 0.95)";
      ctx.strokeStyle = "rgba(191, 219, 254, 0.9)";
      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#1d4ed8";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(drawF, pillX + pillW / 2, pillY + pillH / 2);
      ctx.restore();
    }
  } else {
    /* When not focused: do not draw top formula badge per user request */
  }

  // ─── 10. Sleek Bottom Footer Bar (Slider + Volume Result Pill) ─────
  if (isItemFocused) {
    const fY = y + h - 34, fH = 26;
    const effVol = (sweepDeg < 355 && isRev) ? (sweepDeg / 360) * item.volume : item.volume;
    const volDisplay = (item.volume != null && isFinite(item.volume))
      ? ((sweepDeg <= 5 && isRev) ? ("V(0°) = 0 • V_tp ≈ " + (Math.round(item.volume * 100) / 100)) : (sweepDeg < 355 && isRev) ? ("V(" + Math.round(sweepDeg) + "°) ≈ " + (Math.round(effVol * 100) / 100)) : ("V ≈ " + fmtVolume(item.volume)))
      : "";

    const volBadgeW = volDisplay ? 165 : 0;
    if (volDisplay) {
      const volBadgeX = x + w - volBadgeW - 8;

      ctx.save();
      ctx.shadowColor = "rgba(37, 99, 235, 0.12)";
      ctx.shadowBlur = 10; ctx.shadowOffsetY = 2;
      ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
      ctx.strokeStyle = "rgba(37, 99, 235, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(volBadgeX, fY, volBadgeW, fH, 8);
      else ctx.rect(volBadgeX, fY, volBadgeW, fH);
      ctx.fill(); ctx.stroke();
      ctx.restore();

      ctx.fillStyle = "#1e40af";
      ctx.font = "bold 11px system-ui, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(volDisplay, volBadgeX + volBadgeW / 2, fY + fH / 2);
    }

    // Interactive Slider: Exactly synchronized coordinates (tX0 = x+38, tX1 = x+w-228)
    const tX0 = x + 38;
    const tX1 = x + w - (volBadgeW > 0 ? 228 : 38);
    const tW = Math.max(60, tX1 - tX0);
    const tY = fY + fH / 2;

    if (isCross) {
      const knobX = tX0 + ((activeCutX - na) / (nb - na)) * tW;
      ctx.strokeStyle = "rgba(226,232,240,0.95)"; ctx.lineWidth = 3.5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(tX1, tY); ctx.stroke();
      ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(knobX, tY); ctx.stroke();
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(knobX, tY, 6.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.fillStyle = "#2563eb"; ctx.beginPath(); ctx.arc(knobX, tY, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#64748b"; ctx.font = "bold 10px system-ui"; ctx.textAlign = "right"; ctx.fillText("a=" + na, tX0 - 13, tY + 3);
      ctx.textAlign = "left"; ctx.fillText("b=" + nb, tX1 + 13, tY + 3);

      const cTxt = "↔ Trượt mặt cắt x = " + (Math.round(activeCutX * 100) / 100);
      ctx.font = "bold 9.5px system-ui, sans-serif";
      const cW = ctx.measureText(cTxt).width + 16;
      const badgeX = Math.max(tX0 + cW / 2, Math.min(tX1 - cW / 2, knobX));
      const bH1 = 18;
      const bY1 = tY - 30; // Elevated badge: 6px clearance above slider knob (no overlap!)
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.98)";
      ctx.strokeStyle = "rgba(37, 99, 235, 0.45)";
      ctx.lineWidth = 1;
      ctx.shadowColor = "rgba(15, 23, 42, 0.08)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(badgeX - cW / 2, bY1, cW, bH1, 5);
      else ctx.rect(badgeX - cW / 2, bY1, cW, bH1);
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.stroke();

      // Pointer tip pointing down to knob
      ctx.fillStyle = "rgba(255,255,255,0.98)";
      ctx.beginPath();
      ctx.moveTo(badgeX - 3.5, bY1 + bH1);
      ctx.lineTo(badgeX, bY1 + bH1 + 3);
      ctx.lineTo(badgeX + 3.5, bY1 + bH1);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(badgeX - 3.5, bY1 + bH1);
      ctx.lineTo(badgeX, bY1 + bH1 + 3);
      ctx.lineTo(badgeX + 3.5, bY1 + bH1);
      ctx.strokeStyle = "rgba(37, 99, 235, 0.45)";
      ctx.stroke();

      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#1e40af";
      ctx.fillText(cTxt, badgeX, bY1 + bH1 / 2);
      ctx.restore();
    } else {
      const frac = sweepDeg / 360;
      const knobX = tX0 + frac * tW;
      const trCol = "#2563eb"; // Unified theme blue for all rotations
      ctx.strokeStyle = "rgba(226,232,240,0.95)"; ctx.lineWidth = 3.5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(tX1, tY); ctx.stroke();
      ctx.strokeStyle = trCol; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(knobX, tY); ctx.stroke();
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(knobX, tY, 6.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = trCol; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.fillStyle = trCol; ctx.beginPath(); ctx.arc(knobX, tY, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#64748b"; ctx.font = "bold 10px system-ui"; ctx.textAlign = "right"; ctx.fillText("0°", tX0 - 13, tY + 3);
      ctx.textAlign = "left"; ctx.fillText("360°", tX1 + 13, tY + 3);

      const axName = isRevOx ? "Ox" : "Oy";
      const rTxt = "Kéo xoay quanh " + axName + ": θ = " + Math.round(sweepDeg) + "°";
      ctx.font = "bold 9.5px system-ui, sans-serif";
      const rW = ctx.measureText(rTxt).width + 16;
      const badgeX = Math.max(tX0 + rW / 2, Math.min(tX1 - rW / 2, knobX));
      const bH2 = 18;
      const bY2 = tY - 30; // Elevated badge: 6px clearance above slider knob (no overlap!)
      const borderCol = isRevOx ? "rgba(59,130,246,0.55)" : "rgba(16,185,129,0.55)";
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.98)";
      ctx.strokeStyle = borderCol;
      ctx.lineWidth = 1;
      ctx.shadowColor = "rgba(15, 23, 42, 0.08)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(badgeX - rW / 2, bY2, rW, bH2, 5);
      else ctx.rect(badgeX - rW / 2, bY2, rW, bH2);
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.stroke();

      // Pointer tip pointing down to knob
      ctx.fillStyle = "rgba(255,255,255,0.98)";
      ctx.beginPath();
      ctx.moveTo(badgeX - 3.5, bY2 + bH2);
      ctx.lineTo(badgeX, bY2 + bH2 + 3);
      ctx.lineTo(badgeX + 3.5, bY2 + bH2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(badgeX - 3.5, bY2 + bH2);
      ctx.lineTo(badgeX, bY2 + bH2 + 3);
      ctx.lineTo(badgeX + 3.5, bY2 + bH2);
      ctx.strokeStyle = borderCol;
      ctx.stroke();

      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = trCol;
      ctx.fillText(rTxt, badgeX, bY2 + bH2 / 2);
      ctx.restore();

      /* Bottom rotHandle removed per user request */
    }
  }

  /* ─── Pedagogy Overlays (Công thức tính nhanh & Cách giải chi tiết - Kéo thả tự do) ─── */
  item._quickFormulaRect = null;
  item._solutionRect = null;

  if (item.showQuickFormula || item.showSolution) {
    const ped = getPresetPedagogy(
      findPreset(item.presetName, expr, expr2, currentAxis),
      expr, expr2, na, nb, currentAxis, item.volume
    );

    let defaultY = y + 42;
    if (item.showQuickFormula && ped.quickFormula) {
      const titleTxt = "CÔNG THỨC TÍNH NHANH";
      const fTxt = ped.quickFormula;
      const cTxt = ped.quickCalc || "";
      ctx.save();
      ctx.font = "800 8.5px system-ui, sans-serif";
      const w1 = ctx.measureText(titleTxt).width + 16;
      ctx.font = "bold 10.5px system-ui, sans-serif";
      const w2 = ctx.measureText(fTxt).width;
      ctx.font = "9.5px system-ui, sans-serif";
      const w3 = cTxt ? ctx.measureText(cTxt).width : 0;
      const cardW = Math.max(w1, w2, w3, 140) + 24;
      const cardH = cTxt ? 48 : 34;
      const baseCardX = x + w - cardW - 12;
      const baseCardY = defaultY;
      const qfDx = (item.quickFormulaOffset && typeof item.quickFormulaOffset.dx === "number") ? item.quickFormulaOffset.dx : 0;
      const qfDy = (item.quickFormulaOffset && typeof item.quickFormulaOffset.dy === "number") ? item.quickFormulaOffset.dy : 0;
      const cardX = baseCardX + qfDx;
      const cardY = baseCardY + qfDy;
      item._quickFormulaRect = { x: cardX, y: cardY, w: cardW, h: cardH };

      ctx.fillStyle = "rgba(255, 251, 235, 0.96)";
      ctx.strokeStyle = "rgba(245, 158, 11, 0.75)";
      ctx.lineWidth = 1.2;
      ctx.shadowColor = "rgba(180, 83, 9, 0.15)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(cardX, cardY, cardW, cardH, 6);
      else ctx.rect(cardX, cardY, cardW, cardH);
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.stroke();

      // Vector Zap Icon on canvas
      ctx.fillStyle = "#b45309";
      ctx.beginPath();
      const zx = cardX + 8, zy = cardY + 5.5;
      ctx.moveTo(zx + 3.8, zy);
      ctx.lineTo(zx, zy + 5.2);
      ctx.lineTo(zx + 3.2, zy + 5.2);
      ctx.lineTo(zx + 2.2, zy + 9.5);
      ctx.lineTo(zx + 7, zy + 4);
      ctx.lineTo(zx + 3.8, zy + 4);
      ctx.closePath();
      ctx.fill();

      // Drag grip indicator dots (top-right corner of card)
      ctx.fillStyle = "rgba(180, 83, 9, 0.45)";
      const gx = cardX + cardW - 14, gy = cardY + 6.5;
      for (let gr = 0; gr < 2; gr++) {
        for (let gc = 0; gc < 3; gc++) {
          ctx.beginPath();
          ctx.arc(gx + gr * 3.5, gy + gc * 3.5, 1.0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.font = "800 8.5px system-ui, sans-serif";
      ctx.fillStyle = "#b45309";
      ctx.fillText(titleTxt, cardX + 18, cardY + 5);

      ctx.font = "bold 10px system-ui, sans-serif";
      ctx.fillStyle = "#78350f";
      ctx.fillText(fTxt, cardX + 8, cardY + 17);

      if (cTxt) {
        ctx.font = "500 9px system-ui, sans-serif";
        ctx.fillStyle = "#92400e";
        ctx.fillText(cTxt, cardX + 8, cardY + 31);
      }
      ctx.restore();
      defaultY += cardH + 7;
    }

    if (item.showSolution && ped.solutionSteps && ped.solutionSteps.length > 0) {
      const titleTxt = "CÁCH GIẢI CHI TIẾT (TÍCH PHÂN)";
      ctx.save();
      ctx.font = "800 8.5px system-ui, sans-serif";
      let maxLineW = ctx.measureText(titleTxt).width + 16;
      ctx.font = "9.5px system-ui, sans-serif";
      ped.solutionSteps.forEach(st => {
        const lw = ctx.measureText(st).width;
        if (lw > maxLineW) maxLineW = lw;
      });
      const cardW = Math.min(w - 24, Math.max(maxLineW + 24, 160));
      const lineH = 13;
      const cardH = 20 + ped.solutionSteps.length * lineH + 4;
      const baseCardX = x + w - cardW - 12;
      const baseCardY = defaultY;
      const solDx = (item.solutionOffset && typeof item.solutionOffset.dx === "number") ? item.solutionOffset.dx : 0;
      const solDy = (item.solutionOffset && typeof item.solutionOffset.dy === "number") ? item.solutionOffset.dy : 0;
      const cardX = baseCardX + solDx;
      const cardY = baseCardY + solDy;
      item._solutionRect = { x: cardX, y: cardY, w: cardW, h: cardH };

      ctx.fillStyle = "rgba(240, 253, 244, 0.96)";
      ctx.strokeStyle = "rgba(16, 185, 129, 0.75)";
      ctx.lineWidth = 1.2;
      ctx.shadowColor = "rgba(4, 120, 87, 0.15)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(cardX, cardY, cardW, cardH, 6);
      else ctx.rect(cardX, cardY, cardW, cardH);
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.stroke();

      // Vector Document Icon on canvas
      ctx.strokeStyle = "#047857";
      ctx.fillStyle = "#ecfdf5";
      ctx.lineWidth = 1;
      const dx = cardX + 8, dy = cardY + 5.5;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(dx, dy, 7.5, 9.5, 1.5);
      else ctx.rect(dx, dy, 7.5, 9.5);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(dx + 1.8, dy + 3.2); ctx.lineTo(dx + 5.5, dy + 3.2);
      ctx.moveTo(dx + 1.8, dy + 5.8); ctx.lineTo(dx + 5.5, dy + 5.8);
      ctx.stroke();

      // Drag grip indicator dots (top-right corner of card)
      ctx.fillStyle = "rgba(4, 120, 87, 0.45)";
      const gx = cardX + cardW - 14, gy = cardY + 6.5;
      for (let gr = 0; gr < 2; gr++) {
        for (let gc = 0; gc < 3; gc++) {
          ctx.beginPath();
          ctx.arc(gx + gr * 3.5, gy + gc * 3.5, 1.0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.font = "800 8.5px system-ui, sans-serif";
      ctx.fillStyle = "#047857";
      ctx.fillText(titleTxt, cardX + 19, cardY + 5);

      ctx.font = "500 9.5px system-ui, sans-serif";
      ctx.fillStyle = "#065f46";
      ped.solutionSteps.forEach((st, sidx) => {
        ctx.fillText(st, cardX + 8, cardY + 18 + sidx * lineH);
      });
      ctx.restore();
    }
  }

  ctx.restore();
}