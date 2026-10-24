const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// Search for cP definition again
const idx = js.indexOf('function cP(');
console.log(js.slice(idx, idx + 800));
