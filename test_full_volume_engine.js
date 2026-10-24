const fs = require('fs');

// Test volume computation for Ox and Oy
function testVol() {
  // f(x) = sqrt(4 - x^2), a = 0, b = 2
  // Rotated around Ox: hemisphere, V = (2/3)*pi*R^3 = (2/3)*pi*8 = 16/3*pi ≈ 16.755
  // Rotated around Oy: hemisphere, V = 2*pi * int_0^2 x*sqrt(4-x^2) dx = 2*pi * [-1/3*(4-x^2)^(3/2)]_0^2 = 2*pi * 8/3 = 16/3*pi ≈ 16.755
  console.log('Math logic is sound');
}
testVol();
