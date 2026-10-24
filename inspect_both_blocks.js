const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// Target 1: selected volume item
const selStart = js.indexOf('const _vId=[..._vB.items][0];');
const selEnd = js.indexOf('const B=this.sel,j=this.tol()', selStart);

console.log('Selected block:\n', js.slice(selStart, selEnd));

// Target 2: unselected volume item
const unselStart = js.indexOf('if(v.type==="volume"){this.sel=d;');
const unselEnd = js.indexOf('this.expandGeo(n,d);this.sel=d;', unselStart);

console.log('\nUnselected block:\n', js.slice(unselStart, unselEnd));
