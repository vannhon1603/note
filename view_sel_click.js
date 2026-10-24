const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const target = 'if(!(this.selectMode==="object"&&this.unselectedAt(n,r,i,this.sel))&&i.x>=M.x0&&i.x<=M.x1&&i.y>=M.y0&&i.y<=M.y1){';
const p = js.indexOf(target);
console.log('click inside selection target at', p);
console.log(js.slice(p - 50, p + 400));
