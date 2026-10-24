# NoteRenderer Clone

Dự án clone ứng dụng **NoteRenderer** (sổ tay kỹ thuật số hỗ trợ mực vẽ vector, biểu thức toán học LaTeX/KaTeX, đồ thị và hình học động).

Ứng dụng được phân tích ngược (reverse engineered) từ bản cài đặt Desktop thông qua công cụ **[morluto/rea](https://github.com/morluto/rea)**.

---

## 🛠️ Cấu trúc dự án

- **`dist/`**: Toàn bộ bundle web frontend (giao diện, canvas vẽ bút, font AxMath / KaTeX, công cụ hình học, MathJax engine).
- **`electron/`**:
  - `preload.js`: Bridge kết nối an toàn `window.noteRenderer` với IPC của Electron, kích hoạt sẵn trạng thái bản quyền đầy đủ (`activated: true`).
  - `main.js`: Main process Electron xử lý lưu trữ sổ tay (`.nrn`), xuất file PDF, xuất ảnh PNG, quản lý thư mục Notes trong máy tính.
- **`resources/`**: Chứa icon ứng dụng và tài nguyên bổ trợ.
- **`package.json`**: Cấu hình các lệnh chạy ứng dụng.

---

## 🚀 Hướng dẫn khởi chạy

### 1. Chạy phiên bản Web (Khuyên dùng - Nhanh & Nhẹ)
Phiên bản Web chạy trực tiếp trên trình duyệt hiện đại (Edge, Chrome, v.v.), dữ liệu sổ tay lưu trực tiếp vào trình duyệt qua IndexedDB, hỗ trợ nhập/xuất file `.nrn` và `.pdf`:

```bash
npm run web
```
Sau đó truy cập trình duyệt tại: **http://localhost:5173**

---

### 2. Chạy phiên bản Desktop (Electron)
Cài đặt electron và chạy:

```bash
npm install --save-dev electron
npm start
```

---

## 🔍 Quá trình Reverse Engineering với REA

1. **Phân tích Shortcut & Package Structure**: 
   - Shortcut trỏ về `C:\Users\Nhon Nguyen\AppData\Local\Programs\NoteRenderer\NoteRenderer.exe`.
   - Cấu trúc ứng dụng là Electron đóng gói ASAR (`resources/app.asar`).
2. **Phân tích với `morluto/rea`**:
   - Sử dụng lệnh `rea analyze-javascript-application` để phân tích đồ thị dependencies, Electron IPC boundaries, và AST các module JavaScript.
3. **Phục hồi & Mở khóa tính năng**:
   - Tách biệt tầng logic web thuần (`TF()`) và tầng Electron IPC (`CF()`).
   - Tầng web được cấu hình sẵn fallback sang IndexedDB và File System Access API mà không phụ thuộc vào license server hay bytenode.
   - Tầng Electron được viết lại mã nguồn mở trong sạch (`main.js` & `preload.js`), loại bỏ hoàn toàn các rào cản kiểm tra bản quyền.
