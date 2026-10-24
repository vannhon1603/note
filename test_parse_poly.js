function parsePoly(str) {
  // Normalize
  let s = str.replace(/\s+/g, "").toLowerCase();
  s = s.replace(/-/g, "+-");
  const terms = s.split("+").filter(Boolean);
  const poly = {}; // degree -> coeff

  for (let term of terms) {
    let coeff = 1, deg = 0;
    if (term.includes("x")) {
      const parts = term.split("x");
      let cStr = parts[0];
      if (cStr === "" || cStr === "+") coeff = 1;
      else if (cStr === "-") coeff = -1;
      else coeff = parseFloat(cStr);

      if (parts[1].startsWith("^")) {
        deg = parseInt(parts[1].substring(1), 10);
      } else {
        deg = 1;
      }
    } else {
      coeff = parseFloat(term);
      deg = 0;
    }
    poly[deg] = (poly[deg] || 0) + coeff;
  }
  return poly;
}

console.log("x^2 - x + 1:", parsePoly("x^2 - x + 1"));
console.log("-x^2 + 2x - 2:", parsePoly("-x^2 + 2x - 2"));
console.log("2x^3 - 3x:", parsePoly("2x^3 - 3x"));
console.log("x - 1:", parsePoly("x - 1"));
console.log("x^4 - 2x^2 - 1:", parsePoly("x^4 - 2x^2 - 1"));
