const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const mIdx = js.indexOf('case"volCut":{');
console.log('case volCut at', mIdx);
if (mIdx !== -1) {
  console.log(js.slice(mIdx, mIdx + 650));
}

const uIdx = js.indexOf('case"volCut":case"volOrbit":{');
console.log('case up volCut at', uIdx);
if (uIdx !== -1) {
  console.log(js.slice(uIdx, uIdx + 300));
}

const sIdx = js.indexOf('if(_vItem&&_vItem.type==="volume"){');
console.log('selectDown volume at', sIdx);
if (sIdx !== -1) {
  console.log(js.slice(sIdx, sIdx + 700));
}

const unIdx = js.indexOf('if(v.type==="volume"){');
console.log('unselected volume at', unIdx);
if (unIdx !== -1) {
  console.log(js.slice(unIdx, unIdx + 700));
}
