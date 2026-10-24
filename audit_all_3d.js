const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const q2Start = js.indexOf('function q2(');
const q2End = js.indexOf('return{points:d,shapes:p}', q2Start);
const q2Code = js.slice(q2Start, q2End);

const list = [
  "pyramid4", "pyramid3", "box", "prism3", "cone", "cylinder", "sphere",
  "octahedron", "obliquePrism", "obliqueBox", "frustumPyramid", "frustumCone",
  "truncCylinder", "wedge", "wedgeRest", "cap", "plane"
];

for (const id of list) {
  const caseStr = `case"${id}":`;
  const pos = q2Code.indexOf(caseStr);
  if (pos === -1) {
    console.log(`${id}: NO CASE in q2!`);
  } else {
    // find next case or break
    const nextBreak = q2Code.indexOf('break', pos);
    const chunk = q2Code.slice(pos, nextBreak !== -1 ? nextBreak + 10 : pos + 600);
    const hasJ = chunk.includes('j(');
    const hasV = chunk.includes('v(');
    console.log(`=== ${id} ===`);
    console.log(`hasJ (solid): ${hasJ}, hasV: ${hasV}`);
    const jCalls = chunk.match(/j\([^)]+\)/g);
    if (jCalls) console.log('  jCalls:', jCalls);
    const vCalls = chunk.match(/v\([^)]+\)/g);
    if (vCalls) console.log('  vCalls:', vCalls);
  }
}
