/**
 * =======================================================================
 * CUSTOM SOLIDS MODULE (Study Note AI)
 * Tách riêng logic toán học và tạo các hình học trong không gian (3D Shapes)
 * Dễ dàng thêm hình mới (chóp, lăng trụ, đa diện) chỉ trong 1 file nhỏ.
 * =======================================================================
 */
(function(window) {
  'use strict';

  // 1. Danh sách các hình học không gian bổ sung
  const SOLID_DEFINITIONS = [
    { id: 'cube', nameVi: 'Hình lập phương', nameEn: 'Cube', group: 'prisms' },
    { id: 'pyramid4Perp', nameVi: 'Chóp tứ giác (SA ⊥ đáy)', nameEn: 'Pyramid (SA ⊥ base)', group: 'pyramids' },
    { id: 'pyramid3Perp', nameVi: 'Chóp tam giác (SA ⊥ đáy)', nameEn: 'Triangular pyramid (SA ⊥ base)', group: 'pyramids' },
    { id: 'pyramid3Regular', nameVi: 'Chóp tam giác đều (S.ABC)', nameEn: 'Regular triangular pyramid', group: 'pyramids' },
    { id: 'prism4', nameVi: 'Lăng trụ đứng tứ giác', nameEn: 'Right quadrangular prism', group: 'prisms' },
    { id: 'prism6', nameVi: 'Lăng trụ lục giác đều', nameEn: 'Hexagonal prism', group: 'prisms' },
    { id: 'tetrahedronPerp', nameVi: 'Tam diện vuông (O.ABC)', nameEn: 'Trirectangular tetrahedron', group: 'pyramids' }
  ];

  // 2. Hàm khởi tạo các điểm & đoạn thẳng của hình không gian
  function createCustomSolid(shapeId, ctx) {
    const { F, Zo, B, g, x, v, j, K2 } = ctx;

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

        // Cạnh đáy: AC ở phía sau là nét đứt, AB và BC ở trước là nét liền
        x(E, P, true);
        x(E, T);
        x(T, P);

        // Cạnh bên: SA là mép ngoài cùng bên trái => BẮT BUỘC LÀ NÉT LIỀN
        x(ne, E);
        x(ne, T);
        x(ne, P);

        // Ký hiệu góc vuông SA ⊥ AB (mặt trước) và SA ⊥ AC (mặt sau)
        v('right', [ne, E, T]);
        v('right', [ne, E, P], { aux: true });

        j('pyramid3Perp', [E, T, P, ne], [[0, 1, 2], [3, 0, 1], [3, 1, 2], [3, 2, 0]]);
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
          const isH = (i === 0 || i === 1 || i === 5);
          x(bot[i], bot[(i + 1) % 6], isH);
          x(bot[i], top[i], isH);
        }
        j('prism6', [...bot, ...top]);
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

      default:
        return false;
    }
  }

  // 3. Xuất đối tượng Global
  window.CustomSolids = {
    definitions: SOLID_DEFINITIONS,
    isCustomSolid: function(id) {
      return SOLID_DEFINITIONS.some(s => s.id === id);
    },
    createCustomSolid: createCustomSolid
  };

  console.log('[Module] CustomSolids loaded successfully with', SOLID_DEFINITIONS.length, '3D shapes.');
})(window);
