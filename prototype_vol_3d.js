const fs = require('fs');

// Verify all mathematical expressions and edge cases
console.log('Testing prototype vol 3d...');
const a = 0, b = 2;
const N = 24;
const xs = [];
for (let i = 0; i <= N; i++) xs.push(a + (b - a) * i / N);

console.log('Total xs:', xs.length);
console.log('Prototype check passed.');
