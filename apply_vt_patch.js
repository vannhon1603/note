const fs = require("fs");

let bundle = fs.readFileSync("dist/assets/index-D9JME9Hm.js", "utf8");

// Define presets and smartAnalyze
const presetsAndAnalyzer = `
const VT_PRESETS = [
  {
    category: "Hàm bậc 3",
    items: [
      {
        name: "y = x³ - 3x (a > 0, 2 cực trị - Chữ N)",
        fn: "x^3 - 3x",
        tableType: "vartable",
        xs: ["-inf", "-1", "1", "+inf"],
        marks: ["", "0", "0", ""],
        signs: ["+", "-", "+"],
        ys: ["-inf", "2", "-2", "+inf"],
        rowLabels: ["x", "y′", "y"]
      },
      {
        name: "y = -x³ + 3x (a < 0, 2 cực trị - Chữ N ngược)",
        fn: "-x^3 + 3x",
        tableType: "vartable",
        xs: ["-inf", "-1", "1", "+inf"],
        marks: ["", "0", "0", ""],
        signs: ["-", "+", "-"],
        ys: ["+inf", "-2", "2", "-inf"],
        rowLabels: ["x", "y′", "y"]
      },
      {
        name: "y = x³ + 3x (a > 0, đồng biến trên ℝ)",
        fn: "x^3 + 3x",
        tableType: "vartable",
        xs: ["-inf", "+inf"],
        marks: ["", ""],
        signs: ["+"],
        ys: ["-inf", "+inf"],
        rowLabels: ["x", "y′", "y"]
      },
      {
        name: "y = -x³ - 3x (a < 0, nghịch biến trên ℝ)",
        fn: "-x^3 - 3x",
        tableType: "vartable",
        xs: ["-inf", "+inf"],
        marks: ["", ""],
        signs: ["-"],
        ys: ["+inf", "-inf"],
        rowLabels: ["x", "y′", "y"]
      },
      {
        name: "y = x³ (Điểm uốn x = 0, tăng suốt ℝ)",
        fn: "x^3",
        tableType: "vartable",
        xs: ["-inf", "0", "+inf"],
        marks: ["", "0", ""],
        signs: ["+", "+"],
        ys: ["-inf", "0", "+inf"],
        rowLabels: ["x", "y′", "y"]
      }
    ]
  },
  {
    category: "Hàm bậc 4 trùng phương",
    items: [
      {
        name: "y = x⁴ - 2x² - 1 (3 cực trị - Chữ W)",
        fn: "x^4 - 2x^2 - 1",
        tableType: "vartable",
        xs: ["-inf", "-1", "0", "1", "+inf"],
        marks: ["", "0", "0", "0", ""],
        signs: ["-", "+", "-", "+"],
        ys: ["+inf", "-2", "-1", "-2", "+inf"],
        rowLabels: ["x", "y′", "y"]
      },
      {
        name: "y = -x⁴ + 2x² + 1 (3 cực trị - Chữ M)",
        fn: "-x^4 + 2x^2 + 1",
        tableType: "vartable",
        xs: ["-inf", "-1", "0", "1", "+inf"],
        marks: ["", "0", "0", "0", ""],
        signs: ["+", "-", "+", "-"],
        ys: ["-inf", "2", "1", "2", "-inf"],
        rowLabels: ["x", "y′", "y"]
      },
      {
        name: "y = x⁴ + 2x² (1 cực trị - Parabol U)",
        fn: "x^4 + 2x^2",
        tableType: "vartable",
        xs: ["-inf", "0", "+inf"],
        marks: ["", "0", ""],
        signs: ["-", "+"],
        ys: ["+inf", "0", "+inf"],
        rowLabels: ["x", "y′", "y"]
      },
      {
        name: "y = -x⁴ - 2x² (1 cực trị - Parabol ngược)",
        fn: "-x^4 - 2x^2",
        tableType: "vartable",
        xs: ["-inf", "0", "+inf"],
        marks: ["", "0", ""],
        signs: ["+", "-"],
        ys: ["-inf", "0", "-inf"],
        rowLabels: ["x", "y′", "y"]
      }
    ]
  },
  {
    category: "Phân thức bậc 1/1 (y = ax+b/cx+d)",
    items: [
      {
        name: "y = (2x+1)/(x-1) (Nghịch biến - TCĐ x = 1, TCN y = 2)",
        fn: "(2x+1)/(x-1)",
        tableType: "vartable",
        xs: ["-inf", "1", "+inf"],
        marks: ["", "||", ""],
        signs: ["-", "-"],
        ys: ["2", "-inf", "2"],
        ys2: ["", "+inf", ""],
        rowLabels: ["x", "y′", "y"]
      },
      {
        name: "y = (x-2)/(x-1) (Đồng biến - TCĐ x = 1, TCN y = 1)",
        fn: "(x-2)/(x-1)",
        tableType: "vartable",
        xs: ["-inf", "1", "+inf"],
        marks: ["", "||", ""],
        signs: ["+", "+"],
        ys: ["1", "+inf", "1"],
        ys2: ["", "-inf", ""],
        rowLabels: ["x", "y′", "y"]
      }
    ]
  },
  {
    category: "Phân thức bậc 2/1 (SGK Mới 2018)",
    items: [
      {
        name: "y = (x² - x + 1)/(x - 1) (2 cực trị - CĐ trái, CT phải)",
        fn: "(x^2 - x + 1)/(x - 1)",
        tableType: "vartable",
        xs: ["-inf", "0", "1", "2", "+inf"],
        marks: ["", "0", "||", "0", ""],
        signs: ["+", "-", "-", "+"],
        ys: ["-inf", "-1", "-inf", "3", "+inf"],
        ys2: ["", "", "+inf", "", ""],
        rowLabels: ["x", "y′", "y"]
      },
      {
        name: "y = (-x² + 2x - 2)/(x - 1) (2 cực trị - CT trái, CĐ phải)",
        fn: "(-x^2 + 2x - 2)/(x - 1)",
        tableType: "vartable",
        xs: ["-inf", "0", "1", "2", "+inf"],
        marks: ["", "0", "||", "0", ""],
        signs: ["-", "+", "+", "-"],
        ys: ["+inf", "2", "+inf", "-2", "-inf"],
        ys2: ["", "", "-inf", "", ""],
        rowLabels: ["x", "y′", "y"]
      }
    ]
  },
  {
    category: "Hàm bậc hai Parabol",
    items: [
      {
        name: "y = x² - 2x - 1 (a > 0, Đỉnh I(1; -2))",
        fn: "x^2 - 2x - 1",
        tableType: "vartable",
        xs: ["-inf", "1", "+inf"],
        marks: ["", "0", ""],
        signs: ["-", "+"],
        ys: ["+inf", "-2", "+inf"],
        rowLabels: ["x", "y′", "y"]
      },
      {
        name: "y = -x² + 2x + 1 (a < 0, Đỉnh I(1; 2))",
        fn: "-x^2 + 2x + 1",
        tableType: "vartable",
        xs: ["-inf", "1", "+inf"],
        marks: ["", "0", ""],
        signs: ["+", "-"],
        ys: ["-inf", "2", "-inf"],
        rowLabels: ["x", "y′", "y"]
      }
    ]
  },
  {
    category: "Đoạn đóng [a; b] (GTLN - GTNN)",
    items: [
      {
        name: "y = x³ - 3x trên đoạn [0; 3] (Min = -2, Max = 18)",
        fn: "x^3 - 3x",
        tableType: "vartable",
        xs: ["0", "1", "3"],
        marks: ["", "0", ""],
        signs: ["-", "+"],
        ys: ["0", "-2", "18"],
        rowLabels: ["x", "y′", "y"]
      },
      {
        name: "y = x⁴ - 2x² trên đoạn [-2; 2]",
        fn: "x^4 - 2x^2",
        tableType: "vartable",
        xs: ["-2", "-1", "0", "1", "2"],
        marks: ["", "0", "0", "0", ""],
        signs: ["-", "+", "-", "+"],
        ys: ["8", "-1", "0", "-1", "8"],
        rowLabels: ["x", "y′", "y"]
      }
    ]
  },
  {
    category: "Bảng xét dấu (2 dòng)",
    items: [
      {
        name: "Dấu đạo hàm y′ (3 nghiệm đan dấu)",
        fn: "",
        tableType: "sign",
        xs: ["-inf", "-1", "0", "1", "+inf"],
        marks: ["", "0", "0", "0", ""],
        signs: ["-", "+", "-", "+"],
        ys: ["", "", "", "", ""],
        rowLabels: ["x", "y′"]
      },
      {
        name: "Tam thức bậc 2: f(x) = x² - 3x + 2 (Trong trái ngoài cùng)",
        fn: "x^2 - 3x + 2",
        tableType: "sign",
        xs: ["-inf", "1", "2", "+inf"],
        marks: ["", "0", "0", ""],
        signs: ["+", "-", "+"],
        ys: ["", "", "", ""],
        rowLabels: ["x", "f(x)"]
      },
      {
        name: "Nhị thức bậc 1: f(x) = 2x - 4 (Trái khác phải cùng)",
        fn: "2x - 4",
        tableType: "sign",
        xs: ["-inf", "2", "+inf"],
        marks: ["", "0", ""],
        signs: ["-", "+"],
        ys: ["", "", ""],
        rowLabels: ["x", "f(x)"]
      },
      {
        name: "Phân thức: f(x) = (x-1)/(x+2) (Gián đoạn tại x = -2)",
        fn: "(x-1)/(x+2)",
        tableType: "sign",
        xs: ["-inf", "-2", "1", "+inf"],
        marks: ["", "||", "0", ""],
        signs: ["+", "-", "+"],
        ys: ["", "", "", ""],
        rowLabels: ["x", "f(x)"]
      }
    ]
  }
];

function smartAnalyze(e) {
  if (!e || typeof e !== "string") return null;
  let s = e.trim().toLowerCase();
  s = s.replace(/^(y|f\\(x\\))\\s*=\\s*/, "");
  s = s.replace(/\\s+/g, "");

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
      const parts = s.match(/^\\((.*)\\)\\/\\((.*)\\)$/);
      if (parts) { numStr = parts[1]; denStr = parts[2]; }
    } else {
      const parts = s.split("/");
      if (parts.length === 2) {
        numStr = parts[0].replace(/^\\(|\\)$/g, "");
        denStr = parts[1].replace(/^\\(|\\)$/g, "");
      }
    }

    if (numStr && denStr) {
      const N = parsePoly(numStr);
      const D = parsePoly(denStr);
      const degN = maxDeg(N);
      const degD = maxDeg(D);

      // Bac 1 / Bac 1: (ax+b)/(cx+d)
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

      // Bac 2 / Bac 1: (ax^2+bx+c)/(dx+e)
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

          if (delta > 1e-9) {
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
`;

// Updated y_ function
const updatedY_ = `function y_(e,t){
  const{x:n,y:r,w:i,h:o}=t,
  s=t.xs.length,
  isSign = t.tableType === "sign" || (!t.ys || t.ys.every(E=>!E)),
  l = isSign ? o / 2.0 : o / 4.2,
  c = l * 0.5,
  h = t.color ?? "#1a1a1a",
  d = Math.min(i * 0.18, l * 1.4),
  p = Math.max(1, l * 0.035);

  e.save();
  e.fillStyle="#ffffff";
  e.fillRect(n,r,i,o);
  e.strokeStyle=h;
  e.fillStyle=h;
  e.lineWidth=p;
  e.beginPath();
  e.rect(n,r,i,o);
  e.moveTo(n+d,r);
  e.lineTo(n+d,r+o);
  e.moveTo(n,r+l);
  e.lineTo(n+i,r+l);
  if(!isSign){
    e.moveTo(n,r+2*l);
    e.lineTo(n+i,r+2*l);
  }
  e.stroke();

  const g=E=>rs($B(E)),
  y=(E,T,P,V=c)=>ja(e,E,T-ho(e,E,V)/2,P,V,h),
  v=E=>({t:E,italic:!0,sup:!1});

  const lbl1 = (t.rowLabels && t.rowLabels[0]) || "x";
  const lbl2 = (t.rowLabels && t.rowLabels[1]) || (isSign ? "f(x)" : "y′");
  const lbl3 = (t.rowLabels && t.rowLabels[2]) || "y";

  const parseHdr = (txt) => {
    if (txt === "y'" || txt === "y′") return [v("y"), {t:"′",italic:!1,sup:!1}];
    if (txt === "f'(x)" || txt === "f′(x)") return [v("f"), {t:"′",italic:!1,sup:!1}, {t:"(x)",italic:!0,sup:!1}];
    if (txt === "f(x)") return [v("f"), {t:"(x)",italic:!0,sup:!1}];
    if (txt === "g(x)") return [v("g"), {t:"(x)",italic:!0,sup:!1}];
    if (txt === "P(x)") return [v("P"), {t:"(x)",italic:!0,sup:!1}];
    if (txt === "t") return [v("t")];
    if (txt === "s(t)") return [v("s"), {t:"(t)",italic:!0,sup:!1}];
    return [v(txt)];
  };

  y(parseHdr(lbl1), n+d/2, r+l/2+c*.35);
  y(parseHdr(lbl2), n+d/2, r+1.5*l+c*.35);
  if(!isSign){
    y(parseHdr(lbl3), n+d/2, r+3.1*l+c*.35);
  }

  const x=Math.min(l*1.1,(i-d)/4),
  w=n+d+x,
  M=n+i-x,
  S=E=>s===1?(w+M)/2:w+(M-w)*E/(s-1),
  L=Math.max(p*1.6,l*.05),
  D=(E,T,P)=>{
    e.beginPath();
    e.moveTo(E-L,T);
    e.lineTo(E-L,P);
    e.moveTo(E+L,T);
    e.lineTo(E+L,P);
    e.stroke();
  };

  t.xs.forEach((E,T)=>y(g(E),S(T),r+l/2+c*.35));

  t.marks.forEach((E,T)=>{
    if(E==="0"){
      y([{t:"0",italic:!1,sup:!1}],S(T),r+1.5*l+c*.35);
    } else if(E==="|"){
      D(S(T),r+l,isSign ? r+o : r+2*l);
    } else if(E==="||"){
      D(S(T),r+l,r+o);
    }
  });

  t.signs.forEach((E,T)=>{
    if(E==="+"||E==="-"){
      y([{t:E==="+"?"+":"−",italic:!1,sup:!1}],(S(T)+S(T+1))/2,r+1.5*l+c*.4,c*1.15);
    }
  });

  if(isSign){
    e.restore();
    return;
  }

  const F=E=>E==="top"?r+2*l+c*1.15:E==="bottom"?r+o-c*.5:r+3.1*l+c*.35,
  B=E=>F(E)-c*.35,
  j=c*.35,
  K=FB(t),
  A=t.marks.map((E,T)=>{
    var J;
    const P=S(T),{l:V,r:U}=K[T];
    if(E==="||"){
      const z=g(t.ys[T]??""),R=g(((J=t.ys2)==null?void 0:J[T])??""),
      I=ho(e,z,c),G=ho(e,R,c);
      return V&&ja(e,z,P-L-j-I,F(V),c,h),
             U&&ja(e,R,P+L+j,F(U),c,h),
             {l:V?{x:P-L-j*2-I,y:B(V)}:null,r:U?{x:P+L+j*2+G,y:B(U)}:null}
    }
    const ne=V??U??"mid",oe=g(t.ys[T]??""),W=ho(e,oe,c);
    return y(oe,P,F(ne)),{l:V?{x:P-W/2-j,y:B(V)}:null,r:U?{x:P+W/2+j,y:B(U)}:null}
  });

  e.lineWidth=Math.max(1.2,l*.045);
  t.signs.forEach((E,T)=>{
    var U,ne;
    const P=(U=A[T])==null?void 0:U.r,V=(ne=A[T+1])==null?void 0:ne.l;
    if((E==="+"||E==="-")&&P&&V&&V.x>P.x){
      e.beginPath();
      e.moveTo(P.x,P.y);
      e.lineTo(V.x,V.y);
      e.stroke();
      cv(e,P.x,P.y,V.x,V.y,e.lineWidth);
    }
  });
  e.restore();
}`;

// Updated aF function
const updatedAF = `function aF({item:e,onSave:t,onClose:n}){
  const r=ht(),
  [i,o]=H.useState(e),
  [s,l]=H.useState(e.fn??""),
  [c,h]=H.useState(""),
  d=H.useRef(null),
  p=i.xs.length,
  isSign = i.tableType === "sign" || (!i.ys || i.ys.every(E=>!E)),
  g = isSign ? Math.max(90, Math.min(180, Gd*i.h/i.w)) : Math.max(120, Math.min(260, Gd*i.h/i.w));

  H.useEffect(()=>{
    const S=d.current;if(!S)return;
    const L=window.devicePixelRatio||1;
    S.width=Math.round(Gd*L),S.height=Math.round(g*L);
    const D=S.getContext("2d");
    D.setTransform(1,0,0,1,0,0),D.clearRect(0,0,S.width,S.height);
    const F=Math.min(Gd/i.w,g/i.h);
    D.setTransform(F*L,0,0,F*L,(Gd-i.w*F)/2*L,(g-i.h*F)/2*L);
    y_(D,{...i,x:0,y:0});
  });

  const y=()=>{
    const smart = smartAnalyze(s);
    if(smart){
      h("");
      const{ys2:L,...D}=i;
      o({...D,...smart,fn:s,tableType:"vartable"});
      return;
    }
    const S=l_(s);
    if(S instanceof er)return h(r.parse[S.code](S.text));
    if(S instanceof Error)return h(S.message);
    if(typeof S=="string")return h(r.vtErrors[S]||S);
    h("");
    const{ys2:L,...D}=i;
    o({...D,...S,fn:s})
  },
  v=(S,L,D)=>{const F=[...i[S]??Array(p).fill("")];F[L]=D,o({...i,[S]:F})},
  x=()=>{
    const S=Math.max(1,p-1),L=(D,F,B=S)=>[...D.slice(0,B),F,...D.slice(B)];
    o({...i,xs:L(i.xs,""),marks:L(i.marks,"0"),ys:L(i.ys,""),...i.ys2?{ys2:L(i.ys2,"")}:{},signs:L(i.signs,i.signs[S-1]==="+"?"-":"+",S)})
  },
  w=S=>{
    if(p<=2)return;
    const L=(D,F)=>D.filter((B,j)=>j!==F);
    o({...i,xs:L(i.xs,S),marks:L(i.marks,S),ys:L(i.ys,S),...i.ys2?{ys2:L(i.ys2,S)}:{},signs:L(i.signs,Math.min(S,i.signs.length-1))})
  },
  M=(S,L)=>S<p-1?f.jsx("td",{className:"vt-gap",children:L}):null;

  const applyPreset=(presetName)=>{
    for(const group of VT_PRESETS){
      const found=group.items.find(it=>it.name===presetName);
      if(found){
        l(found.fn||"");
        h("");
        const newH = found.tableType==="sign" ? Math.min(i.h,130) : Math.max(i.h,230);
        o({
          ...i,
          fn: found.fn||"",
          tableType: found.tableType,
          xs: [...found.xs],
          marks: [...found.marks],
          signs: [...found.signs],
          ys: [...found.ys],
          ys2: found.ys2 ? [...found.ys2] : undefined,
          rowLabels: found.rowLabels ? [...found.rowLabels] : undefined,
          h: newH
        });
        return;
      }
    }
  };

  const toggleTableType=(type)=>{
    if(type==="sign"){
      o({
        ...i,
        tableType: "sign",
        h: Math.min(i.h, 130),
        rowLabels: i.rowLabels && i.rowLabels.length>=2 ? i.rowLabels : ["x", "f(x)"]
      });
    } else {
      o({
        ...i,
        tableType: "vartable",
        h: Math.max(i.h, 220),
        rowLabels: i.rowLabels && i.rowLabels.length>=3 ? i.rowLabels : ["x", "y′", "y"]
      });
    }
  };

  const setRowLabel=(idx,val)=>{
    const cur=[...(i.rowLabels || (isSign ? ["x", "f(x)"] : ["x", "y′", "y"]))];
    cur[idx]=val;
    o({...i,rowLabels:cur});
  };

  const curLabels = i.rowLabels || (isSign ? ["x", "f(x)"] : ["x", "y′", "y"]);
  const curColor = i.color || "#1a1a1a";
  const vtColors = ["#1a1a1a", "#1e63d6", "#e53935", "#2bb32b", "#7b1fa2"];

  return f.jsxs(vi,{title:r.vartableTitle,onClose:n,wide:!0,className:"vt-dialog",children:[
    f.jsx("canvas",{ref:d,className:"vt-preview",style:{width:Gd,height:g}}),
    
    // Header Bar: Table Type Tabs & Presets Gallery
    f.jsxs("div",{style:{display:"flex",gap:"10px",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",marginBottom:"8px",background:"#f8fafc",padding:"8px 12px",borderRadius:"8px",border:"1px solid #e2e8f0"},children:[
      f.jsxs("div",{style:{display:"flex",gap:"6px",alignItems:"center"},children:[
        f.jsx("span",{style:{fontSize:"13px",fontWeight:"600",color:"#475569"},children:"Loại bảng:"}),
        f.jsx("button",{type:"button",onClick:()=>toggleTableType("vartable"),style:{padding:"4px 10px",borderRadius:"6px",fontSize:"12px",fontWeight:"600",border:"1px solid",borderColor:!isSign?"#0284c7":"#cbd5e1",background:!isSign?"#0284c7":"#ffffff",color:!isSign?"#ffffff":"#334155",cursor:"pointer"},children:"📈 Bảng biến thiên (3 dòng)"}),
        f.jsx("button",{type:"button",onClick:()=>toggleTableType("sign"),style:{padding:"4px 10px",borderRadius:"6px",fontSize:"12px",fontWeight:"600",border:"1px solid",borderColor:isSign?"#0284c7":"#cbd5e1",background:isSign?"#0284c7":"#ffffff",color:isSign?"#ffffff":"#334155",cursor:"pointer"},children:"📋 Bảng xét dấu (2 dòng)"})
      ]}),
      f.jsxs("div",{style:{display:"flex",gap:"6px",alignItems:"center"},children:[
        f.jsx("span",{style:{fontSize:"13px",fontWeight:"600",color:"#475569"},children:"Mẫu SGK:"}),
        f.jsxs("select",{onChange:S=>applyPreset(S.target.value),style:{padding:"4px 8px",borderRadius:"6px",border:"1px solid #cbd5e1",background:"#ffffff",fontSize:"12px",fontWeight:"500",color:"#0f172a",maxWidth:"260px"},defaultValue:"",children:[
          f.jsx("option",{value:"",disabled:!0,children:"⚡ Chọn mẫu BBT chuẩn SGK..."}),
          VT_PRESETS.map((S,L)=>f.jsx("optgroup",{label:S.category,children:S.items.map(D=>f.jsx("option",{value:D.name,children:D.name},D.name))},L))
        ]})
      ]})
    ]}),

    // Formula & Make Bar
    f.jsxs("section",{className:"vt-make",style:{marginBottom:"6px"},children:[
      f.jsxs("label",{className:"vt-fn",children:[
        f.jsxs("span",{className:"fn-prefix",children:[f.jsx("i",{children:"y"})," ="]}),
        f.jsx("input",{value:s,placeholder:"Nhập hàm số: x^3 - 3x, (2x+1)/(x-1), (x^2-x+1)/(x-1), x^4 - 2x^2...",onChange:S=>l(S.target.value),onKeyDown:S=>S.key==="Enter"&&y()})
      ]}),
      f.jsx("button",{className:"primary",disabled:!s.trim(),onClick:y,children:r.vtMake||"Lập bảng"})
    ]}),

    // Quick Symbols & Row Labels & Color Toolbar
    f.jsxs("div",{style:{display:"flex",gap:"12px",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",marginBottom:"8px",fontSize:"12px",color:"#64748b"},children:[
      f.jsxs("div",{style:{display:"flex",gap:"4px",alignItems:"center"},children:[
        f.jsx("span",{style:{fontWeight:"600",marginRight:"2px"},children:"Ký hiệu:"}),
        ["-inf","+inf","0","||","|","sqrt(3)","pi"].map(S=>f.jsx("button",{type:"button",key:S,onClick:()=>l(prev=>prev+S),style:{padding:"2px 6px",borderRadius:"4px",border:"1px solid #e2e8f0",background:"#f1f5f9",fontSize:"11px",cursor:"pointer",color:"#1e293b"},children:S==="sqrt(3)"?"√3":S==="pi"?"π":S}))
      ]}),
      f.jsxs("div",{style:{display:"flex",gap:"6px",alignItems:"center"},children:[
        f.jsx("span",{style:{fontWeight:"600"},children:"Nhãn:"}),
        f.jsx("input",{value:curLabels[0]||"x",title:"Nhãn dòng 1",onChange:S=>setRowLabel(0,S.target.value),style:{width:"32px",padding:"2px 4px",border:"1px solid #cbd5e1",borderRadius:"4px",textAlign:"center",fontSize:"11px"}}),
        f.jsx("input",{value:curLabels[1]||(isSign?"f(x)":"y′"),title:"Nhãn dòng 2",onChange:S=>setRowLabel(1,S.target.value),style:{width:"40px",padding:"2px 4px",border:"1px solid #cbd5e1",borderRadius:"4px",textAlign:"center",fontSize:"11px"}}),
        !isSign&&f.jsx("input",{value:curLabels[2]||"y",title:"Nhãn dòng 3",onChange:S=>setRowLabel(2,S.target.value),style:{width:"32px",padding:"2px 4px",border:"1px solid #cbd5e1",borderRadius:"4px",textAlign:"center",fontSize:"11px"}}),
        f.jsx("span",{style:{fontWeight:"600",marginLeft:"6px"},children:"Màu:"}),
        vtColors.map(S=>f.jsx("button",{type:"button",key:S,onClick:()=>o({...i,color:S}),style:{width:"18px",height:"18px",borderRadius:"50%",background:S,border:curColor===S?"2px solid #0284c7":"1px solid rgba(0,0,0,0.2)",boxShadow:curColor===S?"0 0 0 2px rgba(2,132,199,0.3)":"none",cursor:"pointer"}}))
      ]})
    ]}),

    c&&f.jsx("p",{className:"error",children:c}),
    f.jsx("p",{className:"help",style:{fontSize:"12px",color:"#64748b",marginBottom:"6px"},children:"💡 Chọn mẫu chuẩn SGK hoặc nhập hàm số rồi bấm Lập bảng. Có thể sửa trực tiếp từng ô mốc, dấu và giá trị."}),

    // Matrix Editor Table
    f.jsx("div",{className:"vt-scroll",children:f.jsx("table",{className:"vt-edit",children:f.jsxs("tbody",{children:[
      // Row 1: x
      f.jsxs("tr",{children:[
        f.jsx("th",{children:f.jsx("i",{children:curLabels[0]||"x"})}),
        i.xs.map((S,L)=>f.jsxs(H.Fragment,{children:[
          f.jsx("td",{children:f.jsx("input",{value:S,onChange:D=>v("xs",L,D.target.value)})}),
          M(L,null)
        ]},L))
      ]}),
      // Row 2: y' or marks & signs
      f.jsxs("tr",{children:[
        f.jsxs("th",{children:[f.jsx("i",{children:(curLabels[1]||(isSign?"f(x)":"y′")).replace(/[′']/,"")}),(curLabels[1]||"").includes("′")||(curLabels[1]||"").includes("'")?f.jsx("span",{children:"′"}):null]}),
        i.marks.map((S,L)=>f.jsxs(H.Fragment,{children:[
          f.jsx("td",{children:f.jsx("select",{value:S,onChange:D=>v("marks",L,D.target.value),children:oF.map(D=>f.jsx("option",{value:D,children:r.vtMarks[D]||D},D))})}),
          M(L,f.jsx("select",{value:i.signs[L]??"",onChange:D=>v("signs",L,D.target.value),children:sF.map(D=>f.jsx("option",{value:D,children:r.vtSigns[D]||D},D))}))
        ]},L))
      ]}),
      // Row 3: y (Only if !isSign)
      !isSign&&f.jsxs("tr",{children:[
        f.jsx("th",{children:f.jsx("i",{children:curLabels[2]||"y"})}),
        i.ys.map((S,L)=>{
          var D;
          return f.jsxs(H.Fragment,{children:[
            f.jsxs("td",{children:[
              f.jsx("input",{value:S,placeholder:i.marks[L]==="||"?(r.vtLeft||"Trái"):"",onChange:F=>v("ys",L,F.target.value)}),
              i.marks[L]==="||"&&f.jsx("input",{value:((D=i.ys2)==null?void 0:D[L])??"",placeholder:r.vtRight||"Phải",onChange:F=>v("ys2",L,F.target.value)})
            ]}),
            M(L,null)
          ]},L);
        })
      ]}),
      // Row Remove
      f.jsxs("tr",{className:"vt-remove",children:[
        f.jsx("th",{}),
        i.xs.map((S,L)=>f.jsxs(H.Fragment,{children:[
          f.jsx("td",{children:f.jsx("button",{className:"link",disabled:p<=2,onClick:()=>w(L),children:r.vtRemoveMark||"Xóa"})}),
          M(L,null)
        ]},L))
      ]})
    ]})})}),

    f.jsx("button",{className:"link",onClick:x,style:{marginTop:"6px"},children:r.vtAddMark||"+ Thêm mốc"}),

    f.jsxs("footer",{className:"dialog-actions",children:[
      f.jsx("button",{onClick:n,children:r.cancel||"Hủy"}),
      f.jsx("button",{className:"primary",onClick:()=>t({...i,fn:s.trim()||void 0}),children:r.done||"Xong"})
    ]})
  ]});
}`;

// Find index of y_
const yIdx = bundle.indexOf("function y_(");
const afterY_ = bundle.indexOf("const eP=", yIdx);
if (yIdx === -1 || afterY_ === -1) {
  throw new Error("Could not find y_ in bundle!");
}

// Find index of aF
const aFIdx = bundle.indexOf("function aF({item:e,onSave:t,onClose:n})");
const afterAF = bundle.indexOf("const Kl=[", aFIdx);
if (aFIdx === -1 || afterAF === -1) {
  throw new Error("Could not find aF in bundle!");
}

console.log("Replacing y_ at [", yIdx, ",", afterY_, "]");
console.log("Replacing aF at [", aFIdx, ",", afterAF, "]");

// Perform replacement
// Note: y_ is before aF. So replace aF first, then y_ (or recalculate indices)
const part3 = bundle.substring(afterAF);
const part2 = bundle.substring(afterY_, aFIdx);
const part1 = bundle.substring(0, yIdx);

const newBundle = part1 + updatedY_ + part2 + presetsAndAnalyzer + "\n" + updatedAF + "\n" + part3;

fs.writeFileSync("dist/assets/index-D9JME9Hm.js", newBundle, "utf8");
console.log("Replacement written successfully. New bundle size:", newBundle.length);
