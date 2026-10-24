const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const regex = /(?:currentAxis|axis|isRev|isCross)\s*[!=]==?\s*['"][^'"]+['"]\s*\?[^:;]+:[^;,\)]+/g;
let match;
let count = 0;
while ((match = regex.exec(content)) !== null && count < 50) {
  if (match[0].includes('#') || match[0].includes('rgb') || match[0].includes('hsl') || match[0].includes('color')) {
    console.log(match.index + ': ' + match[0]);
    count++;
  }
}
