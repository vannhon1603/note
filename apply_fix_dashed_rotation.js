const fs = require('fs');

const file = 'dist/assets/index-D9JME9Hm.js';
let content = fs.readFileSync(file, 'utf8');

// Target 1: drawRevolutionArc isVis
const target1 = `        // Chuẩn hình học không gian SGK Toán 12:
        // - Đáy hướng về phía người quan sát (baseFacesCamera) hoặc khi đang quét góc bổ (!isFullRev): luôn vẽ NÉT LIỀN (isVis = true)!
        // - Chỉ khi quay đủ 360° và là đáy phía xa bị che khuất thì phần cong ăn sâu vào thân khối (nz2 > 0) mới là nét đứt.
        const isVis = baseFacesCamera || !isFullRev || (nz2 <= 0);`;

const replace1 = `        // Chuẩn hình học không gian SGK Toán 12:
        // - Đáy hướng về camera (baseFacesCamera) thì toàn bộ cung nhìn thấy (nét liền).
        // - Đáy phía xa (quay vào trong/sau): nửa trước (nz2 >= 0) là nét liền, nửa sau ăn sâu vào khối (nz2 < 0) là NÉT ĐỨT!
        const isVis = baseFacesCamera || (nz2 >= 0);`;

// Target 2: Cap at theta = 0 and theta = sweepRad visibility
const target2 = `        // Dynamic normal calculation for cap to determine front vs back visibility when camera rotates
        const normZ_cap = isRevOx
          ? (thCap === 0
              ? -Math.cos(yaw) * Math.cos(pitch)
              : (-Math.sin(thCap) * Math.sin(pitch) + Math.cos(thCap) * Math.cos(yaw) * Math.cos(pitch)))
          : (thCap === 0
              ? Math.sin(yaw)
              : (-Math.sin(thCap) * Math.cos(yaw) + Math.cos(thCap) * Math.sin(yaw)));
        const isBackCap = false; // Cap profile arches are always solid visible contours in SGK
        faces.push({
          z: capZ / ptsCap.length,
          pts: ptsCap,
          fill: thCap === 0 ? "rgba(191, 219, 254, 0.40)" : "rgba(191, 219, 254, 0.45)",
          stroke: thCap === 0 ? "rgba(29, 78, 216, 0.92)" : "rgba(37, 99, 235, 0.92)",
          strokeWidth: 1.8,
          type: "cap",
          dashed: false,
          nArch: NCap,
          hasInner: Boolean(expr2 && expr2.trim() && !(fn2raw instanceof Error))
        });`;

const replace2 = `        // Dynamic normal calculation for cap to determine front vs back visibility when camera/solid rotates
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

// Target 3: Painter cap
const target3 = `    if (face.stroke && (!isFastMode || face.type === "cap" || face.type === "riemann-face")) {
      ctx.save();
      if (face.dashed) {
        ctx.setLineDash([5, 4]); // Nét đứt cho mặt khuất!
      }
      ctx.strokeStyle = face.stroke;
      ctx.lineWidth = face.strokeWidth || 0.4;
      if (face.type === "cap" && face.nArch) {
        // Stroke only the curved arch of the cap, so the dashed rotation axis inside [a, b] is preserved!
        ctx.beginPath();
        ctx.moveTo(pts[0].sx, pts[0].sy);
        for (let k = 1; k <= face.nArch; k++) ctx.lineTo(pts[k].sx, pts[k].sy);
        ctx.stroke();
        if (face.hasInner && pts.length > face.nArch * 2) {
          ctx.beginPath();
          ctx.moveTo(pts[face.nArch + 1].sx, pts[face.nArch + 1].sy);
          for (let k = face.nArch + 2; k < pts.length; k++) ctx.lineTo(pts[k].sx, pts[k].sy);
          ctx.stroke();
        }
      } else {
        ctx.stroke();
      }
      ctx.restore();
    }`;

const replace3 = `    if (face.stroke && (!isFastMode || face.type === "cap" || face.type === "loft-cap" || face.type === "riemann-face")) {
      ctx.save();
      if (face.dashed) {
        ctx.setLineDash([5, 4]); // Nét đứt cho mặt khuất!
      }
      ctx.strokeStyle = face.stroke;
      ctx.lineWidth = face.strokeWidth || 0.4;
      if (face.type === "cap" && face.nArch) {
        // Stroke the profile arch of the cap, and if rotating cap include radial boundary edges
        ctx.beginPath();
        if (face.isRotatingCap) {
          if (face.pA0) {
            ctx.moveTo(face.pA0.sx, face.pA0.sy);
            ctx.lineTo(pts[0].sx, pts[0].sy);
          } else {
            ctx.moveTo(pts[0].sx, pts[0].sy);
          }
        } else {
          ctx.moveTo(pts[0].sx, pts[0].sy);
        }
        for (let k = 1; k <= face.nArch; k++) ctx.lineTo(pts[k].sx, pts[k].sy);
        if (face.isRotatingCap && face.pB0) {
          ctx.lineTo(face.pB0.sx, face.pB0.sy);
        }
        ctx.stroke();
        if (face.hasInner && pts.length > face.nArch * 2) {
          ctx.beginPath();
          ctx.moveTo(pts[face.nArch + 1].sx, pts[face.nArch + 1].sy);
          for (let k = face.nArch + 2; k < pts.length; k++) ctx.lineTo(pts[k].sx, pts[k].sy);
          ctx.stroke();
        }
      } else {
        ctx.stroke();
      }
      ctx.restore();
    }`;

// Target 4: loft-cap
const target4 = `          const cpts = cshape.map(pt => project(capX, cym + pt.u, pt.v));
          const cz = cpts.reduce((acc, p) => acc + p.z, 0) / cpts.length;
          faces.push({
            z: cz,
            pts: cpts,
            fill: "rgba(191, 219, 254, 0.40)",
            stroke: "rgba(29, 78, 216, 0.92)",
            strokeWidth: 1.8,
            type: "loft-cap"
          });`;

const replace4 = `          const cpts = cshape.map(pt => project(capX, cym + pt.u, pt.v));
          const cz = cpts.reduce((acc, p) => acc + p.z, 0) / cpts.length;
          const capNormX = capX === na ? -1 : 1;
          const cnz1 = -capNormX * Math.sin(yaw);
          const cnz2 = cnz1 * Math.cos(pitch);
          const isBackLoftCap = cnz2 < 0;
          faces.push({
            z: cz,
            pts: cpts,
            fill: "rgba(191, 219, 254, 0.40)",
            stroke: isBackLoftCap ? "rgba(30, 64, 175, 0.75)" : "rgba(29, 78, 216, 0.92)",
            strokeWidth: isBackLoftCap ? 1.5 : 1.8,
            type: "loft-cap",
            dashed: isBackLoftCap
          });`;

function checkAndReplace(target, replacement, label) {
  const count = content.split(target).length - 1;
  if (count !== 1) {
    console.error(`[ERROR] Target for "${label}" count is ${count} (expected 1).`);
    process.exit(1);
  }
  content = content.replace(target, replacement);
  console.log(`[OK] Replaced: ${label}`);
}

checkAndReplace(target1, replace1, '1. drawRevolutionArc isVis');
checkAndReplace(target2, replace2, '2. Section 3 Cap visibility');
checkAndReplace(target3, replace3, '3. Painter cap & loft-cap stroke');
checkAndReplace(target4, replace4, '4. Loft-cap visibility');

fs.writeFileSync(file, content, 'utf8');
console.log('[SUCCESS] All 4 patches applied to ' + file);
