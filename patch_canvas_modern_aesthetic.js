const fs = require('fs');

const file = 'dist/assets/index-D9JME9Hm.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Cross-section slider knob
const oldCsKnob = `      ctx.strokeStyle = "rgba(203,213,225,0.85)"; ctx.lineWidth = 4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(tX1, tY); ctx.stroke();
      ctx.strokeStyle = "#e11d48"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(knobX, tY); ctx.stroke();
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(knobX, tY, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#e11d48"; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.fillStyle = "#e11d48"; ctx.beginPath(); ctx.arc(knobX, tY, 3.5, 0, Math.PI * 2); ctx.fill();`;

const newCsKnob = `      ctx.strokeStyle = "rgba(226,232,240,0.95)"; ctx.lineWidth = 3.5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(tX1, tY); ctx.stroke();
      ctx.strokeStyle = "#e11d48"; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(knobX, tY); ctx.stroke();
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(knobX, tY, 6.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#e11d48"; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.fillStyle = "#e11d48"; ctx.beginPath(); ctx.arc(knobX, tY, 2.4, 0, Math.PI * 2); ctx.fill();`;

// 2. Revolution slider knob
const oldRevKnob = `      ctx.strokeStyle = "rgba(203,213,225,0.85)"; ctx.lineWidth = 4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(tX1, tY); ctx.stroke();
      ctx.strokeStyle = trCol; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(knobX, tY); ctx.stroke();
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(knobX, tY, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = trCol; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.fillStyle = trCol; ctx.beginPath(); ctx.arc(knobX, tY, 3.5, 0, Math.PI * 2); ctx.fill();`;

const newRevKnob = `      ctx.strokeStyle = "rgba(226,232,240,0.95)"; ctx.lineWidth = 3.5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(tX1, tY); ctx.stroke();
      ctx.strokeStyle = trCol; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(knobX, tY); ctx.stroke();
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(knobX, tY, 6.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = trCol; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.fillStyle = trCol; ctx.beginPath(); ctx.arc(knobX, tY, 2.4, 0, Math.PI * 2); ctx.fill();`;

// 3. Volume result badge box
const oldVolBadge = `      ctx.save();
      ctx.shadowColor = isCross ? "rgba(225, 29, 72, 0.20)" : "rgba(37, 99, 235, 0.15)";
      ctx.shadowBlur = 8; ctx.shadowOffsetY = 1;
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.strokeStyle = isCross ? "rgba(225, 29, 72, 0.50)" : "rgba(37, 99, 235, 0.4)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(volBadgeX, fY, volBadgeW, fH, 6);
      else ctx.rect(volBadgeX, fY, volBadgeW, fH);
      ctx.fill(); ctx.stroke();
      ctx.restore();`;

const newVolBadge = `      ctx.save();
      ctx.shadowColor = isCross ? "rgba(225, 29, 72, 0.14)" : "rgba(37, 99, 235, 0.12)";
      ctx.shadowBlur = 10; ctx.shadowOffsetY = 2;
      ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
      ctx.strokeStyle = isCross ? "rgba(225, 29, 72, 0.35)" : "rgba(37, 99, 235, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(volBadgeX, fY, volBadgeW, fH, 8);
      else ctx.rect(volBadgeX, fY, volBadgeW, fH);
      ctx.fill(); ctx.stroke();
      ctx.restore();`;

let count = 0;
if (content.includes(oldCsKnob)) {
  content = content.replace(oldCsKnob, newCsKnob);
  count++;
}
if (content.includes(oldRevKnob)) {
  content = content.replace(oldRevKnob, newRevKnob);
  count++;
}
if (content.includes(oldVolBadge)) {
  content = content.replace(oldVolBadge, newVolBadge);
  count++;
}

fs.writeFileSync(file, content, 'utf8');
console.log(`Applied ${count} modern aesthetic updates to canvas in index-D9JME9Hm.js`);
