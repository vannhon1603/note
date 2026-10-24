const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('dist/assets/index-D9JME9Hm.js');
let code = fs.readFileSync(targetFile, 'utf8');

// Backup
fs.writeFileSync(targetFile + '.bak_match_translating_colors', code, 'utf8');

console.log('--- Matching Translating Solids Colors to Solids of Revolution ---');

// ─── 1. Update Base floor color in Cross-Section Solid ───
const oldBaseFloor = `    faces.push({
      z: baseZ / basePts.length - 100,
      pts: basePts,
      fill: "rgba(59, 130, 246, 0.18)",
      stroke: "#2563eb",
      strokeWidth: 1.2,
      type: "floor"
    });`;

const newBaseFloor = `    faces.push({
      z: baseZ / basePts.length - 100,
      pts: basePts,
      fill: "rgba(37, 99, 235, 0.12)",
      stroke: "rgba(37, 99, 235, 0.75)",
      strokeWidth: 1.6,
      type: "floor"
    });`;

if (!code.includes(oldBaseFloor)) throw new Error('oldBaseFloor not found');
code = code.replace(oldBaseFloor, newBaseFloor);
console.log('✓ 1. Updated base floor colors');

// ─── 2. Update Continuous Lofted 3D Solid mesh faces & end caps ───
const oldLoftBlock = `      // ── Continuous Lofted 3D Solid ──
      for (let si = 0; si < N; si++) {
        const u0 = si / N, u1 = (si + 1) / N;
        const x0 = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u0 * Math.PI);
        const x1 = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u1 * Math.PI);

        const w0 = Math.abs(f1(x0) - f2(x0));
        const w1 = Math.abs(f1(x1) - f2(x1));
        const ym0 = (f1(x0) + f2(x0)) / 2;
        const ym1 = (f1(x1) + f2(x1)) / 2;

        const shape0 = getCrossSectionShape(currentAxis, w0);
        const shape1 = getCrossSectionShape(currentAxis, w1);

        for (let k = 0; k < shape0.length; k++) {
          const kn = (k + 1) % shape0.length;

          const p00 = project(x0, ym0 + shape0[k].u, shape0[k].v);
          const p10 = project(x1, ym1 + shape1[k].u, shape1[k].v);
          const p11 = project(x1, ym1 + shape1[kn].u, shape1[kn].v);
          const p01 = project(x0, ym0 + shape0[kn].u, shape0[kn].v);

          const zAvg = (p00.z + p10.z + p11.z + p01.z) / 4;
          const light = 0.70 + 0.18 * Math.sin(k * 1.5 + 0.8);

          faces.push({
            z: zAvg,
            pts: [p00, p10, p11, p01],
            fill: "hsla(" + hue + ",75%," + Math.round(72 * light) + "%,0.32)",
            stroke: "hsla(" + hue + ",80%," + Math.round(45 * light) + "%,0.45)",
            strokeWidth: 0.6,
            type: "loft"
          });
        }
      }

      // End caps at a and b
      for (const capX of [na, nb]) {
        const cw = Math.abs(f1(capX) - f2(capX));
        if (cw > 0.001) {
          const cym = (f1(capX) + f2(capX)) / 2;
          const cshape = getCrossSectionShape(currentAxis, cw);
          const cpts = cshape.map(pt => project(capX, cym + pt.u, pt.v));
          const cz = cpts.reduce((acc, p) => acc + p.z, 0) / cpts.length;
          faces.push({
            z: cz,
            pts: cpts,
            fill: "hsla(" + hue + ",75%,75%,0.38)",
            stroke: "hsla(" + hue + ",85%,40%,0.70)",
            strokeWidth: 1.2,
            type: "loft-cap"
          });
        }
      }`;

const newLoftBlock = `      // ── Continuous Lofted 3D Solid (PBR Glass Shader matching solids of revolution) ──
      for (let si = 0; si < N; si++) {
        const u0 = si / N, u1 = (si + 1) / N;
        const x0 = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u0 * Math.PI);
        const x1 = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u1 * Math.PI);

        const w0 = Math.abs(f1(x0) - f2(x0));
        const w1 = Math.abs(f1(x1) - f2(x1));
        const ym0 = (f1(x0) + f2(x0)) / 2;
        const ym1 = (f1(x1) + f2(x1)) / 2;

        const shape0 = getCrossSectionShape(currentAxis, w0);
        const shape1 = getCrossSectionShape(currentAxis, w1);

        for (let k = 0; k < shape0.length; k++) {
          const kn = (k + 1) % shape0.length;

          const p00 = project(x0, ym0 + shape0[k].u, shape0[k].v);
          const p10 = project(x1, ym1 + shape1[k].u, shape1[k].v);
          const p11 = project(x1, ym1 + shape1[kn].u, shape1[kn].v);
          const p01 = project(x0, ym0 + shape0[kn].u, shape0[kn].v);

          const zAvg = (p00.z + p10.z + p11.z + p01.z) / 4;

          // Compute quad normal in 3D world coordinates
          const v1x = x1 - x0, v1y = (ym1 + shape1[k].u) - (ym0 + shape0[k].u), v1z = shape1[k].v - shape0[k].v;
          const v2x = 0, v2y = shape0[kn].u - shape0[k].u, v2z = shape0[kn].v - shape0[k].v;
          let qnx = v1y * v2z - v1z * v2y;
          let qny = -v1x * v2z;
          let qnz = v1x * v2y;
          const qlen = Math.hypot(qnx, qny, qnz) || 1;
          qnx /= qlen; qny /= qlen; qnz /= qlen;

          const midU = (shape0[k].u + shape0[kn].u) / 2;
          const midV = (shape0[k].v + shape0[kn].v) / 2;
          if (qny * midU + qnz * midV < 0) {
            qnx = -qnx; qny = -qny; qnz = -qnz;
          }

          // Camera rotated normal (identical to revolution solid)
          const nx1 = qnx * Math.cos(yaw) + qnz * Math.sin(yaw);
          const nz1 = -qnx * Math.sin(yaw) + qnz * Math.cos(yaw);
          const ny1 = qny * Math.cos(pitch) - nz1 * Math.sin(pitch);
          const nz2 = qny * Math.sin(pitch) + nz1 * Math.cos(pitch);

          const rim = Math.pow(Math.max(0, Math.min(1, 1 - Math.abs(nz2))), 1.5);
          const light = Math.max(0.18, Math.min(1.0, 0.52 + 0.38 * nx1 - 0.20 * ny1));
          const ndotH = Math.max(0, -0.22 * nx1 + 0.46 * ny1 - 0.86 * nz2);
          const spec = Math.pow(ndotH, 24);

          const sat = Math.round(82 + 10 * light - 14 * spec);
          const litLightness = Math.round(38 + 26 * light + 10 * spec);
          const faceHue = Math.round(hue - 5 * rim);
          const glassAlpha = 0.26 + 0.26 * rim;

          faces.push({
            z: zAvg,
            pts: [p00, p10, p11, p01],
            fill: "hsla(" + faceHue + "," + sat + "%," + litLightness + "%," + glassAlpha.toFixed(3) + ")",
            stroke: null, // Smooth crystal glass without ugly cage stripes, identical to solids of revolution
            strokeWidth: 0,
            type: "loft"
          });
        }
      }

      // End caps at a and b (matching revolution caps)
      for (const capX of [na, nb]) {
        const cw = Math.abs(f1(capX) - f2(capX));
        if (cw > 0.001) {
          const cym = (f1(capX) + f2(capX)) / 2;
          const cshape = getCrossSectionShape(currentAxis, cw);
          const cpts = cshape.map(pt => project(capX, cym + pt.u, pt.v));
          const cz = cpts.reduce((acc, p) => acc + p.z, 0) / cpts.length;
          faces.push({
            z: cz,
            pts: cpts,
            fill: "rgba(191, 219, 254, 0.40)",
            stroke: "rgba(29, 78, 216, 0.92)",
            strokeWidth: 1.8,
            type: "loft-cap"
          });
        }
      }`;

if (!code.includes(oldLoftBlock)) throw new Error('oldLoftBlock not found');
code = code.replace(oldLoftBlock, newLoftBlock);
console.log('✓ 2. Updated lofted 3D mesh faces & caps with sapphire glass shader');

// ─── 3. Add Longitudinal Ridge Outlines for Translating Solids ───
const oldSec4bStart = `  // ─── 4b. Draw Revolution Circles & Arcs (Front = Solid, Hidden = Dashed) ───`;

const newSec4bStart = `  // ─── 4c. Longitudinal Ridge Outlines for Translating Solids ───
  if (!isRev && isCross) {
    const wMid = Math.abs(f1((na + nb) / 2) - f2((na + nb) / 2));
    const testShape = getCrossSectionShape(currentAxis, wMid);
    if (testShape.length <= 8) {
      ctx.save();
      for (let k = 0; k < testShape.length; k++) {
        if (testShape[k].v > 0.02) {
          ctx.beginPath();
          const nRidge = isFastMode ? 32 : 80;
          for (let si = 0; si <= nRidge; si++) {
            const u = si / nRidge;
            const xv = (na + nb) / 2 - ((nb - na) / 2) * Math.cos(u * Math.PI);
            const wv = Math.abs(f1(xv) - f2(xv));
            const ymv = (f1(xv) + f2(xv)) / 2;
            const sh = getCrossSectionShape(currentAxis, wv);
            if (sh[k]) {
              const p = project(xv, ymv + sh[k].u, sh[k].v);
              if (si === 0) ctx.moveTo(p.sx, p.sy);
              else ctx.lineTo(p.sx, p.sy);
            }
          }
          ctx.strokeStyle = "rgba(29, 78, 216, 0.90)";
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  // ─── 4b. Draw Revolution Circles & Arcs (Front = Solid, Hidden = Dashed) ───`;

if (!code.includes(oldSec4bStart)) throw new Error('oldSec4bStart not found');
code = code.replace(oldSec4bStart, newSec4bStart);
console.log('✓ 3. Added longitudinal ridge outlines for translating solids');

fs.writeFileSync(targetFile, code, 'utf8');
console.log('=== All color updates applied successfully ===');
