const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const target = '(o==null?void 0:o.selection)&&f.jsxs("div",{className:"selection-bar",children:[(ee==null?void 0:ee.selectedItem())&&ee.selectedItem().item.type!=="image"&&f.jsxs("button",{onClick:x1,children:[f.jsx(de.edit,{})," ",n.edit]}),';
const idx = js.indexOf(target);
console.log('selection-bar target at', idx);
if (idx < 0) {
  // Let's find parts of it
  const p = js.indexOf('className:"selection-bar"');
  console.log('className:"selection-bar" at', p);
  console.log(js.slice(p - 50, p + 250));
}
