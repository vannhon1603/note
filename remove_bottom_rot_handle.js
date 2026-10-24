const fs = require('fs');

const file = 'dist/assets/index-D9JME9Hm.js';
fs.copyFileSync(file, file + '.bak_remove_rot_handle');
console.log('✓ Backup created: ' + file + '.bak_remove_rot_handle');

let js = fs.readFileSync(file, 'utf8');

// Target 1: Block 1 in drawVolume3D
const t1 = `      if (item._rotHandle && sweepDeg < 355) {
        const hX = x + item._rotHandle.x, hY = y + item._rotHandle.y;
        ctx.save();
        ctx.shadowColor = isRevOx ? "rgba(37,99,235,0.25)" : "rgba(5,150,105,0.25)";
        ctx.shadowBlur = 4;
        ctx.beginPath(); ctx.arc(hX, hY, 6.5, 0, Math.PI * 2); ctx.fillStyle = isRevOx ? "rgba(37,99,235,0.12)" : "rgba(5,150,105,0.12)"; ctx.fill();
        ctx.beginPath(); ctx.arc(hX, hY, 4.5, 0, Math.PI * 2); ctx.fillStyle = "#ffffff"; ctx.fill();
        ctx.strokeStyle = trCol; ctx.lineWidth = 1.4; ctx.stroke();
        ctx.beginPath(); ctx.arc(hX, hY, 1.8, 0, Math.PI * 2); ctx.fillStyle = trCol; ctx.fill();
        const badgeTxt = (sweepDeg <= 2) ? "↺ Kéo xoay 3D" : ("↺ " + Math.round(sweepDeg) + "°");
        ctx.font = "bold 9.5px system-ui, sans-serif";
        const bW = ctx.measureText(badgeTxt).width + 8;
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.strokeStyle = "rgba(203, 213, 225, 0.9)"; ctx.lineWidth = 0.9;
        if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(hX - bW / 2, hY - 18, bW, 13, 3.5); ctx.fill(); ctx.stroke(); }
        else { ctx.fillRect(hX - bW / 2, hY - 18, bW, 13); ctx.strokeRect(hX - bW / 2, hY - 18, bW, 13); }
        ctx.fillStyle = trCol; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(badgeTxt, hX, hY - 11.5);
        ctx.restore();
      }`;

const r1 = `      /* Bottom rotHandle removed per user request */`;

if (!js.includes(t1)) {
  console.error('Target 1 NOT found!');
  process.exit(1);
}
js = js.replace(t1, r1);
console.log('✓ Target 1 replaced');

// Target 2: Block 2 in drawVolume3D
const t2 = `  } else if (!isCross && item._rotHandle && sweepDeg < 355) {
    const hX = x + item._rotHandle.x, hY = y + item._rotHandle.y;
    const trCol = isRevOx ? "#2563eb" : "#059669";
    const badgeTxt = "↺ " + Math.round(sweepDeg) + "°";
    ctx.save();
    ctx.font = "bold 9.5px system-ui, sans-serif";
    const bW = ctx.measureText(badgeTxt).width + 8;
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.strokeStyle = "rgba(203, 213, 225, 0.85)"; ctx.lineWidth = 0.8;
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(hX - bW / 2, hY - 18, bW, 14, 4); ctx.fill(); ctx.stroke(); }
    else { ctx.fillRect(hX - bW / 2, hY - 18, bW, 14); ctx.strokeRect(hX - bW / 2, hY - 18, bW, 14); }
    ctx.fillStyle = trCol; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(badgeTxt, hX, hY - 11);
    ctx.restore();
  }`;

const r2 = `  }`;

if (!js.includes(t2)) {
  console.error('Target 2 NOT found!');
  process.exit(1);
}
js = js.replace(t2, r2);
console.log('✓ Target 2 replaced');

fs.writeFileSync(file, js, 'utf8');
console.log('✓ Successfully wrote modified ' + file);
