const fs = require('fs');

const file = 'dist/assets/index-D9JME9Hm.js';
let content = fs.readFileSync(file, 'utf8');

const targetOld = `      if (item._rotHandle && sweepDeg < 355) {
        const hX = x + item._rotHandle.x, hY = y + item._rotHandle.y;
        ctx.save();
        ctx.shadowColor = isRevOx ? "rgba(37,99,235,0.35)" : "rgba(5,150,105,0.35)";
        ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(hX, hY, 12, 0, Math.PI * 2); ctx.fillStyle = isRevOx ? "rgba(37,99,235,0.18)" : "rgba(5,150,105,0.18)"; ctx.fill();
        ctx.beginPath(); ctx.arc(hX, hY, 8, 0, Math.PI * 2); ctx.fillStyle = "#ffffff"; ctx.fill();
        ctx.strokeStyle = trCol; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(hX, hY, 3.5, 0, Math.PI * 2); ctx.fillStyle = trCol; ctx.fill();
        const badgeTxt = (sweepDeg <= 2) ? "↺ Kéo xoay 3D" : ("↺ " + Math.round(sweepDeg) + "°");
        ctx.font = "bold 10px system-ui, sans-serif";
        const bW = ctx.measureText(badgeTxt).width + 8;
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.strokeStyle = "rgba(203, 213, 225, 0.9)"; ctx.lineWidth = 1;
        if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(hX - bW / 2, hY - 20, bW, 14, 4); ctx.fill(); ctx.stroke(); }
        else { ctx.fillRect(hX - bW / 2, hY - 20, bW, 14); ctx.strokeRect(hX - bW / 2, hY - 20, bW, 14); }
        ctx.fillStyle = trCol; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(badgeTxt, hX, hY - 13);
        ctx.restore();
      }`;

if (!content.includes(targetOld)) {
  console.error('Target string not found!');
  process.exit(1);
}

const targetNew = `      if (item._rotHandle && sweepDeg < 355) {
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

content = content.replace(targetOld, targetNew);
fs.writeFileSync(file, content, 'utf8');
console.log('Successfully patched index-D9JME9Hm.js with smaller sleek handle!');
