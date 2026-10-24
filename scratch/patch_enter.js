const fs = require('fs');
const FILE = 'dist/assets/index-D9JME9Hm.js';
let js = fs.readFileSync(FILE, 'utf8');

// Add handleSaveRef
const target = '  const handleSave=()=>{';
const replacement = '  const handleSaveRef = H.useRef();\n  const handleSave=()=>{\n    handleSaveRef.current && handleSaveRef.current();\n  };\n  const doSave=()=>{';

if (js.includes('const handleSaveRef = H.useRef()')) {
  console.log('Already patched');
} else {
  // Let's check how handleSave is defined
  const idx = js.indexOf('const handleSave=()=>{');
  console.log('Found handleSave at', idx);
}
