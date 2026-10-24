const fs = require('fs');

const file = 'dist/assets/index-D9JME9Hm.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Add getCameraNormalZ right after project definition
const targetProject = `    return {
      sx: cx + x1 * scale,
      sy: cy - y1 * scale,
      z: z2
    };
  };`;

const replaceProject = `    return {
      sx: cx + x1 * scale,
      sy: cy - y1 * scale,
      z: z2
    };
  };

  const getCameraNormalZ = (nx, ny, nz) => {
    const nx1 = nx * Math.cos(yaw) + nz * Math.sin(yaw);
    const nz1 = -nx * Math.sin(yaw) + nz * Math.cos(yaw);
    const ny1 = ny * Math.cos(pitch) - nz1 * Math.sin(pitch);
    const nz2 = ny * Math.sin(pitch) + nz1 * Math.cos(pitch);
    return nz2;
  };`;

// 2. Axis Ox [a, b] segment visibility
const targetOx = `    const pa = project(na, 0, 0);
    const pb = project(nb, 0, 0);
    const isInsideHidden = sweepDeg > 5 || isCross;
    // Before a (outside - solid)
    if (Math.hypot(oxStart.sx - pa.sx, oxStart.sy - pa.sy) > 1) {
      ctx.beginPath(); ctx.moveTo(oxStart.sx, oxStart.sy); ctx.lineTo(pa.sx, pa.sy);
      ctx.strokeStyle = colOx; ctx.lineWidth = 2.0; ctx.stroke();
    }
    // Đoạn trục [a, b]:
    // - Khi quay kín 360° (sweepDeg >= 355): trục nằm trong lòng khối => nét đứt
    // - Khi bổ góc cắt (< 360°): trục là gờ giao tuyến của 2 mặt cắt lộ ra ngoài => nét liền!
    ctx.save();
    ctx.beginPath(); ctx.moveTo(pa.sx, pa.sy); ctx.lineTo(pb.sx, pb.sy);
    ctx.strokeStyle = isInsideHidden ? "#475569" : colOx;
    ctx.lineWidth = isInsideHidden ? 1.8 : 2.0;
    if (isInsideHidden) {
      ctx.setLineDash([6, 4]);
    } else {
      ctx.setLineDash([]);
    }
    ctx.stroke();
    ctx.restore();`;

const replaceOx = `    const pa = project(na, 0, 0);
    const pb = project(nb, 0, 0);
    // Đoạn trục [a, b] chuẩn SGK hình học không gian Toán 12:
    // Khi vật xoay trong không gian:
    // - 2D ban đầu (sweepDeg <= 5): trục là cạnh đáy miền (H) => NÉT LIỀN
    // - Quay đủ 360°: trục nằm hoàn toàn trong lòng khối => NÉT ĐỨT
    // - Bổ góc cắt (< 355°): trục nhìn thấy khi camera hướng vào góc mở, bị che khuất khi nhìn từ sau lưng khối
    let isInsideHidden = false;
    if (sweepDeg <= 5) {
      isInsideHidden = false;
    } else if (sweepDeg >= 355 || isCross) {
      isInsideHidden = true;
    } else {
      const thOpen = (sweepRad + Math.PI * 2) / 2;
      const dOpenZ = getCameraNormalZ(0, Math.cos(thOpen), Math.sin(thOpen));
      isInsideHidden = dOpenZ <= 0.02;
    }
    // Before a (outside - solid)
    if (Math.hypot(oxStart.sx - pa.sx, oxStart.sy - pa.sy) > 1) {
      ctx.beginPath(); ctx.moveTo(oxStart.sx, oxStart.sy); ctx.lineTo(pa.sx, pa.sy);
      ctx.strokeStyle = colOx; ctx.lineWidth = 2.0; ctx.stroke();
    }
    ctx.save();
    ctx.beginPath(); ctx.moveTo(pa.sx, pa.sy); ctx.lineTo(pb.sx, pb.sy);
    ctx.strokeStyle = isInsideHidden ? "#475569" : colOx;
    ctx.lineWidth = isInsideHidden ? 1.8 : 2.0;
    if (isInsideHidden) {
      ctx.setLineDash([6, 4]);
    } else {
      ctx.setLineDash([]);
    }
    ctx.stroke();
    ctx.restore();`;

// 3. Axis Oy segment inside solid
const targetOy = `    const py0 = project(0, Math.min(0, na), 0);
    const py1 = project(0, maxVal, 0);
    const isInsideHidden = sweepDeg > 5 || isCross;
    // Below solid (outside - solid)
    if (Math.hypot(oyStart.sx - py0.sx, oyStart.sy - py0.sy) > 1) {
      ctx.beginPath(); ctx.moveTo(oyStart.sx, oyStart.sy); ctx.lineTo(py0.sx, py0.sy);
      ctx.strokeStyle = colOy; ctx.lineWidth = 2.0; ctx.stroke();
    }
    // Đoạn trục bên trong:
    ctx.save();
    ctx.beginPath(); ctx.moveTo(py0.sx, py0.sy); ctx.lineTo(py1.sx, py1.sy);
    ctx.strokeStyle = isInsideHidden ? "#475569" : colOy;
    ctx.lineWidth = isInsideHidden ? 1.8 : 2.0;
    if (isInsideHidden) {
      ctx.setLineDash([6, 4]);
    } else {
      ctx.setLineDash([]);
    }
    ctx.stroke();
    ctx.restore();`;

const replaceOy = `    const py0 = project(0, Math.min(0, na), 0);
    const py1 = project(0, maxVal, 0);
    let isInsideHiddenY = false;
    if (sweepDeg <= 5) {
      isInsideHiddenY = false;
    } else if (sweepDeg >= 355 || isCross) {
      isInsideHiddenY = true;
    } else {
      const thOpen = (sweepRad + Math.PI * 2) / 2;
      const dOpenZ = getCameraNormalZ(Math.cos(thOpen), 0, Math.sin(thOpen));
      isInsideHiddenY = dOpenZ <= 0.02;
    }
    // Below solid (outside - solid)
    if (Math.hypot(oyStart.sx - py0.sx, oyStart.sy - py0.sy) > 1) {
      ctx.beginPath(); ctx.moveTo(oyStart.sx, oyStart.sy); ctx.lineTo(py0.sx, py0.sy);
      ctx.strokeStyle = colOy; ctx.lineWidth = 2.0; ctx.stroke();
    }
    ctx.save();
    ctx.beginPath(); ctx.moveTo(py0.sx, py0.sy); ctx.lineTo(py1.sx, py1.sy);
    ctx.strokeStyle = isInsideHiddenY ? "#475569" : colOy;
    ctx.lineWidth = isInsideHiddenY ? 1.8 : 2.0;
    if (isInsideHiddenY) {
      ctx.setLineDash([6, 4]);
    } else {
      ctx.setLineDash([]);
    }
    ctx.stroke();
    ctx.restore();`;

// 4. Painter's cap rendering: DYNAMIC CAMERA-AWARE VISIBILITY FOR BOTH CAPS
const targetCapRender = `      if (face.type === "cap" && face.nArch) {
        const kp = face.kPeak != null ? face.kPeak : Math.floor(face.nArch / 2);
        if (!face.isRotatingCap && sweepDeg > 5) {
          // Chuẩn SGK Toán 12:
          // 1. Nửa cung phía xa (từ a lên đỉnh): NÉT ĐỨT
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(pts[0].sx, pts[0].sy);
          for (let k = 1; k <= kp; k++) ctx.lineTo(pts[k].sx, pts[k].sy);
          ctx.strokeStyle = "rgba(30, 64, 175, 0.75)";
          ctx.lineWidth = 1.6;
          ctx.setLineDash([5, 4]);
          ctx.stroke();
          ctx.restore();

          // 2. Nửa cung phía trước (từ đỉnh xuống b): NÉT LIỀN
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(pts[kp].sx, pts[kp].sy);
          for (let k = kp + 1; k <= face.nArch; k++) ctx.lineTo(pts[k].sx, pts[k].sy);
          ctx.strokeStyle = "rgba(29, 78, 216, 0.95)";
          ctx.lineWidth = 2.0;
          ctx.setLineDash([]);
          ctx.stroke();
          ctx.restore();
        } else {
          // Rotating cap hoặc chưa xoay: vẽ nét liền theo contour
          ctx.save();
          if (face.dashed) {
            ctx.setLineDash([5, 4]);
          } else {
            ctx.setLineDash([]);
          }
          ctx.strokeStyle = face.stroke;
          ctx.lineWidth = face.strokeWidth || 1.8;
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
          ctx.restore();
        }
        if (face.hasInner && pts.length > face.nArch * 2) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(pts[face.nArch + 1].sx, pts[face.nArch + 1].sy);
          for (let k = face.nArch + 2; k < pts.length; k++) ctx.lineTo(pts[k].sx, pts[k].sy);
          ctx.strokeStyle = face.stroke;
          ctx.lineWidth = 1.4;
          ctx.setLineDash([4, 3]);
          ctx.stroke();
          ctx.restore();
        }
      }`;

const replaceCapRender = `      if (face.type === "cap" && face.nArch) {
        // Chuẩn hình học không gian SGK Toán 12: Đổi động nét đứt và nét liền khi vật xoay 3D
        // Tính pháp tuyến của mặt phẳng cắt theo góc xoay camera (yaw, pitch):
        // 1. Mặt gốc tại theta=0: pháp tuyến hướng ra ngoài là (0, 0, -1)
        // 2. Mặt đang xoay tại theta: pháp tuyến hướng ra ngoài là (0, -sin(th), cos(th)) [Ox]
        let isFaceVisible = true;
        if (sweepDeg <= 5) {
          isFaceVisible = true;
        } else if (sweepDeg >= 355) {
          isFaceVisible = false; // Khi xoay kín 360°, thiết diện kinh tuyến nằm trong ruột khối => nét đứt
        } else {
          if (face.isRotatingCap) {
            const normZ = isRevY
              ? getCameraNormalZ(-Math.sin(sweepRad), 0, Math.cos(sweepRad))
              : getCameraNormalZ(0, -Math.sin(sweepRad), Math.cos(sweepRad));
            isFaceVisible = normZ > 0.02;
          } else {
            const normZ = getCameraNormalZ(0, 0, -1);
            isFaceVisible = normZ > 0.02;
          }
        }

        // Vẽ đường viền mặt cắt: Hướng về phía người nhìn = NÉT LIỀN, Khuất phía sau = NÉT ĐỨT
        ctx.save();
        if (!isFaceVisible) {
          ctx.setLineDash([5, 4]);
          ctx.strokeStyle = "rgba(30, 64, 175, 0.75)";
          ctx.lineWidth = 1.6;
        } else {
          ctx.setLineDash([]);
          ctx.strokeStyle = face.stroke || "rgba(29, 78, 216, 0.95)";
          ctx.lineWidth = face.strokeWidth || 2.0;
        }
        ctx.beginPath();
        if (face.isRotatingCap && face.pA0) {
          ctx.moveTo(face.pA0.sx, face.pA0.sy);
          ctx.lineTo(pts[0].sx, pts[0].sy);
        } else {
          ctx.moveTo(pts[0].sx, pts[0].sy);
        }
        for (let k = 1; k <= face.nArch; k++) ctx.lineTo(pts[k].sx, pts[k].sy);
        if (face.isRotatingCap && face.pB0) {
          ctx.lineTo(face.pB0.sx, face.pB0.sy);
        }
        ctx.stroke();
        ctx.restore();

        // Đường biên trong (nếu có hàm f2 / khối rỗng)
        if (face.hasInner && pts.length > face.nArch * 2) {
          ctx.save();
          if (!isFaceVisible) {
            ctx.setLineDash([4, 3]);
            ctx.strokeStyle = "rgba(30, 64, 175, 0.65)";
            ctx.lineWidth = 1.3;
          } else {
            ctx.setLineDash([]);
            ctx.strokeStyle = face.stroke || "rgba(29, 78, 216, 0.90)";
            ctx.lineWidth = 1.6;
          }
          ctx.beginPath();
          ctx.moveTo(pts[face.nArch + 1].sx, pts[face.nArch + 1].sy);
          for (let k = face.nArch + 2; k < pts.length; k++) ctx.lineTo(pts[k].sx, pts[k].sy);
          ctx.stroke();
          ctx.restore();
        }
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

checkAndReplace(targetProject, replaceProject, '1. Camera normal projection helper');
checkAndReplace(targetOx, replaceOx, '2. Dynamic Axis Ox visibility under 3D rotation');
checkAndReplace(targetOy, replaceOy, '3. Dynamic Axis Oy visibility under 3D rotation');
checkAndReplace(targetCapRender, replaceCapRender, '4. Dynamic Cap visibility (solid when facing camera, dashed when occluded)');

fs.writeFileSync(file, content, 'utf8');
console.log('[SUCCESS] All dynamic 3D rotation dashed/solid line patches applied successfully!');
