const fs = require('fs');

const file = 'dist/assets/index-D9JME9Hm.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Sphere end cap: make it sapphire blue instead of confusing red
const oldCapColors = `fill: thCap === 0 ? (isRevOx ? "rgba(191, 219, 254, 0.35)" : "rgba(167, 243, 208, 0.35)") : (isRevOx ? "rgba(255, 228, 230, 0.50)" : "rgba(255, 228, 230, 0.50)"),
          stroke: thCap === 0 ? (isRevOx ? "rgba(29, 78, 216, 0.92)" : "rgba(4, 120, 87, 0.92)") : (isRevOx ? "rgba(225, 29, 72, 0.95)" : "rgba(225, 29, 72, 0.95)"),`;

const newCapColors = `fill: thCap === 0 ? (isRevOx ? "rgba(191, 219, 254, 0.40)" : "rgba(167, 243, 208, 0.40)") : (isRevOx ? "rgba(191, 219, 254, 0.45)" : "rgba(167, 243, 208, 0.45)"),
          stroke: thCap === 0 ? (isRevOx ? "rgba(29, 78, 216, 0.92)" : "rgba(4, 120, 87, 0.92)") : (isRevOx ? "rgba(37, 99, 235, 0.92)" : "rgba(5, 150, 105, 0.92)"),`;

console.log('Found oldCapColors:', content.includes(oldCapColors));

// 2. Tab 2 active color: Amber instead of red
const oldTab2 = `if (isCross) {
      ctx.fillStyle = "#e11d48"; ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 10px system-ui, sans-serif";`;

const newTab2 = `if (isCross) {
      ctx.fillStyle = "#d97706"; ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 10px system-ui, sans-serif";`;

console.log('Found oldTab2:', content.includes(oldTab2));

// 3. Slider in Cross-Section mode: Amber instead of red
const oldCsSlider = `ctx.strokeStyle = "#e11d48"; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(knobX, tY); ctx.stroke();
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(knobX, tY, 6.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#e11d48"; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.fillStyle = "#e11d48"; ctx.beginPath(); ctx.arc(knobX, tY, 2.4, 0, Math.PI * 2); ctx.fill();`;

const newCsSlider = `ctx.strokeStyle = "#d97706"; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(tX0, tY); ctx.lineTo(knobX, tY); ctx.stroke();
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(knobX, tY, 6.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#d97706"; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.fillStyle = "#d97706"; ctx.beginPath(); ctx.arc(knobX, tY, 2.4, 0, Math.PI * 2); ctx.fill();`;

console.log('Found oldCsSlider:', content.includes(oldCsSlider));

// 4. Slider badge in Cross-Section mode:
const oldCsBadge = `ctx.save(); ctx.fillStyle = "rgba(255,255,255,0.96)"; ctx.strokeStyle = "rgba(225, 29, 72, 0.65)"; ctx.lineWidth = 1;
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(badgeX - cW / 2, tY - 21, cW, 16, 4); else ctx.rect(badgeX - cW / 2, tY - 21, cW, 16); ctx.fill(); ctx.stroke(); ctx.restore();
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#9f1239";`;

const newCsBadge = `ctx.save(); ctx.fillStyle = "rgba(255,255,255,0.98)"; ctx.strokeStyle = "rgba(245, 158, 11, 0.75)"; ctx.lineWidth = 1;
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(badgeX - cW / 2, tY - 21, cW, 16, 4); else ctx.rect(badgeX - cW / 2, tY - 21, cW, 16); ctx.fill(); ctx.stroke(); ctx.restore();
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#b45309";`;

console.log('Found oldCsBadge:', content.includes(oldCsBadge));

// 5. Volume badge in Cross-Section mode:
const oldVolBadgeBox = `ctx.save();
      ctx.shadowColor = isCross ? "rgba(225, 29, 72, 0.14)" : "rgba(37, 99, 235, 0.12)";
      ctx.shadowBlur = 10; ctx.shadowOffsetY = 2;
      ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
      ctx.strokeStyle = isCross ? "rgba(225, 29, 72, 0.35)" : "rgba(37, 99, 235, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(volBadgeX, fY, volBadgeW, fH, 8);
      else ctx.rect(volBadgeX, fY, volBadgeW, fH);
      ctx.fill(); ctx.stroke();
      ctx.restore();

      ctx.fillStyle = isCross ? "#9f1239" : "#1e40af";`;

const newVolBadgeBox = `ctx.save();
      ctx.shadowColor = isCross ? "rgba(245, 158, 11, 0.16)" : "rgba(37, 99, 235, 0.12)";
      ctx.shadowBlur = 10; ctx.shadowOffsetY = 2;
      ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
      ctx.strokeStyle = isCross ? "rgba(245, 158, 11, 0.45)" : "rgba(37, 99, 235, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(volBadgeX, fY, volBadgeW, fH, 8);
      else ctx.rect(volBadgeX, fY, volBadgeW, fH);
      ctx.fill(); ctx.stroke();
      ctx.restore();

      ctx.fillStyle = isCross ? "#b45309" : "#1e40af";`;

console.log('Found oldVolBadgeBox:', content.includes(oldVolBadgeBox));
