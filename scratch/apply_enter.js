const fs = require('fs');
const FILE = 'dist/assets/index-D9JME9Hm.js';
let js = fs.readFileSync(FILE, 'utf8');

// 1. Declare handleSaveRef at top of VolumeDialog
const topTarget = 'function VolumeDialog({item,onSave,onClose}){';
const topReplacement = 'function VolumeDialog({item,onSave,onClose}){\n  const handleSaveRef = H.useRef();';

// 2. Set handleSaveRef.current
const saveTarget = '  const handleSave=()=>{';
const saveReplacement = '  const handleSave=()=>{\n    // save implementation';

const saveFullTarget = `  const handleSave=()=>{
    const fn=bo(expr);`;
const saveFullReplacement = `  const handleSave=()=>{
    const fn=bo(expr);`;

// 3. Connect onKeyDown Enter
const keydownTarget = `      if ((e.ctrlKey || e.metaKey) && (e.key === "v" || e.key === "V")) {
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
      }`;

const keydownReplacement = `      if (e.key === "Enter" && !e.shiftKey && !e.altKey && !e.ctrlKey) {
        if (!e.target || (e.target.tagName !== "TEXTAREA" && e.target.id !== "nrn-gemini-key-input")) {
          e.preventDefault();
          handleSaveRef.current && handleSaveRef.current();
          return;
        }
      }
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
      }`;

// Connect handleSaveRef.current = handleSave;
const assignTarget = `  const handleSave=()=>{
    const fn=bo(expr);`;
const assignReplacement = `  const handleSave=()=>{
    const fn=bo(expr);`;

// Let's attach handleSaveRef.current = handleSave inside the component body
const refAssignTarget = '  handleSaveRef.current = handleSave;\n  const axisLabels={';

let newJs = js;
if (!newJs.includes('const handleSaveRef = H.useRef();')) {
  newJs = newJs.replace(topTarget, topReplacement);
  newJs = newJs.replace(keydownTarget, keydownReplacement);
  newJs = newJs.replace('  const axisLabels={', '  handleSaveRef.current = handleSave;\n  const axisLabels={');
  fs.writeFileSync(FILE, newJs, 'utf8');
  console.log('✓ Successfully added Enter key support to VolumeDialog!');
} else {
  console.log('Already configured');
}
