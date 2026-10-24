const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
let idx = content.indexOf('function VolumeDialog');
let idxEnd = content.indexOf('const VT_PRESETS', idx);
let code = content.slice(idx, idxEnd);
console.log('Includes Enter:', code.includes('Enter'));
console.log('Includes onKeyDown:', code.includes('onKeyDown'));
