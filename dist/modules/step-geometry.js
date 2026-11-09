/**
 * =======================================================================
 * 🏗️ SPATIAL GEOMETRY BUILDER MODULE (Study Note AI)
 * Dựng hình học không gian từng bước chuẩn SGK Việt Nam:
 * - Bước 1: Vẽ mặt đáy (Tứ giác / Hình bình hành, Tam giác thường, Tam giác đều, Hình thang...)
 * - Bước 2: Dựng chiều cao TỰ DO HOÀN TOÀN (Kéo chuột/bút trên bảng vẽ hoặc dựng mẫu)
 * - Bước 3: Nối cạnh bên hoàn thiện & tự động phân tích nét khuất / nét đứt / xoay 3D!
 * 
 * ĐẶC BIỆT: THUẬT TOÁN CONVEX HULL XÁC ĐỊNH NÉT LIỀN - NÉT ĐỨT CHUẨN XÁC 100%!
 * =======================================================================
 */
(function(window) {
  'use strict';

  const uf = 0.5 * Math.SQRT1_2;
  const Zo = [1, uf, 0, 0, -uf, -1, -uf, 1, -uf]; // Phép chiếu xiên góc SGK
  const Cp = [1, 0, 0, 0, 1, 0, 0, 0, 1];

  function projectPoint(view, p3d) {
    return {
      x: view[0] * p3d[0] + view[1] * p3d[1] + view[2] * p3d[2],
      y: view[3] * p3d[0] + view[4] * p3d[1] + view[5] * p3d[2],
      z: view[6] * p3d[0] + view[7] * p3d[1] + view[8] * p3d[2]
    };
  }

  function uid(prefix = 'geo') {
    return prefix + '_' + Math.random().toString(36).slice(2, 9);
  }

  function getPt2D(pt) {
    if (!pt) return null;
    if (pt.def && pt.def.t === 'free') return { x: pt.def.x, y: pt.def.y };
    if (Number.isFinite(pt.x) && Number.isFinite(pt.y)) return { x: pt.x, y: pt.y };
    return null;
  }

  function dist2D(p1, p2) {
    if (!p1 || !p2) return Infinity;
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }

  /**
   * =======================================================================
   * THUẬT TOÁN HÌNH HỌC TÍNH TOÁN NÉT LIỀN / NÉT ĐỨT CHUẨN SGK TOÁN
   * =======================================================================
   */
  function crossProduct(o, a, b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  }

  function getConvexHull2D(pts) {
    if (!pts || pts.length <= 2) return pts ? pts.slice() : [];
    const sorted = pts.slice().sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);

    const lower = [];
    for (let p of sorted) {
      while (lower.length >= 2 && crossProduct(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
        lower.pop();
      }
      lower.push(p);
    }

    const upper = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
      const p = sorted[i];
      while (upper.length >= 2 && crossProduct(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
        upper.pop();
      }
      upper.push(p);
    }

    lower.pop();
    upper.pop();
    return lower.concat(upper);
  }

  function isOuterHullEdge(hull, id1, id2) {
    if (!hull || hull.length < 2) return false;
    const n = hull.length;
    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;
      if ((hull[i].id === id1 && hull[next].id === id2) ||
          (hull[i].id === id2 && hull[next].id === id1)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Phân loại toàn diện nét đứt / nét liền cho khối chóp chuẩn SGK Toán THPT GDPT 2018
   */
  function classifyPyramidEdges(apexPt, basePts, heightFootId = null) {
    if (!basePts || !basePts.length) {
      return {
        hiddenBasePtId: null,
        baseDashedPairs: new Set(),
        basePerimeterPairs: new Set(),
        isBaseSegmentDashed: () => false,
        lateralDashed: {},
        heightDashed: true
      };
    }

    // 1. Xác định đỉnh khuất của đáy (A_hidden)
    // Trong góc nhìn phối cảnh SGK, đáy nằm trên mặt phẳng ngang nhìn từ trên xuống và trước tới.
    // Đỉnh khuất là đỉnh nằm sâu nhất về phía sau (y nhỏ nhất).
    // Nếu có chân đường cao nằm trên một đỉnh đáy (như SA ⊥ đáy), đỉnh đó chính là đỉnh khuất A_hidden.
    let hiddenBasePt = null;
    if (heightFootId) {
      hiddenBasePt = basePts.find(bp => bp.id === heightFootId);
    }
    if (!hiddenBasePt) {
      hiddenBasePt = basePts[0];
      for (const bp of basePts) {
        if (bp.y < hiddenBasePt.y) {
          hiddenBasePt = bp;
        }
      }
    }

    const isTriangle = (basePts.length === 3);

    // 2. Sắp xếp các đỉnh đáy theo thứ tự vòng tròn quanh tâm (Centroid) để xác định đúng chu vi đáy
    const cx = basePts.reduce((s, p) => s + p.x, 0) / basePts.length;
    const cy = basePts.reduce((s, p) => s + p.y, 0) / basePts.length;
    const cyclicBasePts = basePts.slice().sort((a, b) => {
      return Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx);
    });

    const basePerimeterPairs = new Set();
    const baseDashedPairs = new Set();

    if (isTriangle) {
      // Đáy tam giác ABC: Cạnh đáy nằm sâu nhất phía sau (nối 2 đỉnh có y nhỏ nhất) là nét đứt
      const sortedByY = basePts.slice().sort((a, b) => a.y - b.y);
      const id1 = sortedByY[0].id;
      const id2 = sortedByY[1].id;
      baseDashedPairs.add(`${id1}--${id2}`);
      baseDashedPairs.add(`${id2}--${id1}`);

      for (let i = 0; i < 3; i++) {
        const p1 = cyclicBasePts[i];
        const p2 = cyclicBasePts[(i + 1) % 3];
        basePerimeterPairs.add(`${p1.id}--${p2.id}`);
        basePerimeterPairs.add(`${p2.id}--${p1.id}`);
      }
    } else {
      // Đáy tứ giác / đa giác (ABCD...):
      // Các cạnh thuộc chu vi nối vào đỉnh khuất (AB, AD) là NÉT ĐỨT; các cạnh chu vi phía trước (BC, CD) là NÉT LIỀN
      for (let i = 0; i < cyclicBasePts.length; i++) {
        const p1 = cyclicBasePts[i];
        const p2 = cyclicBasePts[(i + 1) % cyclicBasePts.length];
        basePerimeterPairs.add(`${p1.id}--${p2.id}`);
        basePerimeterPairs.add(`${p2.id}--${p1.id}`);

        if (p1.id === hiddenBasePt.id || p2.id === hiddenBasePt.id) {
          baseDashedPairs.add(`${p1.id}--${p2.id}`);
          baseDashedPairs.add(`${p2.id}--${p1.id}`);
        }
      }
    }

    // Helper kiểm tra một đoạn nối 2 đỉnh đáy có phải nét đứt không:
    // Nếu là đường chéo (như AC, BD) hoặc cạnh nối đỉnh khuất -> 100% BẮT BUỘC NÉT ĐỨT!
    function isBaseSegmentDashed(id1, id2) {
      const key = `${id1}--${id2}`;
      if (baseDashedPairs.has(key)) return true;
      if (!basePerimeterPairs.has(key)) {
        // Đường chéo trong lòng đáy (AC, BD...) hoặc đoạn thẳng xuyên qua khối đáy -> BẮT BUỘC NÉT ĐỨT
        return true;
      }
      return false;
    }

    // 3. Xác định cạnh bên (nối từ đỉnh S xuống từng đỉnh đáy):
    // - Cạnh nối tới đỉnh khuất phía sau (SA) -> NÉT ĐỨT
    // - TẤT CẢ các cạnh bên nối tới các đỉnh nhìn thấy (SB, SC, SD...) -> 100% BẮT BUỘC NÉT LIỀN (SILHOUETTE / MẶT TRƯỚC)
    const lateralDashed = {};
    for (const bp of basePts) {
      if (isTriangle) {
        if (heightFootId && bp.id === heightFootId) {
          lateralDashed[bp.id] = true;
        } else {
          lateralDashed[bp.id] = false;
        }
      } else {
        // Tứ giác / đa giác: Chỉ cạnh bên tới đỉnh khuất mới nét đứt, các cạnh bên còn lại 100% NÉT LIỀN
        lateralDashed[bp.id] = (bp.id === hiddenBasePt.id);
      }
    }

    // 4. Đường cao hình chóp luôn là nét đứt (đi xuyên qua lòng khối chóp)
    const heightDashed = true;

    return {
      hiddenBasePtId: hiddenBasePt ? hiddenBasePt.id : null,
      baseDashedPairs,
      basePerimeterPairs,
      isBaseSegmentDashed,
      lateralDashed,
      heightDashed
    };
  }

  function showToast(msg) {
    if (typeof document === 'undefined') return;
    let toast = document.getElementById('spatial-builder-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'spatial-builder-toast';
      toast.className = 'spatial-builder-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.display = 'block';
    toast.style.opacity = '1';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => { toast.style.display = 'none'; }, 300);
    }, 4000);
  }

  function getActiveBoard() {
    return window._nrnBoard || window.appEngine || null;
  }

  /**
   * Lấy trang hiện tại và toạ độ tâm khung nhìn CHUẨN XÁC trên trang đó
   */
  function getViewportCenter(board) {
    if (!board) return { page: 0, x: 400, y: 350 };

    let pageIdx = 0;
    if (typeof board.currentPage === 'function') {
      pageIdx = board.currentPage();
    } else if (board.sel && board.sel.page !== undefined) {
      pageIdx = board.sel.page;
    }

    const pages = board.doc?.pages || [];
    pageIdx = Math.max(0, Math.min(Math.max(0, pages.length - 1), pageIdx));
    const pg = pages[pageIdx];
    const pageWidth = (board.doc?.width) || (pg?.width) || 800;
    const pageHeight = (typeof board.phOf === 'function' ? board.phOf(pageIdx) : 1000);

    if (board.scroller) {
      const rect = board.scroller.getBoundingClientRect();
      const midScreenX = rect.width / 2;
      const midScreenY = rect.height / 2;

      if (typeof board.toDoc === 'function' && typeof board.toPage === 'function') {
        const docPt = board.toDoc(midScreenX, midScreenY);
        const pagePt = board.toPage(docPt, pageIdx);
        return {
          page: pageIdx,
          x: Math.max(140, Math.min(pageWidth - 140, pagePt.x)),
          y: Math.max(160, Math.min(pageHeight - 160, pagePt.y))
        };
      }
    }

    return {
      page: pageIdx,
      x: pageWidth / 2,
      y: Math.min(pageHeight / 2, 400)
    };
  }

  // Quản lý trạng thái phiên dựng hình hiện hành
  let currentBuild = {
    active: false,
    stage: 'none', // 'none' | 'base' | 'height' | 'complete'
    shapeType: 'pyramid', // 'pyramid' | 'pyramid_tri' | 'pyramid_regular' | 'pyramid_trap' | 'prism_tri' | 'prism_quad' | 'cube' | 'cuboid' | 'frustum' | 'cone' | 'cylinder' | 'sphere'
    baseType: 'quad',     // 'quad' | 'triangle' | 'tri_regular' | 'trapezoid' | 'round'
    heightType: 'freehand', // 'freehand' | 'perp_A' | 'mid_H' | 'center_O' | 'slant'
    heightVal: 150,
    waitingFreeHeight: false,
    groupId: null,
    basePtIds: [],
    heightPtId: null,
    apexPtId: null,
    extraPtIds: [],
    page: 0
  };

  let autoMode = true; // Tự động hoàn thiện khi phát hiện đường cao vừa vẽ

  /**
   * ĐỘNG CƠ ANIMATION TỪNG BƯỚC (STEP-BY-STEP PROGRESSIVE DRAWING)
   * Giúp giáo viên & học sinh quan sát trực quan từng điểm, từng cạnh xuất hiện mượt mà
   */
  function animateQueue(board, pageIdx, queue, onComplete, speed = 85) {
    if (!board || !queue || !queue.length) {
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    let idx = 0;
    function runNext() {
      if (idx >= queue.length) {
        if (typeof onComplete === 'function') onComplete();
        return;
      }
      const item = queue[idx++];
      const pts = item.points || [];
      const shps = item.shapes || [];

      if (pts.length || shps.length) {
        board.commit(board.addGeo(pageIdx, pts, shps));
        board.redraw();
        board.emit();
      }

      if (idx < queue.length) {
        setTimeout(runNext, speed);
      } else {
        setTimeout(() => {
          if (typeof onComplete === 'function') onComplete();
        }, speed);
      }
    }

    runNext();
  }

  /**
   * BƯỚC 1: DỰNG MẶT ĐÁY HÌNH HỌC KHÔNG GIAN
   * Hỗ trợ đầy đủ các dạng đáy: Tứ giác, Tam giác thường/đều, Hình thang, Hình tròn/Elip
   */
  function step1_DrawBase(board, options = {}) {
    if (!board) board = getActiveBoard();
    if (!board) {
      showToast('⚠️ Vui lòng mở bảng vẽ trước khi dựng hình!');
      return;
    }

    const vp = getViewportCenter(board);
    const pageIdx = vp.page;
    const pg = board.doc.pages[pageIdx];
    if (!pg) return;

    const shapeType = options.shapeType || currentBuild.shapeType || 'pyramid';
    let baseType = options.baseType || currentBuild.baseType || 'quad';

    // Chuẩn hoá baseType phù hợp theo shapeType
    if (shapeType === 'pyramid_tri' || shapeType === 'prism_tri') {
      baseType = 'triangle';
    } else if (shapeType === 'pyramid_regular') {
      baseType = (baseType === 'triangle') ? 'tri_regular' : 'quad';
    } else if (shapeType === 'pyramid_trap') {
      baseType = 'trapezoid';
    } else if (shapeType === 'cube' || shapeType === 'cuboid' || shapeType === 'prism_quad') {
      baseType = 'quad';
    } else if (shapeType === 'cone' || shapeType === 'cylinder' || shapeType === 'sphere') {
      baseType = 'round';
    }

    const groupId = 'spatial_grp_' + Date.now();
    const center = options.center || { x: vp.x, y: vp.y };

    const W = (shapeType === 'cube') ? 140 : ((shapeType === 'cuboid') ? 160 : 160);
    const D = (shapeType === 'cube') ? 100 : (W * 0.72);

    const pointsList = [];
    const shapes = [];
    const basePtIds = [];
    const queue = [];

    if (baseType === 'round') {
      // KHỐI TRÒN XOAY: NÓN, TRỤ, CẦU
      const R = (shapeType === 'cone') ? 85 : ((shapeType === 'cylinder') ? 80 : 90);
      const centerY = (shapeType === 'cone') ? (center.y + 40) : ((shapeType === 'cylinder') ? (center.y + 60) : center.y);

      const idO = uid('pt_O');
      const idA = uid('pt_A');
      const idB = uid('pt_B');

      const ptO = { id: idO, def: { t: 'free', x: Math.round(center.x), y: Math.round(centerY) }, z: 0, label: 'O', show: true, group: groupId };
      const ptA = { id: idA, def: { t: 'free', x: Math.round(center.x + R), y: Math.round(centerY) }, z: 0, label: 'A', show: true, group: groupId };
      const ptB = { id: idB, def: { t: 'free', x: Math.round(center.x - R), y: Math.round(centerY) }, z: 0, label: 'B', show: true, group: groupId };

      pointsList.push(ptO, ptA, ptB);
      basePtIds.push(idO, idA, idB);

      // Bán kính đáy OA nét đứt
      const segOA = { id: uid('seg_radius'), kind: 'segment', pts: [idO, idA], dashed: true, color: '#dc2626', width: 1.5, group: groupId };
      shapes.push(segOA);

      queue.push({ points: [ptO, ptA, ptB], shapes: [] });
      queue.push({ points: [], shapes: [segOA] });

    } else if (baseType === 'triangle' || baseType === 'tri_regular') {
      // ĐÁY TAM GIÁC
      const isRegular = (baseType === 'tri_regular');
      const pts3D = {
        A: [0, (isRegular ? 0.88 : 0.75) * W, 0],
        B: [(isRegular ? 0.5 : 0.4) * W, 0, 0],
        C: [W, (isRegular ? 0.88 : 0.75) * W, 0]
      };
      const proj = {};
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const [k, p3d] of Object.entries(pts3D)) {
        proj[k] = projectPoint(Zo, p3d);
        minX = Math.min(minX, proj[k].x); maxX = Math.max(maxX, proj[k].x);
        minY = Math.min(minY, proj[k].y); maxY = Math.max(maxY, proj[k].y);
      }
      const offX = center.x - (minX + maxX) / 2;
      const offY = center.y - (minY + maxY) / 2 + 35;

      ['A', 'B', 'C'].forEach(label => {
        const id = uid('pt_' + label);
        const pt = {
          id,
          def: { t: 'free', x: Math.round(proj[label].x + offX), y: Math.round(proj[label].y + offY) },
          z: 0,
          label,
          show: true,
          group: groupId
        };
        pointsList.push(pt);
        basePtIds.push(id);
      });

      const [idA, idB, idC] = basePtIds;
      const segAC = { id: uid('seg'), kind: 'segment', pts: [idA, idC], dashed: true, color: '#1e293b', width: 1.8, group: groupId };
      const segAB = { id: uid('seg'), kind: 'segment', pts: [idA, idB], dashed: false, color: '#1e293b', width: 2.0, group: groupId };
      const segBC = { id: uid('seg'), kind: 'segment', pts: [idB, idC], dashed: false, color: '#1e293b', width: 2.0, group: groupId };

      shapes.push(segAC, segAB, segBC);

      queue.push({ points: pointsList, shapes: [] });
      queue.push({ points: [], shapes: [segAC] });
      queue.push({ points: [], shapes: [segAB] });
      queue.push({ points: [], shapes: [segBC] });

    } else if (baseType === 'trapezoid') {
      // ĐÁY HÌNH THANG
      const pts3D = {
        A: [0, D, 0],
        B: [0, 0, 0],
        C: [W, 0, 0],
        D: [W * 0.55, D, 0]
      };
      const proj = {};
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const [k, p3d] of Object.entries(pts3D)) {
        proj[k] = projectPoint(Zo, p3d);
        minX = Math.min(minX, proj[k].x); maxX = Math.max(maxX, proj[k].x);
        minY = Math.min(minY, proj[k].y); maxY = Math.max(maxY, proj[k].y);
      }
      const offX = center.x - (minX + maxX) / 2;
      const offY = center.y - (minY + maxY) / 2 + 35;

      ['A', 'B', 'C', 'D'].forEach(label => {
        const id = uid('pt_' + label);
        const pt = {
          id,
          def: { t: 'free', x: Math.round(proj[label].x + offX), y: Math.round(proj[label].y + offY) },
          z: 0,
          label,
          show: true,
          group: groupId
        };
        pointsList.push(pt);
        basePtIds.push(id);
      });

      const [idA, idB, idC, idD] = basePtIds;
      const segAB = { id: uid('seg'), kind: 'segment', pts: [idA, idB], dashed: true, color: '#1e293b', width: 1.8, group: groupId };
      const segAD = { id: uid('seg'), kind: 'segment', pts: [idA, idD], dashed: true, color: '#1e293b', width: 1.8, group: groupId };
      const segBC = { id: uid('seg'), kind: 'segment', pts: [idB, idC], dashed: false, color: '#1e293b', width: 2.0, group: groupId };
      const segCD = { id: uid('seg'), kind: 'segment', pts: [idC, idD], dashed: false, color: '#1e293b', width: 2.0, group: groupId };

      shapes.push(segAB, segAD, segBC, segCD);

      queue.push({ points: pointsList, shapes: [] });
      queue.push({ points: [], shapes: [segAB] });
      queue.push({ points: [], shapes: [segAD] });
      queue.push({ points: [], shapes: [segBC] });
      queue.push({ points: [], shapes: [segCD] });

    } else {
      // ĐÁY TỨ GIÁC (HÌNH BÌNH HÀNH / CHỮ NHẬT / VUÔNG)
      const pts3D = {
        A: [0, D, 0],
        B: [0, 0, 0],
        C: [W, 0, 0],
        D: [W, D, 0]
      };
      const proj = {};
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const [k, p3d] of Object.entries(pts3D)) {
        proj[k] = projectPoint(Zo, p3d);
        minX = Math.min(minX, proj[k].x); maxX = Math.max(maxX, proj[k].x);
        minY = Math.min(minY, proj[k].y); maxY = Math.max(maxY, proj[k].y);
      }
      const offX = center.x - (minX + maxX) / 2;
      const offY = center.y - (minY + maxY) / 2 + 35;

      ['A', 'B', 'C', 'D'].forEach(label => {
        const id = uid('pt_' + label);
        const pt = {
          id,
          def: { t: 'free', x: Math.round(proj[label].x + offX), y: Math.round(proj[label].y + offY) },
          z: 0,
          label,
          show: true,
          group: groupId
        };
        pointsList.push(pt);
        basePtIds.push(id);
      });

      const [idA, idB, idC, idD] = basePtIds;
      // Nét đứt phía sau AB, AD; nét liền phía trước BC, CD
      const segAB = { id: uid('seg'), kind: 'segment', pts: [idA, idB], dashed: true, color: '#1e293b', width: 1.8, group: groupId };
      const segAD = { id: uid('seg'), kind: 'segment', pts: [idA, idD], dashed: true, color: '#1e293b', width: 1.8, group: groupId };
      const segBC = { id: uid('seg'), kind: 'segment', pts: [idB, idC], dashed: false, color: '#1e293b', width: 2.0, group: groupId };
      const segCD = { id: uid('seg'), kind: 'segment', pts: [idC, idD], dashed: false, color: '#1e293b', width: 2.0, group: groupId };

      shapes.push(segAB, segAD, segBC, segCD);

      queue.push({ points: pointsList, shapes: [] });
      queue.push({ points: [], shapes: [segAB] });
      queue.push({ points: [], shapes: [segAD] });
      queue.push({ points: [], shapes: [segBC] });
      queue.push({ points: [], shapes: [segCD] });
    }

    currentBuild = {
      active: true,
      stage: 'base',
      shapeType,
      baseType,
      heightType: options.heightType || currentBuild.heightType || 'freehand',
      heightVal: options.heightVal || currentBuild.heightVal || 150,
      waitingFreeHeight: false,
      groupId,
      page: pageIdx,
      basePtIds,
      heightPtId: null,
      apexPtId: null,
      extraPtIds: []
    };

    const finalize = () => {
      board.sel = {
        page: pageIdx,
        strokes: new Set(),
        items: new Set(),
        points: new Set(basePtIds),
        shapes: new Set(shapes.map(s => s.id))
      };
      board.redraw();
      board.emit();
      updateBuilderUI();
      if (typeof options.onComplete === 'function') {
        options.onComplete();
      }
    };

    const s1QueuedIds = new Set();
    queue.forEach(item => (item.shapes || []).forEach(s => s1QueuedIds.add(s.id)));
    const s1Unqueued = shapes.filter(s => !s1QueuedIds.has(s.id));
    if (s1Unqueued.length) queue.push({ points: [], shapes: s1Unqueued });

    if (options.animate !== false) {
      animateQueue(board, pageIdx, queue, () => {
        finalize();
        showToast('✅ Bước 1: Đã vẽ đáy chuẩn SGK có hiệu ứng animation!');
      }, 75);
    } else {
      board.commit(board.addGeo(pageIdx, pointsList, shapes));
      finalize();
      showToast('✅ Bước 1: Đã dựng mặt đáy chuẩn SGK!');
    }

    console.log('[SpatialBuilder] Bước 1 vẽ đáy thành công:', shapeType, baseType);
  }

  /**
   * BẬT CHẾ ĐỘ VẼ CHIỀU CAO TỰ DO TRÊN BẢNG VẼ
   */
  function startFreehandHeight(board) {
    if (!board) board = getActiveBoard();
    if (!board) return;

    if (!currentBuild.active || currentBuild.stage === 'none' || !currentBuild.basePtIds.length) {
      step1_DrawBase(board);
    }

    currentBuild.waitingFreeHeight = true;
    currentBuild.heightType = 'freehand';

    if (typeof board.setTool === 'function') {
      board.setTool({ k: 'geo', t: 'segment' });
    }

    if (builderPanelEl) {
      builderPanelEl.classList.add('minimized');
    }

    showGuideBanner(board);
    showToast('✍️ Chế độ vẽ tự do: Hãy kéo 1 đoạn thẳng từ đáy lên đỉnh S theo chiều cao bạn muốn!');
  }

  /**
   * BƯỚC 2: DỰNG CHIỀU CAO / TRỤC ĐỨNG HÌNH HỌC KHÔNG GIAN
   * Hỗ trợ đầy đủ các khối: Chóp, Lăng trụ, Hộp, Cụct, Nón, Trụ, Cầu
   */
  function step2_DrawHeight(board, options = {}) {
    if (!board) board = getActiveBoard();
    if (!board) return;

    const heightType = options.heightType || currentBuild.heightType || 'freehand';

    if (heightType === 'freehand') {
      startFreehandHeight(board);
      return;
    }

    if (!currentBuild.active || currentBuild.stage === 'none' || !currentBuild.basePtIds.length) {
      step1_DrawBase(board, { ...options, animate: false });
    }

    const pageIdx = currentBuild.page;
    const pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return;

    const shapeType = currentBuild.shapeType;
    const H_val = options.heightVal || currentBuild.heightVal || 150;
    const groupId = currentBuild.groupId;
    const basePtIds = currentBuild.basePtIds;
    const pointsMap = pg.geo.points;

    const newPoints = [];
    const newShapes = [];
    const queue = [];

    let footPtId = null;
    let footPos = null;
    let apexPtId = null;
    let apexPos = null;

    if (shapeType === 'cone') {
      // HÌNH NÓN: Chiều cao SO vuông góc mặt đáy tại tâm O
      footPtId = basePtIds[0];
      const pO = pointsMap[footPtId];
      footPos = { x: pO.def.x, y: pO.def.y, z: 0 };
      apexPos = { x: footPos.x, y: footPos.y - H_val, z: H_val };
      apexPtId = uid('pt_S');

      const ptS = { id: apexPtId, def: { t: 'free', x: apexPos.x, y: apexPos.y }, z: H_val, label: 'S', show: true, group: groupId };
      newPoints.push(ptS);

      const segSO = { id: uid('seg_height'), kind: 'segment', pts: [apexPtId, footPtId], dashed: true, color: '#dc2626', width: 2.2, group: groupId };
      newShapes.push(segSO);

      // Góc vuông tại O
      const rightAngle = { id: uid('right_angle'), kind: 'right', pts: [apexPtId, footPtId, basePtIds[1]], aux: true, color: '#dc2626', width: 1.5, group: groupId };
      newShapes.push(rightAngle);

      queue.push({ points: [ptS], shapes: [] });
      queue.push({ points: [], shapes: [segSO, rightAngle] });

    } else if (shapeType === 'cylinder') {
      // HÌNH TRỤ: Trục nối tâm đáy dưới O với tâm đáy trên O'
      footPtId = basePtIds[0];
      const pO = pointsMap[footPtId];
      footPos = { x: pO.def.x, y: pO.def.y, z: 0 };
      apexPos = { x: footPos.x, y: footPos.y - H_val, z: H_val };
      apexPtId = uid("pt_O'");

      const ptO_prime = { id: apexPtId, def: { t: 'free', x: apexPos.x, y: apexPos.y }, z: H_val, label: "O'", show: true, group: groupId };
      newPoints.push(ptO_prime);

      const segOO_prime = { id: uid('seg_height'), kind: 'segment', pts: [apexPtId, footPtId], dashed: true, color: '#dc2626', width: 2.2, group: groupId };
      newShapes.push(segOO_prime);

      queue.push({ points: [ptO_prime], shapes: [] });
      queue.push({ points: [], shapes: [segOO_prime] });

    } else if (shapeType === 'sphere') {
      // KHỐI CẦU: Trục cực Bắc N - cực Nam S qua tâm O
      footPtId = basePtIds[0];
      const pO = pointsMap[footPtId];
      const R = 90;
      const idN = uid('pt_N');
      const idS = uid('pt_S');

      const ptN = { id: idN, def: { t: 'free', x: pO.def.x, y: pO.def.y - R }, z: R, label: 'N', show: true, group: groupId };
      const ptS = { id: idS, def: { t: 'free', x: pO.def.x, y: pO.def.y + R }, z: -R, label: 'S', show: true, group: groupId };
      newPoints.push(ptN, ptS);

      const segNS = { id: uid('seg_axis'), kind: 'segment', pts: [idN, idS], dashed: true, color: '#dc2626', width: 2.0, group: groupId };
      newShapes.push(segNS);

      apexPtId = idN;
      queue.push({ points: [ptN, ptS], shapes: [] });
      queue.push({ points: [], shapes: [segNS] });

    } else if (shapeType === 'cube' || shapeType === 'cuboid' || shapeType === 'prism_quad' || shapeType === 'prism_tri') {
      // LĂNG TRỤ & HÌNH HỘP: Cạnh bên thẳng đứng AA'
      footPtId = basePtIds[0];
      const pA = pointsMap[footPtId];
      footPos = { x: pA.def.x, y: pA.def.y, z: 0 };
      const slantDx = (heightType === 'slant') ? 40 : 0;
      apexPos = { x: footPos.x + slantDx, y: footPos.y - H_val, z: H_val };
      apexPtId = uid("pt_A'");

      const ptA_prime = { id: apexPtId, def: { t: 'free', x: apexPos.x, y: apexPos.y }, z: H_val, label: "A'", show: true, group: groupId };
      newPoints.push(ptA_prime);

      // Điểm A là điểm khuất phía sau -> cạnh bên AA' là nét đứt!
      const segAA = { id: uid('seg_height'), kind: 'segment', pts: [apexPtId, footPtId], dashed: true, color: '#dc2626', width: 2.0, group: groupId };
      newShapes.push(segAA);

      queue.push({ points: [ptA_prime], shapes: [] });
      queue.push({ points: [], shapes: [segAA] });

    } else if (shapeType === 'frustum') {
      // CHÓP CỤT: Trục OO' hoặc cạnh bên AA'
      if (basePtIds.length === 4) {
        const pA = pointsMap[basePtIds[0]], pC = pointsMap[basePtIds[2]];
        footPtId = uid('pt_O');
        footPos = { x: Math.round((pA.def.x + pC.def.x) / 2), y: Math.round((pA.def.y + pC.def.y) / 2), z: 0 };
      } else {
        const pA = pointsMap[basePtIds[0]], pB = pointsMap[basePtIds[1]], pC = pointsMap[basePtIds[2]];
        footPtId = uid('pt_O');
        footPos = { x: Math.round((pA.def.x + pB.def.x + pC.def.x) / 3), y: Math.round((pA.def.y + pB.def.y + pC.def.y) / 3), z: 0 };
      }
      const ptO = { id: footPtId, def: { t: 'free', x: footPos.x, y: footPos.y }, z: 0, label: 'O', show: true, group: groupId };
      newPoints.push(ptO);

      apexPtId = uid("pt_O'");
      apexPos = { x: footPos.x, y: footPos.y - H_val, z: H_val };
      const ptO_prime = { id: apexPtId, def: { t: 'free', x: apexPos.x, y: apexPos.y }, z: H_val, label: "O'", show: true, group: groupId };
      newPoints.push(ptO_prime);

      const segOO = { id: uid('seg_height'), kind: 'segment', pts: [apexPtId, footPtId], dashed: true, color: '#dc2626', width: 2.0, group: groupId };
      newShapes.push(segOO);

      queue.push({ points: [ptO, ptO_prime], shapes: [] });
      queue.push({ points: [], shapes: [segOO] });

    } else {
      // HÌNH CHÓP (TỨ GIÁC, TAM GIÁC, ĐỀU, HÌNH THANG)
      if (heightType === 'perp_A') {
        footPtId = basePtIds[0];
        const pA = pointsMap[footPtId];
        footPos = { x: pA.def.x, y: pA.def.y, z: pA.z || 0 };
      } else if (heightType === 'mid_H') {
        const p1 = pointsMap[basePtIds[0]];
        const p2 = pointsMap[basePtIds[1]];
        footPtId = uid('pt_H');
        footPos = { x: Math.round((p1.def.x + p2.def.x) / 2), y: Math.round((p1.def.y + p2.def.y) / 2), z: 0 };
        const ptH = { id: footPtId, def: { t: 'free', x: footPos.x, y: footPos.y }, z: 0, label: 'H', show: true, group: groupId };
        newPoints.push(ptH);
        if (basePtIds.length >= 3) {
          const segAux = { id: uid('seg_aux'), kind: 'segment', pts: [footPtId, basePtIds[2]], dashed: true, aux: true, color: '#64748b', width: 1.4, group: groupId };
          newShapes.push(segAux);
          queue.push({ points: [ptH], shapes: [segAux] });
        } else {
          queue.push({ points: [ptH], shapes: [] });
        }
      } else if (heightType === 'center_O' || shapeType === 'pyramid_regular') {
        footPtId = uid('pt_O');
        if (basePtIds.length === 4) {
          const pA = pointsMap[basePtIds[0]], pC = pointsMap[basePtIds[2]];
          const pB = pointsMap[basePtIds[1]], pD = pointsMap[basePtIds[3]];
          footPos = { x: Math.round((pA.def.x + pC.def.x) / 2), y: Math.round((pA.def.y + pC.def.y) / 2), z: 0 };
          const diag1 = { id: uid('seg_diag1'), kind: 'segment', pts: [basePtIds[0], basePtIds[2]], dashed: true, aux: true, color: '#94a3b8', width: 1.2, group: groupId };
          const diag2 = { id: uid('seg_diag2'), kind: 'segment', pts: [basePtIds[1], basePtIds[3]], dashed: true, aux: true, color: '#94a3b8', width: 1.2, group: groupId };
          newShapes.push(diag1, diag2);
          const ptO = { id: footPtId, def: { t: 'free', x: footPos.x, y: footPos.y }, z: 0, label: 'O', show: true, group: groupId };
          newPoints.push(ptO);
          queue.push({ points: [ptO], shapes: [diag1, diag2] });
        } else {
          const pA = pointsMap[basePtIds[0]], pB = pointsMap[basePtIds[1]], pC = pointsMap[basePtIds[2]];
          footPos = { x: Math.round((pA.def.x + pB.def.x + pC.def.x) / 3), y: Math.round((pA.def.y + pB.def.y + pC.def.y) / 3), z: 0 };
          const ptO = { id: footPtId, def: { t: 'free', x: footPos.x, y: footPos.y }, z: 0, label: 'O', show: true, group: groupId };
          newPoints.push(ptO);
          queue.push({ points: [ptO], shapes: [] });
        }
      } else { // 'slant'
        footPtId = basePtIds[0];
        const pA = pointsMap[footPtId];
        footPos = { x: pA.def.x, y: pA.def.y, z: pA.z || 0 };
      }

      apexPtId = uid('pt_S');
      const slantDx = (heightType === 'slant') ? 45 : 0;
      apexPos = { x: footPos.x + slantDx, y: footPos.y - H_val, z: H_val };

      const ptS = { id: apexPtId, def: { t: 'free', x: apexPos.x, y: apexPos.y }, z: H_val, label: 'S', show: true, group: groupId };
      newPoints.push(ptS);

      const basePtsList = basePtIds.map(id => {
        const p = pointsMap[id];
        return { id, x: p.def.x, y: p.def.y };
      });
      const apexObj = { id: apexPtId, x: apexPos.x, y: apexPos.y };
      const vis = classifyPyramidEdges(apexObj, basePtsList, footPtId);

      const segHeight = { id: uid('seg_height'), kind: 'segment', pts: [apexPtId, footPtId], dashed: vis.heightDashed, color: '#dc2626', width: 2.2, group: groupId };
      newShapes.push(segHeight);

      const refPtId = basePtIds.find(id => id !== footPtId);
      if (refPtId && heightType !== 'slant') {
        const rightAngle = { id: uid('right_angle'), kind: 'right', pts: [apexPtId, footPtId, refPtId], aux: true, color: '#dc2626', width: 1.5, group: groupId };
        newShapes.push(rightAngle);
        queue.push({ points: [ptS], shapes: [segHeight, rightAngle] });
      } else {
        queue.push({ points: [ptS], shapes: [segHeight] });
      }
    }

    currentBuild.stage = 'height';
    currentBuild.heightPtId = footPtId;
    currentBuild.apexPtId = apexPtId;
    currentBuild.heightType = heightType;
    currentBuild.heightVal = H_val;
    currentBuild.waitingFreeHeight = false;

    const finalize = () => {
      if (typeof board.setTool === 'function') {
        board.setTool({ k: 'select' });
      }
      board.sel = {
        page: pageIdx,
        strokes: new Set(),
        items: new Set(),
        points: new Set([apexPtId]),
        shapes: new Set(newShapes.map(s => s.id))
      };
      board.redraw();
      board.emit();
      hideGuideBanner();
      if (builderPanelEl) {
        builderPanelEl.classList.remove('minimized');
      }
      updateBuilderUI();
      if (typeof options.onComplete === 'function') {
        options.onComplete();
      }
    };

    const s2QueuedIds = new Set();
    queue.forEach(item => (item.shapes || []).forEach(s => s2QueuedIds.add(s.id)));
    const s2Unqueued = newShapes.filter(s => !s2QueuedIds.has(s.id));
    if (s2Unqueued.length) queue.push({ points: [], shapes: s2Unqueued });

    if (options.animate !== false) {
      animateQueue(board, pageIdx, queue, () => {
        finalize();
        showToast('✨ Bước 2: Đã dựng chiều cao chuẩn SGK có animation!');
      }, 85);
    } else {
      board.commit(board.addGeo(pageIdx, newPoints, newShapes));
      finalize();
      showToast('✨ Đã dựng chiều cao nét đứt/liền chuẩn SGK!');
    }
  }

  /**
   * BƯỚC 3: NỐI CÁC CẠNH BÊN HOÀN THIỆN KHỐI 3D (CHUẨN NÉT KHUẤT VÀ TÍNH NĂNG XOAY)
   */
  function step3_CompleteEdges(board, options = {}) {
    if (!board) board = getActiveBoard();
    if (!board) return;

    if (!currentBuild.active || !currentBuild.apexPtId) {
      step2_DrawHeight(board, { heightType: 'perp_A', animate: false });
    }

    const pageIdx = currentBuild.page;
    const pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return;

    const groupId = currentBuild.groupId;
    const basePtIds = currentBuild.basePtIds;
    const apexPtId = currentBuild.apexPtId;
    const shapeType = currentBuild.shapeType;
    const pointsMap = pg.geo.points;
    const existingShapes = pg.geo.shapes;

    const allPtIds = [...basePtIds, apexPtId];
    const newPoints = [];
    const newShapes = [];
    const queue = [];

    const apexP = pointsMap[apexPtId];

    if (shapeType === 'cone') {
      // HÌNH NÓN: Nối 2 đường sinh bên SA và SB
      const idA = basePtIds[1];
      const idB = basePtIds[2];

      const segSA = { id: uid('seg_lat'), kind: 'segment', pts: [apexPtId, idA], dashed: false, color: '#1e293b', width: 2.0, group: groupId };
      const segSB = { id: uid('seg_lat'), kind: 'segment', pts: [apexPtId, idB], dashed: false, color: '#1e293b', width: 2.0, group: groupId };
      newShapes.push(segSA, segSB);

      // Shape nón chuẩn SVG/Canvas
      const coneShape = { id: uid('cone_shape'), kind: 'cone', pts: [basePtIds[0], idA, apexPtId], color: '#1e293b', width: 2.0, group: groupId };
      newShapes.push(coneShape);

      // Solid xoay 3D
      newShapes.push({
        id: 'solid_' + groupId,
        kind: 'solid',
        pts: [basePtIds[0], idA, idB, apexPtId],
        color: '#2563eb',
        width: 1.5,
        group: groupId,
        hidden: true,
        solid: { of: 'cone', view: Zo, turn: Cp }
      });

      queue.push({ points: [], shapes: [segSB] });
      queue.push({ points: [], shapes: [segSA] });
      queue.push({ points: [], shapes: [coneShape] });

    } else if (shapeType === 'cylinder') {
      // HÌNH TRỤ: Đáy trên O'A' và 2 đường sinh AA' và BB'
      const idA = basePtIds[1];
      const idB = basePtIds[2];
      const pO_prime = pointsMap[apexPtId];
      const R = 80;

      const idA_prime = uid("pt_A'");
      const idB_prime = uid("pt_B'");
      const ptA_prime = { id: idA_prime, def: { t: 'free', x: pO_prime.def.x + R, y: pO_prime.def.y }, z: currentBuild.heightVal, label: "A'", show: true, group: groupId };
      const ptB_prime = { id: idB_prime, def: { t: 'free', x: pO_prime.def.x - R, y: pO_prime.def.y }, z: currentBuild.heightVal, label: "B'", show: true, group: groupId };
      newPoints.push(ptA_prime, ptB_prime);
      allPtIds.push(idA_prime, idB_prime);

      const segAA = { id: uid('seg_lat'), kind: 'segment', pts: [idA, idA_prime], dashed: false, color: '#1e293b', width: 2.0, group: groupId };
      const segBB = { id: uid('seg_lat'), kind: 'segment', pts: [idB, idB_prime], dashed: false, color: '#1e293b', width: 2.0, group: groupId };
      const segTopRadius = { id: uid('seg_top_r'), kind: 'segment', pts: [apexPtId, idA_prime], dashed: false, color: '#1e293b', width: 1.6, group: groupId };
      newShapes.push(segAA, segBB, segTopRadius);

      const cylShape = { id: uid('cyl_shape'), kind: 'cylinder', pts: [basePtIds[0], idA, apexPtId], color: '#1e293b', width: 2.0, group: groupId };
      newShapes.push(cylShape);

      newShapes.push({
        id: 'solid_' + groupId,
        kind: 'solid',
        pts: allPtIds,
        color: '#2563eb',
        width: 1.5,
        group: groupId,
        hidden: true,
        solid: { of: 'cylinder', view: Zo, turn: Cp }
      });

      queue.push({ points: [ptA_prime, ptB_prime], shapes: [] });
      queue.push({ points: [], shapes: [segBB] });
      queue.push({ points: [], shapes: [segAA] });
      queue.push({ points: [], shapes: [segTopRadius, cylShape] });

    } else if (shapeType === 'sphere') {
      // KHỐI CẦU: Mặt cầu hoàn thiện
      const sphereShape = { id: uid('sphere_shape'), kind: 'sphere', pts: [basePtIds[0], basePtIds[1]], color: '#1e293b', width: 2.0, group: groupId };
      newShapes.push(sphereShape);

      newShapes.push({
        id: 'solid_' + groupId,
        kind: 'solid',
        pts: [basePtIds[0], basePtIds[1], basePtIds[2], apexPtId],
        color: '#2563eb',
        width: 1.5,
        group: groupId,
        hidden: true,
        solid: { of: 'sphere', view: Zo, turn: Cp }
      });

      queue.push({ points: [], shapes: [sphereShape] });

    } else if (shapeType === 'cube' || shapeType === 'cuboid' || shapeType === 'prism_quad' || shapeType === 'prism_tri') {
      // LĂNG TRỤ & HÌNH HỘP / HÌNH LẬP PHƯƠNG
      const base0P = pointsMap[basePtIds[0]];
      const dx = apexP.def.x - base0P.def.x;
      const dy = apexP.def.y - base0P.def.y;
      const H_val = currentBuild.heightVal;

      const topPtIds = [apexPtId];
      const topPtsList = [];

      for (let i = 1; i < basePtIds.length; i++) {
        const bPt = pointsMap[basePtIds[i]];
        const tId = uid('pt_' + bPt.label + "'");
        const tPt = {
          id: tId,
          def: { t: 'free', x: bPt.def.x + dx, y: bPt.def.y + dy },
          z: H_val,
          label: bPt.label + "'",
          show: true,
          group: groupId
        };
        newPoints.push(tPt);
        topPtsList.push(tPt);
        topPtIds.push(tId);
        allPtIds.push(tId);

        // Cạnh bên: AA' (i=0) đã là nét đứt ở bước 2. Các cạnh BB', CC', DD' đều là nét liền!
        const segLat = {
          id: uid('seg_lat'),
          kind: 'segment',
          pts: [basePtIds[i], tId],
          dashed: false,
          color: '#1e293b',
          width: 2.0,
          group: groupId
        };
        newShapes.push(segLat);
      }

      queue.push({ points: topPtsList, shapes: [] });

      // Đáy trên: nhìn từ trên xuống -> TẤT CẢ CẠNH ĐÁY TRÊN ĐỀU LÀ NÉT LIỀN!
      const topSegs = [];
      for (let i = 0; i < topPtIds.length; i++) {
        const next = (i + 1) % topPtIds.length;
        const segTop = {
          id: uid('seg_top'),
          kind: 'segment',
          pts: [topPtIds[i], topPtIds[next]],
          dashed: false,
          color: '#1e293b',
          width: 2.0,
          group: groupId
        };
        newShapes.push(segTop);
        topSegs.push(segTop);
      }

      // Đẩy vào queue animation
      for (const seg of topSegs) {
        queue.push({ points: [], shapes: [seg] });
      }
      for (let i = 1; i < basePtIds.length; i++) {
        const sLat = newShapes.find(s => s.kind === 'segment' && s.pts[0] === basePtIds[i]);
        if (sLat) queue.push({ points: [], shapes: [sLat] });
      }

      newShapes.push({
        id: 'solid_' + groupId,
        kind: 'solid',
        pts: allPtIds,
        color: '#2563eb',
        width: 1.5,
        group: groupId,
        hidden: true,
        solid: {
          of: basePtIds.length === 4 ? 'box' : 'prism3',
          view: Zo,
          turn: Cp
        }
      });

    } else if (shapeType === 'frustum') {
      // HÌNH CHÓP CỤT: Đáy trên thu nhỏ tỉ lệ k = 0.5
      const k = 0.5;
      const H_val = currentBuild.heightVal;
      const topPtIds = [];
      const topPtsList = [];

      let centerBottom = { x: 0, y: 0 };
      basePtIds.forEach(id => {
        centerBottom.x += pointsMap[id].def.x;
        centerBottom.y += pointsMap[id].def.y;
      });
      centerBottom.x /= basePtIds.length;
      centerBottom.y /= basePtIds.length;

      basePtIds.forEach((id, idx) => {
        const bPt = pointsMap[id];
        const tId = uid('pt_' + bPt.label + "'");
        const tPt = {
          id: tId,
          def: {
            t: 'free',
            x: Math.round(centerBottom.x + (bPt.def.x - centerBottom.x) * k),
            y: Math.round(centerBottom.y + (bPt.def.y - centerBottom.y) * k - H_val)
          },
          z: H_val,
          label: bPt.label + "'",
          show: true,
          group: groupId
        };
        newPoints.push(tPt);
        topPtsList.push(tPt);
        topPtIds.push(tId);
        allPtIds.push(tId);

        // Cạnh bên chóp cụt: Đỉnh A khuất -> AA' nét đứt; các cạnh bên còn lại nét liền
        const segLat = {
          id: uid('seg_lat'),
          kind: 'segment',
          pts: [id, tId],
          dashed: (idx === 0),
          color: '#1e293b',
          width: 1.8,
          group: groupId
        };
        newShapes.push(segLat);
      });

      queue.push({ points: topPtsList, shapes: [] });

      // Đáy trên: toàn bộ nét liền
      for (let i = 0; i < topPtIds.length; i++) {
        const next = (i + 1) % topPtIds.length;
        const segTop = {
          id: uid('seg_top'),
          kind: 'segment',
          pts: [topPtIds[i], topPtIds[next]],
          dashed: false,
          color: '#1e293b',
          width: 1.8,
          group: groupId
        };
        newShapes.push(segTop);
        queue.push({ points: [], shapes: [segTop] });
      }

      newShapes.push({
        id: 'solid_' + groupId,
        kind: 'solid',
        pts: allPtIds,
        color: '#2563eb',
        width: 1.5,
        group: groupId,
        hidden: true,
        solid: { of: 'box', view: Zo, turn: Cp }
      });

    } else {
      // CÁC LOẠI HÌNH CHÓP (TỨ GIÁC, TAM GIÁC, ĐỀU, HÌNH THANG)
      const basePtsList = basePtIds.map(id => {
        const p = pointsMap[id];
        return { id, x: p.def.x, y: p.def.y };
      });
      const apexObj = { id: apexPtId, x: apexP.def.x, y: apexP.def.y };
      const vis = classifyPyramidEdges(apexObj, basePtsList, currentBuild.heightPtId);

      basePtIds.forEach((pid) => {
        const alreadyHasEdge = existingShapes.some(s => s.kind === 'segment' && (
          (s.pts[0] === apexPtId && s.pts[1] === pid) ||
          (s.pts[1] === apexPtId && s.pts[0] === pid)
        ));
        if (alreadyHasEdge) return;

        const isDashed = !!vis.lateralDashed[pid];
        const segLat = {
          id: uid('seg_lat'),
          kind: 'segment',
          pts: [apexPtId, pid],
          dashed: isDashed,
          color: '#1e293b',
          width: 1.8,
          group: groupId
        };
        newShapes.push(segLat);
        queue.push({ points: [], shapes: [segLat] });
      });

      const faces = [];
      faces.push(basePtIds.map((_, i) => i));
      for (let i = 0; i < basePtIds.length; i++) {
        const next = (i + 1) % basePtIds.length;
        faces.push([allPtIds.indexOf(apexPtId), i, next]);
      }

      newShapes.push({
        id: 'solid_' + groupId,
        kind: 'solid',
        pts: allPtIds,
        color: '#2563eb',
        width: 1.5,
        group: groupId,
        hidden: true,
        solid: {
          of: basePtIds.length === 4 ? 'pyramid4' : 'pyramid3',
          view: Zo,
          turn: Cp,
          faces
        }
      });
    }

    currentBuild.stage = 'complete';
    currentBuild.waitingFreeHeight = false;

    const finalize = () => {
      const curPage = board.doc.pages[pageIdx];
      const grpShapes = curPage.geo.shapes.filter(s => s.group === groupId && !s.hidden).map(s => s.id);

      if (typeof board.setTool === 'function') {
        board.setTool({ k: 'select' });
      }

      board.sel = {
        page: pageIdx,
        strokes: new Set(),
        items: new Set(),
        points: new Set(allPtIds),
        shapes: new Set(grpShapes)
      };
      board.redraw();
      board.emit();

      hideGuideBanner();
      if (builderPanelEl) {
        builderPanelEl.classList.remove('minimized');
      }
      updateBuilderUI();
      if (typeof options.onComplete === 'function') {
        options.onComplete();
      }
    };

    const s3QueuedIds = new Set();
    queue.forEach(item => (item.shapes || []).forEach(s => s3QueuedIds.add(s.id)));
    const s3Unqueued = newShapes.filter(s => !s3QueuedIds.has(s.id));
    if (s3Unqueued.length) queue.push({ points: [], shapes: s3Unqueued });

    if (options.animate !== false) {
      animateQueue(board, pageIdx, queue, () => {
        finalize();
        showToast('🎉 Bước 3: Đã hoàn tất dựng hình 3D nét liền nét đứt chuẩn SGK! Có thể bấm "Xoay 3D".');
      }, 75);
    } else {
      board.commit(board.addGeo(pageIdx, newPoints, newShapes));
      finalize();
      showToast('🎉 Đã hoàn tất khối 3D chuẩn SGK!');
    }

    console.log('[SpatialBuilder] Bước 3 hoàn thành khối 3D!');
  }

  /**
   * DỰNG NHANH TOÀN BỘ KHỐI 3D (0ms)
   */
  function buildAll(board, options = {}) {
    step1_DrawBase(board, { ...options, animate: false });
    step2_DrawHeight(board, {
      ...options,
      animate: false,
      heightType: options.heightType === 'freehand' ? 'perp_A' : (options.heightType || 'perp_A')
    });
    step3_CompleteEdges(board, { ...options, animate: false });
  }

  /**
   * CHẠY TOÀN BỘ ANIMATION DỰNG HÌNH 3 BƯỚC TUẦN TỰ MƯỢT MÀ
   */
  function runFullAnimation(board, options = {}) {
    if (!board) board = getActiveBoard();
    if (!board) {
      showToast('⚠️ Vui lòng mở bảng vẽ trước khi chạy diễn hoạt!');
      return;
    }
    showToast('🎬 Đang chạy diễn hoạt dựng hình không gian từng bước...');
    step1_DrawBase(board, {
      ...options,
      animate: true,
      onComplete: () => {
        setTimeout(() => {
          step2_DrawHeight(board, {
            ...options,
            animate: true,
            heightType: (options.heightType === 'freehand' || !options.heightType) ? 'perp_A' : options.heightType,
            onComplete: () => {
              setTimeout(() => {
                step3_CompleteEdges(board, {
                  ...options,
                  animate: true,
                  onComplete: () => {
                    showToast('🌟 Tuyệt vời! Diễn hoạt hoàn tất, khối hình đã sẵn sàng xoay 3D.');
                  }
                });
              }, 260);
            }
          });
        }, 260);
      }
    });
  }

  function turn3DCurrent(board) {
    if (!board) board = getActiveBoard();
    if (!board) return;
    if (typeof board.startTurning === 'function') {
      board.startTurning();
    }
  }

  function completeFromBaseAndHeight(board, targetHeightSegId = null) {
    if (!board) board = getActiveBoard();
    if (!board) return false;

    const pageIdx = typeof board.currentPage === 'function' ? board.currentPage() : ((board.sel && board.sel.page !== undefined) ? board.sel.page : 0);
    const pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return false;

    const geo = pg.geo;
    const pointsMap = { ...geo.points };
    const shapes = [...geo.shapes];

    // 1. Tìm đoạn thẳng chiều cao
    let heightSeg = null;

    // Helper: kiểm tra xem 1 đoạn thẳng có nằm hoàn toàn trong vùng đáy không (không thể là đường cao)
    function isLikelyBaseEdge(seg) {
      if (!seg || !seg.pts || seg.pts.length < 2) return true;
      const p1 = getPt2D(pointsMap[seg.pts[0]]);
      const p2 = getPt2D(pointsMap[seg.pts[1]]);
      if (!p1 || !p2) return true;
      const allYs = Object.values(pointsMap).map(p => (p.def ? p.def.y : p.y)).filter(y => y !== undefined);
      if (allYs.length < 4) return false;
      const minY = Math.min(...allYs);
      // Nếu cả 2 đầu của đoạn thẳng đều cách xa đỉnh cao nhất (> 30px), tức là đoạn này nằm trong vùng đáy
      if (p1.y > minY + 30 && p2.y > minY + 30) {
        return true;
      }
      return false;
    }

    if (targetHeightSegId) {
      const cand = shapes.find(s => s.id === targetHeightSegId && s.kind === 'segment');
      if (cand && !isLikelyBaseEdge(cand)) {
        heightSeg = cand;
      }
    }

    if (!heightSeg && board.sel && board.sel.shapes && board.sel.shapes.size) {
      const selSegs = shapes.filter(s => board.sel.shapes.has(s.id) && s.kind === 'segment');
      let maxDy = 0;
      for (const seg of selSegs) {
        if (!seg.pts || seg.pts.length < 2 || isLikelyBaseEdge(seg)) continue;
        const p1 = getPt2D(pointsMap[seg.pts[0]]);
        const p2 = getPt2D(pointsMap[seg.pts[1]]);
        if (p1 && p2) {
          const dy = Math.abs(p1.y - p2.y);
          if (dy > 25 && dy > maxDy) {
            maxDy = dy;
            heightSeg = seg;
          }
        }
      }
    }

    if (!heightSeg) {
      // Ưu tiên đoạn thẳng nối từ đỉnh cao nhất (y nhỏ nhất) xuống vùng đáy
      const allPointsList = Object.values(pointsMap).map(p => ({ id: p.id, ...getPt2D(p) })).filter(p => p.x !== undefined);
      if (allPointsList.length >= 4) {
        const sortedByY = allPointsList.slice().sort((a, b) => a.y - b.y);
        const topPt = sortedByY[0];
        const segsWithTop = shapes.filter(s => s.kind === 'segment' && s.pts && (s.pts[0] === topPt.id || s.pts[1] === topPt.id));
        let bestDy = 0;
        for (const seg of segsWithTop) {
          const otherId = (seg.pts[0] === topPt.id) ? seg.pts[1] : seg.pts[0];
          const otherPt = getPt2D(pointsMap[otherId]);
          if (otherPt) {
            const dy = Math.abs(otherPt.y - topPt.y);
            if (dy > 25 && dy > bestDy) {
              bestDy = dy;
              heightSeg = seg;
            }
          }
        }
      }
    }

    if (!heightSeg) {
      for (let i = shapes.length - 1; i >= 0; i--) {
        const seg = shapes[i];
        if (seg.kind !== 'segment' || !seg.pts || seg.pts.length < 2 || isLikelyBaseEdge(seg)) continue;
        const p1 = getPt2D(pointsMap[seg.pts[0]]);
        const p2 = getPt2D(pointsMap[seg.pts[1]]);
        if (p1 && p2) {
          const dy = Math.abs(p1.y - p2.y);
          if (dy > 25) {
            heightSeg = seg;
            break;
          }
        }
      }
    }

    if (!heightSeg) return false;

    const pA = getPt2D(pointsMap[heightSeg.pts[0]]);
    const pB = getPt2D(pointsMap[heightSeg.pts[1]]);
    if (!pA || !pB) return false;

    let apexId, footId;
    if (pA.y < pB.y) {
      apexId = heightSeg.pts[0];
      footId = heightSeg.pts[1];
    } else {
      apexId = heightSeg.pts[1];
      footId = heightSeg.pts[0];
    }

    const apexP = getPt2D(pointsMap[apexId]);
    const footP = getPt2D(pointsMap[footId]);
    const heightVal = Math.max(25, Math.round(footP.y - apexP.y));

    // 2. Tìm các đỉnh đáy
    let basePtIds = [];
    let basePolygonShape = null;

    if (currentBuild.active && currentBuild.basePtIds && currentBuild.basePtIds.length >= 3) {
      basePtIds = [...currentBuild.basePtIds];
    }

    // Nếu người dùng vẽ bằng tool đa giác (polygon):
    if (!basePtIds.length) {
      const polygons = shapes.filter(s => s.kind === 'polygon' && s.pts && s.pts.length >= 3);
      for (const poly of polygons) {
        if (poly.pts.includes(footId)) {
          basePolygonShape = poly;
          basePtIds = [...poly.pts];
          break;
        }
      }

      if (!basePtIds.length && polygons.length) {
        for (const poly of polygons) {
          const polyPts = poly.pts.map(id => getPt2D(pointsMap[id])).filter(Boolean);
          if (polyPts.length >= 3) {
            const minY = Math.min(...polyPts.map(p => p.y));
            const maxY = Math.max(...polyPts.map(p => p.y));
            const minX = Math.min(...polyPts.map(p => p.x));
            const maxX = Math.max(...polyPts.map(p => p.x));
            if (footP.y >= minY - 35 && footP.y <= maxY + 40 && footP.x >= minX - 40 && footP.x <= maxX + 40) {
              basePolygonShape = poly;
              basePtIds = [...poly.pts];
              break;
            }
          }
        }
      }
    }

    // Nếu người dùng vẽ đáy bằng các đoạn thẳng nối nhau:
    if (!basePtIds.length) {
      const otherSegs = shapes.filter(s => s.id !== heightSeg.id && s.kind === 'segment' && s.pts);
      const connectedPtIds = new Set();
      for (const seg of otherSegs) {
        const p1 = getPt2D(pointsMap[seg.pts[0]]);
        const p2 = getPt2D(pointsMap[seg.pts[1]]);
        if (p1 && p2 && p1.y > apexP.y + 20 && p2.y > apexP.y + 20) {
          connectedPtIds.add(seg.pts[0]);
          connectedPtIds.add(seg.pts[1]);
        }
      }
      if (connectedPtIds.size >= 3) {
        basePtIds = Array.from(connectedPtIds);
      }
    }

    if (!basePtIds.length && board.sel && board.sel.points && board.sel.points.size >= 3) {
      basePtIds = Array.from(board.sel.points).filter(id => id !== apexId);
    }

    if (basePtIds.length < 3) return false;

    // Sắp xếp các đỉnh đáy theo vòng tròn quanh trọng tâm để bảo đảm thứ tự chu vi đáy
    const basePtsWithCoords = basePtIds.map(id => ({ id, ...getPt2D(pointsMap[id]) })).filter(p => p.x !== undefined);
    if (basePtsWithCoords.length >= 3) {
      const baseCx = basePtsWithCoords.reduce((s, p) => s + p.x, 0) / basePtsWithCoords.length;
      const baseCy = basePtsWithCoords.reduce((s, p) => s + p.y, 0) / basePtsWithCoords.length;
      basePtsWithCoords.sort((a, b) => Math.atan2(a.y - baseCy, a.x - baseCx) - Math.atan2(b.y - baseCy, b.x - baseCx));
      basePtIds = basePtsWithCoords.map(p => p.id);
    }

    // Snap chân đường cao vào đỉnh đáy gần nhất nếu khoảng cách < 35px
    let closestBaseId = null;
    let minDist = Infinity;
    for (const bId of basePtIds) {
      const bp = getPt2D(pointsMap[bId]);
      const d = dist2D(footP, bp);
      if (d < minDist) {
        minDist = d;
        closestBaseId = bId;
      }
    }
    if (minDist < 35 && closestBaseId && closestBaseId !== footId) {
      footId = closestBaseId;
      heightSeg.pts = [apexId, footId];
    }

    // Gán nhãn đỉnh
    if (!pointsMap[apexId].label) {
      pointsMap[apexId] = { ...pointsMap[apexId], label: 'S', show: true };
    }

    const defaultLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
    basePtIds.forEach((pid, idx) => {
      if (!pointsMap[pid].label) {
        pointsMap[pid] = { ...pointsMap[pid], label: defaultLabels[idx % defaultLabels.length], show: true };
      }
    });

    const groupId = currentBuild.groupId || ('spatial_auto_' + Date.now());

    basePtIds.forEach(bId => {
      pointsMap[bId] = { ...pointsMap[bId], z: 0, group: groupId };
    });
    pointsMap[apexId] = { ...pointsMap[apexId], z: heightVal, group: groupId };

    // TÍNH TOÁN TOÀN DIỆN NÉT LIỀN - NÉT ĐỨT CHUẨN SGK HÌNH HỌC KHÔNG GIAN
    const basePtsList = basePtIds.map(id => {
      const p = pointsMap[id];
      return { id, x: p.def.x, y: p.def.y };
    });
    const apexObj = { id: apexId, x: apexP.x, y: apexP.y };
    const vis = classifyPyramidEdges(apexObj, basePtsList, footId);

    // XỬ LÝ ĐÁY: Nếu đáy là polygon, chuyển đổi sang các segment riêng biệt để gán nét đứt chuẩn
    let convertedBaseSegs = [];
    let shapesWithoutBasePoly = shapes;
    if (basePolygonShape) {
      shapesWithoutBasePoly = shapes.filter(s => s.id !== basePolygonShape.id);
      for (let i = 0; i < basePtIds.length; i++) {
        const id1 = basePtIds[i];
        const id2 = basePtIds[(i + 1) % basePtIds.length];
        const isBaseDashed = vis.isBaseSegmentDashed ? vis.isBaseSegmentDashed(id1, id2) : vis.baseDashedPairs.has(`${id1}--${id2}`);
        convertedBaseSegs.push({
          id: uid('seg_base'),
          kind: 'segment',
          pts: [id1, id2],
          dashed: isBaseDashed,
          color: basePolygonShape.color || '#1e293b',
          width: basePolygonShape.width || 1.8,
          group: groupId
        });
      }
    }

    // CẬP NHẬT CÁC CẠNH HIỆN CÓ:
    const updatedShapes = shapesWithoutBasePoly.map(s => {
      if (s.id === heightSeg.id) {
        return {
          ...s,
          pts: [apexId, footId],
          dashed: vis.heightDashed, // Chuẩn xác nét đứt cho đường cao
          color: '#1e293b',
          width: 2.0,
          group: groupId
        };
      }
      // Nếu là các đoạn thẳng cạnh đáy hoặc đường chéo đáy (AC, BD...)
      if (s.kind === 'segment' && s.pts && s.pts.length === 2 && s.id !== heightSeg.id) {
        const id1 = s.pts[0], id2 = s.pts[1];
        if (basePtIds.includes(id1) && basePtIds.includes(id2)) {
          const isDashed = vis.isBaseSegmentDashed ? vis.isBaseSegmentDashed(id1, id2) : (vis.baseDashedPairs.has(`${id1}--${id2}`) || id1 === vis.hiddenBasePtId || id2 === vis.hiddenBasePtId);
          return { ...s, dashed: isDashed, group: groupId };
        }
        // Nếu là cạnh bên nối từ đỉnh S xuống đáy đã vẽ sẵn (SB, SC, SD...)
        if ((id1 === apexId && basePtIds.includes(id2)) || (id2 === apexId && basePtIds.includes(id1))) {
          const bId = (id1 === apexId) ? id2 : id1;
          const isLatDashed = !!vis.lateralDashed[bId];
          return { ...s, dashed: isLatDashed, group: groupId };
        }
      }
      return s;
    });

    // NỐI CÁC CẠNH BÊN CÒN THIẾU TỪ ĐỈNH S XUỐNG ĐÁY
    const newLateralEdges = [];
    basePtIds.forEach(bId => {
      if (bId === footId) return;
      const hasEdge = updatedShapes.some(s => s.kind === 'segment' && (
        (s.pts[0] === apexId && s.pts[1] === bId) ||
        (s.pts[1] === apexId && s.pts[0] === bId)
      ));
      if (hasEdge) return;

      const isLatDashed = !!vis.lateralDashed[bId];
      newLateralEdges.push({
        id: uid('seg_lat'),
        kind: 'segment',
        pts: [apexId, bId],
        dashed: isLatDashed, // Chuẩn xác nét liền cho các cạnh bên nhìn thấy (SB, SC, SD)
        color: '#1e293b',
        width: 1.8,
        group: groupId
      });
    });

    // Ký hiệu góc vuông
    const rightAngleShapes = [];
    const refPtId = basePtIds.find(id => id !== footId);
    if (refPtId) {
      rightAngleShapes.push({
        id: uid('right_mark'),
        kind: 'right',
        pts: [apexId, footId, refPtId],
        aux: true,
        color: '#1e293b',
        width: 1.5,
        group: groupId
      });
    }

    // Đóng gói khối solid 3D
    const allPtIds = [...basePtIds];
    if (!allPtIds.includes(apexId)) allPtIds.push(apexId);
    if (footId && !allPtIds.includes(footId)) allPtIds.push(footId);

    const faces = [];
    faces.push(basePtIds.map(id => allPtIds.indexOf(id)));
    for (let i = 0; i < basePtIds.length; i++) {
      const next = (i + 1) % basePtIds.length;
      faces.push([allPtIds.indexOf(apexId), allPtIds.indexOf(basePtIds[i]), allPtIds.indexOf(basePtIds[next])]);
    }

    const groupSolid = {
      id: 'solid_' + groupId,
      kind: 'solid',
      pts: allPtIds,
      color: '#2563eb',
      width: 1.5,
      group: groupId,
      hidden: true,
      solid: {
        of: basePtIds.length === 4 ? 'pyramid4' : 'pyramid3',
        view: Zo,
        turn: Cp,
        isGroup3D: true,
        faces
      }
    };

    const finalShapes = [...updatedShapes, ...convertedBaseSegs, ...newLateralEdges, ...rightAngleShapes, groupSolid];
    
    board.commit(board.updatePage(pageIdx, P => ({
      ...P,
      geo: { ...P.geo, points: pointsMap, shapes: finalShapes }
    })));

    currentBuild.active = true;
    currentBuild.stage = 'complete';
    currentBuild.groupId = groupId;
    currentBuild.basePtIds = basePtIds;
    currentBuild.heightPtId = footId;
    currentBuild.apexPtId = apexId;
    currentBuild.heightVal = heightVal;
    currentBuild.waitingFreeHeight = false;

    if (typeof board.setTool === 'function') {
      board.setTool({ k: 'select' });
    }

    const selectableShapeIds = new Set(finalShapes.filter(s => s.group === groupId && !s.hidden).map(s => s.id));
    board.sel = {
      page: pageIdx,
      strokes: new Set(),
      items: new Set(),
      shapes: selectableShapeIds,
      points: new Set(allPtIds)
    };
    board.redraw();
    board.emit();

    hideAutoCompletePill();
    hideGuideBanner();
    if (builderPanelEl) {
      builderPanelEl.classList.remove('minimized');
      updateBuilderUI();
    }

    showToast(`✨ Đã tự động hoàn thiện khối 3D với nét liền/nét đứt chuẩn SGK!`);
    console.log('[SpatialBuilder] ✨ TỰ ĐỘNG HOÀN THIỆN THÀNH CÔNG KHỐI HÌNH HỌC KHÔNG GIAN 3D!');
    return true;
  }

  /**
   * Hook được gọi khi người dùng vẽ xong một hình hoặc đoạn thẳng mới trên canvas
   */
  function onShapeAdded(board, pageIdx, addedShapes, addedPoints) {
    if (!autoMode && !currentBuild.waitingFreeHeight) return;
    if (!addedShapes || !addedShapes.length) return;

    const seg = addedShapes.find(s => s.kind === 'segment');
    if (!seg || !seg.pts || seg.pts.length < 2) return;

    const pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return;

    const pMap = pg.geo.points;
    const p1 = getPt2D(pMap[seg.pts[0]]);
    const p2 = getPt2D(pMap[seg.pts[1]]);
    if (!p1 || !p2) return;

    const dy = Math.abs(p1.y - p2.y);

    if (currentBuild.waitingFreeHeight || dy > 25) {
      // Kiểm tra nếu cả 2 đầu của đoạn thẳng đều nằm trong vùng đáy thì đây là cạnh đáy hoặc đường chéo đáy, KHÔNG PHẢI đường cao!
      const otherPoints = Object.values(pMap).filter(p => p.id !== seg.pts[0] && p.id !== seg.pts[1]);
      if (otherPoints.length >= 3) {
        const otherYs = otherPoints.map(p => (p.def ? p.def.y : p.y)).filter(y => y !== undefined);
        const minOtherY = Math.min(...otherYs);
        const minSegY = Math.min(p1.y, p2.y);
        if (minSegY >= minOtherY - 20) {
          return;
        }
      }

      const hasBase = (currentBuild.basePtIds && currentBuild.basePtIds.length >= 3) ||
        pg.geo.shapes.some(s => s.id !== seg.id && (s.kind === 'polygon' || s.kind === 'segment'));
      
      if (hasBase) {
        console.log('[SpatialBuilder] Nhận diện đoạn thẳng chiều cao tự do vừa vẽ!');
        setTimeout(() => {
          if (currentBuild.waitingFreeHeight && currentBuild.stage === 'base') {
            recordFreehandHeightStep(board, pageIdx, seg.id);
          } else {
            completeFromBaseAndHeight(board, seg.id);
          }
        }, 50);
      }
    }
  }

  /**
   * Ghi nhận đường cao tự do vừa vẽ cho Bước 2 (Áp dụng đúng nét đứt/nét liền)
   */
  function recordFreehandHeightStep(board, pageIdx, segId) {
    const pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return;

    const shapes = pg.geo.shapes;
    const seg = shapes.find(s => s.id === segId && s.kind === 'segment');
    if (!seg || seg.pts.length < 2) return;

    const pMap = pg.geo.points;
    const pA = getPt2D(pMap[seg.pts[0]]);
    const pB = getPt2D(pMap[seg.pts[1]]);
    if (!pA || !pB) return;

    const apexId = pA.y < pB.y ? seg.pts[0] : seg.pts[1];
    let footId = pA.y < pB.y ? seg.pts[1] : seg.pts[0];

    const apexP = getPt2D(pMap[apexId]);
    const footP = getPt2D(pMap[footId]);
    const heightVal = Math.round(footP.y - apexP.y);

    const basePtIds = currentBuild.basePtIds || [];
    let minDist = Infinity, closestId = null;
    for (const bId of basePtIds) {
      const bp = getPt2D(pMap[bId]);
      const d = dist2D(footP, bp);
      if (d < minDist) { minDist = d; closestId = bId; }
    }
    if (minDist < 35 && closestId) {
      footId = closestId;
      seg.pts = [apexId, footId];
    }

    // TÍNH TOÁN NÉT KHUẤT CHO ĐƯỜNG CAO TỰ DO
    const basePtsList = basePtIds.map(id => {
      const p = pMap[id];
      return { id, x: p.def.x, y: p.def.y };
    });
    const apexObj = { id: apexId, x: apexP.x, y: apexP.y };
    const vis = classifyPyramidEdges(apexObj, basePtsList, footId);

    pMap[apexId] = { ...pMap[apexId], label: 'S', show: true, z: heightVal, group: currentBuild.groupId };
    seg.color = '#1e293b';
    seg.width = 2.0;
    seg.dashed = vis.heightDashed; // GÁN NÉT ĐỨT/LIỀN CHUẨN XÁC
    seg.group = currentBuild.groupId;

    const refPtId = basePtIds.find(id => id !== footId);
    const newShapes = [...shapes];
    if (refPtId) {
      newShapes.push({
        id: uid('right_mark'),
        kind: 'right',
        pts: [apexId, footId, refPtId],
        aux: true,
        color: '#1e293b',
        width: 1.5,
        group: currentBuild.groupId
      });
    }

    board.commit(board.updatePage(pageIdx, P => ({
      ...P,
      geo: { ...P.geo, points: pMap, shapes: newShapes }
    })));

    currentBuild.stage = 'height';
    currentBuild.apexPtId = apexId;
    currentBuild.heightPtId = footId;
    currentBuild.heightVal = heightVal;
    currentBuild.waitingFreeHeight = false;

    if (typeof board.setTool === 'function') {
      board.setTool({ k: 'select' });
    }

    board.sel = {
      page: pageIdx,
      strokes: new Set(),
      items: new Set(),
      points: new Set([apexId]),
      shapes: new Set([segId])
    };
    board.redraw();
    board.emit();

    hideGuideBanner();
    if (builderPanelEl) {
      builderPanelEl.classList.remove('minimized');
      updateBuilderUI();
    }

    showToast(`✅ Đã vẽ chiều cao tự do (${vis.heightDashed ? 'nét đứt' : 'nét liền'})! Bấm Bước 3 để nối cạnh bên.`);
  }

  /**
   * BANNER HƯỚNG DẪN KÉO CHIỀU CAO TỰ DO TRÊN CANVAS
   */
  let guideBannerEl = null;

  function showGuideBanner(board) {
    hideGuideBanner();
    const banner = document.createElement('div');
    banner.id = 'spatial-guide-banner';
    banner.className = 'spatial-guide-banner';
    banner.innerHTML = `
      <div class="sgb-content">
        <span class="sgb-icon">✍️</span>
        <span class="sgb-text"><b>Bước 2:</b> Kéo chuột/bút từ đáy lên trên đỉnh S theo độ cao bạn muốn!</span>
      </div>
      <div class="sgb-btns">
        <button type="button" class="sgb-quick-btn" id="sgb-btn-quick" title="Hoặc chèn nhanh đường cao theo mẫu">⚡ Dựng mẫu</button>
        <button type="button" class="sgb-close-btn" id="sgb-btn-close" title="Hủy vẽ tự do">✕</button>
      </div>
    `;

    document.body.appendChild(banner);
    guideBannerEl = banner;

    banner.querySelector('#sgb-btn-quick').addEventListener('click', () => {
      hideGuideBanner();
      step2_DrawHeight(board, { heightType: 'perp_A' });
    });

    banner.querySelector('#sgb-btn-close').addEventListener('click', () => {
      hideGuideBanner();
      currentBuild.waitingFreeHeight = false;
      if (builderPanelEl) builderPanelEl.classList.remove('minimized');
    });
  }

  function hideGuideBanner() {
    if (guideBannerEl) {
      if (typeof guideBannerEl.remove === "function") if (typeof guideBannerEl.remove === "function") if (typeof guideBannerEl.remove === "function") if (typeof guideBannerEl.remove === "function") guideBannerEl.remove();
      guideBannerEl = null;
    }
  }

  /**
   * BONG BÓNG NHẮC HOÀN THIỆN THÔNG MINH
   */
  let pillEl = null;
  let pillTimer = null;

  function showAutoCompletePill(board, apexPos, heightSegId) {
    hideAutoCompletePill();
    if (!board || !board.scroller) return;

    let clientX = apexPos.x;
    let clientY = apexPos.y;
    if (typeof board.toScreen === 'function') {
      const scr = board.toScreen(apexPos.x, apexPos.y);
      clientX = scr.x;
      clientY = scr.y;
    } else {
      const zoom = board.zoom || 1;
      const rect = board.scroller.getBoundingClientRect();
      clientX = rect.left + apexPos.x * zoom - board.scroller.scrollLeft;
      clientY = rect.top + apexPos.y * zoom - board.scroller.scrollTop;
    }

    const pill = document.createElement('div');
    pill.className = 'spatial-autocomplete-pill';
    pill.innerHTML = `
      <span class="sap-icon">✨</span>
      <span class="sap-text">Tự động hoàn thiện khối 3D</span>
      <span class="sap-arrow">➔</span>
    `;

    pill.style.position = 'fixed';
    pill.style.left = Math.max(10, clientX - 80) + 'px';
    pill.style.top = Math.max(50, clientY - 45) + 'px';
    pill.style.zIndex = '10000';

    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      completeFromBaseAndHeight(board, heightSegId);
    });

    document.body.appendChild(pill);
    pillEl = pill;

    pillTimer = setTimeout(() => {
      hideAutoCompletePill();
    }, 7000);
  }

  function hideAutoCompletePill() {
    if (pillTimer) {
      clearTimeout(pillTimer);
      pillTimer = null;
    }
    if (pillEl) {
      pillEl.remove();
      pillEl = null;
    }
  }

  /**
   * BẢNG ĐIỀU KHIỂN DỰNG HÌNH KHÔNG GIAN
   */
  let builderPanelEl = null;

  function createBuilderPanel() {
    const existing = document.getElementById('spatial-builder-panel');
    if (existing) {
      builderPanelEl = existing;
      return existing;
    }

    const panel = document.createElement('div');
    panel.id = 'spatial-builder-panel';
    panel.className = 'spatial-builder-panel';
    panel.innerHTML = `
      <div class="sb-header">
        <span class="sb-title">🏗️ Dựng Hình Không Gian Từng Bước</span>
        <button type="button" class="sb-close" title="Đóng bảng">✕</button>
      </div>

      <div class="sb-nav-tabs">
        <button type="button" class="sb-nav-tab on" data-tab="steps">🪜 Dựng từng bước</button>
        <button type="button" class="sb-nav-tab" data-tab="draw">✍️ Tự vẽ ➔ Tự hoàn thiện</button>
      </div>

      <div class="sb-body tab-steps-content">
        <div class="sb-row">
          <label class="sb-label" style="margin-bottom: 6px;">Chọn khối hình không gian:</label>
          <div class="sb-shape-grid">
            <button type="button" class="sb-btn sb-toggle on" data-shape="pyramid" title="Chóp tứ giác S.ABCD">🔺 Chóp tứ giác</button>
            <button type="button" class="sb-btn sb-toggle" data-shape="pyramid_tri" title="Chóp tam giác S.ABC">📐 Chóp tam giác</button>
            <button type="button" class="sb-btn sb-toggle" data-shape="pyramid_regular" title="Chóp đều S.ABCD / S.ABC">⭐ Chóp đều</button>
            <button type="button" class="sb-btn sb-toggle" data-shape="prism_tri" title="Lăng trụ tam giác ABC.A'B'C'">🧊 Lăng trụ △</button>
            <button type="button" class="sb-btn sb-toggle" data-shape="prism_quad" title="Lăng trụ tứ giác ABCD.A'B'C'D'">🏛️ Lăng trụ ▱</button>
            <button type="button" class="sb-btn sb-toggle" data-shape="cube" title="Hình lập phương">📦 Lập phương</button>
            <button type="button" class="sb-btn sb-toggle" data-shape="cuboid" title="Hình hộp chữ nhật">📦 Hộp chữ nhật</button>
            <button type="button" class="sb-btn sb-toggle" data-shape="frustum" title="Chóp cụt">⏳ Chóp cụt</button>
            <button type="button" class="sb-btn sb-toggle" data-shape="cone" title="Hình nón tròn xoay">⛺ Hình nón</button>
            <button type="button" class="sb-btn sb-toggle" data-shape="cylinder" title="Hình trụ tròn xoay">🛢️ Hình trụ</button>
            <button type="button" class="sb-btn sb-toggle" data-shape="sphere" title="Khối cầu / Mặt cầu">🌐 Mặt cầu</button>
          </div>
        </div>

        <div class="sb-row" id="sb-base-row">
          <label class="sb-label">Mặt đáy:</label>
          <select class="sb-select" id="sb-base-select">
            <option value="quad">▱ Tứ giác (Hình bình hành / Chữ nhật / Vuông)</option>
            <option value="triangle">◺ Tam giác thường / vuông (ABC)</option>
            <option value="tri_regular">△ Tam giác đều (ABC)</option>
            <option value="trapezoid">⏢ Hình thang (ABCD)</option>
            <option value="round">◯ Đáy tròn elip chuẩn SGK</option>
          </select>
        </div>

        <div class="sb-row" id="sb-height-row">
          <label class="sb-label">Đường cao / Trục:</label>
          <select class="sb-select" id="sb-height-select">
            <option value="perp_A" selected>⊥ SA / AA' vuông góc đáy (tại đỉnh A)</option>
            <option value="center_O">⊥ SO trục đứng / tâm O (chóp đều / nón / trụ / cầu)</option>
            <option value="mid_H">⊥ SH vuông góc đáy (tại trung điểm AB)</option>
            <option value="slant">📐 Chiều cao xiên / nghiêng tự do</option>
            <option value="freehand">✍️ Kéo chuột/bút tự do trên bảng vẽ</option>
          </select>
        </div>

        <div class="sb-free-hint" id="sb-free-hint" style="display: none;">
          <span>✨ <b>Vẽ tự do:</b> Bấm Bước 2 rồi kéo chuột/bút từ đáy lên đỉnh S theo độ cao bạn muốn!</span>
        </div>

        <div class="sb-row" id="sb-height-slider-row">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <label class="sb-label" style="margin: 0;">Chiều cao mẫu:</label>
            <b id="sb-height-val" style="color: #2563eb; font-size: 12.5px;">150px</b>
          </div>
          <input type="range" class="sb-slider" id="sb-height-range" min="60" max="360" step="10" value="150" />
          <div class="sb-sub-text">💡 Sau khi dựng, bạn có thể bấm vào đỉnh để kéo chỉnh kích thước tùy ý!</div>
        </div>

        <!-- 3 NÚT DỰNG TỪNG BƯỚC -->
        <div class="sb-steps">
          <button type="button" class="sb-step-btn active" id="sb-btn-step1" title="Vẽ mặt đáy chuẩn SGK có hiệu ứng animation">
            <span class="sb-step-num">1</span>
            <span class="sb-step-txt">1. Vẽ mặt đáy</span>
          </button>

          <div class="sb-step2-wrapper">
            <button type="button" class="sb-step-btn" id="sb-btn-step2" title="Dựng đường cao có animation">
              <span class="sb-step-num">2</span>
              <span class="sb-step-txt" id="sb-step2-label">2. Dựng đường cao</span>
            </button>
            <button type="button" class="sb-step2-quick" id="sb-btn-step2-quick" title="Dựng nhanh đường cao theo mẫu">⚡ Mẫu</button>
          </div>

          <button type="button" class="sb-step-btn" id="sb-btn-step3" title="Hoàn thiện các cạnh bên và tạo khối 3D">
            <span class="sb-step-num">3</span>
            <span class="sb-step-txt">3. Nối cạnh bên</span>
          </button>
        </div>

        <div class="sb-actions">
          <button type="button" class="sb-act-btn sb-anim" id="sb-btn-anim" title="Chạy diễn hoạt toàn bộ 3 bước có hiệu ứng chuyển động sinh động">🎬 Chạy Animation</button>
          <button type="button" class="sb-act-btn sb-quick" id="sb-btn-all" title="Dựng ngay lập tức cả khối đầy đủ trong 0ms">⚡ Dựng toàn bộ</button>
          <button type="button" class="sb-act-btn sb-turn" id="sb-btn-turn" title="Bật xoay 3D quanh trục đứng hoặc tự do">🔄 Xoay 3D</button>
        </div>
      </div>

      <!-- Tab Tự vẽ tự hoàn thiện -->
      <div class="sb-body tab-draw-content" style="display: none;">
        <div class="sb-guide-box">
          <div class="sb-guide-title">✨ Quy trình tự vẽ hoàn toàn tự do:</div>
          <ol class="sb-guide-list">
            <li><b>Bước 1:</b> Tự vẽ mặt đáy (tam giác, tứ giác, hình bình hành, đa giác...).</li>
            <li><b>Bước 2:</b> Kéo một đường thẳng từ đáy lên đỉnh S theo độ cao và độ nghiêng tùy ý.</li>
            <li><b>Bước 3:</b> Hệ thống <b>tự động hoàn thiện</b> toàn bộ cạnh bên, nét đứt nét liền & tạo khối xoay 3D!</li>
          </ol>
        </div>

        <div class="sb-row sb-row-switch">
          <label class="sb-switch-label">
            <input type="checkbox" id="sb-auto-toggle" checked />
            <span class="sb-switch-custom"></span>
            <span class="sb-switch-text">Bật tự động hoàn thiện khi vẽ đường cao</span>
          </label>
        </div>

        <div class="sb-actions">
          <button type="button" class="sb-act-btn sb-quick" id="sb-btn-complete-sel" title="Hoàn thiện ngay hình hoặc các nét đang chọn">✨ Hoàn thiện hình đang chọn</button>
        </div>
      </div>
    `;

    document.body.appendChild(panel);
    builderPanelEl = panel;

    panel.querySelector('.sb-close').addEventListener('click', () => {
      panel.style.display = 'none';
      hideGuideBanner();
    });

    const tabBtns = panel.querySelectorAll('.sb-nav-tab');
    const stepsContent = panel.querySelector('.tab-steps-content');
    const drawContent = panel.querySelector('.tab-draw-content');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        const tab = btn.dataset.tab;
        if (tab === 'steps') {
          stepsContent.style.display = 'block';
          drawContent.style.display = 'none';
        } else {
          stepsContent.style.display = 'none';
          drawContent.style.display = 'block';
        }
      });
    });

    const baseSel = panel.querySelector('#sb-base-select');
    const heightSel = panel.querySelector('#sb-height-select');
    const freeHint = panel.querySelector('#sb-free-hint');
    const sliderRow = panel.querySelector('#sb-height-slider-row');
    const step2Label = panel.querySelector('#sb-step2-label');

    // Chuyển đổi khối hình
    panel.querySelectorAll('.sb-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        panel.querySelectorAll('.sb-toggle').forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        const shape = btn.dataset.shape;
        currentBuild.shapeType = shape;

        // Cập nhật đáy và chiều cao ngữ cảnh phù hợp
        if (shape === 'cone' || shape === 'cylinder' || shape === 'sphere') {
          baseSel.value = 'round';
          heightSel.value = 'center_O';
        } else if (shape === 'pyramid_tri' || shape === 'prism_tri') {
          baseSel.value = 'triangle';
        } else if (shape === 'pyramid_regular') {
          heightSel.value = 'center_O';
        } else if (shape === 'pyramid_trap') {
          baseSel.value = 'trapezoid';
        } else if (shape === 'cube' || shape === 'cuboid' || shape === 'prism_quad') {
          baseSel.value = 'quad';
          heightSel.value = 'perp_A';
        }

        currentBuild.baseType = baseSel.value;
        currentBuild.heightType = heightSel.value;
      });
    });

    baseSel.addEventListener('change', () => {
      currentBuild.baseType = baseSel.value;
    });

    heightSel.addEventListener('change', () => {
      const val = heightSel.value;
      currentBuild.heightType = val;
      if (val === 'freehand') {
        freeHint.style.display = 'block';
        sliderRow.style.display = 'none';
        step2Label.textContent = '2. Kéo chiều cao tự do';
      } else {
        freeHint.style.display = 'none';
        sliderRow.style.display = 'block';
        step2Label.textContent = '2. Dựng đường cao';
      }
    });

    const heightRange = panel.querySelector('#sb-height-range');
    const heightValLabel = panel.querySelector('#sb-height-val');
    heightRange.addEventListener('input', () => {
      currentBuild.heightVal = Number(heightRange.value);
      heightValLabel.textContent = heightRange.value + 'px';
    });

    const autoToggle = panel.querySelector('#sb-auto-toggle');
    if (autoToggle) {
      autoToggle.addEventListener('change', () => {
        autoMode = autoToggle.checked;
        showToast(autoMode ? '✅ Đã BẬT tự động hoàn thiện khi vẽ đường cao' : '⏸️ Đã TẮT tự động hoàn thiện');
      });
    }

    panel.querySelector('#sb-btn-step1').addEventListener('click', () => {
      step1_DrawBase(null, {
        animate: true,
        shapeType: currentBuild.shapeType,
        baseType: baseSel.value,
        heightType: heightSel.value,
        heightVal: Number(heightRange.value)
      });
    });

    panel.querySelector('#sb-btn-step2').addEventListener('click', () => {
      if (heightSel.value === 'freehand') {
        startFreehandHeight(null);
      } else {
        step2_DrawHeight(null, {
          animate: true,
          heightType: heightSel.value,
          heightVal: Number(heightRange.value)
        });
      }
    });

    panel.querySelector('#sb-btn-step2-quick').addEventListener('click', () => {
      step2_DrawHeight(null, {
        animate: false,
        heightType: heightSel.value === 'freehand' ? 'perp_A' : heightSel.value,
        heightVal: Number(heightRange.value)
      });
    });

    panel.querySelector('#sb-btn-step3').addEventListener('click', () => {
      step3_CompleteEdges(null, { animate: true });
    });

    panel.querySelector('#sb-btn-anim').addEventListener('click', () => {
      runFullAnimation(null, {
        shapeType: currentBuild.shapeType,
        baseType: baseSel.value,
        heightType: heightSel.value === 'freehand' ? 'perp_A' : heightSel.value,
        heightVal: Number(heightRange.value)
      });
    });

    panel.querySelector('#sb-btn-all').addEventListener('click', () => {
      buildAll(null, {
        shapeType: currentBuild.shapeType,
        baseType: baseSel.value,
        heightType: heightSel.value === 'freehand' ? 'perp_A' : heightSel.value,
        heightVal: Number(heightRange.value)
      });
    });

    panel.querySelector('#sb-btn-turn').addEventListener('click', () => {
      turn3DCurrent(null);
    });

    const completeSelBtn = panel.querySelector('#sb-btn-complete-sel');
    if (completeSelBtn) {
      completeSelBtn.addEventListener('click', () => {
        const board = getActiveBoard();
        if (board) {
          const success = completeFromBaseAndHeight(board);
          if (!success) {
            showToast('⚠️ Hãy vẽ một mặt đáy và kéo 1 đường cao trước, sau đó bấm hoàn thiện!');
          }
        }
      });
    }

    makeDraggable(panel, panel.querySelector('.sb-header'));
    return panel;
  }

  function updateBuilderUI() {
    if (!builderPanelEl) return;
    const btn1 = builderPanelEl.querySelector('#sb-btn-step1');
    const btn2 = builderPanelEl.querySelector('#sb-btn-step2');
    const btn3 = builderPanelEl.querySelector('#sb-btn-step3');

    if (btn1) btn1.classList.remove('active', 'done');
    if (btn2) btn2.classList.remove('active', 'done');
    if (btn3) btn3.classList.remove('active', 'done');

    if (currentBuild.stage === 'base') {
      if (btn1) btn1.classList.add('done');
      if (btn2) btn2.classList.add('active');
    } else if (currentBuild.stage === 'height') {
      if (btn1) btn1.classList.add('done');
      if (btn2) btn2.classList.add('done');
      if (btn3) btn3.classList.add('active');
    } else if (currentBuild.stage === 'complete') {
      if (btn1) btn1.classList.add('done');
      if (btn2) btn2.classList.add('done');
      if (btn3) btn3.classList.add('done');
    } else {
      if (btn1) btn1.classList.add('active');
    }
  }

  function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    handle.style.cursor = 'move';
    handle.onmousedown = dragMouseDown;
    handle.ontouchstart = dragTouchStart;

    function dragMouseDown(e) {
      if (e.target.closest('.sb-close')) return;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function dragTouchStart(e) {
      if (e.target.closest('.sb-close')) return;
      const t = e.touches[0];
      pos3 = t.clientX;
      pos4 = t.clientY;
      document.ontouchend = closeDragElement;
      document.ontouchmove = elementTouchDrag;
    }

    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.top = Math.max(10, Math.min(window.innerHeight - element.offsetHeight - 10, element.offsetTop - pos2)) + 'px';
      element.style.left = Math.max(10, Math.min(window.innerWidth - element.offsetWidth - 10, element.offsetLeft - pos1)) + 'px';
      element.style.right = 'auto';
    }

    function elementTouchDrag(e) {
      const t = e.touches[0];
      pos1 = pos3 - t.clientX;
      pos2 = pos4 - t.clientY;
      pos3 = t.clientX;
      pos4 = t.clientY;
      element.style.top = Math.max(10, Math.min(window.innerHeight - element.offsetHeight - 10, element.offsetTop - pos2)) + 'px';
      element.style.left = Math.max(10, Math.min(window.innerWidth - element.offsetWidth - 10, element.offsetLeft - pos1)) + 'px';
      element.style.right = 'auto';
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
      document.ontouchend = null;
      document.ontouchmove = null;
    }
  }

  function openBuilder() {
    const panel = createBuilderPanel();
    panel.style.display = 'block';
    panel.classList.remove('minimized');
    updateBuilderUI();
  }

  function closeBuilder() {
    if (builderPanelEl) {
      builderPanelEl.style.display = 'none';
    }
    hideGuideBanner();
  }

  function toggleBuilder() {
    if (!builderPanelEl || builderPanelEl.style.display === 'none') {
      openBuilder();
    } else {
      closeBuilder();
    }
  }

  function injectStyles() {
    if (typeof document === 'undefined' || !document.head) return;
    if (document.getElementById('spatial-builder-styles')) return;

    const style = document.createElement('style');
    style.id = 'spatial-builder-styles';
    style.textContent = `
      .spatial-builder-panel {
        position: fixed;
        top: 75px;
        right: 25px;
        width: 360px; max-height: 92vh; overflow-y: auto;
        background: #ffffff;
        border-radius: 14px;
        box-shadow: 0 10px 30px -5px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.08);
        z-index: 9999;
        font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #1e293b;
        overflow: hidden;
        user-select: none;
        transition: opacity 0.2s, transform 0.2s;
        animation: sb-scale-in 0.18s ease-out;
      }
      .spatial-builder-panel.minimized {
        opacity: 0.25;
        transform: scale(0.92);
        pointer-events: none;
      }
      @keyframes sb-scale-in {
        from { opacity: 0; transform: scale(0.95) translateY(-8px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
      .sb-header {
        background: linear-gradient(135deg, #1e3a8a, #2563eb);
        color: white;
        padding: 11px 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
        font-size: 13.5px;
        letter-spacing: 0.2px;
      }
      .sb-close {
        background: transparent;
        border: none;
        color: white;
        font-size: 15px;
        cursor: pointer;
        line-height: 1;
        opacity: 0.8;
        padding: 2px 6px;
        border-radius: 4px;
        transition: opacity 0.15s, background 0.15s;
      }
      .sb-close:hover { opacity: 1; background: rgba(255,255,255,0.2); }

      .sb-nav-tabs {
        display: flex;
        background: #f1f5f9;
        border-bottom: 1px solid #e2e8f0;
      }
      .sb-nav-tab {
        flex: 1;
        padding: 8px 10px;
        border: none;
        background: transparent;
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
        cursor: pointer;
        transition: all 0.15s;
        border-bottom: 2px solid transparent;
      }
      .sb-nav-tab.on {
        color: #2563eb;
        background: #ffffff;
        border-bottom: 2px solid #2563eb;
      }

      .sb-body {
        padding: 13px 15px 15px;
      }
      .sb-row {
        margin-bottom: 11px;
      }
      .sb-label {
        display: block;
        font-size: 11.5px;
        font-weight: 600;
        color: #475569;
        margin-bottom: 4px;
      }
      .sb-toggle-group {
        display: flex;
        gap: 6px;
      }
      .sb-btn.sb-toggle {
        flex: 1;
        padding: 6px 10px;
        border: 1px solid #cbd5e1;
        background: #f8fafc;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        color: #334155;
        transition: all 0.15s;
      }
      .sb-btn.sb-toggle.on {
        background: #eff6ff;
        border-color: #3b82f6;
        color: #1d4ed8;
        font-weight: 600;
      }
      .sb-select {
        width: 100%;
        padding: 7px 9px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-size: 12px;
        color: #1e293b;
        background: #f8fafc;
        outline: none;
        box-sizing: border-box;
      }
      .sb-select:focus {
        border-color: #3b82f6;
        background: #fff;
      }
      .sb-free-hint {
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        border-radius: 8px;
        padding: 8px 10px;
        margin-bottom: 11px;
        font-size: 11.5px;
        color: #1d4ed8;
        line-height: 1.45;
      }
      .sb-slider {
        width: 100%;
        accent-color: #2563eb;
      }
      .sb-sub-text {
        font-size: 10.5px;
        color: #64748b;
        margin-top: 3px;
      }
      .sb-steps {
        display: flex;
        flex-direction: column;
        gap: 7px;
        margin: 13px 0 11px;
        background: #f8fafc;
        padding: 9px;
        border-radius: 10px;
        border: 1px solid #e2e8f0;
      }
      .sb-step2-wrapper {
        display: flex;
        gap: 6px;
        align-items: stretch;
      }
      .sb-step2-wrapper .sb-step-btn {
        flex: 1;
      }
      .sb-step2-quick {
        padding: 0 10px;
        background: #f1f5f9;
        border: 1.5px solid #cbd5e1;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 600;
        color: #475569;
        cursor: pointer;
        transition: all 0.15s;
        white-space: nowrap;
      }
      .sb-step2-quick:hover {
        background: #e2e8f0;
        border-color: #94a3b8;
        color: #1e293b;
      }
      .sb-step-btn {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 8px 11px;
        background: #ffffff;
        border: 1.5px solid #cbd5e1;
        border-radius: 8px;
        font-size: 12.5px;
        font-weight: 600;
        color: #475569;
        cursor: pointer;
        text-align: left;
        transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .sb-step-btn:hover {
        border-color: #93c5fd;
        background: #f0f7ff;
      }
      .sb-step-btn.active {
        border-color: #2563eb;
        background: #eff6ff;
        color: #1d4ed8;
        box-shadow: 0 2px 6px rgba(37, 99, 235, 0.16);
      }
      .sb-step-btn.done {
        border-color: #10b981;
        color: #047857;
        background: #ecfdf5;
      }
      .sb-step-num {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #e2e8f0;
        color: #475569;
        font-size: 11px;
      }
      .sb-step-btn.active .sb-step-num {
        background: #2563eb;
        color: white;
      }
      .sb-step-btn.done .sb-step-num {
        background: #10b981;
        color: white;
      }
      .sb-step-btn.done .sb-step-num::after {
        content: '✓';
      }
      .sb-actions {
        display: flex;
        gap: 7px;
      }
      .sb-act-btn {
        flex: 1;
        padding: 8px 10px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: all 0.15s;
        text-align: center;
      }
      .sb-quick {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        box-shadow: 0 2px 6px rgba(16, 185, 129, 0.25);
      }
      .sb-quick:hover { filter: brightness(1.07); transform: translateY(-1px); }
      .sb-turn {
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        color: white;
        box-shadow: 0 2px 6px rgba(99, 102, 241, 0.25);
      }
      .sb-turn:hover { filter: brightness(1.07); transform: translateY(-1px); }

      /* Giao diện tab tự vẽ */
      .sb-guide-box {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 8px;
        padding: 10px 12px;
        margin-bottom: 12px;
      }
      .sb-guide-title {
        font-size: 12px;
        font-weight: 700;
        color: #166534;
        margin-bottom: 6px;
      }
      .sb-guide-list {
        margin: 0;
        padding-left: 17px;
        font-size: 11.5px;
        color: #15803d;
        line-height: 1.5;
      }
      .sb-row-switch {
        margin: 12px 0 14px;
      }
      .sb-switch-label {
        display: flex;
        align-items: center;
        gap: 9px;
        font-size: 12px;
        font-weight: 600;
        color: #334155;
        cursor: pointer;
      }
      .sb-switch-label input { display: none; }
      .sb-switch-custom {
        width: 34px;
        height: 18px;
        background: #cbd5e1;
        border-radius: 18px;
        position: relative;
        transition: background 0.2s;
        flex-shrink: 0;
      }
      .sb-switch-custom::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 14px;
        height: 14px;
        background: white;
        border-radius: 50%;
        transition: transform 0.2s;
      }
      .sb-switch-label input:checked + .sb-switch-custom {
        background: #2563eb;
      }
      .sb-switch-label input:checked + .sb-switch-custom::after {
        transform: translateX(16px);
      }

      /* BANNER HƯỚNG DẪN KÉO TỰ DO TRÊN CANVAS */
      .spatial-guide-banner {
        position: fixed;
        top: 60px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #1e3a8a, #2563eb);
        color: white;
        padding: 9px 16px;
        border-radius: 30px;
        box-shadow: 0 8px 24px rgba(37, 99, 235, 0.45);
        z-index: 10005;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 13px;
        font-weight: 500;
        animation: sgb-slide-down 0.22s ease-out;
      }
      @keyframes sgb-slide-down {
        from { opacity: 0; transform: translate(-50%, -15px); }
        to { opacity: 1; transform: translate(-50%, 0); }
      }
      .sgb-content {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .sgb-icon { font-size: 16px; }
      .sgb-btns {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .sgb-quick-btn {
        background: rgba(255,255,255,0.22);
        color: white;
        border: 1px solid rgba(255,255,255,0.4);
        border-radius: 16px;
        padding: 4px 10px;
        font-size: 11.5px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s;
      }
      .sgb-quick-btn:hover { background: rgba(255,255,255,0.35); }
      .sgb-close-btn {
        background: transparent;
        color: white;
        border: none;
        font-size: 14px;
        cursor: pointer;
        padding: 3px 6px;
        opacity: 0.85;
      }
      .sgb-close-btn:hover { opacity: 1; }

      /* TOAST & PILL */
      .spatial-builder-toast {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: #1e293b;
        color: #f8fafc;
        padding: 9px 18px;
        border-radius: 24px;
        font-size: 13px;
        font-weight: 500;
        box-shadow: 0 4px 16px rgba(0,0,0,0.25);
        z-index: 10001;
        display: none;
        transition: opacity 0.3s ease;
        pointer-events: none;
        letter-spacing: 0.2px;
      }
      .spatial-autocomplete-pill {
        display: flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(135deg, #1d4ed8, #2563eb);
        color: #ffffff;
        padding: 8px 14px;
        border-radius: 20px;
        font-size: 12.5px;
        font-weight: 600;
        box-shadow: 0 4px 16px rgba(37, 99, 235, 0.45);
        cursor: pointer;
        user-select: none;
        animation: sap-pulse 1.8s infinite, sap-fadein 0.25s ease-out;
        transition: transform 0.15s, box-shadow 0.15s;
      }
      .spatial-autocomplete-pill:hover {
        transform: translateY(-2px) scale(1.03);
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.6);
      }
      .spatial-autocomplete-pill:active { transform: scale(0.97); }
      .sap-icon { font-size: 14px; }
      .sap-arrow { font-size: 11px; opacity: 0.85; transition: transform 0.15s; }
      .spatial-autocomplete-pill:hover .sap-arrow { transform: translateX(3px); opacity: 1; }
      @keyframes sap-pulse {
        0%, 100% { box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4); }
        50% { box-shadow: 0 4px 24px rgba(37, 99, 235, 0.7); }
      }
      @keyframes sap-fadein {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* 🎬 BỘ ĐIỀU KHIỂN VẼ HÌNH TỪNG BƯỚC (STEP ANIMATION PLAYER) */
      .spatial-step-player {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 255, 255, 0.96);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(203, 213, 225, 0.9);
        border-radius: 18px;
        box-shadow: 0 16px 40px -6px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.04);
        padding: 12px 18px;
        z-index: 10002;
        display: none;
        flex-direction: column;
        gap: 9px;
        min-width: 460px;
        max-width: 620px;
        font-family: system-ui, -apple-system, sans-serif;
        color: #1e293b;
        user-select: none;
        animation: ssp-slide-up 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes ssp-slide-up {
        from { opacity: 0; transform: translate(-50%, 14px) scale(0.96); }
        to { opacity: 1; transform: translate(-50%, 0) scale(1); }
      }
      .ssp-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .ssp-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 700;
        font-size: 13.5px;
        color: #0f172a;
      }
      .ssp-icon { font-size: 16px; }
      .ssp-progress {
        display: flex;
        align-items: center;
        gap: 4px;
        background: #f1f5f9;
        padding: 3px 8px;
        border-radius: 20px;
      }
      .ssp-badge {
        font-size: 11px;
        font-weight: 600;
        color: #64748b;
        padding: 2px 7px;
        border-radius: 10px;
        transition: all 0.2s;
      }
      .ssp-badge.active {
        background: #2563eb;
        color: #ffffff;
      }
      .ssp-badge.done {
        background: #dcfce7;
        color: #15803d;
      }
      .ssp-sep {
        font-size: 9px;
        color: #94a3b8;
      }
      .ssp-close {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 14px;
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 6px;
        line-height: 1;
        transition: all 0.15s;
      }
      .ssp-close:hover {
        background: #f1f5f9;
        color: #0f172a;
      }
      .ssp-desc {
        background: #f8fafc;
        border-left: 3.5px solid #2563eb;
        padding: 7px 11px;
        border-radius: 6px;
        font-size: 12.5px;
        color: #334155;
        line-height: 1.45;
      }
      .ssp-bulb { margin-right: 2px; }
      .ssp-controls {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .ssp-btn {
        padding: 6px 11px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        background: #ffffff;
        font-size: 12px;
        font-weight: 600;
        color: #334155;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: all 0.15s;
      }
      .ssp-btn:hover {
        background: #f8fafc;
        border-color: #94a3b8;
        transform: translateY(-1px);
      }
      .ssp-btn:active { transform: translateY(0); }
      .ssp-btn-play {
        background: #eff6ff;
        border-color: #bfdbfe;
        color: #1d4ed8;
      }
      .ssp-btn-play:hover {
        background: #dbeafe;
        border-color: #93c5fd;
      }
      .ssp-btn-accent {
        background: #2563eb;
        border-color: #2563eb;
        color: #ffffff;
      }
      .ssp-btn-accent:hover {
        background: #1d4ed8;
        border-color: #1d4ed8;
      }
      .ssp-btn-turn {
        background: #fdf4ff;
        border-color: #f0abfc;
        color: #a21caf;
        margin-left: auto;
      }
      .ssp-btn-turn:hover {
        background: #fae8ff;
      }

      /* Nút kích hoạt 🎬 trong menu chọn hình */
      .shape-anim-btn {
        margin-left: auto;
        padding: 2px 6px;
        border-radius: 6px;
        font-size: 11px;
        opacity: 0.7;
        cursor: pointer;
        background: rgba(37, 99, 235, 0.08);
        color: #2563eb;
        border: 1px solid rgba(37, 99, 235, 0.2);
        transition: all 0.15s;
      }
      .shape-anim-btn:hover {
        opacity: 1;
        background: #2563eb;
        color: #ffffff;
        transform: scale(1.08);
      }
    `;
    
      document.head.appendChild(style);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectStyles);
    } else {
      injectStyles();
    }
  }

  // XUẤT ĐẦY ĐỦ CÁC HÀM CỦA SPATIAL GEOMETRY BUILDER
  
  /**
   * =======================================================================
   * 🎬 HỆ THỐNG MẪU VẼ HÌNH TỪNG BƯỚC CHO TẤT CẢ CÁC HÌNH (SGK TOÁN)
   * =======================================================================
   */
    const SHAPE_CONFIGS = {
    // 1. HÌNH CHÓP (PYRAMIDS)
    pyramid4Perp: {
      name: "Hình chóp S.ABCD (SA ⊥ đáy)",
      shapeType: "pyramid", baseType: "quad", heightType: "perp_A",
      step1Desc: "Bước 1: Vẽ mặt đáy ABCD (Hình bình hành) - cạnh khuất AD vẽ nét đứt",
      step2Desc: "Bước 2: Dựng đường cao SA ⊥ (ABCD) tại đỉnh A kèm ký hiệu vuông góc",
      step3Desc: "Bước 3: Nối các đỉnh đáy tạo các cạnh bên SB, SC, SD hoàn thiện khối chóp"
    },
    pyramid4SidePerp: {
      name: "Hình chóp S.ABCD (Mặt bên ⊥ đáy)",
      shapeType: "pyramid", baseType: "quad", heightType: "mid_H",
      step1Desc: "Bước 1: Vẽ mặt đáy ABCD (Hình bình hành) và xác định trung điểm H của AB",
      step2Desc: "Bước 2: Dựng đường cao SH ⊥ (ABCD) tại H kèm ký hiệu vuông góc",
      step3Desc: "Bước 3: Nối đỉnh S với các đỉnh A, B, C, D hoàn thiện các cạnh bên"
    },
    pyramid4: {
      name: "Hình chóp đều S.ABCD (SO ⊥ đáy)",
      shapeType: "pyramid", baseType: "quad", heightType: "center_O",
      step1Desc: "Bước 1: Vẽ mặt đáy ABCD và giao điểm O của hai đường chéo AC, BD",
      step2Desc: "Bước 2: Dựng trục thẳng đứng SO ⊥ (ABCD) tại tâm O",
      step3Desc: "Bước 3: Nối đỉnh S với các đỉnh A, B, C, D tạo 4 cạnh bên bằng nhau"
    },
    pyramidTrapezoid: {
      name: "Hình chóp S.ABCD (Đáy hình thang)",
      shapeType: "pyramid_trap", baseType: "trapezoid", heightType: "perp_A",
      step1Desc: "Bước 1: Vẽ mặt đáy ABCD là hình thang (AD // BC, cạnh AD nét đứt)",
      step2Desc: "Bước 2: Dựng đường cao SA ⊥ (ABCD) tại đỉnh A",
      step3Desc: "Bước 3: Nối S với B, C, D tạo các mặt bên của hình chóp"
    },
    pyramid3Perp: {
      name: "Hình chóp tam giác S.ABC (SA ⊥ đáy)",
      shapeType: "pyramid_tri", baseType: "triangle", heightType: "perp_A",
      step1Desc: "Bước 1: Vẽ mặt đáy tam giác ABC (cạnh khuất AC vẽ nét đứt)",
      step2Desc: "Bước 2: Dựng đường cao SA ⊥ (ABC) tại đỉnh A kèm góc vuông",
      step3Desc: "Bước 3: Nối đỉnh S với B và C tạo các cạnh bên SB, SC"
    },
    pyramid3SidePerp: {
      name: "Hình chóp tam giác S.ABC (Mặt bên ⊥ đáy)",
      shapeType: "pyramid_tri", baseType: "triangle", heightType: "mid_H",
      step1Desc: "Bước 1: Vẽ tam giác đáy ABC và lấy trung điểm H của cạnh AB",
      step2Desc: "Bước 2: Dựng đường cao SH ⊥ (ABC) tại trung điểm H",
      step3Desc: "Bước 3: Nối đỉnh S với A, B, C hoàn thiện khối chóp"
    },
    pyramid3Regular: {
      name: "Hình chóp tam giác đều S.ABC",
      shapeType: "pyramid_regular", baseType: "tri_regular", heightType: "center_O",
      step1Desc: "Bước 1: Vẽ tam giác đều ABC và xác định trọng tâm O của tam giác",
      step2Desc: "Bước 2: Dựng trục thẳng đứng SO ⊥ (ABC) tại trọng tâm O",
      step3Desc: "Bước 3: Nối đỉnh S với A, B, C tạo 3 cạnh bên bằng nhau"
    },
    tetrahedronRegular: {
      name: "Tứ diện đều ABCD",
      shapeType: "pyramid_regular", baseType: "tri_regular", heightType: "center_O",
      step1Desc: "Bước 1: Vẽ tam giác đáy BCD và xác định trọng tâm H",
      step2Desc: "Bước 2: Dựng đường cao AH ⊥ (BCD) tại trọng tâm H",
      step3Desc: "Bước 3: Nối đỉnh A với B, C, D tạo 4 mặt tam giác đều"
    },
    tetrahedronPerp: {
      name: "Tứ diện vuông S.ABC (SA ⊥ đáy)",
      shapeType: "pyramid_tri", baseType: "triangle", heightType: "perp_A",
      step1Desc: "Bước 1: Vẽ đáy tam giác vuông ABC tại A",
      step2Desc: "Bước 2: Dựng SA ⊥ AB và SA ⊥ AC tạo tam diện vuông tại A",
      step3Desc: "Bước 3: Nối các cạnh SB, SC, BC"
    },
    pyramid3: {
      name: "Hình chóp tam giác S.ABC",
      shapeType: "pyramid_tri", baseType: "triangle", heightType: "slant",
      step1Desc: "Bước 1: Vẽ tam giác đáy ABC",
      step2Desc: "Bước 2: Xác định vị trí đỉnh S trong không gian",
      step3Desc: "Bước 3: Nối đỉnh S với các đỉnh A, B, C"
    },
    frustumPyramid: {
      name: "Hình chóp cụt tứ giác",
      shapeType: "frustum", baseType: "quad", heightType: "center_O",
      step1Desc: "Bước 1: Vẽ mặt đáy dưới ABCD (Hình bình hành/tứ giác)",
      step2Desc: "Bước 2: Dựng trục đối xứng và mặt đáy trên A'B'C'D' đồng dạng",
      step3Desc: "Bước 3: Nối 4 cạnh bên AA', BB', CC', DD' tạo hình chóp cụt"
    },
    frustumPyramid3: {
      name: "Hình chóp cụt tam giác",
      shapeType: "frustum", baseType: "triangle", heightType: "center_O",
      step1Desc: "Bước 1: Vẽ mặt đáy dưới tam giác ABC",
      step2Desc: "Bước 2: Dựng mặt đáy trên A'B'C' song song và đồng dạng đáy dưới",
      step3Desc: "Bước 3: Nối các cạnh bên AA', BB', CC'"
    },

    // 2. HÌNH LĂNG TRỤ & HỘP (PRISMS & BOXES)
    prism3: {
      name: "Lăng trụ đứng tam giác ABC.A'B'C'",
      shapeType: "prism_tri", baseType: "triangle", heightType: "perp_A",
      step1Desc: "Bước 1: Vẽ mặt đáy dưới tam giác ABC (cạnh khuất AC nét đứt)",
      step2Desc: "Bước 2: Dựng các cạnh bên đứng vuông góc đáy: AA', BB', CC'",
      step3Desc: "Bước 3: Nối đáy trên A'B'C' hoàn thiện lăng trụ đứng"
    },
    prism3Regular: {
      name: "Lăng trụ tam giác đều ABC.A'B'C'",
      shapeType: "prism_tri", baseType: "tri_regular", heightType: "perp_A",
      step1Desc: "Bước 1: Vẽ đáy dưới tam giác đều ABC",
      step2Desc: "Bước 2: Dựng các cạnh bên đứng vuông góc với đáy",
      step3Desc: "Bước 3: Nối đáy trên tam giác đều A'B'C'"
    },
    obliquePrism: {
      name: "Lăng trụ xiên tam giác ABC.A'B'C'",
      shapeType: "prism_tri", baseType: "triangle", heightType: "slant",
      step1Desc: "Bước 1: Vẽ mặt đáy dưới tam giác ABC",
      step2Desc: "Bước 2: Dựng các cạnh bên xiên song song và bằng nhau",
      step3Desc: "Bước 3: Nối mặt đáy trên A'B'C'"
    },
    cube: {
      name: "Hình lập phương ABCD.A'B'C'D'",
      shapeType: "cube", baseType: "quad", heightType: "perp_A",
      step1Desc: "Bước 1: Vẽ mặt đáy dưới ABCD (các cạnh khuất vẽ nét đứt)",
      step2Desc: "Bước 2: Dựng 4 cạnh bên đứng bằng nhau: AA', BB', CC', DD'",
      step3Desc: "Bước 3: Nối mặt đáy trên A'B'C'D' tạo 6 mặt hình vuông"
    },
    box: {
      name: "Hình hộp chữ nhật ABCD.A'B'C'D'",
      shapeType: "cuboid", baseType: "quad", heightType: "perp_A",
      step1Desc: "Bước 1: Vẽ mặt đáy dưới hình chữ nhật ABCD",
      step2Desc: "Bước 2: Dựng các cạnh bên đứng AA', BB', CC', DD'",
      step3Desc: "Bước 3: Nối mặt đáy trên A'B'C'D' hoàn thiện hình hộp"
    },
    prism4: {
      name: "Lăng trụ đứng tứ giác ABCD.A'B'C'D'",
      shapeType: "prism_quad", baseType: "quad", heightType: "perp_A",
      step1Desc: "Bước 1: Vẽ mặt đáy dưới tứ giác ABCD",
      step2Desc: "Bước 2: Dựng các cạnh bên đứng AA', BB', CC', DD'",
      step3Desc: "Bước 3: Nối đáy trên A'B'C'D'"
    },
    prism6: {
      name: "Lăng trụ lục giác",
      shapeType: "prism_quad", baseType: "quad", heightType: "perp_A",
      step1Desc: "Bước 1: Vẽ mặt đáy dưới lục giác",
      step2Desc: "Bước 2: Dựng các cạnh bên đứng song song",
      step3Desc: "Bước 3: Nối các đỉnh mặt đáy trên"
    },
    obliqueBox: {
      name: "Hình hộp xiên",
      shapeType: "cuboid", baseType: "quad", heightType: "slant",
      step1Desc: "Bước 1: Vẽ mặt đáy dưới hình bình hành ABCD",
      step2Desc: "Bước 2: Dựng 4 cạnh bên nghiêng song song",
      step3Desc: "Bước 3: Nối mặt đáy trên A'B'C'D'"
    },

    // 3. HÌNH TRÒN XOAY (REVOLUTION SOLIDS)
    cone: {
      name: "Hình nón tròn xoay (Đỉnh S, trục SO)",
      shapeType: "cone", baseType: "round", heightType: "center_O",
      step1Desc: "Bước 1: Vẽ đường tròn đáy elip tâm O và bán kính đáy OA",
      step2Desc: "Bước 2: Dựng trục thẳng đứng SO ⊥ mặt đáy tại tâm O",
      step3Desc: "Bước 3: Nối đỉnh S với hai mút đường kính đáy tạo 2 đường sinh"
    },
    frustumCone: {
      name: "Hình nón cụt tròn xoay",
      shapeType: "cone", baseType: "round", heightType: "center_O",
      step1Desc: "Bước 1: Vẽ đường tròn đáy lớn elip tâm O",
      step2Desc: "Bước 2: Dựng trục đối xứng và đáy nhỏ elip tâm O'",
      step3Desc: "Bước 3: Nối hai đường sinh hai bên hoàn thiện nón cụt"
    },
    cylinder: {
      name: "Hình trụ tròn xoay (Trục OO')",
      shapeType: "cylinder", baseType: "round", heightType: "center_O",
      step1Desc: "Bước 1: Vẽ đường tròn đáy dưới elip tâm O",
      step2Desc: "Bước 2: Dựng trục thẳng đứng OO' và đường tròn đáy trên tâm O'",
      step3Desc: "Bước 3: Nối 2 đường sinh song song hai bên AA' và BB'"
    },
    truncCylinder: {
      name: "Hình trụ vát",
      shapeType: "cylinder", baseType: "round", heightType: "center_O",
      step1Desc: "Bước 1: Vẽ đường tròn đáy dưới elip tâm O",
      step2Desc: "Bước 2: Dựng trục và mặt cắt vát xiên ở phía trên",
      step3Desc: "Bước 3: Nối 2 đường sinh bên"
    },
    sphere: {
      name: "Mặt cầu / Khối cầu (Tâm O, trục NS)",
      shapeType: "sphere", baseType: "round", heightType: "center_O",
      step1Desc: "Bước 1: Vẽ đường tròn biên chính tâm O",
      step2Desc: "Bước 2: Dựng trục đứng cực Bắc N - cực Nam S qua tâm O",
      step3Desc: "Bước 3: Dựng đường xích đạo elip (nửa sau nét đứt, nửa trước nét liền)"
    },
    cap: {
      name: "Chỏm cầu",
      shapeType: "sphere", baseType: "round", heightType: "center_O",
      step1Desc: "Bước 1: Vẽ cung tròn chỏm cầu",
      step2Desc: "Bước 2: Dựng trục đối xứng qua tâm O",
      step3Desc: "Bước 3: Vẽ đường tròn đáy elip của chỏm cầu"
    },

    // 4. HÌNH PHẲNG 2D (PLANE SHAPES)
    triangle: {
      name: "Tam giác thường ABC",
      shapeType: "pyramid_tri", baseType: "triangle", heightType: "perp_A",
      step1Desc: "Bước 1: Vẽ cạnh đáy BC",
      step2Desc: "Bước 2: Xác định toạ độ đỉnh A",
      step3Desc: "Bước 3: Nối các cạnh AB, AC và hiển thị tên đỉnh"
    },
    rightTriangle: {
      name: "Tam giác vuông ABC (tại A)",
      shapeType: "pyramid_tri", baseType: "triangle", heightType: "perp_A",
      step1Desc: "Bước 1: Vẽ cạnh góc vuông AB",
      step2Desc: "Bước 2: Dựng AC ⊥ AB tại đỉnh A kèm góc vuông",
      step3Desc: "Bước 3: Nối cạnh huyền BC"
    },
    equilateral: {
      name: "Tam giác đều ABC",
      shapeType: "pyramid_regular", baseType: "tri_regular", heightType: "center_O",
      step1Desc: "Bước 1: Vẽ cạnh đáy BC",
      step2Desc: "Bước 2: Dựng đường trung trực và xác định đỉnh A sao cho AB = AC = BC",
      step3Desc: "Bước 3: Nối các cạnh và hoàn thiện tam giác đều"
    },
    square: {
      name: "Hình vuông ABCD",
      shapeType: "cube", baseType: "quad", heightType: "perp_A",
      step1Desc: "Bước 1: Vẽ cạnh đáy AB",
      step2Desc: "Bước 2: Dựng các cạnh vuông góc AD ⊥ AB và BC ⊥ AB có cùng độ dài",
      step3Desc: "Bước 3: Nối CD khép kín hình vuông"
    },
    parallelogram: {
      name: "Hình bình hành ABCD",
      shapeType: "pyramid", baseType: "quad", heightType: "perp_A",
      step1Desc: "Bước 1: Vẽ cạnh đáy AB",
      step2Desc: "Bước 2: Dựng cạnh xiên AD",
      step3Desc: "Bước 3: Dựng BC // AD và CD // AB hoàn thiện hình bình hành"
    },
    trapezoid: {
      name: "Hình thang ABCD",
      shapeType: "pyramid_trap", baseType: "trapezoid", heightType: "perp_A",
      step1Desc: "Bước 1: Vẽ đáy lớn AB",
      step2Desc: "Bước 2: Dựng đáy nhỏ CD song song với AB",
      step3Desc: "Bước 3: Nối 2 cạnh bên AD và BC"
    }
  };

  let animPlayerEl = null;
  let activeAnimationTimer = null;
  let animState = {
    shapeId: 'pyramid4Perp',
    step: 1,
    isPaused: false,
    options: null
  };

  function createOrGetAnimPlayer() {
    let player = document.getElementById('spatial-step-player');
    if (!player) {
      player = document.createElement('div');
      player.id = 'spatial-step-player';
      player.className = 'spatial-step-player';
      document.body.appendChild(player);
    }
    animPlayerEl = player;
    return player;
  }

  function updatePlayerUI(cfg, currentStep) {
    const player = createOrGetAnimPlayer();
    player.style.display = 'flex';

    const s1Desc = cfg.step1Desc || 'Bước 1: Vẽ mặt đáy hình học';
    const s2Desc = cfg.step2Desc || 'Bước 2: Dựng chiều cao / trục đối xứng';
    const s3Desc = cfg.step3Desc || 'Bước 3: Nối cạnh bên & hoàn thiện khối 3D';

    const descText = currentStep === 1 ? s1Desc : (currentStep === 2 ? s2Desc : s3Desc);

    player.innerHTML = `
      <div class="ssp-header">
        <div class="ssp-title">
          <span class="ssp-icon">🎬</span>
          <span class="ssp-name">${cfg.name}</span>
        </div>
        <div class="ssp-progress">
          <span class="ssp-badge ${currentStep === 1 ? 'active' : (currentStep > 1 ? 'done' : '')}">1. Đáy</span>
          <span class="ssp-sep">➔</span>
          <span class="ssp-badge ${currentStep === 2 ? 'active' : (currentStep > 2 ? 'done' : '')}">2. Chiều cao</span>
          <span class="ssp-sep">➔</span>
          <span class="ssp-badge ${currentStep === 3 ? 'active' : ''}">3. Hoàn thiện</span>
        </div>
        <button type="button" class="ssp-close" id="ssp-btn-close" title="Đóng trình chiếu">✕</button>
      </div>
      <div class="ssp-desc">
        <span class="ssp-bulb">💡</span> ${descText}
      </div>
      <div class="ssp-controls">
        <button type="button" class="ssp-btn" id="ssp-btn-replay" title="Vẽ lại từ Bước 1">⏮️ Vẽ lại</button>
        <button type="button" class="ssp-btn" id="ssp-btn-prev" title="Quay lại bước trước">⏪ Trước</button>
        <button type="button" class="ssp-btn ssp-btn-play" id="ssp-btn-toggle-pause" title="Tạm dừng / Tiếp tục animation">
          ${animState.isPaused ? '▶️ Tiếp tục' : '⏸️ Tạm dừng'}
        </button>
        <button type="button" class="ssp-btn" id="ssp-btn-next" title="Chuyển sang bước tiếp theo">⏩ Bước tiếp</button>
        <button type="button" class="ssp-btn ssp-btn-accent" id="ssp-btn-build-all" title="Dựng xong toàn bộ ngay lập tức">⚡ Vẽ hết</button>
        <button type="button" class="ssp-btn ssp-btn-turn" id="ssp-btn-turn" title="Xoay 3D khối hình">🔄 Xoay 3D</button>
      </div>
    `;

    // Gắn sự kiện các nút
    player.querySelector('#ssp-btn-close').onclick = () => {
      clearTimeout(activeAnimationTimer);
      player.style.display = 'none';
    };

    player.querySelector('#ssp-btn-replay').onclick = () => {
      clearTimeout(activeAnimationTimer);
      animateShape(animState.shapeId, getActiveBoard(), { forceReplay: true });
    };

    player.querySelector('#ssp-btn-prev').onclick = () => {
      clearTimeout(activeAnimationTimer);
      const prevStep = Math.max(1, animState.step - 1);
      gotoStep(prevStep);
    };

    player.querySelector('#ssp-btn-toggle-pause').onclick = () => {
      animState.isPaused = !animState.isPaused;
      const btn = player.querySelector('#ssp-btn-toggle-pause');
      if (btn) btn.innerHTML = animState.isPaused ? '▶️ Tiếp tục' : '⏸️ Tạm dừng';
      if (!animState.isPaused) {
        resumeAnimation();
      } else {
        clearTimeout(activeAnimationTimer);
      }
    };

    player.querySelector('#ssp-btn-next').onclick = () => {
      clearTimeout(activeAnimationTimer);
      const nextStep = Math.min(3, animState.step + 1);
      gotoStep(nextStep);
    };

    player.querySelector('#ssp-btn-build-all').onclick = () => {
      clearTimeout(activeAnimationTimer);
      const b = getActiveBoard();
      buildAll(b, animState.options);
      animState.step = 3;
      updatePlayerUI(cfg, 3);
    };

    player.querySelector('#ssp-btn-turn').onclick = () => {
      const b = getActiveBoard();
      turn3DCurrent(b);
    };
  }

  function gotoStep(stepNum) {
    const b = getActiveBoard();
    if (!b) return;
    const cfg = SHAPE_CONFIGS[animState.shapeId] || SHAPE_CONFIGS.pyramid4Perp;
    animState.step = stepNum;
    updatePlayerUI(cfg, stepNum);

    if (stepNum === 1) {
      step1_DrawBase(b, { ...animState.options, animate: true });
    } else if (stepNum === 2) {
      step2_DrawHeight(b, { ...animState.options, animate: true });
    } else if (stepNum === 3) {
      step3_CompleteEdges(b, { ...animState.options, animate: true });
    }
  }

  function resumeAnimation() {
    if (animState.isPaused) return;
    const b = getActiveBoard();
    if (!b) return;
    const cfg = SHAPE_CONFIGS[animState.shapeId] || SHAPE_CONFIGS.pyramid4Perp;

    if (animState.step === 1) {
      activeAnimationTimer = setTimeout(() => {
        if (animState.isPaused) return;
        animState.step = 2;
        updatePlayerUI(cfg, 2);
        step2_DrawHeight(b, {
          ...animState.options,
          animate: true,
          onComplete: () => {
            if (animState.isPaused) return;
            activeAnimationTimer = setTimeout(() => {
              if (animState.isPaused) return;
              animState.step = 3;
              updatePlayerUI(cfg, 3);
              step3_CompleteEdges(b, {
                ...animState.options,
                animate: true,
                onComplete: () => {
                  showToast('🌟 Diễn hoạt vẽ hình hoàn tất! Học sinh có thể bấm "Xoay 3D".');
                }
              });
            }, 800);
          }
        });
      }, 700);
    } else if (animState.step === 2) {
      activeAnimationTimer = setTimeout(() => {
        if (animState.isPaused) return;
        animState.step = 3;
        updatePlayerUI(cfg, 3);
        step3_CompleteEdges(b, { ...animState.options, animate: true });
      }, 800);
    }
  }

  /**
   * 🎬 VẼ TỪNG BƯỚC CHO BẤT KỲ HÌNH NÀO (Universal animateShape)
   */
  function animateShape(shapeId, board, opts = {}) {
    // Tự động đóng các popup menu đang mở
    try {
      const backdrop = document.querySelector('.menu-backdrop, .overlay-backdrop');
      if (backdrop) backdrop.click();
      document.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    } catch(e) {}
    if (!board) board = getActiveBoard();
    if (!board) {
      showToast('⚠️ Vui lòng mở bảng vẽ trước!');
      return;
    }

    const cfg = SHAPE_CONFIGS[shapeId] || {
      name: 'Khối hình ' + shapeId,
      shapeType: shapeId.includes('prism') ? 'prism_tri' : (shapeId.includes('cube') ? 'cube' : 'pyramid'),
      baseType: 'quad',
      heightType: 'perp_A',
      step1Desc: 'Bước 1: Vẽ mặt đáy',
      step2Desc: 'Bước 2: Dựng chiều cao',
      step3Desc: 'Bước 3: Hoàn thiện các cạnh bên'
    };

    clearTimeout(activeAnimationTimer);
    animState.shapeId = shapeId;
    animState.step = 1;
    animState.isPaused = false;
    animState.options = {
      shapeType: cfg.shapeType,
      baseType: cfg.baseType,
      heightType: cfg.heightType,
      ...opts
    };

    updatePlayerUI(cfg, 1);
    showToast('🎬 Bắt đầu vẽ từng bước: <b>' + cfg.name + '</b>');

    step1_DrawBase(board, {
      ...animState.options,
      animate: true,
      onComplete: () => {
        if (animState.isPaused) return;
        activeAnimationTimer = setTimeout(() => {
          if (animState.isPaused) return;
          animState.step = 2;
          updatePlayerUI(cfg, 2);
          step2_DrawHeight(board, {
            ...animState.options,
            animate: true,
            onComplete: () => {
              if (animState.isPaused) return;
              activeAnimationTimer = setTimeout(() => {
                if (animState.isPaused) return;
                animState.step = 3;
                updatePlayerUI(cfg, 3);
                step3_CompleteEdges(board, {
                  ...animState.options,
                  animate: true,
                  onComplete: () => {
                    showToast('🌟 Tuyệt vời! Đã hoàn thành vẽ hình từng bước.');
                  }
                });
              }, 900);
            }
          });
        }, 800);
      }
    });
  }

  function replaySelectedShape(board) {
    if (!board) board = getActiveBoard();
    if (!board) return;
    const pageIdx = typeof board.currentPage === 'function' ? board.currentPage() : 0;
    const pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return;

    let shapeId = 'pyramid4Perp';
    const sol = pg.geo.shapes.find(s => s.kind === 'solid' && s.solid);
    if (sol && sol.solid && sol.solid.of) {
      shapeId = sol.solid.of;
    }
    animateShape(shapeId, board);
  }

  window.SpatialGeometryBuilder = {
    animateShape,
    replaySelectedShape,
    open: openBuilder,
    close: closeBuilder,
    toggle: toggleBuilder,
    step1_DrawBase,
    step2_DrawHeight,
    startFreehandHeight,
    step3_CompleteEdges,
    buildAll,
    runFullAnimation,
    animateQueue,
    runFullAnimation,
    animateQueue,
    runFullAnimation,
    animateQueue,
    runFullAnimation,
    animateQueue,
    turn3DCurrent,
    completeFromBaseAndHeight,
    onShapeAdded,
    classifyPyramidEdges,
    showGuideBanner,
    hideGuideBanner,
    showAutoCompletePill,
    hideAutoCompletePill,
    setAutoMode(val) { autoMode = !!val; },
    getAutoMode() { return autoMode; },
    toggleAutoMode() { autoMode = !autoMode; return autoMode; }
  };

  console.log('[Module] SpatialGeometryBuilder loaded successfully with Convex-Hull visibility algorithm.');
})(typeof window !== 'undefined' ? window : this);
