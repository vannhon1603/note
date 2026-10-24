const fs = require('fs');
const path = require('path');

const jsFile = path.resolve('dist/assets/index-D9JME9Hm.js');
const cssFile = path.resolve('dist/assets/theme-modern.css');

// Backups
fs.copyFileSync(jsFile, jsFile + '.bak_before_grouping');
fs.copyFileSync(cssFile, cssFile + '.bak_before_grouping');
console.log('✓ Backups created.');

// Read files
let js = fs.readFileSync(jsFile, 'utf8');
let css = fs.readFileSync(cssFile, 'utf8');

// 1. Prepare target string from current_vol_toolbar.js
const targetJs = fs.readFileSync('current_vol_toolbar.js', 'utf8').trim();

if (!js.includes(targetJs)) {
  console.error('Target JS not found exactly. Searching fuzzy...');
  const posStart = js.indexOf('(ee==null?void 0:ee.selectedItem())&&ee.selectedItem().item.type==="volume"&&(()=>{');
  const posEnd = js.indexOf('})(),(ee==null?void 0:ee.selectionPoints())', posStart);
  if (posStart !== -1 && posEnd !== -1) {
    console.log('Found exact boundary: start =', posStart, 'end =', posEnd + 5);
    const existingSnippet = js.slice(posStart, posEnd + 5);
    fs.writeFileSync('found_snippet.js', existingSnippet, 'utf8');
  } else {
    throw new Error('Cannot locate volume toolbar boundary in JS!');
  }
}

// Read new JS
const newJs = fs.readFileSync('new_vol_toolbar.js', 'utf8').trim();

// Replace in JS
if (js.includes(targetJs)) {
  js = js.replace(targetJs, newJs);
  console.log('✓ Replaced volume toolbar in index-D9JME9Hm.js using exact match');
} else {
  const existingSnippet = fs.readFileSync('found_snippet.js', 'utf8');
  js = js.replace(existingSnippet, newJs);
  console.log('✓ Replaced volume toolbar in index-D9JME9Hm.js using boundary snippet');
}

fs.writeFileSync(jsFile, js, 'utf8');
console.log('✓ Updated index-D9JME9Hm.js');

// 2. Add CSS to theme-modern.css
const cssToAdd = `
/* ==========================================================================
   ✨ VOLUME TOOLBAR GROUPED CARDS & PILLS (.vol-group, .vol-break)
   ========================================================================== */
.selection-bar {
  display: flex !important;
  flex-wrap: wrap !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 5px 6px !important;
  padding: 6px 10px !important;
  max-width: calc(100% - 24px) !important;
}

.vol-break {
  width: 100% !important;
  height: 0 !important;
  margin: 1px 0 !important;
  flex-basis: 100% !important;
  display: block !important;
}

.vol-group {
  display: inline-flex !important;
  align-items: center !important;
  gap: 3px !important;
  background: rgba(248, 250, 252, 0.95) !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 9px !important;
  padding: 3px 6px !important;
  white-space: nowrap !important;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04) !important;
}

.vol-group-label {
  font-size: 11px !important;
  font-weight: 700 !important;
  color: #475569 !important;
  padding: 0 4px 0 2px !important;
  letter-spacing: 0.01em !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
  user-select: none !important;
}

.vol-group button {
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
  padding: 3px 8px !important;
  min-height: 26px !important;
  font-size: 11.5px !important;
  font-weight: 500 !important;
  border-radius: 6px !important;
  color: #334155 !important;
  border: 1px solid transparent !important;
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1) !important;
  background: transparent !important;
  cursor: pointer !important;
}

.vol-group button:hover:not(:disabled) {
  background: #ffffff !important;
  color: #0f172a !important;
  border-color: #cbd5e1 !important;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06) !important;
  transform: translateY(-0.5px) !important;
}

.vol-group button.on {
  background: #ffffff !important;
  color: #1d4ed8 !important;
  border-color: #93c5fd !important;
  font-weight: 600 !important;
  box-shadow: 0 1px 4px rgba(37, 99, 235, 0.16) !important;
}

.vol-group button:disabled {
  opacity: 0.45 !important;
  cursor: not-allowed !important;
}

.vol-sep {
  width: 1px !important;
  height: 16px !important;
  background: #cbd5e1 !important;
  margin: 0 4px !important;
  align-self: center !important;
}

.vol-dpad {
  display: inline-flex !important;
  align-items: center !important;
  gap: 2px !important;
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 6px !important;
  padding: 1px 2px !important;
}

.vol-dpad button {
  padding: 2px 5px !important;
  min-height: 22px !important;
  min-width: 22px !important;
  justify-content: center !important;
  font-size: 11px !important;
  border-radius: 4px !important;
}
`;

if (!css.includes('vol-group')) {
  css += '\n' + cssToAdd;
  fs.writeFileSync(cssFile, css, 'utf8');
  console.log('✓ Added CSS rules to theme-modern.css');
} else {
  console.log('ℹ CSS rules already exist in theme-modern.css');
}
