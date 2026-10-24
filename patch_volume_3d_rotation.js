/**
 * PATCH: Advanced 3D Rotation for Solid of Revolution (Ox & Oy)
 * Supports:
 *  - Full revolution around Ox (disks/washers)
 *  - Full revolution around Oy (cylindrical shells)
 *  - Sweep angle (0° to 360°) with play/pause animation
 *  - 3D view rotation (yaw, pitch)
 *  - Representative dx slice visualization
 *  - Floating interactive toolbar on main canvas when selected
 */
const fs = require('fs');
let js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

function mustReplace(target, replacement, label) {
  const idx = js.indexOf(target);
  if (idx < 0) throw new Error('TARGET NOT FOUND: ' + label);
  js = js.slice(0, idx) + replacement + js.slice(idx + target.length);
  console.log('✓ Patched:', label);
}

// ─── 1. Enhanced drawVolume3D + helper code ─────────────────────────────────
const oldDrawStart = 'function drawVolume3D(ctx,item){';
const oldDrawEnd = 'const VOLUME_AXES=["ox","oy","sec-square","sec-circle","sec-tri","sec-semi"];';
const pStart = js.indexOf(oldDrawStart);
const pEnd = js.indexOf(oldDrawEnd);
if (pStart < 0 || pEnd < 0) throw new Error('Cannot locate drawVolume3D boundaries');

const newDrawVolumeCode = `
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

function drawVolume3D(ctx, item) {
  const { x, y, w, h, expr, expr2, axis, a, b, nSlices, sweepAngle, viewYaw, viewPitch, showSlice } = item;
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

  const N = Math.max(16, Math.min(48, nSlices || 24));
  const sweepDeg = Math.max(5, Math.min(360, sweepAngle != null ? sweepAngle : 360));
  const sweepRad = (sweepDeg * Math.PI) / 180;

  // View angles
  const yaw = viewYaw != null ? viewYaw : 0.42;
  const pitch = viewPitch != null ? viewPitch : 0.32;

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
  const scale = Math.min((w - 2 * margin) / (xSpan * 1.5 + boundR * 1.5), (h - 2 * margin) / (boundR * 2.6));

  // Center of rotation in 3D
  const cenX = isRevOx ? (na + nb) / 2 : 0;
  const cenY = isRevOx ? 0 : boundR * 0.4;
  const cenZ = 0;

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
  ctx.strokeStyle = isRevOx ? "#2563eb" : "#64748b";
  ctx.lineWidth = isRevOx ? 2.2 : 1.2;
  ctx.stroke();

  // Oy
  ctx.beginPath(); ctx.moveTo(oyStart.sx, oyStart.sy); ctx.lineTo(oyEnd.sx, oyEnd.sy);
  ctx.strokeStyle = isRevOy ? "#059669" : "#64748b";
  ctx.lineWidth = isRevOy ? 2.2 : 1.2;
  ctx.stroke();

  // Oz (depth axis)
  ctx.beginPath(); ctx.moveTo(ozStart.sx, ozStart.sy); ctx.lineTo(ozEnd.sx, ozEnd.sy);
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Axis Labels
  ctx.font = "bold 13px 'Times New Roman', serif";
  ctx.fillStyle = isRevOx ? "#2563eb" : "#475569";
  ctx.fillText("x (Ox)", oxEnd.sx + 4, oxEnd.sy - 2);
  ctx.fillStyle = isRevOy ? "#059669" : "#475569";
  ctx.fillText("y (Oy)", oyEnd.sx + 4, oyEnd.sy);

  // Bound marks a and b on Ox
  const pa = project(na, 0, 0);
  const pb = project(nb, 0, 0);
  ctx.fillStyle = "#1e293b";
  ctx.font = "11px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("a=" + na, pa.sx, pa.sy + 14);
  ctx.fillText("b=" + nb, pb.sx, pb.sy + 14);

  // ─── 3. Construct 3D mesh faces & sort by depth ──────────────────
  const faces = [];
  const nAng = isRev ? Math.max(12, Math.round(36 * (sweepDeg / 360))) : 1;

  if (isRev) {
    const hue = isRevOx ? 218 : 162;

    for (let ai = 0; ai < nAng; ai++) {
      const th0 = (ai / nAng) * sweepRad;
      const th1 = ((ai + 1) / nAng) * sweepRad;
      const thMid = (th0 + th1) / 2;

      for (let si = 0; si < N; si++) {
        const x0 = na + (nb - na) * si / N;
        const x1 = na + (nb - na) * (si + 1) / N;

        const ro0 = f1(x0), ro1 = f1(x1);
        const ri0 = f2(x0), ri1 = f2(x1);

        // Function to map (x, r, theta) to 3D point (X, Y, Z)
        const get3D = (xv, rv, th) => {
          if (isRevOx) {
            // Revolve around Ox: axis is X, radius in Y-Z
            return { X: xv, Y: rv * Math.cos(th), Z: rv * Math.sin(th) };
          } else {
            // Revolve around Oy: axis is Y, radius in X-Z
            return { X: xv * Math.cos(th), Y: rv, Z: xv * Math.sin(th) };
          }
        };

        // Outer surface quad
        const pt00 = get3D(x0, ro0, th0);
        const pt10 = get3D(x1, ro1, th0);
        const pt11 = get3D(x1, ro1, th1);
        const pt01 = get3D(x0, ro0, th1);

        const s00 = project(pt00.X, pt00.Y, pt00.Z);
        const s10 = project(pt10.X, pt10.Y, pt10.Z);
        const s11 = project(pt11.X, pt11.Y, pt11.Z);
        const s01 = project(pt01.X, pt01.Y, pt01.Z);

        const zAvg = (s00.z + s10.z + s11.z + s01.z) / 4;

        // Approximate lighting with normal
        const cosAng = Math.cos(thMid);
        const sinAng = Math.sin(thMid);
        const light = Math.max(0.42, Math.min(1.0, 0.72 + 0.3 * cosAng - 0.2 * sinAng));

        faces.push({
          z: zAvg,
          pts: [s00, s10, s11, s01],
          fill: "hsla(" + hue + ",75%," + Math.round(56 * light) + "%,0.82)",
          stroke: "hsla(" + hue + ",80%," + Math.round(36 * light) + "%,0.32)",
          type: "outer"
        });

        // Inner surface quad (if washer / hollow)
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

    // ── End caps at theta = 0 and theta = sweepRad (Cut sections) ──
    if (sweepDeg < 359) {
      for (const thCap of [0, sweepRad]) {
        const ptsCap = [];
        let capZ = 0;
        // Outer curve
        for (let si = 0; si <= N; si++) {
          const xv = na + (nb - na) * si / N;
          const p = isRevOx
            ? project(xv, f1(xv) * Math.cos(thCap), f1(xv) * Math.sin(thCap))
            : project(xv * Math.cos(thCap), f1(xv), xv * Math.sin(thCap));
          ptsCap.push(p);
          capZ += p.z;
        }
        // Inner curve backwards
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
    // Cross sections (square, circle, triangle, etc.)
    const hue = axis === "sec-square" ? 32 : axis === "sec-circle" ? 280 : axis === "sec-tri" ? 122 : 340;
    for (let si = 0; si < N; si++) {
      const xm = na + (nb - na) * (si + 0.5) / N;
      const ht = Math.max(0, f1(xm) - f2(xm));
      if (ht < 0.001) continue;
      const pBase = project(xm, f2(xm), 0);
      const pTop = project(xm, f1(xm), 0);
      const dy = pBase.sy - pTop.sy;
      faces.push({
        z: pBase.z,
        customDraw: (g) => {
          g.save();
          g.translate(pBase.sx, pBase.sy);
          g.fillStyle = "hsla(" + hue + ",75%,56%,0.72)";
          g.strokeStyle = "hsla(" + hue + ",75%,36%,0.45)";
          g.lineWidth = 0.6;
          if (axis === "sec-square") {
            g.fillRect(-dy / 2, -dy, dy, dy);
            g.strokeRect(-dy / 2, -dy, dy, dy);
          } else if (axis === "sec-circle") {
            g.beginPath(); g.ellipse(0, -dy / 2, dy / 2, dy / 2, 0, 0, Math.PI * 2);
            g.fill(); g.stroke();
          } else if (axis === "sec-tri") {
            g.beginPath(); g.moveTo(0, -dy); g.lineTo(dy / 2, 0); g.lineTo(-dy / 2, 0); g.closePath();
            g.fill(); g.stroke();
          } else {
            g.beginPath(); g.arc(0, 0, dy / 2, Math.PI, 0); g.closePath(); g.fill(); g.stroke();
          }
          g.restore();
        }
      });
    }
  }

  // ─── 4. Painter's Algorithm: Sort faces back to front ────────────
  faces.sort((p1, p2) => p1.z - p2.z);

  for (const face of faces) {
    if (face.customDraw) {
      face.customDraw(ctx);
      continue;
    }
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

  // ─── 5. Draw 2D Initial Planar Region (at theta = 0) ─────────────
  ctx.beginPath();
  let first = true;
  for (let si = 0; si <= N * 2; si++) {
    const xv = na + (nb - na) * si / (N * 2);
    const rv = f1(xv);
    const p = isRevOx ? project(xv, rv, 0) : project(xv, rv, 0);
    if (first) { ctx.moveTo(p.sx, p.sy); first = false; }
    else ctx.lineTo(p.sx, p.sy);
  }
  ctx.strokeStyle = "#1d4ed8";
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // g(x) curve if present
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

  // ─── 6. Representative Slice dx (Washer or Shell) ────────────────
  if (showSlice && isRev) {
    const midX = (na + nb) / 2;
    const sR = f1(midX);
    const sH = Math.max(0.1, sR - f2(midX));
    ctx.save();
    if (isRevOx) {
      // Disk / Washer around Ox
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

      // Radius line
      const pCenter = project(midX, 0, 0);
      const pEdge = project(midX, sR, 0);
      ctx.beginPath(); ctx.moveTo(pCenter.sx, pCenter.sy); ctx.lineTo(pEdge.sx, pEdge.sy);
      ctx.strokeStyle = "#0891b2"; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.fillStyle = "#0891b2"; ctx.font = "bold 11px system-ui";
      ctx.fillText("R=f(x)", (pCenter.sx + pEdge.sx) / 2 + 10, (pCenter.sy + pEdge.sy) / 2);
    } else {
      // Cylindrical Shell around Oy
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

      // Radius arrow from Oy to midX
      const pYCenter = project(0, f1(midX) / 2, 0);
      const pShellEdge = project(midX, f1(midX) / 2, 0);
      ctx.beginPath(); ctx.moveTo(pYCenter.sx, pYCenter.sy); ctx.lineTo(pShellEdge.sx, pShellEdge.sy);
      ctx.strokeStyle = "#d97706"; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.fillStyle = "#d97706"; ctx.font = "bold 11px system-ui";
      ctx.fillText("r=x", (pYCenter.sx + pShellEdge.sx) / 2, pYCenter.sy - 4);
    }
    ctx.restore();
  }

  // ─── 7. Rotation Arc Indicator ↺ ────────────────────────────────
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

  // ─── 8. Overlay Badges & Information ─────────────────────────────
  ctx.save();
  // Axis Badge
  ctx.fillStyle = isRevOx ? "#eff6ff" : isRevOy ? "#ecfdf5" : "#faf5ff";
  ctx.strokeStyle = isRevOx ? "#bfdbfe" : isRevOy ? "#a7f3d0" : "#e9d5ff";
  ctx.lineWidth = 1;
  ctx.fillRect(x + 10, y + 10, 160, 48);
  ctx.strokeRect(x + 10, y + 10, 160, 48);

  ctx.fillStyle = isRevOx ? "#1d4ed8" : isRevOy ? "#047857" : "#7e22ce";
  ctx.font = "bold 12px system-ui, sans-serif";
  ctx.textAlign = "left";
  const axisTitle = isRevOx ? "Xoay quanh Ox" : isRevOy ? "Xoay quanh Oy" : "Mặt cắt";
  ctx.fillText("🔄 " + axisTitle + " (" + sweepDeg + "°)", x + 16, y + 26);

  ctx.fillStyle = "#475569";
  ctx.font = "11px system-ui, sans-serif";
  const formulaShort = isRevOx
    ? "V = π ∫ [f² - g²] dx"
    : isRevOy
    ? "V = 2π ∫ x(f - g) dx"
    : "V = ∫ S(x) dx";
  ctx.fillText(formulaShort, x + 16, y + 46);

  // Volume value overlay (Bottom Right)
  if (item.volume != null && isFinite(item.volume)) {
    const volDisplay = "V \u2248 " + fmtVolume(item.volume);
    ctx.font = "bold " + Math.min(15, h * 0.06) + "px system-ui, sans-serif";
    const textW = ctx.measureText(volDisplay).width;
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(x + w - textW - 20, y + h - 34, textW + 14, 26);
    ctx.strokeStyle = "#bfdbfe";
    ctx.strokeRect(x + w - textW - 20, y + h - 34, textW + 14, 26);

    ctx.fillStyle = "#1e40af";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(volDisplay, x + w - 13, y + h - 21);
  }

  ctx.restore();
}
`;

// Replace old drawVolume3D
js = js.slice(0, pStart) + newDrawVolumeCode + js.slice(pEnd);
console.log('✓ Replaced drawVolume3D with advanced 3D rotation engine');

// ─── 2. Inject Volume Controls into selection-bar ───────────────────────────
const selBarTarget = '(o==null?void 0:o.selection)&&f.jsxs("div",{className:"selection-bar",children:[(ee==null?void 0:ee.selectedItem())&&ee.selectedItem().item.type!=="image"&&f.jsxs("button",{onClick:x1,children:[f.jsx(de.edit,{})," ",n.edit]}),';

const volControlsInjection =
  // Volume-specific controls rendered inside the selection-bar
  '(ee==null?void 0:ee.selectedItem())&&ee.selectedItem().item.type==="volume"&&(()=>{' +
    'const _s=ee.selectedItem();' +
    'const it=_s.item;' +
    'const isOx=(it.axis||"ox")==="ox";' +
    'const sw=Math.round(it.sweepAngle??360);' +
    'return f.jsxs(f.Fragment,{children:[' +
      'f.jsx("span",{className:"turn-sep"}),' +
      'f.jsx("button",{className:isOx?"on":"",title:"Xoay quanh trục hoành Ox",onClick:()=>{const v=computeVolume(it.expr,it.expr2||"",it.a??-2,it.b??2,"ox",it.nSlices||24);ee.replaceItem(_s.page,{...it,axis:"ox",volume:v})},children:"Trục Ox"}),' +
      'f.jsx("button",{className:!isOx?"on":"",title:"Xoay quanh trục tung Oy",onClick:()=>{const v=computeVolume(it.expr,it.expr2||"",it.a??-2,it.b??2,"oy",it.nSlices||24);ee.replaceItem(_s.page,{...it,axis:"oy",volume:v})},children:"Trục Oy"}),' +
      'f.jsx("span",{className:"turn-sep"}),' +
      'f.jsx("button",{className:it._playing?"on":"",title:"Tự động quay mô phỏng từ 0° đến 360°",onClick:()=>toggleVolAnim(ee,_s.page,it),children:it._playing?"⏸ Dừng":"▶ Quay 360°"}),' +
      'f.jsxs("label",{style:{display:"inline-flex",alignItems:"center",gap:"5px",fontSize:"12px",padding:"0 4px",cursor:"pointer"},children:[' +
        'f.jsx("span",{children:"Góc:"}),' +
        'f.jsx("b",{style:{minWidth:"32px",textAlign:"right"},children:sw+"°"}),' +
        'f.jsx("input",{type:"range",min:10,max:360,step:5,value:sw,style:{width:"75px"},onChange:e=>{stopVolAnim();ee.replaceItem(_s.page,{...it,sweepAngle:Number(e.target.value),_playing:false})}})' +
      ']}),' +
      'f.jsx("span",{className:"turn-sep"}),' +
      'f.jsx("button",{title:"Xoay góc nhìn 3D sang trái",onClick:()=>ee.replaceItem(_s.page,{...it,viewYaw:(it.viewYaw??0.42)-0.25}),children:"⟲ 3D"}),' +
      'f.jsx("button",{title:"Xoay góc nhìn 3D sang phải",onClick:()=>ee.replaceItem(_s.page,{...it,viewYaw:(it.viewYaw??0.42)+0.25}),children:"⟳ 3D"}),' +
      'f.jsx("button",{title:"Xoay góc nhìn 3D lên",onClick:()=>ee.replaceItem(_s.page,{...it,viewPitch:Math.max(-0.6,(it.viewPitch??0.32)-0.15)}),children:"▲"}),' +
      'f.jsx("button",{title:"Xoay góc nhìn 3D xuống",onClick:()=>ee.replaceItem(_s.page,{...it,viewPitch:Math.min(1.2,(it.viewPitch??0.32)+0.15)}),children:"▼"}),' +
      'f.jsx("span",{className:"turn-sep"}),' +
      'f.jsx("button",{className:it.showSlice?"on":"",title:"Bật/tắt lát cắt vi phân dx (đĩa/vỏ trụ)",onClick:()=>ee.replaceItem(_s.page,{...it,showSlice:!it.showSlice}),children:"📐 Lát cắt dx"}),' +
      'f.jsx("span",{className:"turn-sep"})' +
    ']});' +
  '})(),';

mustReplace(selBarTarget, selBarTarget + volControlsInjection, 'selection-bar volume controls');

// ─── 3. Save ─────────────────────────────────────────────────────────────────
fs.writeFileSync('dist/assets/index-D9JME9Hm.js', js, 'utf8');
console.log('\n🎉 Successfully applied Volume 3D Rotation patch!');
