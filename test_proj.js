// Test projection with default yaw and pitch
const yaw = 0.44; // or viewYaw
const pitch = 0.34; // or viewPitch
const na = 0, nb = 4;
const f1 = x => Math.sqrt(x);
const activeCutX = 1.2;
const Ro = f1(activeCutX); // 1.095 or 1.08
const maxVal = 2; // sqrt(4) = 2
const boundR = 2;
const cenX = 2;
const cenY = 0;
const cenZ = 0; // or boundR * 0.35

function project(X, Y, Z, cz = 0) {
  const dx = X - cenX;
  const dy = Y - cenY;
  const dz = Z - cz;
  const x1 = dx * Math.cos(yaw) + dz * Math.sin(yaw);
  const z1 = -dx * Math.sin(yaw) + dz * Math.cos(yaw);
  const y1 = dy * Math.cos(pitch) - z1 * Math.sin(pitch);
  const z2 = dy * Math.sin(pitch) + z1 * Math.cos(pitch);
  return { sx: x1, sy: -y1, z: z2 };
}

console.log("Center:", project(activeCutX, 0, 0));
console.log("Point at ang=0 (Y=Ro, Z=0):", project(activeCutX, Ro, 0));

// Find point on circle with highest sy (most negative sy, meaning highest on screen)
let minY = Infinity, bestAng = 0;
for (let i = 0; i < 360; i++) {
  const ang = i * Math.PI / 180;
  const p = project(activeCutX, Ro * Math.cos(ang), Ro * Math.sin(ang));
  if (p.sy < minY) {
    minY = p.sy;
    bestAng = ang;
  }
}
console.log("Highest screen point on circle: ang =", bestAng * 180 / Math.PI, "sy =", minY);
console.log("Difference between ang=0 and highest point:", project(activeCutX, Ro, 0).sy - minY);
