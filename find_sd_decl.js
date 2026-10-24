const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const idx = content.indexOf('selectDown(t,n,r,i');
console.log('selectDown declaration at', idx);
if (idx !== -1) {
  console.log(content.slice(idx, idx + 400));
} else {
  let idx2 = 0;
  while ((idx2 = content.indexOf('selectDown(', idx2 + 1)) !== -1) {
    console.log('found at', idx2, ':', content.slice(idx2 - 30, idx2 + 60));
  }
}
