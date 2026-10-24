const fs = require('fs');

const jsFile = 'dist/assets/index-D9JME9Hm.js';
const cssFile = 'dist/assets/theme-modern.css';

// Backup
fs.copyFileSync(jsFile, jsFile + '.bak_casio');
fs.copyFileSync(cssFile, cssFile + '.bak_casio');
console.log('✓ Backups created.');

let js = fs.readFileSync(jsFile, 'utf8');
let css = fs.readFileSync(cssFile, 'utf8');

// 1. Target inside calc-title in Sj
const targetTitle = 'children:[f.jsx("span",{className:"calc-name",children:g.calcName}),f.jsx("button",{className:"calc-close","aria-label":g.close,onPointerDown:A=>A.stopPropagation(),onClick:o,children:"✕"})]';

const replTitle = 'children:[f.jsxs("div",{className:"calc-brand",children:[f.jsx("div",{className:"calc-casio-logo",children:"CASIO"}),f.jsxs("div",{className:"calc-model-row",children:[f.jsx("span",{className:"calc-model-name",children:"fx-991EX"}),f.jsx("span",{className:"calc-classwiz-name",children:"CLASSWIZ"})]})]}),f.jsxs("div",{className:"calc-solar-panel",children:[f.jsx("div",{className:"calc-solar-grid"}),f.jsx("div",{className:"calc-solar-glare"})]}),f.jsx("button",{className:"calc-close","aria-label":g.close,onPointerDown:A=>A.stopPropagation(),onClick:o,children:"✕"})]';

if (!js.includes(targetTitle)) {
  console.error('targetTitle not found in JS!');
  process.exit(1);
}

js = js.replace(targetTitle, replTitle);
console.log('✓ Replaced calc-title with Casio fx-991EX branding and solar panel.');

// 2. Target inside ck-head for shift and alpha buttons
const targetHead = 'f.jsxs("div",{className:"ck-row ck-head",children:[f.jsx(xa,{d:{k:"shift",main:"SHIFT",cls:"round shift"},press:y}),f.jsx(xa,{d:{k:"alpha",main:"ALPHA",cls:"round alpha"},press:y})';

const replHead = 'f.jsxs("div",{className:"ck-row ck-head",children:[f.jsx(xa,{d:{k:"shift",name:"SHIFT",shift:"SHIFT",cls:"round shift"},press:y}),f.jsx(xa,{d:{k:"alpha",name:"ALPHA",alpha:"ALPHA",cls:"round alpha"},press:y})';

if (!js.includes(targetHead)) {
  console.error('targetHead not found in JS!');
  process.exit(1);
}

js = js.replace(targetHead, replHead);
console.log('✓ Updated SHIFT/ALPHA round buttons in ck-head.');

fs.writeFileSync(jsFile, js, 'utf8');
console.log('✓ Saved index-D9JME9Hm.js');

// 3. Add Casio fx-991EX ClassWiz CSS
const casioCss = `
/* ==========================================================================
   ✨ CASIO fx-991EX CLASSWIZ AUTHENTIC DESIGN
   ========================================================================== */
.calc {
  --ck-h: 27px !important;
  --fn-h: 22px !important;
  --lbl: 9px !important;
  width: 318px !important;
  max-width: calc(100vw - 16px) !important;
  max-height: calc(100vh - 36px) !important;
  top: 60px !important;
  right: 20px !important;
  overflow: visible !important;
  scrollbar-width: none !important;
  border-radius: 20px 20px 24px 24px !important;
  padding: 8px 10px 14px !important;
  gap: 5px !important;
  
  /* Authentic fx-991EX Carbon-Fiber Texture & Deep Charcoal Body */
  background-color: #17171a !important;
  background-image: 
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.08) 1px, transparent 1.2px),
    radial-gradient(circle at 0% 0%, rgba(0, 0, 0, 0.45) 1px, transparent 1.2px),
    linear-gradient(180deg, #25252b 0%, #151518 55%, #101013 100%) !important;
  background-size: 4px 4px, 4px 4px, 100% 100% !important;
  
  /* Authentic Two-Tone Casing: Crisp white outer chassis rim with realistic 3D depth */
  border: 1px solid #383842 !important;
  box-shadow: 
    0 0 0 1.5px #f8fafc,
    0 0 0 3px #18181b,
    0 24px 60px rgba(0, 0, 0, 0.75),
    0 6px 16px rgba(0, 0, 0, 0.45) !important;
  user-select: none !important;
  -webkit-user-select: none !important;
}

/* ══════ BRAND HEADER (CASIO fx-991EX CLASSWIZ + SOLAR PANEL) ══════ */
.calc-title {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  height: auto !important;
  min-height: 38px !important;
  padding: 2px 4px 5px !important;
  cursor: grab !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
  margin-bottom: 2px !important;
}
.calc-title:active {
  cursor: grabbing !important;
}

.calc-brand {
  display: flex !important;
  flex-direction: column !important;
  gap: 1px !important;
  user-select: none !important;
}

.calc-casio-logo {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
  font-size: 15px !important;
  font-weight: 800 !important;
  letter-spacing: 0.08em !important;
  color: #ffffff !important;
  line-height: 1 !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8) !important;
}

.calc-model-row {
  display: flex !important;
  align-items: baseline !important;
  gap: 5px !important;
  line-height: 1 !important;
  margin-top: 2px !important;
}

.calc-model-name {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  font-size: 10px !important;
  font-weight: 600 !important;
  color: #94a3b8 !important;
  letter-spacing: 0.02em !important;
}

.calc-classwiz-name {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  font-size: 9.5px !important;
  font-weight: 800 !important;
  color: #f43f5e !important;
  letter-spacing: 0.12em !important;
  font-style: italic !important;
  text-transform: uppercase !important;
}

/* Solar Cell Panel */
.calc-solar-panel {
  position: relative !important;
  width: 76px !important;
  height: 28px !important;
  border-radius: 4px !important;
  background: linear-gradient(180deg, #18080d 0%, #321019 50%, #1f0a10 100%) !important;
  border: 1px solid #140608 !important;
  box-shadow: inset 0 1.5px 3px rgba(0, 0, 0, 0.85), 0 1px 1px rgba(255, 255, 255, 0.08) !important;
  overflow: hidden !important;
  display: flex !important;
  align-items: center !important;
}

.calc-solar-grid {
  position: absolute !important;
  inset: 0 !important;
  background-image: repeating-linear-gradient(90deg, transparent 0, transparent 17px, rgba(255, 255, 255, 0.06) 17px, rgba(255, 255, 255, 0.06) 18px) !important;
  pointer-events: none !important;
}

.calc-solar-glare {
  position: absolute !important;
  inset: 0 !important;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.04) 40%, transparent 65%) !important;
  pointer-events: none !important;
}

.calc-close {
  width: 22px !important;
  height: 22px !important;
  border: none !important;
  border-radius: 6px !important;
  background: rgba(255, 255, 255, 0.06) !important;
  color: #94a3b8 !important;
  font-size: 12px !important;
  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.15s ease !important;
  margin-left: 6px !important;
}

.calc-close:hover {
  background: #ef4444 !important;
  color: #ffffff !important;
}

/* ══════ LCD SCREEN BEZEL & DOT-MATRIX DISPLAY ══════ */
.calc-lcd {
  border-radius: 9px !important;
  padding: 4px 8px 6px !important;
  margin: 2px 0 4px !important;
  background: #141416 !important;
  border: 2px solid #27272e !important;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(255, 255, 255, 0.05) !important;
}

.calc-lcd > * {
  /* Inner Screen */
  background: linear-gradient(180deg, #d3dec9 0%, #c5d2ba 100%) !important;
  color: #111a11 !important;
  font-family: AxMath, "Cambria Math", "Consolas", monospace !important;
  border-radius: 4px !important;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.25) !important;
}

.lcd-status {
  padding: 2px 4px !important;
  border-bottom: 1px dotted rgba(0, 0, 0, 0.15) !important;
}

.lcd-main {
  padding: 4px 6px !important;
  min-height: 80px !important;
}

/* ══════ KEYPAD: LABELS (SHIFT / ALPHA) ══════ */
.ck-labels {
  height: calc(var(--lbl) + 4px) !important;
  font: 700 var(--lbl)/1.2 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
  padding: 0 1px !important;
}

.ck-shift {
  color: #f59e0b !important;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.9) !important;
  font-weight: 700 !important;
  font-size: 8.5px !important;
}

.ck-alpha {
  color: #f43f5e !important;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.9) !important;
  font-weight: 700 !important;
  font-size: 8.5px !important;
  margin-left: auto !important;
}

/* ══════ METALLIC ROUND BUTTONS (SHIFT, ALPHA, MENU, ON) ══════ */
.ck.round {
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  margin: 0 auto !important;
  background: radial-gradient(circle at 40% 30%, #e4e4e7 0%, #a1a1aa 50%, #52525b 100%) !important;
  border: 1px solid #71717a !important;
  color: #18181b !important;
  font-weight: 800 !important;
  font-size: 8.5px !important;
  box-shadow: 0 2.5px 0 #27272a, 0 3px 5px rgba(0,0,0,0.5), inset 0 1px 1.5px rgba(255,255,255,0.7) !important;
  transition: all 0.08s ease !important;
  cursor: pointer !important;
}

.ck.round:active {
  transform: translateY(1.5px) !important;
  box-shadow: 0 1px 0 #27272a, inset 0 1px 2px rgba(0,0,0,0.4) !important;
}

/* ══════ AUTHENTIC CASIO D-PAD (METALLIC DISK WITH CONCAVE CENTER) ══════ */
.ck-pad {
  position: relative !important;
  border-radius: 50% !important;
  background: radial-gradient(circle at 45% 35%, #71717a 0%, #3f3f46 50%, #27272a 100%) !important;
  border: 1.5px solid #52525b !important;
  box-shadow: 0 3px 6px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.4) !important;
  margin-bottom: calc(-1 * (var(--fn-h) + var(--lbl) + 4px)) !important;
  z-index: 2 !important;
}

.ck-pad::after {
  content: '' !important;
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  width: 20px !important;
  height: 20px !important;
  border-radius: 50% !important;
  background: radial-gradient(circle at 50% 50%, #27272a 0%, #3f3f46 60%, #18181b 100%) !important;
  border: 1px solid #52525b !important;
  box-shadow: inset 0 2px 3px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.2) !important;
  pointer-events: none !important;
}

.ck-arrow {
  color: #e4e4e7 !important;
  font-size: 10px !important;
  text-shadow: 0 1px 2px #000000 !important;
  z-index: 3 !important;
}

.ck-arrow:active {
  color: #ffffff !important;
  background: rgba(255, 255, 255, 0.15) !important;
}

/* ══════ UPPER FUNCTION KEYS (MATTE DARK CHARCOAL) ══════ */
.ck-top .ck:not(.round) {
  height: var(--fn-h) !important;
  border-radius: 5px !important;
  background: linear-gradient(180deg, #383842 0%, #222227 100%) !important;
  border: 1px solid #43434c !important;
  color: #f8fafc !important;
  font-size: 11.5px !important;
  font-weight: 600 !important;
  box-shadow: 0 2px 0 #121215, 0 2.5px 4px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.18) !important;
  transition: all 0.08s ease !important;
}

.ck-top .ck:not(.round):active {
  transform: translateY(1.5px) !important;
  box-shadow: 0 0.5px 0 #121215 !important;
}

/* ══════ LOWER KEYS (PORCELAIN WHITE NUMBERS & BLUE AC/DEL) ══════ */
.ck-bottom {
  margin-top: 5px !important;
}

.ck-bottom .ck.big {
  height: var(--ck-h) !important;
  border-radius: 7px !important;
  background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%) !important;
  border: 1px solid #cbd5e1 !important;
  color: #0f172a !important;
  font-size: 16px !important;
  font-weight: 700 !important;
  box-shadow: 0 2.5px 0 #94a3b8, 0 3px 5px rgba(0,0,0,0.25), inset 0 1px 0 #ffffff !important;
  transition: all 0.08s ease !important;
}

.ck-bottom .ck.big:active {
  transform: translateY(1.5px) !important;
  box-shadow: 0 1px 0 #94a3b8 !important;
}

/* Iconic Sapphire Blue DEL & AC Keys */
.ck-bottom .ck.big.del {
  background: linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%) !important;
  border: 1px solid #1e40af !important;
  color: #ffffff !important;
  font-size: 13.5px !important;
  font-weight: 800 !important;
  box-shadow: 0 2.5px 0 #1e3a8a, 0 3px 5px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.35) !important;
}

.ck-bottom .ck.big.del:active {
  transform: translateY(1.5px) !important;
  box-shadow: 0 1px 0 #1e3a8a !important;
}
`;

// Remove previous simple .calc rules if present in theme-modern.css
const oldCalcMarker = '/* --- 7. SCIENTIFIC CALCULATOR (.calc) --- */';
if (css.includes(oldCalcMarker)) {
  const pOld = css.indexOf(oldCalcMarker);
  const pOldEnd = css.indexOf('/* --- 8. MODERN CLEAN SCROLLBARS --- */', pOld);
  if (pOldEnd !== -1) {
    css = css.slice(0, pOld) + casioCss + '\n\n' + css.slice(pOldEnd);
  } else {
    css += '\n' + casioCss;
  }
} else {
  css += '\n' + casioCss;
}

fs.writeFileSync(cssFile, css, 'utf8');
console.log('✓ Updated theme-modern.css with Casio fx-991EX styling.');
