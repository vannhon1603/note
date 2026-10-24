const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const pStart = content.indexOf('function drawVolume3D');
const pEnd = content.indexOf('function VolumeDialog', pStart);
const volCode = content.slice(pStart, pEnd);

const orangePatterns = [
  '#f59e0b', '#d97706', '#b45309', '#ea580c', '#c2410c', '#fbbf24',
  'rgba(245, 158, 11', 'rgba(254, 243, 199', 'rgba(217, 119, 6', 'rgba(180, 83, 9',
  'rgba(251, 191, 36', '#fdba74'
];

const lines = volCode.split('\n');
lines.forEach((line, i) => {
  if (orangePatterns.some(p => line.includes(p))) {
    console.log(`Line ${i + 1}: ${line.trim().slice(0, 150)}`);
  }
});
