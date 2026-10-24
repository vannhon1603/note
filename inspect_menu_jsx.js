const fs = require('fs');
const code = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// Find where dropdown-menu is created in JSX
let idx = 0;
while ((idx = code.indexOf('"dropdown-menu', idx)) !== -1) {
  console.log('=== "dropdown-menu" at', idx, '===');
  console.log(code.slice(Math.max(0, idx - 200), Math.min(code.length, idx + 400)));
  idx += 15;
}
