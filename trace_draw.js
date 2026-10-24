const fs = require('fs');
const js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

// Extract bo (parser), fmtVolume, drawVolume3D
const mockCtx = {
  save() {},
  restore() {},
  beginPath() {},
  closePath() {},
  moveTo(x, y) { this.lastX = x; this.lastY = y; },
  lineTo(x, y) { this.lastX = x; this.lastY = y; },
  arc() {},
  rect() {},
  fillRect() {},
  strokeRect() {},
  stroke() {
    if (this.strokeStyle && (this.strokeStyle.includes('dash') || this.currentDash)) {
      // console.log('STROKE DASHED:', this.strokeStyle);
    }
  },
  fill() {
    console.log('FILL:', this.fillStyle);
  },
  setLineDash(d) {
    this.currentDash = d;
    if (d && d.length > 0) {
      console.log('SET LINE DASH:', d, 'strokeStyle:', this.strokeStyle, 'fillStyle:', this.fillStyle);
    }
  },
  measureText(t) { return { width: (t || '').length * 7 }; },
  fillText(t, x, y) {
    // console.log('TEXT:', t);
  }
};

// Let's create a harness by running drawVolume3D with the exact parameters from the modal!
// expr: "sqrt(4 - x^2)", expr2: "0", a: -2, b: 2, axis: "sec-ox", nSlices: 30
const runCode = `
${js.slice(js.indexOf('function bo('), js.indexOf('function VolumeDialog'))}

const item = {
  x: 0, y: 0, w: 470, h: 270,
  expr: "sqrt(4 - x^2)", expr2: "0",
  a: -2, b: 2, axis: "sec-ox", nSlices: 30,
  cutPos: 0
};
drawVolume3D(mockCtx, item);
`;

try {
  eval(runCode);
} catch (e) {
  console.error('Error running test:', e);
}
