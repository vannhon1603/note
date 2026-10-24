const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const p = js.indexOf('ee.selectedItem().item.type==="volume"');
console.log('selection-bar volume controls at', p);
console.log(js.slice(p - 60, p + 600));
