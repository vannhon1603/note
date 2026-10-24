const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// Search for where aStr is parsed in VolumeDialog
let idx = content.indexOf('function VolumeDialog');
console.log(content.slice(idx, idx + 2000));
