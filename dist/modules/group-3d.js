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

    // First pass: free points
    for (const [id, pt] of Object.entries(geo.points)) {
      if (pt && pt.def && pt.def.t === 'free') {
        map.set(id, { x: pt.def.x, y: pt.def.y });
      }
    }

    // Second pass: derived points (mid, on, etc.)
    for (let iter = 0; iter < 3; iter++) {
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
        }
      }
    }
    return map;
  }

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

    // Nếu chưa có Z, tự động gán Z chuẩn hình học SGK
    if (zMap.size < sol.pts.length) {
      const pts2D = sol.pts.map(pid => pMap.get(pid)).filter(Boolean);
      const minY = pts2D.length ? Math.min(...pts2D.map(p => p.y)) : 0;
      const maxY = pts2D.length ? Math.max(...pts2D.map(p => p.y)) : 0;
      const height = Math.max(30, maxY - minY);

      sol.pts.forEach(pid => {
        if (!zMap.has(pid)) {
          const p2D = pMap.get(pid);
          if (p2D && p2D.y <= minY + height * 0.15) {
            zMap.set(pid, height * 0.85); // Đỉnh S
          } else {
            zMap.set(pid, 0);             // Mặt đáy
          }
        }
      });
    }

    // Giá trị Z trung bình của mặt đáy và đỉnh
    const allZ = Array.from(zMap.values());
    const minZ = allZ.length ? Math.min(...allZ) : 0;
    const maxZ = allZ.length ? Math.max(...allZ) : 100;
    const avgZ = allZ.length ? allZ.reduce((a, b) => a + b, 0) / allZ.length : 0;

    // 3. BFS Tìm tất cả shapes và points được vẽ thêm kết nối với khối
    const attachedPtIds = new Set(sol.pts);
    const attachedShapeIds = new Set();

    let queue = Array.from(sol.pts);
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
              queue.push(pid);
              changed = true;
            }
          });
        }
      });
    }

    // Quét thêm các điểm nằm trên các cạnh hoặc mặt của khối
    Object.keys(geo.points).forEach(pid => {
      if (attachedPtIds.has(pid)) return;
      const P = pMap.get(pid);
      if (!P) return;

      // Kiểm tra xem P có nằm trên cạnh nào của solid không (< 8px)
      for (const [idA, idB] of edges) {
        const pA = pMap.get(idA), pB = pMap.get(idB);
        if (pA && pB) {
          const { k, distSq: dSq } = getProjectionRatio(P, pA, pB);
          if (dSq <= 64 && k >= -0.05 && k <= 1.05) {
            attachedPtIds.add(pid);
            // Gán tỉ lệ z tương ứng
            const zA = zMap.get(idA) ?? minZ, zB = zMap.get(idB) ?? minZ;
            zMap.set(pid, (1 - k) * zA + k * zB);
            break;
          }
        }
      }

      // Kiểm tra xem P có nằm trong mặt nào của solid không
      if (!attachedPtIds.has(pid)) {
        for (const face of faces) {
          const poly = face.map(id => pMap.get(id)).filter(Boolean);
          if (poly.length >= 3 && isPointInsidePolygon(P, poly)) {
            attachedPtIds.add(pid);
            // Tính Z bằng toạ độ trọng tâm
            const b = getBarycentricCoords(P, poly[0], poly[1], poly[2]);
            if (b) {
              const z0 = zMap.get(face[0]) ?? minZ;
              const z1 = zMap.get(face[1]) ?? minZ;
              const z2 = zMap.get(face[2]) ?? minZ;
              zMap.set(pid, b.u * z0 + b.v * z1 + b.w * z2);
            } else {
              zMap.set(pid, minZ);
            }
            break;
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

      // Thử nội suy theo cạnh
      let interpolated = false;
      for (const [idA, idB] of edges) {
        const pA = pMap.get(idA), pB = pMap.get(idB);
        if (pA && pB) {
          const { k, distSq: dSq } = getProjectionRatio(P, pA, pB);
          if (dSq <= 100) {
            const zA = zMap.get(idA) ?? minZ, zB = zMap.get(idB) ?? minZ;
            zMap.set(pid, (1 - k) * zA + k * zB);
            interpolated = true;
            break;
          }
        }
      }

      if (!interpolated) {
        // Nội suy theo chiều cao Y tương đối
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
        if (pt.group !== groupId || currentZ === undefined || Math.abs((currentZ ?? 0) - targetZ) > 1e-4) {
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

    // Cập nhật danh sách điểm pts của solid
    const mergedSolidPts = Array.from(attachedPtIds);
    let updatedSolid = sol;
    if (sol.pts.length !== mergedSolidPts.length || sol.group !== groupId) {
      updatedSolid = {
        ...sol,
        group: groupId,
        pts: mergedSolidPts
      };
      const solIdx = newShapes.findIndex(s => s.id === sol.id);
      if (solIdx !== -1) newShapes[solIdx] = updatedSolid;
      hasShapeUpdate = true;
    }

    if (hasPointUpdate || hasShapeUpdate) {
      board.commit(board.updatePage(pageIdx, P => ({
        ...P,
        geo: { ...P.geo, points: newPoints, shapes: newShapes }
      })));
      console.log('[Group3D] Đã tự động gắn kết', attachedPtIds.size - sol.pts.length, 'điểm và', attachedShapeIds.size, 'hình vẽ thêm vào khối 3D!');
    }

    return { page: pageIdx, id: updatedSolid.id, group: groupId };
  }

  /**
   * Kiểm tra selection hiện tại có thể xoay 3D được không
   */
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
  function expandLinePlaneIntersection(board, linePtIds, planePtIds) {
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

    // 1. Xác định 2 điểm của đường thẳng d (Line points)
    let ptAId = null, ptBId = null;

    if (linePtIds && linePtIds.length >= 2) {
      ptAId = linePtIds[0];
      ptBId = linePtIds[1];
    } else if (board.sel && board.sel.points && board.sel.points.size >= 2) {
      const selPts = Array.from(board.sel.points);
      ptAId = selPts[0];
      ptBId = selPts[1];
    } else if (board.sel && board.sel.shapes && board.sel.shapes.size === 1) {
      // Nếu chọn 1 đoạn thẳng
      const shId = Array.from(board.sel.shapes)[0];
      const sh = pg.geo.shapes.find(s => s.id === shId);
      if (sh && (sh.kind === 'segment' || sh.kind === 'line' || sh.kind === 'ray') && sh.pts && sh.pts.length >= 2) {
        ptAId = sh.pts[0];
        ptBId = sh.pts[1];
      }
    }

    // Tự động tìm 2 điểm mẫu trên khối nếu chưa chọn (ví dụ 1 cạnh bên hoặc 2 điểm phụ)
    if (!ptAId || !ptBId) {
      if (sol.pts && sol.pts.length >= 4) {
        const apexId = sol.pts[sol.pts.length - 1];
        ptAId = apexId;
        ptBId = sol.pts[0];
      }
    }

    if (!ptAId || !ptBId || ptAId === ptBId) {
      alert("Vui lòng chọn 1 đường thẳng (hoặc 2 điểm) cần mở rộng để tìm giao điểm!");
      return false;
    }

    // Đảm bảo các điểm liên quan đã được tính toạ độ 3D
    attachDrawnElementsToSolid(board, pageIdx, sol);

    const pMap2D = getPointMap(pg.geo);
    const ptA = pg.geo.points[ptAId];
    const ptB = pg.geo.points[ptBId];
    const pA2D = pMap2D.get(ptAId);
    const pB2D = pMap2D.get(ptBId);
    if (!ptA || !ptB || !pA2D || !pB2D) {
      alert("Không tìm thấy toạ độ của đường thẳng đã chọn!");
      return false;
    }

    // Lấy toạ độ 3D của A và B
    const c = o4(sol.solid.view || Cp);
    const zA = ptA.z ?? 0;
    const zB = ptB.z ?? 0;
    const pA3D = ptA.pos3d ? [...ptA.pos3d] : wo(c, [pA2D.x, pA2D.y, zA]);
    const pB3D = ptB.pos3d ? [...ptB.pos3d] : wo(c, [pB2D.x, pB2D.y, zB]);

    // Vector chỉ phương của đường thẳng d: v = B - A
    const vLine = [pB3D[0] - pA3D[0], pB3D[1] - pA3D[1], pB3D[2] - pA3D[2]];
    const lineLen = Math.hypot(vLine[0], vLine[1], vLine[2]);
    if (lineLen < 1e-5) {
      alert("Hai điểm chọn trùng nhau, không xác định được đường thẳng!");
      return false;
    }

    // 2. Xác định Mặt Phẳng (Plane Normal & Dist)
    let normal = null;
    let dist = 0;
    let planeDesc = "";
    const cs = board.crossSection;

    // Ưu tiên 1: Người dùng truyền planePtIds hoặc chọn 3 điểm làm mp (e.g. 5 điểm tổng cộng)
    let pPlaneIds = planePtIds;
    if (!pPlaneIds && board.sel && board.sel.points && board.sel.points.size >= 5) {
      const allPts = Array.from(board.sel.points);
      pPlaneIds = allPts.slice(2, 5);
    }

    if (pPlaneIds && pPlaneIds.length >= 3) {
      const pt1 = pg.geo.points[pPlaneIds[0]], pt2 = pg.geo.points[pPlaneIds[1]], pt3 = pg.geo.points[pPlaneIds[2]];
      const p1_2d = pMap2D.get(pPlaneIds[0]), p2_2d = pMap2D.get(pPlaneIds[1]), p3_2d = pMap2D.get(pPlaneIds[2]);
      if (pt1 && pt2 && pt3 && p1_2d && p2_2d && p3_2d) {
        const p1_3d = pt1.pos3d ? [...pt1.pos3d] : wo(c, [p1_2d.x, p1_2d.y, pt1.z ?? 0]);
        const p2_3d = pt2.pos3d ? [...pt2.pos3d] : wo(c, [p2_2d.x, p2_2d.y, pt2.z ?? 0]);
        const p3_3d = pt3.pos3d ? [...pt3.pos3d] : wo(c, [p3_2d.x, p3_2d.y, pt3.z ?? 0]);
        const u1 = [p2_3d[0] - p1_3d[0], p2_3d[1] - p1_3d[1], p2_3d[2] - p1_3d[2]];
        const u2 = [p3_3d[0] - p1_3d[0], p3_3d[1] - p1_3d[1], p3_3d[2] - p1_3d[2]];
        const nCross = [
          u1[1] * u2[2] - u1[2] * u2[1],
          u1[2] * u2[0] - u1[0] * u2[2],
          u1[0] * u2[1] - u1[1] * u2[0]
        ];
        const nL = Math.hypot(nCross[0], nCross[1], nCross[2]);
        if (nL > 1e-5) {
          normal = [nCross[0] / nL, nCross[1] / nL, nCross[2] / nL];
          dist = normal[0] * p1_3d[0] + normal[1] * p1_3d[1] + normal[2] * p1_3d[2];
          planeDesc = '(' + (pt1.label || 'P1') + (pt2.label || 'P2') + (pt3.label || 'P3') + ')';
        }
      }
    }

    // Ưu tiên 2: Mặt phẳng cắt / mở rộng đang mở (crossSection)
    if (!normal && cs && cs.page === pageIdx) {
      if (cs.normal && cs.dist !== undefined) {
        normal = [...cs.normal];
        dist = cs.dist;
      } else {
        const angRad = (cs.angle || 45) * Math.PI / 180;
        normal = cs.type === "vert" ? [1, 0, 0] : cs.type === "diag" ? [Math.sin(angRad), 0, Math.cos(angRad)] : [0, 0, 1];
        const nLen = Math.hypot(normal[0], normal[1], normal[2]) || 1;
        normal = [normal[0] / nLen, normal[1] / nLen, normal[2] / nLen];
        dist = cs.dist !== undefined ? cs.dist : 0;
      }
      planeDesc = cs.labels && cs.labels.length ? '(' + cs.labels.join("") + ')' : "mặt phẳng (α)";
    }

    // Ưu tiên 3: Mặt phẳng đáy của khối 3D (mặt phẳng thường dùng nhất trong toán HH KG)
    if (!normal) {
      const basePts = sol.pts.slice(0, sol.pts.length - 1);
      if (basePts.length >= 3) {
        const b1 = pg.geo.points[basePts[0]], b2 = pg.geo.points[basePts[1]], b3 = pg.geo.points[basePts[2]];
        const b1_2d = pMap2D.get(basePts[0]), b2_2d = pMap2D.get(basePts[1]), b3_2d = pMap2D.get(basePts[2]);
        if (b1 && b2 && b3 && b1_2d && b2_2d && b3_2d) {
          const b1_3d = b1.pos3d ? [...b1.pos3d] : wo(c, [b1_2d.x, b1_2d.y, b1.z ?? 0]);
          const b2_3d = b2.pos3d ? [...b2.pos3d] : wo(c, [b2_2d.x, b2_2d.y, b2.z ?? 0]);
          const b3_3d = b3.pos3d ? [...b3.pos3d] : wo(c, [b3_2d.x, b3_2d.y, b3.z ?? 0]);
          const u1 = [b2_3d[0] - b1_3d[0], b2_3d[1] - b1_3d[1], b2_3d[2] - b1_3d[2]];
          const u2 = [b3_3d[0] - b1_3d[0], b3_3d[1] - b1_3d[1], b3_3d[2] - b1_3d[2]];
          const nCross = [
            u1[1] * u2[2] - u1[2] * u2[1],
            u1[2] * u2[0] - u1[0] * u2[2],
            u1[0] * u2[1] - u1[1] * u2[0]
          ];
          const nL = Math.hypot(nCross[0], nCross[1], nCross[2]);
          if (nL > 1e-5) {
            normal = [nCross[0] / nL, nCross[1] / nL, nCross[2] / nL];
            dist = normal[0] * b1_3d[0] + normal[1] * b1_3d[1] + normal[2] * b1_3d[2];
            planeDesc = 'mặt phẳng đáy (' + basePts.map(id => pg.geo.points[id]?.label || '').join('') + ')';
          }
        }
      }
    }

    // Fallback: Mặt phẳng Oxy (Z = 0)
    if (!normal) {
      normal = [0, 0, 1];
      dist = 0;
      planeDesc = "mặt phẳng đáy";
    }

    // 3. Tính giao điểm của đường thẳng d và mặt phẳng (normal, dist)
    const denom = normal[0] * vLine[0] + normal[1] * vLine[1] + normal[2] * vLine[2];
    if (Math.abs(denom) < 1e-6) {
      alert('Đường thẳng ' + (ptA.label || 'A') + (ptB.label || 'B') + ' song song hoặc nằm trên ' + planeDesc + ', không có giao điểm duy nhất!');
      return false;
    }

    const dotA = normal[0] * pA3D[0] + normal[1] * pA3D[1] + normal[2] * pA3D[2];
    const tParam = (dist - dotA) / denom;

    // Toạ độ 3D của giao điểm I
    const pI3D = [
      pA3D[0] + tParam * vLine[0],
      pA3D[1] + tParam * vLine[1],
      pA3D[2] + tParam * vLine[2]
    ];

    // Chiếu toạ độ 3D về màn hình 2D
    const viewMat = sol.solid.view || Cp;
    const pI2D = {
      x: viewMat[0] * pI3D[0] + viewMat[1] * pI3D[1] + viewMat[2] * pI3D[2],
      y: viewMat[3] * pI3D[0] + viewMat[4] * pI3D[1] + viewMat[5] * pI3D[2]
    };
    const zI = viewMat[6] * pI3D[0] + viewMat[7] * pI3D[1] + viewMat[8] * pI3D[2];

    // Chọn nhãn cho điểm giao (I, J, K, E, F...)
    const existingLabels = new Set(Object.values(pg.geo.points).map(p => p.label).filter(Boolean));
    const candidateLabels = ["I", "J", "K", "E", "F", "P", "Q", "H", "T"];
    let chosenLabel = candidateLabels.find(lbl => !existingLabels.has(lbl)) || "I";

    const ptIId = "pt_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    const ptI = {
      id: ptIId,
      def: { t: "free", x: Math.round(pI2D.x * 10) / 10, y: Math.round(pI2D.y * 10) / 10 },
      label: chosenLabel,
      show: true,
      z: zI,
      group: sol.group,
      pos3d: [Math.round(pI3D[0] * 100) / 100, Math.round(pI3D[1] * 100) / 100, Math.round(pI3D[2] * 100) / 100]
    };

    const newShapes = [];

    // Tạo đoạn thẳng kéo dài (extension segment)
    const extSegId = "seg_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    if (tParam > 1) {
      newShapes.push({
        id: extSegId,
        kind: "segment",
        pts: [ptBId, ptIId],
        color: "#0284c7",
        width: 2.2,
        dashed: false,
        group: sol.group,
        aux: true
      });
    } else if (tParam < 0) {
      newShapes.push({
        id: extSegId,
        kind: "segment",
        pts: [ptAId, ptIId],
        color: "#0284c7",
        width: 2.2,
        dashed: false,
        group: sol.group,
        aux: true
      });
    } else {
      newShapes.push({
        id: extSegId,
        kind: "segment",
        pts: [ptAId, ptIId],
        color: "#0284c7",
        width: 2.2,
        dashed: false,
        group: sol.group,
        aux: true
      });
      newShapes.push({
        id: "seg_" + (Date.now() + 1) + "_" + Math.floor(Math.random() * 1000),
        kind: "segment",
        pts: [ptIId, ptBId],
        color: "#0284c7",
        width: 2.2,
        dashed: true,
        group: sol.group,
        aux: true
      });
    }

    // Kiểm tra tính đồng phẳng với cạnh đáy để kéo dài đồng quy chuẩn SGK
    const baseEdges = [];
    if (sol.pts && sol.pts.length >= 3) {
      const numBase = sol.pts.length - 1;
      for (let bi = 0; bi < numBase; bi++) {
        baseEdges.push([sol.pts[bi], sol.pts[(bi + 1) % numBase]]);
      }
    }

    for (const [eAId, eBId] of baseEdges) {
      const eA = pg.geo.points[eAId], eB = pg.geo.points[eBId];
      const eA2D = pMap2D.get(eAId), eB2D = pMap2D.get(eBId);
      if (!eA || !eB || !eA2D || !eB2D) continue;
      const eA3D = eA.pos3d ? [...eA.pos3d] : wo(c, [eA2D.x, eA2D.y, eA.z ?? 0]);
      const eB3D = eB.pos3d ? [...eB.pos3d] : wo(c, [eB2D.x, eB2D.y, eB.z ?? 0]);

      const vE = [eB3D[0] - eA3D[0], eB3D[1] - eA3D[1], eB3D[2] - eA3D[2]];
      const vEI = [pI3D[0] - eA3D[0], pI3D[1] - eA3D[1], pI3D[2] - eA3D[2]];
      const crossE = [
        vE[1] * vEI[2] - vE[2] * vEI[1],
        vE[2] * vEI[0] - vE[0] * vEI[2],
        vE[0] * vEI[1] - vE[1] * vEI[0]
      ];
      const dLine = Math.hypot(crossE[0], crossE[1], crossE[2]) / (Math.hypot(vE[0], vE[1], vE[2]) || 1);
      if (dLine < 5) {
        const distToB = Math.hypot(pI3D[0] - eB3D[0], pI3D[1] - eB3D[1], pI3D[2] - eB3D[2]);
        const distToA = Math.hypot(pI3D[0] - eA3D[0], pI3D[1] - eA3D[1], pI3D[2] - eA3D[2]);
        const nearId = distToB < distToA ? eBId : eAId;
        newShapes.push({
          id: "seg_base_ext_" + Date.now(),
          kind: "segment",
          pts: [nearId, ptIId],
          color: "#d97706",
          width: 2,
          dashed: false,
          group: sol.group,
          aux: true
        });
        break;
      }
    }

    // Thêm vào document
    board.commit(board.addGeo(pageIdx, [ptI], newShapes));

    // Gắn kết với khối 3D để xoay đồng bộ
    attachDrawnElementsToSolid(board, pageIdx, sol);

    board.redraw();
    board.emit();
    console.log('[Group3D] Đã tìm và mở rộng giao điểm (' + chosenLabel + ') của đường thẳng với ' + planeDesc);
    return true;
  }

  window.expandLinePlaneIntersection = expandLinePlaneIntersection;

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
    if (sol) attachDrawnElementsToSolid(board, pageIdx, sol);

    var pMap2D = getPointMap(pg.geo);
    var ptA = pg.geo.points[idA], ptB = pg.geo.points[idB];
    var pA2D = pMap2D.get(idA), pB2D = pMap2D.get(idB);
    if (!ptA || !ptB || !pA2D || !pB2D) return false;

    var mid2D = { x: (pA2D.x + pB2D.x) / 2, y: (pA2D.y + pB2D.y) / 2 };
    var mid3D = null;
    if (sol && sol.solid) {
      var c = o4(sol.solid.view || Cp);
      var pA3D = ptA.pos3d ? ptA.pos3d.slice() : wo(c, [pA2D.x, pA2D.y, ptA.z !== undefined ? ptA.z : 0]);
      var pB3D = ptB.pos3d ? ptB.pos3d.slice() : wo(c, [pB2D.x, pB2D.y, ptB.z !== undefined ? ptB.z : 0]);
      mid3D = [(pA3D[0] + pB3D[0]) / 2, (pA3D[1] + pB3D[1]) / 2, (pA3D[2] + pB3D[2]) / 2];
    }

    var existingLabels = new Set(Object.values(pg.geo.points).map(function(p) { return p.label; }).filter(Boolean));
    var candLabels = ["M", "N", "P", "Q", "I", "J", "K", "E", "F"];
    var chosenLabel = candLabels.find(function(lbl) { return !existingLabels.has(lbl); }) || "M";

    var ptMidId = "pt_mid_" + Date.now();
    var ptMid = {
      id: ptMidId,
      def: { t: "free", x: Math.round(mid2D.x * 10) / 10, y: Math.round(mid2D.y * 10) / 10 },
      label: chosenLabel,
      show: true,
      group: sol ? sol.group : undefined,
      pos3d: mid3D ? [Math.round(mid3D[0]*100)/100, Math.round(mid3D[1]*100)/100, Math.round(mid3D[2]*100)/100] : undefined
    };

    board.commit(board.addGeo(pageIdx, [ptMid], []));
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
    if (sol) attachDrawnElementsToSolid(board, pageIdx, sol);

    var pMap2D = getPointMap(pg.geo);
    var pA = pMap2D.get(ids[0]), pB = pMap2D.get(ids[1]), pC = pMap2D.get(ids[2]);
    if (!pA || !pB || !pC) return false;

    var g2D = { x: (pA.x + pB.x + pC.x) / 3, y: (pA.y + pB.y + pC.y) / 3 };
    var g3D = null;
    if (sol && sol.solid) {
      var c = o4(sol.solid.view || Cp);
      var ptA = pg.geo.points[ids[0]], ptB = pg.geo.points[ids[1]], ptC = pg.geo.points[ids[2]];
      var pA3D = ptA.pos3d || wo(c, [pA.x, pA.y, ptA.z !== undefined ? ptA.z : 0]);
      var pB3D = ptB.pos3d || wo(c, [pB.x, pB.y, ptB.z !== undefined ? ptB.z : 0]);
      var pC3D = ptC.pos3d || wo(c, [pC.x, pC.y, ptC.z !== undefined ? ptC.z : 0]);
      g3D = [(pA3D[0]+pB3D[0]+pC3D[0])/3, (pA3D[1]+pB3D[1]+pC3D[1])/3, (pA3D[2]+pB3D[2]+pC3D[2])/3];
    }

    var ptGId = "pt_cen_" + Date.now();
    var ptG = {
      id: ptGId,
      def: { t: "free", x: Math.round(g2D.x * 10) / 10, y: Math.round(g2D.y * 10) / 10 },
      label: "G",
      show: true,
      group: sol ? sol.group : undefined,
      pos3d: g3D ? [Math.round(g3D[0]*100)/100, Math.round(g3D[1]*100)/100, Math.round(g3D[2]*100)/100] : undefined
    };

    var midBC = { x: (pB.x + pC.x)/2, y: (pB.y + pC.y)/2 };
    var ptMidId = "pt_cen_mid_" + Date.now();
    var ptMid = {
      id: ptMidId,
      def: { t: "free", x: Math.round(midBC.x * 10)/10, y: Math.round(midBC.y * 10)/10 },
      label: "",
      show: false,
      group: sol ? sol.group : undefined
    };

    var newShapes = [
      {
        id: "seg_median_" + Date.now(),
        kind: "segment",
        pts: [ids[0], ptMidId],
        color: "#64748b",
        width: 1.5,
        dashed: true,
        group: sol ? sol.group : undefined,
        aux: true
      }
    ];

    board.commit(board.addGeo(pageIdx, [ptG, ptMid], newShapes));
    if (sol) attachDrawnElementsToSolid(board, pageIdx, sol);
    board.redraw();
    board.emit();

    showSpatialToast("G Đã dựng trọng tâm <b>G</b> của tam giác!");
    return true;
  }
  window.addTriangleCentroid = addTriangleCentroid;

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


  function patchBoardPrototype(BoardProto) {
    if (!BoardProto || BoardProto._group3DPatchedV2) return;
    BoardProto._group3DPatchedV2 = true;

    // Lưu lại các hàm gốc
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

      if (this.sel && (this.sel.shapes.size > 0 || this.sel.points.size >= 3)) {
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
    BoardProto.addTriangleCentroid = function(ptA, ptB, ptC) { return addTriangleCentroid(this, ptA, ptB, ptC); };
    BoardProto.openSmartPlaneModal = function() { return openSmartPlaneModal(this); };

    BoardProto.addLinePlaneIntersection = function(linePtIds, planePtIds) { return expandLinePlaneIntersection(this, linePtIds, planePtIds); };

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
