const fs = require('fs');

let js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// 1. Update wT to include truncCylinder:
// wT=["cone","cylinder","sphere","frustumCone","cap","wedge","wedgeRest"]
const oldWT = 'wT=["cone","cylinder","sphere","frustumCone","cap","wedge","wedgeRest"]';
const newWT = 'wT=["cone","cylinder","sphere","frustumCone","cap","wedge","wedgeRest","truncCylinder"]';
if (!js.includes(oldWT)) throw new Error('oldWT not found');
js = js.replace(oldWT, newWT);

// 2. In selectedSolid(), include truncCylinder:
// ["cap","wedge","wedgeRest"].includes(i.kind)
const oldSel = '["cap","wedge","wedgeRest"].includes(i.kind)';
const newSel = '["cap","wedge","wedgeRest","truncCylinder"].includes(i.kind)';
if (!js.includes(oldSel)) throw new Error('oldSel not found');
js = js.replace(oldSel, newSel);

// 3. In q2 case "truncCylinder":
// Add K(...) and j("truncCylinder", [A,E,P,V])
const oldTrunc = 'v("truncCylinder",[A,E,P,V]),x(A,E,!0,!0);break}';
const newTrunc = 'K(A,0),K(E,0),K(P,-.55*L),K(V,-.85*L),v("truncCylinder",[A,E,P,V]),x(A,E,!0,!0),j("truncCylinder",[A,E,P,V]);break}';
if (!js.includes(oldTrunc)) throw new Error('oldTrunc not found');
js = js.replace(oldTrunc, newTrunc);

// 4. In cP(e,t,n):
// Add support for truncCylinder, wedge, wedgeRest
const oldCPStart = 'function cP(e,t,n){const r=t.solid;if(r.faces)return r.faces.map(p=>p.map(g=>n.get(t.pts[g]))).filter(p=>p.every(g=>g));';
const newCPStart = `function cP(e,t,n){const r=t.solid;
if(r.faces)return r.faces.map(p=>p.map(g=>n.get(t.pts[g]))).filter(p=>p.every(g=>g));
const s=b4(r);
// Special 3D mesh for truncCylinder
if(r.of==="truncCylinder"){
  const sh=e.shapes.find(p=>p.group===t.group&&p.kind==="truncCylinder");
  if(sh&&sh.pts.length>=4){
    const[pA,pE,pP,pV]=sh.pts.map(p=>n.get(p));
    if(pA&&pE&&pP&&pV){
      const rad=Math.hypot(pE[0]-pA[0],pE[1]-pA[1])||40;
      const h1=Math.abs(pP[2]-pA[2])||70, h2=Math.abs(pV[2]-pA[2])||110;
      const N=24, bPts=[], tPts=[];
      for(let k=0;k<N;k++){
        const ang=2*Math.PI*k/N, ca=Math.cos(ang), sa=Math.sin(ang);
        bPts.push([pA[0]+rad*ca, pA[1]+rad*sa, pA[2]]);
        const hk=h1+(h2-h1)*(0.5+0.5*ca);
        tPts.push([pA[0]+rad*ca, pA[1]+rad*sa, pA[2]-hk]);
      }
      const fcs=[bPts, tPts];
      for(let k=0;k<N;k++){
        const k2=(k+1)%N;
        fcs.push([bPts[k], bPts[k2], tPts[k2], tPts[k]]);
      }
      return fcs;
    }
  }
}
// Special 3D mesh for wedge and wedgeRest
if(r.of==="wedge"||r.of==="wedgeRest"){
  const sh=e.shapes.find(p=>p.group===t.group&&(p.kind==="wedge"||p.kind==="wedgeRest"));
  if(sh&&sh.pts.length>=4){
    const[pO,pR,pI,pS]=sh.pts.map(p=>n.get(p));
    if(pO&&pR&&pI&&pS){
      const rad=Math.hypot(pR[0]-pO[0],pR[1]-pO[1])||40;
      const ht=Math.abs(pS[2]-pO[2])||50;
      const isRest=r.of==="wedgeRest", N=16, bPts=[], tPts=[];
      for(let k=0;k<=N;k++){
        const ang=-Math.PI/2+Math.PI*k/N, ca=Math.cos(ang), sa=Math.sin(ang);
        bPts.push([pO[0]+rad*ca, pO[1]+rad*sa, pO[2]]);
        const dk=isRest?(1-ca):ca;
        tPts.push([pO[0]+rad*ca, pO[1]+rad*sa, pO[2]-ht*dk]);
      }
      const fcs=[[pO, ...bPts], [pO, ...tPts], [pO, bPts[0], tPts[0]], [pO, bPts[N], tPts[N]]];
      for(let k=0;k<N;k++){
        fcs.push([bPts[k], bPts[k+1], tPts[k+1], tPts[k]]);
      }
      return fcs;
    }
  }
}
`;
if (!js.includes(oldCPStart)) throw new Error('oldCPStart not found');
js = js.replace(oldCPStart, newCPStart);

// 5. In paintCrossSection, suppress cluttered vertex dots on curved solids (screenPts.length > 8)
const oldDots = `screenPts.forEach((p,i)=>{t.beginPath(),t.arc(p.x,p.y,4.5,0,2*Math.PI),t.fillStyle="#ff6b00",t.fill(),t.strokeStyle="#fff",t.lineWidth=2,t.stroke();const lbl=labels[i%labels.length],dx=p.x-(bx0+bx1)/2,dy=p.y-(by0+by1)/2,d=Math.hypot(dx,dy)||1;t.fillStyle="#0f172a",t.fillText(lbl,p.x+dx/d*14,p.y+dy/d*14)});`;
const newDots = `if(screenPts.length<=8){screenPts.forEach((p,i)=>{t.beginPath(),t.arc(p.x,p.y,4.5,0,2*Math.PI),t.fillStyle="#ff6b00",t.fill(),t.strokeStyle="#fff",t.lineWidth=2,t.stroke();const lbl=labels[i%labels.length],dx=p.x-(bx0+bx1)/2,dy=p.y-(by0+by1)/2,d=Math.hypot(dx,dy)||1;t.fillStyle="#0f172a",t.fillText(lbl,p.x+dx/d*14,p.y+dy/d*14)});}else{/* Curved solid: smooth curve without 96 cluttered letters */}`;
if (!js.includes(oldDots)) throw new Error('oldDots not found');
js = js.replace(oldDots, newDots);

fs.writeFileSync('dist/assets/index-D9JME9Hm.js', js, 'utf8');
console.log('Successfully patched all 3D shapes for cross section!');
