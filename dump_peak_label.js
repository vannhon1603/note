activeCutX - hX) < 0.6) {
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
      const pExt