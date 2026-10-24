const fs = require('fs');
const content = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const orangeStrings = [
  '#d97706', '#b45309', '#ea580c', '#92400e', '#78350f',
  'rgba(245, 158, 11', 'rgba(217, 119, 6', 'rgba(180, 83, 9',
  'rgba(251, 191, 36', '#fffbeb', '#fef3c7', '#fde68a'
];

const lines = content.split('\n');
lines.forEach((l, i) => {
  const matched = orangeStrings.filter(s => l.includes(s));
  if (matched.length > 0) {
    console.log((i+1) + ': ' + l.trim().slice(0, 120));
  }
});
