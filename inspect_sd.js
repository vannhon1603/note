const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const sdIdx = js.indexOf('selectDown(');
const endSd = js.indexOf('move(t){', sdIdx);
const sdCode = js.slice(sdIdx, endSd);
console.log('sdCode length:', sdCode.length);

let pos = 0;
while ((pos = sdCode.indexOf('volume', pos)) !== -1) {
  console.log('--- FOUND volume at offset', pos, '---');
  console.log(sdCode.slice(Math.max(0, pos - 50), Math.min(sdCode.length, pos + 250)));
  pos += 6;
}
