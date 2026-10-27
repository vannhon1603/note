/**
 * =======================================================================
 * 🔄 AUTO-ROTATE MODULE (Study NoteBook)
 * Tự động xoay khối không gian quanh trục đứng (chế độ bàn xoay).
 *
 * Board API (trong index bundle):
 *   board.autoTurnBegin()   -> chụp hình gốc, bật turning.auto (nút đổi trạng thái)
 *   board.autoTurnStep(px)  -> xoay thêm px (480px = 360°), vẽ tạm qua board.live
 *   board.autoTurnEnd()     -> commit 1 lần vào lịch sử (Undo được), tắt turning.auto
 * Nét đứt/nét liền được tính lại mỗi khung hình bởi S_ -> pP như khi kéo tay.
 * =======================================================================
 */
(function (window) {
  'use strict';

  const DEG_PER_PX = 0.75;      // gP: Math.PI/240 rad mỗi px
  let degPerSec = 45;           // tốc độ mặc định: 45°/giây (8 giây/vòng)
  let active = false;
  let rafId = 0;
  let board = null;

  function stop() {
    if (!active) return;
    active = false;
    cancelAnimationFrame(rafId);
    rafId = 0;
    const b = board;
    board = null;
    if (b && typeof b.autoTurnEnd === 'function') b.autoTurnEnd();
  }

  function start(b) {
    if (active || !b || typeof b.autoTurnBegin !== 'function') return;
    if (!b.autoTurnBegin()) return;
    board = b;
    active = true;
    let last = performance.now();

    const loop = (now) => {
      if (!active) return;
      const dt = Math.min(64, now - last); // tránh nhảy cóc khi tab bị ẩn
      last = now;
      if (!board.turning || !board.autoTurnStep((degPerSec * dt / 1000) / DEG_PER_PX)) {
        stop();
        return;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
  }

  window.AutoRotate = {
    get active() { return active; },
    start,
    stop,
    toggle(b) { active ? stop() : start(b); },
    setSpeed(deg) { degPerSec = Math.max(5, Math.min(360, Number(deg) || 45)); }
  };
})(window);
