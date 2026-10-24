/**
 * Script to apply Gemini AI Question Screenshot & 3D Auto-Generation Feature
 * 1. Screen capture & snipping overlay
 * 2. Gemini Vision prompt & API invocation
 * 3. Settings config section in Lz
 * 4. VolumeDialog AI Scanner card
 */

const fs = require('fs');

// Always start clean from backup
fs.copyFileSync('dist/assets/index-D9JME9Hm.js.bak_before_gemini_vision', 'dist/assets/index-D9JME9Hm.js');
let js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

function mustReplace(target, replacement, label) {
  const idx = js.indexOf(target);
  if (idx < 0) {
    throw new Error('TARGET NOT FOUND: ' + label);
  }
  js = js.slice(0, idx) + replacement + js.slice(idx + target.length);
  console.log('✓ Patched:', label);
}

// ─────────────────────────────────────────────────────────────────────────────
// PART 1: Helper Functions, Icons, and Screen Snipping Tool
// Injected right before function VolumeDialog
// ─────────────────────────────────────────────────────────────────────────────

const volumeDialogTarget = 'function VolumeDialog({item,onSave,onClose}){';

const geminiHelpers = `
/*** === GEMINI AI VISION & SCREEN SNIPPER MODULE === ***/

function SparkleIcon({ size = 14, color = "currentColor", style = {} }) {
  return f.jsx("svg", {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color,
    strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
    style: { verticalAlign: "middle", display: "inline-block", ...style },
    children: f.jsx("path", { d: "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" })
  });
}

function CameraIcon({ size = 14, color = "currentColor", style = {} }) {
  return f.jsxs("svg", {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color,
    strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
    style: { verticalAlign: "middle", display: "inline-block", ...style },
    children: [
      f.jsx("path", { d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" }),
      f.jsx("circle", { cx: "12", cy: "13", r: "3" })
    ]
  });
}

function ClipboardIcon({ size = 14, color = "currentColor", style = {} }) {
  return f.jsxs("svg", {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color,
    strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
    style: { verticalAlign: "middle", display: "inline-block", ...style },
    children: [
      f.jsx("rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }),
      f.jsx("path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" })
    ]
  });
}

async function testGeminiApiKey(apiKey, model) {
  if (!apiKey || !apiKey.trim()) return { ok: false, error: "Chưa nhập API Key" };
  let selectedModel = (model || localStorage.getItem("gemini_model") || "gemini-3.8-flash").trim().replace(/^models\//, "");
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
  let selectedModel = (model || localStorage.getItem("gemini_model") || "gemini-3.8-flash").trim().replace(/^models\//, "");
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
}

function openScreenSnipper(fullScreenDataUrl, onCropped, onCancel) {
  const old = document.getElementById("nrn-screen-snipper");
  if (old) old.remove();

  const container = document.createElement("div");
  container.id = "nrn-screen-snipper";
  container.style.cssText = "position:fixed;inset:0;z-index:9999999;background:rgba(0,0,0,0.65);cursor:crosshair;user-select:none;font-family:system-ui,-apple-system,sans-serif;";

  const img = new Image();
  img.src = fullScreenDataUrl;

  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
  container.appendChild(canvas);

  // Top guide banner
  const banner = document.createElement("div");
  banner.style.cssText = "position:absolute;top:18px;left:50%;transform:translateX(-50%);background:rgba(15,23,42,0.85);backdrop-filter:blur(8px);color:#fff;padding:8px 18px;border-radius:30px;font-size:13px;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,0.4);display:flex;align-items:center;gap:8px;pointer-events:none;z-index:10;";
  banner.innerHTML = '<span style="color:#60a5fa">✂️</span> Kéo chuột để chọn vùng câu hỏi bài tập • Nhấn Esc để hủy';
  container.appendChild(banner);

  // Floating Action Toolbar
  const bar = document.createElement("div");
  bar.style.cssText = "position:absolute;display:none;background:rgba(255,255,255,0.95);backdrop-filter:blur(12px);border:1.5px solid #bfdbfe;border-radius:10px;padding:6px 10px;box-shadow:0 8px 30px rgba(0,0,0,0.35);z-index:20;gap:8px;align-items:center;";
  bar.innerHTML = \`
    <button id="nrn-snip-confirm" style="padding:6px 14px;border-radius:7px;background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);color:#fff;border:none;font-size:12.5px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(37,99,235,0.3);display:flex;align-items:center;gap:5px;">
      <span>✨</span> Xác nhận & Phân tích AI
    </button>
    <button id="nrn-snip-reset" style="padding:6px 10px;border-radius:7px;background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;font-size:12px;font-weight:600;cursor:pointer;">
      ↺ Chọn lại
    </button>
    <button id="nrn-snip-cancel" style="padding:6px 10px;border-radius:7px;background:#fee2e2;color:#b91c1c;border:1px solid #fecaca;font-size:12px;font-weight:600;cursor:pointer;">
      ✕ Hủy
    </button>
  \`;
  container.appendChild(bar);

  document.body.appendChild(container);

  let isDown = false;
  let startX = 0, startY = 0;
  let currX = 0, currY = 0;
  let hasSelection = false;

  function getRect() {
    const left = Math.min(startX, currX);
    const top = Math.min(startY, currY);
    const width = Math.abs(currX - startX);
    const height = Math.abs(currY - startY);
    return { left, top, width, height };
  }

  function redraw() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dimmed full image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (hasSelection) {
      const { left, top, width, height } = getRect();
      if (width > 2 && height > 2) {
        // Clear hole to reveal sharp screenshot
        ctx.save();
        ctx.beginPath();
        ctx.rect(left, top, width, height);
        ctx.clip();
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        // Vibrant neon selection border
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2.5;
        ctx.strokeRect(left, top, width, height);

        // Corner handles
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 2;
        const hs = 7;
        const pts = [
          [left - hs/2, top - hs/2],
          [left + width - hs/2, top - hs/2],
          [left + width - hs/2, top + height - hs/2],
          [left - hs/2, top + height - hs/2]
        ];
        pts.forEach(([hx, hy]) => {
          ctx.fillRect(hx, hy, hs, hs);
          ctx.strokeRect(hx, hy, hs, hs);
        });

        // Dimensions badge
        const badge = Math.round(width) + " × " + Math.round(height) + " px";
        ctx.font = "bold 11px system-ui, sans-serif";
        ctx.fillStyle = "rgba(15,23,42,0.85)";
        ctx.fillRect(left, top > 24 ? top - 22 : top + 6, ctx.measureText(badge).width + 12, 18);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(badge, left + 6, top > 24 ? top - 9 : top + 19);
      }
    }
  }

  function updateBarPos() {
    const { left, top, width, height } = getRect();
    if (width > 20 && height > 20) {
      bar.style.display = "flex";
      let barX = left + width / 2 - 140;
      barX = Math.max(10, Math.min(window.innerWidth - 300, barX));
      let barY = top + height + 12;
      if (barY + 50 > window.innerHeight) {
        barY = Math.max(10, top - 46);
      }
      bar.style.left = barX + "px";
      bar.style.top = barY + "px";
    } else {
      bar.style.display = "none";
    }
  }

  img.onload = () => redraw();
  window.addEventListener("resize", redraw);

  container.onpointerdown = (e) => {
    if (e.target.closest("#nrn-snip-confirm,#nrn-snip-reset,#nrn-snip-cancel")) return;
    isDown = true;
    hasSelection = true;
    startX = e.clientX;
    startY = e.clientY;
    currX = e.clientX;
    currY = e.clientY;
    bar.style.display = "none";
    redraw();
  };

  container.onpointermove = (e) => {
    if (!isDown) return;
    currX = e.clientX;
    currY = e.clientY;
    redraw();
  };

  container.onpointerup = () => {
    if (!isDown) return;
    isDown = false;
    updateBarPos();
  };

  const cleanup = () => {
    window.removeEventListener("resize", redraw);
    window.removeEventListener("keydown", onKeyDown);
    container.remove();
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      cleanup();
      if (onCancel) onCancel();
    }
  };
  window.addEventListener("keydown", onKeyDown);

  document.getElementById("nrn-snip-reset").onclick = (e) => {
    e.stopPropagation();
    hasSelection = false;
    bar.style.display = "none";
    redraw();
  };

  document.getElementById("nrn-snip-cancel").onclick = (e) => {
    e.stopPropagation();
    cleanup();
    if (onCancel) onCancel();
  };

  document.getElementById("nrn-snip-confirm").onclick = (e) => {
    e.stopPropagation();
    const { left, top, width, height } = getRect();
    if (width < 10 || height < 10) return;

    // Crop from original screenshot with natural scale
    const scaleX = img.naturalWidth / canvas.width;
    const scaleY = img.naturalHeight / canvas.height;

    const cropCv = document.createElement("canvas");
    cropCv.width = Math.round(width * scaleX);
    cropCv.height = Math.round(height * scaleY);
    const cropCtx = cropCv.getContext("2d");
    cropCtx.drawImage(
      img,
      left * scaleX, top * scaleY, width * scaleX, height * scaleY,
      0, 0, cropCv.width, cropCv.height
    );

    const croppedDataUrl = cropCv.toDataURL("image/png");
    cleanup();
    if (onCropped) onCropped(croppedDataUrl);
  };
}

async function startCaptureFlow(onCropped, onCancel) {
  try {
    let dataUrl = null;
    if (window.noteRenderer && window.noteRenderer.captureScreen) {
      dataUrl = await window.noteRenderer.captureScreen();
    }
    if (!dataUrl && navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" } });
      const track = stream.getVideoTracks()[0];
      const video = document.createElement("video");
      video.srcObject = stream;
      video.autoplay = true;
      await new Promise((res) => {
        video.onloadedmetadata = () => { video.play(); setTimeout(res, 250); };
      });
      const cv = document.createElement("canvas");
      cv.width = video.videoWidth || window.innerWidth;
      cv.height = video.videoHeight || window.innerHeight;
      const cx = cv.getContext("2d");
      cx.drawImage(video, 0, 0, cv.width, cv.height);
      track.stop();
      dataUrl = cv.toDataURL("image/png");
    }
    if (!dataUrl) {
      alert("Không thể chụp toàn màn hình trực tiếp. Bạn hãy dùng Windows (Win + Shift + S) để chụp rồi bấm 'Dán ảnh (Ctrl+V)'!");
      if (onCancel) onCancel();
      return;
    }
    openScreenSnipper(dataUrl, onCropped, onCancel);
  } catch (err) {
    if (err.name !== "NotAllowedError") {
      alert(err.message || "Lỗi chụp màn hình. Bạn có thể dùng phím Win + Shift + S chụp rồi bấm Dán ảnh (Ctrl+V)!");
    }
    if (onCancel) onCancel();
  }
}

async function pasteImageFromClipboard() {
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
}

const GEMINI_VISION_MATH_PROMPT = \`Bạn là chuyên gia Toán học THPT và giải tích hình học không gian.
Nhiệm vụ của bạn là đọc đề bài câu hỏi trong ảnh (thường là bài toán Ứng dụng tích phân tính thể tích khối tròn xoay hoặc thể tích vật thể theo thiết diện trong chương trình Toán 12) và trích xuất chính xác các thông số để phần mềm vẽ mô hình 3D và tính tích phân.

Yêu cầu phân tích và trích xuất:
1. title: Tiêu đề hoặc tóm tắt ngắn gọn đề bài (ví dụ: "Thể tích khối tròn xoay quanh Ox giới hạn bởi y = sqrt(x), y = 0, x = 1, x = 4").
2. expr: Công thức hàm số trên y = f(x) phụ thuộc biến x, viết theo cú pháp toán học chuẩn hỗ trợ trong JS (ví dụ: "sqrt(4 - x^2)", "x^2", "sin(x)", "e^x", "2*x", "sqrt(x)", "4 - x^2", "x^3 - 3*x", "1/x", "(x-1)*(x-2)"). CHÚ Ý: Chỉ viết biểu thức theo biến x, KHÔNG ghi "f(x)=" hay "y=". Viết phép nhân rõ ràng dạng * (ví dụ 2*x).
3. expr2: Công thức hàm số dưới y = g(x) nếu miền phẳng bị giới hạn giữa hai đường y = f(x) và y = g(x) (hoặc hình vành khăn, có lõi rỗng). Nếu chỉ giới hạn bởi trục hoành Ox (y = 0) hoặc không có đường thứ hai thì để chuỗi rỗng "".
4. axis: Loại hình thể tích hoặc trục xoay:
   - "ox": Khối tròn xoay quay quanh trục hoành Ox (đĩa tròn hoặc vành khăn).
   - "oy": Khối tròn xoay quay quanh trục tung Oy (hoặc phương pháp vỏ trụ).
   - "sec-ox": Khối tròn xoay nhưng mô phỏng dạng lát cắt đĩa tịnh tiến.
   - "sec-square": Vật thể có thiết diện vuông vuông góc với Ox.
   - "sec-circle": Vật thể có thiết diện tròn vuông góc với Ox.
   - "sec-tri": Vật thể có thiết diện là tam giác đều.
   - "sec-semi": Vật thể có thiết diện là nửa hình tròn.
   - "sec-tri-right": Vật thể có thiết diện là tam giác vuông cân (cạnh góc vuông ở đáy).
   - "sec-tri-iso": Vật thể có thiết diện là tam giác vuông cân (cạnh huyền ở đáy).
   - "sec-wedge2": Hình nêm loại 2.
5. a: Cận dưới tích phân x = a (số thực, ví dụ: 0, -2, 1). Nếu bài toán cho giao điểm đồ thị (chẳng hạn x^2 = 2x => x = 0 và x = 2), hãy giải phương trình để tìm cận.
6. b: Cận trên tích phân x = b (số thực, với b > a).
7. quickFormula: Công thức tích phân thể hiện rõ cận và biểu thức (ví dụ: "V = π ∫₀² [(2x)² - (x²)²] dx").
8. theoreticalVolume: Kết quả thể tích giải tích (ví dụ: "64π/15 ≈ 13.404").
9. explanation: Giải thích ngắn gọn cách lập luận tìm cận, hàm số và công thức thể tích.

BẮT BUỘC trả về kết quả ở định dạng JSON duy nhất như sau:
{
  "title": "...",
  "expr": "...",
  "expr2": "...",
  "axis": "ox",
  "a": 0,
  "b": 2,
  "quickFormula": "...",
  "theoreticalVolume": "...",
  "explanation": "..."
}\`;

`;

mustReplace(volumeDialogTarget, geminiHelpers + volumeDialogTarget, 'Inject Gemini helpers and icons before VolumeDialog');

// ─────────────────────────────────────────────────────────────────────────────
// PART 2: In VolumeDialog: Add States and AI Scanner Card
// ─────────────────────────────────────────────────────────────────────────────

// Add AI states inside VolumeDialog
const vdStateTarget = '  const[showSolution,setShowSolution]=H.useState(item?(item.showSolution??false):false);';
const vdStateReplacement = `  const[showSolution,setShowSolution]=H.useState(item?(item.showSolution??false):false);
  const[geminiLoading,setGeminiLoading]=H.useState(false);
  const[geminiStatusText,setGeminiStatusText]=H.useState("");
  const[geminiResult,setGeminiResult]=H.useState(null);
  const[geminiError,setGeminiError]=H.useState("");
  const[capturedImage,setCapturedImage]=H.useState(null);
  const[showQuickApiConfig,setShowQuickApiConfig]=H.useState(false);
  const[quickApiKey,setQuickApiKey]=H.useState(()=>localStorage.getItem("gemini_api_key")||"");
  const[quickModel,setQuickModel]=H.useState(()=>{ const m = localStorage.getItem("gemini_model"); return (!m || m === "gemini-2.0-flash") ? "gemini-3.8-flash" : m.replace(/^models\//, ""); });

  const processImageWithGemini = async (imgDataUrl) => {
    const key = (localStorage.getItem("gemini_api_key") || quickApiKey || "").trim();
    if (!key) {
      setGeminiError("Vui lòng nhập API Key để tiếp tục (nhấn nút ⚙️ bên cạnh hoặc vào Cài đặt)");
      setShowQuickApiConfig(true);
      return;
    }
    setGeminiLoading(true);
    setGeminiError("");
    setGeminiStatusText("Đang gửi câu hỏi tới Gemini AI...");
    try {
      const mimeType = imgDataUrl.split(";")[0].replace("data:", "") || "image/png";
      const base64 = imgDataUrl.split(",")[1];
      setGeminiStatusText("Đang phân tích phương trình, cận [a, b] & trục xoay...");
      const res = await callGeminiVision({
        apiKey: key,
        model: (localStorage.getItem("gemini_model") || quickModel || "gemini-3.8-flash").trim().replace(/^models\//, "").replace(/^gemini-2\.0-flash$/, "gemini-3.8-flash"),
        prompt: GEMINI_VISION_MATH_PROMPT,
        imageBase64: base64,
        mimeType
      });

      if (!res.expr) {
        throw new Error("Không tìm thấy phương trình f(x) trong ảnh câu hỏi.");
      }

      setExpr(res.expr);
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
      }
    } catch (err) {
      setGeminiError(err.message || "Lỗi khi gọi Gemini API. Vui lòng kiểm tra lại API Key.");
    } finally {
      setGeminiLoading(false);
    }
  };

  const handleStartSnipping = () => {
    setGeminiError("");
    startCaptureFlow((croppedUrl) => {
      setCapturedImage(croppedUrl);
      processImageWithGemini(croppedUrl);
    });
  };

  const handlePasteClipboard = async () => {
    setGeminiError("");
    const imgUrl = await pasteImageFromClipboard();
    if (imgUrl) {
      setCapturedImage(imgUrl);
      processImageWithGemini(imgUrl);
    } else {
      setGeminiError("Không tìm thấy ảnh trong bộ nhớ tạm. Hãy dùng phím Win + Shift + S chụp câu hỏi rồi bấm lại!");
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setCapturedImage(dataUrl);
      processImageWithGemini(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  H.useEffect(() => {
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

mustReplace(vdStateTarget, vdStateReplacement, 'Add Gemini states and handlers in VolumeDialog');

// Now inject the AI Scanner Card right before /* 1. Presets Card */
const presetsCardTarget = '/* 1. Presets Card */';
const aiScannerCard = `/* 0. AI Question Scanner & Generator */
        f.jsxs("div",{style:{background:"linear-gradient(135deg, #f5f3ff 0%, #eff6ff 100%)",border:"1.5px solid #c7d2fe",borderRadius:"12px",padding:"9px 12px",display:"flex",flexDirection:"column",gap:"8px",boxShadow:"0 2px 8px rgba(99,102,241,0.08)"},children:[
          f.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[
            f.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"6px",fontWeight:"800",fontSize:"13px",color:"#3730a3"},children:[
              f.jsx(SparkleIcon,{size:16,color:"#6366f1"}),
              "AI Đọc đề & Tự sinh hình 3D:"
            ]}),
            f.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"5px"},children:[
              f.jsx("span",{title:quickApiKey?"API Key đã sẵn sàng":"Chưa nhập API Key",style:{fontSize:"10.5px",fontWeight:"700",padding:"2px 7px",borderRadius:"12px",background:quickApiKey?"#dcfce7":"#fef3c7",color:quickApiKey?"#15803d":"#b45309",border:\`1px solid \${quickApiKey?"#86efac":"#fde68a"}\`},children:quickApiKey?"● Gemini Ready":"⚠️ Cần API Key"}),
              f.jsx("button",{type:"button",title:"Cài đặt Gemini API",onClick:()=>setShowQuickApiConfig(!showQuickApiConfig),style:{background:"#ffffff",border:"1.5px solid #cbd5e1",borderRadius:"6px",padding:"2px 7px",fontSize:"11px",fontWeight:"600",cursor:"pointer",color:"#475569"},children:"⚙️"})
            ]})
          ]}),

          showQuickApiConfig&&f.jsxs("div",{style:{background:"#ffffff",border:"1.5px solid #c7d2fe",borderRadius:"8px",padding:"8px 9px",display:"flex",flexDirection:"column",gap:"6px"},children:[
            f.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[
              f.jsx("span",{style:{fontSize:"11px",fontWeight:"700",color:"#3730a3"},children:"Cấu hình Gemini API Key:"}),
              f.jsx("a",{href:"https://aistudio.google.com/app/apikey",target:"_blank",rel:"noreferrer",style:{fontSize:"10.5px",color:"#2563eb",textDecoration:"underline",fontWeight:"600"},children:"Lấy Key miễn phí ↗"})
            ]}),
            f.jsx("input",{type:"password",value:quickApiKey,placeholder:"Dán Gemini API Key (AIzaSy...)",onChange:e=>setQuickApiKey(e.target.value),style:{padding:"5px 8px",borderRadius:"6px",border:"1.5px solid #cbd5e1",fontSize:"12px",fontFamily:"monospace",width:"100%",boxSizing:"border-box",outline:"none"}}),
            f.jsxs("div",{style:{display:"flex",gap:"6px"},children:[
              f.jsxs("select",{value:quickModel,onChange:e=>setQuickModel(e.target.value),style:{flex:1,padding:"4px 6px",borderRadius:"6px",border:"1px solid #cbd5e1",fontSize:"11px",background:"#fff",outline:"none"},children:[
                f.jsx("option",{value:"gemini-3.8-flash",children:"🚀 Gemini 3.8 Flash (Khuyên dùng)"}),
                f.jsx("option",{value:"gemini-2.5-flash",children:"⚡ Gemini 2.5 Flash"}),
                f.jsx("option",{value:"gemini-1.5-flash",children:"✨ Gemini 1.5 Flash"}),
                f.jsx("option",{value:"gemini-1.5-pro",children:"🧠 Gemini 1.5 Pro"})
              ]}),
              f.jsx("button",{type:"button",onClick:()=>{localStorage.setItem("gemini_api_key",quickApiKey.trim());localStorage.setItem("gemini_model",quickModel);setShowQuickApiConfig(false);setGeminiError("");},style:{padding:"4px 12px",borderRadius:"6px",background:"#4f46e5",color:"#fff",border:"none",fontSize:"11px",fontWeight:"700",cursor:"pointer"},children:"Lưu"})
            ]})
          ]}),

          f.jsxs("div",{style:{display:"flex",gap:"6px"},children:[
            f.jsxs("button",{type:"button",disabled:geminiLoading,onClick:handleStartSnipping,style:{flex:"1 1 auto",padding:"7px 10px",borderRadius:"8px",background:"linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",color:"#ffffff",border:"none",fontSize:"12px",fontWeight:"700",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:"5px",boxShadow:"0 2px 6px rgba(79,70,229,0.25)"},children:[
              f.jsx(CameraIcon,{size:14,color:"#ffffff"}),
              "Chụp màn hình"
            ]}),
            f.jsxs("button",{type:"button",disabled:geminiLoading,title:"Dán ảnh chụp câu hỏi từ bộ nhớ tạm (Ctrl+V)",onClick:handlePasteClipboard,style:{flex:"1 1 auto",padding:"7px 10px",borderRadius:"8px",background:"#ffffff",color:"#4338ca",border:"1.5px solid #c7d2fe",fontSize:"12px",fontWeight:"700",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:"5px"},children:[
              f.jsx(ClipboardIcon,{size:14,color:"#4338ca"}),
              "Dán ảnh (Ctrl+V)"
            ]}),
            f.jsxs("label",{style:{padding:"7px 9px",borderRadius:"8px",background:"#ffffff",color:"#475569",border:"1.5px solid #e2e8f0",fontSize:"12px",fontWeight:"600",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center"},title:"Chọn file ảnh câu hỏi từ máy",children:[
              "📁",
              f.jsx("input",{type:"file",accept:"image/*",style:{display:"none"},onChange:handleFileInputChange})
            ]})
          ]}),

          capturedImage&&f.jsxs("div",{style:{background:"#ffffff",border:"1.5px solid #e0e7ff",borderRadius:"8px",padding:"6px 8px",display:"flex",alignItems:"center",gap:"8px"},children:[
            f.jsx("img",{src:capturedImage,alt:"Đề bài",style:{width:"55px",height:"38px",objectFit:"cover",borderRadius:"4px",border:"1px solid #cbd5e1"}}),
            f.jsxs("div",{style:{flex:1,minWidth:0,fontSize:"11px",color:"#475569"},children:[
              f.jsx("div",{style:{fontWeight:"700",color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:"Ảnh câu hỏi đã nạp"}),
              f.jsx("div",{style:{fontSize:"10px",color:"#64748b"},children:"Sẵn sàng phân tích với Gemini"})
            ]}),
            !geminiLoading&&f.jsx("button",{type:"button",onClick:()=>processImageWithGemini(capturedImage),style:{padding:"4px 9px",fontSize:"11px",fontWeight:"700",background:"#4f46e5",color:"#fff",border:"none",borderRadius:"6px",cursor:"pointer"},children:"Phân tích lại"}),
            f.jsx("button",{type:"button",onClick:()=>{setCapturedImage(null);setGeminiResult(null);setGeminiError("");},style:{background:"none",border:"none",color:"#94a3b8",fontSize:"14px",cursor:"pointer",padding:"0 4px"},children:"✕"})
          ]}),

          geminiLoading&&f.jsxs("div",{style:{background:"linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)",border:"1.5px solid #a5b4fc",borderRadius:"8px",padding:"8px 10px",display:"flex",alignItems:"center",gap:"8px"},children:[
            f.jsx("span",{style:{fontSize:"16px",animation:"spin 1s linear infinite",display:"inline-block"},children:"⚙️"}),
            f.jsxs("div",{style:{fontSize:"11.5px",fontWeight:"700",color:"#3730a3"},children:[
              geminiStatusText||"Đang phân tích ảnh đề bài...",
              f.jsx("div",{style:{fontSize:"10px",fontWeight:"normal",color:"#4338ca",marginTop:"1px"},children:"Đang trích xuất hàm số, cận tích phân & dựng mô hình 3D..."})
            ]})
          ]}),

          geminiError&&f.jsxs("div",{style:{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:"8px",padding:"6px 9px",fontSize:"11px",color:"#b91c1c",display:"flex",gap:"5px",alignItems:"flex-start"},children:[
            f.jsx("span",{children:"⚠️"}),
            f.jsx("span",{style:{flex:1,lineHeight:"1.35"},children:geminiError})
          ]}),

          geminiResult&&f.jsxs("div",{style:{background:"linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",border:"1.5px solid #86efac",borderRadius:"8px",padding:"8px 10px",display:"flex",flexDirection:"column",gap:"4px"},children:[
            f.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[
              f.jsxs("div",{style:{fontSize:"11px",fontWeight:"800",color:"#166534",display:"flex",alignItems:"center",gap:"4px"},children:[
                f.jsx(SparkleIcon,{size:13,color:"#16a34a"}),
                "ĐÃ SINH HÌNH 3D TỪ ĐỀ BÀI:"
              ]}),
              f.jsx("span",{style:{fontSize:"9.5px",fontWeight:"800",background:"#dcfce7",color:"#15803d",padding:"1px 6px",borderRadius:"10px",border:"1px solid #bbf7d0"},children:"Tự động hoàn tất"})
            ]}),
            geminiResult.title&&f.jsx("div",{style:{fontSize:"11.5px",fontWeight:"700",color:"#14532d",lineHeight:"1.3"},children:geminiResult.title}),
            geminiResult.quickFormula&&f.jsxs("div",{style:{fontSize:"11px",color:"#065f46",background:"#ffffff",padding:"3px 6px",borderRadius:"5px",border:"1px solid #a7f3d0",fontFamily:"system-ui,-apple-system,sans-serif"},children:["Công thức: ",f.jsx("b",{children:geminiResult.quickFormula})]}),
            geminiResult.explanation&&f.jsx("div",{style:{fontSize:"10.5px",color:"#15803d",lineHeight:"1.35"},children:geminiResult.explanation})
          ]})
        ]}),

        /* 1. Presets Card */`;

mustReplace(presetsCardTarget, aiScannerCard, 'Add AI Question Scanner card in VolumeDialog');

// ─────────────────────────────────────────────────────────────────────────────
// PART 3: In Lz: Add Gemini Settings Section into Settings Dialog
// ─────────────────────────────────────────────────────────────────────────────

// Add states in Lz
const lzStateTarget = 'function Lz({doc:e,cursor:t,inputMode:n,autosave:r,lowLatency:i,spaceFull:o,pageGap:s,pageBreaks:l,notesFolder:c,addPapers:h,onSave:d,onClose:p}){';
const lzStateReplacement = `function Lz({doc:e,cursor:t,inputMode:n,autosave:r,lowLatency:i,spaceFull:o,pageGap:s,pageBreaks:l,notesFolder:c,addPapers:h,onSave:d,onClose:p}){
  const [geminiKey, setGeminiKey] = H.useState(() => localStorage.getItem("gemini_api_key") || "");
  const [geminiModel, setGeminiModel] = H.useState(() => { const m = localStorage.getItem("gemini_model"); return (!m || m === "gemini-2.0-flash") ? "gemini-3.8-flash" : m.replace(/^models\//, ""); });
  const [geminiTestStatus, setGeminiTestStatus] = H.useState("");
  const [geminiTestMsg, setGeminiTestMsg] = H.useState("");
  const [showKey, setShowKey] = H.useState(false);`;

mustReplace(lzStateTarget, lzStateReplacement, 'Add Gemini states in Lz Settings component');

// Add Section 4 into settings-grid
const geminiSectionJSX = `f.jsxs("section",{style:{background:"#ffffff",borderRadius:"12px",border:"1.5px solid #e2e8f0",padding:"12px 14px",display:"flex",flexDirection:"column",gap:"9px"},children:[
  f.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",paddingBottom:"6px",borderBottom:"1px solid #f1f5f9"},children:[
    f.jsxs("h4",{style:{margin:0,fontSize:"13px",fontWeight:"700",color:"#1e3a8a",display:"flex",alignItems:"center",gap:"6px"},children:[
      f.jsx(SparkleIcon,{size:16,color:"#2563eb"}),
      "Trí tuệ nhân tạo (Gemini AI)"
    ]}),
    f.jsx("span",{style:{fontSize:"10.5px",fontWeight:"700",padding:"2px 8px",borderRadius:"12px",background:geminiKey?"#ecfdf5":"#fffbeb",color:geminiKey?"#059669":"#b45309",border:\`1px solid \${geminiKey?"#a7f3d0":"#fde68a"}\`},children:geminiKey?"● Đã cấu hình":"○ Chưa có Key"})
  ]}),
  f.jsx("p",{style:{fontSize:"11px",color:"#64748b",margin:0,lineHeight:"1.4"},children:"Tự động đọc ảnh câu hỏi bài tập (thể tích, tích phân), phân tích hàm số và tự sinh hình vẽ 3D tương tác."}),
  f.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"3px"},children:[
    f.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[
      f.jsx("label",{style:{fontSize:"11.5px",fontWeight:"700",color:"#334155"},children:"Google Gemini API Key:"}),
      f.jsx("button",{type:"button",onClick:()=>setShowKey(!showKey),style:{background:"none",border:"none",color:"#2563eb",fontSize:"11px",cursor:"pointer",padding:0},children:showKey?"Ẩn":"Hiện"})
    ]}),
    f.jsx("input",{type:showKey?"text":"password",value:geminiKey,placeholder:"Dán API Key (AIzaSy...)",onChange:pe=>{setGeminiKey(pe.target.value);setGeminiTestStatus("");},style:{padding:"6px 9px",borderRadius:"7px",border:"1.5px solid #cbd5e1",fontSize:"12.5px",fontFamily:"monospace",width:"100%",boxSizing:"border-box",outline:"none"}})
  ]}),
  f.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"3px"},children:[
    f.jsx("label",{style:{fontSize:"11.5px",fontWeight:"700",color:"#334155"},children:"Mô hình Gemini (Model):"}),
    f.jsxs("select",{value:geminiModel,onChange:pe=>{setGeminiModel(pe.target.value);setGeminiTestStatus("");},style:{padding:"6px 9px",borderRadius:"7px",border:"1.5px solid #cbd5e1",fontSize:"12px",background:"#ffffff",color:"#1e293b",outline:"none"},children:[
      f.jsx("option",{value:"gemini-3.8-flash",children:"🚀 Gemini 3.8 Flash (Thế hệ mới nhất - Khuyên dùng)"}),
      f.jsx("option",{value:"gemini-2.5-flash",children:"⚡ Gemini 2.5 Flash (Nhanh & Chính xác)"}),
      f.jsx("option",{value:"gemini-1.5-flash",children:"✨ Gemini 1.5 Flash (Tiêu chuẩn ổn định)"}),
      f.jsx("option",{value:"gemini-1.5-pro",children:"🧠 Gemini 1.5 Pro (Toán học chuyên sâu)"})
    ]})
  ]}),
  f.jsxs("div",{style:{display:"flex",gap:"6px",alignItems:"center",marginTop:"2px"},children:[
    f.jsx("button",{type:"button",disabled:!geminiKey||geminiTestStatus==="testing",onClick:async()=>{setGeminiTestStatus("testing");setGeminiTestMsg("Đang kiểm tra kết nối tới Gemini...");const res=await testGeminiApiKey(geminiKey,geminiModel);if(res.ok){setGeminiTestStatus("ok");setGeminiTestMsg("✓ Kết nối thành công! API Key hoạt động bình thường.");localStorage.setItem("gemini_api_key",geminiKey.trim());localStorage.setItem("gemini_model",geminiModel);}else{setGeminiTestStatus("error");setGeminiTestMsg("✕ "+(res.error||"Không thể kết nối."));}},style:{padding:"5px 12px",borderRadius:"6px",fontSize:"11.5px",fontWeight:"600",cursor:"pointer",background:"#eff6ff",border:"1px solid #bfdbfe",color:"#1d4ed8"},children:geminiTestStatus==="testing"?"Đang thử...":"⚡ Thử kết nối"}),
    f.jsx("button",{type:"button",onClick:()=>{localStorage.setItem("gemini_api_key",geminiKey.trim());localStorage.setItem("gemini_model",geminiModel);setGeminiTestStatus("ok");setGeminiTestMsg("✓ Đã lưu cấu hình API Key!");},style:{padding:"5px 12px",borderRadius:"6px",fontSize:"11.5px",fontWeight:"600",cursor:"pointer",background:"#f1f5f9",border:"1px solid #cbd5e1",color:"#334155"},children:"💾 Lưu Key"})
  ]}),
  geminiTestMsg&&f.jsx("div",{style:{fontSize:"11px",fontWeight:"600",padding:"4px 8px",borderRadius:"6px",background:geminiTestStatus==="ok"?"#ecfdf5":"#fef2f2",color:geminiTestStatus==="ok"?"#047857":"#b91c1c",border:\`1px solid \${geminiTestStatus==="ok"?"#a7f3d0":"#fecaca"}\`},children:geminiTestMsg}),
  f.jsxs("div",{style:{fontSize:"10.5px",color:"#64748b",display:"flex",alignItems:"center",gap:"4px",marginTop:"2px"},children:[
    "Chưa có API key? ",
    f.jsx("a",{href:"https://aistudio.google.com/app/apikey",target:"_blank",rel:"noreferrer",style:{color:"#2563eb",fontWeight:"600",textDecoration:"underline"},children:"Lấy miễn phí tại Google AI Studio ↗"})
  ]})
]})`;

const lzGridEndTarget = 'children:Te.openFolder})]})]})]})]}),f.jsxs("footer"';
const lzGridEndReplacement = 'children:Te.openFolder})]})]})]})' + ',' + geminiSectionJSX + ']})' + ',f.jsxs("footer"';

mustReplace(lzGridEndTarget, lzGridEndReplacement, 'Add Gemini Settings section into settings-grid in Lz');

// In footer Apply button, also save Gemini config:
const applyBtnTarget = 'f.jsx("button",{className:"primary",onClick:()=>d({paper:P,spacing:R,titleBox:G,infinite:Ie,names:dn,labelSize:yn===ws?void 0:yn,labelColor:bn||void 0,dotColor:Qt||void 0,dotSize:rt,dots:Je,margins:we,color:U===Vd[0]?void 0:U,image:Lo,lineColor:oe||void 0,lineWeight:J===1?void 0:J,landscape:Ne,size:kt},g,v,w,S,D,B,K),children:Te.apply})';
const applyBtnReplacement = 'f.jsx("button",{className:"primary",onClick:()=>{localStorage.setItem("gemini_api_key",geminiKey.trim());localStorage.setItem("gemini_model",geminiModel);d({paper:P,spacing:R,titleBox:G,infinite:Ie,names:dn,labelSize:yn===ws?void 0:yn,labelColor:bn||void 0,dotColor:Qt||void 0,dotSize:rt,dots:Je,margins:we,color:U===Vd[0]?void 0:U,image:Lo,lineColor:oe||void 0,lineWeight:J===1?void 0:J,landscape:Ne,size:kt},g,v,w,S,D,B,K);},children:Te.apply})';

mustReplace(applyBtnTarget, applyBtnReplacement, 'Save Gemini config on Settings Apply button');

// ─────────────────────────────────────────────────────────────────────────────
// PART 4: Save patched JS
// ─────────────────────────────────────────────────────────────────────────────

fs.writeFileSync('dist/assets/index-D9JME9Hm.js', js, 'utf8');
console.log('🎉 Successfully applied Gemini AI Vision & Settings Config feature to index-D9JME9Hm.js!');
