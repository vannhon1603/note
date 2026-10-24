const fs = require('fs');
let js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

function mustReplace(target, replacement, label) {
  const idx = js.indexOf(target);
  if (idx < 0) {
    throw new Error('TARGET NOT FOUND: ' + label);
  }
  js = js.slice(0, idx) + replacement + js.slice(idx + target.length);
  console.log('✓ Patched:', label);
}

// 1. Add de.volume icon
const deTarget = 'formula:()=>f.jsx(Ae,{children:f.jsx("path",{d:"M18 5H7l6 7-6 7h11"})}),';
const deReplacement = 'formula:()=>f.jsx(Ae,{children:f.jsx("path",{d:"M18 5H7l6 7-6 7h11"})}),volume:()=>f.jsxs(Ae,{children:[f.jsx("ellipse",{cx:"12",cy:"6.5",rx:"7",ry:"2.5"}),f.jsx("path",{d:"M5 6.5v11c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6.5"}),f.jsx("path",{d:"M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5",strokeDasharray:"2 2"}),f.jsx("path",{d:"M12 4v16",strokeDasharray:"2 2",opacity:"0.45"})]}),';
mustReplace(deTarget, deReplacement, 'de.volume icon');

// 2. Add volumeTip in toolbar translation dictionary
const tipTarget = 'formulaTip:"Chèn công thức (F)",';
const tipReplacement = 'formulaTip:"Chèn công thức (F)",volumeTip:"Thể tích — Tích phân (V)",';
mustReplace(tipTarget, tipReplacement, 'toolbar volumeTip label');

// 3. Add volume button in toolbar right next to formula button
const tbTarget = 'It("formula")&&f.jsx(Pt,{title:n.formulaTip,onClick:()=>Je({k:"formula",page:(ee==null?void 0:ee.currentPage())??0,item:null}),children:f.jsx(de.formula,{})}),';
const tbReplacement = 'It("formula")&&f.jsx(Pt,{title:n.formulaTip,onClick:()=>Je({k:"formula",page:(ee==null?void 0:ee.currentPage())??0,item:null}),children:f.jsx(de.formula,{})}),f.jsx(Pt,{title:n.volumeTip||"Thể tích — Tích phân",onClick:()=>Je({k:"volume",page:(ee==null?void 0:ee.currentPage())??0,item:null}),children:f.jsx(de.volume,{})}),';
mustReplace(tbTarget, tbReplacement, 'toolbar volume button');

// 4. Hook editItem for volume
const editTarget = 'be.type==="formula"?Je({k:"formula",page:ge,item:be}):be.type==="text"&&Nh(ge,be)';
const editReplacement = 'be.type==="formula"?Je({k:"formula",page:ge,item:be}):be.type==="volume"?Je({k:"volume",page:ge,item:be}):be.type==="text"&&Nh(ge,be)';
mustReplace(editTarget, editReplacement, 'editItem volume support');

// 5. Hook x1 (Enter to edit selected item)
const x1Target = '_.item.type==="formula"&&Je({k:"formula",page:_.page,item:_.item}),_.item.type==="text"&&Nh(_.page,_.item)';
const x1Replacement = '_.item.type==="formula"&&Je({k:"formula",page:_.page,item:_.item}),_.item.type==="volume"&&Je({k:"volume",page:_.page,item:_.item}),_.item.type==="text"&&Nh(_.page,_.item)';
mustReplace(x1Target, x1Replacement, 'x1 volume support');

// 6. Scale/move support for volume items
const scaleTarget = 'g.type==="image"||g.type==="graph"||g.type==="vartable"';
const scaleReplacement = 'g.type==="image"||g.type==="graph"||g.type==="vartable"||g.type==="volume"';
mustReplace(scaleTarget, scaleReplacement, 'scale volume support');

fs.writeFileSync('dist/assets/index-D9JME9Hm.js', js, 'utf8');
console.log('🎉 Successfully applied volume UI patch!');
