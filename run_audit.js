const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// Let's create an evaluation script to run q2 and i1 on all 3D shapes!
const script = `
${js.slice(js.indexOf('const Cp='), js.indexOf('function q2('))}
${js.slice(js.indexOf('function q2('), js.indexOf('const Ep='))}
${js.slice(js.indexOf('function ut('), js.indexOf('function ut(') + 600)}
${js.slice(js.indexOf('function M_('), js.indexOf('function M_(') + 300)}
${js.slice(js.indexOf('function i1('), js.indexOf('function i1(') + 600)}
${js.slice(js.indexOf('function cP('), js.indexOf('function cP(') + 1200)}

const shapes = [
  "pyramid4", "pyramid3", "box", "prism3", "cone", "cylinder", "sphere",
  "octahedron", "obliquePrism", "obliqueBox", "frustumPyramid", "frustumCone",
  "truncCylinder", "wedge", "wedgeRest", "cap", "plane"
];

for (const sid of shapes) {
  let nextId = 1;
  const idGen = () => "id_" + (nextId++);
  try {
    const geo = q2(sid, {x: 100, y: 100}, {x: 400, y: 400}, () => "A", {color: "#000", width: 2}, idGen);
    // Convert points array to object
    const ptsObj = {};
    for (const p of geo.points) ptsObj[p.id] = p;
    geo.points = ptsObj;
    
    // Find solid shape
    const solid = geo.shapes.find(s => s.kind === "solid");
    if (!solid) {
      console.log(sid + ": NO SOLID SHAPE CREATED!");
      continue;
    }
    const pMap = i1(geo, solid);
    const faces = cP(geo, solid, pMap);
    console.log(sid + ": SUCCESS! faces count =", faces ? faces.length : 0);
  } catch (e) {
    console.log(sid + ": ERROR:", e.message);
  }
}
`;

fs.writeFileSync('test_all_solids.js', script);
console.log('test_all_solids.js written');
