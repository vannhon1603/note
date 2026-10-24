// Smart Formula Analyzer Prototype
function parseSmartFunction(expr) {
  let s = expr.replace(/\s+/g, "").toLowerCase();
  s = s.replace(/^(y|f\(x\))=/, "");

  // Helper: parse polynomial term like 2x^3, -x^2, +3x, -5
  // Let's test standard patterns:
  
  // 1. Rational (ax + b) / (cx + d)
  const frac11 = s.match(/^\(?([+-]?\d*(?:\.\d+)?\*?)x([+-]\d*(?:\.\d+)?)?\)?\/\(?([+-]?\d*(?:\.\d+)?\*?)x([+-]\d*(?:\.\d+)?)?\)?$/);
  if (frac11) {
    const parseCoeff = (c) => {
      if (c === "" || c === "+") return 1;
      if (c === "-") return -1;
      return parseFloat(c);
    };
    const a = parseCoeff(frac11[1]);
    const b = frac11[2] ? parseFloat(frac11[2]) : 0;
    const c = parseCoeff(frac11[3]);
    const d = frac11[4] ? parseFloat(frac11[4]) : 0;
    
    if (c !== 0) {
      const x0 = -d / c;
      const det = a * d - b * c;
      const yInf = a / c;
      const fmtNum = (n) => Number.isInteger(n) ? "" + n : n.toFixed(2).replace(/\.?0+$/, "");
      const x0Str = fmtNum(x0);
      const yInfStr = fmtNum(yInf);

      if (det < 0) {
        // Nghịch biến: 2 nhánh giảm
        return {
          tableType: "vartable",
          xs: ["-inf", x0Str, "+inf"],
          marks: ["", "||", ""],
          signs: ["-", "-"],
          ys: [yInfStr, "-inf", yInfStr],
          ys2: ["", "+inf", ""]
        };
      } else if (det > 0) {
        // Đồng biến: 2 nhánh tăng
        return {
          tableType: "vartable",
          xs: ["-inf", x0Str, "+inf"],
          marks: ["", "||", ""],
          signs: ["+", "+"],
          ys: [yInfStr, "+inf", yInfStr],
          ys2: ["", "-inf", ""]
        };
      }
    }
  }

  return null;
}

console.log("Test (2x+1)/(x-1):", parseSmartFunction("(2x+1)/(x-1)"));
console.log("Test (x-2)/(x-1):", parseSmartFunction("(x-2)/(x-1)"));
console.log("Test (x+1)/(x-2):", parseSmartFunction("(x+1)/(x-2)"));
