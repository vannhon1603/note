// Test 3D normal and visibility logic under various yaw and pitch angles
function testVisibility() {
  const angles = [
    { name: 'Default view', yaw: 0.44, pitch: 0.34 },
    { name: 'Looking from above', yaw: 0.44, pitch: 1.2 },
    { name: 'Looking from below', yaw: 0.44, pitch: -0.8 },
    { name: 'Rotated 90 deg', yaw: 0.44 + Math.PI / 2, pitch: 0.34 },
    { name: 'Rotated 180 deg (back)', yaw: 0.44 + Math.PI, pitch: 0.34 },
    { name: 'Rotated 270 deg', yaw: 0.44 + 3 * Math.PI / 2, pitch: 0.34 }
  ];

  for (const a of angles) {
    const { yaw, pitch } = a;
    const getCameraNormalZ = (nx, ny, nz) => {
      const nx1 = nx * Math.cos(yaw) + nz * Math.sin(yaw);
      const nz1 = -nx * Math.sin(yaw) + nz * Math.cos(yaw);
      const ny1 = ny * Math.cos(pitch) - nz1 * Math.sin(pitch);
      const nz2 = ny * Math.sin(pitch) + nz1 * Math.cos(pitch);
      return nz2;
    };

    // Face 0: N = (0, 0, -1)
    const nzFace0 = getCameraNormalZ(0, 0, -1);
    
    // Face 270 deg: sweepRad = 1.5 * PI, N = (0, 1, 0)
    const nzFace270 = getCameraNormalZ(0, 1, 0);

    // Axis opening at 270 deg: D_open = (0, cos(315 deg), sin(315 deg))
    const dOpenZ = getCameraNormalZ(0, Math.cos(1.75 * Math.PI), Math.sin(1.75 * Math.PI));

    console.log(`[${a.name}] yaw=${yaw.toFixed(2)}, pitch=${pitch.toFixed(2)}:`);
    console.log(`  Face 0 (Z=0, Y>=0): nz = ${nzFace0.toFixed(3)} -> ${nzFace0 > 0 ? 'SOLID' : 'DASHED'}`);
    console.log(`  Face 270 (Y=0, Z<=0): nz = ${nzFace270.toFixed(3)} -> ${nzFace270 > 0 ? 'SOLID' : 'DASHED'}`);
    console.log(`  Axis [a,b]: nz = ${dOpenZ.toFixed(3)} -> ${dOpenZ > 0 ? 'SOLID' : 'DASHED'}`);
  }
}
testVisibility();
