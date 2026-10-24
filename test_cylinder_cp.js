const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// Let's inspect how cP evaluates for cylinder
// Look at cP:
// const i = e.shapes.find(p => p.group === t.group && Op(p.kind));
// if(!i) return [];
// const o = i.pts.map(p => n.get(p));
// if(o.some(p => !p)) return [];
// const s = b4(r), l = v4(i.kind, o, s);
// if(!l) return [];
// ...
console.log('Testing cP for cylinder...');
