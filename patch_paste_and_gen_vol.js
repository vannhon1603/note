const fs = require('fs');

const FILE = 'dist/assets/index-D9JME9Hm.js';
let js = fs.readFileSync(FILE, 'utf8');

function replaceExact(searchStr, replaceStr, label) {
  const idx = js.indexOf(searchStr);
  if (idx === -1) {
    throw new Error('NOT FOUND: ' + label);
  }
  js = js.slice(0, idx) + replaceStr + js.slice(idx + searchStr.length);
  console.log('✓ Success:', label);
}

// 1. Fix isFaceVisible bug in drawVolume3D
const bugTarget = `        // Đường biên trong (nếu có hàm f2 / khối rỗng)
        if (face.hasInner && pts.length > face.nArch * 2) {
          ctx.save();
          if (!isFaceVisible) {
            ctx.setLineDash([4, 3]);
            ctx.strokeStyle = "rgba(30, 64, 175, 0.65)";
            ctx.lineWidth = 1.3;
          } else {
            ctx.setLineDash([]);
            ctx.strokeStyle = face.stroke || "rgba(29, 78, 216, 0.90)";
            ctx.lineWidth = 1.6;
          }
          ctx.beginPath();
          ctx.moveTo(pts[face.nArch + 1].sx, pts[face.nArch + 1].sy);
          for (let k = face.nArch + 2; k < pts.length; k++) ctx.lineTo(pts[k].sx, pts[k].sy);
          ctx.stroke();
          ctx.restore();
        }`;

const bugFix = `        // Đường biên trong (nếu có hàm f2 / khối rỗng)
        if (face.hasInner && pts.length > face.nArch * 2) {
          ctx.save();
          if (face.dashed) {
            ctx.setLineDash([4, 3]);
            ctx.strokeStyle = "rgba(30, 64, 175, 0.65)";
            ctx.lineWidth = 1.3;
          } else {
            ctx.setLineDash([]);
            ctx.strokeStyle = face.stroke || "rgba(29, 78, 216, 0.90)";
            ctx.lineWidth = 1.6;
          }
          ctx.beginPath();
          ctx.moveTo(pts[face.nArch + 1].sx, pts[face.nArch + 1].sy);
          for (let k = face.nArch + 2; k < pts.length; k++) ctx.lineTo(pts[k].sx, pts[k].sy);
          ctx.stroke();
          ctx.restore();
        }`;

replaceExact(bugTarget, bugFix, 'Fix isFaceVisible ReferenceError in drawVolume3D');

// 2. Fix testGeminiApiKey and callGeminiVision model mapping
const geminiApiTarget = `async function testGeminiApiKey(apiKey, model) {
  if (!apiKey || !apiKey.trim()) return { ok: false, error: "Chưa nhập API Key" };
  const key = apiKey.trim();
  let selectedModel = (model || localStorage.getItem("gemini_model") || "gemini-3.8-flash").trim().replace(/^models\\//, "");
  if (selectedModel === "gemini-2.0-flash") selectedModel = "gemini-3.8-flash";
  if (window.noteRenderer && window.noteRenderer.testGeminiKey) {
    return await window.noteRenderer.testGeminiKey({ apiKey: key, model: selectedModel });
  }
  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(selectedModel) + ":generateContent?key=" + encodeURIComponent(key);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Ping test. Return JSON: {\\"status\\": \\"ok\\"}" }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      let msg = errText;
      try { msg = JSON.parse(errText).error?.message || errText; } catch (e) {}
      return { ok: false, error: msg };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
}

async function callGeminiVision({ apiKey, model, prompt, imageBase64, mimeType }) {
  let selectedModel = (model || localStorage.getItem("gemini_model") || "gemini-3.8-flash").trim().replace(/^models\\//, "");
  if (selectedModel === "gemini-2.0-flash") selectedModel = "gemini-3.8-flash";
  let rawData;
  if (window.noteRenderer && window.noteRenderer.callGemini) {
    rawData = await window.noteRenderer.callGemini({
      apiKey: apiKey.trim(),
      model: selectedModel,
      prompt,
      imageBase64,
      mimeType: mimeType || "image/png"
    });
  } else {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(selectedModel) + ":generateContent?key=" + encodeURIComponent(apiKey.trim());
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType || "image/png", data: imageBase64 } }
          ]
        }],
        generationConfig: {
          response_mime_type: "application/json"
        }
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      let msg = errText;
      try { msg = JSON.parse(errText).error?.message || errText; } catch (e) {}
      throw new Error(msg);
    }
    rawData = await res.json();
  }
  const text = rawData?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini không trả về nội dung hợp lệ.");
  let cleanText = text.trim();
  if (cleanText.startsWith("\`\`\`json")) {
    cleanText = cleanText.replace(/^\`\`\`json\\s*/i, "").replace(/\\s*\`\`\`$/, "");
  } else if (cleanText.startsWith("\`\`\`")) {
    cleanText = cleanText.replace(/^\`\`\`\\s*/, "").replace(/\\s*\`\`\`$/, "");
  }
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    throw new Error("Không thể phân tích dữ liệu JSON từ Gemini: " + cleanText.slice(0, 150));
  }
}`;

const geminiApiFix = `try {
  const _curM = localStorage.getItem("gemini_model");
  if (_curM && (_curM.includes("1.5-flash") || _curM.includes("2.0-flash") || _curM === "gemini-1.5" || _curM === "gemini-2.0")) {
    localStorage.setItem("gemini_model", "gemini-3.8-flash");
  }
} catch (e) {}

function getGeminiActualModel(model) {
  let m = (model || localStorage.getItem("gemini_model") || "gemini-3.8-flash").trim().replace(/^models\\//, "");
  if (!m || m === "gemini-1.5-flash" || m === "gemini-2.0-flash" || m.includes("1.5-flash") || m.includes("2.0-flash") || m === "gemini-1.5" || m === "gemini-2.0") {
    m = "gemini-3.8-flash";
    try { localStorage.setItem("gemini_model", "gemini-3.8-flash"); } catch (e) {}
  } else if (m === "gemini-1.5-pro" || m === "gemini-2.0-pro" || m.includes("1.5-pro") || m.includes("2.0-pro")) {
    m = "gemini-2.5-pro";
    try { localStorage.setItem("gemini_model", "gemini-2.5-pro"); } catch (e) {}
  }
  return m || "gemini-3.8-flash";
}

async function testGeminiApiKey(apiKey, model) {
  if (!apiKey || !apiKey.trim()) return { ok: false, error: "Chưa nhập API Key" };
  const key = apiKey.trim();
  const apiModel = getGeminiActualModel(model);
  if (window.noteRenderer && window.noteRenderer.testGeminiKey) {
    return await window.noteRenderer.testGeminiKey({ apiKey: key, model: apiModel });
  }
  try {
    let url = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(apiModel) + ":generateContent?key=" + encodeURIComponent(key);
    let res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Ping test. Return JSON: {\\"status\\": \\"ok\\"}" }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });
    if (!res.ok && res.status === 404 && apiModel !== "gemini-2.5-flash") {
      url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(key);
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Ping test. Return JSON: {\\"status\\": \\"ok\\"}" }] }],
          generationConfig: { response_mime_type: "application/json" }
        })
      });
    }
    if (!res.ok) {
      const errText = await res.text();
      let msg = errText;
      try { msg = JSON.parse(errText).error?.message || errText; } catch (e) {}
      return { ok: false, error: msg };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
}

async function callGeminiVision({ apiKey, model, prompt, imageBase64, mimeType }) {
  const apiModel = getGeminiActualModel(model);
  let rawData;
  if (window.noteRenderer && window.noteRenderer.callGemini) {
    rawData = await window.noteRenderer.callGemini({
      apiKey: apiKey.trim(),
      model: apiModel,
      prompt,
      imageBase64,
      mimeType: mimeType || "image/png"
    });
  } else {
    let url = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(apiModel) + ":generateContent?key=" + encodeURIComponent(apiKey.trim());
    let res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType || "image/png", data: imageBase64 } }
          ]
        }],
        generationConfig: {
          response_mime_type: "application/json"
        }
      })
    });
    if (!res.ok && res.status === 404 && apiModel !== "gemini-2.5-flash") {
      // Fallback to gemini-2.5-flash
      url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(apiKey.trim());
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType || "image/png", data: imageBase64 } }
            ]
          }],
          generationConfig: {
            response_mime_type: "application/json"
          }
        })
      });
    }
    if (!res.ok) {
      const errText = await res.text();
      let msg = errText;
      try { msg = JSON.parse(errText).error?.message || errText; } catch (e) {}
      throw new Error(msg);
    }
    rawData = await res.json();
  }
  const text = rawData?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini không trả về nội dung hợp lệ.");
  let cleanText = text.trim();
  if (cleanText.startsWith("\`\`\`json")) {
    cleanText = cleanText.replace(/^\`\`\`json\\s*/i, "").replace(/\\s*\`\`\`$/, "");
  } else if (cleanText.startsWith("\`\`\`")) {
    cleanText = cleanText.replace(/^\`\`\`\\s*/, "").replace(/\\s*\`\`\`$/, "");
  }
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    throw new Error("Không thể phân tích dữ liệu JSON từ Gemini: " + cleanText.slice(0, 150));
  }
}`;

replaceExact(geminiApiTarget, geminiApiFix, 'Fix Gemini model fallback and URL handling');

// 3. Fix pasteImageFromClipboard
const pasteClipboardTarget = `async function pasteImageFromClipboard() {
  if (window.noteRenderer && window.noteRenderer.clipboardImage) {
    const img = await window.noteRenderer.clipboardImage();
    if (img) return img;
  }
  if (navigator.clipboard && navigator.clipboard.read) {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find(t => t.startsWith("image/"));
        if (type) {
          const blob = await item.getType(type);
          return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }
      }
    } catch (e) {}
  }
  return null;
}`;

const pasteClipboardFix = `async function pasteImageFromClipboard() {
  if (window.noteRenderer && window.noteRenderer.clipboardImage) {
    try {
      const img = await window.noteRenderer.clipboardImage();
      if (img) return img;
    } catch (e) {}
  }
  if (navigator.clipboard && navigator.clipboard.read) {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find(t => t.startsWith("image/"));
        if (type) {
          const blob = await item.getType(type);
          return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }
      }
    } catch (e) {
      console.warn("navigator.clipboard.read error:", e);
    }
  }
  if (window._nrnLastPastedImage) {
    return window._nrnLastPastedImage;
  }
  return null;
}`;

replaceExact(pasteClipboardTarget, pasteClipboardFix, 'Improve pasteImageFromClipboard with fallback');

// 4. In VolumeDialog, fix state initialization and setModalSweep(360) on AI gen
const vdProcessTarget = `      setExpr(res.expr);
      setExpr2(res.expr2 || "");
      setAxis(res.axis || "ox");
      setAStr(String(res.a != null ? res.a : -2));
      setBStr(String(res.b != null ? res.b : 2));
      setSelectedPreset("");
      setGeminiResult(res);

      const av = typeof res.a === "number" ? res.a : sh(String(res.a).replace(",", "."));
      const bv = typeof res.b === "number" ? res.b : sh(String(res.b).replace(",", "."));
      if (isFinite(av) && isFinite(bv) && bv > av) {
        const vol = computeVolume(res.expr, res.expr2 || "", av, bv, res.axis || "ox", nSlices);
        if (vol !== null) setResult(vol);
      }`;

const vdProcessFix = `      setExpr(res.expr);
      setExpr2(res.expr2 || "");
      const resAxis = res.axis || "ox";
      setAxis(resAxis);
      setAStr(String(res.a != null ? res.a : -2));
      setBStr(String(res.b != null ? res.b : 2));
      setSelectedPreset("");
      setGeminiResult(res);
      // Đảm bảo góc quét tự động đặt 360 độ để hiển thị ngay khối tròn xoay 3D hoàn chỉnh
      if (!resAxis.startsWith("sec-")) {
        setModalSweep(360);
      }

      const av = typeof res.a === "number" ? res.a : sh(String(res.a).replace(",", "."));
      const bv = typeof res.b === "number" ? res.b : sh(String(res.b).replace(",", "."));
      if (isFinite(av) && isFinite(bv) && bv > av) {
        const vol = computeVolume(res.expr, res.expr2 || "", av, bv, resAxis, nSlices);
        if (vol !== null) setResult(vol);
      }`;

replaceExact(vdProcessTarget, vdProcessFix, 'Auto set sweep to 360 on AI volume generation');

// 5. In VolumeDialog, enhance paste and keyboard Ctrl+V listener
const vdPasteEffectTarget = `  H.useEffect(() => {
    const onPaste = (e) => {
      if (!e.clipboardData || !e.clipboardData.items) return;
      for (const it of e.clipboardData.items) {
        if (it.type.startsWith("image/")) {
          e.preventDefault();
          const file = it.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              const dataUrl = reader.result;
              setCapturedImage(dataUrl);
              processImageWithGemini(dataUrl);
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [quickApiKey, quickModel, nSlices]);`;

const vdPasteEffectFix = `  H.useEffect(() => {
    let busyPasting = false;
    const handleImageData = (dataUrl) => {
      if (!dataUrl || busyPasting) return;
      busyPasting = true;
      setCapturedImage(dataUrl);
      processImageWithGemini(dataUrl).finally(() => { busyPasting = false; });
    };

    // 1. Native paste event (when focus is in inputs or window dispatches paste)
    const onPaste = (e) => {
      const items = e.clipboardData?.items || [];
      for (const it of items) {
        if (it.type.startsWith("image/")) {
          e.preventDefault();
          e.stopPropagation();
          const file = it.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = () => handleImageData(reader.result);
            reader.readAsDataURL(file);
            return;
          }
        }
      }
      const files = e.clipboardData?.files || [];
      if (files.length > 0 && files[0].type.startsWith("image/")) {
        e.preventDefault();
        e.stopPropagation();
        const reader = new FileReader();
        reader.onload = () => handleImageData(reader.result);
        reader.readAsDataURL(files[0]);
      }
    };

    // 2. Direct keyboard shortcut listener for Ctrl+V / Cmd+V
    // (Bắt buộc phải có vì Chrome/Edge không kích hoạt sự kiện DOM 'paste' lên window khi người dùng bấm Ctrl+V ở vùng không phải ô nhập văn bản!)
    const onKeyDown = async (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "v" || e.key === "V")) {
        try {
          const imgUrl = await pasteImageFromClipboard();
          if (imgUrl) {
            e.preventDefault();
            e.stopPropagation();
            handleImageData(imgUrl);
          }
        } catch (err) {
          console.warn("Keyboard paste Ctrl+V handler:", err);
        }
      }
    };

    window.addEventListener("paste", onPaste, true);
    window.addEventListener("keydown", onKeyDown, true);

    // Kiểm tra nếu có ảnh tự động truyền vào khi mở modal
    if (item?.autoImage) {
      handleImageData(item.autoImage);
    } else if (window._nrnPendingVolumeImage) {
      const pending = window._nrnPendingVolumeImage;
      window._nrnPendingVolumeImage = null;
      handleImageData(pending);
    }

    return () => {
      window.removeEventListener("paste", onPaste, true);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [quickApiKey, quickModel, nSlices]);`;

replaceExact(vdPasteEffectTarget, vdPasteEffectFix, 'Enhance VolumeDialog with robust Ctrl+V keydown & paste listeners');

// 6. Enhance canvas Uh() paste so when an image is pasted on canvas, it stores the image and offers 1-click Volume 3D generation
const uhTarget = `Uh=async()=>{const _=await e.clipboardImage();_?await i.current.insertImage(_):i.current.hasClip()?i.current.paste():e.mobile?await Gh():Wn(n.nothingToPaste)}`;
const uhFix = `Uh=async()=>{
  const _=await e.clipboardImage();
  if(_) {
    window._nrnLastPastedImage = _;
    await i.current.insertImage(_);
    // Lưu ảnh vừa dán và hiển thị toast gợi ý tạo vật tròn xoay 3D
    window._nrnPromptGenerateVolume && window._nrnPromptGenerateVolume(_);
  } else {
    i.current.hasClip()?i.current.paste():e.mobile?await Gh():Wn(n.nothingToPaste);
  }
}`;

replaceExact(uhTarget, uhFix, 'Store pasted image in Uh() for quick 3D generation');

// 7. Inject banner / toast in UI for 1-click AI generation when image pasted on canvas
const toastTarget = `(ze==null?void 0:ze.k)==="volume"&&f.jsx(VolumeDialog,{item:ze.item,onClose:()=>Je(null)`;
const toastInject = `(()=>{
  // Khởi tạo hàm gọi mở VolumeDialog từ ngoài canvas
  window._nrnPromptGenerateVolume = (imgUrl) => {
    window._nrnPendingVolumeImage = imgUrl;
    // Hiển thị toast thông báo
    const toast = document.createElement("div");
    toast.id = "nrn-vol-toast";
    toast.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:99999;background:linear-gradient(135deg,#1e1b4b,#312e81);color:#fff;padding:12px 18px;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,0.35);border:1.5px solid #818cf8;display:flex;align-items:center;gap:12px;font-family:system-ui,-apple-system,sans-serif;animation:slideUp 0.3s ease;";
    toast.innerHTML = '<span style="font-size:20px">✨</span><div><div style="font-weight:700;font-size:13px">Phát hiện hình ảnh câu hỏi!</div><div style="font-size:11px;color:#c7d2fe">Tạo mô hình 3D vật tròn xoay & tính thể tích với AI</div></div><button id="nrn-open-vol-btn" style="padding:6px 14px;border-radius:8px;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;border:none;font-weight:700;font-size:12px;cursor:pointer;box-shadow:0 2px 8px rgba(79,70,229,0.4)">Tạo 3D ngay</button><button id="nrn-close-vol-toast" style="background:none;border:none;color:#94a3b8;font-size:14px;cursor:pointer">✕</button>';
    const old = document.getElementById("nrn-vol-toast");
    if (old) old.remove();
    document.body.appendChild(toast);
    document.getElementById("nrn-open-vol-btn").onclick = () => {
      toast.remove();
      Je({k:"volume",page:(ee==null?void 0:ee.currentPage())??0,item:null});
    };
    document.getElementById("nrn-close-vol-toast").onclick = () => toast.remove();
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 12000);
  };
  return null;
})(),` + toastTarget;

replaceExact(toastTarget, toastInject, 'Inject canvas AI volume generation toast helper');

fs.writeFileSync(FILE, js, 'utf8');
console.log('🎉 ALL PATCHES APPLIED TO index-D9JME9Hm.js SUCCESSFULLY!');
