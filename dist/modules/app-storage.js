/**
 * =======================================================================
 * APP STORAGE & PERSISTENCE MODULE (Study NoteBook)
 * Quản lý lưu trữ tự động, phục hồi dữ liệu khi F5,
 * và bảo vệ cấu hình giao diện (pagesPanel, toolbar, theme).
 * =======================================================================
 */
(function(window) {
  'use strict';

  // 1. Khởi tạo & bảo vệ cấu hình người dùng
  function initUserPreferences() {
    try {
      const prefs = JSON.parse(localStorage.getItem('prefs') || '{}');
      
      // Đảm bảo thanh trang bên trái luôn bật mặc định
      if (prefs.pagesPanel === undefined || prefs.pagesPanel === false) {
        prefs.pagesPanel = true;
      }
      
      // Bật vẽ bằng ngón tay nếu màn hình cảm ứng
      const isTouch = (window.innerWidth <= 768) || 
                      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
                      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isTouch) {
        prefs.fingerDraw = true;
      }

      localStorage.setItem('prefs', JSON.stringify(prefs));
    } catch (err) {
      console.warn('[AppStorage] Could not parse prefs from localStorage:', err);
    }
  }

  // 2. Tự động lưu bản sao lưu (Auto Backup)
  let _backupTimer = null;
  function triggerAutoBackup(docData) {
    if (!docData) return;
    if (_backupTimer) clearTimeout(_backupTimer);
    _backupTimer = setTimeout(() => {
      try {
        const payload = JSON.stringify({
          timestamp: Date.now(),
          pagesCount: docData.pages ? docData.pages.length : 0,
          doc: docData
        });
        sessionStorage.setItem('studynotebook_session_doc', payload);
      } catch (e) {
        // Có thể vượt quota storage nếu tài liệu quá lớn
      }
    }, 1000);
  }

  // 3. Phục hồi bản sao lưu phiên làm việc gần nhất nếu cần
  function recoverSessionDoc() {
    try {
      const raw = sessionStorage.getItem('studynotebook_session_doc');
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data && data.doc) {
        console.log('[AppStorage] Recovered session doc with', data.pagesCount, 'pages from', new Date(data.timestamp));
        return data.doc;
      }
    } catch (err) {
      console.warn('[AppStorage] Error recovering session doc:', err);
    }
    return null;
  }

  // Chạy ngay khi file được load
  initUserPreferences();

  // 4. Xuất đối tượng Global
  window.AppStorage = {
    initUserPreferences: initUserPreferences,
    triggerAutoBackup: triggerAutoBackup,
    recoverSessionDoc: recoverSessionDoc
  };

  console.log('[Module] AppStorage loaded successfully.');
})(window);
