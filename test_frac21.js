function parseFrac21(expr) {
  let s = expr.replace(/\s+/g, "").toLowerCase();
  s = s.replace(/^(y|f\(x\))=/, "");

  // Match (ax^2+bx+c)/(dx+e)
  // e.g. (x^2-x+1)/(x-1)
  const frac21 = s.match(/^\(?([+-]?\d*(?:\.\d+)?\*?)x\^?2([+-]\d*(?:\.\d+)?\*?x)?([+-]\d*(?:\.\d+)?)?\)?\/\(?([+-]?\d*(?:\.\d+)?\*?)x([+-]\d*(?:\.\d+)?)?\)?$/);
  if (!frac21) return null;

  const parseCoeff = (c, def = 1) => {
    if (!c) return 0;
    c = c.replace(/\*?x$/, "").replace(/\*$/, "");
    if (c === "" || c === "+") return 1;
    if (c === "-") return -1;
    return parseFloat(c);
  };

  const a = parseCoeff(frac21[1], 1);
  const b = parseCoeff(frac21[2], 0);
  const c = frac21[3] ? parseFloat(frac21[3]) : 0;
  const d = parseCoeff(frac21[4], 1);
  const e = frac21[5] ? parseFloat(frac21[5]) : 0;

  if (d === 0) return null;

  const x0 = -e / d; // Asymptote
  // derivative numerator: A x^2 + B x + C
  const A = a * d;
  const B = 2 * a * e;
  const C = b * e - c * d;

  const delta = B * B - 4 * A * C;
  const fmtNum = (n) => Number.isInteger(Math.round(n * 1000) / 1000) ? "" + Math.round(n) : (Math.round(n * 100) / 100).toString();

  const evalY = (x) => (a * x * x + b * x + c) / (d * x + e);

  if (delta > 0) {
    let r1 = (-B - Math.sqrt(delta)) / (2 * A);
    let r2 = (-B + Math.sqrt(delta)) / (2 * A);
    if (r1 > r2) [r1, r2] = [r2, r1];

    const y1 = fmtNum(evalY(r1));
    const y2 = fmtNum(evalY(r2));
    const x1Str = fmtNum(r1);
    const x2Str = fmtNum(r2);
    const x0Str = fmtNum(x0);

    if (A > 0) {
      return {
        tableType: "vartable",
        xs: ["-inf", x1Str, x0Str, x2Str, "+inf"],
        marks: ["", "0", "||", "0", ""],
        signs: ["+", "-", "-", "+"],
        ys: ["-inf", y1, "-inf", y2, "+inf"],
        ys2: ["", "", "+inf", "", ""]
      };
    } else {
      return {
        tableType: "vartable",
        xs: ["-inf", x1Str, x0Str, x2Str, "+inf"],
        marks: ["", "0", "||", "0", ""],
        signs: ["-", "+", "+", "-"],
        ys: ["+inf", y1, "+inf", y2, "-inf"],
        ys2: ["", "", "-inf", "", ""]
      };
    }
  }
  return null;
}

console.log("Test (x^2-x+1)/(x-1):", parseFrac21("(x^2-x+1)/(x-1)"));
console.log("Test (-x^2+2x-2)/(x-1):", parseFrac21("(-x^2+2x-2)/(x-1)"));
