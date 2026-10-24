const fs = require('fs');

let bundle = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// 1. Update hue in revolution solid to crystal aqua / emerald
bundle = bundle.replace(
  'const hue = isRevOx ? 218 : 162;',
  'const hue = isRevOx ? 204 : 158;'
);

// 2. Update revolution outer face lighting to real glass shader with Fresnel & Specular
const oldFaceBlock = `        const zAvg = (s00.z + s10.z + s11.z + s01.z) / 4;
        const cosAng = Math.cos(thMid), sinAng = Math.sin(thMid);
        const light = Math.max(0.55, Math.min(1.0, 0.78 + 0.28 * cosAng - 0.16 * sinAng));
        const litLightness = Math.round(48 + 36 * light);

        const fAlpha = isSecRev ? 0.35 : 0.88;
        const sAlpha = isSecRev ? 0.22 : 0.25;
        faces.push({
          z: zAvg,
          pts: [s00, s10, s11, s01],
          fill: "hsla(" + hue + ",85%," + litLightness + "%," + fAlpha + ")",
          stroke: "hsla(" + hue + ",90%," + Math.round(litLightness * 0.7) + "%," + sAlpha + ")",
          type: "outer"
        });`;

const newFaceBlock = `        const zAvg = (s00.z + s10.z + s11.z + s01.z) / 4;
        const cosAng = Math.cos(thMid), sinAng = Math.sin(thMid);
        
        // ── Glass Shader: Normal, Fresnel, Specular & Crystal Translucency ──
        const dxVal = x1 - x0;
        const drVal = ro1 - ro0;
        const slopeR = Math.abs(dxVal) > 1e-5 ? (drVal / dxVal) : 0;
        const normLen = Math.sqrt(slopeR * slopeR + 1);
        const normWorldX = isRevOx ? (-slopeR / normLen) : (cosAng / normLen);
        const normWorldY = isRevOx ? (cosAng / normLen) : (-slopeR / normLen);
        const normWorldZ = sinAng / normLen;

        // Transform normal to camera space
        const nx1 = normWorldX * Math.cos(yaw) + normWorldZ * Math.sin(yaw);
        const nz1 = -normWorldX * Math.sin(yaw) + normWorldZ * Math.cos(yaw);
        const ny1 = normWorldY * Math.cos(pitch) - nz1 * Math.sin(pitch);
        const nz2 = normWorldY * Math.sin(pitch) + nz1 * Math.cos(pitch);

        // Fresnel term: glancing angle glow vs transparent direct view
        const rim = Math.pow(Math.max(0, Math.min(1, 1 - Math.abs(nz2))), 1.55);

        // Diffuse key light
        const light = Math.max(0.48, Math.min(1.0, 0.74 + 0.3 * cosAng - 0.18 * sinAng));

        // Specular glint from top-left key light
        const ndotH = Math.max(0, -0.18 * nx1 + 0.42 * ny1 - 0.88 * nz2);
        const spec = Math.pow(ndotH, 12);

        // Glassmorphism translucency: clear in center (0.28), luminous on rim (0.72)
        const glassAlpha = isSecRev
          ? (0.18 + 0.38 * rim)
          : (0.30 + 0.46 * rim);
        
        const sat = Math.round(86 - 32 * spec);
        const litLightness = Math.round(52 + 24 * light + 24 * spec);
        const faceHue = Math.round(hue - 10 * rim);

        const strokeAlpha = isFastMode ? 0.12 : (0.12 + 0.30 * rim + 0.28 * spec);

        faces.push({
          z: zAvg,
          pts: [s00, s10, s11, s01],
          fill: "hsla(" + faceHue + "," + sat + "%," + litLightness + "%," + glassAlpha.toFixed(3) + ")",
          stroke: "rgba(255, 255, 255, " + Math.min(0.65, strokeAlpha).toFixed(3) + ")",
          strokeWidth: 0.65,
          type: "outer"
        });`;

if (!bundle.includes(oldFaceBlock)) {
  console.error('Could not find oldFaceBlock');
  process.exit(1);
}
bundle = bundle.replace(oldFaceBlock, newFaceBlock);
console.log('1. Outer glass face shader applied');

// 3. Update Caps to polished frosted glass
const oldCapColors = `fill: thCap === 0 ? (isRevOx ? "rgba(56, 189, 248, 0.42)" : "rgba(52, 211, 153, 0.42)") : (isRevOx ? "rgba(251, 191, 36, 0.48)" : "rgba(251, 146, 60, 0.48)"),
          stroke: thCap === 0 ? (isRevOx ? "#0284c7" : "#059669") : (isRevOx ? "#d97706" : "#ea580c"),
          strokeWidth: 2,`;

const newCapColors = `fill: thCap === 0 ? (isRevOx ? "rgba(186, 230, 253, 0.35)" : "rgba(167, 243, 208, 0.35)") : (isRevOx ? "rgba(254, 243, 199, 0.42)" : "rgba(254, 215, 170, 0.42)"),
          stroke: thCap === 0 ? (isRevOx ? "rgba(14, 165, 233, 0.85)" : "rgba(5, 150, 105, 0.85)") : (isRevOx ? "rgba(245, 158, 11, 0.9)" : "rgba(234, 88, 12, 0.9)"),
          strokeWidth: 1.8,`;

if (bundle.includes(oldCapColors)) {
  bundle = bundle.replace(oldCapColors, newCapColors);
  console.log('2. Cap colors updated to frosted glass');
}

// 4. Update inner surface if washer to luminous ice glass
const oldInnerFace = `faces.push({
            z: izAvg,
            pts: [is00, is10, is11, is01],
            fill: "hsla(" + hue + ",20%,88%,0.75)",
            stroke: "hsla(" + hue + ",30%,65%,0.2)",
            type: "inner"
          });`;

const newInnerFace = `faces.push({
            z: izAvg,
            pts: [is00, is10, is11, is01],
            fill: "hsla(" + hue + ",35%,90%,0.38)",
            stroke: "rgba(255, 255, 255, 0.22)",
            strokeWidth: 0.5,
            type: "inner"
          });`;

if (bundle.includes(oldInnerFace)) {
  bundle = bundle.replace(oldInnerFace, newInnerFace);
  console.log('3. Inner washer face updated to ice glass');
}

fs.writeFileSync('dist/assets/index-D9JME9Hm.js', bundle, 'utf8');
console.log('✓ ALL DONE: Glassmorphism shader applied to 3D volume!');
