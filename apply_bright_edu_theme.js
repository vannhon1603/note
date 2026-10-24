const fs = require("fs");

let css = fs.readFileSync("dist/assets/index-Bcmxra3u.css", "utf8");

const brightEduTheme = `
/* ============================================================
   🌟 BRIGHT EDUCATIONAL THEME (MÀU SẮC GIÁO DỤC TƯƠI SÁNG)
   ============================================================ */

:root {
  --ink: #0f172a !important;
  --muted: #475569 !important;
  --accent: #0284c7 !important;
  --accent-dark: #0369a1 !important;
  --accent-light: #e0f2fe !important;
  --accent-hover: #38bdf8 !important;
  --line: #e2e8f0 !important;
  --edu-blue: #0284c7;
  --edu-emerald: #10b981;
  --edu-amber: #f59e0b;
  --edu-violet: #8b5cf6;
  --edu-rose: #f43f5e;
  --bg-desk: #f1f5f9;
}

/* --- App Workspace & Desk --- */
body {
  background: #f1f5f9 !important;
  color: #0f172a !important;
}

.app {
  background: #f1f5f9 !important;
}

.board-wrap {
  background: #f1f5f9 !important;
}

.board {
  background: #f1f5f9 !important;
}

/* --- Top Toolbar: Luminous, Fresh & Cheerful --- */
.toolbar {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%) !important;
  border-bottom: 1px solid #e2e8f0 !important;
  box-shadow: 0 4px 16px rgba(2, 132, 199, 0.05) !important;
  height: 64px !important;
  padding: 0 12px !important;
}

/* Toolbar Buttons */
.tbar-btn {
  border-radius: 9px !important;
  color: #334155 !important;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative;
}

.tbar-btn:hover {
  background: #eff6ff !important;
  color: #0284c7 !important;
  transform: translateY(-1.5px) !important;
  box-shadow: 0 3px 8px rgba(2, 132, 199, 0.15) !important;
}

.tbar-btn:active {
  transform: translateY(0) !important;
}

.tbar-btn.active,
.active {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%) !important;
  color: #ffffff !important;
  border-color: #0284c7 !important;
  box-shadow: 0 3px 12px rgba(2, 132, 199, 0.35) !important;
  border-radius: 9px !important;
}

/* --- Sidebar: Page Thumbnails Panel --- */
.pages-panel {
  background: linear-gradient(180deg, #f8fafc 0%, #f0f7ff 100%) !important;
  border-right: 1px solid #e0e7ff !important;
  box-shadow: 2px 0 10px rgba(15, 23, 42, 0.03) !important;
}

.page-thumb {
  color: #0284c7 !important;
  font-weight: 600 !important;
  transition: transform 0.15s ease !important;
}

.page-thumb:hover {
  transform: scale(1.03) !important;
}

.page-thumb-img {
  background: #ffffff !important;
  border-radius: 6px !important;
  outline: 1.5px solid #cbd5e1 !important;
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.07) !important;
  transition: all 0.2s ease !important;
}

.page-thumb.active .page-thumb-img,
.page-thumb-img.active {
  outline-color: #0284c7 !important;
  outline-width: 2.5px !important;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.25), 0 6px 16px rgba(2, 132, 199, 0.2) !important;
}

/* --- Bottom Sheet Bar (Tabs) --- */
.sheet-bar {
  background: linear-gradient(0deg, #f8fafc 0%, #f0f7ff 100%) !important;
  border-top: 1px solid #e0e7ff !important;
  padding-top: 3px !important;
}

.sheet-add {
  color: #0284c7 !important;
  font-weight: 700 !important;
  transition: all 0.15s ease !important;
}

.sheet-add:hover {
  background: #e0f2fe !important;
  border-radius: 6px !important;
}

.sheet-btn,
button.sheet-btn {
  background: #ffffff !important;
  color: #334155 !important;
  border: 1px solid #e2e8f0 !important;
  border-bottom: none !important;
  border-radius: 8px 8px 0 0 !important;
  font-weight: 600 !important;
  padding: 6px 14px !important;
  margin-right: 4px !important;
  transition: all 0.15s ease !important;
}

.sheet-btn:hover {
  background: #f0f9ff !important;
  color: #0284c7 !important;
}

.sheet-btn.active {
  background: #ffffff !important;
  color: #0284c7 !important;
  border-top: 3px solid #0284c7 !important;
  font-weight: 700 !important;
  box-shadow: 0 -3px 10px rgba(2, 132, 199, 0.12) !important;
}

/* --- Floating Selection Bar (Sửa, Sao chép, Nhân bản, Cắt, Xóa) --- */
.shape-tab-btn {
  background: #f8fafc !important;
  color: #1e293b !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
  transition: all 0.15s ease !important;
}

.shape-tab-btn:hover {
  background: #e0f2fe !important;
  color: #0284c7 !important;
  border-color: #bae6fd !important;
  transform: translateY(-1px) !important;
}

.cs-btn-export {
  background: #e0f2fe !important;
  color: #0284c7 !important;
  border: 1px solid #bae6fd !important;
  font-weight: 600 !important;
}

.cs-btn-export:hover {
  background: #0284c7 !important;
  color: #ffffff !important;
}

/* Floating Action Menu pill */
div[style*="box-shadow"],
.item-actions {
  border-radius: 12px !important;
}

/* --- Modals & Dialogs --- */
.dialog-backdrop {
  background: rgba(15, 23, 42, 0.45) !important;
  backdrop-filter: blur(4px) !important;
}

.dialog {
  border-radius: 16px !important;
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.2) !important;
  border: 1px solid #e2e8f0 !important;
  overflow: hidden !important;
}

.dialog-head {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%) !important;
  border-bottom: 1px solid #e2e8f0 !important;
  color: #0f172a !important;
  font-weight: 700 !important;
  font-size: 16px !important;
  padding: 14px 18px !important;
}

.dialog-close {
  color: #64748b !important;
  border-radius: 6px !important;
  transition: all 0.15s ease !important;
}

.dialog-close:hover {
  background: #fee2e2 !important;
  color: #ef4444 !important;
}

/* Primary Educational Button */
button.primary,
.primary {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%) !important;
  border-color: #0284c7 !important;
  color: #ffffff !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  box-shadow: 0 3px 10px rgba(2, 132, 199, 0.25) !important;
  transition: all 0.15s ease !important;
}

button.primary:hover,
.primary:hover {
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4) !important;
  transform: translateY(-1px) !important;
  filter: brightness(1.05) !important;
}

button.primary:active,
.primary:active {
  transform: translateY(0) !important;
}

/* Cancel / Default Button */
.dialog-actions button:not(.primary) {
  border-radius: 8px !important;
  border: 1px solid #cbd5e1 !important;
  background: #ffffff !important;
  color: #334155 !important;
  font-weight: 600 !important;
  transition: all 0.15s ease !important;
}

.dialog-actions button:not(.primary):hover {
  background: #f1f5f9 !important;
  color: #0f172a !important;
  border-color: #94a3b8 !important;
}

/* Inputs & Selects */
input[type="text"],
input[type="number"],
input:not([type]),
select {
  border: 1.5px solid #cbd5e1 !important;
  border-radius: 7px !important;
  color: #0f172a !important;
  transition: all 0.15s ease !important;
}

input:focus,
select:focus {
  border-color: #0284c7 !important;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.18) !important;
  outline: none !important;
}

/* Pen & Settings Panels */
.pen-panel,
.settings-panel,
.menu-panel {
  border-radius: 14px !important;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.15) !important;
  border: 1px solid #e2e8f0 !important;
  background: #ffffff !important;
}

/* Modern Rounded Scrollbars */
::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Educational Accents for Formula & Text */
.math-block,
.katex {
  color: #0f172a !important;
}
`;

// Append the bright educational theme at the bottom of the CSS bundle
css += "\n" + brightEduTheme;
fs.writeFileSync("dist/assets/index-Bcmxra3u.css", css, "utf8");
console.log("Bright educational theme appended successfully! Total CSS size:", css.length);
