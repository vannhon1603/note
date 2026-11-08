/**
 * =======================================================================
 * CUSTOM SOLIDS MODULE (Study Note AI)
 * Bộ thư viện đầy đủ các khối hình học không gian trong chương trình THPT
 * (Toán Hình học 11 & 12 - GDPT 2018 / SGK Kết nối tri thức, Cánh diều, Chân trời sáng tạo)
 * =======================================================================
 */
(function (window) {
  'use strict';

  // 1. Danh sách các hình học không gian THPT bổ sung
  const SOLID_DEFINITIONS = [
    // ── KHỐI CHÓP (Pyramids) ──
    { id: 'cube', nameVi: 'Hình lập phương', nameEn: 'Cube', group: 'prisms' },
    { id: 'pyramid4Perp', nameVi: 'Chóp tứ giác (SA ⊥ đáy)', nameEn: 'Pyramid (SA ⊥ base)', group: 'pyramids' },
    { id: 'pyramid4SidePerp', nameVi: 'Chóp tứ giác ((SAB) ⊥ đáy)', nameEn: 'Pyramid ((SAB) ⊥ base)', group: 'pyramids' },
    { id: 'pyramid3Perp', nameVi: 'Chóp tam giác (SA ⊥ đáy)', nameEn: 'Triangular pyramid (SA ⊥ base)', group: 'pyramids' },
    { id: 'pyramid3SidePerp', nameVi: 'Chóp tam giác ((SAB) ⊥ đáy)', nameEn: 'Triangular pyramid ((SAB) ⊥ base)', group: 'pyramids' },
    { id: 'pyramid3Regular', nameVi: 'Chóp tam giác đều (S.ABC)', nameEn: 'Regular triangular pyramid', group: 'pyramids' },
    { id: 'tetrahedronRegular', nameVi: 'Tứ diện đều (A.BCD)', nameEn: 'Regular tetrahedron', group: 'pyramids' },
    { id: 'tetrahedronPerp', nameVi: 'Tam diện vuông (O.ABC)', nameEn: 'Trirectangular tetrahedron', group: 'pyramids' },
    { id: 'pyramidTrapezoid', nameVi: 'Chóp đáy hình thang vuông (SA ⊥ đáy)', nameEn: 'Pyramid with right trapezoid base', group: 'pyramids' },
    { id: 'frustumPyramid3', nameVi: 'Chóp cụt tam giác đều', nameEn: 'Triangular frustum', group: 'pyramids' },

    // ── KHỐI LĂNG TRỤ & HỘP (Prisms & Boxes) ──
    { id: 'prism3Regular', nameVi: 'Lăng trụ tam giác đều', nameEn: 'Regular triangular prism', group: 'prisms' },
    { id: 'prism4', nameVi: 'Lăng trụ đứng tứ giác', nameEn: 'Right quadrangular prism', group: 'prisms' },
    { id: 'prism6', nameVi: 'Lăng trụ lục giác đều', nameEn: 'Hexagonal prism', group: 'prisms' }
  ];

  // 2. Hàm khởi tạo các điểm & đoạn thẳng của hình không gian
  function createCustomSolid(shapeId, ctx) {
    const { F, Zo, B, g, x, v, j, K2, Rk } = ctx;

    switch (shapeId) {
      // ── HÌNH LẬP PHƯƠNG ──
      case 'cube': {
        const A = F(Zo, (oe, W) => {
          const s = Math.min(oe, W > 20 ? W : oe);
          return {
            A: [0, s, 0],
            B: [0, 0, 0],
            C: [s, 0, 0],
            D: [s, s, 0],
            A1: [0, s, s],
            B1: [0, 0, s],
            C1: [s, 0, s],
            D1: [s, s, s]
          };
        });
        const E = B(A('A'), 'A');
        const T = B(A('B'), 'B');
        const V = B(A('C'), 'C');
        const P = B(A('D'), 'D');
        const U = B(A('A1'), "A'");
        const ne = B(A('B1'), "B'");
        const oe = B(A('C1'), "C'");
        const W = B(A('D1'), "D'");

        x(E, T, true);
        x(E, P, true);
        x(T, V);
        x(V, P);

        x(U, ne);
        x(ne, oe);
        x(oe, W);
        x(W, U);

        x(E, U, true);
        x(T, ne);
        x(V, oe);
        x(P, W);

        j('cube', [E, T, V, P, U, ne, oe, W], K2);
        return true;
      }

      // ── HÌNH CHÓP TỨ GIÁC SA ⊥ ĐÁY ──
      case 'pyramid4Perp': {
        const A = F(Zo, (oe, W) => ({
          A: [0, oe, 0],
          B: [0, 0, 0],
          C: [oe, 0, 0],
          D: [oe, oe, 0],
          S: [0, oe, W]
        }));
        const E = B(A('A'), 'A');
        const T = B(A('B'), 'B');
        const P = B(A('C'), 'C');
        const V = B(A('D'), 'D');
        const ne = B(A('S'), 'S');

        x(E, T, true);
        x(E, V, true);
        x(T, P);
        x(P, V);

        x(ne, E, true);
        x(ne, T);
        x(ne, P);
        x(ne, V);

        v('right', [ne, E, T], { aux: true });
        v('right', [ne, E, V], { aux: true });

        j('pyramid4Perp', [E, T, P, V, ne], [[0, 1, 2, 3], [4, 0, 1], [4, 1, 2], [4, 2, 3], [4, 3, 0]]);
        return true;
      }

      // ── HÌNH CHÓP TỨ GIÁC (SAB) ⊥ ĐÁY (SH ⊥ AB) ──
      case 'pyramid4SidePerp': {
        const A = F(Zo, (oe, W) => ({
          A: [0, oe, 0],
          B: [0, 0, 0],
          C: [oe, 0, 0],
          D: [oe, oe, 0],
          H: [0, oe * 0.45, 0],
          S: [0, oe * 0.45, W]
        }));
        const A_pt = B(A('A'), 'A');
        const B_pt = B(A('B'), 'B');
        const C_pt = B(A('C'), 'C');
        const D_pt = B(A('D'), 'D');
        const H_pt = B(A('H'), 'H');
        const S_pt = B(A('S'), 'S');

        x(A_pt, B_pt, true);
        x(A_pt, D_pt, true);
        x(B_pt, C_pt);
        x(C_pt, D_pt);

        x(S_pt, A_pt, true);
        x(S_pt, B_pt);
        x(S_pt, C_pt);
        x(S_pt, D_pt);

        x(S_pt, H_pt, true, true);
        v('right', [S_pt, H_pt, B_pt], { aux: true });

        j('pyramid4SidePerp', [A_pt, B_pt, C_pt, D_pt, S_pt], [[0, 1, 2, 3], [4, 0, 1], [4, 1, 2], [4, 2, 3], [4, 3, 0]]);
        return true;
      }

      // ── HÌNH CHÓP TAM GIÁC SA ⊥ ĐÁY ──
      case 'pyramid3Perp': {
        const A = F(Zo, (oe, W) => ({
          A: [0, 0.75 * oe, 0],
          B: [0.4 * oe, 0, 0],
          C: [oe, 0.75 * oe, 0],
          S: [0, 0.75 * oe, W]
        }));
        const E = B(A('A'), 'A');
        const T = B(A('B'), 'B');
        const P = B(A('C'), 'C');
        const ne = B(A('S'), 'S');

        x(E, P, true);
        x(E, T);
        x(T, P);

        x(ne, E);
        x(ne, T);
        x(ne, P);

        v('right', [ne, E, T]);
        v('right', [ne, E, P], { aux: true });

        j('pyramid3Perp', [E, T, P, ne], [[0, 1, 2], [3, 0, 1], [3, 1, 2], [3, 2, 0]]);
        return true;
      }

      // ── HÌNH CHÓP TAM GIÁC (SAB) ⊥ ĐÁY ──
      case 'pyramid3SidePerp': {
        const A = F(Zo, (oe, W) => ({
          A: [0, 0.8 * oe, 0],
          B: [0.4 * oe, 0, 0],
          C: [oe, 0.8 * oe, 0],
          H: [0.2 * oe, 0.4 * oe, 0],
          S: [0.2 * oe, 0.4 * oe, W]
        }));
        const A_pt = B(A('A'), 'A');
        const B_pt = B(A('B'), 'B');
        const C_pt = B(A('C'), 'C');
        const H_pt = B(A('H'), 'H');
        const S_pt = B(A('S'), 'S');

        x(A_pt, C_pt, true);
        x(A_pt, B_pt);
        x(B_pt, C_pt);

        x(S_pt, A_pt);
        x(S_pt, B_pt);
        x(S_pt, C_pt);

        // Mặt (SAB) nằm ở phía trước-trái, gồm 3 cạnh nhìn thấy SA, SB, AB nét liền
        // Đường cao SH ⊥ AB nằm hoàn toàn trên mặt phẳng nhìn thấy (SAB) nên SH vẽ nét liền
        x(S_pt, H_pt, false, true);
        v('right', [S_pt, H_pt, B_pt]);

        j('pyramid3SidePerp', [A_pt, B_pt, C_pt, S_pt], [[0, 1, 2], [3, 0, 1], [3, 1, 2], [3, 2, 0]]);
        return true;
      }

      // ── HÌNH CHÓP TAM GIÁC ĐỀU (S.ABC) ──
      case 'pyramid3Regular': {
        const A = F(Zo, (oe, W) => {
          const Ax = 0, Ay = 0.87 * oe;
          const Bx = 0.5 * oe, By = 0;
          const Cx = oe, Cy = 0.87 * oe;
          const Hx = (Ax + Bx + Cx) / 3;
          const Hy = (Ay + By + Cy) / 3;
          return {
            A: [Ax, Ay, 0],
            B: [Bx, By, 0],
            C: [Cx, Cy, 0],
            H: [Hx, Hy, 0],
            S: [Hx, Hy, W]
          };
        });
        const E = B(A('A'), 'A');
        const T = B(A('B'), 'B');
        const P = B(A('C'), 'C');
        const U = B(A('H'), 'H');
        const ne = B(A('S'), 'S');
        const M_pt = g({ t: 'mid', a: E, b: P }, 'M');

        x(E, P, true);
        x(E, T);
        x(T, P);

        x(ne, E);
        x(ne, T);
        x(ne, P);

        x(ne, U, true, true);
        x(T, M_pt, true, true);

        v('right', [ne, U, T], { aux: true });
        j('pyramid3Regular', [E, T, P, ne], [[0, 1, 2], [3, 0, 1], [3, 1, 2], [3, 2, 0]]);
        return true;
      }

      // ── TỨ DIỆN ĐỀU (A.BCD - 4 MẶT TAM GIÁC ĐỀU BẰNG NHAU) ──
      case 'tetrahedronRegular': {
        const A = F(Zo, (oe, W) => {
          const Bx = 0, By = 0.87 * oe;
          const Cx = 0.5 * oe, Cy = 0;
          const Dx = oe, Dy = 0.87 * oe;
          const Hx = (Bx + Cx + Dx) / 3;
          const Hy = (By + Cy + Dy) / 3;
          const h = Math.min(W > 20 ? W : oe, 0.816 * oe);
          return {
            B: [Bx, By, 0],
            C: [Cx, Cy, 0],
            D: [Dx, Dy, 0],
            H: [Hx, Hy, 0],
            A: [Hx, Hy, h]
          };
        });
        const B_pt = B(A('B'), 'B');
        const C_pt = B(A('C'), 'C');
        const D_pt = B(A('D'), 'D');
        const H_pt = B(A('H'), 'H');
        const A_pt = B(A('A'), 'A');
        const M_pt = g({ t: 'mid', a: B_pt, b: D_pt }, 'M');

        x(B_pt, D_pt, true);
        x(B_pt, C_pt);
        x(C_pt, D_pt);

        x(A_pt, B_pt);
        x(A_pt, C_pt);
        x(A_pt, D_pt);

        x(A_pt, H_pt, true, true);
        x(C_pt, M_pt, true, true);

        v('right', [A_pt, H_pt, C_pt], { aux: true });

        j('tetrahedronRegular', [B_pt, C_pt, D_pt, A_pt], [[0, 1, 2], [3, 0, 1], [3, 1, 2], [3, 2, 0]]);
        return true;
      }

      // ── TAM DIỆN VUÔNG (3 GÓC VUÔNG TẠI O) ──
      case 'tetrahedronPerp': {
        const A = F(Zo, (oe, W) => ({
          O: [0, oe, 0],
          A: [oe, oe, 0],
          B: [0, 0, 0],
          S: [0, oe, W]
        }));
        const O_pt = B(A('O'), 'O');
        const A_pt = B(A('A'), 'A');
        const B_pt = B(A('B'), 'B');
        const S_pt = B(A('S'), 'S');

        x(O_pt, A_pt, true);
        x(O_pt, B_pt, true);
        x(O_pt, S_pt, true);

        x(A_pt, B_pt);
        x(B_pt, S_pt);
        x(S_pt, A_pt);

        v('right', [A_pt, O_pt, B_pt], { aux: true });
        v('right', [B_pt, O_pt, S_pt], { aux: true });
        v('right', [S_pt, O_pt, A_pt], { aux: true });

        j('tetrahedronPerp', [O_pt, A_pt, B_pt, S_pt], [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]]);
        return true;
      }

      // ── CHÓP ĐÁY HÌNH THANG VUÔNG (SA ⊥ ĐÁY, AD = 2BC) ──
      case 'pyramidTrapezoid': {
        const A = F(Zo, (oe, W) => ({
          A: [0, oe, 0],
          B: [0, 0, 0],
          C: [0.5 * oe, 0, 0],
          D: [oe, oe, 0],
          S: [0, oe, W]
        }));
        const A_pt = B(A('A'), 'A');
        const B_pt = B(A('B'), 'B');
        const C_pt = B(A('C'), 'C');
        const D_pt = B(A('D'), 'D');
        const S_pt = B(A('S'), 'S');

        x(A_pt, B_pt, true);
        x(A_pt, D_pt, true);
        x(B_pt, C_pt);
        x(C_pt, D_pt);

        x(S_pt, A_pt, true);
        x(S_pt, B_pt);
        x(S_pt, C_pt);
        x(S_pt, D_pt);

        v('right', [S_pt, A_pt, B_pt], { aux: true });
        v('right', [S_pt, A_pt, D_pt], { aux: true });
        v('right', [D_pt, A_pt, B_pt], { aux: true });
        v('right', [A_pt, B_pt, C_pt], { aux: true });

        j('pyramidTrapezoid', [A_pt, B_pt, C_pt, D_pt, S_pt], [[0, 1, 2, 3], [4, 0, 1], [4, 1, 2], [4, 2, 3], [4, 3, 0]]);
        return true;
      }

      // ── CHÓP CỤT TAM GIÁC ĐỀU ──
      case 'frustumPyramid3': {
        const E = F(Zo, (se, we) => {
          const Ee = [se / 2, 0.58 * se, we / 0.5];
          const Ie = pt => [pt[0] + 0.45 * (Ee[0] - pt[0]), pt[1] + 0.45 * (Ee[1] - pt[1]), pt[2] + 0.45 * (Ee[2] - pt[2])];
          const ptA = [0, 0.87 * se, 0], ptB = [0.5 * se, 0, 0], ptC = [se, 0.87 * se, 0];
          return {
            A: ptA,
            B: ptB,
            C: ptC,
            A1: Ie(ptA),
            B1: Ie(ptB),
            C1: Ie(ptC)
          };
        });
        const A_pt = B(E('A'), 'A');
        const B_pt = B(E('B'), 'B');
        const C_pt = B(E('C'), 'C');
        const A1_pt = B(E('A1'), "A'");
        const B1_pt = B(E('B1'), "B'");
        const C1_pt = B(E('C1'), "C'");

        x(A_pt, C_pt, true);
        x(A_pt, B_pt);
        x(B_pt, C_pt);

        x(A1_pt, B1_pt);
        x(B1_pt, C1_pt);
        x(C1_pt, A1_pt);

        // AA' là đường biên ngoài cùng bên trái (silhouette boundary) nên vẽ nét liền
        x(A_pt, A1_pt);
        x(B_pt, B1_pt);
        x(C_pt, C1_pt);

        j('frustumPyramid3', [A_pt, B_pt, C_pt, A1_pt, B1_pt, C1_pt], [[0, 1, 2], [3, 4, 5], [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5]]);
        return true;
      }

      // ── LĂNG TRỤ TAM GIÁC ĐỀU ──
      case 'prism3Regular': {
        const A = F(Zo, (oe, W) => ({
          A: [0, 0.87 * oe, 0],
          B: [0.5 * oe, 0, 0],
          C: [oe, 0.87 * oe, 0],
          A1: [0, 0.87 * oe, W],
          B1: [0.5 * oe, 0, W],
          C1: [oe, 0.87 * oe, W]
        }));
        const E = B(A('A'), 'A');
        const T = B(A('B'), 'B');
        const P = B(A('C'), 'C');
        const V = B(A('A1'), "A'");
        const U = B(A('B1'), "B'");
        const ne = B(A('C1'), "C'");

        x(E, T);
        x(T, P);
        x(E, P, true);

        x(V, U);
        x(U, ne);
        x(ne, V);

        // AA' là đường viền ngoài bên trái nên vẽ nét liền (giống lăng trụ xiên obliquePrism)
        x(E, V);
        x(T, U);
        x(P, ne);

        v('right', [V, E, T], { aux: true });

        j('prism3Regular', [E, T, P, V, U, ne], Rk || [[0, 1, 2], [3, 4, 5], [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5]]);
        return true;
      }

      // ── LĂNG TRỤ ĐỨNG TỨ GIÁC ──
      case 'prism4': {
        const A = F(Zo, (oe, W) => ({
          A: [0, 0.8 * oe, 0],
          B: [0, 0, 0],
          C: [oe, 0, 0],
          D: [oe, 0.8 * oe, 0],
          A1: [0, 0.8 * oe, W],
          B1: [0, 0, W],
          C1: [oe, 0, W],
          D1: [oe, 0.8 * oe, W]
        }));
        const E = B(A('A'), 'A');
        const T = B(A('B'), 'B');
        const V = B(A('C'), 'C');
        const P = B(A('D'), 'D');
        const U = B(A('A1'), "A'");
        const ne = B(A('B1'), "B'");
        const oe = B(A('C1'), "C'");
        const W = B(A('D1'), "D'");

        x(E, T, true);
        x(E, P, true);
        x(T, V);
        x(V, P);

        x(U, ne);
        x(ne, oe);
        x(oe, W);
        x(W, U);

        x(E, U, true);
        x(T, ne);
        x(V, oe);
        x(P, W);

        v('right', [U, E, T], { aux: true });
        j('prism4', [E, T, V, P, U, ne, oe, W], K2);
        return true;
      }

      // ── LĂNG TRỤ LỤC GIÁC ĐỀU ──
      case 'prism6': {
        const A = F(Zo, (oe, W) => {
          const cx = oe / 2, cy = oe / 2, r = oe / 2;
          const pts = {};
          for (let i = 0; i < 6; i++) {
            const ang = (i * 60 + 30) * Math.PI / 180;
            pts['P' + i] = [cx + r * Math.cos(ang), cy + r * Math.sin(ang), 0];
            pts['T' + i] = [cx + r * Math.cos(ang), cy + r * Math.sin(ang), W];
          }
          return pts;
        });
        const bot = [0, 1, 2, 3, 4, 5].map(i => B(A('P' + i), String.fromCharCode(65 + i)));
        const top = [0, 1, 2, 3, 4, 5].map(i => B(A('T' + i), String.fromCharCode(65 + i) + "'"));

        for (let i = 0; i < 6; i++) x(top[i], top[(i + 1) % 6]);
        for (let i = 0; i < 6; i++) {
          // Đáy dưới: Cạnh phía sau AB (0), BC (1), CD (2) nét đứt; Cạnh phía trước DE (3), EF (4), FA (5) nét liền
          const isBaseH = (i === 0 || i === 1 || i === 2);
          x(bot[i], bot[(i + 1) % 6], isBaseH);
          // Cạnh bên: Cạnh phía sau BB' (1), CC' (2) nét đứt; AA' (0) và DD' (3) là biên (nét liền), EE' (4) và FF' (5) phía trước (nét liền)
          const isVertH = (i === 1 || i === 2);
          x(bot[i], top[i], isVertH);
        }
        // Định nghĩa 8 mặt của lăng trụ lục giác (2 đáy + 6 mặt bên) để xoay 3D và tô màu mặt phẳng hoạt động chính xác
        const hexFaces = [
          [0, 5, 4, 3, 2, 1],
          [6, 7, 8, 9, 10, 11]
        ];
        for (let i = 0; i < 6; i++) {
          hexFaces.push([i, (i + 1) % 6, 6 + (i + 1) % 6, 6 + i]);
        }
        j('prism6', [...bot, ...top], hexFaces);
        return true;
      }

      default:
        return false;
    }
  }

  // 3. Xuất đối tượng Global
  window.CustomSolids = {
    definitions: SOLID_DEFINITIONS,
    isCustomSolid: function (id) {
      return SOLID_DEFINITIONS.some(s => s.id === id);
    },
    createCustomSolid: createCustomSolid
  };

  console.log('[Module] CustomSolids loaded successfully with', SOLID_DEFINITIONS.length, '3D shapes.');
})(window);
