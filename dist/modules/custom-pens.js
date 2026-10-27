/**
 * =======================================================================
 * 🖋️ CUSTOM PENS MODULE (Study NoteBook)
 * Tách riêng logic các loại bút vẽ & ngòi bút chuyên biệt
 * Dễ dàng mở rộng, chỉnh sửa nét thanh nét đậm mà không cần sửa file bundle lớn.
 * =======================================================================
 */
(function(window) {
  'use strict';

  // 1. Thuật toán bút mài Calligraphy (nét thanh nét đậm theo góc ngòi vát)
  // e: mảng phẳng [x0, y0, r0, x1, y1, r1, ...]
  // t: góc vát ngòi (mặc định -45 độ = -Math.PI / 4)
  // minRatio: độ mảnh nét thanh (mặc định 0.15)
  // maxRatio: độ dày nét đậm (mặc định 1.85)
  function applyCalligraphyStroke(e, t = -Math.PI / 4, minRatio = 0.15, maxRatio = 1.85) {
    const len = e.length / 3;
    let factor = 1;
    for (let s = 0; s < len; s++) {
      const prev = Math.max(0, s - 1) * 3;
      const next = Math.min(len - 1, s + 1) * 3;
      const dx = e[next] - e[prev];
      const dy = e[next + 1] - e[prev + 1];
      if (Math.hypot(dx, dy) > 1e-9) {
        // Góc chuyển động so với góc vát ngòi
        factor = minRatio + (maxRatio - minRatio) * Math.abs(Math.sin(Math.atan2(dy, dx) - t));
      }
      e[s * 3 + 2] *= factor;
    }
  }

  // 2. Thuật toán bút máy Flex Nib (ngòi lá tre uốn theo hướng & lực đưa bút)
  // Nét đưa lên thanh thoát, nét kéo xuống đầm chắc
  function applyFlexStroke(e) {
    const len = e.length / 3;
    for (let n = 0; n < len; n++) {
      const prev = Math.max(0, n - 1) * 3;
      const next = Math.min(len - 1, n + 1) * 3;
      const dy = e[next + 1] - e[prev + 1];
      // Kéo xuống (dy > 0) nét đậm, đưa lên (dy <= 0) nét thanh
      const factor = dy > 0.35 ? Math.min(1.85, 0.85 + dy / 2.8) : 0.26;
      e[n * 3 + 2] *= factor;
    }
  }

  // 3. Cung cấp API cho hệ thống
  window.CustomPens = {
    applyCalligraphyStroke: applyCalligraphyStroke,
    applyFlexStroke: applyFlexStroke,
    
    // Dispatcher xử lý mọi loại bút mở rộng
    processStroke: function(penType, strokeBuffer) {
      if (penType === 'calligraphy') {
        applyCalligraphyStroke(strokeBuffer, -Math.PI / 4, 0.15, 1.85);
        return true;
      }
      if (penType === 'marker') {
        applyCalligraphyStroke(strokeBuffer, -Math.PI / 3, 0.35, 1.9);
        return true;
      }
      if (penType === 'flex') {
        applyFlexStroke(strokeBuffer);
        return true;
      }
      if (penType === 'fineliner') {
        // Bút kim: giữ nét cố định tinh xảo
        const len = strokeBuffer.length / 3;
        for (let s = 0; s < len; s++) {
          strokeBuffer[s * 3 + 2] *= 0.75;
        }
        return true;
      }
      return false;
    }
  };

  console.log('[Module] CustomPens loaded with active stroke processors.');
})(window);
