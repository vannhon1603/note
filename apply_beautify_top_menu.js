const fs = require('fs');

const file = 'dist/assets/index-D9JME9Hm.js';
let content = fs.readFileSync(file, 'utf8');

const pStart = content.indexOf('// ─── 9. Sleek Unified Top Header Bar (Tabs, Formula, SGK View) ───');
const pEnd = content.indexOf('// ─── 10. Sleek Bottom Footer Bar (Slider + Volume Result Pill) ─────');

if (pStart === -1 || pEnd === -1) {
  console.error('[ERROR] Markers not found!');
  process.exit(1);
}

const newSection9 = `// ─── 9. Sleek Unified Top Header Bar (Tabs, Formula, SGK View) ───
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
      ctx.fillText("🔒 Quay trục", tab1X + tab1W / 2, tabY + tabH / 2);
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
      ctx.fillText("🔄 Quay trục", tab1X + tab1W / 2, tabY + tabH / 2);
    } else {
      ctx.fillStyle = "#64748b"; ctx.font = "600 10px system-ui, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("🔄 Quay trục", tab1X + tab1W / 2, tabY + tabH / 2);
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
    ctx.fillText("📐 Lát cắt", tab2X + tab2W / 2, tabY + tabH / 2);
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

  `;

content = content.slice(0, pStart) + newSection9 + content.slice(pEnd);
fs.writeFileSync(file, content, 'utf8');
console.log('[SUCCESS] Top Header Bar completely redesigned with modern glassmorphism aesthetics!');
