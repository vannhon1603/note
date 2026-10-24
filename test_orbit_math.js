// Test orbit rotation delta and bounds
function testOrbit() {
  const startYaw = 0.44;
  const startPitch = 0.34;
  const dx = 100;
  const dy = -50;
  const yaw = startYaw + dx * 0.012;
  const pitch = Math.max(-0.6, Math.min(1.2, startPitch - dy * 0.01));
  console.log('Yaw:', yaw, 'Pitch:', pitch);
}
testOrbit();
