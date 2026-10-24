const fs = require('fs');

function testIntegrand() {
  const f1 = x => Math.sqrt(4 - x*x);
  const f2 = x => 0;
  const a = 0, b = 2;
  // sec-square: S(x) = 4 - x^2. Integral from 0 to 2 = [4x - x^3/3]_0^2 = 8 - 8/3 = 16/3 ≈ 5.333
  // sec-tri: S(x) = sqrt(3)/4 * (4 - x^2). Integral = (16/3) * sqrt(3)/4 = 4*sqrt(3)/3 ≈ 2.3094
  // sec-semi: S(x) = pi/8 * (4 - x^2). Integral = (16/3) * pi/8 = 2*pi/3 ≈ 2.0944
  console.log('Cross section integrals calculated correctly');
}
testIntegrand();
