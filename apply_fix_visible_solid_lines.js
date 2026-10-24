const fs = require('fs');

const file = 'dist/assets/index-D9JME9Hm.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix drawRevolutionArc
const oldArcBlock = `      // 1. Swept arc [0, curSweepRad]
      let curVis = null;
      let curPts = [];
      for (let i = 0; i <= nSteps; i++) {
        const phi = (i / nSteps) * curSweepRad;
        const cosA = Math.cos(phi), sinA = Math.sin(phi);
        const pt = isRevY ? project(rOuter * cosA, coord, rOuter * sinA) : project(coord, rOuter * cosA, rOuter * sinA);

        const normX = isRevY ? cosA : 0;
        const normY = isRevY ? 0 : cosA;
        const normZ = sinA;
        const nx1 = normX * Math.cos(yaw) + normZ * Math.sin(yaw);
        const nz1 = -normX * Math.sin(yaw) + normZ * Math.cos(yaw);
        const ny1 = normY * Math.cos(pitch) - nz1 * Math.sin(pitch);
        const nz2 = normY * Math.sin(pitch) + nz1 * Math.cos(pitch);
        const isVis = nz2 >= 0;

        if (curVis === null) {
          curVis = isVis;
          curPts.push(pt);
        } else if (isVis === curVis) {
          curPts.push(pt);
        } else {
          curPts.push(pt);
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(curPts[0].sx, curPts[0].sy);
          for (let k = 1; k < curPts.length; k++) ctx.lineTo(curPts[k].sx, curPts[k].sy);
          ctx.strokeStyle = strokeCol;
          ctx.lineWidth = 1.6;
          if (!curVis) ctx.setLineDash([5, 4]); // NÉT ĐỨT CHO PHẦN KHUẤT!
          ctx.stroke();
          ctx.restore();
          curVis = isVis;
          curPts = [pt];
        }
      }
      if (curPts.length > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(curPts[0].sx, curPts[0].sy);
        for (let k = 1; k < curPts.length; k++) ctx.lineTo(curPts[k].sx, curPts[k].sy);
        ctx.strokeStyle = strokeCol;
        ctx.lineWidth = 1.6;
        if (!curVis) ctx.setLineDash([5, 4]); // NÉT ĐỨT CHO PHẦN KHUẤT!
        ctx.stroke();
        ctx.restore();
      }`;

const newArcBlock = `      // Determine if this base plane points towards the camera
      const isBaseNa = coord <= (na + nb) / 2;
      const capNormX = isRevOx ? (isBaseNa ? -1 : 1) : 0;
      const capNormY = isRevOy ? (isBaseNa ? -1 : 1) : 0;
      const capNormZ = 0;
      const cnx1 = capNormX * Math.cos(yaw) + capNormZ * Math.sin(yaw);
      const cnz1 = -capNormX * Math.sin(yaw) + capNormZ * Math.cos(yaw);
      const cny1 = capNormY * Math.cos(pitch) - cnz1 * Math.sin(pitch);
      const cnz2 = capNormY * Math.sin(pitch) + cnz1 * Math.cos(pitch);
      const baseFacesCamera = cnz2 > 0;

      // 1. Swept arc [0, curSweepRad]
      let curVis = null;
      let curPts = [];
      for (let i = 0; i <= nSteps; i++) {
        const phi = (i / nSteps) * curSweepRad;
        const cosA = Math.cos(phi), sinA = Math.sin(phi);
        const pt = isRevY ? project(rOuter * cosA, coord, rOuter * sinA) : project(coord, rOuter * cosA, rOuter * sinA);

        const normX = isRevY ? cosA : 0;
        const normY = isRevY ? 0 : cosA;
        const normZ = sinA;
        const nx1 = normX * Math.cos(yaw) + normZ * Math.sin(yaw);
        const nz1 = -normX * Math.sin(yaw) + normZ * Math.cos(yaw);
        const ny1 = normY * Math.cos(pitch) - nz1 * Math.sin(pitch);
        const nz2 = normY * Math.sin(pitch) + nz1 * Math.cos(pitch);

        // Chuẩn hình học không gian SGK Toán 12:
        // - Đáy hướng về phía người quan sát (baseFacesCamera) hoặc khi đang quét góc bổ (!isFullRev): luôn vẽ NÉT LIỀN (isVis = true)!
        // - Chỉ khi quay đủ 360° và là đáy phía xa bị che khuất thì phần cong ăn sâu vào thân khối (nz2 > 0) mới là nét đứt.
        const isVis = baseFacesCamera || !isFullRev || (nz2 <= 0);

        if (curVis === null) {
          curVis = isVis;
          curPts.push(pt);
        } else if (isVis === curVis) {
          curPts.push(pt);
        } else {
          curPts.push(pt);
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(curPts[0].sx, curPts[0].sy);
          for (let k = 1; k < curPts.length; k++) ctx.lineTo(curPts[k].sx, curPts[k].sy);
          ctx.strokeStyle = strokeCol;
          ctx.lineWidth = 1.6;
          if (!curVis) ctx.setLineDash([5, 4]); // NÉT ĐỨT CHO PHẦN KHUẤT!
          ctx.stroke();
          ctx.restore();
          curVis = isVis;
          curPts = [pt];
        }
      }
      if (curPts.length > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(curPts[0].sx, curPts[0].sy);
        for (let k = 1; k < curPts.length; k++) ctx.lineTo(curPts[k].sx, curPts[k].sy);
        ctx.strokeStyle = strokeCol;
        ctx.lineWidth = 1.6;
        if (!curVis) ctx.setLineDash([5, 4]); // NÉT ĐỨT CHO PHẦN KHUẤT!
        ctx.stroke();
        ctx.restore();
      }`;

if (!content.includes(oldArcBlock)) {
  console.error('[ERROR] oldArcBlock not found!');
  process.exit(1);
}
content = content.replace(oldArcBlock, newArcBlock);
console.log('[OK] 1. drawRevolutionArc patched successfully!');

// 2. Fix Slice outer contour in Section 6
const oldSliceBlock = `          // Crisp golden amber contour border (Front = Solid, Hidden = Dashed for full circle)
          if (isFullRev) {
            let curVis = null;
            let curPts = [];
            for (let ci = 0; ci <= nCirclePts; ci++) {
              const ang = (ci / nCirclePts) * (Math.PI * 2);
              const cosA = Math.cos(ang), sinA = Math.sin(ang);
              const pt = outerArc[ci];

              const normX = isRevY ? cosA : 0;
              const normY = isRevY ? 0 : cosA;
              const normZ = sinA;
              const nx1 = normX * Math.cos(yaw) + normZ * Math.sin(yaw);
              const nz1 = -normX * Math.sin(yaw) + normZ * Math.cos(yaw);
              const ny1 = normY * Math.cos(pitch) - nz1 * Math.sin(pitch);
              const nz2 = normY * Math.sin(pitch) + nz1 * Math.cos(pitch);
              const isVis = nz2 >= 0;

              if (curVis === null) {
                curVis = isVis;
                curPts.push(pt);
              } else if (isVis === curVis) {
                curPts.push(pt);
              } else {
                curPts.push(pt);
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(curPts[0].sx, curPts[0].sy);
                for (let k = 1; k < curPts.length; k++) ctx.lineTo(curPts[k].sx, curPts[k].sy);
                ctx.strokeStyle = "#d97706";
                ctx.lineWidth = curVis ? 2.4 : 1.8;
                if (!curVis) ctx.setLineDash([5, 4]); // NÉT ĐỨT CHO PHẦN KHUẤT PHÍA SAU!
                ctx.stroke();
                ctx.restore();
                curVis = isVis;
                curPts = [pt];
              }
            }
            if (curPts.length > 1) {
              ctx.save();
              ctx.beginPath();
              ctx.moveTo(curPts[0].sx, curPts[0].sy);
              for (let k = 1; k < curPts.length; k++) ctx.lineTo(curPts[k].sx, curPts[k].sy);
              ctx.strokeStyle = "#d97706";
              ctx.lineWidth = curVis ? 2.4 : 1.8;
              if (!curVis) ctx.setLineDash([5, 4]); // NÉT ĐỨT CHO PHẦN KHUẤT PHÍA SAU!
              ctx.stroke();
              ctx.restore();
            }
          } else {
            ctx.beginPath();
            ctx.moveTo(slicePoly[0].sx, slicePoly[0].sy);
            for (let k = 1; k < slicePoly.length; k++) ctx.lineTo(slicePoly[k].sx, slicePoly[k].sy);
            ctx.closePath();
            ctx.strokeStyle = "#d97706";
            ctx.lineWidth = 2.4;
            ctx.stroke();
          }

          // Inner border if full washer
          if (isFullRev && innerCircle) {
            ctx.beginPath();
            ctx.moveTo(innerCircle[0].sx, innerCircle[0].sy);
            for (let k = 1; k < innerCircle.length; k++) ctx.lineTo(innerCircle[k].sx, innerCircle[k].sy);
            ctx.closePath();
            ctx.strokeStyle = "#b45309";
            ctx.lineWidth = 1.8;
            ctx.setLineDash([3, 2]);
            ctx.stroke();
            ctx.setLineDash([]);
          }`;

const newSliceBlock = `          // Crisp golden amber contour border (chuẩn nét liền sư phạm cho lát cắt nhìn thấy)
          if (isFullRev) {
            ctx.beginPath();
            ctx.moveTo(outerArc[0].sx, outerArc[0].sy);
            for (let ci = 1; ci <= nCirclePts; ci++) ctx.lineTo(outerArc[ci].sx, outerArc[ci].sy);
            ctx.closePath();
            ctx.strokeStyle = "#d97706";
            ctx.lineWidth = 2.4;
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.moveTo(slicePoly[0].sx, slicePoly[0].sy);
            for (let k = 1; k < slicePoly.length; k++) ctx.lineTo(slicePoly[k].sx, slicePoly[k].sy);
            ctx.closePath();
            ctx.strokeStyle = "#d97706";
            ctx.lineWidth = 2.4;
            ctx.stroke();
          }

          // Inner border if full washer
          if (isFullRev && innerCircle) {
            ctx.beginPath();
            ctx.moveTo(innerCircle[0].sx, innerCircle[0].sy);
            for (let k = 1; k < innerCircle.length; k++) ctx.lineTo(innerCircle[k].sx, innerCircle[k].sy);
            ctx.closePath();
            ctx.strokeStyle = "#b45309";
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }`;

if (!content.includes(oldSliceBlock)) {
  console.error('[ERROR] oldSliceBlock not found!');
  process.exit(1);
}
content = content.replace(oldSliceBlock, newSliceBlock);
console.log('[OK] 2. Slice contour in Section 6 patched successfully!');

// 3. Fix Riemann slice rim in Section 7
const oldRiemannBlock = `      // Rim outline (Front = Solid, Hidden = Dashed for full revolution)
      if (curSweep >= Math.PI * 2 * 0.98) {
        let curVis = null;
        let curPts = [];
        for (let ai = 0; ai <= _nSliceAng; ai++) {
          const th = (ai / _nSliceAng) * curSweep;
          const cosA = Math.cos(th), sinA = Math.sin(th);
          const pt = pts2[ai];
          const normX = 0, normY = cosA, normZ = sinA;
          const nx1 = normX * Math.cos(yaw) + normZ * Math.sin(yaw);
          const nz1 = -normX * Math.sin(yaw) + normZ * Math.cos(yaw);
          const ny1 = normY * Math.cos(pitch) - nz1 * Math.sin(pitch);
          const nz2 = normY * Math.sin(pitch) + nz1 * Math.cos(pitch);
          const isVis = nz2 >= 0;

          if (curVis === null) {
            curVis = isVis;
            curPts.push(pt);
          } else if (isVis === curVis) {
            curPts.push(pt);
          } else {
            curPts.push(pt);
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(curPts[0].sx, curPts[0].sy);
            for (let k = 1; k < curPts.length; k++) ctx.lineTo(curPts[k].sx, curPts[k].sy);
            ctx.strokeStyle = "#d97706";
            ctx.lineWidth = curVis ? 2.0 : 1.6;
            if (!curVis) ctx.setLineDash([5, 4]);
            ctx.stroke();
            ctx.restore();
            curVis = isVis;
            curPts = [pt];
          }
        }
        if (curPts.length > 1) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(curPts[0].sx, curPts[0].sy);
          for (let k = 1; k < curPts.length; k++) ctx.lineTo(curPts[k].sx, curPts[k].sy);
          ctx.strokeStyle = "#d97706";
          ctx.lineWidth = curVis ? 2.0 : 1.6;
          if (!curVis) ctx.setLineDash([5, 4]);
          ctx.stroke();
          ctx.restore();
        }
      } else {
        ctx.beginPath();
        ctx.moveTo(pts2[0].sx, pts2[0].sy);
        for (let ai = 1; ai <= _nSliceAng; ai++) ctx.lineTo(pts2[ai].sx, pts2[ai].sy);
        ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 2.0;
        ctx.stroke();
      }`;

const newRiemannBlock = `      // Rim outline (chuẩn nét liền sư phạm cho hình trụ vi phân nhìn thấy)
      ctx.beginPath();
      ctx.moveTo(pts2[0].sx, pts2[0].sy);
      for (let ai = 1; ai <= _nSliceAng; ai++) ctx.lineTo(pts2[ai].sx, pts2[ai].sy);
      if (curSweep >= Math.PI * 2 * 0.98) ctx.closePath();
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 2.0;
      ctx.stroke();`;

if (!content.includes(oldRiemannBlock)) {
  console.error('[ERROR] oldRiemannBlock not found!');
  process.exit(1);
}
content = content.replace(oldRiemannBlock, newRiemannBlock);
console.log('[OK] 3. Riemann slice rim in Section 7 patched successfully!');

fs.writeFileSync(file, content, 'utf8');
console.log('[SUCCESS] All visible dashed line bugs fixed in dist/assets/index-D9JME9Hm.js!');
