const fs = require('fs');
let js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const target = 'if(ge==="f")return be(()=>Je({k:"formula",page:he.currentPage(),item:null}));';
const replacement = 'if(ge==="f")return be(()=>Je({k:"formula",page:he.currentPage(),item:null}));if(ge==="v")return be(()=>Je({k:"volume",page:he.currentPage(),item:null}));';

if (!js.includes(target)) {
  throw new Error('Target not found for key shortcut');
}
js = js.replace(target, replacement);
fs.writeFileSync('dist/assets/index-D9JME9Hm.js', js, 'utf8');
console.log('✓ Added "v" shortcut key for Volume tool!');
