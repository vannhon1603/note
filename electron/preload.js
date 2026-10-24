const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("noteRenderer", {
  licenseStatus: async () => ({
    activated: true,
    trial: { state: "active", daysLeft: 999 }
  }),
  activateLicense: async (key) => ({ activated: true }),
  startTrial: async () => ({ activated: true }),
  ready: () => {
    ipcRenderer.send("app-ready");
  },
  renderFormula: null, // Frontend will use built-in MathJax (aB) when null
  openFile: async () => {
    return await ipcRenderer.invoke("dialog-open-file");
  },
  library: {
    list: async () => {
      return await ipcRenderer.invoke("library-list");
    },
    read: async (dir, name) => {
      return await ipcRenderer.invoke("library-read", dir, name);
    },
    write: async (dir, name, bytes) => {
      return await ipcRenderer.invoke("library-write", dir, name, bytes);
    },
    exists: async (dir, name) => {
      return await ipcRenderer.invoke("library-exists", dir, name);
    },
    makeDir: async (dir) => {
      return await ipcRenderer.invoke("library-make-dir", dir);
    },
    moveDir: async (fromDir, toDir) => {
      return await ipcRenderer.invoke("library-move-dir", fromDir, toDir);
    },
    removeDir: async (dir) => {
      return await ipcRenderer.invoke("library-remove-dir", dir);
    },
    moveFile: async (fromDir, fromName, toDir, toName) => {
      return await ipcRenderer.invoke("library-move-file", fromDir, fromName, toDir, toName);
    },
    removeFile: async (dir, name) => {
      return await ipcRenderer.invoke("library-remove-file", dir, name);
    }
  },
  saveElsewhere: async (bytes, name) => {
    return await ipcRenderer.invoke("dialog-save-elsewhere", bytes, name);
  },
  setDirty: (dirty) => {
    ipcRenderer.send("set-dirty", dirty);
  },
  setTitle: (title) => {
    ipcRenderer.send("set-title", title);
  },
  setAutosave: (enabled) => {
    ipcRenderer.send("set-autosave", enabled);
  },
  exportPdf: async (pdfBuffer) => {
    return await ipcRenderer.invoke("export-pdf", pdfBuffer);
  },
  exportPngFolder: async () => {
    return await ipcRenderer.invoke("export-png-folder");
  },
  exportPngPage: async (imageDataUrl, pageName) => {
    return await ipcRenderer.invoke("export-png-page", imageDataUrl, pageName);
  },
  clipboardImage: async () => {
    return await ipcRenderer.invoke("clipboard-image");
  },
  captureScreen: async () => {
    return await ipcRenderer.invoke("capture-screen");
  },
  callGemini: async (params) => {
    return await ipcRenderer.invoke("gemini-generate", params);
  },
  testGeminiKey: async (params) => {
    return await ipcRenderer.invoke("gemini-test-key", params);
  },
  copyText: async (text) => {
    return await ipcRenderer.invoke("copy-text", text);
  },
  appVersion: async () => "0.4.8",
  notesFolder: async () => {
    return await ipcRenderer.invoke("notes-folder-get");
  },
  chooseNotesFolder: async () => {
    return await ipcRenderer.invoke("notes-folder-choose");
  },
  openNotesFolder: async () => {
    return await ipcRenderer.invoke("notes-folder-open");
  },
  newWindow: () => {
    ipcRenderer.send("window-new");
  },
  closeWindow: () => {
    ipcRenderer.send("window-close");
  },
  toggleFullScreen: () => {
    ipcRenderer.send("window-toggle-fullscreen");
  },
  checkForUpdates: () => {
    ipcRenderer.send("check-for-updates");
  },
  setLanguage: (lang) => {
    ipcRenderer.send("set-language", lang);
  },
  closeReady: () => {
    ipcRenderer.send("close-ready");
  },
  onOpenDoc: (callback) => {
    const handler = (event, doc) => callback(doc);
    ipcRenderer.on("open-doc", handler);
    return () => ipcRenderer.removeListener("open-doc", handler);
  },
  onOpenPdf: (callback) => {
    const handler = (event, pdf) => callback(pdf);
    ipcRenderer.on("open-pdf", handler);
    return () => ipcRenderer.removeListener("open-pdf", handler);
  },
  onPenButton: (callback) => {
    const handler = (event, button) => callback(button);
    ipcRenderer.on("pen-button", handler);
    return () => ipcRenderer.removeListener("pen-button", handler);
  },
  onSaveAndClose: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("save-and-close", handler);
    return () => ipcRenderer.removeListener("save-and-close", handler);
  },
  onUpdateStatus: (callback) => {
    const handler = (event, status) => callback(status);
    ipcRenderer.on("update-status", handler);
    return () => ipcRenderer.removeListener("update-status", handler);
  }
});
