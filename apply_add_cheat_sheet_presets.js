const fs = require('fs');

let code = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// 1. In computeVolume: add sec-wedge2
const oldComp = 'else if(axis==="sec-tri-iso"){integrand=x=>{const s=Math.abs(f1(x)-g2(x));return 0.25*s*s;};}';
const newComp = 'else if(axis==="sec-tri-iso"){integrand=x=>{const s=Math.abs(f1(x)-g2(x));return 0.25*s*s;};}\n  else if(axis==="sec-wedge2"){integrand=x=>{const s=Math.abs(f1(x)-g2(x));return(3*Math.PI/8 - 0.5)*s*s;};}';
if (!code.includes(oldComp)) throw new Error('oldComp not found');
code = code.replace(oldComp, newComp);

// 2. In computeCrossPolygon: add sec-wedge2
const oldPoly = `  } else {
    // sec-tri-right: Tam giác vuông cân cạnh góc vuông trên đáy: diện tích 0.5*baseW^2
    return [
      { u: -hw, v: 0 },
      { u: hw, v: 0 },
      { u: -hw, v: baseW }
    ];
  }
}`;
const newPoly = `  } else if (secType === "sec-wedge2") {
    // sec-wedge2: Hình nêm loại 2 (mặt cắt hình thang vuông phần bù bán trụ)
    return [
      { u: -hw, v: 0 },
      { u: hw, v: 0 },
      { u: hw, v: baseW },
      { u: -hw, v: baseW * 0.45 }
    ];
  } else {
    // sec-tri-right: Tam giác vuông cân cạnh góc vuông trên đáy: diện tích 0.5*baseW^2
    return [
      { u: -hw, v: 0 },
      { u: hw, v: 0 },
      { u: -hw, v: baseW }
    ];
  }
}`;
if (!code.includes(oldPoly)) throw new Error('oldPoly not found');
code = code.replace(oldPoly, newPoly);

// 3. In computeCrossArea: add sec-wedge2
const oldArea = 'if (secType === "sec-tri-right") return 0.5 * baseW * baseW;';
const newArea = 'if (secType === "sec-tri-right") return 0.5 * baseW * baseW;\n  if (secType === "sec-wedge2") return (3 * Math.PI / 8 - 0.5) * baseW * baseW;';
if (!code.includes(oldArea)) throw new Error('oldArea not found');
code = code.replace(oldArea, newArea);

// 4. In badgeText: add sec-wedge2
const oldBadge = 'else if (currentAxis === "sec-tri-right") formPrefix = "S(" + xValStr + ") = ½d² ≈ ";';
const newBadge = 'else if (currentAxis === "sec-tri-right") formPrefix = "S(" + xValStr + ") = ½d² ≈ ";\n          else if (currentAxis === "sec-wedge2") formPrefix = "S(" + xValStr + ") = (3π/8 - ½)d² ≈ ";';
if (!code.includes(oldBadge)) throw new Error('oldBadge not found');
code = code.replace(oldBadge, newBadge);

// 5. In VOLUME_AXES: add sec-wedge2
const oldAxes = 'const VOLUME_AXES=["ox","oy","sec-ox","sec-square","sec-tri","sec-semi","sec-circle","sec-tri-right","sec-tri-iso"];';
const newAxes = 'const VOLUME_AXES=["ox","oy","sec-ox","sec-square","sec-tri","sec-semi","sec-circle","sec-tri-right","sec-tri-iso","sec-wedge2"];';
if (!code.includes(oldAxes)) throw new Error('oldAxes not found');
code = code.replace(oldAxes, newAxes);

// 6. In axisLabels: add sec-wedge2
const oldLbl = '"sec-tri-iso":"Mặt cắt: tam giác vuông cân (cạnh huyền đáy)"';
const newLbl = '"sec-tri-iso":"Mặt cắt: tam giác vuông cân (cạnh huyền đáy)","sec-wedge2":"Mặt cắt: hình nêm loại 2 (phần bù bán trụ)"';
if (!code.includes(oldLbl)) throw new Error('oldLbl not found');
code = code.replace(oldLbl, newLbl);

// 7. In axis select options: add sec-wedge2
const oldOpt = 'f.jsx("option",{value:"sec-tri-iso",children:"📐 "+axisLabels["sec-tri-iso"]})';
const newOpt = 'f.jsx("option",{value:"sec-tri-iso",children:"📐 "+axisLabels["sec-tri-iso"]}),\n              f.jsx("option",{value:"sec-wedge2",children:"📐 "+axisLabels["sec-wedge2"]})';
if (!code.includes(oldOpt)) throw new Error('oldOpt not found');
code = code.replace(oldOpt, newOpt);

// 8. Replace VOLUME_PRESETS with all 7 cheat sheet shapes + existing presets
const startPresetsStr = 'const VOLUME_PRESETS=[';
const endPresetsStr = 'function VolumeDialog({item,onSave,onClose}){';
const startIdx = code.indexOf(startPresetsStr);
const endIdx = code.indexOf(endPresetsStr);
if (startIdx === -1 || endIdx === -1) throw new Error('Presets range not found');

const newPresets = `const VOLUME_PRESETS=[
  {
    category:"7 Khối đặc biệt SGK 12 - Tròn xoay (Có thể xoay 360°)",
    rotatable:true,
    items:[
      {name:"Chỏm cầu (V = πh²(R - h/3))",expr:"sqrt(4 - x^2)",expr2:"0",axis:"ox",a:"1",b:"2"},
      {name:"Hình trụ cụt / Phiến trụ (V = πR²(h1+h2)/2)",expr:"2",expr2:"0",axis:"ox",a:"0",b:"2"},
      {name:"Parabol tròn xoay Ox (V = 1/2 πR²h)",expr:"sqrt(x)",expr2:"0",axis:"ox",a:"0",b:"4"},
      {name:"Parabol tròn xoay Oy (V = 1/2 πR²h)",expr:"4 - x^2",expr2:"0",axis:"oy",a:"0",b:"2"},
      {name:"Khối Elip tròn xoay (V = 4/3 π a b²)",expr:"2*sqrt(1 - x^2/9)",expr2:"0",axis:"ox",a:"-3",b:"3"},
      {name:"Hình xuyến / Phao bơi (V = 2π² R₀ r₀²)",expr:"3 + sqrt(1 - x^2)",expr2:"3 - sqrt(1 - x^2)",axis:"ox",a:"-1",b:"1"}
    ]
  },
  {
    category:"7 Khối đặc biệt SGK 12 - Hình nêm / Thiết diện (Lát cắt tịnh tiến)",
    rotatable:false,
    items:[
      {name:"Hình nêm loại 1 (V = 2/3 R³ tan α)",expr:"sqrt(4 - x^2)",expr2:"0",axis:"sec-tri-right",a:"-2",b:"2"},
      {name:"Hình nêm loại 2 (V = (π/2 - 2/3) R³ tan α)",expr:"sqrt(4 - x^2)",expr2:"0",axis:"sec-wedge2",a:"-2",b:"2"}
    ]
  },
  {
    category:"Khối tròn xoay cơ bản (Có thể xoay 360°)",
    rotatable:true,
    items:[
      {name:"Khối cầu (R = 2)",expr:"sqrt(4 - x^2)",expr2:"0",axis:"ox",a:"-2",b:"2"},
      {name:"Khối nón (h = 2, R = 2)",expr:"2 - x",expr2:"0",axis:"ox",a:"0",b:"2"},
      {name:"Khối nón cụt",expr:"1 + 0.5*x",expr2:"0",axis:"ox",a:"0",b:"2"},
      {name:"Khối trụ (R = 2, h = 3)",expr:"2",expr2:"0",axis:"ox",a:"0",b:"3"},
      {name:"Khối hình chuông (y = sin x)",expr:"sin(x)",expr2:"0",axis:"ox",a:"0",b:"3.1416"}
    ]
  },
  {
    category:"Khối lát cắt tịnh tiến cơ bản (Không thể xoay)",
    rotatable:false,
    items:[
      {name:"Kim tự tháp (Thiết diện hình vuông)",expr:"2 - x",expr2:"0",axis:"sec-square",a:"0",b:"2"},
      {name:"Vật thể thiết diện tam giác đều",expr:"sqrt(x)",expr2:"0",axis:"sec-tri",a:"0",b:"4"},
      {name:"Vật thể vòm (Thiết diện nửa hình tròn)",expr:"4 - x^2",expr2:"0",axis:"sec-semi",a:"-2",b:"2"},
      {name:"Vật thể đáy tròn, thiết diện vuông",expr:"sqrt(4 - x^2)",expr2:"0",axis:"sec-square",a:"-2",b:"2"},
      {name:"Vật thể thiết diện hình tròn",expr:"sqrt(4 - x^2)",expr2:"0",axis:"sec-circle",a:"-2",b:"2"}
    ]
  }
];\n\n`;

code = code.slice(0, startIdx) + newPresets + code.slice(endIdx);

fs.writeFileSync('dist/assets/index-D9JME9Hm.js', code, 'utf8');
console.log('Successfully applied all cheat sheet presets and sec-wedge2!');
