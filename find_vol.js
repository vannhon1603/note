const fs = require('fs');
const s = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
let p = s.indexOf('Trượt mặt cắt');
console.log('Slider at', p, s.substring(p - 150, p + 250));
