/**
 * =======================================================================
 * 🏗️ SPATIAL GEOMETRY BUILDER MODULE (Study Note AI)
 * Dựng hình học không gian từng bước chuẩn SGK Việt Nam:
 * - Bước 1: Vẽ mặt đáy (Tứ giác / Hình bình hành, Tam giác thường, Tam giác đều, Hình thang...)
 * - Bước 2: Dựng chiều cao TỰ DO HOÀN TOÀN (Kéo chuột/bút trên bảng vẽ hoặc dựng mẫu)
 * - Bước 3: Nối cạnh bên hoàn thiện & tự động phân tích nét khuất / nét đứt / xoay 3D!
 * 
 * ĐẶC BIỆT: Hỗ trợ TỰ VẼ ĐÁY ➔ KÉO CHIỀU CAO TỰ DO ➔ TỰ ĐỘNG HOÀN THIỆN!
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
    shapeType: 'pyramid', // 'pyramid' | 'prism'
    baseType: 'quad',     // 'quad' | 'triangle' | 'tri_regular' | 'trapezoid'
    heightType: 'freehand', // 'freehand' (vẽ tự do) | 'perp_A' | 'mid_H' | 'center_O' | 'slant'
    heightVal: 150,
    waitingFreeHeight: false, // Đang chờ người dùng kéo đường cao tự do trên bảng vẽ
    groupId: null,
    basePtIds: [],
    heightPtId: null,
    apexPtId: null,
    page: 0
  };

  let autoMode = true; // Tự động hoàn thiện khi phát hiện đường cao vừa vẽ

  /**
   * BƯỚC 1: DỰNG MẶT ĐÁY HÌNH HỌC KHÔNG GIAN
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

    const baseType = options.baseType || currentBuild.baseType || 'quad';
    const shapeType = options.shapeType || currentBuild.shapeType || 'pyramid';
    const groupId = 'spatial_grp_' + Date.now();
    const center = options.center || { x: vp.x, y: vp.y };

    const W = 160;
    const D = W * 0.72;

    const pointsList = [];
    const shapes = [];
    const basePtIds = [];

    if (baseType === 'quad') {
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
      shapes.push(
        { id: uid('seg'), kind: 'segment', pts: [idA, idB], dashed: true, color: '#1e293b', width: 1.8, group: groupId },
        { id: uid('seg'), kind: 'segment', pts: [idA, idD], dashed: true, color: '#1e293b', width: 1.8, group: groupId },
        { id: uid('seg'), kind: 'segment', pts: [idB, idC], color: '#1e293b', width: 2.0, group: groupId },
        { id: uid('seg'), kind: 'segment', pts: [idC, idD], color: '#1e293b', width: 2.0, group: groupId }
      );
    } else if (baseType === 'triangle' || baseType === 'tri_regular') {
      const isRegular = baseType === 'tri_regular';
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
      shapes.push(
        { id: uid('seg'), kind: 'segment', pts: [idA, idC], dashed: true, color: '#1e293b', width: 1.8, group: groupId },
        { id: uid('seg'), kind: 'segment', pts: [idA, idB], color: '#1e293b', width: 2.0, group: groupId },
        { id: uid('seg'), kind: 'segment', pts: [idB, idC], color: '#1e293b', width: 2.0, group: groupId }
      );
    } else if (baseType === 'trapezoid') {
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
      shapes.push(
        { id: uid('seg'), kind: 'segment', pts: [idA, idB], dashed: true, color: '#1e293b', width: 1.8, group: groupId },
        { id: uid('seg'), kind: 'segment', pts: [idA, idD], dashed: true, color: '#1e293b', width: 1.8, group: groupId },
        { id: uid('seg'), kind: 'segment', pts: [idB, idC], color: '#1e293b', width: 2.0, group: groupId },
        { id: uid('seg'), kind: 'segment', pts: [idC, idD], color: '#1e293b', width: 2.0, group: groupId }
      );
    }

    board.commit(board.addGeo(pageIdx, pointsList, shapes));

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
      apexPtId: null
    };

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
    showToast('✅ Bước 1: Đã vẽ đáy! Bạn có thể kéo đường cao tự do trên bảng vẽ.');
    console.log('[SpatialBuilder] Bước 1 vẽ đáy thành công:', baseType, 'tại trang', pageIdx);
  }

  /**
   * BẬT CHẾ ĐỘ VẼ CHIỀU CAO TỰ DO TRÊN BẢNG VẼ
   */
  function startFreehandHeight(board) {
    if (!board) board = getActiveBoard();
    if (!board) return;

    // Nếu chưa có đáy, vẽ đáy trước
    if (!currentBuild.active || currentBuild.stage === 'none' || !currentBuild.basePtIds.length) {
      step1_DrawBase(board);
    }

    currentBuild.waitingFreeHeight = true;

    // Chuyển sang công cụ vẽ đoạn thẳng
    if (typeof board.setTool === 'function') {
      board.setTool({ k: 'shape', t: 'segment' });
    }

    // Hiển thị banner hướng dẫn kéo tự do
    showGuideBanner(board);

    // Tự động thu gọn bảng điều khiển sang cạnh để không che tầm nhìn
    if (builderPanelEl) {
      builderPanelEl.classList.add('minimized');
    }

    showToast('✍️ Hãy kéo chuột/bút từ mặt đáy lên đỉnh S theo độ cao bạn muốn!');
  }

  /**
   * BƯỚC 2: DỰNG CHIỀU CAO (HỖ TRỢ CẢ VẼ TỰ DO LẪN DỰNG MẪU)
   */
  function step2_DrawHeight(board, options = {}) {
    if (!board) board = getActiveBoard();
    if (!board) return;

    const heightType = options.heightType || currentBuild.heightType || 'freehand';

    // NẾU LÀ CHẾ ĐỘ VẼ TỰ DO ➔ BẬT CHẾ ĐỘ KÉO CHUỘT/BÚT TRÊN CANVAS
    if (heightType === 'freehand') {
      startFreehandHeight(board);
      return;
    }

    // NẾU LÀ DỰNG MẪU (perp_A, mid_H, center_O, slant)
    if (!currentBuild.active || currentBuild.stage === 'none' || !currentBuild.basePtIds.length) {
      step1_DrawBase(board, options);
    }

    const pageIdx = currentBuild.page;
    const pg = board.doc.pages[pageIdx];
    if (!pg || !pg.geo) return;

    const H_val = options.heightVal || currentBuild.heightVal || 150;
    const groupId = currentBuild.groupId;
    const basePtIds = currentBuild.basePtIds;
    const pointsMap = pg.geo.points;

    const newPoints = [];
    const newShapes = [];

    let footPtId = null;
    let footPos = null;

    if (heightType === 'perp_A') {
      footPtId = basePtIds[0];
      const pA = pointsMap[footPtId];
      footPos = { x: pA.def.x, y: pA.def.y, z: pA.z || 0 };
    } else if (heightType === 'mid_H') {
      const p1 = pointsMap[basePtIds[0]];
      const p2 = pointsMap[basePtIds[1]];
      footPtId = uid('pt_H');
      footPos = { x: Math.round((p1.def.x + p2.def.x) / 2), y: Math.round((p1.def.y + p2.def.y) / 2), z: 0 };
      newPoints.push({
        id: footPtId,
        def: { t: 'free', x: footPos.x, y: footPos.y },
        z: 0,
        label: 'H',
        show: true,
        group: groupId
      });
      if (basePtIds.length >= 3) {
        newShapes.push({
          id: uid('seg_aux'),
          kind: 'segment',
          pts: [footPtId, basePtIds[2]],
          dashed: true,
          aux: true,
          color: '#64748b',
          width: 1.4,
          group: groupId
        });
      }
    } else if (heightType === 'center_O') {
      footPtId = uid('pt_O');
      if (basePtIds.length === 4) {
        const pA = pointsMap[basePtIds[0]], pC = pointsMap[basePtIds[2]];
        const pB = pointsMap[basePtIds[1]], pD = pointsMap[basePtIds[3]];
        footPos = { x: Math.round((pA.def.x + pC.def.x) / 2), y: Math.round((pA.def.y + pC.def.y) / 2), z: 0 };
        newShapes.push(
          { id: uid('seg_diag1'), kind: 'segment', pts: [basePtIds[0], basePtIds[2]], dashed: true, aux: true, color: '#94a3b8', width: 1.2, group: groupId },
          { id: uid('seg_diag2'), kind: 'segment', pts: [basePtIds[1], basePtIds[3]], dashed: true, aux: true, color: '#94a3b8', width: 1.2, group: groupId }
        );
      } else {
        const pA = pointsMap[basePtIds[0]], pB = pointsMap[basePtIds[1]], pC = pointsMap[basePtIds[2]];
        footPos = { x: Math.round((pA.def.x + pB.def.x + pC.def.x) / 3), y: Math.round((pA.def.y + pB.def.y + pC.def.y) / 3), z: 0 };
      }
      newPoints.push({
        id: footPtId,
        def: { t: 'free', x: footPos.x, y: footPos.y },
        z: 0,
        label: 'O',
        show: true,
        group: groupId
      });
    } else { // 'slant' (chiều cao xiên)
      footPtId = basePtIds[0];
      const pA = pointsMap[footPtId];
      footPos = { x: pA.def.x, y: pA.def.y, z: pA.z || 0 };
    }

    const apexPtId = uid('pt_S');
    const slantDx = (heightType === 'slant') ? 45 : 0;
    const apexPos = { x: footPos.x + slantDx, y: footPos.y - H_val, z: H_val };

    newPoints.push({
      id: apexPtId,
      def: { t: 'free', x: apexPos.x, y: apexPos.y },
      z: H_val,
      label: currentBuild.shapeType === 'prism' ? "A'" : "S",
      show: true,
      group: groupId
    });

    const isPerpEdge = (heightType === 'perp_A' && currentBuild.baseType === 'triangle');
    const segHeightId = uid('seg_height');
    newShapes.push({
      id: segHeightId,
      kind: 'segment',
      pts: [apexPtId, footPtId],
      dashed: !isPerpEdge,
      color: '#dc2626',
      width: 2.2,
      group: groupId
    });

    const refPtId = basePtIds.find(id => id !== footPtId);
    if (refPtId && heightType !== 'slant') {
      newShapes.push({
        id: uid('right_angle'),
        kind: 'right',
        pts: [apexPtId, footPtId, refPtId],
        aux: true,
        color: '#dc2626',
        width: 1.5,
        group: groupId
      });
    }

    board.commit(board.addGeo(pageIdx, newPoints, newShapes));

    currentBuild.stage = 'height';
    currentBuild.heightPtId = footPtId;
    currentBuild.apexPtId = apexPtId;
    currentBuild.heightType = heightType;
    currentBuild.heightVal = H_val;
    currentBuild.waitingFreeHeight = false;

    // ĐẶT CÔNG CỤ CHỌN VÀ CHỌN ĐỈNH S ĐỂ NGƯỜI DÙNG KÉO THẢ TỰ DO ĐƯỢC NGAY!
    if (typeof board.setTool === 'function') {
      board.setTool({ k: 'select' });
    }

    board.sel = {
      page: pageIdx,
      strokes: new Set(),
      items: new Set(),
      points: new Set([apexPtId]), // Chọn sẵn đỉnh S để kéo thả tự do!
      shapes: new Set([segHeightId])
    };
    board.redraw();
    board.emit();

    hideGuideBanner();
    if (builderPanelEl) {
      builderPanelEl.classList.remove('minimized');
    }
    updateBuilderUI();
    showToast('✨ Đã dựng chiều cao! Bạn có thể kéo đỉnh S trên bảng để chỉnh độ cao tự do.');
    console.log('[SpatialBuilder] Bước 2 dựng chiều cao thành công');
  }

  /**
   * BƯỚC 3: NỐI CÁC CẠNH BÊN HOÀN THIỆN KHỐI 3D
   */
  function step3_CompleteEdges(board) {
    if (!board) board = getActiveBoard();
    if (!board) return;

    if (!currentBuild.active || !currentBuild.apexPtId) {
      step2_DrawHeight(board, { heightType: 'perp_A' });
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

    if (shapeType === 'pyramid') {
      basePtIds.forEach((pid, idx) => {
        const alreadyHasEdge = existingShapes.some(s => s.kind === 'segment' && (
          (s.pts[0] === apexPtId && s.pts[1] === pid) ||
          (s.pts[1] === apexPtId && s.pts[0] === pid)
        ));
        if (alreadyHasEdge) return;

        const isHidden = (idx === 0 && currentBuild.heightType !== 'perp_A');
        newShapes.push({
          id: uid('seg_lat'),
          kind: 'segment',
          pts: [apexPtId, pid],
          dashed: isHidden,
          color: '#1e293b',
          width: 1.8,
          group: groupId
        });
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
    } else if (shapeType === 'prism') {
      const apexP = pointsMap[apexPtId];
      const base0P = pointsMap[basePtIds[0]];
      const dx = apexP.def.x - base0P.def.x;
      const dy = apexP.def.y - base0P.def.y;
      const H_val = currentBuild.heightVal;

      const topPtIds = [apexPtId];
      for (let i = 1; i < basePtIds.length; i++) {
        const bPt = pointsMap[basePtIds[i]];
        const tId = uid('pt_' + bPt.label + "'");
        newPoints.push({
          id: tId,
          def: { t: 'free', x: bPt.def.x + dx, y: bPt.def.y + dy },
          z: H_val,
          label: bPt.label + "'",
          show: true,
          group: groupId
        });
        topPtIds.push(tId);
        allPtIds.push(tId);

        newShapes.push({
          id: uid('seg_lat'),
          kind: 'segment',
          pts: [basePtIds[i], tId],
          color: '#1e293b',
          width: 1.8,
          group: groupId
        });
      }

      for (let i = 0; i < topPtIds.length; i++) {
        const next = (i + 1) % topPtIds.length;
        newShapes.push({
          id: uid('seg_top'),
          kind: 'segment',
          pts: [topPtIds[i], topPtIds[next]],
          color: '#1e293b',
          width: 1.8,
          group: groupId
        });
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
    }

    board.commit(board.addGeo(pageIdx, newPoints, newShapes));

    currentBuild.stage = 'complete';
    currentBuild.waitingFreeHeight = false;

    const curPage = board.doc.pages[pageIdx];
    const grpShapes = curPage.geo.shapes.filter(s => s.group === groupId && !s.hidden).map(s => s.id);
    
    // Đặt công cụ chọn và chọn toàn bộ hình
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
    showToast('🎉 Bước 3: Đã hoàn tất dựng hình 3D! Bạn có thể kéo đỉnh S để chỉnh chiều cao hoặc bấm "Xoay 3D".');
    console.log('[SpatialBuilder] Bước 3 hoàn thành khối 3D!');
  }

  function buildAll(board, options = {}) {
    step1_DrawBase(board, options);
    step2_DrawHeight(board, { ...options, heightType: options.heightType === 'freehand' ? 'perp_A' : options.heightType });
    step3_CompleteEdges(board);
  }

  function turn3DCurrent(board) {
    if (!board) board = getActiveBoard();
    if (!board) return;
    if (typeof board.startTurning === 'function') {
      board.startTurning();
    }
  }

  /**
   * =======================================================================
   * TỰ ĐỘNG HOÀN THIỆN KHI NGƯỜI DÙNG TỰ VẼ ĐÁY ➔ CHIỀU CAO TỰ DO
   * =======================================================================
   */
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
    if (targetHeightSegId) {
      heightSeg = shapes.find(s => s.id === targetHeightSegId && s.kind === 'segment');
    }

    // Nếu người dùng đang quét chọn (selection):
    if (!heightSeg && board.sel && board.sel.shapes && board.sel.shapes.size) {
      const selSegs = shapes.filter(s => board.sel.shapes.has(s.id) && s.kind === 'segment');
      let maxDy = 0;
      for (const seg of selSegs) {
        if (!seg.pts || seg.pts.length < 2) continue;
        const p1 = getPt2D(pointsMap[seg.pts[0]]);
        const p2 = getPt2D(pointsMap[seg.pts[1]]);
        if (p1 && p2) {
          const dy = Math.abs(p1.y - p2.y);
          if (dy > 20 && dy > maxDy) {
            maxDy = dy;
            heightSeg = seg;
          }
        }
      }
    }

    // Nếu không có trong selection, tìm đoạn thẳng mới vẽ gần đây có độ cao rõ rệt
    if (!heightSeg) {
      for (let i = shapes.length - 1; i >= 0; i--) {
        const seg = shapes[i];
        if (seg.kind !== 'segment' || !seg.pts || seg.pts.length < 2) continue;
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

    // 2. Tìm mặt đáy (Đa giác hoặc các đoạn thẳng đáy)
    let basePtIds = [];
    let baseShape = null;

    // A. Nếu có currentBuild và có sẵn basePtIds:
    if (currentBuild.active && currentBuild.basePtIds && currentBuild.basePtIds.length >= 3) {
      basePtIds = [...currentBuild.basePtIds];
    }

    // B. Tìm đa giác polygon có chứa footId hoặc nằm ngay dưới footId
    if (!basePtIds.length) {
      const polygons = shapes.filter(s => s.kind === 'polygon' && s.pts && s.pts.length >= 3);
      for (const poly of polygons) {
        if (poly.pts.includes(footId)) {
          baseShape = poly;
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
              baseShape = poly;
              basePtIds = [...poly.pts];
              break;
            }
          }
        }
      }
    }

    // C. Nếu không có polygon, tìm các đoạn thẳng segment nối đáy
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

    // D. Nếu người dùng đang chọn điểm:
    if (!basePtIds.length && board.sel && board.sel.points && board.sel.points.size >= 3) {
      basePtIds = Array.from(board.sel.points).filter(id => id !== apexId);
    }

    if (basePtIds.length < 3) return false;

    // Snap footId vào điểm đáy gần nhất nếu khoảng cách < 35px
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

    // Tìm đỉnh khuất phía sau trong đáy (đỉnh có y nhỏ nhất)
    let hiddenBasePtId = null;
    let minBaseY = Infinity;
    for (const bId of basePtIds) {
      const p = getPt2D(pointsMap[bId]);
      if (p && p.y < minBaseY) {
        minBaseY = p.y;
        hiddenBasePtId = bId;
      }
    }

    const groupId = currentBuild.groupId || ('spatial_auto_' + Date.now());

    // Cập nhật z-coordinate và group
    basePtIds.forEach(bId => {
      pointsMap[bId] = { ...pointsMap[bId], z: 0, group: groupId };
    });
    // Điểm S là điểm tự do có z = chiều cao thực tế
    pointsMap[apexId] = { ...pointsMap[apexId], z: heightVal, group: groupId };

    const footIsHidden = (footId === hiddenBasePtId) || (dist2D(footP, getPt2D(pointsMap[hiddenBasePtId])) < 35);

    // Cập nhật các đường nét hiện hữu
    const updatedShapes = shapes.map(s => {
      if (s.id === heightSeg.id) {
        return {
          ...s,
          pts: [apexId, footId],
          dashed: footIsHidden,
          color: '#dc2626',
          width: 2.2,
          group: groupId
        };
      }
      if (s.kind === 'segment' && s.pts && hiddenBasePtId && s.pts.includes(hiddenBasePtId) && s.id !== heightSeg.id) {
        return { ...s, dashed: true, group: groupId };
      }
      if (baseShape && s.id === baseShape.id) {
        return { ...s, group: groupId };
      }
      return s;
    });

    // Nối các cạnh bên còn thiếu
    const newLateralEdges = [];
    basePtIds.forEach(bId => {
      if (bId === footId) return;
      const hasEdge = updatedShapes.some(s => s.kind === 'segment' && (
        (s.pts[0] === apexId && s.pts[1] === bId) ||
        (s.pts[1] === apexId && s.pts[0] === bId)
      ));
      if (hasEdge) return;

      const isHiddenEdge = (bId === hiddenBasePtId);
      newLateralEdges.push({
        id: uid('seg_lat'),
        kind: 'segment',
        pts: [apexId, bId],
        dashed: isHiddenEdge,
        color: '#1e293b',
        width: 1.8,
        group: groupId
      });
    });

    // Thêm ký hiệu góc vuông tại chân đường cao nếu dốc thẳng đứng
    const rightAngleShapes = [];
    const refPtId = basePtIds.find(id => id !== footId);
    if (refPtId) {
      rightAngleShapes.push({
        id: uid('right_mark'),
        kind: 'right',
        pts: [apexId, footId, refPtId],
        aux: true,
        color: '#dc2626',
        width: 1.5,
        group: groupId
      });
    }

    // Đóng gói khối 3D để xoay được
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

    const finalShapes = [...updatedShapes, ...newLateralEdges, ...rightAngleShapes, groupSolid];
    
    // Lưu vào board
    board.commit(board.updatePage(pageIdx, P => ({
      ...P,
      geo: { ...P.geo, points: pointsMap, shapes: finalShapes }
    })));

    // Cập nhật trạng thái currentBuild
    currentBuild.active = true;
    currentBuild.stage = 'complete';
    currentBuild.groupId = groupId;
    currentBuild.basePtIds = basePtIds;
    currentBuild.heightPtId = footId;
    currentBuild.apexPtId = apexId;
    currentBuild.heightVal = heightVal;
    currentBuild.waitingFreeHeight = false;

    // Đặt công cụ chọn và chọn toàn bộ hình
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

    showToast(`✨ Đã tự động hoàn thiện khối 3D theo chiều cao tự do (${heightVal}px)!`);
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

    // Nếu đang trong chế độ vẽ chiều cao tự do HOẶC tự vẽ đoạn thẳng từ đáy lên
    if (currentBuild.waitingFreeHeight || dy > 25) {
      const hasBase = (currentBuild.basePtIds && currentBuild.basePtIds.length >= 3) ||
        pg.geo.shapes.some(s => s.id !== seg.id && (s.kind === 'polygon' || s.kind === 'segment'));
      
      if (hasBase) {
        console.log('[SpatialBuilder] Nhận diện đoạn thẳng chiều cao tự do vừa vẽ!');
        setTimeout(() => {
          // Nếu đang trong quy trình từng bước và người dùng chỉ muốn hoàn thành Bước 2
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
   * Ghi nhận đường cao tự do vừa vẽ cho Bước 2 (chưa nối cạnh bên nếu người dùng muốn bấm Bước 3)
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

    // Snap vào điểm đáy gần nhất
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

    // Đặt nhãn đỉnh S
    pMap[apexId] = { ...pMap[apexId], label: 'S', show: true, z: heightVal, group: currentBuild.groupId };
    seg.color = '#dc2626';
    seg.width = 2.2;
    seg.group = currentBuild.groupId;

    // Ký hiệu góc vuông
    const refPtId = basePtIds.find(id => id !== footId);
    const newShapes = [...shapes];
    if (refPtId) {
      newShapes.push({
        id: uid('right_mark'),
        kind: 'right',
        pts: [apexId, footId, refPtId],
        aux: true,
        color: '#dc2626',
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

    // Đặt công cụ chọn và chọn đỉnh S
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

    showToast(`✅ Đã vẽ đường cao tự do (${heightVal}px)! Bấm Bước 3 để hoàn thiện cạnh bên.`);
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
      guideBannerEl.remove();
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

      <!-- Tab chuyển đổi giữa Dựng từng bước & Tự vẽ tự động -->
      <div class="sb-nav-tabs">
        <button type="button" class="sb-nav-tab on" data-tab="steps">🪜 Dựng từng bước</button>
        <button type="button" class="sb-nav-tab" data-tab="draw">✍️ Tự vẽ ➔ Tự hoàn thiện</button>
      </div>

      <div class="sb-body tab-steps-content">
        <div class="sb-row">
          <label class="sb-label">Khối hình:</label>
          <div class="sb-toggle-group">
            <button type="button" class="sb-btn sb-toggle on" data-shape="pyramid">🔺 Hình chóp</button>
            <button type="button" class="sb-btn sb-toggle" data-shape="prism">🧊 Lăng trụ</button>
          </div>
        </div>

        <div class="sb-row">
          <label class="sb-label">Mặt đáy:</label>
          <select class="sb-select" id="sb-base-select">
            <option value="quad">▱ Tứ giác (Hình bình hành / Chữ nhật / Vuông)</option>
            <option value="triangle">◺ Tam giác thường / vuông (ABC)</option>
            <option value="tri_regular">△ Tam giác đều (ABC)</option>
            <option value="trapezoid">⏢ Hình thang (ABCD)</option>
          </select>
        </div>

        <div class="sb-row">
          <label class="sb-label">Đường cao:</label>
          <select class="sb-select" id="sb-height-select">
            <option value="freehand" selected>✍️ Tự do (Kéo chuột/bút trên bảng vẽ)</option>
            <option value="perp_A">⊥ SA vuông góc đáy (tại đỉnh A)</option>
            <option value="mid_H">⊥ SH vuông góc đáy (tại trung điểm AB)</option>
            <option value="center_O">⊥ SO vuông góc đáy (chóp đều / tâm O)</option>
            <option value="slant">📐 Chiều cao xiên / nghiêng tự do</option>
          </select>
        </div>

        <!-- Hướng dẫn khi chọn Vẽ tự do -->
        <div class="sb-free-hint" id="sb-free-hint">
          <span>✨ <b>Vẽ tự do:</b> Bấm Bước 2 rồi kéo chuột/bút từ đáy lên đỉnh S theo độ cao bạn muốn!</span>
        </div>

        <!-- Chiều cao theo mẫu (ẩn khi chọn tự do) -->
        <div class="sb-row" id="sb-height-slider-row" style="display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <label class="sb-label" style="margin: 0;">Chiều cao mẫu:</label>
            <b id="sb-height-val" style="color: #2563eb; font-size: 12.5px;">150px</b>
          </div>
          <input type="range" class="sb-slider" id="sb-height-range" min="60" max="360" step="10" value="150" />
          <div class="sb-sub-text">💡 Sau khi dựng, bạn có thể bấm vào đỉnh S để kéo chỉnh độ cao tùy ý!</div>
        </div>

        <!-- 3 NÚT DỰNG TỪNG BƯỚC -->
        <div class="sb-steps">
          <button type="button" class="sb-step-btn active" id="sb-btn-step1">
            <span class="sb-step-num">1</span>
            <span class="sb-step-txt">1. Vẽ mặt đáy</span>
          </button>

          <div class="sb-step2-wrapper">
            <button type="button" class="sb-step-btn" id="sb-btn-step2">
              <span class="sb-step-num">2</span>
              <span class="sb-step-txt" id="sb-step2-label">2. Kéo chiều cao tự do</span>
            </button>
            <button type="button" class="sb-step2-quick" id="sb-btn-step2-quick" title="Dựng nhanh đường cao theo mẫu">⚡ Mẫu</button>
          </div>

          <button type="button" class="sb-step-btn" id="sb-btn-step3">
            <span class="sb-step-num">3</span>
            <span class="sb-step-txt">3. Nối cạnh bên</span>
          </button>
        </div>

        <div class="sb-actions">
          <button type="button" class="sb-act-btn sb-quick" id="sb-btn-all" title="Dựng nhanh cả khối đầy đủ chỉ với 1 click">⚡ Dựng toàn bộ</button>
          <button type="button" class="sb-act-btn sb-turn" id="sb-btn-turn" title="Bật xoay 3D quanh trục đứng hoặc tự do">🔄 Xoay 3D</button>
        </div>
      </div>

      <!-- Nội dung Tab Tự vẽ tự hoàn thiện -->
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

    // Sự kiện nút đóng
    panel.querySelector('.sb-close').addEventListener('click', () => {
      panel.style.display = 'none';
      hideGuideBanner();
    });

    // Tab switcher
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

    // Chọn loại hình: Chóp / Lăng trụ
    panel.querySelectorAll('.sb-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        panel.querySelectorAll('.sb-toggle').forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        currentBuild.shapeType = btn.dataset.shape;
      });
    });

    const baseSel = panel.querySelector('#sb-base-select');
    baseSel.addEventListener('change', () => {
      currentBuild.baseType = baseSel.value;
    });

    const heightSel = panel.querySelector('#sb-height-select');
    const freeHint = panel.querySelector('#sb-free-hint');
    const sliderRow = panel.querySelector('#sb-height-slider-row');
    const step2Label = panel.querySelector('#sb-step2-label');

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
        step2Label.textContent = '2. Dựng chiều cao';
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

    // Sự kiện các nút Dựng từng bước
    panel.querySelector('#sb-btn-step1').addEventListener('click', () => {
      step1_DrawBase(null, {
        shapeType: currentBuild.shapeType,
        baseType: baseSel.value,
        heightType: heightSel.value,
        heightVal: Number(heightRange.value)
      });
    });

    // Nút Bước 2 (Chính: Vẽ tự do hoặc Dựng mẫu tùy chọn)
    panel.querySelector('#sb-btn-step2').addEventListener('click', () => {
      if (heightSel.value === 'freehand') {
        startFreehandHeight(null);
      } else {
        step2_DrawHeight(null, {
          heightType: heightSel.value,
          heightVal: Number(heightRange.value)
        });
      }
    });

    // Nút Bước 2 (Nút phụ: Dựng nhanh theo mẫu)
    panel.querySelector('#sb-btn-step2-quick').addEventListener('click', () => {
      step2_DrawHeight(null, {
        heightType: heightSel.value === 'freehand' ? 'perp_A' : heightSel.value,
        heightVal: Number(heightRange.value)
      });
    });

    panel.querySelector('#sb-btn-step3').addEventListener('click', () => {
      step3_CompleteEdges(null);
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

    if (btn1 && btn2 && btn3) {
      btn1.classList.remove('active', 'done');
      btn2.classList.remove('active', 'done');
      btn3.classList.remove('active', 'done');

      if (currentBuild.stage === 'base') {
        btn1.classList.add('done');
        btn2.classList.add('active');
      } else if (currentBuild.stage === 'height') {
        btn1.classList.add('done');
        btn2.classList.add('done');
        btn3.classList.add('active');
      } else if (currentBuild.stage === 'complete') {
        btn1.classList.add('done');
        btn2.classList.add('done');
        btn3.classList.add('done');
      } else {
        btn1.classList.add('active');
      }
    }
  }

  function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    handle.style.cursor = 'move';
    handle.onmousedown = dragMouseDown;
    handle.ontouchstart = dragTouchStart;

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function dragTouchStart(e) {
      const touch = e.touches[0];
      pos3 = touch.clientX;
      pos4 = touch.clientY;
      document.ontouchend = closeDragElement;
      document.ontouchmove = elementTouchDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
      element.style.right = 'auto';
      element.style.bottom = 'auto';
    }

    function elementTouchDrag(e) {
      const touch = e.touches[0];
      pos1 = pos3 - touch.clientX;
      pos2 = pos4 - touch.clientY;
      pos3 = touch.clientX;
      pos4 = touch.clientY;
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
      element.style.right = 'auto';
      element.style.bottom = 'auto';
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
        width: 320px;
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
  window.SpatialGeometryBuilder = {
    open: openBuilder,
    close: closeBuilder,
    toggle: toggleBuilder,
    step1_DrawBase,
    step2_DrawHeight,
    startFreehandHeight,
    step3_CompleteEdges,
    buildAll,
    turn3DCurrent,
    completeFromBaseAndHeight,
    onShapeAdded,
    showGuideBanner,
    hideGuideBanner,
    showAutoCompletePill,
    hideAutoCompletePill,
    setAutoMode(val) { autoMode = !!val; },
    getAutoMode() { return autoMode; },
    toggleAutoMode() { autoMode = !autoMode; return autoMode; }
  };

  console.log('[Module] SpatialGeometryBuilder loaded successfully with freehand height support.');
})(typeof window !== 'undefined' ? window : this);
