/**
 * =======================================================================
 * 🔄 GROUP 3D & SHAPE 3D ROTATION MODULE (Study Note AI)
 * Tự động gắn kết và tính toạ độ 3D chuẩn xác 100% cho mọi hình vẽ thêm
 * (đoạn thẳng, điểm, đường cao, trung điểm, trọng tâm, thiết diện...)
 * trên khối không gian, giúp khi xoay 3D mọi chi tiết đều xoay đồng bộ,
 * chuẩn xác tuyệt đối không bị sai lệch hay đứng yên!
 * =======================================================================
 */
(function(window) {
  'use strict';

  const uf = 0.5 * Math.SQRT1_2;
  const Zo = [1, uf, 0, 0, -uf, -1, -uf, 1, -uf]; // Ma trận chiếu SGK Toán 12
  const Cp = [1, 0, 0, 0, 1, 0, 0, 0, 1];         // Ma trận đơn vị (Identity)

  // 3x3 Matrix Inversion
  function o4(e) {
    const [t, n, r, i, o, s, l, c, h] = e,
          d = o * h - s * c,
          p = -(i * h - s * l),
          g = i * c - o * l,
          v = 1 / (t * d + n * p + r * g);
    return [
      d * v, -(n * h - r * c) * v, (n * s - r * o) * v,
      p * v, (t * h - r * l) * v, -(t * s - r * i) * v,
      g * v, -(t * c - n * l) * v, (t * o - n * i) * v
    ];
  }

  // 3x3 Matrix * 3x1 Vector
  function wo(e, t) {
    return [
      e[0] * t[0] + e[1] * t[1] + e[2] * t[2],
      e[3] * t[0] + e[4] * t[1] + e[5] * t[2],
      e[6] * t[0] + e[7] * t[1] + e[8] * t[2]
    ];
  }

  function distSq(p1, p2) {
    if (!p1 || !p2) return Infinity;
    const dx = p1.x - p2.x, dy = p1.y - p2.y;
    return dx * dx + dy * dy;
  }

  // Tính tỉ số hình chiếu k của điểm P trên đoạn thẳng AB
  function getProjectionRatio(P, A, B) {
    if (!P || !A || !B) return { k: 0, distSq: Infinity };
    const dx = B.x - A.x, dy = B.y - A.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq < 1e-6) return { k: 0, distSq: distSq(P, A) };
    const k = ((P.x - A.x) * dx + (P.y - A.y) * dy) / lenSq;
    const projX = A.x + k * dx, projY = A.y + k * dy;
    const dSq = (P.x - projX) * (P.x - projX) + (P.y - projY) * (P.y - projY);
    return { k, distSq: dSq };
  }

  // Kiểm tra điểm P có nằm trong đa giác không
  function isPointInsidePolygon(P, poly) {
    if (!P || !poly || poly.length < 3) return false;
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x, yi = poly[i].y;
      const xj = poly[j].x, yj = poly[j].y;
      const intersect = ((yi > P.y) !== (yj > P.y)) &&
        (P.x < (xj - xi) * (P.y - yi) / (yj - yi + 1e-12) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  // Tính toạ độ trọng tâm tam giác (Barycentric coordinates)
  function getBarycentricCoords(P, A, B, C) {
    if (!P || !A || !B || !C) return null;
    const v0x = C.x - A.x, v0y = C.y - A.y;
    const v1x = B.x - A.x, v1y = B.y - A.y;
    const v2x = P.x - A.x, v2y = P.y - A.y;

    const dot00 = v0x * v0x + v0y * v0y;
    const dot01 = v0x * v1x + v0y * v1y;
    const dot02 = v0x * v2x + v0y * v2y;
    const dot11 = v1x * v1x + v1y * v1y;
    const dot12 = v1x * v2x + v1y * v2y;

    const denom = dot00 * dot11 - dot01 * dot01;
    if (Math.abs(denom) < 1e-6) return null;
    const u = (dot11 * dot02 - dot01 * dot12) / denom;
    const v = (dot00 * dot12 - dot01 * dot02) / denom;
    if (u >= -0.05 && v >= -0.05 && (u + v) <= 1.05) {
      return { u: 1 - u - v, v: v, w: u };
    }
    return null;
  }

  /**
   * Tính toán toạ độ 2D của các điểm (Point Map)
   */
  function getPointMap(geo) {
    const map = new Map();
    if (!geo || !geo.points) return map;

    // First pass: free points or points with x, y
    for (const [id, pt] of Object.entries(geo.points)) {
      if (pt && pt.def && pt.def.x != null && pt.def.y != null) {
        map.set(id, { x: pt.def.x, y: pt.def.y });
      } else if (pt && pt.x != null && pt.y != null) {
        map.set(id, { x: pt.x, y: pt.y });
      }
    }

    // Second pass: derived points (mid, on, sum, etc.)
    for (let iter = 0; iter < 6; iter++) {
      for (const [id, pt] of Object.entries(geo.points)) {
        if (!pt || !pt.def || map.has(id)) continue;
        const def = pt.def;
        if (def.t === 'mid') {
          const pA = map.get(def.a), pB = map.get(def.b);
          if (pA && pB) map.set(id, { x: (pA.x + pB.x) / 2, y: (pA.y + pB.y) / 2 });
        } else if (def.t === 'on') {
          const pA = map.get(def.a), pB = map.get(def.b);
          if (pA && pB) {
            const k = def.k ?? 0.5;
            map.set(id, { x: pA.x + k * (pB.x - pA.x), y: pA.y + k * (pB.y - pA.y) });
          }
        } else if (def.t === 'sum') {
          const pA = map.get(def.a), pB = map.get(def.b), pC = map.get(def.c);
          if (pA && pB && pC) {
            map.set(id, { x: pA.x + pB.x - pC.x, y: pA.y + pB.y - pC.y });
          }
        } else if (def.t === 'inter') {
          if (def.l1 && def.l2) {
            const pA = map.get(def.l1[0]), pB = map.get(def.l1[1]);
            const pC = map.get(def.l2[0]), pD = map.get(def.l2[1]);
            if (pA && pB && pC && pD) {
              const dx1 = pB.x - pA.x, dy1 = pB.y - pA.y;
              const dx2 = pD.x - pC.x, dy2 = pD.y - pC.y;
              const denom = dx1 * dy2 - dy1 * dx2;
              if (Math.abs(denom) > 1e-9) {
                const t = ((pC.x - pA.x) * dy2 - (pC.y - pA.y) * dx2) / denom;
                map.set(id, { x: pA.x + t * dx1, y: pA.y + t * dy1 });
              }
            }
          }
        }
      }
    }
    return map;
  }
  window.getPointMap = getPointMap;

  /**
   * Trích xuất các mặt (faces) của khối đa diện
   */
  function getSolidFaces(sol, pMap) {
    const faces = [];
    if (!sol || !sol.pts || !sol.pts.length) return faces;

    if (sol.solid && sol.solid.faces) {
      sol.solid.faces.forEach(f => {
        const ptIds = f.map(idx => (typeof idx === 'number' ? sol.pts[idx] : idx)).filter(Boolean);
        if (ptIds.length >= 3) faces.push(ptIds);
      });
      if (faces.length) return faces;
    }

    // Heuristic cho hình chóp / lăng trụ
    const pts = sol.pts.map(id => ({ id, p: pMap.get(id) })).filter(item => item.p);
    if (pts.length < 4) return faces;

    // Tìm đỉnh S (y nhỏ nhất / ở trên cùng)
    const sortedY = [...pts].sort((a, b) => a.p.y - b.p.y);
    const apex = sortedY[0];
    const basePts = pts.filter(p => p.id !== apex.id);

    // Mặt đáy
    if (basePts.length >= 3) {
      faces.push(basePts.map(p => p.id));
      // Các mặt bên tam giác (S, Vi, Vi+1)
      for (let i = 0; i < basePts.length; i++) {
        const next = (i + 1) % basePts.length;
        faces.push([apex.id, basePts[i].id, basePts[next].id]);
      }
    }
    return faces;
  }

  /**
   * Trích xuất các cạnh (edges) của khối đa diện
   */
  function getSolidEdges(sol, faces, geoShapes) {
    const edges = [];
    const edgeSet = new Set();
    const addEdge = (id1, id2) => {
      if (!id1 || !id2 || id1 === id2) return;
      const key = id1 < id2 ? `${id1}_${id2}` : `${id2}_${id1}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push([id1, id2]);
      }
    };

    // Từ faces
    faces.forEach(f => {
      for (let i = 0; i < f.length; i++) {
        addEdge(f[i], f[(i + 1) % f.length]);
      }
    });

    // Từ geo.shapes thuộc solid
    if (geoShapes && sol.group) {
      geoShapes.forEach(s => {
        if (s.kind === 'segment' && s.pts && s.pts.length >= 2) {
          if (s.group === sol.group || (sol.pts.includes(s.pts[0]) && sol.pts.includes(s.pts[1]))) {
            addEdge(s.pts[0], s.pts[1]);
          }
        }
      });
    }

    return edges;
  }

  /**
   * 🌟 CORE: TỰ ĐỘNG GẮN KẾT & TÍNH TOẠ ĐỘ 3D CHUẨN XÁC CHO MỌI HÌNH VẼ THÊM
   * Giúp khi xoay 3D, toàn bộ các đoạn thẳng, điểm, thiết diện, đường cao...
   * vẽ thêm đều xoay chính xác tuyệt đối trong không gian!
   */
  function attachDrawnElementsToSolid(board, pageIdx, targetSolid) {
    if (!board || !board.doc || !board.doc.pages) return null;
    const pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return null;
    const geo = pg.geo;

    // 1. Tìm solid đích
    let sol = null;
    if (targetSolid && targetSolid.id) {
      sol = geo.shapes.find(s => s.id === targetSolid.id);
    }
    if (!sol) {
      sol = geo.shapes.find(s => s.kind === 'solid' && s.solid && !s.hidden);
    }
    if (!sol) {
      sol = geo.shapes.find(s => s.kind === 'solid' && s.solid);
    }
    if (!sol || !sol.pts || sol.pts.length < 2) return null;

    const groupId = sol.group || ('grp_3d_' + Date.now());
    const pMap = getPointMap(geo);

    // 2. Thu thập các điểm và cạnh đã có của solid
    const knownPts = new Set(sol.pts);
    const faces = getSolidFaces(sol, pMap);
    const edges = getSolidEdges(sol, faces, geo.shapes);

    // Xác định toạ độ Z của các điểm đã có trong solid
    const zMap = new Map();
    sol.pts.forEach(pid => {
      const pt = geo.points[pid];
      if (pt && pt.z !== undefined && Number.isFinite(pt.z)) {
        zMap.set(pid, pt.z);
      }
    });

    // 3. BFS Tìm tất cả shapes và points được vẽ thêm kết nối với khối
    const attachedPtIds = new Set(sol.pts);
    const attachedShapeIds = new Set();

    // Điểm đã thuộc group của khối và đã có toạ độ Z hợp lệ thì luôn bảo toàn toạ độ Z, không chiếu lại 2D
    Object.keys(geo.points).forEach(pid => {
      const pt = geo.points[pid];
      if (pt && pt.group === groupId && pt.z !== undefined && Number.isFinite(pt.z)) {
        zMap.set(pid, pt.z);
        attachedPtIds.add(pid);
      }
    });

    // Nếu chưa có Z nào, ước lượng chuẩn hình học SGK
    if (zMap.size === 0) {
      const pts2D = sol.pts.map(pid => pMap.get(pid)).filter(Boolean);
      const minY = pts2D.length ? Math.min(...pts2D.map(p => p.y)) : 0;
      const maxY = pts2D.length ? Math.max(...pts2D.map(p => p.y)) : 0;
      const height = Math.max(30, maxY - minY);

      sol.pts.forEach(pid => {
        const p2D = pMap.get(pid);
        if (p2D && p2D.y <= minY + height * 0.15) {
          zMap.set(pid, height * 0.85); // Đỉnh
        } else {
          zMap.set(pid, 0);             // Mặt đáy
        }
      });
    } else if (zMap.size < sol.pts.length) {
      const allZVals = Array.from(zMap.values());
      const fallbackZ = allZVals.reduce((a, b) => a + b, 0) / allZVals.length;
      sol.pts.forEach(pid => {
        if (!zMap.has(pid)) zMap.set(pid, fallbackZ);
      });
    }

    const allZ = Array.from(zMap.values());
    const minZ = allZ.length ? Math.min(...allZ) : 0;
    const maxZ = allZ.length ? Math.max(...allZ) : 100;
    const avgZ = allZ.length ? allZ.reduce((a, b) => a + b, 0) / allZ.length : 0;

    let changed = true;
    while (changed) {
      changed = false;
      // Quét các shape kết nối với bất kỳ điểm nào đã thuộc solid
      geo.shapes.forEach(sh => {
        if (sh.id === sol.id) return;
        const shPts = sh.pts || (sh.a && sh.b ? [sh.a, sh.b] : []);
        if (!shPts.length) return;

        const connects = shPts.some(pid => attachedPtIds.has(pid));
        if (connects) {
          if (!attachedShapeIds.has(sh.id)) {
            attachedShapeIds.add(sh.id);
            changed = true;
          }
          shPts.forEach(pid => {
            if (!attachedPtIds.has(pid)) {
              attachedPtIds.add(pid);
              changed = true;
              const pt = geo.points[pid];
              if (pt && pt.z !== undefined && Number.isFinite(pt.z)) {
                zMap.set(pid, pt.z);
              }
            }
          });
        }
      });
    }

    // Quét thêm các điểm nằm trên các cạnh hoặc mặt của khối hoặc phụ thuộc (on, mid)
    Object.keys(geo.points).forEach(pid => {
      if (attachedPtIds.has(pid) || zMap.has(pid)) return;
      const pt = geo.points[pid];
      if (!pt) return;
      if (pt.z !== undefined && Number.isFinite(pt.z)) {
        zMap.set(pid, pt.z);
        return;
      }
      const P = pMap.get(pid);

      // Điểm phụ thuộc 'on' (nằm trên đoạn thẳng giữa 2 đỉnh đã có)
      if (pt.def && pt.def.t === 'on' && pt.def.a && pt.def.b && zMap.has(pt.def.a) && zMap.has(pt.def.b)) {
        attachedPtIds.add(pid);
        const zA = zMap.get(pt.def.a), zB = zMap.get(pt.def.b);
        const k = Number.isFinite(pt.def.k) ? pt.def.k : 0.5;
        zMap.set(pid, (1 - k) * zA + k * zB);
        return;
      }

      // Điểm phụ thuộc 'mid' (trung điểm)
      if (pt.def && pt.def.t === 'mid' && pt.def.a && pt.def.b && zMap.has(pt.def.a) && zMap.has(pt.def.b)) {
        attachedPtIds.add(pid);
        const zA = zMap.get(pt.def.a), zB = zMap.get(pt.def.b);
        zMap.set(pid, 0.5 * zA + 0.5 * zB);
        return;
      }

      if (!P) return;

      // Kiểm tra xem P có nằm trên cạnh nào của solid không (< 8px)
      for (const [idA, idB] of edges) {
        const pA = pMap.get(idA), pB = pMap.get(idB);
        if (pA && pB) {
          const { k, distSq: dSq } = getProjectionRatio(P, pA, pB);
          if (dSq <= 64 && k >= -0.05 && k <= 1.05) {
            attachedPtIds.add(pid);
            const zA = zMap.get(idA) ?? minZ, zB = zMap.get(idB) ?? minZ;
            zMap.set(pid, (1 - k) * zA + k * zB);
            return;
          }
        }
      }

      // Kiểm tra xem P có nằm trong mặt nào của solid không (tam giác hoặc đa giác)
      for (const face of faces) {
        const poly = face.map(id => pMap.get(id)).filter(Boolean);
        if (poly.length >= 3) {
          // Triangulate đa giác thành các tam giác (0, i, i+1)
          for (let i = 1; i < poly.length - 1; i++) {
            const b = getBarycentricCoords(P, poly[0], poly[i], poly[i + 1]);
            if (b && b.u >= -0.02 && b.v >= -0.02 && b.w >= -0.02) {
              attachedPtIds.add(pid);
              const z0 = zMap.get(face[0]) ?? minZ;
              const zi = zMap.get(face[i]) ?? minZ;
              const zi1 = zMap.get(face[i + 1]) ?? minZ;
              zMap.set(pid, b.u * z0 + b.v * zi + b.w * zi1);
              return;
            }
          }
        }
      }
    });

    // Quét lại các shape nối các điểm vừa được đính kèm
    geo.shapes.forEach(sh => {
      if (sh.id === sol.id) return;
      const shPts = sh.pts || (sh.a && sh.b ? [sh.a, sh.b] : []);
      if (shPts.length >= 2 && shPts.every(pid => attachedPtIds.has(pid))) {
        attachedShapeIds.add(sh.id);
      }
    });

    // 4. Tính toán toạ độ Z cho tất cả các điểm đính kèm còn thiếu
    attachedPtIds.forEach(pid => {
      if (zMap.has(pid)) return;
      const P = pMap.get(pid);
      if (!P) {
        zMap.set(pid, avgZ);
        return;
      }

      // Thử nội suy theo cạnh gần nhất
      let interpolated = false;
      for (const [idA, idB] of edges) {
        const pA = pMap.get(idA), pB = pMap.get(idB);
        if (pA && pB) {
          const { k, distSq: dSq } = getProjectionRatio(P, pA, pB);
          if (dSq <= 144) {
            const zA = zMap.get(idA) ?? minZ, zB = zMap.get(idB) ?? minZ;
            zMap.set(pid, (1 - k) * zA + k * zB);
            interpolated = true;
            break;
          }
        }
      }

      if (!interpolated) {
        // Nội suy theo chiều cao Y tương đối giữa đáy và đỉnh
        const pts2D = sol.pts.map(id => pMap.get(id)).filter(Boolean);
        const minY = pts2D.length ? Math.min(...pts2D.map(p => p.y)) : 0;
        const maxY = pts2D.length ? Math.max(...pts2D.map(p => p.y)) : 0;
        const h = Math.max(1, maxY - minY);
        const t = Math.max(0, Math.min(1, (maxY - P.y) / h));
        zMap.set(pid, minZ + t * (maxZ - minZ));
      }
    });

    // 5. Cập nhật dữ liệu points và shapes vào trang
    const newPoints = { ...geo.points };
    let hasPointUpdate = false;

    attachedPtIds.forEach(pid => {
      const pt = newPoints[pid];
      if (pt) {
        const currentZ = pt.z;
        const targetZ = zMap.get(pid) ?? 0;
        const needGroup = pt.group !== groupId;
        const needZ = currentZ === undefined || !Number.isFinite(currentZ) || Math.abs(currentZ - targetZ) > 1e-4;
        if (needGroup || needZ) {
          newPoints[pid] = { ...pt, group: groupId, z: targetZ };
          hasPointUpdate = true;
        }
      }
    });

    let hasShapeUpdate = false;
    const newShapes = geo.shapes.map(sh => {
      if (attachedShapeIds.has(sh.id) && sh.group !== groupId) {
        hasShapeUpdate = true;
        return { ...sh, group: groupId };
      }
      return sh;
    });

    // ĐẢM BẢO sol.pts KHÔNG BỊ THAY ĐỔI, chỉ cập nhật group nếu cần
    let updatedSolid = sol;
    if (sol.group !== groupId) {
      updatedSolid = {
        ...sol,
        group: groupId
      };
      const solIdx = newShapes.findIndex(s => s.id === sol.id);
      if (solIdx !== -1) newShapes[solIdx] = updatedSolid;
      hasShapeUpdate = true;
    }

    if (hasPointUpdate || hasShapeUpdate) {
      if (board.sel) {
        if (!board.sel.points) board.sel.points = new Set();
        if (!board.sel.shapes) board.sel.shapes = new Set();
        if (!board.sel.strokes) board.sel.strokes = new Set();
        if (!board.sel.items) board.sel.items = new Set();
      }
      board.commit(board.updatePage(pageIdx, P => ({
        ...P,
        geo: { ...P.geo, points: newPoints, shapes: newShapes }
      })));
      console.log('[Group3D] Đã tự động gắn kết', attachedPtIds.size - sol.pts.length, 'điểm và', attachedShapeIds.size, 'hình vẽ thêm vào khối 3D!');
    }

    return { page: pageIdx, id: updatedSolid.id, group: groupId };
  }

  function canTurnSelection(board) {
    if (!board || !board.sel) return false;
    const sel = board.sel;
    const pg = board.doc.pages[sel.page];
    if (!pg || !pg.geo) return false;

    // 1. Nếu đã có sẵn solid đơn lẻ
    if (board._origSelectedSolid && board._origSelectedSolid.call(board)) return true;

    // 2. Nếu có ít nhất 1 shape hoặc 3 điểm được chọn
    if (sel.shapes && sel.shapes.size > 0) return true;
    if (sel.points && sel.points.size >= 3) return true;

    return false;
  }

  /**
   * Kiểm tra xem selection có phải là nhóm hình không
   */
  function isGroupSelection(board) {
    if (!board || !board.sel) return false;
    const sel = board.sel;
    const pg = board.doc.pages[sel.page];
    if (!pg || !pg.geo) return false;

    if (sel.shapes && sel.shapes.size > 1) return true;
    if (sel.points && sel.points.size > 3) return true;

    if (sel.shapes && sel.shapes.size === 1) {
      const [sid] = sel.shapes;
      const sh = pg.geo.shapes.find(s => s.id === sid);
      if (sh && sh.group) {
        const inGrp = pg.geo.shapes.filter(s => s.group === sh.group && !s.hidden);
        if (inGrp.length > 1) return true;
      }
    }
    return false;
  }

  /**
   * Chuẩn bị dữ liệu 3D cho nhóm hình để sẵn sàng xoay 3D
   */
  function prepareGroup3D(board, sel) {
    if (!board || !sel) return null;
    const pg = board.doc.pages[sel.page];
    if (!pg || !pg.geo) return null;
    const geo = pg.geo;

    const selShapes = geo.shapes.filter(s => sel.shapes.has(s.id));
    const ptIdSet = new Set(sel.points || []);
    selShapes.forEach(s => (s.pts || []).forEach(pid => ptIdSet.add(pid)));
    const ptIds = Array.from(ptIdSet);

    if (ptIds.length < 2) return null;

    // Nếu đã có sẵn solid trong selection, dùng hàm attachDrawnElementsToSolid cực chuẩn
    let existingSolid = selShapes.find(s => s.kind === 'solid' && s.solid) ||
                        geo.shapes.find(s => s.kind === 'solid' && s.solid && (s.group && selShapes.some(x => x.group === s.group)));

    if (existingSolid) {
      return attachDrawnElementsToSolid(board, sel.page, existingSolid);
    }

    let groupId = selShapes.find(s => s.group)?.group || ('grp_3d_' + Date.now());
    const pMap = getPointMap(geo);
    const pts2D = ptIds.map(pid => pMap.get(pid)).filter(Boolean);
    const minY = pts2D.length ? Math.min(...pts2D.map(p => p.y)) : 0;
    const maxY = pts2D.length ? Math.max(...pts2D.map(p => p.y)) : 0;
    const height = Math.max(20, maxY - minY);

    const newPoints = { ...geo.points };
    ptIds.forEach(pid => {
      const pt = newPoints[pid];
      if (pt) {
        let zVal = pt.z;
        if (zVal === undefined || !Number.isFinite(zVal)) {
          const p2D = pMap.get(pid);
          if (pts2D.length >= 4 && p2D && p2D.y <= minY + height * 0.15) {
            zVal = height * 0.85;
          } else {
            zVal = 0;
          }
        }
        newPoints[pid] = { ...pt, group: groupId, z: zVal };
      }
    });

    const newShapes = geo.shapes.map(s => {
      if (sel.shapes.has(s.id)) {
        return { ...s, group: groupId };
      }
      return s;
    });

    let groupSolid = newShapes.find(s => s.kind === 'solid' && s.group === groupId);
    if (!groupSolid) {
      const faces = [];
      selShapes.filter(s => s.kind === 'polygon' && s.pts && s.pts.length >= 3).forEach(poly => {
        const fIdx = poly.pts.map(pid => ptIds.indexOf(pid)).filter(i => i !== -1);
        if (fIdx.length >= 3) faces.push(fIdx);
      });

      groupSolid = {
        id: 'solid_' + groupId,
        kind: 'solid',
        pts: ptIds,
        color: '#2563eb',
        width: 1.5,
        group: groupId,
        hidden: true,
        solid: {
          of: 'cube',
          view: Zo,
          turn: Cp,
          isGroup3D: true,
          faces: faces.length ? faces : void 0
        }
      };
      newShapes.push(groupSolid);
    } else {
      const mergedPts = Array.from(new Set([...(groupSolid.pts || []), ...ptIds]));
      groupSolid = {
        ...groupSolid,
        pts: mergedPts,
        group: groupId,
        solid: {
          ...groupSolid.solid,
          view: groupSolid.solid.view || Zo,
          turn: groupSolid.solid.turn || Cp
        }
      };
      const gIdx = newShapes.findIndex(s => s.id === groupSolid.id);
      if (gIdx !== -1) newShapes[gIdx] = groupSolid;
    }

    board.commit(board.updatePage(sel.page, P => ({
      ...P,
      geo: { ...P.geo, points: newPoints, shapes: newShapes }
    })));

    return { page: sel.page, id: groupSolid.id, isGroup: true };
  }

  /**
   * Nhóm các hình đã chọn thành một khối 3D
   */
  function groupSelection(board) {
    if (!board || !board.sel) return;
    const res = prepareGroup3D(board, board.sel);
    if (!res) return;

    const pg = board.doc.pages[board.sel.page];
    const groupSolid = pg.geo.shapes.find(s => s.id === res.id);
    if (groupSolid) {
      const allGroupShapeIds = new Set(pg.geo.shapes.filter(s => s.group === groupSolid.group && !s.hidden).map(s => s.id));
      board.sel = {
        ...board.sel,
        shapes: allGroupShapeIds,
        points: new Set(groupSolid.pts || [])
      };
      board.redraw();
      board.emit();
      console.log('[Group3D] Đã nhóm thành công các hình thành khối 3D:', groupSolid.group);
    }
  }

  /**
   * Rã nhóm các hình đang chọn
   */
  function ungroupSelection(board) {
    if (!board || !board.sel) return;
    const sel = board.sel;
    const pg = board.doc.pages[sel.page];
    if (!pg || !pg.geo) return;
    const geo = pg.geo;

    const groupIds = new Set();
    geo.shapes.filter(s => sel.shapes.has(s.id) && s.group).forEach(s => groupIds.add(s.group));
    if (!groupIds.size) return;

    const newPoints = { ...geo.points };
    Object.keys(newPoints).forEach(pid => {
      if (groupIds.has(newPoints[pid].group)) {
        const { group, ...rest } = newPoints[pid];
        newPoints[pid] = rest;
      }
    });

    const newShapes = geo.shapes
      .filter(s => !(s.kind === 'solid' && s.solid && s.solid.isGroup3D && groupIds.has(s.group)))
      .map(s => {
        if (groupIds.has(s.group)) {
          const { group, ...rest } = s;
          return rest;
        }
        return s;
      });

    board.commit(board.updatePage(sel.page, P => ({
      ...P,
      geo: { ...P.geo, points: newPoints, shapes: newShapes }
    })));
    board.redraw();
    board.emit();
    console.log('[Group3D] Đã rã nhóm thành công');
  }

  
  /**
   * Đảm bảo solid có cấu trúc faces chuẩn xác để giải thuật yP (paintNet)
   * có thể tách và trải phẳng toàn bộ các mặt của khối 3D ra mặt phẳng 2D!
   */
  function ensureSolidFacesForUnfold(board, pageIdx, sol) {
    if (!sol || !sol.solid) return;
    
    // Nếu đã có sẵn faces hợp lệ, kiểm tra xem có dùng index không
    if (sol.solid.faces && sol.solid.faces.length >= 4) {
      const allNumbers = sol.solid.faces.every(f => f.every(idx => typeof idx === 'number' && idx < sol.pts.length));
      if (allNumbers) return;
    }

    const pg = board.doc.pages[pageIdx];
    const pMap = getPointMap(pg.geo);
    const pts2D = sol.pts.map(id => pMap.get(id)).filter(Boolean);
    if (pts2D.length < 4) return;

    const N = sol.pts.length;

    // Tìm đỉnh S (y nhỏ nhất trong hệ toạ độ màn hình)
    let apexIdx = 0;
    for (let i = 1; i < pts2D.length; i++) {
      if (pts2D[i].y < pts2D[apexIdx].y) apexIdx = i;
    }

    // 1. Hình chóp tứ giác (N = 5: 4 đỉnh đáy + 1 đỉnh S) hoặc tam giác (N = 4: 3 đỉnh đáy + 1 đỉnh S)
    if (N === 5 || N === 4) {
      const baseIndices = [];
      for (let i = 0; i < N; i++) {
        if (i !== apexIdx) baseIndices.push(i);
      }
      const faces = [baseIndices]; // Mặt đáy (root face)
      for (let i = 0; i < baseIndices.length; i++) {
        const next = (i + 1) % baseIndices.length;
        faces.push([apexIdx, baseIndices[i], baseIndices[next]]);
      }
      sol.solid.faces = faces;
      return;
    }

    // 2. Hình lăng trụ tam giác (N = 6: 3 đỉnh đáy dưới + 3 đỉnh đáy trên)
    if (N === 6) {
      const sorted = Array.from({ length: 6 }, (_, i) => i).sort((a, b) => pts2D[a].y - pts2D[b].y);
      const top = sorted.slice(0, 3);
      const bottom = sorted.slice(3, 6);
      sol.solid.faces = [
        [bottom[0], bottom[1], bottom[2]],
        [bottom[0], bottom[1], top[1], top[0]],
        [bottom[1], bottom[2], top[2], top[1]],
        [bottom[2], bottom[0], top[0], top[2]],
        [top[0], top[1], top[2]]
      ];
      return;
    }

    // 3. Hình hộp / lập phương (N = 8: 4 đỉnh đáy dưới + 4 đỉnh đáy trên)
    if (N >= 8) {
      const sorted = Array.from({ length: N }, (_, i) => i).sort((a, b) => pts2D[a].y - pts2D[b].y);
      const top = sorted.slice(0, 4);
      const bottom = sorted.slice(4, 8);
      sol.solid.faces = [
        [bottom[0], bottom[1], bottom[2], bottom[3]],
        [bottom[0], bottom[1], top[1], top[0]],
        [bottom[1], bottom[2], top[2], top[1]],
        [bottom[2], bottom[3], top[3], top[2]],
        [bottom[3], bottom[0], top[0], top[3]],
        [top[0], top[1], top[2], top[3]]
      ];
      return;
    }
  }

  /**
   * Hoạt hình tách trải phẳng (Unfold) hoặc gấp lại (Fold) các mặt của khối 3D
   */
  function setUnfoldAnimated(board, target = 1, duration = 1000) {
    if (!board.turning) {
      board.startTurning();
    }
    if (!board.turning) return;

    board.turning = { ...board.turning, canUnfold: true, showSlider: true };
    const pg = board.doc.pages[board.turning.page];
    if (pg && pg.geo) {
      const sol = pg.geo.shapes.find(s => s.id === board.turning.id);
      if (sol && sol.solid) {
        ensureSolidFacesForUnfold(board, board.turning.page, sol);
      }
    }

    const startVal = board.turning.unfold || 0;
    const startTime = performance.now();

    if (board._unfoldAnimTimer) {
      cancelAnimationFrame(board._unfoldAnimTimer);
    }

    const step = (now) => {
      const elapsed = Math.min(1, (now - startTime) / duration);
      const ease = elapsed < 0.5 ? 2 * elapsed * elapsed : 1 - 2 * (1 - elapsed) * (1 - elapsed);
      const val = startVal + (target - startVal) * ease;
      board.setUnfold(val);
      if (elapsed < 1) {
        board._unfoldAnimTimer = requestAnimationFrame(step);
      } else {
        board._unfoldAnimTimer = null;
        if (target <= 0.001) {
          board.unfolded = null;
          board.cache.clear();
          board.redraw();
        }
      }
    };
    board._unfoldAnimTimer = requestAnimationFrame(step);
  }

  function toggleUnfoldFaces(board) {
    const cur = (board.turning && board.turning.unfold) || 0;
    const target = cur > 0.05 ? 0 : 1;
    setUnfoldAnimated(board, target, 1000);
  }


  /**
   * Tự động lấy 3 điểm mẫu trên khối đa diện để mở rộng mặt phẳng
   */
  function pickSample3PointsForPlane(board, pageIdx, sol, existingPicked) {
    const pg = board.doc.pages[pageIdx];
    const geo = pg.geo;
    const ptIds = sol.pts || [];
    if (ptIds.length < 4) return null;

    const pMap = getPointMap(geo);
    const pts2D = ptIds.map(id => ({ id, p: pMap.get(id) })).filter(item => item.p);
    if (pts2D.length < 4) return null;

    const sorted = [...pts2D].sort((a, b) => a.p.y - b.p.y);
    const apex = sorted[0];
    const basePts = sorted.slice(1);

    const picked = existingPicked ? [...existingPicked] : [];

    const auxPoints = Object.keys(geo.points).filter(pid => {
      const pt = geo.points[pid];
      return pt && pt.group === sol.group && !ptIds.includes(pid);
    });

    if (auxPoints.length >= 2 && picked.length === 0) {
      picked.push(auxPoints[0], auxPoints[1]);
    }

    while (picked.length < 3) {
      if (picked.length === 0 && basePts.length > 0) {
        picked.push(basePts[0].id);
      } else if (picked.length === 1 && basePts.length > 1) {
        picked.push(basePts[1].id);
      } else if (picked.length === 2) {
        if (!picked.includes(apex.id)) {
          picked.push(apex.id);
        } else if (basePts.length > 2) {
          picked.push(basePts[2].id);
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return picked.length >= 3 ? picked.slice(0, 3) : null;
  }

  /**
   * 🌟 MỞ RỘNG MẶT PHẲNG BẰNG CÁCH CHỌN 3 ĐIỂM (TÌM GIAO TUYẾN)
   */
  function expandPlaneFrom3Points(board, ptIds) {
    if (!board) return false;
    const pageIdx = board.sel ? board.sel.page : (board.turning ? board.turning.page : 0);
    const pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return false;

    const sol = pg.geo.shapes.find(s => s.kind === 'solid' && s.solid && !s.hidden) ||
                pg.geo.shapes.find(s => s.kind === 'solid' && s.solid);
    if (!sol || !sol.solid) {
      alert("Vui lòng vẽ hoặc chọn một khối hình học không gian trước!");
      return false;
    }

    // 1. Thu thập 3 điểm
    let selectedPtIds = ptIds && ptIds.length >= 3 ? ptIds.slice(0, 3) : null;
    if (!selectedPtIds && board.sel && board.sel.points && board.sel.points.size >= 3) {
      selectedPtIds = Array.from(board.sel.points).slice(0, 3);
    }

    // Nếu người dùng chọn 1 hoặc 2 điểm, hoặc chưa chọn điểm nào:
    if (!selectedPtIds || selectedPtIds.length < 3) {
      const existingPicked = (board.sel && board.sel.points) ? Array.from(board.sel.points) : [];
      selectedPtIds = pickSample3PointsForPlane(board, pageIdx, sol, existingPicked);
    }

    if (!selectedPtIds || selectedPtIds.length < 3) {
      alert("Vui lòng chọn 3 điểm trên khối hình học để mở rộng mặt phẳng!");
      return false;
    }

    // Đảm bảo các điểm này đã được tính toạ độ 3D
    attachDrawnElementsToSolid(board, pageIdx, sol);

    const pMap2D = getPointMap(pg.geo);
    const p3DList = [];

    // Lấy toạ độ 3D của từng điểm
    const c = o4(sol.solid.view);
    for (const pid of selectedPtIds) {
      const pt = pg.geo.points[pid];
      const p2D = pMap2D.get(pid);
      if (!pt || !p2D) continue;
      const z = pt.z ?? 0;
      const p3D = wo(c, [p2D.x, p2D.y, z]);
      p3DList.push(p3D);
    }

    if (p3DList.length < 3) {
      alert("Không thể xác định toạ độ 3D của các điểm đã chọn!");
      return false;
    }

    const [p1, p2, p3] = p3DList;
    const v1 = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
    const v2 = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]];

    // n = v1 x v2
    const normal = [
      v1[1] * v2[2] - v1[2] * v2[1],
      v1[2] * v2[0] - v1[0] * v2[2],
      v1[0] * v2[1] - v1[1] * v2[0]
    ];

    const len = Math.hypot(normal[0], normal[1], normal[2]);
    if (len < 1e-5) {
      alert("3 điểm bạn chọn thẳng hàng! Vui lòng chọn 3 điểm không thẳng hàng để xác định mặt phẳng.");
      return false;
    }

    const unitNormal = [normal[0] / len, normal[1] / len, normal[2] / len];
    const dist = p1[0] * unitNormal[0] + p1[1] * unitNormal[1] + p1[2] * unitNormal[2];

    const labels = selectedPtIds.map(pid => pg.geo.points[pid]?.label || pid);

    // Kích hoạt mặt phẳng cắt qua 3 điểm, mở rộng bao quanh khối
    board.sel = null;
    board.crossSection = {
      page: pageIdx,
      id: sol.id,
      type: "custom3pts",
      pts: selectedPtIds,
      labels: labels,
      normal: unitNormal,
      dist: dist,
      expandPlane: true,
      showPlane: true
    };

    board.redraw();
    board.emit();
    console.log('[Group3D] Đã mở rộng thành công mặt phẳng (' + labels.join('') + ') qua 3 điểm để tìm giao tuyến!');
    return true;
  }

/**
   * Hook vào Prototype của Board
   */
  
  /**
   * 🌟 MỞ RỘNG ĐƯỜNG THẲNG ĐỂ TÌM GIAO ĐIỂM GIỮA ĐƯỜNG THẲNG VÀ MẶT PHẲNG
   * (Line-Plane Intersection & Line Extension in 3D Spatial Geometry)
   */
  /**
   * 🌟 THỰC HIỆN TÍNH TOÁN & DỰNG GIAO ĐIỂM 3D (Core Calculation)
   */
  /**
   * 🌟 THỰC HIỆN TÍNH TOÁN & DỰNG GIAO ĐIỂM 3D (Core Calculation)
   */
  function executeLineIntersection(board, params) {
    if (!board) return false;
    var pageIdx = board.sel ? board.sel.page : (board.turning ? board.turning.page : 0);
    var pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return false;

    var sol = pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid && !s.hidden; }) ||
              pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid; });

    var ptAId = params.ptAId;
    var ptBId = params.ptBId;
    var targetType = params.targetType || 'plane'; // 'plane' | 'line'
    var targetPlanePtIds = params.targetPlanePtIds || [];
    var targetLinePtIds = params.targetLinePtIds || [];
    var chosenLabel = (params.chosenLabel || params.label || '').trim();

    if (!ptAId || !ptBId || ptAId === ptBId) {
      showSpatialToast('⚠️ Vui lòng chọn 2 điểm xác định đoạn thẳng thứ nhất!');
      return false;
    }

    // ── XỬ LÝ GIAO ĐIỂM 2D (KHI KHÔNG CÓ KHỐI 3D) ──
    if (!sol || !sol.solid) {
      if (targetType !== 'line' || !targetLinePtIds || targetLinePtIds.length < 2) {
        showSpatialToast('⚠️ Vui lòng chọn 2 đoạn thẳng để tìm giao điểm!');
        return false;
      }
      var ptCId2D = targetLinePtIds[0], ptDId2D = targetLinePtIds[1];
      var pMap2D_pure = getPointMap(pg.geo);
      var pA2D_pure = pMap2D_pure.get(ptAId), pB2D_pure = pMap2D_pure.get(ptBId);
      var pC2D_pure = pMap2D_pure.get(ptCId2D), pD2D_pure = pMap2D_pure.get(ptDId2D);
      if (!pA2D_pure || !pB2D_pure || !pC2D_pure || !pD2D_pure) {
        showSpatialToast('⚠️ Không tìm thấy toạ độ 2 đoạn thẳng!');
        return false;
      }
      var dx1_p = pB2D_pure.x - pA2D_pure.x, dy1_p = pB2D_pure.y - pA2D_pure.y;
      var dx2_p = pD2D_pure.x - pC2D_pure.x, dy2_p = pD2D_pure.y - pC2D_pure.y;
      var denom_p = dx1_p * dy2_p - dy1_p * dx2_p;
      if (Math.abs(denom_p) < 1e-6) {
        showSpatialToast('⚠️ Hai đường thẳng song song, không có giao điểm!');
        return false;
      }
      var t_p = ((pC2D_pure.x - pA2D_pure.x) * dy2_p - (pC2D_pure.y - pA2D_pure.y) * dx2_p) / denom_p;
      var u_p = ((pC2D_pure.x - pA2D_pure.x) * dy1_p - (pC2D_pure.y - pA2D_pure.y) * dx1_p) / denom_p;
      var pI2D_pure = { x: pA2D_pure.x + t_p * dx1_p, y: pA2D_pure.y + t_p * dy1_p };

      var existingLabels_p = new Set(Object.values(pg.geo.points).map(function(p) { return p.label; }).filter(Boolean));
      if (!chosenLabel || existingLabels_p.has(chosenLabel)) {
        var cand = ['O', 'I', 'J', 'K', 'E', 'F', 'P', 'Q', 'H'];
        chosenLabel = cand.find(function(lbl) { return !existingLabels_p.has(lbl); }) || 'O';
      }

      var ptIId_p = 'pt_inter_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      var ptI_p = {
        id: ptIId_p,
        def: { t: 'inter', l1: [ptAId, ptBId], l2: [ptCId2D, ptDId2D], which: 0 },
        label: chosenLabel,
        show: true
      };
      var newShapes_p = [];
      if (t_p < -0.05 || t_p > 1.05) {
        var nearId_p = t_p > 1.05 ? ptBId : ptAId;
        newShapes_p.push({ id: 'seg_ext_' + Date.now() + '_1', kind: 'segment', pts: [nearId_p, ptIId_p], color: '#0284c7', width: 2, dashed: true, aux: true });
      }
      if (u_p < -0.05 || u_p > 1.05) {
        var nearId_u = u_p > 1.05 ? ptDId2D : ptCId2D;
        newShapes_p.push({ id: 'seg_ext_' + Date.now() + '_2', kind: 'segment', pts: [nearId_u, ptIId_p], color: '#d97706', width: 2, dashed: true, aux: true });
      }
      board.commit(board.addGeo(pageIdx, [ptI_p], newShapes_p));
      board.redraw();
      board.emit();
      showSpatialToast('🎉 Đã tìm được giao điểm <b>' + chosenLabel + '</b> của 2 đoạn thẳng!');
      return true;
    }

    if (!ptAId || !ptBId || ptAId === ptBId) {
      showSpatialToast('⚠️ Vui lòng chọn 2 điểm xác định đường thẳng cần mở rộng!');
      return false;
    }

    // Đảm bảo toạ độ 3D đã được đồng bộ
    attachDrawnElementsToSolid(board, pageIdx, sol);

    var pMap2D = getPointMap(pg.geo);
    var ptA = pg.geo.points[ptAId];
    var ptB = pg.geo.points[ptBId];
    var pA2D = pMap2D.get(ptAId);
    var pB2D = pMap2D.get(ptBId);

    var c = o4(sol.solid.view || Cp);
    var zA = ptA ? (ptA.z != null ? ptA.z : 0) : 0;
    var zB = ptB ? (ptB.z != null ? ptB.z : 0) : 0;
    var pA3D = (ptA && ptA.pos3d) ? [...ptA.pos3d] : (pA2D ? wo(c, [pA2D.x, pA2D.y, zA]) : null);
    var pB3D = (ptB && ptB.pos3d) ? [...ptB.pos3d] : (pB2D ? wo(c, [pB2D.x, pB2D.y, zB]) : null);

    if (!pA3D || !pB3D) {
      showSpatialToast('⚠️ Không tìm thấy toạ độ của đường thẳng đã chọn!');
      return false;
    }

    // Vector chỉ phương đường thẳng d: v = B - A
    var vLine = [pB3D[0] - pA3D[0], pB3D[1] - pA3D[1], pB3D[2] - pA3D[2]];
    var lineLen = Math.hypot(vLine[0], vLine[1], vLine[2]);
    if (lineLen < 1e-5) {
      showSpatialToast('⚠️ Hai điểm của đường thẳng trùng nhau!');
      return false;
    }

    var pI3D = null;
    var tParam = 0;
    var targetDesc = '';
    var collinearTargetEdge = null; // [id1, id2, p3d1, p3d2] nếu có cạnh đồng phẳng được kéo dài

    if (targetType === 'plane') {
      var normal = null;
      var dist = 0;

      if (targetPlanePtIds && targetPlanePtIds.length >= 3) {
        var pt1 = pg.geo.points[targetPlanePtIds[0]], pt2 = pg.geo.points[targetPlanePtIds[1]], pt3 = pg.geo.points[targetPlanePtIds[2]];
        var p1_2d = pMap2D.get(targetPlanePtIds[0]), p2_2d = pMap2D.get(targetPlanePtIds[1]), p3_2d = pMap2D.get(targetPlanePtIds[2]);
        if (pt1 && pt2 && pt3 && p1_2d && p2_2d && p3_2d) {
          var p1_3d = pt1.pos3d ? [...pt1.pos3d] : wo(c, [p1_2d.x, p1_2d.y, pt1.z != null ? pt1.z : 0]);
          var p2_3d = pt2.pos3d ? [...pt2.pos3d] : wo(c, [p2_2d.x, p2_2d.y, pt2.z != null ? pt2.z : 0]);
          var p3_3d = pt3.pos3d ? [...pt3.pos3d] : wo(c, [p3_2d.x, p3_2d.y, pt3.z != null ? pt3.z : 0]);
          var u1 = [p2_3d[0] - p1_3d[0], p2_3d[1] - p1_3d[1], p2_3d[2] - p1_3d[2]];
          var u2 = [p3_3d[0] - p1_3d[0], p3_3d[1] - p1_3d[1], p3_3d[2] - p1_3d[2]];
          var nCross = [
            u1[1] * u2[2] - u1[2] * u2[1],
            u1[2] * u2[0] - u1[0] * u2[2],
            u1[0] * u2[1] - u1[1] * u2[0]
          ];
          var nL = Math.hypot(nCross[0], nCross[1], nCross[2]);
          if (nL > 1e-5) {
            normal = [nCross[0] / nL, nCross[1] / nL, nCross[2] / nL];
            dist = normal[0] * p1_3d[0] + normal[1] * p1_3d[1] + normal[2] * p1_3d[2];
            targetDesc = params.targetName || ('(' + (pt1.label || 'P1') + (pt2.label || 'P2') + (pt3.label || 'P3') + ')');
          }
        }
      }

      // Fallback mặt phẳng cắt hoặc đáy
      if (!normal) {
        var cs = board.crossSection;
        if (cs && cs.page === pageIdx && cs.normal) {
          normal = [...cs.normal];
          dist = cs.dist !== undefined ? cs.dist : 0;
          targetDesc = 'mặt phẳng (α)';
        } else {
          normal = [0, 0, 1];
          dist = 0;
          targetDesc = 'mặt phẳng đáy';
        }
      }

      // Tính giao điểm đường thẳng d và mặt phẳng
      var denom = normal[0] * vLine[0] + normal[1] * vLine[1] + normal[2] * vLine[2];
      if (Math.abs(denom) < 1e-6) {
        showSpatialToast('⚠️ Đường thẳng song song hoặc nằm trên ' + targetDesc + '!');
        return false;
      }

      var dotA = normal[0] * pA3D[0] + normal[1] * pA3D[1] + normal[2] * pA3D[2];
      tParam = (dist - dotA) / denom;
      pI3D = [
        pA3D[0] + tParam * vLine[0],
        pA3D[1] + tParam * vLine[1],
        pA3D[2] + tParam * vLine[2]
      ];

      // Tìm cạnh đồng phẳng trong mặt phẳng mục tiêu để kéo dài đồng quy
      if (targetPlanePtIds && targetPlanePtIds.length >= 2) {
        var candEdges = [];
        for (var pi = 0; pi < targetPlanePtIds.length; pi++) {
          candEdges.push([targetPlanePtIds[pi], targetPlanePtIds[(pi + 1) % targetPlanePtIds.length]]);
        }
        for (var ci = 0; ci < candEdges.length; ci++) {
          var eAId = candEdges[ci][0], eBId = candEdges[ci][1];
          var eA = pg.geo.points[eAId], eB = pg.geo.points[eBId];
          var eA2D = pMap2D.get(eAId), eB2D = pMap2D.get(eBId);
          if (!eA || !eB || !eA2D || !eB2D) continue;
          var eA3D = eA.pos3d ? [...eA.pos3d] : wo(c, [eA2D.x, eA2D.y, eA.z != null ? eA.z : 0]);
          var eB3D = eB.pos3d ? [...eB.pos3d] : wo(c, [eB2D.x, eB2D.y, eB.z != null ? eB.z : 0]);
          var vE = [eB3D[0] - eA3D[0], eB3D[1] - eA3D[1], eB3D[2] - eA3D[2]];
          var vEI = [pI3D[0] - eA3D[0], pI3D[1] - eA3D[1], pI3D[2] - eA3D[2]];
          var crossE = [
            vE[1] * vEI[2] - vE[2] * vEI[1],
            vE[2] * vEI[0] - vE[0] * vEI[2],
            vE[0] * vEI[1] - vE[1] * vEI[0]
          ];
          var dLine = Math.hypot(crossE[0], crossE[1], crossE[2]) / (Math.hypot(vE[0], vE[1], vE[2]) || 1);
          if (dLine < 5) {
            collinearTargetEdge = [eAId, eBId, eA3D, eB3D];
            break;
          }
        }
      }
    } else {
      // targetType === 'line'
      var ptCId = targetLinePtIds[0];
      var ptDId = targetLinePtIds[1];
      if (!ptCId || !ptDId || ptCId === ptDId) {
        showSpatialToast('⚠️ Vui lòng chọn đường thẳng mục tiêu hợp lệ!');
        return false;
      }
      var ptC = pg.geo.points[ptCId], ptD = pg.geo.points[ptDId];
      var pC2D = pMap2D.get(ptCId), pD2D = pMap2D.get(ptDId);
      if (!ptC || !ptD || !pC2D || !pD2D) {
        showSpatialToast('⚠️ Không tìm thấy toạ độ đường thẳng mục tiêu!');
        return false;
      }
      var pC3D = ptC.pos3d ? [...ptC.pos3d] : wo(c, [pC2D.x, pC2D.y, ptC.z != null ? ptC.z : 0]);
      var pD3D = ptD.pos3d ? [...ptD.pos3d] : wo(c, [pD2D.x, pD2D.y, ptD.z != null ? ptD.z : 0]);
      var wLine = [pD3D[0] - pC3D[0], pD3D[1] - pC3D[1], pD3D[2] - pC3D[2]];
      var rVec = [pA3D[0] - pC3D[0], pA3D[1] - pC3D[1], pA3D[2] - pC3D[2]];

      var a = vLine[0]*vLine[0] + vLine[1]*vLine[1] + vLine[2]*vLine[2];
      var b = vLine[0]*wLine[0] + vLine[1]*wLine[1] + vLine[2]*wLine[2];
      var dCoef = wLine[0]*wLine[0] + wLine[1]*wLine[1] + wLine[2]*wLine[2];
      var d1 = vLine[0]*rVec[0] + vLine[1]*rVec[1] + vLine[2]*rVec[2];
      var d2 = wLine[0]*rVec[0] + wLine[1]*rVec[1] + wLine[2]*rVec[2];
      var lDenom = a * dCoef - b * b;

      if (Math.abs(lDenom) < 1e-6) {
        showSpatialToast('⚠️ Hai đường thẳng song song, không có giao điểm!');
        return false;
      }

      tParam = (b * d2 - dCoef * d1) / lDenom;
      var sParam = (a * d2 - b * d1) / lDenom;

      var q1 = [pA3D[0] + tParam * vLine[0], pA3D[1] + tParam * vLine[1], pA3D[2] + tParam * vLine[2]];
      var q2 = [pC3D[0] + sParam * wLine[0], pC3D[1] + sParam * wLine[1], pC3D[2] + sParam * wLine[2]];
      var distLines = Math.hypot(q1[0] - q2[0], q1[1] - q2[1], q1[2] - q2[2]);
      // Kiểm tra xem 2 đoạn thẳng có thuộc cùng 1 mặt của khối không
      var shareFace = false;
      if (sol && sol.solid && Array.isArray(sol.solid.faces)) {
        var p4 = [ptAId, ptBId, ptCId, ptDId];
        shareFace = sol.solid.faces.some(function(f) {
          var fIds = f.map(function(idx) { return sol.pts[idx]; });
          return p4.every(function(pid) { return fIds.includes(pid); });
        });
      }
      if (distLines > 25.0 && !shareFace) {
        showSpatialToast('⚠️ Hai đường thẳng chéo nhau (không đồng phẳng), không có giao điểm!');
        return false;
      }
      pI3D = [(q1[0] + q2[0]) / 2, (q1[1] + q2[1]) / 2, (q1[2] + q2[2]) / 2];
      collinearTargetEdge = [ptCId, ptDId, pC3D, pD3D];
      targetDesc = 'đường thẳng ' + (ptC.label || 'C') + (ptD.label || 'D');
    }

    // Chiếu toạ độ 3D về 2D theo góc nhìn hiện tại
    var viewMat = sol.solid.view || Cp;
    var pI2D = {
      x: viewMat[0] * pI3D[0] + viewMat[1] * pI3D[1] + viewMat[2] * pI3D[2],
      y: viewMat[3] * pI3D[0] + viewMat[4] * pI3D[1] + viewMat[5] * pI3D[2]
    };
    var zI = viewMat[6] * pI3D[0] + viewMat[7] * pI3D[1] + viewMat[8] * pI3D[2];

    // Xác định nhãn giao điểm
    var existingLabels = new Set(Object.values(pg.geo.points).map(function(p) { return p.label; }).filter(Boolean));
    if (!chosenLabel || existingLabels.has(chosenLabel)) {
      var candidateLabels = ['O', 'I', 'J', 'K', 'E', 'F', 'P', 'Q', 'H', 'M', 'N'];
      chosenLabel = candidateLabels.find(function(lbl) { return !existingLabels.has(lbl); }) || 'O';
    }

    var ptIId = 'pt_inter_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    var defObj;
    if (targetType === 'line' && targetLinePtIds && targetLinePtIds.length >= 2) {
      defObj = { t: 'inter', l1: [ptAId, ptBId], l2: [targetLinePtIds[0], targetLinePtIds[1]], which: 0 };
    } else if (collinearTargetEdge) {
      defObj = { t: 'inter', l1: [ptAId, ptBId], l2: [collinearTargetEdge[0], collinearTargetEdge[1]], which: 0 };
    } else {
      defObj = { t: 'on', a: ptAId, b: ptBId, k: tParam };
    }

    var ptI = {
      id: ptIId,
      def: defObj,
      label: chosenLabel,
      show: true,
      z: zI,
      group: sol.group,
      pos3d: [Math.round(pI3D[0] * 100) / 100, Math.round(pI3D[1] * 100) / 100, Math.round(pI3D[2] * 100) / 100]
    };

    var newShapes = [];

    // Chỉ tạo đoạn nối kéo dài từ AB đến I nếu I nằm NGOÀI đoạn thẳng AB
    if (tParam < -0.05 || tParam > 1.05) {
      var nearPtId = tParam > 1.05 ? ptBId : ptAId;
      newShapes.push({
        id: 'seg_ext_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        kind: 'segment',
        pts: [nearPtId, ptIId],
        color: '#0284c7',
        width: 2.2,
        dashed: false,
        group: sol.group,
        aux: true
      });
    }

    // Chỉ kéo dài cạnh đồng phẳng nếu I nằm NGOÀI cạnh đó
    if (collinearTargetEdge) {
      var ceAId = collinearTargetEdge[0], ceBId = collinearTargetEdge[1];
      var ceA3D = collinearTargetEdge[2], ceB3D = collinearTargetEdge[3];
      var vCe = [ceB3D[0] - ceA3D[0], ceB3D[1] - ceA3D[1], ceB3D[2] - ceA3D[2]];
      var lenCeSq = vCe[0]*vCe[0] + vCe[1]*vCe[1] + vCe[2]*vCe[2];
      var sCe = lenCeSq > 1e-5 ? ((pI3D[0]-ceA3D[0])*vCe[0] + (pI3D[1]-ceA3D[1])*vCe[1] + (pI3D[2]-ceA3D[2])*vCe[2]) / lenCeSq : 0.5;
      if (sCe < -0.05 || sCe > 1.05) {
        var nearCeId = sCe > 1.05 ? ceBId : ceAId;
        newShapes.push({
          id: 'seg_target_ext_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
          kind: 'segment',
          pts: [nearCeId, ptIId],
          color: '#d97706',
          width: 2,
          dashed: false,
          group: sol.group,
          aux: true
        });
      }
    }

    board.commit(board.addGeo(pageIdx, [ptI], newShapes));
    attachDrawnElementsToSolid(board, pageIdx, sol);
    board.sel = {
      page: pageIdx,
      strokes: new Set(),
      items: new Set(),
      shapes: new Set(sol ? [sol.id] : []),
      points: new Set(sol ? sol.pts : [ptIId])
    };
    board.redraw();
    board.emit();

    var lineName = (ptA.label || 'A') + (ptB.label || 'B');
    showSpatialToast('🎉 Đã tìm được giao điểm ' + chosenLabel + ' của ' + lineName + ' với ' + targetDesc + '!');
    return true;
  }

  /**
   * 🌟 HỘP THOẠI THÔNG MINH: CHỌN ĐỐI TƯỢNG ĐỂ TÌM GIAO ĐIỂM (Intersection Wizard)
   */
  function openSmartIntersectionModal(board, preselectedLinePtIds, preselectedPlanePtIds) {
    if (!board) return;
    var pageIdx = board.sel ? board.sel.page : (board.turning ? board.turning.page : 0);
    var pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return;

    var sol = pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid && !s.hidden; }) ||
              pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid; });
    if (!sol || !sol.solid) {
      showSpatialToast('⚠️ Vui lòng vẽ hoặc chọn một khối hình học không gian trước!');
      return;
    }

    var getLabel = function(id) {
      return (pg.geo.points[id] && pg.geo.points[id].label) ? pg.geo.points[id].label : id;
    };

    // 1. Thu thập tất cả điểm
    var allPtsMap = new Map();
    if (sol.pts) {
      sol.pts.forEach(function(pid) {
        if (pg.geo.points[pid]) allPtsMap.set(pid, { id: pid, label: getLabel(pid), isSolid: true });
      });
    }
    Object.keys(pg.geo.points).forEach(function(pid) {
      if (!allPtsMap.has(pid)) {
        allPtsMap.set(pid, { id: pid, label: getLabel(pid), isSolid: false });
      }
    });
    var allPtsList = Array.from(allPtsMap.values());

    // 2. Thu thập các đường thẳng / cạnh
    var lineCandidates = [];
    var seenLines = new Set();
    function addLineCandidate(id1, id2, groupName) {
      if (!id1 || !id2 || id1 === id2) return;
      var key1 = id1 + '_' + id2;
      var key2 = id2 + '_' + id1;
      if (seenLines.has(key1) || seenLines.has(key2)) return;
      seenLines.add(key1);
      var name = getLabel(id1) + getLabel(id2);
      lineCandidates.push({ id1: id1, id2: id2, name: name, group: groupName });
    }

    // Đoạn thẳng tự vẽ
    pg.geo.shapes.forEach(function(sh) {
      if ((sh.kind === 'segment' || sh.kind === 'line') && sh.pts && sh.pts.length >= 2 && !sh.hidden) {
        addLineCandidate(sh.pts[0], sh.pts[1], 'Đoạn vẽ');
      }
    });

    // Cạnh của khối
    var apexId = (sol.solid.of && sol.solid.of.startsWith('pyramid') || sol.solid.of === 'cone' || sol.pts.length === 5) ? sol.pts[sol.pts.length - 1] : null;
    var basePtIds = apexId ? sol.pts.slice(0, sol.pts.length - 1) : sol.pts;

    if (apexId) {
      basePtIds.forEach(function(bId) {
        addLineCandidate(apexId, bId, 'Cạnh bên');
      });
      for (var bi = 0; bi < basePtIds.length; bi++) {
        var nxt = (bi + 1) % basePtIds.length;
        addLineCandidate(basePtIds[bi], basePtIds[nxt], 'Cạnh đáy');
      }
      if (basePtIds.length === 4) {
        addLineCandidate(basePtIds[0], basePtIds[2], 'Đường chéo đáy');
        addLineCandidate(basePtIds[1], basePtIds[3], 'Đường chéo đáy');
      }
    } else if (sol.pts.length >= 6) {
      var nBase = Math.floor(sol.pts.length / 2);
      for (var pi = 0; pi < nBase; pi++) {
        addLineCandidate(sol.pts[pi], sol.pts[pi + nBase], 'Cạnh bên');
      }
      for (var bi = 0; bi < nBase; bi++) {
        var nxt = (bi + 1) % nBase;
        addLineCandidate(sol.pts[bi], sol.pts[nxt], 'Cạnh đáy dưới');
      }
      for (var bi = 0; bi < nBase; bi++) {
        var nxt = (bi + 1) % nBase;
        addLineCandidate(sol.pts[bi + nBase], sol.pts[nxt + nBase], 'Cạnh đáy trên');
      }
      if (nBase === 4) {
        addLineCandidate(sol.pts[0], sol.pts[2], 'Đường chéo đáy dưới');
        addLineCandidate(sol.pts[1], sol.pts[3], 'Đường chéo đáy dưới');
        addLineCandidate(sol.pts[4], sol.pts[6], 'Đường chéo đáy trên');
        addLineCandidate(sol.pts[5], sol.pts[7], 'Đường chéo đáy trên');
      }
    }

    // 3. Đường thẳng đã chọn mặc định (Preselection)
    var curLine = null;
    if (preselectedLinePtIds && preselectedLinePtIds.length >= 2) {
      curLine = { id1: preselectedLinePtIds[0], id2: preselectedLinePtIds[1], name: getLabel(preselectedLinePtIds[0]) + getLabel(preselectedLinePtIds[1]) };
    } else if (board.sel && board.sel.shapes && board.sel.shapes.size === 1) {
      var selShId = Array.from(board.sel.shapes)[0];
      var selSh = pg.geo.shapes.find(function(s) { return s.id === selShId; });
      if (selSh && selSh.pts && selSh.pts.length >= 2) {
        curLine = { id1: selSh.pts[0], id2: selSh.pts[1], name: getLabel(selSh.pts[0]) + getLabel(selSh.pts[1]) };
      }
    } else if (board.sel && board.sel.points && board.sel.points.size === 2) {
      var spts = Array.from(board.sel.points);
      curLine = { id1: spts[0], id2: spts[1], name: getLabel(spts[0]) + getLabel(spts[1]) };
    }

    if (!curLine && lineCandidates.length > 0) {
      var defLine = lineCandidates.find(function(l) { return l.group === 'Cạnh bên'; }) || lineCandidates[0];
      curLine = { id1: defLine.id1, id2: defLine.id2, name: defLine.name };
    }

    // 4. Thu thập các mặt phẳng mục tiêu (Target Planes)
    var planes = getSolidPlanes(board);
    var cs = board.crossSection;
    if (cs && cs.page === pageIdx && cs.labels && cs.labels.length >= 3) {
      var csPtIds = cs.labels.map(function(lbl) {
        var found = allPtsList.find(function(p) { return p.label === lbl; });
        return found ? found.id : null;
      }).filter(Boolean);
      if (csPtIds.length >= 3) {
        planes.push({
          key: 'cross_section',
          name: '(' + cs.labels.join('') + ')',
          desc: 'Mặt phẳng thiết diện (α)',
          ptIds: csPtIds
        });
      }
    }

    // Đối tượng mục tiêu mặc định: Mặt đáy
    var curTarget = null;
    var basePlane = planes.find(function(p) { return p.desc === 'Mặt đáy'; }) || planes[0];
    if (basePlane) {
      curTarget = {
        type: 'plane',
        ptIds: basePlane.ptIds,
        name: basePlane.name,
        desc: basePlane.desc
      };
    }

    // Nhãn điểm gợi ý
    var existingLabels = new Set(Object.values(pg.geo.points).map(function(p) { return p.label; }).filter(Boolean));
    var candidateLabels = ['I', 'J', 'K', 'E', 'F', 'P', 'Q', 'H'];
    var suggestedLabel = candidateLabels.find(function(lbl) { return !existingLabels.has(lbl); }) || 'I';

    // Xoá modal cũ nếu đang mở
    var old = document.getElementById('spatial-intersection-wizard');
    if (old) old.remove();

    var overlay = document.createElement('div');
    overlay.id = 'spatial-intersection-wizard';
    overlay.className = 'spatial-modal-overlay';

    // Tạo HTML các nút đường thẳng có sẵn (tránh generic .active class)
    var lineChipsHtml = lineCandidates.map(function(l) {
      var isAct = curLine && ((l.id1 === curLine.id1 && l.id2 === curLine.id2) || (l.id1 === curLine.id2 && l.id2 === curLine.id1));
      var borderStyle = isAct ? 'border:2px solid #0284c7;background:#e0f2fe;color:#0369a1;font-weight:700;' : 'border:1.5px solid #cbd5e1;background:#f8fafc;color:#1e293b;';
      return '<button class="spatial-chip line-chip ' + (isAct ? 'is-selected' : '') + '" data-id1="' + l.id1 + '" data-id2="' + l.id2 + '" data-name="' + l.name + '" style="' + borderStyle + '">' +
        l.name + ' <span style="font-size:10px;opacity:0.75">(' + l.group + ')</span>' +
      '</button>';
    }).join('');

    // Tạo HTML các chip điểm tự do
    var pointChipsHtml = allPtsList.map(function(p) {
      return '<button class="spatial-chip pt-line-chip" data-id="' + p.id + '">' + p.label + '</button>';
    }).join('');

    // Tạo HTML danh sách mặt phẳng (tránh class active)
    var planesListHtml = planes.map(function(pl, idx) {
      var isAct = curTarget && curTarget.type === 'plane' && curTarget.ptIds.join(',') === pl.ptIds.join(',');
      var icon = pl.desc === 'Mặt đáy' ? '🟩' : (pl.desc.includes('bên') ? '🔺' : (pl.desc.includes('chéo') ? '📐' : '✨'));
      var cardStyle = isAct
        ? 'border:2px solid #0284c7;background:#f0f9ff;box-shadow:0 2px 8px rgba(2,132,199,0.12);'
        : 'border:1.5px solid #e2e8f0;background:#ffffff;';
      return '<button class="spatial-preset-btn plane-target-btn ' + (isAct ? 'is-selected' : '') + '" data-idx="' + idx + '" style="' + cardStyle + '">' +
        '<span class="p-icon">' + icon + '</span>' +
        '<div style="flex:1;text-align:left"><b style="color:' + (isAct ? '#0369a1' : '#1e293b') + ';">' + pl.name + '</b><div style="font-size:12px;color:#64748b">' + pl.desc + '</div></div>' +
        '<span class="target-check" style="font-size:16px;color:#0284c7;font-weight:700;' + (isAct ? '' : 'display:none;') + '">✓</span>' +
      '</button>';
    }).join('');

    // Tạo HTML danh sách đường thẳng đồng phẳng để cắt
    var coplanarLinesHtml = lineCandidates.map(function(l, idx) {
      return '<button class="spatial-preset-btn line-target-btn" data-id1="' + l.id1 + '" data-id2="' + l.id2 + '" data-name="' + l.name + '" style="border:1.5px solid #e2e8f0;background:#ffffff;">' +
        '<span class="p-icon">📏</span>' +
        '<div style="flex:1;text-align:left"><b>' + l.name + '</b><div style="font-size:12px;color:#64748b">' + l.group + '</div></div>' +
        '<span class="target-check" style="font-size:16px;color:#0284c7;font-weight:700;display:none;">✓</span>' +
      '</button>';
    }).join('');

    overlay.innerHTML = '<div class="spatial-modal-card" style="max-width:480px;max-height:88vh;display:flex;flex-direction:column;">' +
      '<div class="spatial-modal-header">' +
        '<div class="spatial-modal-title">📏 Tìm Giao Điểm Đường Thẳng & Mặt Phẳng</div>' +
        '<button class="spatial-modal-close" id="btn-close-isect-modal">✕</button>' +
      '</div>' +
      '<div class="spatial-modal-body" style="padding:16px 20px;overflow-y:auto;flex:1;">' +
        
        // BƯỚC 1: ĐƯỜNG THẲNG (d)
        '<div class="spatial-section-title" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
          '<span>1. ĐƯỜNG THẲNG (d)</span>' +
          '<span id="isect-line-badge" style="background:#e0f2fe;color:#0284c7;font-weight:700;padding:3px 10px;border-radius:12px;font-size:13px;border:1px solid #bae6fd;">' +
            (curLine ? curLine.name : 'Chưa chọn') +
          '</span>' +
        '</div>' +
        '<div style="font-size:12px;color:#64748b;margin-bottom:6px;">Chọn nhanh đường thẳng / cạnh:</div>' +
        '<div class="spatial-chips-wrap" id="isect-line-chips" style="margin-bottom:10px;max-height:85px;overflow-y:auto;">' + lineChipsHtml + '</div>' +
        
        '<div style="font-size:12px;color:#64748b;margin-bottom:6px;">Hoặc bấm 2 điểm bất kỳ để tạo đường thẳng:</div>' +
        '<div class="spatial-chips-wrap" id="isect-pt-chips" style="margin-bottom:14px;">' + pointChipsHtml + '</div>' +

        '<div style="border-top:1px dashed #cbd5e1;margin:12px 0;"></div>' +

        // BƯỚC 2: CHỌN ĐỐI TƯỢNG ĐỂ TÌM GIAO ĐIỂM
        '<div class="spatial-section-title" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
          '<span>2. ĐỐI TƯỢNG ĐỂ TÌM GIAO ĐIỂM</span>' +
          '<span id="isect-target-badge" style="background:#dcfce7;color:#15803d;font-weight:700;padding:3px 10px;border-radius:12px;font-size:13px;border:1px solid #bbf7d0;">' +
            (curTarget ? curTarget.name : 'Chưa chọn') +
          '</span>' +
        '</div>' +

        '<div style="display:flex;gap:8px;margin-bottom:12px;">' +
          '<button id="isect-tab-plane" style="flex:1;padding:8px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;background:#0284c7;color:#fff;border:none;">' +
            '📐 Mặt Phẳng' +
          '</button>' +
          '<button id="isect-tab-line" style="flex:1;padding:8px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;">' +
            '📏 Đường Thẳng Đồng Phẳng' +
          '</button>' +
        '</div>' +

        // TAB MẶT PHẲNG
        '<div id="isect-pane-plane">' +
          '<div class="spatial-preset-list" style="margin-bottom:10px;max-height:160px;overflow-y:auto;">' + planesListHtml + '</div>' +
        '</div>' +

        // TAB ĐƯỜNG THẲNG
        '<div id="isect-pane-line" style="display:none;">' +
          '<div class="spatial-preset-list" style="margin-bottom:10px;max-height:160px;overflow-y:auto;">' + coplanarLinesHtml + '</div>' +
        '</div>' +

        // TÊN ĐIỂM GIAO
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;margin-top:10px;">' +
          '<span style="font-size:13px;font-weight:600;color:#334155;">Tên điểm giao:</span>' +
          '<div style="display:flex;align-items:center;gap:8px;">' +
            '<input id="isect-label-input" type="text" value="' + suggestedLabel + '" maxlength="3" style="width:48px;text-align:center;font-weight:700;font-size:15px;padding:4px;border:1.5px solid #94a3b8;border-radius:6px;color:#0284c7;background:#fff;" />' +
            '<span style="font-size:12px;color:#64748b;">(Tự động: I, J, K...)</span>' +
          '</div>' +
        '</div>' +

      '</div>' +

      // FOOTER
      '<div class="spatial-modal-footer" style="padding:12px 20px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;justify-content:flex-end;gap:10px;">' +
        '<button id="btn-cancel-isect" class="spatial-preset-btn" style="padding:8px 16px;margin:0;">Hủy</button>' +
        '<button id="btn-apply-isect" class="spatial-btn-primary" style="padding:9px 20px;font-size:14px;font-weight:700;border-radius:10px;background:#0284c7;color:#fff;border:none;cursor:pointer;">' +
          '✨ Tìm giao điểm ngay' +
        '</button>' +
      '</div>' +
    '</div>';

    document.body.appendChild(overlay);

    var close = function() { overlay.remove(); };
    overlay.querySelector('#btn-close-isect-modal').onclick = close;
    overlay.querySelector('#btn-cancel-isect').onclick = close;
    overlay.onclick = function(e) { if (e.target === overlay) close(); };

    // Xử lý chọn đường thẳng qua line chip
    var lineChips = overlay.querySelectorAll('.line-chip');
    lineChips.forEach(function(btn) {
      btn.onclick = function() {
        lineChips.forEach(function(b) {
          b.style.border = '1.5px solid #cbd5e1';
          b.style.background = '#f8fafc';
          b.style.color = '#1e293b';
          b.style.fontWeight = '500';
        });
        btn.style.border = '2px solid #0284c7';
        btn.style.background = '#e0f2fe';
        btn.style.color = '#0369a1';
        btn.style.fontWeight = '700';
        curLine = { id1: btn.getAttribute('data-id1'), id2: btn.getAttribute('data-id2'), name: btn.getAttribute('data-name') };
        overlay.querySelector('#isect-line-badge').innerText = curLine.name;
        // Bỏ chọn chip điểm tự do
        overlay.querySelectorAll('.pt-line-chip').forEach(function(p) {
          p.style.border = '';
          p.style.background = '';
          p.style.color = '';
        });
        selectedFreePts = [];
      };
    });

    // Xử lý chọn đường thẳng qua 2 điểm tự do
    var selectedFreePts = [];
    var ptChips = overlay.querySelectorAll('.pt-line-chip');
    ptChips.forEach(function(btn) {
      btn.onclick = function() {
        var pid = btn.getAttribute('data-id');
        if (selectedFreePts.includes(pid)) {
          selectedFreePts = selectedFreePts.filter(function(id) { return id !== pid; });
          btn.style.border = '';
          btn.style.background = '';
          btn.style.color = '';
        } else {
          if (selectedFreePts.length >= 2) {
            selectedFreePts = [];
            ptChips.forEach(function(b) {
              b.style.border = '';
              b.style.background = '';
              b.style.color = '';
            });
          }
          selectedFreePts.push(pid);
          btn.style.border = '2px solid #0284c7';
          btn.style.background = '#e0f2fe';
          btn.style.color = '#0369a1';
        }

        if (selectedFreePts.length === 2) {
          lineChips.forEach(function(b) {
            b.style.border = '1.5px solid #cbd5e1';
            b.style.background = '#f8fafc';
            b.style.color = '#1e293b';
            b.style.fontWeight = '500';
          });
          curLine = { id1: selectedFreePts[0], id2: selectedFreePts[1], name: getLabel(selectedFreePts[0]) + getLabel(selectedFreePts[1]) };
          overlay.querySelector('#isect-line-badge').innerText = curLine.name;
        } else if (selectedFreePts.length === 1) {
          overlay.querySelector('#isect-line-badge').innerText = getLabel(selectedFreePts[0]) + '...? (chọn tiếp)';
        }
      };
    });

    // Chuyển Tab Mặt Phẳng / Đường Thẳng
    var tabPlane = overlay.querySelector('#isect-tab-plane');
    var tabLine = overlay.querySelector('#isect-tab-line');
    var panePlane = overlay.querySelector('#isect-pane-plane');
    var paneLine = overlay.querySelector('#isect-pane-line');

    tabPlane.onclick = function() {
      tabPlane.style.background = '#0284c7';
      tabPlane.style.color = '#fff';
      tabPlane.style.border = 'none';
      tabLine.style.background = '#f1f5f9';
      tabLine.style.color = '#475569';
      tabLine.style.border = '1px solid #cbd5e1';
      panePlane.style.display = 'block';
      paneLine.style.display = 'none';
      if (basePlane) {
        curTarget = { type: 'plane', ptIds: basePlane.ptIds, name: basePlane.name, desc: basePlane.desc };
        overlay.querySelector('#isect-target-badge').innerText = curTarget.name;
        overlay.querySelector('#isect-target-badge').style.background = '#dcfce7';
        overlay.querySelector('#isect-target-badge').style.color = '#15803d';
      }
    };

    tabLine.onclick = function() {
      tabLine.style.background = '#0284c7';
      tabLine.style.color = '#fff';
      tabLine.style.border = 'none';
      tabPlane.style.background = '#f1f5f9';
      tabPlane.style.color = '#475569';
      tabPlane.style.border = '1px solid #cbd5e1';
      paneLine.style.display = 'block';
      panePlane.style.display = 'none';
      if (lineCandidates.length > 0) {
        var defTLine = lineCandidates.find(function(l) { return l.group === 'Cạnh đáy'; }) || lineCandidates[0];
        curTarget = { type: 'line', ptIds: [defTLine.id1, defTLine.id2], name: defTLine.name, desc: defTLine.group };
        overlay.querySelector('#isect-target-badge').innerText = defTLine.name;
        overlay.querySelector('#isect-target-badge').style.background = '#fef3c7';
        overlay.querySelector('#isect-target-badge').style.color = '#b45309';
      }
    };

    // Chọn Mặt phẳng mục tiêu
    var planeBtns = overlay.querySelectorAll('.plane-target-btn');
    planeBtns.forEach(function(btn) {
      btn.onclick = function() {
        planeBtns.forEach(function(b) {
          b.style.borderColor = '#e2e8f0';
          b.style.background = '#ffffff';
          b.style.boxShadow = 'none';
          var titleEl = b.querySelector('b');
          if (titleEl) titleEl.style.color = '#1e293b';
          b.querySelector('.target-check').style.display = 'none';
        });
        btn.style.borderColor = '#0284c7';
        btn.style.background = '#f0f9ff';
        btn.style.boxShadow = '0 2px 8px rgba(2,132,199,0.12)';
        var activeTitle = btn.querySelector('b');
        if (activeTitle) activeTitle.style.color = '#0369a1';
        btn.querySelector('.target-check').style.display = 'inline';

        var idx = parseInt(btn.getAttribute('data-idx'), 10);
        var pl = planes[idx];
        curTarget = { type: 'plane', ptIds: pl.ptIds, name: pl.name, desc: pl.desc };
        overlay.querySelector('#isect-target-badge').innerText = pl.name;
      };
      btn.ondblclick = function() {
        btn.onclick();
        overlay.querySelector('#btn-apply-isect').click();
      };
    });

    // Chọn Đường thẳng mục tiêu
    var lineBtns = overlay.querySelectorAll('.line-target-btn');
    lineBtns.forEach(function(btn) {
      btn.onclick = function() {
        lineBtns.forEach(function(b) {
          b.style.borderColor = '#e2e8f0';
          b.style.background = '#ffffff';
          b.style.boxShadow = 'none';
          var titleEl = b.querySelector('b');
          if (titleEl) titleEl.style.color = '#1e293b';
          b.querySelector('.target-check').style.display = 'none';
        });
        btn.style.borderColor = '#0284c7';
        btn.style.background = '#f0f9ff';
        btn.style.boxShadow = '0 2px 8px rgba(2,132,199,0.12)';
        var activeTitle = btn.querySelector('b');
        if (activeTitle) activeTitle.style.color = '#0369a1';
        btn.querySelector('.target-check').style.display = 'inline';

        var id1 = btn.getAttribute('data-id1');
        var id2 = btn.getAttribute('data-id2');
        var name = btn.getAttribute('data-name');
        curTarget = { type: 'line', ptIds: [id1, id2], name: name, desc: 'Đường thẳng ' + name };
        overlay.querySelector('#isect-target-badge').innerText = name;
      };
      btn.ondblclick = function() {
        btn.onclick();
        overlay.querySelector('#btn-apply-isect').click();
      };
    });

    // Nút thực hiện: Tìm giao điểm ngay
    overlay.querySelector('#btn-apply-isect').onclick = function() {
      if (!curLine || !curLine.id1 || !curLine.id2) {
        showSpatialToast('⚠️ Vui lòng chọn đường thẳng cần mở rộng!');
        return;
      }
      if (!curTarget || !curTarget.ptIds || curTarget.ptIds.length < 2) {
        showSpatialToast('⚠️ Vui lòng chọn đối tượng để tìm giao điểm!');
        return;
      }

      var customLabel = overlay.querySelector('#isect-label-input').value;
      close();

      executeLineIntersection(board, {
        ptAId: curLine.id1,
        ptBId: curLine.id2,
        targetType: curTarget.type,
        targetPlanePtIds: curTarget.type === 'plane' ? curTarget.ptIds : null,
        targetLinePtIds: curTarget.type === 'line' ? curTarget.ptIds : null,
        targetName: curTarget.name,
        label: customLabel
      });
    };
  }

  window.openSmartIntersectionModal = openSmartIntersectionModal;
  window.openSmartLinePlaneModal = openSmartIntersectionModal;
  window.openSmartPlaneIntersectionModal = openSmartPlaneIntersectionModal;
  window.executeTwoPlanesIntersection = executeTwoPlanesIntersection;
  window.getSolidPlanes = getSolidPlanes;
  window.executeLineIntersection = executeLineIntersection;

  function expandLinePlaneIntersection(board, linePtIds, planePtIds) {
    if (!board) return false;
    // Nếu chưa truyền đủ đường thẳng và mặt phẳng mục tiêu, mở giao diện chọn đối tượng
    if (!linePtIds || !planePtIds || linePtIds.length < 2 || planePtIds.length < 3) {
      openSmartIntersectionModal(board, linePtIds, planePtIds);
      return true;
    }
    return executeLineIntersection(board, {
      ptAId: linePtIds[0],
      ptBId: linePtIds[1],
      targetType: 'plane',
      targetPlanePtIds: planePtIds
    });
  }

  /**
   * 🌟 THÔNG BÁO NỔI THÔNG MINH (GLASSMORPHISM TOAST)
   */
  function showSpatialToast(msg, duration) {
    if (duration === undefined) duration = 3200;
    try {
      var el = document.getElementById('spatial-smart-toast');
      if (!el) {
        el = document.createElement('div');
        el.id = 'spatial-smart-toast';
        el.className = 'spatial-smart-toast';
        document.body.appendChild(el);
      }
      el.innerHTML = msg;
      el.classList.add('show');
      clearTimeout(el._timer);
      el._timer = setTimeout(function() {
        el.classList.remove('show');
      }, duration);
    } catch(e) {
      console.log('[Toast]', msg);
    }
  }
  window.showSpatialToast = showSpatialToast;

  /**
   * 🌟 DỰNG HÌNH CHIẾU VUÔNG GÓC CỦA ĐIỂM LÊN MẶT ĐÁY / MẶT PHẲNG (addPointProjection)
   */
  /**
   * 🌟 KÉO DÀI CẠNH / ĐOẠN THẲNG (extendSegmentEdge)
   */
  function extendSegmentEdge(board, params) {
    if (!board) return false;
    var pageIdx = board.sel ? board.sel.page : 0;
    var pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return false;

    var ptAId = params.ptAId;
    var ptBId = params.ptBId;
    if (!ptAId || !ptBId || ptAId === ptBId) {
      showSpatialToast("⚠️ Vui lòng chọn 1 cạnh để kéo dài!");
      return false;
    }

    var sol = pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid && !s.hidden; }) ||
              pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid; });

    var direction = params.direction || 'B'; // 'A' | 'B' | 'both'
    var ratio = Number(params.ratio) || 1.0; // 0.5 = kéo thêm 50% độ dài, 1.0 = gấp đôi
    var dashed = params.dashed !== false; // mặc định nét đứt chuẩn SGK
    var createPoint = params.createPoint !== false;
    var label = (params.label || '').trim();
    var color = params.color || (sol ? '#0284c7' : '#000000');

    var pMap2D = getPointMap(pg.geo);
    var ptA = pg.geo.points[ptAId], ptB = pg.geo.points[ptBId];
    var pA2D = pMap2D.get(ptAId), pB2D = pMap2D.get(ptBId);
    if (!ptA || !ptB || !pA2D || !pB2D) {
      showSpatialToast("⚠️ Không tìm thấy toạ độ của cạnh đã chọn!");
      return false;
    }

    var c = sol ? o4(sol.solid.view || Cp) : null;
    var zA = ptA.z != null ? ptA.z : 0;
    var zB = ptB.z != null ? ptB.z : 0;
    var pA3D = (sol && ptA.pos3d) ? [...ptA.pos3d] : (sol ? wo(c, [pA2D.x, pA2D.y, zA]) : null);
    var pB3D = (sol && ptB.pos3d) ? [...ptB.pos3d] : (sol ? wo(c, [pB2D.x, pB2D.y, zB]) : null);

    var existingLabels = new Set(Object.values(pg.geo.points).map(function(p) { return p.label; }).filter(Boolean));
    var candLabels = ["D", "E", "F", "M", "N", "P", "Q", "H", "K", "X", "Y"];
    function getNextLabel(preferred) {
      if (preferred && !existingLabels.has(preferred)) {
        existingLabels.add(preferred);
        return preferred;
      }
      var found = candLabels.find(function(l) { return !existingLabels.has(l); }) || "X";
      existingLabels.add(found);
      return found;
    }

    var newPoints = [];
    var newShapes = [];

    // Kéo dài về phía B (qua đỉnh B)
    if (direction === 'B' || direction === 'both') {
      var kB = 1 + ratio;
      var lblB = getNextLabel(label || null);
      var ptExtBId = 'pt_ext_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      var ptExtB = {
        id: ptExtBId,
        def: { t: 'on', a: ptAId, b: ptBId, k: kB },
        label: createPoint ? lblB : '',
        show: createPoint,
        group: sol ? sol.group : undefined,
        z: zA + kB * (zB - zA),
        pos3d: (sol && pA3D && pB3D) ? [
          Math.round((pA3D[0] + kB * (pB3D[0] - pA3D[0])) * 100) / 100,
          Math.round((pA3D[1] + kB * (pB3D[1] - pA3D[1])) * 100) / 100,
          Math.round((pA3D[2] + kB * (pB3D[2] - pA3D[2])) * 100) / 100
        ] : undefined
      };
      newPoints.push(ptExtB);
      newShapes.push({
        id: 'seg_ext_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        kind: 'segment',
        pts: [ptBId, ptExtBId],
        color: color,
        width: 2.2,
        dashed: dashed,
        group: sol ? sol.group : undefined,
        aux: true
      });
    }

    // Kéo dài về phía A (qua đỉnh A)
    if (direction === 'A' || direction === 'both') {
      var kA = -ratio;
      var lblA = getNextLabel((direction === 'A' ? label : '') || null);
      var ptExtAId = 'pt_ext_' + Date.now() + '_' + Math.floor(Math.random() * 1000) + '_a';
      var ptExtA = {
        id: ptExtAId,
        def: { t: 'on', a: ptAId, b: ptBId, k: kA },
        label: createPoint ? lblA : '',
        show: createPoint,
        group: sol ? sol.group : undefined,
        z: zA + kA * (zB - zA),
        pos3d: (sol && pA3D && pB3D) ? [
          Math.round((pA3D[0] + kA * (pB3D[0] - pA3D[0])) * 100) / 100,
          Math.round((pA3D[1] + kA * (pB3D[1] - pA3D[1])) * 100) / 100,
          Math.round((pA3D[2] + kA * (pB3D[2] - pA3D[2])) * 100) / 100
        ] : undefined
      };
      newPoints.push(ptExtA);
      newShapes.push({
        id: 'seg_ext_' + Date.now() + '_' + Math.floor(Math.random() * 1000) + '_a',
        kind: 'segment',
        pts: [ptAId, ptExtAId],
        color: color,
        width: 2.2,
        dashed: dashed,
        group: sol ? sol.group : undefined,
        aux: true
      });
    }

    board.commit(board.addGeo(pageIdx, newPoints, newShapes));
    if (sol) attachDrawnElementsToSolid(board, pageIdx, sol);
    board.redraw();
    board.emit();

    var edgeName = (ptA.label || 'A') + (ptB.label || 'B');
    var dirDesc = direction === 'B' ? ('về phía ' + (ptB.label || 'B')) : (direction === 'A' ? ('về phía ' + (ptA.label || 'A')) : 'cả hai phía');
    showSpatialToast('✨ Đã kéo dài cạnh <b>' + edgeName + '</b> ' + dirDesc + '!');
    return true;
  }
  window.extendSegmentEdge = extendSegmentEdge;

  /**
   * 🌟 HỘP THOẠI THÔNG MINH KÉO DÀI CẠNH (openSmartExtendEdgeModal)
   */
  function openSmartExtendEdgeModal(board, edgeId) {
    if (!board) return;
    var pageIdx = board.sel ? board.sel.page : 0;
    var pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return;

    var sol = pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid && !s.hidden; }) ||
              pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid; });

    // Thu thập danh sách các cạnh
    var edges = [];
    var seen = new Set();
    function addE(id1, id2, groupName) {
      if (!id1 || !id2 || id1 === id2) return;
      var k1 = id1 + '_' + id2, k2 = id2 + '_' + id1;
      if (seen.has(k1) || seen.has(k2)) return;
      seen.add(k1);
      var l1 = (pg.geo.points[id1] && pg.geo.points[id1].label) || id1;
      var l2 = (pg.geo.points[id2] && pg.geo.points[id2].label) || id2;
      edges.push({ id1: id1, id2: id2, name: l1 + l2, l1: l1, l2: l2, group: groupName });
    }

    // Các đoạn thẳng đã vẽ
    pg.geo.shapes.forEach(function(sh) {
      if ((sh.kind === 'segment' || sh.kind === 'line') && sh.pts && sh.pts.length >= 2 && !sh.hidden) {
        addE(sh.pts[0], sh.pts[1], 'Đoạn vẽ');
      }
    });

    if (sol && sol.pts) {
      var apexId = (sol.solid.of && sol.solid.of.startsWith('pyramid') || sol.pts.length === 5) ? sol.pts[sol.pts.length - 1] : null;
      var basePtIds = apexId ? sol.pts.slice(0, sol.pts.length - 1) : sol.pts;

      if (apexId) {
        basePtIds.forEach(function(bId) { addE(apexId, bId, 'Cạnh bên'); });
        for (var bi = 0; bi < basePtIds.length; bi++) {
          addE(basePtIds[bi], basePtIds[(bi + 1) % basePtIds.length], 'Cạnh đáy');
        }
      } else if (sol.pts.length >= 6) {
        var nBase = Math.floor(sol.pts.length / 2);
        for (var pi = 0; pi < nBase; pi++) {
          addE(sol.pts[pi], sol.pts[pi + nBase], 'Cạnh bên');
        }
        for (var bi = 0; bi < nBase; bi++) {
          addE(sol.pts[bi], sol.pts[(bi + 1) % nBase], 'Cạnh đáy dưới');
        }
        for (var bi = 0; bi < nBase; bi++) {
          addE(sol.pts[bi + nBase], sol.pts[(bi + 1) % nBase + nBase], 'Cạnh đáy trên');
        }
      }
    }

    if (edges.length === 0) {
      showSpatialToast("⚠️ Không tìm thấy cạnh nào để kéo dài!");
      return;
    }

    // Xác định cạnh được chọn mặc định
    var curEdge = null;
    if (board.sel && board.sel.shapes && board.sel.shapes.size === 1) {
      var selShId = Array.from(board.sel.shapes)[0];
      var selSh = pg.geo.shapes.find(function(s) { return s.id === selShId; });
      if (selSh && selSh.pts && selSh.pts.length >= 2) {
        curEdge = edges.find(function(e) { return (e.id1 === selSh.pts[0] && e.id2 === selSh.pts[1]) || (e.id1 === selSh.pts[1] && e.id2 === selSh.pts[0]); });
        if (!curEdge) {
          var l1 = (pg.geo.points[selSh.pts[0]] && pg.geo.points[selSh.pts[0]].label) || selSh.pts[0];
          var l2 = (pg.geo.points[selSh.pts[1]] && pg.geo.points[selSh.pts[1]].label) || selSh.pts[1];
          curEdge = { id1: selSh.pts[0], id2: selSh.pts[1], name: l1 + l2, l1: l1, l2: l2, group: 'Đang chọn' };
        }
      }
    }
    if (!curEdge && edges.length > 0) curEdge = edges[0];

    var curDir = 'B';
    var curRatio = 1.0;

    var existingLabels = new Set(Object.values(pg.geo.points).map(function(p) { return p.label; }).filter(Boolean));
    var candLabels = ["D", "E", "F", "M", "N", "P", "Q", "H", "K", "X", "Y"];
    var suggestedLabel = candLabels.find(function(l) { return !existingLabels.has(l); }) || "D";

    var oldModal = document.getElementById('spatial-extend-edge-wizard');
    if (oldModal) oldModal.remove();

    var overlay = document.createElement('div');
    overlay.id = 'spatial-extend-edge-wizard';
    overlay.className = 'spatial-modal-overlay';

    function renderEdgeChips() {
      return edges.map(function(e) {
        var isAct = curEdge && ((e.id1 === curEdge.id1 && e.id2 === curEdge.id2) || (e.id1 === curEdge.id2 && e.id2 === curEdge.id1));
        var st = isAct
          ? 'border:2px solid #0284c7;background:#e0f2fe;color:#0369a1;font-weight:700;'
          : 'border:1.5px solid #cbd5e1;background:#f8fafc;color:#1e293b;';
        return '<button class="spatial-chip extend-edge-chip ' + (isAct ? 'is-selected' : '') + '" data-id1="' + e.id1 + '" data-id2="' + e.id2 + '" data-name="' + e.name + '" data-l1="' + e.l1 + '" data-l2="' + e.l2 + '" style="' + st + '">' +
          e.name + ' <span style="font-size:10px;opacity:0.75">(' + e.group + ')</span>' +
        '</button>';
      }).join('');
    }

    overlay.innerHTML = '<div class="spatial-modal-card" style="max-width:440px;display:flex;flex-direction:column;">' +
      '<div class="spatial-modal-header">' +
        '<div class="spatial-modal-title">⤢ Kéo Dài Cạnh / Đoạn Thẳng</div>' +
        '<button class="spatial-modal-close" id="btn-close-extend-modal">✕</button>' +
      '</div>' +
      '<div class="spatial-modal-body" style="padding:16px 20px;overflow-y:auto;max-height:75vh;">' +
        
        '<div class="spatial-section-title" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
          '<span>1. CẠNH CẦN KÉO DÀI</span>' +
          '<span id="ext-edge-badge" style="background:#e0f2fe;color:#0284c7;font-weight:700;padding:3px 10px;border-radius:12px;font-size:13px;border:1px solid #bae6fd;">' +
            curEdge.name +
          '</span>' +
        '</div>' +
        '<div class="spatial-chips-wrap" id="ext-edge-chips" style="margin-bottom:14px;max-height:90px;overflow-y:auto;">' + renderEdgeChips() + '</div>' +

        '<div style="border-top:1px dashed #cbd5e1;margin:12px 0;"></div>' +

        '<div class="spatial-section-title" style="margin-bottom:8px;">2. HƯỚNG KÉO DÀI</div>' +
        '<div style="display:flex;gap:8px;margin-bottom:14px;">' +
          '<button id="btn-dir-b" class="ext-dir-btn" style="flex:1;padding:9px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;background:#0284c7;color:#fff;border:none;">' +
            '👉 Về phía ' + curEdge.l2 +
          '</button>' +
          '<button id="btn-dir-a" class="ext-dir-btn" style="flex:1;padding:9px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;">' +
            '👈 Về phía ' + curEdge.l1 +
          '</button>' +
          '<button id="btn-dir-both" class="ext-dir-btn" style="padding:9px 12px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;" title="Kéo dài cả 2 đầu">' +
            '↔️ Cả hai' +
          '</button>' +
        '</div>' +

        '<div class="spatial-section-title" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
          '<span>3. CHIỀU DÀI KÉO DÀI</span>' +
          '<span id="ext-ratio-badge" style="font-weight:700;color:#0284c7;font-size:13px;">100% (bằng cạnh)</span>' +
        '</div>' +
        '<div style="display:flex;gap:6px;margin-bottom:10px;">' +
          '<button class="ext-preset-len" data-ratio="0.5" style="flex:1;padding:6px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid #cbd5e1;background:#fff;">50%</button>' +
          '<button class="ext-preset-len" data-ratio="1.0" style="flex:1;padding:6px;border-radius:6px;font-size:12px;cursor:pointer;border:1.5px solid #0284c7;background:#e0f2fe;color:#0369a1;font-weight:700;">100%</button>' +
          '<button class="ext-preset-len" data-ratio="1.5" style="flex:1;padding:6px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid #cbd5e1;background:#fff;">150%</button>' +
          '<button class="ext-preset-len" data-ratio="2.0" style="flex:1;padding:6px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid #cbd5e1;background:#fff;">200%</button>' +
        '</div>' +
        '<input id="ext-ratio-slider" type="range" min="20" max="300" step="5" value="100" style="width:100%;margin-bottom:14px;accent-color:#0284c7;" />' +

        '<div style="border-top:1px dashed #cbd5e1;margin:12px 0;"></div>' +

        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
          '<span style="font-size:13px;font-weight:600;color:#334155;">Tên điểm mới:</span>' +
          '<div style="display:flex;align-items:center;gap:8px;">' +
            '<input id="ext-label-input" type="text" value="' + suggestedLabel + '" maxlength="3" style="width:48px;text-align:center;font-weight:700;font-size:15px;padding:4px;border:1.5px solid #94a3b8;border-radius:6px;color:#0284c7;background:#fff;" />' +
            '<label style="font-size:12px;color:#64748b;display:flex;align-items:center;gap:4px;cursor:pointer;"><input id="chk-create-point" type="checkbox" checked /> Tạo điểm</label>' +
          '</div>' +
        '</div>' +

        '<div style="display:flex;align-items:center;justify-content:space-between;">' +
          '<span style="font-size:13px;font-weight:600;color:#334155;">Kiểu nét vẽ:</span>' +
          '<div style="display:flex;gap:12px;font-size:13px;">' +
            '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;"><input type="radio" name="ext-dash" value="dashed" checked /> Nét đứt (---)</label>' +
            '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;"><input type="radio" name="ext-dash" value="solid" /> Nét liền (───)</label>' +
          '</div>' +
        '</div>' +

      '</div>' +

      '<div class="spatial-modal-footer" style="padding:12px 20px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;justify-content:flex-end;gap:10px;">' +
        '<button id="btn-cancel-ext" class="spatial-preset-btn" style="padding:8px 16px;margin:0;">Hủy</button>' +
        '<button id="btn-apply-ext" class="spatial-btn-primary" style="padding:9px 22px;font-size:14px;font-weight:700;border-radius:10px;background:#0284c7;color:#fff;border:none;cursor:pointer;">' +
          '✨ Kéo dài ngay' +
        '</button>' +
      '</div>' +
    '</div>';

    document.body.appendChild(overlay);

    var close = function() { overlay.remove(); };
    overlay.querySelector('#btn-close-extend-modal').onclick = close;
    overlay.querySelector('#btn-cancel-ext').onclick = close;
    overlay.onclick = function(e) { if (e.target === overlay) close(); };

    function updateDirButtons() {
      var btnB = overlay.querySelector('#btn-dir-b');
      var btnA = overlay.querySelector('#btn-dir-a');
      if (btnB) btnB.innerText = '👉 Về phía ' + curEdge.l2;
      if (btnA) btnA.innerText = '👈 Về phía ' + curEdge.l1;
    }

    var chips = overlay.querySelectorAll('.extend-edge-chip');
    chips.forEach(function(btn) {
      btn.onclick = function() {
        chips.forEach(function(b) {
          b.style.border = '1.5px solid #cbd5e1';
          b.style.background = '#f8fafc';
          b.style.color = '#1e293b';
          b.style.fontWeight = '500';
        });
        btn.style.border = '2px solid #0284c7';
        btn.style.background = '#e0f2fe';
        btn.style.color = '#0369a1';
        btn.style.fontWeight = '700';

        curEdge = {
          id1: btn.getAttribute('data-id1'),
          id2: btn.getAttribute('data-id2'),
          name: btn.getAttribute('data-name'),
          l1: btn.getAttribute('data-l1'),
          l2: btn.getAttribute('data-l2')
        };
        overlay.querySelector('#ext-edge-badge').innerText = curEdge.name;
        updateDirButtons();
      };
    });

    var btnDirB = overlay.querySelector('#btn-dir-b');
    var btnDirA = overlay.querySelector('#btn-dir-a');
    var btnDirBoth = overlay.querySelector('#btn-dir-both');

    function setDir(dir) {
      curDir = dir;
      [btnDirB, btnDirA, btnDirBoth].forEach(function(b) {
        b.style.background = '#f1f5f9';
        b.style.color = '#475569';
        b.style.border = '1px solid #cbd5e1';
      });
      var act = dir === 'B' ? btnDirB : (dir === 'A' ? btnDirA : btnDirBoth);
      act.style.background = '#0284c7';
      act.style.color = '#fff';
      act.style.border = 'none';
    }

    btnDirB.onclick = function() { setDir('B'); };
    btnDirA.onclick = function() { setDir('A'); };
    btnDirBoth.onclick = function() { setDir('both'); };

    var slider = overlay.querySelector('#ext-ratio-slider');
    var badgeRatio = overlay.querySelector('#ext-ratio-badge');
    var presetBtns = overlay.querySelectorAll('.ext-preset-len');

    function updateRatioDisplay(val) {
      curRatio = val / 100;
      badgeRatio.innerText = val + '%' + (val === 100 ? ' (bằng cạnh)' : (val === 50 ? ' (nửa cạnh)' : (val === 200 ? ' (gấp đôi)' : '')));
      slider.value = val;
      presetBtns.forEach(function(b) {
        var r = parseFloat(b.getAttribute('data-ratio')) * 100;
        if (Math.abs(r - val) < 2) {
          b.style.border = '1.5px solid #0284c7';
          b.style.background = '#e0f2fe';
          b.style.color = '#0369a1';
          b.style.fontWeight = '700';
        } else {
          b.style.border = '1px solid #cbd5e1';
          b.style.background = '#fff';
          b.style.color = '#1e293b';
          b.style.fontWeight = 'normal';
        }
      });
    }

    slider.oninput = function() { updateRatioDisplay(parseInt(slider.value, 10)); };
    presetBtns.forEach(function(btn) {
      btn.onclick = function() {
        var r = parseFloat(btn.getAttribute('data-ratio')) * 100;
        updateRatioDisplay(r);
      };
    });

    overlay.querySelector('#btn-apply-ext').onclick = function() {
      var customLbl = overlay.querySelector('#ext-label-input').value;
      var chkPt = overlay.querySelector('#chk-create-point').checked;
      var isDashed = overlay.querySelector('input[name="ext-dash"]:checked').value === 'dashed';

      close();

      extendSegmentEdge(board, {
        ptAId: curEdge.id1,
        ptBId: curEdge.id2,
        direction: curDir,
        ratio: curRatio,
        dashed: isDashed,
        createPoint: chkPt,
        label: customLbl ? customLbl.trim() : null
      });
    };
  }
  window.openSmartExtendEdgeModal = openSmartExtendEdgeModal;

  /**
   * 🌟 DỰNG GIAO ĐIỂM CỦA 2 ĐOẠN THẲNG (addSegmentIntersection)
   */
  function addSegmentIntersection(board, seg1Id, seg2Id) {
    if (!board) return false;
    var pageIdx = board.sel ? board.sel.page : 0;
    var pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return false;

    var s1Id = seg1Id, s2Id = seg2Id;
    if (!s1Id || !s2Id) {
      if (board.sel && board.sel.shapes && board.sel.shapes.size === 2) {
        var arr = Array.from(board.sel.shapes);
        s1Id = arr[0]; s2Id = arr[1];
      }
    }

    if (!s1Id || !s2Id) {
      openSmartIntersectionModal(board);
      return true;
    }

    var sh1 = pg.geo.shapes.find(function(s) { return s.id === s1Id; });
    var sh2 = pg.geo.shapes.find(function(s) { return s.id === s2Id; });
    if (!sh1 || !sh2 || !sh1.pts || !sh2.pts || sh1.pts.length < 2 || sh2.pts.length < 2) {
      openSmartIntersectionModal(board);
      return true;
    }

    return executeLineIntersection(board, {
      ptAId: sh1.pts[0],
      ptBId: sh1.pts[1],
      targetType: 'line',
      targetLinePtIds: [sh2.pts[0], sh2.pts[1]]
    });
  }
  window.addSegmentIntersection = addSegmentIntersection;

  function addPointProjection(board, ptId) {
    if (!board) return false;
    var pageIdx = board.sel ? board.sel.page : 0;
    var pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return false;

    var sol = pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid && !s.hidden; }) ||
              pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid; });
    if (!sol || !sol.solid) {
      showSpatialToast("⚠️ Vui lòng vẽ hoặc chọn một khối hình không gian trước!");
      return false;
    }

    var targetPtId = ptId;
    if (!targetPtId && board.sel && board.sel.points && board.sel.points.size >= 1) {
      targetPtId = Array.from(board.sel.points)[0];
    }
    if (!targetPtId) {
      targetPtId = sol.pts[sol.pts.length - 1];
    }

    attachDrawnElementsToSolid(board, pageIdx, sol);
    var pMap2D = getPointMap(pg.geo);
    var ptM = pg.geo.points[targetPtId];
    var pM2D = pMap2D.get(targetPtId);
    if (!ptM || !pM2D) return false;

    var c = o4(sol.solid.view || Cp);
    var zVal = ptM.z !== undefined ? ptM.z : 0;
    var pM3D = ptM.pos3d ? ptM.pos3d.slice() : wo(c, [pM2D.x, pM2D.y, zVal]);

    var basePts = sol.pts.slice(0, sol.pts.length - 1);
    var b1_2d = pMap2D.get(basePts[0]), b2_2d = pMap2D.get(basePts[1]), b3_2d = pMap2D.get(basePts[2]);
    var normal = [0, 0, 1], dist = 0;
    if (b1_2d && b2_2d && b3_2d) {
      var b1_3d = (pg.geo.points[basePts[0]] && pg.geo.points[basePts[0]].pos3d) ? pg.geo.points[basePts[0]].pos3d : wo(c, [b1_2d.x, b1_2d.y, 0]);
      var b2_3d = (pg.geo.points[basePts[1]] && pg.geo.points[basePts[1]].pos3d) ? pg.geo.points[basePts[1]].pos3d : wo(c, [b2_2d.x, b2_2d.y, 0]);
      var b3_3d = (pg.geo.points[basePts[2]] && pg.geo.points[basePts[2]].pos3d) ? pg.geo.points[basePts[2]].pos3d : wo(c, [b3_2d.x, b3_2d.y, 0]);
      var u1 = [b2_3d[0] - b1_3d[0], b2_3d[1] - b1_3d[1], b2_3d[2] - b1_3d[2]];
      var u2 = [b3_3d[0] - b1_3d[0], b3_3d[1] - b1_3d[1], b3_3d[2] - b1_3d[2]];
      var nc = [u1[1]*u2[2] - u1[2]*u2[1], u1[2]*u2[0] - u1[0]*u2[2], u1[0]*u2[1] - u1[1]*u2[0]];
      var len = Math.hypot(nc[0], nc[1], nc[2]);
      if (len > 1e-5) {
        normal = [nc[0]/len, nc[1]/len, nc[2]/len];
        dist = normal[0]*b1_3d[0] + normal[1]*b1_3d[1] + normal[2]*b1_3d[2];
      }
    }

    var dotM = normal[0]*pM3D[0] + normal[1]*pM3D[1] + normal[2]*pM3D[2];
    var diff = dotM - dist;
    var pH3D = [
      pM3D[0] - diff * normal[0],
      pM3D[1] - diff * normal[1],
      pM3D[2] - diff * normal[2]
    ];

    var viewMat = sol.solid.view || Cp;
    var pH2D = {
      x: viewMat[0]*pH3D[0] + viewMat[1]*pH3D[1] + viewMat[2]*pH3D[2],
      y: viewMat[3]*pH3D[0] + viewMat[4]*pH3D[1] + viewMat[5]*pH3D[2]
    };
    var zH = viewMat[6]*pH3D[0] + viewMat[7]*pH3D[1] + viewMat[8]*pH3D[2];

    var existingLabels = new Set(Object.values(pg.geo.points).map(function(p) { return p.label; }).filter(Boolean));
    var candLabels = ["H", "H'", "K", "K'", "H1", "H2"];
    var chosenLabel = candLabels.find(function(lbl) { return !existingLabels.has(lbl); }) || "H";

    var ptHId = "pt_proj_" + Date.now();
    var ptH = {
      id: ptHId,
      def: { t: "free", x: Math.round(pH2D.x * 10) / 10, y: Math.round(pH2D.y * 10) / 10 },
      label: chosenLabel,
      show: true,
      z: zH,
      group: sol.group,
      pos3d: [Math.round(pH3D[0]*100)/100, Math.round(pH3D[1]*100)/100, Math.round(pH3D[2]*100)/100]
    };

    var newShapes = [
      {
        id: "seg_proj_" + Date.now(),
        kind: "segment",
        pts: [targetPtId, ptHId],
        color: "#0284c7",
        width: 2,
        dashed: true,
        group: sol.group,
        aux: true
      }
    ];

    if (basePts.length > 0) {
      newShapes.push({
        id: "right_proj_" + Date.now(),
        kind: "right",
        pts: [targetPtId, ptHId, basePts[0]],
        group: sol.group,
        aux: true
      });
    }

    board.commit(board.addGeo(pageIdx, [ptH], newShapes));
    attachDrawnElementsToSolid(board, pageIdx, sol);
    board.redraw();
    board.emit();

    showSpatialToast("⊥ Đã dựng hình chiếu vuông góc <b>" + chosenLabel + "</b> của " + (ptM.label || 'điểm') + " lên đáy!");
    return true;
  }
  window.addPointProjection = addPointProjection;

  /**
   * 🌟 DỰNG TRUNG ĐIỂM ĐOẠN THẲNG (addSegmentMidpoint)
   */
  function addSegmentMidpoint(board, ptAId, ptBId) {
    if (!board) return false;
    var pageIdx = board.sel ? board.sel.page : 0;
    var pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return false;

    var idA = ptAId, idB = ptBId;
    if (!idA || !idB) {
      if (board.sel && board.sel.points && board.sel.points.size >= 2) {
        var arr = Array.from(board.sel.points);
        idA = arr[0]; idB = arr[1];
      } else if (board.sel && board.sel.shapes && board.sel.shapes.size === 1) {
        var sh = pg.geo.shapes.find(function(s) { return s.id === Array.from(board.sel.shapes)[0]; });
        if (sh && sh.pts && sh.pts.length >= 2) {
          idA = sh.pts[0]; idB = sh.pts[1];
        }
      }
    }

    if (!idA || !idB || idA === idB) {
      showSpatialToast("⚠️ Vui lòng chọn 2 điểm hoặc 1 đoạn thẳng để lấy trung điểm!");
      return false;
    }

    var sol = pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid; });
    var groupId = sol ? (sol.group || ('grp_3d_' + Date.now())) : undefined;
    if (sol && !sol.group) sol.group = groupId;
    if (sol) attachDrawnElementsToSolid(board, pageIdx, sol);

    var pMap2D = getPointMap(pg.geo);
    var ptA = pg.geo.points[idA], ptB = pg.geo.points[idB];
    var pA2D = pMap2D.get(idA), pB2D = pMap2D.get(idB);
    if (!ptA || !ptB || !pA2D || !pB2D) return false;

    var zA = (ptA.z !== undefined && Number.isFinite(ptA.z)) ? ptA.z : 0;
    var zB = (ptB.z !== undefined && Number.isFinite(ptB.z)) ? ptB.z : 0;
    var midZ = (zA + zB) / 2;

    var mid2D = { x: (pA2D.x + pB2D.x) / 2, y: (pA2D.y + pB2D.y) / 2 };
    var mid3D = null;
    if (sol && sol.solid) {
      var c = o4(sol.solid.view || Cp);
      var pA3D = ptA.pos3d ? ptA.pos3d.slice() : wo(c, [pA2D.x, pA2D.y, zA]);
      var pB3D = ptB.pos3d ? ptB.pos3d.slice() : wo(c, [pB2D.x, pB2D.y, zB]);
      mid3D = [(pA3D[0] + pB3D[0]) / 2, (pA3D[1] + pB3D[1]) / 2, (pA3D[2] + pB3D[2]) / 2];
    }

    var existingLabels = new Set(Object.values(pg.geo.points).map(function(p) { return p.label; }).filter(Boolean));
    var candLabels = ["M", "N", "P", "Q", "I", "J", "K", "E", "F"];
    var chosenLabel = candLabels.find(function(lbl) { return !existingLabels.has(lbl); }) || "M";

    var ptMidId = "pt_mid_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    var ptMid = {
      id: ptMidId,
      def: { t: "mid", a: idA, b: idB },
      label: chosenLabel,
      show: true,
      group: groupId,
      z: midZ,
      pos3d: mid3D ? [Math.round(mid3D[0]*100)/100, Math.round(mid3D[1]*100)/100, Math.round(mid3D[2]*100)/100] : undefined
    };

    board.commit(board.addGeo(pageIdx, [ptMid], []));
    if (board.sel && board.sel.points) {
      board.sel.points.add(ptMidId);
    }
    if (sol) attachDrawnElementsToSolid(board, pageIdx, sol);
    board.redraw();
    board.emit();

    showSpatialToast("• Đã dựng trung điểm <b>" + chosenLabel + "</b> của " + (ptA.label || 'A') + (ptB.label || 'B') + "!");
    return true;
  }
  window.addSegmentMidpoint = addSegmentMidpoint;

  /**
   * 🌟 DỰNG TRỌNG TÂM TAM GIÁC (addTriangleCentroid)
   */
  function addTriangleCentroid(board, ptAId, ptBId, ptCId) {
    if (!board) return false;
    var pageIdx = board.sel ? board.sel.page : 0;
    var pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return false;

    var ids = [ptAId, ptBId, ptCId].filter(Boolean);
    if (ids.length < 3 && board.sel && board.sel.points && board.sel.points.size >= 3) {
      ids = Array.from(board.sel.points).slice(0, 3);
    }
    if (ids.length < 3) {
      showSpatialToast("⚠️ Vui lòng chọn 3 đỉnh của tam giác để dựng trọng tâm!");
      return false;
    }

    var sol = pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid; });
    var groupId = sol ? (sol.group || ('grp_3d_' + Date.now())) : undefined;
    if (sol && !sol.group) sol.group = groupId;
    if (sol) attachDrawnElementsToSolid(board, pageIdx, sol);

    var pMap2D = getPointMap(pg.geo);
    var pA = pMap2D.get(ids[0]), pB = pMap2D.get(ids[1]), pC = pMap2D.get(ids[2]);
    if (!pA || !pB || !pC) return false;

    var ptA = pg.geo.points[ids[0]], ptB = pg.geo.points[ids[1]], ptC = pg.geo.points[ids[2]];
    var zA = (ptA && ptA.z !== undefined && Number.isFinite(ptA.z)) ? ptA.z : 0;
    var zB = (ptB && ptB.z !== undefined && Number.isFinite(ptB.z)) ? ptB.z : 0;
    var zC = (ptC && ptC.z !== undefined && Number.isFinite(ptC.z)) ? ptC.z : 0;

    var g2D = { x: (pA.x + pB.x + pC.x) / 3, y: (pA.y + pB.y + pC.y) / 3 };
    var gZ = (zA + zB + zC) / 3;

    var midBC = { x: (pB.x + pC.x) / 2, y: (pB.y + pC.y) / 2 };
    var midZ = (zB + zC) / 2;

    var g3D = null;
    var mid3D = null;
    if (sol && sol.solid) {
      var c = o4(sol.solid.view || Cp);
      var pA3D = (ptA && ptA.pos3d) || wo(c, [pA.x, pA.y, zA]);
      var pB3D = (ptB && ptB.pos3d) || wo(c, [pB.x, pB.y, zB]);
      var pC3D = (ptC && ptC.pos3d) || wo(c, [pC.x, pC.y, zC]);
      g3D = [(pA3D[0]+pB3D[0]+pC3D[0])/3, (pA3D[1]+pB3D[1]+pC3D[1])/3, (pA3D[2]+pB3D[2]+pC3D[2])/3];
      mid3D = [(pB3D[0]+pC3D[0])/2, (pB3D[1]+pC3D[1])/2, (pB3D[2]+pC3D[2])/2];
    }

    var ptMidId = "pt_cen_mid_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    var ptMid = {
      id: ptMidId,
      def: { t: "mid", a: ids[1], b: ids[2] },
      label: "",
      show: false,
      group: groupId,
      z: midZ,
      pos3d: mid3D ? [Math.round(mid3D[0]*100)/100, Math.round(mid3D[1]*100)/100, Math.round(mid3D[2]*100)/100] : undefined
    };

    var ptGId = "pt_cen_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    var ptG = {
      id: ptGId,
      def: { t: "on", a: ids[0], b: ptMidId, k: 2/3 },
      label: "G",
      show: true,
      group: groupId,
      z: gZ,
      pos3d: g3D ? [Math.round(g3D[0]*100)/100, Math.round(g3D[1]*100)/100, Math.round(g3D[2]*100)/100] : undefined
    };

    // Kiểm tra xem mặt tam giác này là mặt thấy hay mặt khuất:
    // Nếu có cạnh biên nào là nét đứt -> mặt khuất -> trung tuyến vẽ nét đứt.
    // Nếu tất cả các cạnh biên giữa các đỉnh là nét liền -> mặt thấy -> trung tuyến vẽ nét liền.
    var isFaceDashed = false;
    var allSegs = pg.geo.shapes.filter(function(s) { return s.kind === 'segment'; });
    var p0 = ids[0], p1 = ids[1], p2 = ids[2];
    var faceEdges = [
      [p0, p1], [p1, p0],
      [p1, p2], [p2, p1],
      [p2, p0], [p0, p2]
    ];
    for (var fi = 0; fi < allSegs.length; fi++) {
      var sg = allSegs[fi];
      var matchesEdge = faceEdges.some(function(fe) {
        return fe[0] === sg.pts[0] && fe[1] === sg.pts[1];
      });
      if (matchesEdge && sg.dashed) {
        isFaceDashed = true;
        break;
      }
    }

    var newShapes = [
      {
        id: "seg_median_" + Date.now(),
        kind: "segment",
        pts: [ids[0], ptMidId],
        color: "#64748b",
        width: 1.5,
        dashed: isFaceDashed,
        group: groupId,
        aux: true
      }
    ];

    board.commit(board.addGeo(pageIdx, [ptG, ptMid], newShapes));
    if (sol) attachDrawnElementsToSolid(board, pageIdx, sol);
    if (typeof board.selectGeo === 'function') {
      board.selectGeo(pageIdx, [ptGId], []);
    } else {
      board.sel = { page: pageIdx, strokes: new Set(), items: new Set(), points: new Set([ptGId]), shapes: new Set() };
    }
    board.redraw();
    board.emit();

    showSpatialToast("G Đã dựng trọng tâm <b>G</b> của tam giác!");
    return true;
  }
  window.addTriangleCentroid = addTriangleCentroid;
  /**
   * 🌟 DỰNG TRỌNG TÂM / TÂM MẶT THEO MẶT PHẲNG ĐÃ CHỌN (3D Face Centroid)
   */
  function addFaceCentroidByPlane(board, plane) {
    if (!board || !plane) return false;
    var ptIds = plane.ptIds;
    if (!ptIds || ptIds.length < 3) return false;

    if (ptIds.length === 3) {
      return addTriangleCentroid(board, ptIds[0], ptIds[1], ptIds[2]);
    }

    var pageIdx = board.sel ? board.sel.page : 0;
    var pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return false;

    var sol = pg.geo.shapes.find(function(s) { return s.kind === 'solid' && !s.hidden; }) ||
              pg.geo.shapes.find(function(s) { return s.kind === 'solid'; });
    var groupId = sol ? (sol.group || ('grp_3d_' + Date.now())) : undefined;
    if (sol && !sol.group) sol.group = groupId;
    if (sol) attachDrawnElementsToSolid(board, pageIdx, sol);

    var pMap2D = getPointMap(pg.geo);
    var pA = pMap2D.get(ptIds[0]), pB = pMap2D.get(ptIds[1]), pC = pMap2D.get(ptIds[2]), pD = pMap2D.get(ptIds[3]);
    if (!pA || !pB || !pC || !pD) return false;

    var ptA = pg.geo.points[ptIds[0]], ptB = pg.geo.points[ptIds[1]], ptC = pg.geo.points[ptIds[2]], ptD = pg.geo.points[ptIds[3]];
    var zA = (ptA && ptA.z !== undefined && Number.isFinite(ptA.z)) ? ptA.z : 0;
    var zB = (ptB && ptB.z !== undefined && Number.isFinite(ptB.z)) ? ptB.z : 0;
    var zC = (ptC && ptC.z !== undefined && Number.isFinite(ptC.z)) ? ptC.z : 0;
    var zD = (ptD && ptD.z !== undefined && Number.isFinite(ptD.z)) ? ptD.z : 0;
    var oZ = (zA + zB + zC + zD) / 4;

    var o2D = {
      x: (pA.x + pB.x + pC.x + pD.x) / 4,
      y: (pA.y + pB.y + pC.y + pD.y) / 4
    };

    var o3D = null;
    if (sol && sol.solid) {
      var c = o4(sol.solid.view || Cp);
      var pA3D = ptA.pos3d || wo(c, [pA.x, pA.y, zA]);
      var pB3D = ptB.pos3d || wo(c, [pB.x, pB.y, zB]);
      var pC3D = ptC.pos3d || wo(c, [pC.x, pC.y, zC]);
      var pD3D = ptD.pos3d || wo(c, [pD.x, pD.y, zD]);
      o3D = [
        (pA3D[0] + pB3D[0] + pC3D[0] + pD3D[0]) / 4,
        (pA3D[1] + pB3D[1] + pC3D[1] + pD3D[1]) / 4,
        (pA3D[2] + pB3D[2] + pC3D[2] + pD3D[2]) / 4
      ];
    }

    var existingLabels = Object.values(pg.geo.points).map(function(p){ return p.label; });
    var oLabel = "O";
    if (existingLabels.includes("O")) {
      for (var k = 1; k <= 9; k++) {
        if (!existingLabels.includes("O" + k)) {
          oLabel = "O" + k;
          break;
        }
      }
    }

    var ptOId = "pt_center_" + Date.now();
    var ptO = {
      id: ptOId,
      def: { t: "free", x: o2D.x, y: o2D.y },
      label: oLabel,
      show: true,
      group: groupId,
      z: oZ,
      pos3d: o3D ? [Math.round(o3D[0]*100)/100, Math.round(o3D[1]*100)/100, Math.round(o3D[2]*100)/100] : undefined
    };

    var isQuadDashed = false;
    var allSegsQuad = pg.geo.shapes.filter(function(s) { return s.kind === 'segment'; });
    var quadEdges = [
      [ptIds[0], ptIds[1]], [ptIds[1], ptIds[0]],
      [ptIds[1], ptIds[2]], [ptIds[2], ptIds[1]],
      [ptIds[2], ptIds[3]], [ptIds[3], ptIds[2]],
      [ptIds[3], ptIds[0]], [ptIds[0], ptIds[3]]
    ];
    for (var fq = 0; fq < allSegsQuad.length; fq++) {
      var sgQ = allSegsQuad[fq];
      var matchesQEdge = quadEdges.some(function(qe) {
        return qe[0] === sgQ.pts[0] && qe[1] === sgQ.pts[1];
      });
      if (matchesQEdge && sgQ.dashed) {
        isQuadDashed = true;
        break;
      }
    }

    var newShapes = [
      {
        id: "seg_diag1_" + Date.now(),
        kind: "segment",
        pts: [ptIds[0], ptIds[2]],
        color: "#94a3b8",
        width: 1.5,
        dashed: isQuadDashed,
        group: sol ? sol.group : undefined,
        aux: true
      },
      {
        id: "seg_diag2_" + Date.now(),
        kind: "segment",
        pts: [ptIds[1], ptIds[3]],
        color: "#94a3b8",
        width: 1.5,
        dashed: isQuadDashed,
        group: sol ? sol.group : undefined,
        aux: true
      }
    ];

    board.commit(board.addGeo(pageIdx, [ptO], newShapes));
    if (sol) attachDrawnElementsToSolid(board, pageIdx, sol);
    if (typeof board.selectGeo === 'function') { board.selectGeo(pageIdx, [ptOId], []); } else { board.sel = { page: pageIdx, strokes: new Set(), items: new Set(), points: new Set([ptOId]), shapes: new Set() }; }
    board.redraw();
    board.emit();
    showSpatialToast("⭐ Đã dựng tâm " + oLabel + " mặt " + (plane.name || ""));
    return true;
  }
  window.addFaceCentroidByPlane = addFaceCentroidByPlane;


  /**
   * 🌟 HỘP THOẠI THÔNG MINH: CHỌN MẶT PHẲNG (Smart Plane Wizard)
   */
  function openSmartPlaneModal(board) {
    if (!board) return;
    var pageIdx = board.sel ? board.sel.page : 0;
    var pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return;

    var sol = pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid && !s.hidden; }) ||
              pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid; });
    if (!sol || !sol.solid) {
      showSpatialToast("⚠️ Vui lòng vẽ hoặc chọn một khối hình không gian trước!");
      return;
    }

    var old = document.getElementById('spatial-plane-wizard');
    if (old) old.remove();

    var overlay = document.createElement('div');
    overlay.id = 'spatial-plane-wizard';
    overlay.className = 'spatial-modal-overlay';

    var allPts = sol.pts.map(function(id) { return { id: id, label: (pg.geo.points[id] && pg.geo.points[id].label) ? pg.geo.points[id].label : id }; });
    var basePts = sol.pts.slice(0, sol.pts.length - 1).map(function(id) { return { id: id, label: (pg.geo.points[id] && pg.geo.points[id].label) ? pg.geo.points[id].label : id }; });
    var apexPt = { id: sol.pts[sol.pts.length - 1], label: (pg.geo.points[sol.pts[sol.pts.length - 1]] && pg.geo.points[sol.pts[sol.pts.length - 1]].label) ? pg.geo.points[sol.pts[sol.pts.length - 1]].label : 'S' };

    var selectedChips = [];

    var chipsHtml = allPts.map(function(p) {
      return '<button class="spatial-chip" data-id="' + p.id + '">' + p.label + '</button>';
    }).join('');

    var diagName = apexPt.label + (basePts[0] ? basePts[0].label : 'A') + (basePts[2] ? basePts[2].label : (basePts[1] ? basePts[1].label : 'C'));
    var baseName = basePts.map(function(p){ return p.label; }).join('');
    var sideName = apexPt.label + (basePts[0] ? basePts[0].label : 'A') + (basePts[1] ? basePts[1].label : 'B');

    overlay.innerHTML = '<div class="spatial-modal-card">' +
      '<div class="spatial-modal-header">' +
        '<div class="spatial-modal-title">📐 Mở Rộng Mặt Phẳng (Tìm Giao Tuyến)</div>' +
        '<button class="spatial-modal-close" id="btn-close-sp-modal">✕</button>' +
      '</div>' +
      '<div class="spatial-modal-body">' +
        '<div class="spatial-section-title">⚡ Chọn nhanh mặt phẳng mẫu SGK</div>' +
        '<div class="spatial-preset-list">' +
          '<button class="spatial-preset-btn" id="btn-pre-diag">' +
            '<span class="p-icon">📐</span>' +
            '<div><b>Mặt chéo (' + diagName + ')</b><div style="font-size:12px;color:#64748b">Cắt xuyên qua trục khối hình</div></div>' +
          '</button>' +
          '<button class="spatial-preset-btn" id="btn-pre-base">' +
            '<span class="p-icon">🟩</span>' +
            '<div><b>Mặt phẳng đáy (' + baseName + ')</b><div style="font-size:12px;color:#64748b">Mở rộng mặt phẳng đáy</div></div>' +
          '</button>' +
          '<button class="spatial-preset-btn" id="btn-pre-side">' +
            '<span class="p-icon">🔺</span>' +
            '<div><b>Mặt phẳng bên (' + sideName + ')</b><div style="font-size:12px;color:#64748b">Mở rộng mặt phẳng cạnh bên</div></div>' +
          '</button>' +
        '</div>' +
        '<div class="spatial-section-title">👉 Hoặc chọn 3 đỉnh bất kỳ trên khối:</div>' +
        '<div class="spatial-chips-wrap" id="sp-chips-container">' + chipsHtml + '</div>' +
        '<div id="sp-selected-hint" style="font-size:13px;color:#0284c7;font-weight:600">Đã chọn: 0/3 điểm</div>' +
      '</div>' +
      '<div class="spatial-modal-footer">' +
        '<button class="spatial-btn-primary" id="btn-apply-plane" disabled style="opacity:0.6">✨ Mở rộng mặt phẳng ngay</button>' +
      '</div>' +
    '</div>';

    document.body.appendChild(overlay);

    var close = function() { overlay.remove(); };
    overlay.querySelector('#btn-close-sp-modal').onclick = close;
    overlay.onclick = function(e) { if (e.target === overlay) close(); };

    overlay.querySelector('#btn-pre-diag').onclick = function() {
      close();
      var p3 = [apexPt.id, basePts[0] ? basePts[0].id : null, (basePts[2] ? basePts[2].id : (basePts[1] ? basePts[1].id : null))].filter(Boolean);
      expandPlaneFrom3Points(board, p3);
    };

    overlay.querySelector('#btn-pre-base').onclick = function() {
      close();
      var p3 = basePts.slice(0, 3).map(function(p) { return p.id; });
      expandPlaneFrom3Points(board, p3);
    };

    overlay.querySelector('#btn-pre-side').onclick = function() {
      close();
      var p3 = [apexPt.id, basePts[0] ? basePts[0].id : null, basePts[1] ? basePts[1].id : null].filter(Boolean);
      expandPlaneFrom3Points(board, p3);
    };

    var chips = overlay.querySelectorAll('.spatial-chip');
    var applyBtn = overlay.querySelector('#btn-apply-plane');
    var hint = overlay.querySelector('#sp-selected-hint');

    chips.forEach(function(ch) {
      ch.onclick = function() {
        var id = ch.dataset.id;
        var idx = selectedChips.indexOf(id);
        if (idx !== -1) {
          selectedChips.splice(idx, 1);
          ch.classList.remove('selected');
        } else {
          if (selectedChips.length < 3) {
            selectedChips.push(id);
            ch.classList.add('selected');
          }
        }
        hint.innerText = "Đã chọn: " + selectedChips.length + "/3 điểm " +
          (selectedChips.length ? "(" + selectedChips.map(function(i) { return (pg.geo.points[i] && pg.geo.points[i].label) ? pg.geo.points[i].label : i; }).join(', ') + ")" : "");
        if (selectedChips.length === 3) {
          applyBtn.disabled = false;
          applyBtn.style.opacity = '1';
        } else {
          applyBtn.disabled = true;
          applyBtn.style.opacity = '0.6';
        }
      };
    });

    applyBtn.onclick = function() {
      if (selectedChips.length === 3) {
        close();
        expandPlaneFrom3Points(board, selectedChips);
      }
    };
  }
  window.openSmartPlaneModal = openSmartPlaneModal;


  
  /**
   * 🌟 TÔ MÀU MẶT PHẲNG & CÁC MẶT CỦA KHỐI 3D (Solid Face & Plane Coloring)
   */
  function getSolidPlanes(board) {
    if (!board) return [];
    var pageIdx = board.sel ? board.sel.page : 0;
    var pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return [];

    var sol = null;
    if (typeof board.selectedSolid === 'function') {
      var sInfo = board.selectedSolid();
      if (sInfo && sInfo.id) sol = pg.geo.shapes.find(function(s) { return s.id === sInfo.id; });
    }
    if (!sol) {
      sol = pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid && !s.hidden; }) ||
            pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid; });
    }
    if (!sol || !sol.solid) return [];

    var getLabel = function(id) {
      return (pg.geo.points[id] && pg.geo.points[id].label) ? pg.geo.points[id].label : id;
    };

    var curFc = sol.solid.faceColors || {};
    var planes = [];
    var faces = sol.solid.faces || [];
    faces.forEach(function(fIndices, idx) {
      var ptIds = fIndices.map(function(i) { return sol.pts[i]; });
      var name = ptIds.map(getLabel).join('');
      var isBase = idx === 0;
      var isTop = (sol.solid.of === 'box' || sol.solid.of === 'prism3' || sol.solid.of === 'cube') ? idx === 1 : false;
      var desc = isBase ? 'Mặt đáy' : (isTop ? 'Đáy trên' : 'Mặt bên');
      var fKey = 'face_' + idx;
      planes.push({
        key: fKey,
        name: '(' + name + ')',
        desc: desc,
        ptIds: ptIds,
        faceIdx: idx,
        color: curFc[fKey] ? (typeof curFc[fKey] === 'string' ? curFc[fKey] : curFc[fKey].color) : null
      });
    });

    // Các mặt chéo chuẩn SGK cho hình chóp đáy tứ giác và hình hộp
    if (sol.pts.length === 5) {
      var A = sol.pts[0], B = sol.pts[1], C = sol.pts[2], D = sol.pts[3], S = sol.pts[4];
      planes.push({
        key: 'diag_SAC',
        name: '(' + [S, A, C].map(getLabel).join('') + ')',
        desc: 'Mặt chéo',
        ptIds: [S, A, C],
        color: curFc['diag_SAC'] ? (typeof curFc['diag_SAC'] === 'string' ? curFc['diag_SAC'] : curFc['diag_SAC'].color) : null
      });
      planes.push({
        key: 'diag_SBD',
        name: '(' + [S, B, D].map(getLabel).join('') + ')',
        desc: 'Mặt chéo',
        ptIds: [S, B, D],
        color: curFc['diag_SBD'] ? (typeof curFc['diag_SBD'] === 'string' ? curFc['diag_SBD'] : curFc['diag_SBD'].color) : null
      });
    } else if (sol.pts.length === 6 && (sol.solid.of === 'prism3' || !sol.solid.of)) {
      var A = sol.pts[0], B = sol.pts[1], C = sol.pts[2];
      var A1 = sol.pts[3], B1 = sol.pts[4], C1 = sol.pts[5];
      planes.push({
        key: 'cross_A_BC',
        name: '(' + [A1, B, C].map(getLabel).join('') + ')',
        desc: 'Mặt phẳng chéo (' + getLabel(A1) + getLabel(B) + getLabel(C) + ')',
        ptIds: [A1, B, C],
        color: curFc['cross_A_BC'] ? (typeof curFc['cross_A_BC'] === 'string' ? curFc['cross_A_BC'] : curFc['cross_A_BC'].color) : null
      });
      planes.push({
        key: 'cross_B_AC',
        name: '(' + [B1, A, C].map(getLabel).join('') + ')',
        desc: 'Mặt phẳng chéo (' + getLabel(B1) + getLabel(A) + getLabel(C) + ')',
        ptIds: [B1, A, C],
        color: curFc['cross_B_AC'] ? (typeof curFc['cross_B_AC'] === 'string' ? curFc['cross_B_AC'] : curFc['cross_B_AC'].color) : null
      });
      planes.push({
        key: 'cross_C_AB',
        name: '(' + [C1, A, B].map(getLabel).join('') + ')',
        desc: 'Mặt phẳng chéo (' + getLabel(C1) + getLabel(A) + getLabel(B) + ')',
        ptIds: [C1, A, B],
        color: curFc['cross_C_AB'] ? (typeof curFc['cross_C_AB'] === 'string' ? curFc['cross_C_AB'] : curFc['cross_C_AB'].color) : null
      });
    } else if (sol.pts.length === 8 && (sol.solid.of === 'box' || sol.solid.of === 'cube')) {
      var A = sol.pts[0], B = sol.pts[1], C = sol.pts[2], D = sol.pts[3];
      var A1 = sol.pts[4], B1 = sol.pts[5], C1 = sol.pts[6], D1 = sol.pts[7];
      planes.push({
        key: 'diag_ACC1A1',
        name: '(' + [A, C, C1, A1].map(getLabel).join('') + ')',
        desc: 'Mặt chéo',
        ptIds: [A, C, C1, A1],
        color: curFc['diag_ACC1A1'] ? (typeof curFc['diag_ACC1A1'] === 'string' ? curFc['diag_ACC1A1'] : curFc['diag_ACC1A1'].color) : null
      });
      planes.push({
        key: 'diag_BDD1B1',
        name: '(' + [B, D, D1, B1].map(getLabel).join('') + ')',
        desc: 'Mặt chéo',
        ptIds: [B, D, D1, B1],
        color: curFc['diag_BDD1B1'] ? (typeof curFc['diag_BDD1B1'] === 'string' ? curFc['diag_BDD1B1'] : curFc['diag_BDD1B1'].color) : null
      });
    }

    // Nếu đang chọn điểm cụ thể:
    if (board.sel && board.sel.points && board.sel.points.size >= 3) {
      var selPtIds = Array.from(board.sel.points);
      if (selPtIds.length < sol.pts.length) {
        var selName = selPtIds.map(getLabel).join('');
        var matched = planes.find(function(p) {
          return p.ptIds.length === selPtIds.length && p.ptIds.every(function(id) { return selPtIds.includes(id); });
        });
        if (matched) {
          matched.isCurrentSel = true;
        } else {
          planes.unshift({
            key: 'custom_sel',
            name: '(' + selName + ')',
            desc: 'Điểm đang chọn',
            ptIds: selPtIds,
            isCurrentSel: true,
            color: curFc['custom_sel'] ? (typeof curFc['custom_sel'] === 'string' ? curFc['custom_sel'] : curFc['custom_sel'].color) : null
          });
        }
      }
    }

    return planes;
  }

  function colorSolidPlane(board, targetPlaneOrKey, color, alpha) {
    if (!board) return false;
    var pageIdx = board.sel ? board.sel.page : 0;
    var pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return false;

    var cAlpha = typeof alpha === 'number' ? alpha : 0.38;
    var col = color || '#3b82f6';

    var sol = null;
    if (typeof board.selectedSolid === 'function') {
      var sInfo = board.selectedSolid();
      if (sInfo && sInfo.id) sol = pg.geo.shapes.find(function(s) { return s.id === sInfo.id; });
    }
    if (!sol) {
      sol = pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid && !s.hidden; }) ||
            pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid; });
    }

    var planes = sol ? getSolidPlanes(board) : [];
    var target = null;
    if (typeof targetPlaneOrKey === 'string') {
      target = planes.find(function(p) { return p.key === targetPlaneOrKey; });
    } else if (targetPlaneOrKey && targetPlaneOrKey.ptIds) {
      target = targetPlaneOrKey;
    } else if (planes.length > 0) {
      target = planes.find(function(p) { return p.isCurrentSel; }) || planes[0];
    } else if (board.sel && board.sel.points && board.sel.points.size >= 3) {
      var selPtIds = Array.from(board.sel.points);
      var getLabel = function(id) { return (pg.geo.points[id] && pg.geo.points[id].label) ? pg.geo.points[id].label : id; };
      target = {
        key: 'custom_sel_' + Date.now(),
        name: '(' + selPtIds.map(getLabel).join('') + ')',
        ptIds: selPtIds
      };
    }

    if (!target || !target.ptIds || target.ptIds.length < 3) {
      showSpatialToast("⚠️ Vui lòng chọn một mặt phẳng hoặc ít nhất 3 điểm để tô màu!");
      return false;
    }

    if (sol && sol.solid) {
      var curFc = Object.assign({}, sol.solid.faceColors || {});
      curFc[target.key] = {
        color: col,
        alpha: cAlpha,
        pts: target.ptIds,
        indices: target.faceIdx !== undefined ? sol.solid.faces[target.faceIdx] : undefined
      };
      var upSol = Object.assign({}, sol, { solid: Object.assign({}, sol.solid, { faceColors: curFc }) });
      board.commit(board.updatePage(pageIdx, function(p) {
        return Object.assign({}, p, {
          geo: Object.assign({}, p.geo, {
            shapes: p.geo.shapes.map(function(sh) { return sh.id === sol.id ? upSol : sh; })
          })
        });
      }));
      board.redraw();
      board.emit();
      showSpatialToast("🎨 Đã tô màu mặt phẳng " + target.name + "!");
      return true;
    } else {
      // 2D polygon: Sắp xếp các điểm theo góc cực quanh tâm để không bị chéo cánh bướm
      var pMap = ut(pg.geo);
      var coords = target.ptIds.map(function(id) { return { id: id, p: pMap.get(id) }; }).filter(function(it) { return !!it.p; });
      if (coords.length >= 3) {
        var cx = coords.reduce(function(s, it) { return s + it.p.x; }, 0) / coords.length;
        var cy = coords.reduce(function(s, it) { return s + it.p.y; }, 0) / coords.length;
        coords.sort(function(a, b) {
          return Math.atan2(a.p.y - cy, a.p.x - cx) - Math.atan2(b.p.y - cy, b.p.x - cx);
        });
        var sortedIds = coords.map(function(it) { return it.id; });
        var newShape = {
          id: "poly_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
          kind: "polygon",
          pts: sortedIds,
          color: col,
          fill: col.startsWith('rgba') ? col : col,
          width: 1.5,
          group: "gP"
        };
        board.commit(board.updatePage(pageIdx, function(p) {
          return Object.assign({}, p, {
            geo: Object.assign({}, p.geo, {
              shapes: p.geo.shapes.concat([newShape])
            })
          });
        }));
        board.redraw();
        board.emit();
        showSpatialToast("🎨 Đã tô màu mặt phẳng " + target.name + "!");
        return true;
      }
    }
    return false;
  }

  function clearSolidPlaneColor(board, planeKey) {
    if (!board) return false;
    var pageIdx = board.sel ? board.sel.page : 0;
    var pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return false;

    var sol = null;
    if (typeof board.selectedSolid === 'function') {
      var sInfo = board.selectedSolid();
      if (sInfo && sInfo.id) sol = pg.geo.shapes.find(function(s) { return s.id === sInfo.id; });
    }
    if (!sol) {
      sol = pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid && !s.hidden; }) ||
            pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid; });
    }
    if (!sol || !sol.solid) return false;

    var curFc = Object.assign({}, sol.solid.faceColors || {});
    if (planeKey) {
      delete curFc[planeKey];
      showSpatialToast("🗑️ Đã xóa màu mặt phẳng đã chọn");
    } else {
      curFc = {};
      showSpatialToast("🧹 Đã xóa toàn bộ màu các mặt của khối");
    }

    var upSol = Object.assign({}, sol, { solid: Object.assign({}, sol.solid, { faceColors: curFc }) });
    board.commit(board.updatePage(pageIdx, function(p) {
      return Object.assign({}, p, {
        geo: Object.assign({}, p.geo, {
          shapes: p.geo.shapes.map(function(sh) { return sh.id === sol.id ? upSol : sh; })
        })
      });
    }));
    board.redraw();
    board.emit();
    return true;
  }

  function openColoredPlaneModal(board) {
    if (!board) return;
    var pageIdx = board.sel ? board.sel.page : 0;
    var pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return;

    var planes = getSolidPlanes(board);
    if (!planes.length && (!board.sel || !board.sel.points || board.sel.points.size < 3)) {
      showSpatialToast("⚠️ Vui lòng vẽ hoặc chọn một khối 3D hoặc từ 3 điểm trở lên!");
      return;
    }

    var old = document.getElementById('spatial-color-plane-modal');
    if (old) old.remove();

    var overlay = document.createElement('div');
    overlay.id = 'spatial-color-plane-modal';
    overlay.className = 'spatial-modal-overlay';

    var selectedKey = planes.length ? (planes.find(function(p){ return p.isCurrentSel; }) || planes[0]).key : '';
    var selectedColor = '#ef4444';
    var selectedAlpha = 0.38;

    var colors = [
      { name: 'Đỏ', hex: '#ef4444' },
      { name: 'Xanh dương', hex: '#3b82f6' },
      { name: 'Xanh lá', hex: '#22c55e' },
      { name: 'Tím', hex: '#a855f7' },
      { name: 'Cam', hex: '#ea580c' },
      { name: 'Vàng', hex: '#eab308' },
      { name: 'Xanh ngọc', hex: '#06b6d4' }
    ];

    function renderPlanesHtml() {
      return planes.map(function(p) {
        var isAct = p.key === selectedKey ? ' active' : '';
        var colDot = p.color ? '<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:' + p.color + ';margin-right:5px;box-shadow:0 0 4px rgba(0,0,0,0.3);"></span>' : '';
        return '<button type="button" class="spatial-preset-btn plane-choice' + isAct + '" data-key="' + p.key + '" style="padding:8px 12px;margin-bottom:6px;font-size:13px;display:flex;align-items:center;justify-content:space-between;border:1.5px solid ' + (p.key === selectedKey ? '#ea580c' : '#e2e8f0') + ';background:' + (p.key === selectedKey ? '#fff7ed' : '#ffffff') + ';">' +
          '<div>' + colDot + '<b>' + p.name + '</b> <span style="font-size:11.5px;color:#64748b;">(' + p.desc + ')</span></div>' +
          (p.key === selectedKey ? '<span style="color:#ea580c;font-weight:700;">✓</span>' : '') +
        '</button>';
      }).join('');
    }

    function renderColorsHtml() {
      return colors.map(function(c) {
        var isAct = c.hex === selectedColor ? 'style="border:3px solid #1e293b;transform:scale(1.08);box-shadow:0 3px 8px rgba(0,0,0,0.25);"' : 'style="border:2px solid #ffffff;"';
        return '<button type="button" class="color-swatch" data-hex="' + c.hex + '" title="' + c.name + '" ' + isAct + ' style="width:38px;height:38px;border-radius:10px;background:' + c.hex + ';cursor:pointer;transition:all 0.15s;"></button>';
      }).join('');
    }

    overlay.innerHTML = '<div class="spatial-modal-card" style="max-width:440px;">' +
      '<div class="spatial-modal-header" style="background:#fff7ed;border-bottom:1px solid #fed7aa;">' +
        '<div class="spatial-modal-title" style="color:#ea580c;">🎨 Tô Màu Mặt Phẳng Không Gian</div>' +
        '<button type="button" class="spatial-modal-close" id="btn-close-cp-modal">✕</button>' +
      '</div>' +
      '<div class="spatial-modal-body" style="padding:16px 20px;">' +
        '<div class="spatial-section-title">1. Chọn mặt phẳng cần tô màu:</div>' +
        '<div id="plane-choices-list" style="max-height:180px;overflow-y:auto;padding-right:4px;margin-bottom:14px;">' +
          renderPlanesHtml() +
        '</div>' +
        '<div class="spatial-section-title">2. Chọn màu sắc:</div>' +
        '<div id="color-swatches-grid" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;padding:4px 0;">' +
          renderColorsHtml() +
        '</div>' +
      '</div>' +
      '<div class="spatial-modal-footer" style="display:flex;justify-content:space-between;align-items:center;padding:12px 18px;background:#f8fafc;">' +
        '<button type="button" id="btn-clear-plane-color" style="font-size:12.5px;color:#dc2626;background:transparent;border:1px solid #fca5a5;padding:6px 12px;border-radius:8px;cursor:pointer;">🗑️ Xóa màu mặt</button>' +
        '<div style="display:flex;gap:8px;">' +
          '<button type="button" id="btn-cancel-cp-modal" style="padding:7px 14px;border:1px solid #cbd5e1;background:#ffffff;border-radius:8px;font-size:13px;cursor:pointer;">Đóng</button>' +
          '<button type="button" id="btn-apply-cp-modal" class="spatial-btn-primary" style="padding:7px 18px;background:#ea580c;color:#ffffff;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;">Áp dụng</button>' +
        '</div>' +
      '</div>' +
    '</div>';

    document.body.appendChild(overlay);

    function close() {
      overlay.remove();
    }

    document.getElementById('btn-close-cp-modal').onclick = close;
    document.getElementById('btn-cancel-cp-modal').onclick = close;

    overlay.onclick = function(e) {
      if (e.target === overlay) close();
    };

    var listEl = document.getElementById('plane-choices-list');
    listEl.onclick = function(e) {
      var btn = e.target.closest('.plane-choice');
      if (btn) {
        selectedKey = btn.getAttribute('data-key');
        listEl.innerHTML = renderPlanesHtml();
      }
    };

    var colorsEl = document.getElementById('color-swatches-grid');
    colorsEl.onclick = function(e) {
      var btn = e.target.closest('.color-swatch');
      if (btn) {
        selectedColor = btn.getAttribute('data-hex');
        colorsEl.innerHTML = renderColorsHtml();
        // Áp dụng ngay khi bấm màu
        colorSolidPlane(board, selectedKey, selectedColor, selectedAlpha);
      }
    };

    document.getElementById('btn-apply-cp-modal').onclick = function() {
      colorSolidPlane(board, selectedKey, selectedColor, selectedAlpha);
      close();
    };

    document.getElementById('btn-clear-plane-color').onclick = function() {
      clearSolidPlaneColor(board, selectedKey);
      listEl.innerHTML = renderPlanesHtml();
    };
  }

  
  // =========================================================================
  // 🌟 CÁC MODAL THÔNG MINH CHO PHÉP LỰA CHỌN ĐỐI TƯỢNG TỪ HÌNH 3D
  // =========================================================================

  function openSmartHeightModal(board, ptId) {
    if (!board) return;
    var pageIdx = board.sel ? board.sel.page : 0;
    var pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return;

    var sol = pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid && !s.hidden; }) ||
              pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid; });
    if (!sol || !sol.solid) {
      showSpatialToast("⚠️ Vui lòng vẽ hoặc chọn một khối hình không gian trước!");
      return;
    }

    var targetPtId = ptId;
    if (!targetPtId && board.sel && board.sel.points && board.sel.points.size === 1) {
      targetPtId = Array.from(board.sel.points)[0];
    }
    if (targetPtId) {
      return addPointProjection(board, targetPtId);
    }

    var old = document.getElementById('spatial-height-wizard');
    if (old) old.remove();

    var overlay = document.createElement('div');
    overlay.id = 'spatial-height-wizard';
    overlay.className = 'spatial-modal-overlay';

    var getLabel = function(id) {
      return (pg.geo.points[id] && pg.geo.points[id].label) ? pg.geo.points[id].label : id;
    };

    var apexId = (sol.solid.of && sol.solid.of.startsWith('pyramid') || sol.pts.length === 5 || sol.pts.length === 4) ? sol.pts[sol.pts.length - 1] : null;
    var allPts = sol.pts.map(function(id) { return { id: id, label: getLabel(id) }; });

    var chipsHtml = allPts.map(function(p) {
      var isApex = p.id === apexId;
      var extra = isApex ? ' (Đỉnh chóp)' : '';
      var st = isApex ? 'border:2px solid #2563eb;background:#eff6ff;color:#1d4ed8;font-weight:700;' : 'border:1.5px solid #cbd5e1;background:#f8fafc;color:#1e293b;';
      return '<button class="spatial-chip pt-height-chip" data-id="' + p.id + '" style="' + st + '">' +
        p.label + extra +
      '</button>';
    }).join('');

    overlay.innerHTML = '<div class="spatial-modal-card" style="max-width:440px;">' +
      '<div class="spatial-modal-header">' +
        '<div class="spatial-modal-title">⊥ Dựng Đường Cao Từ Đỉnh</div>' +
        '<button class="spatial-modal-close" id="btn-close-height-modal">✕</button>' +
      '</div>' +
      '<div class="spatial-modal-body">' +
        '<div class="spatial-section-title">👉 Chọn đỉnh từ hình để hạ đường cao vuông góc:</div>' +
        '<div class="spatial-chips-wrap" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">' + chipsHtml + '</div>' +
        '<div style="font-size:12px;color:#64748b;line-height:1.5;">Đường cao vuông góc sẽ được hạ từ đỉnh xuống mặt phẳng đáy, tự động sinh chân đường cao H, ký hiệu góc vuông ∟ và gắn kết toạ độ 3D.</div>' +
      '</div>' +
    '</div>';

    document.body.appendChild(overlay);
    var close = function() { overlay.remove(); };
    overlay.querySelector('#btn-close-height-modal').onclick = close;
    overlay.onclick = function(e) { if (e.target === overlay) close(); };

    overlay.querySelectorAll('.pt-height-chip').forEach(function(btn) {
      btn.onclick = function() {
        var pId = btn.getAttribute('data-id');
        close();
        addPointProjection(board, pId);
      };
    });
  }

  function openSmartProjectionModal(board, ptId) {
    if (!board) return;
    var pageIdx = board.sel ? board.sel.page : 0;
    var pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return;

    var sol = pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid && !s.hidden; }) ||
              pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid; });
    if (!sol || !sol.solid) {
      showSpatialToast("⚠️ Vui lòng vẽ hoặc chọn một khối hình không gian trước!");
      return;
    }

    var targetPtId = ptId;
    if (!targetPtId && board.sel && board.sel.points && board.sel.points.size === 1) {
      targetPtId = Array.from(board.sel.points)[0];
    }
    if (targetPtId) {
      return addPointProjection(board, targetPtId);
    }

    var old = document.getElementById('spatial-proj-wizard');
    if (old) old.remove();

    var overlay = document.createElement('div');
    overlay.id = 'spatial-proj-wizard';
    overlay.className = 'spatial-modal-overlay';

    var getLabel = function(id) {
      return (pg.geo.points[id] && pg.geo.points[id].label) ? pg.geo.points[id].label : id;
    };

    var allPts = [];
    var seenPts = new Set();
    sol.pts.forEach(function(id) {
      if (!seenPts.has(id)) {
        seenPts.add(id);
        allPts.push({ id: id, label: getLabel(id) });
      }
    });
    Object.keys(pg.geo.points).forEach(function(id) {
      if (!seenPts.has(id)) {
        seenPts.add(id);
        allPts.push({ id: id, label: getLabel(id) });
      }
    });

    var chipsHtml = allPts.map(function(p) {
      return '<button class="spatial-chip pt-proj-chip" data-id="' + p.id + '">' + p.label + '</button>';
    }).join('');

    overlay.innerHTML = '<div class="spatial-modal-card" style="max-width:440px;">' +
      '<div class="spatial-modal-header">' +
        '<div class="spatial-modal-title">⊥ Hình Chiếu Vuông Góc Lên Đáy (H)</div>' +
        '<button class="spatial-modal-close" id="btn-close-proj-modal">✕</button>' +
      '</div>' +
      '<div class="spatial-modal-body">' +
        '<div class="spatial-section-title">👉 Chọn điểm trên hình cần chiếu vuông góc:</div>' +
        '<div class="spatial-chips-wrap" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">' + chipsHtml + '</div>' +
        '<div style="font-size:12px;color:#64748b;line-height:1.5;">Hạ hình chiếu vuông góc từ điểm đã chọn xuống mặt phẳng đáy, tự động vẽ chân đường cao H và ký hiệu vuông góc ∟.</div>' +
      '</div>' +
    '</div>';

    document.body.appendChild(overlay);
    var close = function() { overlay.remove(); };
    overlay.querySelector('#btn-close-proj-modal').onclick = close;
    overlay.onclick = function(e) { if (e.target === overlay) close(); };

    overlay.querySelectorAll('.pt-proj-chip').forEach(function(btn) {
      btn.onclick = function() {
        var pId = btn.getAttribute('data-id');
        close();
        addPointProjection(board, pId);
      };
    });
  }

  function openSmartMidpointModal(board, ptAId, ptBId) {
    if (!board) return;
    var pageIdx = board.sel ? board.sel.page : 0;
    var pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return;

    var sol = pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid && !s.hidden; }) ||
              pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid; });
    if (!sol || !sol.solid) {
      showSpatialToast("⚠️ Vui lòng vẽ hoặc chọn một khối hình không gian trước!");
      return;
    }

    if (ptAId && ptBId) {
      return addSegmentMidpoint(board, ptAId, ptBId);
    }
    if (board.sel && board.sel.points && board.sel.points.size >= 2) {
      var arr = Array.from(board.sel.points);
      return addSegmentMidpoint(board, arr[0], arr[1]);
    }
    if (board.sel && board.sel.shapes && board.sel.shapes.size === 1) {
      var sh = pg.geo.shapes.find(function(s) { return s.id === Array.from(board.sel.shapes)[0]; });
      if (sh && sh.pts && sh.pts.length >= 2) {
        return addSegmentMidpoint(board, sh.pts[0], sh.pts[1]);
      }
    }

    var old = document.getElementById('spatial-midpoint-wizard');
    if (old) old.remove();

    var overlay = document.createElement('div');
    overlay.id = 'spatial-midpoint-wizard';
    overlay.className = 'spatial-modal-overlay';

    var getLabel = function(id) {
      return (pg.geo.points[id] && pg.geo.points[id].label) ? pg.geo.points[id].label : id;
    };

    var apexId = (sol.solid.of && sol.solid.of.startsWith('pyramid') || sol.pts.length === 5) ? sol.pts[sol.pts.length - 1] : null;
    var sideEdges = [];
    var baseEdges = [];
    var otherEdges = [];

    if (apexId) {
      var basePtIds = sol.pts.slice(0, sol.pts.length - 1);
      basePtIds.forEach(function(bId) {
        sideEdges.push({ idA: apexId, idB: bId, name: getLabel(apexId) + getLabel(bId) });
      });
      for (var bi = 0; bi < basePtIds.length; bi++) {
        var nxt = (bi + 1) % basePtIds.length;
        baseEdges.push({ idA: basePtIds[bi], idB: basePtIds[nxt], name: getLabel(basePtIds[bi]) + getLabel(basePtIds[nxt]) });
      }
      if (basePtIds.length === 4) {
        otherEdges.push({ idA: basePtIds[0], idB: basePtIds[2], name: getLabel(basePtIds[0]) + getLabel(basePtIds[2]) + ' (Đường chéo)' });
        otherEdges.push({ idA: basePtIds[1], idB: basePtIds[3], name: getLabel(basePtIds[1]) + getLabel(basePtIds[3]) + ' (Đường chéo)' });
      }
    } else {
      var half = Math.floor(sol.pts.length / 2);
      var botPts = sol.pts.slice(0, half);
      var topPts = sol.pts.slice(half, 2 * half);

      for (var pi = 0; pi < half; pi++) {
        sideEdges.push({ idA: botPts[pi], idB: topPts[pi], name: getLabel(botPts[pi]) + getLabel(topPts[pi]) });
      }
      for (var bi = 0; bi < half; bi++) {
        var nxtB = (bi + 1) % half;
        baseEdges.push({ idA: botPts[bi], idB: botPts[nxtB], name: getLabel(botPts[bi]) + getLabel(botPts[nxtB]) });
      }
      for (var ti = 0; ti < half; ti++) {
        var nxtT = (ti + 1) % half;
        otherEdges.push({ idA: topPts[ti], idB: topPts[nxtT], name: getLabel(topPts[ti]) + getLabel(topPts[nxtT]) });
      }
    }

    var sideHtml = sideEdges.map(function(e) {
      return '<button class="spatial-chip edge-chip" data-a="' + e.idA + '" data-b="' + e.idB + '">' + e.name + '</button>';
    }).join('');
    var baseHtml = baseEdges.map(function(e) {
      return '<button class="spatial-chip edge-chip" data-a="' + e.idA + '" data-b="' + e.idB + '">' + e.name + '</button>';
    }).join('');
    var otherHtml = otherEdges.map(function(e) {
      return '<button class="spatial-chip edge-chip" data-a="' + e.idA + '" data-b="' + e.idB + '">' + e.name + '</button>';
    }).join('');

    overlay.innerHTML = '<div class="spatial-modal-card" style="max-width:460px;">' +
      '<div class="spatial-modal-header">' +
        '<div class="spatial-modal-title">• Dựng Trung Điểm Đoạn Thẳng / Cạnh</div>' +
        '<button class="spatial-modal-close" id="btn-close-mid-modal">✕</button>' +
      '</div>' +
      '<div class="spatial-modal-body">' +
        (sideEdges.length > 0 ? ('<div class="spatial-section-title">📐 Cạnh bên:</div><div class="spatial-chips-wrap" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;">' + sideHtml + '</div>') : '') +
        '<div class="spatial-section-title">🟩 Cạnh đáy:</div>' +
        '<div class="spatial-chips-wrap" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;">' + baseHtml + '</div>' +
        (otherEdges.length > 0 ? ('<div class="spatial-section-title">⚡ Đoạn chéo / khác:</div><div class="spatial-chips-wrap" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;">' + otherHtml + '</div>') : '') +
        '<div style="font-size:12px;color:#64748b;line-height:1.5;">Bấm vào cạnh bất kỳ để lấy trung điểm chính xác trong không gian 3D (xoay hình chuẩn xác).</div>' +
      '</div>' +
    '</div>';

    document.body.appendChild(overlay);
    var close = function() { overlay.remove(); };
    overlay.querySelector('#btn-close-mid-modal').onclick = close;
    overlay.onclick = function(e) { if (e.target === overlay) close(); };

    overlay.querySelectorAll('.edge-chip').forEach(function(btn) {
      btn.onclick = function() {
        var idA = btn.getAttribute('data-a');
        var idB = btn.getAttribute('data-b');
        close();
        addSegmentMidpoint(board, idA, idB);
      };
    });
  }

  function openSmartCentroidModal(board) {
    if (!board) return;
    var pageIdx = board.sel ? board.sel.page : 0;
    var pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return;

    var sol = pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid && !s.hidden; }) ||
              pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid; });
    if (!sol || !sol.solid) {
      showSpatialToast("⚠️ Vui lòng vẽ hoặc chọn một khối hình không gian trước!");
      return;
    }

    if (board.sel && board.sel.points && board.sel.points.size === 3) {
      var arr = Array.from(board.sel.points);
      return addTriangleCentroid(board, arr[0], arr[1], arr[2]);
    }

    var planes = getSolidPlanes(board);
    var triPlanes = planes.filter(function(p) { return p.ptIds && p.ptIds.length === 3; });
    var otherPlanes = planes.filter(function(p) { return p.ptIds && p.ptIds.length > 3; });

    var old = document.getElementById('spatial-centroid-wizard');
    if (old) old.remove();

    var overlay = document.createElement('div');
    overlay.id = 'spatial-centroid-wizard';
    overlay.className = 'spatial-modal-overlay';

    var triHtml = triPlanes.map(function(p) {
      return '<button class="spatial-chip face-chip" data-key="' + p.key + '" style="font-weight:600;">' + p.name + ' <span style="font-size:11px;opacity:0.8">(' + p.desc + ')</span></button>';
    }).join('');
    var otherHtml = otherPlanes.map(function(p) {
      return '<button class="spatial-chip face-chip" data-key="' + p.key + '">' + p.name + ' <span style="font-size:11px;opacity:0.8">(' + p.desc + ')</span></button>';
    }).join('');

    overlay.innerHTML = '<div class="spatial-modal-card" style="max-width:460px;">' +
      '<div class="spatial-modal-header">' +
        '<div class="spatial-modal-title">⭐ Dựng Trọng Tâm Tam Giác / Mặt (G)</div>' +
        '<button class="spatial-modal-close" id="btn-close-centroid-modal">✕</button>' +
      '</div>' +
      '<div class="spatial-modal-body">' +
        '<div class="spatial-section-title">🔺 Mặt tam giác (Mặt bên & Mặt chéo):</div>' +
        '<div class="spatial-chips-wrap" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;">' + triHtml + '</div>' +
        (otherPlanes.length > 0 ? ('<div class="spatial-section-title">🟩 Mặt đa giác / Đáy:</div><div class="spatial-chips-wrap" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;">' + otherHtml + '</div>') : '') +
        '<div style="font-size:12px;color:#64748b;line-height:1.5;">Tự động dựng trọng tâm G cùng đường trung tuyến chuẩn 3D, xoay hình chuẩn xác.</div>' +
      '</div>' +
    '</div>';

    document.body.appendChild(overlay);
    var close = function() { overlay.remove(); };
    overlay.querySelector('#btn-close-centroid-modal').onclick = close;
    overlay.onclick = function(e) { if (e.target === overlay) close(); };

    overlay.querySelectorAll('.face-chip').forEach(function(btn) {
      btn.onclick = function() {
        var key = btn.getAttribute('data-key');
        var pl = planes.find(function(p) { return p.key === key; });
        close();
        if (pl) addFaceCentroidByPlane(board, pl);
      };
    });
  }

  function executeDiagonalIntersection(board, sol) {
    if (!board || !sol) return false;
    var pageIdx = board.sel ? board.sel.page : 0;
    var pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return false;

    var getLabel = function(id) {
      return (pg.geo.points[id] && pg.geo.points[id].label) ? pg.geo.points[id].label : id;
    };

    var pMap2D = getPointMap(pg.geo);
    var apexId = sol.pts[sol.pts.length - 1];
    var baseIds = sol.pts.slice(0, sol.pts.length - 1);
    if (baseIds.length < 4) {
      showSpatialToast("⚠️ Cần khối chóp đáy tứ giác (ABCD) để dựng giao tuyến mặt chéo!");
      return false;
    }

    var A = pMap2D.get(baseIds[0]), B = pMap2D.get(baseIds[1]), C = pMap2D.get(baseIds[2]), D = pMap2D.get(baseIds[3]);
    if (!A || !B || !C || !D) return false;

    var denom = (A.x - C.x) * (B.y - D.y) - (A.y - C.y) * (B.x - D.x);
    var oX, oY;
    if (Math.abs(denom) > 1e-4) {
      var t = ((A.x - B.x) * (B.y - D.y) - (A.y - B.y) * (B.x - D.x)) / denom;
      oX = A.x + t * (C.x - A.x);
      oY = A.y + t * (C.y - A.y);
    } else {
      oX = (A.x + B.x + C.x + D.x) / 4;
      oY = (A.y + B.y + C.y + D.y) / 4;
    }

    var c = o4(sol.solid.view || Cp);
    var pA3D = (pg.geo.points[baseIds[0]] && pg.geo.points[baseIds[0]].pos3d) || wo(c, [A.x, A.y, 0]);
    var pC3D = (pg.geo.points[baseIds[2]] && pg.geo.points[baseIds[2]].pos3d) || wo(c, [C.x, C.y, 0]);
    var o3D = [(pA3D[0] + pC3D[0]) / 2, (pA3D[1] + pC3D[1]) / 2, (pA3D[2] + pC3D[2]) / 2];

    var ptO = {
      id: "pt_diag_O_" + Date.now(),
      def: { t: "free", x: Math.round(oX * 10) / 10, y: Math.round(oY * 10) / 10 },
      label: "O",
      show: true,
      pos3d: o3D,
      group: sol.group
    };

    var newShapes = [
      { id: "seg_diag_AC_" + Date.now(), kind: "segment", pts: [baseIds[0], baseIds[2]], color: "#94a3b8", width: 1.5, dashed: true, group: sol.group, aux: true },
      { id: "seg_diag_BD_" + Date.now(), kind: "segment", pts: [baseIds[1], baseIds[3]], color: "#94a3b8", width: 1.5, dashed: true, group: sol.group, aux: true },
      { id: "seg_inter_SO_" + Date.now(), kind: "segment", pts: [apexId, ptO.id], color: "#dc2626", width: 2.2, dashed: true, group: sol.group, aux: false }
    ];

    board.commit(board.addGeo(pageIdx, [ptO], newShapes));
    board.redraw();
    board.emit();
    showSpatialToast("⭐ Đã dựng giao tuyến SO = (" + getLabel(apexId) + getLabel(baseIds[0]) + getLabel(baseIds[2]) + ") ∩ (" + getLabel(apexId) + getLabel(baseIds[1]) + getLabel(baseIds[3]) + ")");
    return true;
  }

  function executeParallelIntersection(board, sol, apexId, idA, idB) {
    if (!board || !sol) return false;
    var pageIdx = board.sel ? board.sel.page : 0;
    var pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return false;

    var getLabel = function(id) {
      return (pg.geo.points[id] && pg.geo.points[id].label) ? pg.geo.points[id].label : id;
    };

    var pMap2D = getPointMap(pg.geo);
    var pApex = pMap2D.get(apexId);
    var pA = pMap2D.get(idA);
    var pB = pMap2D.get(idB);
    if (!pApex || !pA || !pB) return false;

    var c = o4(sol.solid.view || Cp);
    var apex3D = (pg.geo.points[apexId] && pg.geo.points[apexId].pos3d) || wo(c, [pApex.x, pApex.y, pg.geo.points[apexId].z || 0]);
    var a3D = (pg.geo.points[idA] && pg.geo.points[idA].pos3d) || wo(c, [pA.x, pA.y, pg.geo.points[idA].z || 0]);
    var b3D = (pg.geo.points[idB] && pg.geo.points[idB].pos3d) || wo(c, [pB.x, pB.y, pg.geo.points[idB].z || 0]);

    var u3D = [b3D[0] - a3D[0], b3D[1] - a3D[1], b3D[2] - a3D[2]];
    var factor = 0.6;
    var p1_3D = [apex3D[0] - u3D[0] * factor, apex3D[1] - u3D[1] * factor, apex3D[2] - u3D[2] * factor];
    var p2_3D = [apex3D[0] + u3D[0] * factor, apex3D[1] + u3D[1] * factor, apex3D[2] + u3D[2] * factor];

    var p1_2D = { x: pApex.x - (pB.x - pA.x) * factor, y: pApex.y - (pB.y - pA.y) * factor };
    var p2_2D = { x: pApex.x + (pB.x - pA.x) * factor, y: pApex.y + (pB.y - pA.y) * factor };

    var pt1 = {
      id: "pt_par_1_" + Date.now(),
      def: { t: "free", x: Math.round(p1_2D.x * 10) / 10, y: Math.round(p1_2D.y * 10) / 10 },
      label: "",
      show: false,
      pos3d: p1_3D,
      group: sol.group
    };
    var pt2 = {
      id: "pt_par_2_" + Date.now(),
      def: { t: "free", x: Math.round(p2_2D.x * 10) / 10, y: Math.round(p2_2D.y * 10) / 10 },
      label: "x",
      show: true,
      pos3d: p2_3D,
      group: sol.group
    };

    var lineSx = {
      id: "seg_par_" + Date.now(),
      kind: "segment",
      pts: [pt1.id, pt2.id],
      color: "#dc2626",
      width: 2.2,
      dashed: false,
      group: sol.group,
      aux: false
    };

    board.commit(board.addGeo(pageIdx, [pt1, pt2], [lineSx]));
    board.redraw();
    board.emit();
    showSpatialToast("⭐ Đã dựng giao tuyến Sx qua " + getLabel(apexId) + " // " + getLabel(idA) + getLabel(idB));
    return true;
  }

  function executeTwoPlanesIntersection(board, sol, pl1, pl2) {
    if (!board || !sol || !pl1 || !pl2) return false;
    var pageIdx = board.sel ? board.sel.page : 0;
    var pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return false;

    var getLabel = function(id) {
      return (pg.geo.points[id] && pg.geo.points[id].label) ? pg.geo.points[id].label : id;
    };

    var pMap2D = getPointMap(pg.geo);
    var c = sol.solid.view ? o4(sol.solid.view || Cp) : null;

    function get3D(id) {
      var pt = pg.geo.points[id];
      if (!pt) return null;
      if (pt.pos3d) return [...pt.pos3d];
      var p2d = pMap2D.get(id);
      if (p2d && c) return wo(c, [p2d.x, p2d.y, pt.z != null ? pt.z : 0]);
      return [pt.x || 0, pt.y || 0, 0];
    }

    // 1. Kiểm tra các đỉnh chung
    var commonIds = pl1.ptIds.filter(function(id) { return pl2.ptIds.includes(id); });

    // TRƯỜNG HỢP 1: Có từ 2 đỉnh chung trở lên -> Giao tuyến là đoạn/đường thẳng qua 2 đỉnh đó
    if (commonIds.length >= 2) {
      var id1 = commonIds[0], id2 = commonIds[1];
      var existingSeg = pg.geo.shapes.find(function(s) {
        return (s.kind === 'segment' || s.kind === 'line') && s.pts &&
          ((s.pts[0] === id1 && s.pts[1] === id2) || (s.pts[0] === id2 && s.pts[1] === id1));
      });
      if (existingSeg) {
        existingSeg.color = "#dc2626";
        existingSeg.width = 2.5;
        board.commit(board.doc);
        board.redraw();
        board.emit();
        showSpatialToast("⭐ Giao tuyến của <b>" + pl1.name + "</b> và <b>" + pl2.name + "</b> chính là cạnh <b>" + getLabel(id1) + getLabel(id2) + "</b>");
        return true;
      } else {
        // Chưa có đoạn thẳng nối 2 đỉnh này -> Dựng đoạn giao tuyến mới
        var newSeg = {
          id: "seg_inter_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
          kind: "segment",
          pts: [id1, id2],
          color: "#dc2626",
          width: 2.2,
          dashed: false,
          group: sol.group,
          aux: false
        };
        board.commit(board.addGeo(pageIdx, [], [newSeg]));
        board.redraw();
        board.emit();
        showSpatialToast("⭐ Đã dựng giao tuyến <b>" + getLabel(id1) + getLabel(id2) + "</b> = " + pl1.name + " ∩ " + pl2.name);
        return true;
      }
    }

    // Tính vector pháp tuyến của 2 mặt phẳng
    function getPlaneNormal(ptIds) {
      if (ptIds.length < 3) return null;
      var p0 = get3D(ptIds[0]), p1 = get3D(ptIds[1]), p2 = get3D(ptIds[2]);
      if (!p0 || !p1 || !p2) return null;
      var u = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
      var v = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];
      var n = [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0]
      ];
      var len = Math.hypot(n[0], n[1], n[2]);
      if (len < 1e-5) return null;
      return [n[0] / len, n[1] / len, n[2] / len];
    }

    var n1 = getPlaneNormal(pl1.ptIds);
    var n2 = getPlaneNormal(pl2.ptIds);

    if (n1 && n2) {
      // Vector chỉ phương giao tuyến: u_dir = n1 x n2
      var uDir = [
        n1[1] * n2[2] - n1[2] * n2[1],
        n1[2] * n2[0] - n1[0] * n2[2],
        n1[0] * n2[1] - n1[1] * n2[0]
      ];
      var uLen = Math.hypot(uDir[0], uDir[1], uDir[2]);
      if (uLen < 1e-4) {
        showSpatialToast("⚠️ Hai mặt phẳng " + pl1.name + " và " + pl2.name + " song song hoặc trùng nhau, không có giao tuyến!");
        return false;
      }
    }

    // TRƯỜNG HỢP 2: Có đúng 1 đỉnh chung (commonIds.length === 1)
    if (commonIds.length === 1) {
      var apexId = commonIds[0];
      var p1Rem = pl1.ptIds.filter(function(id) { return id !== apexId; });
      var p2Rem = pl2.ptIds.filter(function(id) { return id !== apexId; });

      // Kiểm tra xem có cặp cạnh nào song song không (Định lý giao tuyến song song)
      if (p1Rem.length >= 2 && p2Rem.length >= 2) {
        var e1A = get3D(p1Rem[0]), e1B = get3D(p1Rem[1]);
        var e2A = get3D(p2Rem[0]), e2B = get3D(p2Rem[1]);
        if (e1A && e1B && e2A && e2B) {
          var v1 = [e1B[0] - e1A[0], e1B[1] - e1A[1], e1B[2] - e1A[2]];
          var v2 = [e2B[0] - e2A[0], e2B[1] - e2A[1], e2B[2] - e2A[2]];
          var crossPar = [
            v1[1] * v2[2] - v1[2] * v2[1],
            v1[2] * v2[0] - v1[0] * v2[2],
            v1[0] * v2[1] - v1[1] * v2[0]
          ];
          var lenCross = Math.hypot(crossPar[0], crossPar[1], crossPar[2]);
          var len1 = Math.hypot(v1[0], v1[1], v1[2]), len2 = Math.hypot(v2[0], v2[1], v2[2]);
          if (len1 > 1e-4 && len2 > 1e-4 && (lenCross / (len1 * len2)) < 0.08) {
            return executeParallelIntersection(board, sol, apexId, p1Rem[0], p1Rem[1]);
          }
        }
      }

      // Nếu không song song, tìm điểm chung thứ hai I bằng cách cắt cạnh của pl1 với pl2
      if (n2 && p1Rem.length >= 2) {
        var pBase2 = get3D(pl2.ptIds[0]);
        for (var ei = 0; ei < p1Rem.length; ei++) {
          var eAId = p1Rem[ei], eBId = p1Rem[(ei + 1) % p1Rem.length];
          var eA = get3D(eAId), eB = get3D(eBId);
          if (!eA || !eB) continue;
          var vLine = [eB[0] - eA[0], eB[1] - eA[1], eB[2] - eA[2]];
          var denom = n2[0] * vLine[0] + n2[1] * vLine[1] + n2[2] * vLine[2];
          if (Math.abs(denom) > 1e-4) {
            var dotA = n2[0] * eA[0] + n2[1] * eA[1] + n2[2] * eA[2];
            var dotBase = n2[0] * pBase2[0] + n2[1] * pBase2[1] + n2[2] * pBase2[2];
            var tParam = (dotBase - dotA) / denom;
            if (tParam > -3.0 && tParam < 4.0) {
              // Tìm thấy điểm giao thứ 2
              var pI3D = [eA[0] + tParam * vLine[0], eA[1] + tParam * vLine[1], eA[2] + tParam * vLine[2]];
              var viewMat = sol.solid.view || Cp;
              var zI = viewMat[6] * pI3D[0] + viewMat[7] * pI3D[1] + viewMat[8] * pI3D[2];

              var existingLabels = new Set(Object.values(pg.geo.points).map(function(p) { return p.label; }).filter(Boolean));
              var candLabels = ["I", "J", "K", "O", "P", "Q", "M", "N"];
              var chosenLabel = candLabels.find(function(l) { return !existingLabels.has(l); }) || "I";

              var ptIId = "pt_inter_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
              var ptI = {
                id: ptIId,
                def: { t: "on", a: eAId, b: eBId, k: tParam },
                label: chosenLabel,
                show: true,
                group: sol.group,
                z: zI,
                pos3d: [Math.round(pI3D[0] * 100) / 100, Math.round(pI3D[1] * 100) / 100, Math.round(pI3D[2] * 100) / 100]
              };

              var newShapes = [
                {
                  id: "seg_inter_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
                  kind: "segment",
                  pts: [apexId, ptIId],
                  color: "#dc2626",
                  width: 2.2,
                  dashed: true,
                  group: sol.group,
                  aux: false
                }
              ];

              if (tParam < -0.05 || tParam > 1.05) {
                var nearId = tParam > 1.05 ? eBId : eAId;
                newShapes.push({
                  id: "seg_ext_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
                  kind: "segment",
                  pts: [nearId, ptIId],
                  color: "#0284c7",
                  width: 1.8,
                  dashed: true,
                  group: sol.group,
                  aux: true
                });
              }

              board.commit(board.addGeo(pageIdx, [ptI], newShapes));
              attachDrawnElementsToSolid(board, pageIdx, sol);
              board.redraw();
              board.emit();
              showSpatialToast("⭐ Đã dựng giao tuyến <b>" + getLabel(apexId) + chosenLabel + "</b> = " + pl1.name + " ∩ " + pl2.name);
              return true;
            }
          }
        }
      }
    }

    // TRƯỜNG HỢP 3: Giao tuyến mặt chéo của hình chóp tứ giác (SAC) và (SBD)
    if (sol.pts.length === 5 && ((pl1.key && pl1.key.includes('SAC') && pl2.key && pl2.key.includes('SBD')) ||
                                 (pl1.key && pl1.key.includes('SBD') && pl2.key && pl2.key.includes('SAC')))) {
      return executeDiagonalIntersection(board, sol);
    }

    // TRƯỜNG HỢP 4: Giao tuyến tổng quát (tìm 2 điểm cắt giữa các cạnh và mặt phẳng kia)
    var interPoints = [];
    if (n2) {
      var pBase2 = get3D(pl2.ptIds[0]);
      for (var pi = 0; pi < pl1.ptIds.length; pi++) {
        var pAId = pl1.ptIds[pi], pBId = pl1.ptIds[(pi + 1) % pl1.ptIds.length];
        var pA = get3D(pAId), pB = get3D(pBId);
        if (!pA || !pB) continue;
        var vL = [pB[0] - pA[0], pB[1] - pA[1], pB[2] - pA[2]];
        var den = n2[0] * vL[0] + n2[1] * vL[1] + n2[2] * vL[2];
        if (Math.abs(den) > 1e-4) {
          var tP = (n2[0] * (pBase2[0] - pA[0]) + n2[1] * (pBase2[1] - pA[1]) + n2[2] * (pBase2[2] - pA[2])) / den;
          if (tP >= -0.05 && tP <= 1.05) {
            interPoints.push({
              aId: pAId, bId: pBId, k: tP,
              pos3d: [pA[0] + tP * vL[0], pA[1] + tP * vL[1], pA[2] + tP * vL[2]]
            });
          }
        }
      }
    }

    if (interPoints.length >= 2) {
      var ip1 = interPoints[0], ip2 = interPoints[1];
      var exLabels = new Set(Object.values(pg.geo.points).map(function(p) { return p.label; }).filter(Boolean));
      var candL = ["I", "J", "K", "O", "P", "Q", "M", "N"];
      var l1 = candL.find(function(l) { return !exLabels.has(l); }) || "I";
      exLabels.add(l1);
      var l2 = candL.find(function(l) { return !exLabels.has(l); }) || "J";

      var vMat = sol.solid.view || Cp;
      var z1 = vMat[6] * ip1.pos3d[0] + vMat[7] * ip1.pos3d[1] + vMat[8] * ip1.pos3d[2];
      var z2 = vMat[6] * ip2.pos3d[0] + vMat[7] * ip2.pos3d[1] + vMat[8] * ip2.pos3d[2];

      var pt1Id = "pt_inter_" + Date.now() + "_1";
      var pt2Id = "pt_inter_" + Date.now() + "_2";

      var pt1 = { id: pt1Id, def: { t: "on", a: ip1.aId, b: ip1.bId, k: ip1.k }, label: l1, show: true, group: sol.group, z: z1, pos3d: ip1.pos3d };
      var pt2 = { id: pt2Id, def: { t: "on", a: ip2.aId, b: ip2.bId, k: ip2.k }, label: l2, show: true, group: sol.group, z: z2, pos3d: ip2.pos3d };

      var segInter = {
        id: "seg_inter_" + Date.now(),
        kind: "segment",
        pts: [pt1Id, pt2Id],
        color: "#dc2626",
        width: 2.2,
        dashed: false,
        group: sol.group,
        aux: false
      };

      board.commit(board.addGeo(pageIdx, [pt1, pt2], [segInter]));
      attachDrawnElementsToSolid(board, pageIdx, sol);
      board.redraw();
      board.emit();
      showSpatialToast("⭐ Đã dựng giao tuyến <b>" + l1 + l2 + "</b> = " + pl1.name + " ∩ " + pl2.name);
      return true;
    }

    // Fallback nếu không tính được
    showSpatialToast("⚠️ Không tìm thấy giao tuyến thực cắt giữa hai mặt phẳng " + pl1.name + " và " + pl2.name);
    return false;
  }

  function openSmartPlaneIntersectionModal(board) {
    if (!board) return;
    var pageIdx = board.sel ? board.sel.page : 0;
    var pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return;

    var sol = pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid && !s.hidden; }) ||
              pg.geo.shapes.find(function(s) { return s.kind === 'solid' && s.solid; });
    if (!sol || !sol.solid) {
      showSpatialToast("⚠️ Vui lòng vẽ hoặc chọn một khối hình không gian trước!");
      return;
    }

    var planes = getSolidPlanes(board);
    var old = document.getElementById('spatial-plane-inter-wizard');
    if (old) old.remove();

    var overlay = document.createElement('div');
    overlay.id = 'spatial-plane-inter-wizard';
    overlay.className = 'spatial-modal-overlay';

    var getLabel = function(id) {
      return (pg.geo.points[id] && pg.geo.points[id].label) ? pg.geo.points[id].label : id;
    };

    var presets = [];
    if (sol.pts.length === 6 && (sol.solid.of === 'prism3' || !sol.solid.of)) {
      var A = getLabel(sol.pts[0]), B = getLabel(sol.pts[1]), C = getLabel(sol.pts[2]);
      var A1 = getLabel(sol.pts[3]), B1 = getLabel(sol.pts[4]), C1 = getLabel(sol.pts[5]);
      var plA_BC = planes.find(function(p) { return p.key === 'cross_A_BC'; });
      var plBase = planes.find(function(p) { return p.desc === 'Mặt đáy'; });
      var plF_AB = planes.find(function(p) { return p.name.includes(A) && p.name.includes(B) && p.desc.includes('bên'); });
      var plF_AC = planes.find(function(p) { return p.name.includes(A) && p.name.includes(C) && p.desc.includes('bên'); });
      var plF_BC = planes.find(function(p) { return p.name.includes(B) && p.name.includes(C) && p.desc.includes('bên'); });

      if (plA_BC && plBase) {
        presets.push({
          title: '(' + A1 + B + C + ') ∩ (' + A + B + C + ') = ' + B + C,
          desc: 'Giao tuyến mặt chéo (' + A1 + B + C + ') với mặt đáy (' + A + B + C + ') là cạnh đáy ' + B + C,
          action: function() { executeTwoPlanesIntersection(board, sol, plA_BC, plBase); }
        });
      }
      if (plA_BC && plF_AB) {
        presets.push({
          title: '(' + A1 + B + C + ') ∩ (' + A + B + B1 + A1 + ') = ' + A1 + B,
          desc: 'Giao tuyến mặt chéo (' + A1 + B + C + ') với mặt bên (' + A + B + B1 + A1 + ') là đường chéo ' + A1 + B,
          action: function() { executeTwoPlanesIntersection(board, sol, plA_BC, plF_AB); }
        });
      }
      if (plA_BC && plF_AC) {
        presets.push({
          title: '(' + A1 + B + C + ') ∩ (' + A + C + C1 + A1 + ') = ' + A1 + C,
          desc: 'Giao tuyến mặt chéo (' + A1 + B + C + ') với mặt bên (' + A + C + C1 + A1 + ') là đường chéo ' + A1 + C,
          action: function() { executeTwoPlanesIntersection(board, sol, plA_BC, plF_AC); }
        });
      }
      if (plF_AB && plF_AC) {
        presets.push({
          title: '(' + A + B + B1 + A1 + ') ∩ (' + A + C + C1 + A1 + ') = ' + A + A1,
          desc: 'Giao tuyến 2 mặt bên là cạnh bên ' + A + A1,
          action: function() { executeTwoPlanesIntersection(board, sol, plF_AB, plF_AC); }
        });
      }
    } else if (sol.pts.length === 8 && (sol.solid.of === 'box' || sol.solid.of === 'cube')) {
      var A = getLabel(sol.pts[0]), B = getLabel(sol.pts[1]), C = getLabel(sol.pts[2]), D = getLabel(sol.pts[3]);
      var A1 = getLabel(sol.pts[4]), B1 = getLabel(sol.pts[5]), C1 = getLabel(sol.pts[6]), D1 = getLabel(sol.pts[7]);
      var plACC1A1 = planes.find(function(p) { return p.key === 'diag_ACC1A1'; });
      var plBDD1B1 = planes.find(function(p) { return p.key === 'diag_BDD1B1'; });
      if (plACC1A1 && plBDD1B1) {
        presets.push({
          title: '(' + A + C + C1 + A1 + ') ∩ (' + B + D + D1 + B1 + ") = trục OO'",
          desc: 'Giao tuyến 2 mặt chéo đối xứng qua trục hình hộp',
          action: function() { executeTwoPlanesIntersection(board, sol, plACC1A1, plBDD1B1); }
        });
      }
    } else if (sol.pts.length === 5) {
      var S = getLabel(sol.pts[4]), A = getLabel(sol.pts[0]), B = getLabel(sol.pts[1]), C = getLabel(sol.pts[2]), D = getLabel(sol.pts[3]);
      presets.push({
        title: '(' + S + A + C + ') ∩ (' + S + B + D + ') = ' + S + 'O',
        desc: 'Giao tuyến của 2 mặt chéo cắt nhau qua trục khối chóp',
        action: function() { executeDiagonalIntersection(board, sol); }
      });
      presets.push({
        title: '(' + S + A + B + ') ∩ (' + S + C + D + ') = d qua ' + S + ' // ' + A + B,
        desc: 'Giao tuyến song song với 2 cạnh đáy ' + A + B + ', ' + C + D,
        action: function() { executeParallelIntersection(board, sol, sol.pts[4], sol.pts[0], sol.pts[1]); }
      });
      presets.push({
        title: '(' + S + A + D + ') ∩ (' + S + B + C + ') = d qua ' + S + ' // ' + A + D,
        desc: 'Giao tuyến song song với 2 cạnh đáy ' + A + D + ', ' + B + C,
        action: function() { executeParallelIntersection(board, sol, sol.pts[4], sol.pts[0], sol.pts[3]); }
      });
    }

    var presetsHtml = presets.map(function(pr, idx) {
      return '<button class="spatial-preset-btn" id="btn-pre-inter-' + idx + '" style="text-align:left;padding:10px 14px;border:1.5px solid #e2e8f0;border-radius:12px;background:#f8fafc;cursor:pointer;margin-bottom:8px;display:flex;align-items:center;gap:10px;width:100%;">' +
        '<span style="font-size:18px;">🔴</span>' +
        '<div><div style="font-weight:700;color:#0f172a;font-size:13px;">' + pr.title + '</div><div style="font-size:11px;color:#64748b;">' + pr.desc + '</div></div>' +
      '</button>';
    }).join('');

    var selP1 = null, selP2 = null;
    var p1Html = planes.map(function(p) { return '<button class="spatial-chip p1-chip" data-key="' + p.key + '">' + p.name + '</button>'; }).join('');
    var p2Html = planes.map(function(p) { return '<button class="spatial-chip p2-chip" data-key="' + p.key + '">' + p.name + '</button>'; }).join('');

    overlay.innerHTML = '<div class="spatial-modal-card" style="max-width:500px;">' +
      '<div class="spatial-modal-header">' +
        '<div class="spatial-modal-title">🔴 Dựng Giao Tuyến 2 Mặt Phẳng</div>' +
        '<button class="spatial-modal-close" id="btn-close-pinter-modal">✕</button>' +
      '</div>' +
      '<div class="spatial-modal-body" style="max-height:75vh;overflow-y:auto;">' +
        (presets.length > 0 ? ('<div class="spatial-section-title">⚡ Giao tuyến mẫu SGK thường gặp:</div><div style="margin-bottom:16px;">' + presetsHtml + '</div>') : '') +
        '<div class="spatial-section-title">👉 Hoặc chọn 2 mặt phẳng từ hình:</div>' +
        '<div style="font-size:12px;font-weight:600;color:#334155;margin-bottom:6px;">Mặt phẳng thứ nhất (P):</div>' +
        '<div class="spatial-chips-wrap" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">' + p1Html + '</div>' +
        '<div style="font-size:12px;font-weight:600;color:#334155;margin-bottom:6px;">Mặt phẳng thứ hai (Q):</div>' +
        '<div class="spatial-chips-wrap" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;">' + p2Html + '</div>' +
        '<div id="inter-hint" style="font-size:12px;color:#dc2626;font-weight:600;margin-bottom:12px;">Vui lòng chọn đủ 2 mặt phẳng khác nhau</div>' +
        '<button id="btn-do-inter" disabled style="width:100%;padding:10px;border-radius:10px;border:none;background:#dc2626;color:#fff;font-weight:700;font-size:13px;opacity:0.5;cursor:not-allowed;">✨ Dựng giao tuyến ngay</button>' +
      '</div>' +
    '</div>';

    document.body.appendChild(overlay);
    var close = function() { overlay.remove(); };
    overlay.querySelector('#btn-close-pinter-modal').onclick = close;
    overlay.onclick = function(e) { if (e.target === overlay) close(); };

    presets.forEach(function(pr, idx) {
      var btn = overlay.querySelector('#btn-pre-inter-' + idx);
      if (btn) {
        btn.onclick = function() {
          close();
          pr.action();
        };
      }
    });

    var btnDo = overlay.querySelector('#btn-do-inter');
    var hint = overlay.querySelector('#inter-hint');

    var updateSelection = function() {
      if (selP1 && selP2 && selP1 !== selP2) {
        var pl1 = planes.find(function(p) { return p.key === selP1; });
        var pl2 = planes.find(function(p) { return p.key === selP2; });
        hint.style.color = '#059669';
        hint.textContent = 'Đã chọn: ' + pl1.name + ' và ' + pl2.name;
        btnDo.disabled = false;
        btnDo.style.opacity = '1';
        btnDo.style.cursor = 'pointer';
      } else {
        btnDo.disabled = true;
        btnDo.style.opacity = '0.5';
        btnDo.style.cursor = 'not-allowed';
        if (selP1 && selP2 && selP1 === selP2) {
          hint.style.color = '#dc2626';
          hint.textContent = 'Hai mặt phẳng phải khác nhau!';
        } else {
          hint.style.color = '#64748b';
          hint.textContent = 'Vui lòng chọn đủ 2 mặt phẳng khác nhau';
        }
      }
    };

    overlay.querySelectorAll('.p1-chip').forEach(function(b) {
      b.onclick = function() {
        overlay.querySelectorAll('.p1-chip').forEach(function(x) {
          x.style.borderColor = '#cbd5e1';
          x.style.background = '#f8fafc';
          x.style.color = '#1e293b';
          x.style.fontWeight = '500';
        });
        b.style.borderColor = '#dc2626';
        b.style.background = '#fef2f2';
        b.style.color = '#dc2626';
        b.style.fontWeight = '700';
        selP1 = b.getAttribute('data-key');
        updateSelection();
      };
    });

    overlay.querySelectorAll('.p2-chip').forEach(function(b) {
      b.onclick = function() {
        overlay.querySelectorAll('.p2-chip').forEach(function(x) {
          x.style.borderColor = '#cbd5e1';
          x.style.background = '#f8fafc';
          x.style.color = '#1e293b';
          x.style.fontWeight = '500';
        });
        b.style.borderColor = '#2563eb';
        b.style.background = '#eff6ff';
        b.style.color = '#2563eb';
        b.style.fontWeight = '700';
        selP2 = b.getAttribute('data-key');
        updateSelection();
      };
    });

    btnDo.onclick = function() {
      if (!selP1 || !selP2 || selP1 === selP2) return;
      var pl1 = planes.find(function(p) { return p.key === selP1; });
      var pl2 = planes.find(function(p) { return p.key === selP2; });
      close();
      executeTwoPlanesIntersection(board, sol, pl1, pl2);
    };
  }

  function patchBoardPrototype(BoardProto) {
    if (!BoardProto || BoardProto._group3DPatchedV2) return;
    BoardProto._group3DPatchedV2 = true;

    // Lưu lại các hàm gốc
    // Armor for board.sel: Ensure strokes, items, points, shapes are ALWAYS Sets
    if (!Object.getOwnPropertyDescriptor(BoardProto, 'sel')?.set) {
      Object.defineProperty(BoardProto, 'sel', {
        get() { return this._selProperty; },
        set(val) {
          if (!val) {
            this._selProperty = null;
            return;
          }
          if (typeof val.page !== 'number') val.page = 0;
          if (!val.strokes) val.strokes = new Set();
          if (!val.items) val.items = new Set();
          if (!val.points) val.points = new Set();
          if (!val.shapes) val.shapes = new Set();
          this._selProperty = val;
        },
        configurable: true,
        enumerable: true
      });
    }

    BoardProto._origSelectedSolid = BoardProto.selectedSolid;
    BoardProto._origSelectionSolid = BoardProto.selectionSolid;
    BoardProto._origStartTurning = BoardProto.startTurning;
    BoardProto._origAddGeo = BoardProto.addGeo;

    // Mở rộng selectionSolid: Cho phép hiển thị nút Xoay 3D khi có solid hoặc nhóm hình vẽ
    BoardProto.selectionSolid = function() {
      if (this._origSelectionSolid && this._origSelectionSolid.call(this)) return true;
      return canTurnSelection(this);
    };

    // Mở rộng selectedSolid: Trả về solid hoặc group solid
    BoardProto.selectedSolid = function() {
      const orig = this._origSelectedSolid ? this._origSelectedSolid.call(this) : null;
      if (orig) return orig;

      if (this.sel && ((this.sel.shapes && this.sel.shapes.size > 0) || (this.sel.points && this.sel.points.size >= 3))) {
        const pg = this.doc.pages[this.sel.page];
        if (pg && pg.geo) {
          const grpSolid = pg.geo.shapes.find(s => s.kind === 'solid' && s.solid && (
            this.sel.shapes.has(s.id) ||
            (s.group && pg.geo.shapes.some(x => this.sel.shapes.has(x.id) && x.group === s.group))
          ));
          if (grpSolid) return { page: this.sel.page, id: grpSolid.id, isGroup: !!grpSolid.solid.isGroup3D };
          return { page: this.sel.page, id: '_group_selection_', isGroup: true };
        }
      }
      return null;
    };

    // Mở rộng addGeo: Tự động phát hiện khi vẽ thêm lên khối 3D để đồng bộ ngay lập tức
    if (BoardProto.addGeo) {
      BoardProto.addGeo = function(pageIdx, newPts, newShapes, doc = this.doc) {
        const resDoc = BoardProto._origAddGeo.call(this, pageIdx, newPts, newShapes, doc);
        try {
          const pg = resDoc.pages[pageIdx];
          if (pg && pg.geo) {
            const sol = pg.geo.shapes.find(s => s.kind === 'solid' && s.solid);
            if (sol && ((newPts && newPts.length > 0) || (newShapes && newShapes.length > 0))) {
              setTimeout(() => {
                attachDrawnElementsToSolid(this, pageIdx, sol);
              }, 20);
            }
          }
        } catch (e) {
          console.warn('[Group3D] Auto-sync on addGeo warning:', e);
        }
        return resDoc;
      };
    }

    // Mở rộng startTurning: Tự động gom & tính toạ độ 3D chuẩn xác cho mọi hình vẽ thêm trước khi xoay
    BoardProto.startTurning = function() {
      let sol = this.selectedSolid();
      if (!sol && canTurnSelection(this)) {
        sol = prepareGroup3D(this, this.sel);
      } else if (sol && (sol.id === '_group_selection_' || (this.sel && this.sel.shapes && this.sel.shapes.size > 1))) {
        sol = prepareGroup3D(this, this.sel);
      }

      if (!sol) return;

      // Đảm bảo gắn kết mọi đường & điểm vẽ thêm vào solid trước khi bắt đầu xoay!
      if (sol.id && sol.id !== '_group_selection_') {
        const attached = attachDrawnElementsToSolid(this, sol.page, sol);
        if (attached && attached.id) sol = attached;
      }

      const pg = this.doc.pages[sol.page];
      if (!pg || !pg.geo) return;

      this.sel = null;
      this.turning = {
        page: sol.page,
        id: sol.id,
        mode: this.turnMode || 'table',
        unfold: 0,
        canUnfold: true,
        isGroup: !!sol.isGroup
      };
      this.redraw();
      this.emit();
    };

    // Gắn thêm các tiện ích
    // Hook autoTurnBegin để luôn đồng bộ các đối tượng vẽ thêm trước khi xoay
    BoardProto._origAutoTurnBegin = BoardProto.autoTurnBegin;
    BoardProto.autoTurnBegin = function() {
      if (this.turning && this.turning.id && this.turning.id !== '_group_selection_') {
        attachDrawnElementsToSolid(this, this.turning.page, { id: this.turning.id });
      }
      return BoardProto._origAutoTurnBegin ? BoardProto._origAutoTurnBegin.call(this) : false;
    };

    // Hook turnView để luôn đồng bộ trước khi đổi hướng nhìn
    BoardProto._origTurnView = BoardProto.turnView;
    BoardProto.turnView = function(view) {
      if (this.turning && this.turning.id && this.turning.id !== '_group_selection_') {
        attachDrawnElementsToSolid(this, this.turning.page, { id: this.turning.id });
      }
      return BoardProto._origTurnView ? BoardProto._origTurnView.call(this, view) : false;
    };

    BoardProto.groupSelection = function() { groupSelection(this); };
    BoardProto.ungroupSelection = function() { ungroupSelection(this); };
    BoardProto.isGroupSelection = function() { return isGroupSelection(this); };
    BoardProto.canTurnSelection = function() { return canTurnSelection(this); };
    BoardProto.attachDrawnElementsToSolid = function(pIdx, s) { return attachDrawnElementsToSolid(this, pIdx, s); };
    BoardProto.setUnfoldAnimated = function(target, duration) { return setUnfoldAnimated(this, target, duration); };
    BoardProto.toggleUnfoldFaces = function() { return toggleUnfoldFaces(this); };
    BoardProto.expandPlaneFrom3Points = function(ptIds) { return expandPlaneFrom3Points(this, ptIds); };
    BoardProto.expandLinePlaneIntersection = function(linePtIds, planePtIds) { return expandLinePlaneIntersection(this, linePtIds, planePtIds); };

    BoardProto.addPointProjection = function(ptId) { return addPointProjection(this, ptId); };
    BoardProto.addSegmentMidpoint = function(ptA, ptB) { return addSegmentMidpoint(this, ptA, ptB); };
    BoardProto.addSegmentIntersection = function(s1, s2) { return addSegmentIntersection(this, s1, s2); };
    BoardProto.extendSegmentEdge = function(params) { return extendSegmentEdge(this, params); };
    BoardProto.openSmartExtendEdgeModal = function(edgeId) { return openSmartExtendEdgeModal(this, edgeId); };
    BoardProto.openSmartIntersectionModal = function(l1, l2) { return openSmartIntersectionModal(this, l1, l2); };
    BoardProto.addTriangleCentroid = function(ptA, ptB, ptC) { return addTriangleCentroid(this, ptA, ptB, ptC); };
    BoardProto.addFaceCentroidByPlane = function(plane) { return addFaceCentroidByPlane(this, plane); };
    BoardProto.openSmartPlaneModal = function() { return openSmartPlaneModal(this); };
    BoardProto.openSmartIntersectionModal = function(linePtIds, planePtIds) { return openSmartIntersectionModal(this, linePtIds, planePtIds); };
    BoardProto.openSmartLinePlaneModal = function(linePtIds, planePtIds) { return openSmartIntersectionModal(this, linePtIds, planePtIds); };
    BoardProto.openSmartHeightModal = function(ptId) { return openSmartHeightModal(this, ptId); };
    BoardProto.openSmartProjectionModal = function(ptId) { return openSmartProjectionModal(this, ptId); };
    BoardProto.openSmartMidpointModal = function(ptA, ptB) { return openSmartMidpointModal(this, ptA, ptB); };
    BoardProto.openSmartCentroidModal = function() { return openSmartCentroidModal(this); };
    BoardProto.openSmartPlaneIntersectionModal = function() { return openSmartPlaneIntersectionModal(this); };

    BoardProto.addLinePlaneIntersection = function(linePtIds, planePtIds) { return expandLinePlaneIntersection(this, linePtIds, planePtIds); };
    BoardProto.getSolidPlanes = function() { return getSolidPlanes(this); };
    BoardProto.colorSolidPlane = function(plane, color, alpha) { return colorSolidPlane(this, plane, color, alpha); };
    BoardProto.clearSolidPlaneColor = function(key) { return clearSolidPlaneColor(this, key); };
    BoardProto.drawColoredPlane = function(color) { return colorSolidPlane(this, null, color); };
    BoardProto.openColoredPlaneModal = function() { return openColoredPlaneModal(this); };
    BoardProto.hasSolidInPage = function() {
      var pg = this.doc.pages[this.sel ? this.sel.page : 0];
      return !!(pg && pg.geo && pg.geo.shapes.some(function(s) { return s.kind === 'solid'; }));
    };


    console.log('[Group3D] Đã tích hợp thành công nâng cấp 3D Sync vào Board.prototype');
  }

  // Khởi tạo tự động khi Board sẵn sàng
  function tryPatch() {
    if (window.appEngine && window.appEngine.constructor) {
      patchBoardPrototype(window.appEngine.constructor.prototype);
      return true;
    }
    if (window._nrnBoard && window._nrnBoard.constructor) {
      patchBoardPrototype(window._nrnBoard.constructor.prototype);
      return true;
    }
    return false;
  }

  if (!tryPatch()) {
    const timer = setInterval(() => {
      if (tryPatch()) clearInterval(timer);
    }, 50);
    setTimeout(() => clearInterval(timer), 15000);
  }

  // Xuất API toàn cục
  window.Group3D = {
    canTurnSelection,
    isGroupSelection,
    prepareGroup3D,
    groupSelection,
    ungroupSelection,
    attachDrawnElementsToSolid,
    patchBoardPrototype
  };

  console.log('[Module] Group3D v4 loaded successfully.');
})(window);
