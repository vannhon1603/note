const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sIdx = js.indexOf('className:"selection-bar"');
console.log('--- SELECTION BAR BUTTONS ---');
console.log(js.slice(sIdx + 1500, sIdx + 4000));
