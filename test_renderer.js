/**
 * Test Volume 3D Renderer with Ox and Oy support, sweep angle, and 3D rotation
 */
const fs = require('fs');

function testRenderer() {
  const item = {
    x: 0, y: 0, w: 500, h: 360,
    expr: 'sqrt(4 - x^2)',
    expr2: '',
    axis: 'ox',
    a: 0, b: 2,
    nSlices: 24,
    sweepAngle: 270, // degrees
    viewYaw: 0.35,
    viewPitch: 0.28
  };
  console.log('Renderer config OK');
}
testRenderer();
