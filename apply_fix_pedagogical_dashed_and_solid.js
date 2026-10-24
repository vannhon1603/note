const fs = require('fs');

const file = 'dist/assets/index-D9JME9Hm.js';
let content = fs.readFileSync(file, 'utf8');

// Target 1: Cap creation in drawVolume3D
const target1 = `        // Dynamic normal calculation for cap to determine front vs back visibility when camera/solid rotates
        const capNx = isRevOy ? (thCap === 0 ? 0 : -Math.sin(thCap)) : 0;
        const capNy = isRevOx ? (thCap === 0 ? 0 : -Math.sin(thCap)) : 0;
        const capNz = thCap === 0 ? -1 : Math.cos(thCap);
        const cnx1 = capNx * Math.cos(yaw) + capNz * Math.sin(yaw);
        const cnz1 = -capNx * Math.sin(yaw) + capNz * Math.cos(yaw);
        const cny1 = capNy * Math.cos(pitch) - cnz1 * Math.sin(pitch);
        const cnz2 = capNy * Math.sin(pitch) + cnz1 * Math.cos(pitch);
        const isBackCap = sweepDeg > 5 && cnz2 < 0;

        faces.push({
          z: capZ / ptsCap.length,
          pts: ptsCap,
          fill: thCap === 0 ? "rgba(191, 219, 254, 0.40)" : "rgba(191, 219, 254, 0.45)",
          stroke: isBackCap ? "rgba(30, 64, 175, 0.75)" : (thCap === 0 ? "rgba(29, 78, 216, 0.92)" : "rgba(37, 99, 235, 0.92)"),
          strokeWidth: isBackCap ? 1.5 : 1.8,
          type: "cap",
          dashed: isBackCap,
          nArch: NCap,
          hasInner: Boolean(expr2 && expr2.trim() && !(fn2raw instanceof Error)),
          isRotatingCap: thCap > 0,
          pA0: isRevOx ? project(na, 0, 0) : project(0, na, 0),
          pB0: isRevOx ? project(nb, 0, 0) : project(0, nb, 0)
        });`;

const replace1 = `        // Chuẩn hình học không gian SGK Toán 12:
        // Cả 2 mặt cắt phẳng của góc bổ (mặt ban đầu tại theta=0 và mặt đang quay tại theta)
        // đều là ĐƯỜNG BIÊN NGOÀI NHÌN THẤY (NÉT LIỀN / SOLID). Trục quay nằm trong lõi là nét đứt riêng.
        faces.push({
          z: capZ / ptsCap.length,
          pts: ptsCap,
          fill: thCap === 0 ? "rgba(191, 219, 254, 0.40)" : "rgba(191, 219, 254, 0.45)",
          stroke: thCap === 0 ? "rgba(29, 78, 216, 0.92)" : "rgba(37, 99, 235, 0.92)",
          strokeWidth: 1.8,
          type: "cap",
          dashed: false,
          nArch: NCap,
          hasInner: Boolean(expr2 && expr2.trim() && !(fn2raw instanceof Error)),
          isRotatingCap: thCap > 0,
          pA0: isRevOx ? project(na, 0, 0) : project(0, na, 0),
          pB0: isRevOx ? project(nb, 0, 0) : project(0, nb, 0)
        });`;

// Target 2: Painter cap stroking
const target2 = `    if (face.stroke && (!isFastMode || face.type === "cap" || face.type === "loft-cap" || face.type === "riemann-face")) {
      ctx.save();
      if (face.dashed) {
        ctx.setLineDash([5, 4]); // Nét đứt cho mặt khuất!
      }
      ctx.strokeStyle = face.stroke;`;

const replace2 = `    if (face.stroke && (!isFastMode || face.type === "cap" || face.type === "loft-cap" || face.type === "riemann-face")) {
      ctx.save();
      if (face.dashed) {
        ctx.setLineDash([5, 4]); // Nét đứt cho mặt khuất!
      } else {
        ctx.setLineDash([]);
      }
      ctx.strokeStyle = face.stroke;`;

// Target 3: Slice cross-section border
const target3 = `          // Crisp sapphire contour border (chuẩn nét liền sư phạm cho lát cắt nhìn thấy)
          if (isFullRev) {
            ctx.beginPath();
            ctx.moveTo(outerArc[0].sx, outerArc[0].sy);
            for (let ci = 1; ci <= nCirclePts; ci++) ctx.lineTo(outerArc[ci].sx, outerArc[ci].sy);
            ctx.closePath();
            ctx.strokeStyle = "#2563eb";
            ctx.lineWidth = 2.4;
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.moveTo(slicePoly[0].sx, slicePoly[0].sy);
            for (let k = 1; k < slicePoly.length; k++) ctx.lineTo(slicePoly[k].sx, slicePoly[k].sy);
            ctx.closePath();
            ctx.strokeStyle = "#2563eb";
            ctx.lineWidth = 2.4;
            ctx.stroke();
          }

          // Inner border if full washer
          if (isFullRev && innerCircle) {
            ctx.beginPath();
            ctx.moveTo(innerCircle[0].sx, innerCircle[0].sy);
            for (let k = 1; k < innerCircle.length; k++) ctx.lineTo(innerCircle[k].sx, innerCircle[k].sy);
            ctx.closePath();
            ctx.strokeStyle = "#1d4ed8";
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }`;

const replace3 = `          // Chuẩn SGK Toán 12: Lát cắt tròn xoay 360 độ (hình elip)
          // Nửa trước hướng về phía camera (nz2 >= 0): NÉT LIỀN.
          // Nửa sau ăn sâu vào lòng khối (nz2 < 0): NÉT ĐỨT!
          if (isFullRev) {
            const drawSplitEllipse = (arcPts, isInner = false) => {
              const nPts = arcPts.length - 1;
              let curVis = null;
              let curSegment = [];
              for (let ci = 0; ci <= nPts; ci++) {
                const ang = (ci / nPts) * Math.PI * 2;
                const normX = isRevY ? Math.cos(ang) : 0;
                const normY = isRevY ? 0 : Math.cos(ang);
                const normZ = Math.sin(ang);
                const nx1 = normX * Math.cos(yaw) + normZ * Math.sin(yaw);
                const nz1 = -normX * Math.sin(yaw) + normZ * Math.cos(yaw);
                const ny1 = normY * Math.cos(pitch) - nz1 * Math.sin(pitch);
                const nz2 = normY * Math.sin(pitch) + nz1 * Math.cos(pitch);
                const ptVis = nz2 >= 0;

                if (curVis === null) {
                  curVis = ptVis;
                  curSegment.push(arcPts[ci]);
                } else if (ptVis === curVis) {
                  curSegment.push(arcPts[ci]);
                } else {
                  curSegment.push(arcPts[ci]);
                  ctx.save();
                  ctx.beginPath();
                  ctx.moveTo(curSegment[0].sx, curSegment[0].sy);
                  for (let k = 1; k < curSegment.length; k++) ctx.lineTo(curSegment[k].sx, curSegment[k].sy);
                  ctx.strokeStyle = curVis ? (isInner ? "#1d4ed8" : "#2563eb") : (isInner ? "rgba(29, 78, 216, 0.75)" : "rgba(37, 99, 235, 0.75)");
                  ctx.lineWidth = curVis ? (isInner ? 1.8 : 2.4) : (isInner ? 1.4 : 1.8);
                  if (!curVis) ctx.setLineDash([5, 4]);
                  else ctx.setLineDash([]);
                  ctx.stroke();
                  ctx.restore();
                  curVis = ptVis;
                  curSegment = [arcPts[ci]];
                }
              }
              if (curSegment.length > 1) {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(curSegment[0].sx, curSegment[0].sy);
                for (let k = 1; k < curSegment.length; k++) ctx.lineTo(curSegment[k].sx, curSegment[k].sy);
                ctx.strokeStyle = curVis ? (isInner ? "#1d4ed8" : "#2563eb") : (isInner ? "rgba(29, 78, 216, 0.75)" : "rgba(37, 99, 235, 0.75)");
                ctx.lineWidth = curVis ? (isInner ? 1.8 : 2.4) : (isInner ? 1.4 : 1.8);
                if (!curVis) ctx.setLineDash([5, 4]);
                else ctx.setLineDash([]);
                ctx.stroke();
                ctx.restore();
              }
            };
            drawSplitEllipse(outerArc, false);
            if (innerCircle) {
              drawSplitEllipse(innerCircle, true);
            }
          } else {
            ctx.beginPath();
            ctx.moveTo(slicePoly[0].sx, slicePoly[0].sy);
            for (let k = 1; k < slicePoly.length; k++) ctx.lineTo(slicePoly[k].sx, slicePoly[k].sy);
            ctx.closePath();
            ctx.strokeStyle = "#2563eb";
            ctx.lineWidth = 2.4;
            ctx.setLineDash([]);
            ctx.stroke();
          }`;

function checkAndReplace(target, replacement, label) {
  const count = content.split(target).length - 1;
  if (count !== 1) {
    console.error(`[ERROR] Target for "${label}" count is ${count} (expected 1).`);
    process.exit(1);
  }
  content = content.replace(target, replacement);
  console.log(`[OK] Replaced: ${label}`);
}

checkAndReplace(target1, replace1, '1. Revolution Cap visibility (Always solid contours)');
checkAndReplace(target2, replace2, '2. Painter cap stroke reset setLineDash');
checkAndReplace(target3, replace3, '3. Slice cross-section split ellipse (solid front, dashed back)');

fs.writeFileSync(file, content, 'utf8');
console.log('[SUCCESS] All patches applied to ' + file);
