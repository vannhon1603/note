function smartAnalyze(expr) {
  let s = (expr || "").trim().toLowerCase();
  s = s.replace(/^(y|f\(x\))\s*=\s*/, "");
  s = s.replace(/\s+/g, "");

  const fmtNum = (n) => {
    if (Math.abs(n) < 1e-9) return "0";
    if (Number.isInteger(Math.round(n * 1000) / 1000)) return "" + Math.round(n);
    return (Math.round(n * 100) / 100).toString();
  };

  const parsePoly = (str) => {
    let p = str.replace(/-/g, "+-");
    const terms = p.split("+").filter(Boolean);
    const poly = {};
    for (let term of terms) {
      let coeff = 1, deg = 0;
      if (term.includes("x")) {
        const parts = term.split("x");
        let cStr = parts[0];
        if (cStr === "" || cStr === "+") coeff = 1;
        else if (cStr === "-") coeff = -1;
        else coeff = parseFloat(cStr);

        if (parts[1] && parts[1].startsWith("^")) {
          deg = parseInt(parts[1].substring(1), 10);
        } else {
          deg = 1;
        }
      } else {
        coeff = parseFloat(term);
        deg = 0;
      }
      if (!isNaN(coeff)) poly[deg] = (poly[deg] || 0) + coeff;
    }
    return poly;
  };

  const evalPoly = (poly, x) => {
    let val = 0;
    for (let d in poly) val += poly[d] * Math.pow(x, parseInt(d, 10));
    return val;
  };

  const maxDeg = (poly) => Math.max(...Object.keys(poly).map(Number).filter(d => Math.abs(poly[d]) > 1e-9), 0);

  // Check if rational
  if (s.includes("/")) {
    let numStr = s, denStr = "";
    if (s.startsWith("(") && s.includes(")/(")) {
      const parts = s.match(/^\((.*)\)\/\((.*)\)$/);
      if (parts) { numStr = parts[1]; denStr = parts[2]; }
    } else {
      const parts = s.split("/");
      if (parts.length === 2) {
        numStr = parts[0].replace(/^\(|\)$/g, "");
        denStr = parts[1].replace(/^\(|\)$/g, "");
      }
    }

    if (numStr && denStr) {
      const N = parsePoly(numStr);
      const D = parsePoly(denStr);
      const degN = maxDeg(N);
      const degD = maxDeg(D);

      // Bac 1 / Bac 1
      if (degN <= 1 && degD === 1) {
        const a = N[1] || 0, b = N[0] || 0;
        const c = D[1] || 0, d = D[0] || 0;
        if (c !== 0) {
          const x0 = -d / c;
          const det = a * d - b * c;
          const yInf = fmtNum(a / c);
          const x0Str = fmtNum(x0);
          if (det < 0) {
            return {
              xs: ["-inf", x0Str, "+inf"],
              marks: ["", "||", ""],
              signs: ["-", "-"],
              ys: [yInf, "-inf", yInf],
              ys2: ["", "+inf", ""]
            };
          } else if (det > 0) {
            return {
              xs: ["-inf", x0Str, "+inf"],
              marks: ["", "||", ""],
              signs: ["+", "+"],
              ys: [yInf, "+inf", yInf],
              ys2: ["", "-inf", ""]
            };
          }
        }
      }

      // Bac 2 / Bac 1
      if (degN === 2 && degD === 1) {
        const a = N[2] || 0, b = N[1] || 0, c = N[0] || 0;
        const d = D[1] || 0, e = D[0] || 0;
        if (d !== 0) {
          const x0 = -e / d;
          const A = a * d;
          const B = 2 * a * e;
          const C = b * e - c * d;
          const delta = B * B - 4 * A * C;
          const evalFrac = (x) => evalPoly(N, x) / evalPoly(D, x);
          const x0Str = fmtNum(x0);

          if (delta > 0) {
            let r1 = (-B - Math.sqrt(delta)) / (2 * A);
            let r2 = (-B + Math.sqrt(delta)) / (2 * A);
            if (r1 > r2) [r1, r2] = [r2, r1];
            const y1 = fmtNum(evalFrac(r1));
            const y2 = fmtNum(evalFrac(r2));
            const x1Str = fmtNum(r1);
            const x2Str = fmtNum(r2);

            if (A > 0) {
              return {
                xs: ["-inf", x1Str, x0Str, x2Str, "+inf"],
                marks: ["", "0", "||", "0", ""],
                signs: ["+", "-", "-", "+"],
                ys: ["-inf", y1, "-inf", y2, "+inf"],
                ys2: ["", "", "+inf", "", ""]
              };
            } else {
              return {
                xs: ["-inf", x1Str, x0Str, x2Str, "+inf"],
                marks: ["", "0", "||", "0", ""],
                signs: ["-", "+", "+", "-"],
                ys: ["+inf", y1, "+inf", y2, "-inf"],
                ys2: ["", "", "-inf", "", ""]
              };
            }
          } else {
            // Delta <= 0: monotonic
            if (A > 0) {
              return {
                xs: ["-inf", x0Str, "+inf"],
                marks: ["", "||", ""],
                signs: ["+", "+"],
                ys: ["-inf", "+inf", "-inf"],
                ys2: ["", "-inf", ""]
              };
            } else {
              return {
                xs: ["-inf", x0Str, "+inf"],
                marks: ["", "||", ""],
                signs: ["-", "-"],
                ys: ["+inf", "-inf", "+inf"],
                ys2: ["", "+inf", ""]
              };
            }
          }
        }
      }
    }
  }

  // Polynomials
  const P = parsePoly(s);
  const deg = maxDeg(P);

  // Bac 3: ax^3 + bx^2 + cx + d
  if (deg === 3) {
    const a = P[3] || 0, b = P[2] || 0, c = P[1] || 0, d = P[0] || 0;
    // y' = 3ax^2 + 2bx + c
    const A = 3 * a, B = 2 * b, C = c;
    const delta = B * B - 4 * A * C;
    if (delta > 1e-9) {
      let r1 = (-B - Math.sqrt(delta)) / (2 * A);
      let r2 = (-B + Math.sqrt(delta)) / (2 * A);
      if (r1 > r2) [r1, r2] = [r2, r1];
      const y1 = fmtNum(evalPoly(P, r1));
      const y2 = fmtNum(evalPoly(P, r2));
      const x1Str = fmtNum(r1);
      const x2Str = fmtNum(r2);
      if (a > 0) {
        return {
          xs: ["-inf", x1Str, x2Str, "+inf"],
          marks: ["", "0", "0", ""],
          signs: ["+", "-", "+"],
          ys: ["-inf", y1, y2, "+inf"]
        };
      } else {
        return {
          xs: ["-inf", x1Str, x2Str, "+inf"],
          marks: ["", "0", "0", ""],
          signs: ["-", "+", "-"],
          ys: ["+inf", y1, y2, "-inf"]
        };
      }
    } else {
      if (a > 0) {
        return {
          xs: ["-inf", "+inf"],
          marks: ["", ""],
          signs: ["+"],
          ys: ["-inf", "+inf"]
        };
      } else {
        return {
          xs: ["-inf", "+inf"],
          marks: ["", ""],
          signs: ["-"],
          ys: ["+inf", "-inf"]
        };
      }
    }
  }

  // Bac 4 trung phuong: ax^4 + bx^2 + c
  if (deg === 4 && !P[3] && !P[1]) {
    const a = P[4] || 0, b = P[2] || 0, c = P[0] || 0;
    // y' = 4ax^3 + 2bx = 2x(2ax^2 + b)
    const y0 = fmtNum(evalPoly(P, 0));
    if (-b / (2 * a) > 1e-9) {
      const x0 = Math.sqrt(-b / (2 * a));
      const y1 = fmtNum(evalPoly(P, x0));
      const x1Str = fmtNum(-x0);
      const x2Str = fmtNum(x0);
      if (a > 0) {
        return {
          xs: ["-inf", x1Str, "0", x2Str, "+inf"],
          marks: ["", "0", "0", "0", ""],
          signs: ["-", "+", "-", "+"],
          ys: ["+inf", y1, y0, y1, "+inf"]
        };
      } else {
        return {
          xs: ["-inf", x1Str, "0", x2Str, "+inf"],
          marks: ["", "0", "0", "0", ""],
          signs: ["+", "-", "+", "-"],
          ys: ["-inf", y1, y0, y1, "-inf"]
        };
      }
    } else {
      if (a > 0) {
        return {
          xs: ["-inf", "0", "+inf"],
          marks: ["", "0", ""],
          signs: ["-", "+"],
          ys: ["+inf", y0, "+inf"]
        };
      } else {
        return {
          xs: ["-inf", "0", "+inf"],
          marks: ["", "0", ""],
          signs: ["+", "-"],
          ys: ["-inf", y0, "-inf"]
        };
      }
    }
  }

  // Bac 2: ax^2 + bx + c
  if (deg === 2) {
    const a = P[2] || 0, b = P[1] || 0, c = P[0] || 0;
    const x0 = -b / (2 * a);
    const y0 = fmtNum(evalPoly(P, x0));
    const x0Str = fmtNum(x0);
    if (a > 0) {
      return {
        xs: ["-inf", x0Str, "+inf"],
        marks: ["", "0", ""],
        signs: ["-", "+"],
        ys: ["+inf", y0, "+inf"]
      };
    } else {
      return {
        xs: ["-inf", x0Str, "+inf"],
        marks: ["", "0", ""],
        signs: ["+", "-"],
        ys: ["-inf", y0, "-inf"]
      };
    }
  }

  return null;
}

// Test cases
console.log("x^3 - 3x:", smartAnalyze("x^3 - 3x"));
console.log("-x^3 + 3x:", smartAnalyze("-x^3 + 3x"));
console.log("x^3 + 3x:", smartAnalyze("x^3 + 3x"));
console.log("x^4 - 2x^2 - 1:", smartAnalyze("x^4 - 2x^2 - 1"));
console.log("-x^4 + 2x^2 + 1:", smartAnalyze("-x^4 + 2x^2 + 1"));
console.log("x^4 + 2x^2:", smartAnalyze("x^4 + 2x^2"));
console.log("(2x+1)/(x-1):", smartAnalyze("(2x+1)/(x-1)"));
console.log("(x-2)/(x-1):", smartAnalyze("(x-2)/(x-1)"));
console.log("(x^2-x+1)/(x-1):", smartAnalyze("(x^2-x+1)/(x-1)"));
console.log("x^2 - 2x - 1:", smartAnalyze("x^2 - 2x - 1"));
