const fs = require('fs');

const file = 'dist/assets/index-D9JME9Hm.js';
let content = fs.readFileSync(file, 'utf8');

const oldTarget = `grad.addColorStop(0, "rgba(251, 113, 133, 0.95)");
        grad.addColorStop(1, "rgba(225, 29, 72, 0.90)");
        ctx.fillStyle = grad;
        ctx.fill();

        // Subtle hatching lines
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = "rgba(159, 18, 57, 0.28)";`;

const newTarget = `grad.addColorStop(0, "rgba(251, 191, 36, 0.95)");
        grad.addColorStop(1, "rgba(245, 158, 11, 0.92)");
        ctx.fillStyle = grad;
        ctx.fill();

        // Subtle hatching lines
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = "rgba(180, 83, 9, 0.35)";`;

if (content.includes(oldTarget)) {
  content = content.replace(oldTarget, newTarget);
  fs.writeFileSync(file, content, 'utf8');
  console.log('[OK] Cross solids gradient & hatching successfully replaced with Amber-Gold!');
} else {
  console.error('[FAIL] Could not find target!');
}
