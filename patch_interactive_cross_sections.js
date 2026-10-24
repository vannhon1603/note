/**
 * PATCH: Interactive Cross-Section Solids & Volume Calculus
 */
const fs = require('fs');
let js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

function mustReplace(target, replacement, label) {
  const idx = js.indexOf(target);
  if (idx < 0) throw new Error('TARGET NOT FOUND: ' + label);
  js = js.slice(0, idx) + replacement + js.slice(idx + target.length);
  console.log('✓ Patched:', label);
}

// ─── 1. Update computeVolume to support sec-tri-right ─────────────────────────
const oldCompute = `else if(axis==="sec-semi"){integrand=x=>{const d=Math.max(0,f1(x)-g2(x));return(Math.PI/8)*d*d;};}`;
const newCompute = `else if(axis==="sec-semi"){integrand=x=>{const d=Math.max(0,f1(x)-g2(x));return(Math.PI/8)*d*d;};}else if(axis==="sec-tri-right"){integrand=x=>{const s=Math.max(0,f1(x)-g2(x));return 0.5*s*s;};}`;
if (js.includes(oldCompute)) {
  mustReplace(oldCompute, newCompute, 'computeVolume sec-tri-right support');
} else {
  console.log('computeVolume already has sec-tri-right or modified');
}

// ─── 2. Update drawVolume3D and animation logic ──────────────────────────────
const drawStartTarget = 'let _volAnimId = null;';
const drawEndTarget = 'const VOLUME_AXES=';
const pStart = js.indexOf(drawStartTarget);
const pEnd = js.indexOf(drawEndTarget);
if (pStart < 0 || pEnd < 0) throw new Error('Cannot locate drawVolume3D region');

const newEngineCode = `
let _volAnimId = null;
function stopVolAnim() {
  if (_volAnimId) {
    cancelAnimationFrame(_volAnimId);
    _volAnimId = null;
  }
}
function toggleVolAnim(ee, page, item) {
  if (item._playing) {
    stopVolAnim();
    ee.replaceItem(page, { ...item, _playing: false });
    return;
  }
  stopVolAnim();
  const isCross = (item.axis || "").startsWith("sec-");
  const na = typeof item.a === "number" ? item.a : -2;
  const nb = typeof item.b === "number" ? item.b : 2;
  const span = nb - na;

  if (isCross) {
    let curX = item.cutPos != null && item.cutPos >= na && item.cutPos < nb ? item.cutPos : na;
    ee.replaceItem(page, { ...item, _playing: true, cutPos: curX });
    let lastT = performance.now();
    function loop(t) {
      const dt = Math.min(0.08, (t - lastT) / 1000);
      lastT = t;
      curX += dt * (span / 2.6); // travel in 2.6s
      if (curX > nb) {
        curX = na; // loop
      }
      ee.replaceItem(page, { ...item, _playing: true, cutPos: Math.round(curX * 100) / 100 });
      _volAnimId = requestAnimationFrame(loop);
    }
    _volAnimId = requestAnimationFrame(loop);
  } else {
    let sweep = (item.sweepAngle ?? 360) >= 355 ? 10 : (item.sweepAngle ?? 10);
    ee.replaceItem(page, { ...item, _playing: true, sweepAngle: sweep });
    let lastT = performance.now();
    function loop(t) {
      const dt = Math.min(0.08, (t - lastT) / 1000);
      lastT = t;
      sweep += dt * 140; // 140 deg/s
      if (sweep >= 360) {
        sweep = 360;
        ee.replaceItem(page, { ...item, _playing: false, sweepAngle: 360 });
        _volAnimId = null;
        return;
      }
      ee.replaceItem(page, { ...item, _playing: true, sweepAngle: sweep });
      _volAnimId = requestAnimationFrame(loop);
    }
    _volAnimId = requestAnimationFrame(loop);
  }
}

/** Helper: Generate 2D cross-section profile points (u, v) around perimeter */
function getCrossSectionShape(secType, baseW) {
  const hw = baseW / 2;
  if (secType === "sec-square") {
    return [
      { u: -hw, v: 0 },
      { u: hw, v: 0 },
      { u: hw, v: baseW },
      { u: -hw, v: baseW }
    ];
  } else if (secType === "sec-tri") {
    const H = (Math.sqrt(3) / 2) * baseW;
    return [
      { u: -hw, v: 0 },
      { u: hw, v: 0 },
      { u: 0, v: H }
    ];
  } else if (secType === "sec-semi") {
    const R = hw;
    const pts = [];
    const steps = 14;
    for (let i = 0; i <= steps; i++) {
      const ang = (i / steps) * Math.PI;
      pts.push({ u: -R * Math.cos(ang), v: R * Math.sin(ang) });
    }
    return pts;
  } else if (secType === "sec-circle") {
    const R = hw;
    const pts = [];
    const steps = 18;
    for (let i = 0; i <= steps; i++) {
      const ang = (i / steps) * Math.PI * 2;
      pts.push({ u: R * Math.cos(ang), v: R * Math.sin(ang) });
    }
    return pts;
  } else {
    // sec-tri-right (tam giác vuông cân: góc vuông ở đỉnh)
    return [
      { u: -hw, v: 0 },
      { u: hw, v: 0 },
      { u: 0, v: hw }
    ];
  }
}

/** Compute cross sectional area S(x) */
function computeCrossArea(secType, baseW) {
  if (baseW <= 0.0001) return 0;
  if (secType === "sec-square") return baseW * baseW;
  if (secType === "sec-tri") return (Math.sqrt(3) / 4) * baseW * baseW;
  if (secType === "sec-semi") return (Math.PI / 8) * baseW * baseW;
  if (secType === "sec-circle") return (Math.PI / 4) * baseW * baseW;
  if (secType === "sec-tri-right") return 0.5 * baseW * baseW;
  return baseW * baseW;
}

function drawVolume3D(ctx, item) {
  const { x, y, w, h, expr, expr2, axis, a, b, nSlices, sweepAngle, viewYaw, viewPitch, showSlice, cutPos, showRiemann } = item;
  const fn = bo(expr);
  if (fn instanceof Error || !expr || !expr.trim()) {
    ctx.save();
    ctx.fillStyle = "#f8faff"; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = "#94a3b8";
    ctx.font = Math.min(14, h * 0.08) + "px system-ui, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("Nhập hàm số để biểu diễn 3D", x + w / 2, y + h / 2);
    ctx.restore();
    return;
  }

  const fn2raw = expr2 && expr2.trim() ? bo(expr2) : null;
  const f1 = xv => Math.max(0, fn(xv));
  const f2 = (fn2raw instanceof Error || !fn2raw) ? (() => 0) : (xv => Math.max(0, fn2raw(xv)));

  const na = typeof a === "number" && isFinite(a) ? a : -2;
  const nb = typeof b === "number" && isFinite(b) ? b : 2;
  if (nb <= na) return;

  const currentAxis = axis || "ox";
  const isRevOx = currentAxis === "ox";
  const isRevOy = currentAxis === "oy";
  const isRev = isRevOx || isRevOy;
  const isCross = currentAxis.startsWith("sec-");

  const N = Math.max(16, Math.min(48, nSlices || 24));
  const sweepDeg = Math.max(5, Math.min(360, sweepAngle != null ? sweepAngle : 360));
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
  // Card background with rounded corner & subtle gradient
  ctx.fillStyle = "#f8faff";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x, y, w, h);

  // ─── 1. Draw Grid floor (X-Z plane) ──────────────────────────────
  ctx.strokeStyle = "rgba(226, 232, 240, 0.75)";
  ctx.lineWidth = 0.8;
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
    const nAng = Math.max(12, Math.round(36 * (sweepDeg / 360)));

    for (let ai = 0; ai < nAng; ai++) {
      const th0 = (ai / nAng) * sweepRad;
      const th1 = ((ai + 1) / nAng) * sweepRad;
      const thMid = (th0 + th1) / 2;

      for (let si = 0; si < N; si++) {
        const x0 = na + (nb - na) * si / N;
        const x1 = na + (nb - na) * (si + 1) / N;

        const ro0 = f1(x0), ro1 = f1(x1);
        const ri0 = f2(x0), ri1 = f2(x1);

        const get3D = (xv, rv, th) => {
          if (isRevOx) {
            return { X: xv, Y: rv * Math.cos(th), Z: rv * Math.sin(th) };
          } else {
            return { X: xv * Math.cos(th), Y: rv, Z: xv * Math.sin(th) };
          }
        };

        const pt00 = get3D(x0, ro0, th0);
        const pt10 = get3D(x1, ro1, th0);
        const pt11 = get3D(x1, ro1, th1);
        const pt01 = get3D(x0, ro0, th1);

        const s00 = project(pt00.X, pt00.Y, pt00.Z);
        const s10 = project(pt10.X, pt10.Y, pt10.Z);
        const s11 = project(pt11.X, pt11.Y, pt11.Z);
        const s01 = project(pt01.X, pt01.Y, pt01.Z);

        const zAvg = (s00.z + s10.z + s11.z + s01.z) / 4;
        const cosAng = Math.cos(thMid), sinAng = Math.sin(thMid);
        const light = Math.max(0.42, Math.min(1.0, 0.72 + 0.3 * cosAng - 0.2 * sinAng));

        faces.push({
          z: zAvg,
          pts: [s00, s10, s11, s01],
          fill: "hsla(" + hue + ",75%," + Math.round(56 * light) + "%,0.82)",
          stroke: "hsla(" + hue + ",80%," + Math.round(36 * light) + "%,0.32)",
          type: "outer"
        });

        if (ri0 > 0.001 || ri1 > 0.001) {
          const ipt00 = get3D(x0, ri0, th0);
          const ipt10 = get3D(x1, ri1, th0);
          const ipt11 = get3D(x1, ri1, th1);
          const ipt01 = get3D(x0, ri0, th1);

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
          fill: thCap === 0 ? "rgba(59, 130, 246, 0.55)" : "rgba(245, 158, 11, 0.65)",
          stroke: thCap === 0 ? "#1d4ed8" : "#d97706",
          strokeWidth: 1.5,
          type: "cap"
        });
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
        const bW = Math.max(0, f1(xM) - f2(xM));
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
            fill: "hsla(" + hue + ",75%,60%,0.75)",
            stroke: "hsla(" + hue + ",80%,35%,0.4)",
            type: "riemann-side"
          });
        }
        faces.push({
          z: zMid,
          pts: frontPts,
          fill: "hsla(" + hue + ",85%,50%,0.85)",
          stroke: "hsla(" + hue + ",85%,30%,0.8)",
          strokeWidth: 1.2,
          type: "riemann-face"
        });
      }
    } else {
      // ── Continuous Lofted 3D Solid ──
      for (let si = 0; si < N; si++) {
        const x0 = na + (nb - na) * si / N;
        const x1 = na + (nb - na) * (si + 1) / N;

        const w0 = Math.max(0, f1(x0) - f2(x0));
        const w1 = Math.max(0, f1(x1) - f2(x1));
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
          const light = 0.55 + 0.35 * Math.sin(k * 1.5 + 0.8);

          faces.push({
            z: zAvg,
            pts: [p00, p10, p11, p01],
            fill: "hsla(" + hue + ",75%," + Math.round(52 * light) + "%,0.8)",
            stroke: "hsla(" + hue + ",80%," + Math.round(35 * light) + "%,0.35)",
            strokeWidth: 0.5,
            type: "loft"
          });
        }
      }

      // End caps at a and b
      for (const capX of [na, nb]) {
        const cw = Math.max(0, f1(capX) - f2(capX));
        if (cw > 0.001) {
          const cym = (f1(capX) + f2(capX)) / 2;
          const cshape = getCrossSectionShape(currentAxis, cw);
          const cpts = cshape.map(pt => project(capX, cym + pt.u, pt.v));
          const cz = cpts.reduce((acc, p) => acc + p.z, 0) / cpts.length;
          faces.push({
            z: cz,
            pts: cpts,
            fill: "hsla(" + hue + ",80%,48%,0.85)",
            stroke: "hsla(" + hue + ",85%,25%,0.75)",
            strokeWidth: 1.2,
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
    if (face.stroke) {
      ctx.strokeStyle = face.stroke;
      ctx.lineWidth = face.strokeWidth || 0.4;
      ctx.stroke();
    }
  }

  // ─── 5. Draw 2D Boundary Curves in Base ───────────────────────────
  ctx.beginPath();
  let first = true;
  for (let si = 0; si <= N * 2; si++) {
    const xv = na + (nb - na) * si / (N * 2);
    const rv = f1(xv);
    const p = project(xv, rv, 0);
    if (first) { ctx.moveTo(p.sx, p.sy); first = false; }
    else ctx.lineTo(p.sx, p.sy);
  }
  ctx.strokeStyle = "#1d4ed8";
  ctx.lineWidth = 2.2;
  ctx.stroke();

  if (expr2 && expr2.trim() && !(fn2raw instanceof Error) && fn2raw) {
    ctx.beginPath();
    first = true;
    for (let si = 0; si <= N * 2; si++) {
      const xv = na + (nb - na) * si / (N * 2);
      const rv = f2(xv);
      const p = project(xv, rv, 0);
      if (first) { ctx.moveTo(p.sx, p.sy); first = false; }
      else ctx.lineTo(p.sx, p.sy);
    }
    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 1.6;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ─── 6. INTERACTIVE CUTTING PLANE & CROSS-SECTION AT activeCutX ──
  if (isCross) {
    ctx.save();
    const cutW = Math.max(0, f1(activeCutX) - f2(activeCutX));
    const cutYm = (f1(activeCutX) + f2(activeCutX)) / 2;
    const cutShape = getCrossSectionShape(currentAxis, cutW);
    const cutArea = computeCrossArea(currentAxis, cutW);

    // 1. Semi-transparent cutting plane sheet
    const planeH = Math.max(boundR * 1.5, maxVal * 1.3);
    const planeSheet = [
      project(activeCutX, -0.2, -0.2),
      project(activeCutX, maxVal * 1.25, -0.2),
      project(activeCutX, maxVal * 1.25, planeH),
      project(activeCutX, -0.2, planeH)
    ];
    ctx.beginPath();
    ctx.moveTo(planeSheet[0].sx, planeSheet[0].sy);
    for (let k = 1; k < planeSheet.length; k++) ctx.lineTo(planeSheet[k].sx, planeSheet[k].sy);
    ctx.closePath();
    ctx.fillStyle = "rgba(6, 182, 212, 0.16)";
    ctx.fill();
    ctx.strokeStyle = "rgba(6, 182, 212, 0.65)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Highlighted Cut Polygon
    if (cutW > 0.001) {
      const cutPts = cutShape.map(pt => project(activeCutX, cutYm + pt.u, pt.v));
      ctx.beginPath();
      ctx.moveTo(cutPts[0].sx, cutPts[0].sy);
      for (let k = 1; k < cutPts.length; k++) ctx.lineTo(cutPts[k].sx, cutPts[k].sy);
      ctx.closePath();
      ctx.fillStyle = "rgba(245, 158, 11, 0.88)";
      ctx.fill();
      ctx.strokeStyle = "#b45309";
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Dimension line along base
      const pBase0 = project(activeCutX, f2(activeCutX), 0);
      const pBase1 = project(activeCutX, f1(activeCutX), 0);
      ctx.beginPath();
      ctx.moveTo(pBase0.sx, pBase0.sy);
      ctx.lineTo(pBase1.sx, pBase1.sy);
      ctx.strokeStyle = "#dc2626";
      ctx.lineWidth = 2.4;
      ctx.stroke();

      // Floating section area badge near the cut
      const topPt = cutPts[Math.floor(cutPts.length / 2)] || cutPts[0];
      const badgeText = "S(" + (Math.round(activeCutX * 10) / 10) + ") \u2248 " + (Math.round(cutArea * 100) / 100);
      ctx.font = "bold 11px system-ui, sans-serif";
      const bw = ctx.measureText(badgeText).width + 12;
      ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
      ctx.fillRect(topPt.sx - bw / 2, topPt.sy - 22, bw, 18);
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 1;
      ctx.strokeRect(topPt.sx - bw / 2, topPt.sy - 22, bw, 18);
      ctx.fillStyle = "#b45309";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(badgeText, topPt.sx, topPt.sy - 13);
    }

    // Mark current x position on Ox axis with indicator tick
    const pCutOx = project(activeCutX, 0, 0);
    ctx.fillStyle = "#ea580c";
    ctx.beginPath();
    ctx.arc(pCutOx.sx, pCutOx.sy, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ─── 7. Representative Slice dx for Revolutions ──────────────────
  if (showSlice && isRev) {
    const midX = activeCutX;
    const sR = f1(midX);
    ctx.save();
    if (isRevOx) {
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 2.5;
      const capSlice = [];
      for (let ai = 0; ai <= 32; ai++) {
        const th = (ai / 32) * sweepRad;
        capSlice.push(project(midX, sR * Math.cos(th), sR * Math.sin(th)));
      }
      ctx.beginPath();
      ctx.moveTo(capSlice[0].sx, capSlice[0].sy);
      for (let k = 1; k < capSlice.length; k++) ctx.lineTo(capSlice[k].sx, capSlice[k].sy);
      ctx.fillStyle = "rgba(6, 182, 212, 0.4)";
      ctx.fill();
      ctx.stroke();

      const pCenter = project(midX, 0, 0);
      const pEdge = project(midX, sR, 0);
      ctx.beginPath(); ctx.moveTo(pCenter.sx, pCenter.sy); ctx.lineTo(pEdge.sx, pEdge.sy);
      ctx.strokeStyle = "#0891b2"; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.fillStyle = "#0891b2"; ctx.font = "bold 11px system-ui";
      ctx.fillText("R=f(x)", (pCenter.sx + pEdge.sx) / 2 + 10, (pCenter.sy + pEdge.sy) / 2);
    } else {
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2.2;
      const ringTop = [], ringBot = [];
      for (let ai = 0; ai <= 32; ai++) {
        const th = (ai / 32) * sweepRad;
        ringTop.push(project(midX * Math.cos(th), f1(midX), midX * Math.sin(th)));
        ringBot.push(project(midX * Math.cos(th), f2(midX), midX * Math.sin(th)));
      }
      ctx.beginPath();
      ctx.moveTo(ringTop[0].sx, ringTop[0].sy);
      for (let k = 1; k < ringTop.length; k++) ctx.lineTo(ringTop[k].sx, ringTop[k].sy);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(ringBot[0].sx, ringBot[0].sy);
      for (let k = 1; k < ringBot.length; k++) ctx.lineTo(ringBot[k].sx, ringBot[k].sy);
      ctx.stroke();

      const pYCenter = project(0, f1(midX) / 2, 0);
      const pShellEdge = project(midX, f1(midX) / 2, 0);
      ctx.beginPath(); ctx.moveTo(pYCenter.sx, pYCenter.sy); ctx.lineTo(pShellEdge.sx, pShellEdge.sy);
      ctx.strokeStyle = "#d97706"; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.fillStyle = "#d97706"; ctx.font = "bold 11px system-ui";
      ctx.fillText("r=x", (pYCenter.sx + pShellEdge.sx) / 2, pYCenter.sy - 4);
    }
    ctx.restore();
  }

  // ─── 8. Rotation Arc Indicator ↺ (for revolutions) ──────────────
  if (isRev) {
    ctx.save();
    const arcPts = [];
    const arcRadius = isRevOx ? Math.min(maxVal * 0.45, 1.2) : Math.min(nb * 0.45, 1.2);
    const arcX = isRevOx ? nb + 0.35 : 0;
    const arcY = isRevOx ? 0 : maxVal * 0.85;

    for (let ai = 0; ai <= 16; ai++) {
      const th = (ai / 16) * Math.min(sweepRad, Math.PI * 1.5);
      const p = isRevOx
        ? project(arcX, arcRadius * Math.cos(th), arcRadius * Math.sin(th))
        : project(arcRadius * Math.cos(th), arcY, arcRadius * Math.sin(th));
      arcPts.push(p);
    }
    if (arcPts.length > 2) {
      ctx.beginPath();
      ctx.moveTo(arcPts[0].sx, arcPts[0].sy);
      for (let k = 1; k < arcPts.length; k++) ctx.lineTo(arcPts[k].sx, arcPts[k].sy);
      ctx.strokeStyle = isRevOx ? "#2563eb" : "#059669";
      ctx.lineWidth = 1.8;
      ctx.setLineDash([3, 2]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  // ─── 9. Overlay Information Card (Top Left) ──────────────────────
  ctx.save();
  const cardW = 180, cardH = 50;
  ctx.fillStyle = isRevOx ? "#eff6ff" : isRevOy ? "#ecfdf5" : "#fffbeb";
  ctx.strokeStyle = isRevOx ? "#bfdbfe" : isRevOy ? "#a7f3d0" : "#fde68a";
  ctx.lineWidth = 1;
  ctx.fillRect(x + 10, y + 10, cardW, cardH);
  ctx.strokeRect(x + 10, y + 10, cardW, cardH);

  let badgeTitle = "";
  let formulaShort = "";

  if (isRevOx) {
    badgeTitle = "🔄 Xoay quanh Ox (" + sweepDeg + "°)";
    formulaShort = "V = π ∫ [f² - g²] dx";
  } else if (isRevOy) {
    badgeTitle = "🔄 Xoay quanh Oy (" + sweepDeg + "°)";
    formulaShort = "V = 2π ∫ x(f - g) dx";
  } else if (currentAxis === "sec-square") {
    badgeTitle = "⬛ Mặt cắt: Hình vuông";
    formulaShort = "V = ∫ [f - g]² dx";
  } else if (currentAxis === "sec-tri") {
    badgeTitle = "🔺 Mặt cắt: Tam giác đều";
    formulaShort = "V = (√3/4) ∫ [f - g]² dx";
  } else if (currentAxis === "sec-semi") {
    badgeTitle = "🌗 Mặt cắt: Nửa hình tròn";
    formulaShort = "V = (π/8) ∫ [f - g]² dx";
  } else if (currentAxis === "sec-circle") {
    badgeTitle = "🟡 Mặt cắt: Hình tròn";
    formulaShort = "V = (π/4) ∫ [f - g]² dx";
  } else {
    badgeTitle = "⊿ Mặt cắt: Tam giác vuông";
    formulaShort = "V = (1/2) ∫ [f - g]² dx";
  }

  ctx.fillStyle = isRevOx ? "#1d4ed8" : isRevOy ? "#047857" : "#b45309";
  ctx.font = "bold 12px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(badgeTitle, x + 16, y + 27);

  ctx.fillStyle = "#475569";
  ctx.font = "11px system-ui, sans-serif";
  ctx.fillText(formulaShort, x + 16, y + 47);

  // Volume value overlay (Bottom Right)
  if (item.volume != null && isFinite(item.volume)) {
    const volDisplay = "V \u2248 " + fmtVolume(item.volume);
    ctx.font = "bold " + Math.min(15, h * 0.06) + "px system-ui, sans-serif";
    const textW = ctx.measureText(volDisplay).width;
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.fillRect(x + w - textW - 20, y + h - 34, textW + 14, 26);
    ctx.strokeStyle = isCross ? "#fde68a" : "#bfdbfe";
    ctx.strokeRect(x + w - textW - 20, y + h - 34, textW + 14, 26);

    ctx.fillStyle = isCross ? "#b45309" : "#1e40af";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(volDisplay, x + w - 13, y + h - 21);
  }

  ctx.restore();
}
`;

js = js.slice(0, pStart) + newEngineCode + js.slice(pEnd);
console.log('✓ Replaced volume engine with interactive cross-section 3D lofting');

// ─── 3. Update VOLUME_AXES to include sec-tri-right ──────────────────────────
const oldAxes = 'const VOLUME_AXES=["ox","oy","sec-square","sec-circle","sec-tri","sec-semi"];';
const newAxes = 'const VOLUME_AXES=["ox","oy","sec-square","sec-tri","sec-semi","sec-circle","sec-tri-right"];';
if (js.includes(oldAxes)) {
  mustReplace(oldAxes, newAxes, 'VOLUME_AXES list');
}

// ─── 4. Update axis labels in Vietnamese ─────────────────────────────────────
const oldLabels = 'volSecSemiCircle:"Mặt cắt: nửa hình tròn",';
const newLabels = 'volSecSemiCircle:"Mặt cắt: nửa hình tròn",volSecTriRight:"Mặt cắt: tam giác vuông cân",';
if (js.includes(oldLabels) && !js.includes('volSecTriRight')) {
  mustReplace(oldLabels, newLabels, 'volSecTriRight label');
}

// ─── 5. Update VolumeDialog axisLabels dictionary ────────────────────────────
const oldDialogLabels = '"sec-tri":r.volSecTriEq,"sec-semi":r.volSecSemiCircle';
const newDialogLabels = '"sec-tri":r.volSecTriEq,"sec-semi":r.volSecSemiCircle,"sec-tri-right":r.volSecTriRight||"Mặt cắt: tam giác vuông cân"';
if (js.includes(oldDialogLabels) && !js.includes('"sec-tri-right":')) {
  mustReplace(oldDialogLabels, newDialogLabels, 'VolumeDialog axisLabels');
}

// ─── 6. Update selection-bar with cross-section controls ─────────────────────
const oldSelControls = '(ee==null?void 0:ee.selectedItem())&&ee.selectedItem().item.type==="volume"&&(()=>{';
const pSel = js.indexOf(oldSelControls);
if (pSel < 0) throw new Error('Cannot locate selection-bar volume controls');

const pSelEnd = js.indexOf('})(),', pSel);
if (pSelEnd < 0) throw new Error('Cannot locate end of selection-bar volume controls');

const newSelControls =
  '(ee==null?void 0:ee.selectedItem())&&ee.selectedItem().item.type==="volume"&&(()=>{' +
    'const _s=ee.selectedItem();' +
    'const it=_s.item;' +
    'const curAx=it.axis||"ox";' +
    'const isCross=curAx.startsWith("sec-");' +
    'const na=it.a??-2;' +
    'const nb=it.b??2;' +
    'const cutX=it.cutPos!=null?it.cutPos:(Math.round(((na+nb)/2)*100)/100);' +
    'const sw=Math.round(it.sweepAngle??360);' +
    'const setAxis=ax=>{' +
      'const v=computeVolume(it.expr,it.expr2||"",na,nb,ax,it.nSlices||24);' +
      'stopVolAnim();' +
      'ee.replaceItem(_s.page,{...it,axis:ax,volume:v,_playing:false});' +
    '};' +
    'return f.jsxs(f.Fragment,{children:[' +
      'f.jsx("span",{className:"turn-sep"}),' +
      'f.jsx("button",{className:curAx==="ox"?"on":"",title:"Xoay quanh trục hoành Ox",onClick:()=>setAxis("ox"),children:"Trục Ox"}),' +
      'f.jsx("button",{className:curAx==="oy"?"on":"",title:"Xoay quanh trục tung Oy",onClick:()=>setAxis("oy"),children:"Trục Oy"}),' +
      'f.jsx("button",{className:curAx==="sec-square"?"on":"",title:"Mặt cắt hình vuông",onClick:()=>setAxis("sec-square"),children:"⬛ Vuông"}),' +
      'f.jsx("button",{className:curAx==="sec-tri"?"on":"",title:"Mặt cắt tam giác đều",onClick:()=>setAxis("sec-tri"),children:"🔺 Tam giác"}),' +
      'f.jsx("button",{className:curAx==="sec-semi"?"on":"",title:"Mặt cắt nửa hình tròn",onClick:()=>setAxis("sec-semi"),children:"🌗 Nửa tròn"}),' +
      'f.jsx("button",{className:curAx==="sec-circle"?"on":"",title:"Mặt cắt hình tròn",onClick:()=>setAxis("sec-circle"),children:"🟡 Tròn"}),' +
      'f.jsx("button",{className:curAx==="sec-tri-right"?"on":"",title:"Mặt cắt tam giác vuông cân",onClick:()=>setAxis("sec-tri-right"),children:"⊿ Vuông cân"}),' +
      'f.jsx("span",{className:"turn-sep"}),' +
      'f.jsx("button",{className:it._playing?"on":"",title:isCross?"Quét mặt phẳng cắt tự động từ a đến b":"Quay quét góc xoay từ 0° đến 360°",onClick:()=>toggleVolAnim(ee,_s.page,it),children:it._playing?"⏸ Dừng":(isCross?"▶ Quét mặt cắt":"▶ Quay 360°")}),' +
      '(isCross ? f.jsxs("label",{style:{display:"inline-flex",alignItems:"center",gap:"5px",fontSize:"12px",padding:"0 4px",cursor:"pointer"},children:[' +
        'f.jsx("span",{children:"Vị trí x:"}),' +
        'f.jsx("b",{style:{minWidth:"28px",textAlign:"right"},children:String(Math.round(cutX*100)/100)}),' +
        'f.jsx("input",{type:"range",min:na,max:nb,step:(nb-na)/100,value:cutX,style:{width:"80px"},onChange:e=>{stopVolAnim();ee.replaceItem(_s.page,{...it,cutPos:Number(e.target.value),_playing:false})}})' +
      ']}) : f.jsxs("label",{style:{display:"inline-flex",alignItems:"center",gap:"5px",fontSize:"12px",padding:"0 4px",cursor:"pointer"},children:[' +
        'f.jsx("span",{children:"Góc:"}),' +
        'f.jsx("b",{style:{minWidth:"32px",textAlign:"right"},children:sw+"°"}),' +
        'f.jsx("input",{type:"range",min:10,max:360,step:5,value:sw,style:{width:"75px"},onChange:e=>{stopVolAnim();ee.replaceItem(_s.page,{...it,sweepAngle:Number(e.target.value),_playing:false})}})' +
      ']})),' +
      'f.jsx("span",{className:"turn-sep"}),' +
      '(isCross ? f.jsx("button",{className:it.showRiemann?"on":"",title:"Hiển thị các lát cắt lăng trụ rời rạc (Tổng Riemann)",onClick:()=>ee.replaceItem(_s.page,{...it,showRiemann:!it.showRiemann}),children:"Lát Riemann"})' +
        ': f.jsx("button",{className:it.showSlice?"on":"",title:"Bật/tắt lát cắt vi phân dx",onClick:()=>ee.replaceItem(_s.page,{...it,showSlice:!it.showSlice}),children:"📐 Lát cắt dx"})),' +
      'f.jsx("span",{className:"turn-sep"}),' +
      'f.jsx("button",{title:"Xoay góc nhìn 3D sang trái",onClick:()=>ee.replaceItem(_s.page,{...it,viewYaw:(it.viewYaw??0.44)-0.25}),children:"⟲ 3D"}),' +
      'f.jsx("button",{title:"Xoay góc nhìn 3D sang phải",onClick:()=>ee.replaceItem(_s.page,{...it,viewYaw:(it.viewYaw??0.44)+0.25}),children:"⟳ 3D"}),' +
      'f.jsx("button",{title:"Xoay góc nhìn 3D lên",onClick:()=>ee.replaceItem(_s.page,{...it,viewPitch:Math.max(-0.6,(it.viewPitch??0.34)-0.15)}),children:"▲"}),' +
      'f.jsx("button",{title:"Xoay góc nhìn 3D xuống",onClick:()=>ee.replaceItem(_s.page,{...it,viewPitch:Math.min(1.2,(it.viewPitch??0.34)+0.15)}),children:"▼"}),' +
      'f.jsx("span",{className:"turn-sep"})' +
    ']});' +
  '})()';

js = js.slice(0, pSel) + newSelControls + js.slice(pSelEnd + 4);
console.log('✓ Updated selection-bar with full cross-section interactive controls');

fs.writeFileSync('dist/assets/index-D9JME9Hm.js', js, 'utf8');
console.log('\n🎉 Successfully applied interactive cross-section solids patch!');
