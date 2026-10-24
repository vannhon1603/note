/**
 * Prototype test for 3D Cross-Section lofting and interactive cutting plane
 */
function getCrossSectionShape(type, w) {
  // Returns points (u, v) around perimeter where u is along base, v is perpendicular
  const hw = w / 2;
  if (type === 'sec-square') {
    return [
      { u: -hw, v: 0 },
      { u: hw, v: 0 },
      { u: hw, v: w },
      { u: -hw, v: w }
    ];
  } else if (type === 'sec-tri') {
    const H = (Math.sqrt(3) / 2) * w;
    return [
      { u: -hw, v: 0 },
      { u: hw, v: 0 },
      { u: 0, v: H }
    ];
  } else if (type === 'sec-semi') {
    const R = hw;
    const pts = [];
    const steps = 16;
    for (let i = 0; i <= steps; i++) {
      const ang = (i / steps) * Math.PI;
      pts.push({ u: -R * Math.cos(ang), v: R * Math.sin(ang) });
    }
    return pts;
  } else if (type === 'sec-circle') {
    const R = hw;
    const pts = [];
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const ang = (i / steps) * Math.PI * 2;
      pts.push({ u: R * Math.cos(ang), v: R * Math.sin(ang) });
    }
    return pts;
  } else {
    // Right triangle
    return [
      { u: -hw, v: 0 },
      { u: hw, v: 0 },
      { u: -hw, v: w }
    ];
  }
}

console.log('Square points:', getCrossSectionShape('sec-square', 2).length);
console.log('Tri points:', getCrossSectionShape('sec-tri', 2).length);
console.log('Semi points:', getCrossSectionShape('sec-semi', 2).length);
console.log('Circle points:', getCrossSectionShape('sec-circle', 2).length);
