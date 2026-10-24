const fs = require('fs');
let js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');
const target = 't.textBaseline="middle",if(screenPts.length<=8)';
const replacement = 't.textBaseline="middle";if(screenPts.length<=8)';
if (!js.includes(target)) {
  console.error('Target not found!');
  process.exit(1);
}
js = js.replace(target, replacement);
fs.writeFileSync('dist/assets/index-D9JME9Hm.js', js, 'utf8');
console.log('Fixed comma before if statement successfully!');
