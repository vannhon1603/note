function drawVolume3D(ctx, item) {
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
  const isRevOx = currentAxis === "ox";
  const isRevOy = currentAxis === "oy";
  const isRev = isRevOx || isRevOy;
  const isCross = currentAxis.startsWith("sec-");

  const isFastMode = !!(item._playing || item._dragging);
  const userN = nSlices || 48;
  const N = isFastMode ? Math.max(18, Math.min(42, Math.round(userN * 0.5))) : Math.max(16, Math.min(120, userN));
  const sweepDeg = Math.max(0, Math.min(360, sweepAngle != null ? sweepAngle : 360));
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

  // Center & Scale
  const margin = Math.min(w, h) * 0.12;
  const cx = x + w / 2;
  const cy = y + h / 2 + 8;
  const scale = Math.min((w - 2 * margin) / (xSpan * 1.5 + boundR * 1.5), (h - 2 * margin) / (boundR * 2.5));

  // Center of rotation in 3D
  const cenX = (na + nb) / 2;
  const cenY = isRevOx ? 0 : boundR * 0.35;
  const cenZ = isCross ? boundR * 0.35 : 0;

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

  // ─── 2. Draw Axes (Ox, Oy, Oz) ───────────────────────────────────
  const oxStart = project(Math.min(na - 1, -1), 0, 0);
  const oxEnd = project(nb + 1.2, 0, 0);
  const oyStart = project(0, -0.2, 0);
  const oyEnd = project(0, maxVal * 1.35 + 0.8, 0);
  const ozStart = project(0, 0, -boundR * 1.2);
  const ozEnd = project(0, 0, boundR * 1.35);

  // Ox
  ctx.beginPath(); ctx.moveTo(oxStart.sx, oxStart.sy); ctx.lineTo(oxEnd.sx, oxEnd.sy);
  ctx.strokeStyle = isRevOx || isCross ? "#2563eb" : "#64748b";
  ctx.lineWidth = isRevOx || isCross ? 2.2 : 1.2;
  ctx.stroke();

  // Oy
  ctx.beginPath(); ctx.moveTo(oyStart.sx, oyStart.sy); ctx.lineTo(oyEnd.sx, oyEnd.sy);
  ctx.strokeStyle = isRevOy ? "#059669" : "#64748b";
  ctx.lineWidth = isRevOy ? 2.2 : 1.2;
  ctx.stroke();

  // Oz (depth axis)
  ctx.beginPath(); ctx.moveTo(ozStart.sx, ozStart.sy); ctx.lineTo(ozEnd.sx, ozEnd.sy);
  ctx.strokeStyle = isCross ? "#0891b2" : "#cbd5e1";
  ctx.lineWidth = isCross ? 1.6 : 1;
  ctx.stroke();

  // Axis Labels
  ctx.font = "bold 13px 'Times New Roman', serif";
  ctx.fillStyle = isRevOx || isCross ? "#2563eb" : "#475569";
  ctx.fillText("x (Ox)", oxEnd.sx + 4, oxEnd.sy - 2);
  ctx.fillStyle = isRevOy ? "#059669" : "#475569";
  ctx.fillText("y (Oy)", oyEnd.sx + 4, oyEnd.sy);
  if (isCross) {
    ctx.fillStyle = "#0891b2";
    ctx.fillText("z (Oz)", ozEnd.sx + 4, ozEnd.sy);
  }

  // Bound marks a and b on Ox
  const pa = project(na, 0, 0);
  const pb = project(nb, 0, 0);
  ctx.fillStyle = "#1e293b";
  ctx.font = "11px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("a=" + na, pa.sx, pa.sy + 14);
  ctx.fillText("b=" + nb, pb.sx, pb.sy + 14);

  // ─── 3. Construct 3D mesh faces ──────────────────────────────────
  const faces = [];

  if (isRev) {
    // ══════ REVOLUTION SOLID (Ox or Oy) ══════
    const hue = isRevOx ? 218 : 162;
    const maxAng = isFastMode ? Math.max(20, Math.min(42, Math.round(N * 0.9))) : Math.max(24, Math.min(96, Math.max(36, Math.round(N * 1.25))));
    const nAng = Math.max(12, Math.round(maxAng * (sweepDeg / 360)));

    // Pre-sample function values along x axis (N+1 points)
    const xs = new Float64Array(N + 1);
    const f1s = new Float64Array(N + 1);
    const f2s = new Float64Array(N + 1);
    for (let si = 0; si <= N; si++) {
      const xv = na + (nb - na) * si / N;
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
        const light = Math.max(0.55, Math.min(1.0, 0.78 + 0.28 * cosAng - 0.16 * sinAng));
        const litLightness = Math.round(48 + 36 * light);

        faces.push({
          z: zAvg,
          pts: [s00, s10, s11, s01],
          fill: "hsla(" + hue + ",85%," + litLightness + "%,0.88)",
          stroke: "hsla(" + hue + ",90%," + Math.round(litLightness * 0.7) + "%,0.25)",
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
            fill: "hsla(" + hue + ",20%,88%,0.75)",
            stroke: "hsla(" + hue + ",30%,65%,0.2)",
            type: "inner"
          });
        }
      }
    }

    if (sweepDeg < 359) {
      for (const thCap of [0, sweepRad]) {
        const ptsCap = [];
        let capZ = 0;
        for (let si = 0; si <= N; si++) {
          const xv = na + (nb - na) * si / N;
          const p = isRevOx
            ? project(xv, f1(xv) * Math.cos(thCap), f1(xv) * Math.sin(thCap))
            : project(xv * Math.cos(thCap), f1(xv), xv * Math.sin(thCap));
          ptsCap.push(p);
          capZ += p.z;
        }
        for (let si = N; si >= 0; si--) {
          const xv = na + (nb - na) * si / N;
          const p = isRevOx
            ? project(xv, f2(xv) * Math.cos(thCap), f2(xv) * Math.sin(thCap))
            : project(xv * Math.cos(thCap), f2(xv), xv * Math.sin(thCap));
          ptsCap.push(p);
          capZ += p.z;
        }
        faces.push({
          z: capZ / ptsCap.length,
          pts: ptsCap,
          fill: thCap === 0 ? (isRevOx ? "rgba(56, 189, 248, 0.42)" : "rgba(52, 211, 153, 0.42)") : (isRevOx ? "rgba(251, 191, 36, 0.48)" : "rgba(251, 146, 60, 0.48)"),
          stroke: thCap === 0 ? (isRevOx ? "#0284c7" : "#059669") : (isRevOx ? "#d97706" : "#ea580c"),
          strokeWidth: 2,
          type: "cap"
        });
        if (thCap > 0 && ptsCap.length > 0) {
          const midPt = ptsCap[Math.floor(ptsCap.length / 4)] || ptsCap[0];
          item._rotHandle = { x: midPt.sx - x, y: midPt.sy - y };
        }
      }
    }
  } else {
    // ══════ CROSS-SECTION SOLID (Square, Tri, Semicircle, Circle, etc.) ══════
    const hue = currentAxis === "sec-square" ? 32
      : currentAxis === "sec-tri" ? 148
      : currentAxis === "sec-semi" ? 275
      : currentAxis === "sec-circle" ? 220
      : 195;

    // 1. Base floor in X-Y plane (Z = 0)
    const basePts = [];
    let baseZ = 0;
    for (let si = 0; si <= N; si++) {
      const xv = na + (nb - na) * si / N;
      const p = project(xv, f1(xv), 0);
      basePts.push(p);
      baseZ += p.z;
    }
    for (let si = N; si >= 0; si--) {
      const xv = na + (nb - na) * si / N;
      const p = project(xv, f2(xv), 0);
      basePts.push(p);
      baseZ += p.z;
    }
    faces.push({
      z: baseZ / basePts.length - 100,
      pts: basePts,
      fill: "rgba(59, 130, 246, 0.18)",
      stroke: "#2563eb",
      strokeWidth: 1.2,
      type: "floor"
    });

    if (showRiemann) {
      // ── Stepped Riemann Prismatic Slices ──
      const nSteps = Math.min(14, Math.max(6, Math.round(N / 2)));
      for (let si = 0; si < nSteps; si++) {
        const xA = na + (nb - na) * si / nSteps;
        const xB = na + (nb - na) * (si + 1) / nSteps;
        const xM = (xA + xB) / 2;