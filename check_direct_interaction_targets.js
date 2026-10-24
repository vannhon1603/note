const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const targets = [
  ['move target', 'case"crossSection":{'],
  ['up target', 'case"crossSection":this.drag=null,this.redraw(),this.emit();return;'],
  ['selectDown inside target', 'if(!(this.selectMode==="object"&&this.unselectedAt(n,r,i,this.sel))&&i.x>=M.x0&&i.x<=M.x1&&i.y>=M.y0&&i.y<=M.y1){'],
  ['selectDown unselected target', 'else if(v&&!w)d.items.add(v.id);']
];

for (const [name, target] of targets) {
  const idx = js.indexOf(target);
  console.log(name + ':', idx >= 0 ? 'FOUND at ' + idx : 'NOT FOUND');
}
