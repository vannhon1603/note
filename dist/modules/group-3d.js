/**
 * =======================================================================
 * 🔄 GROUP 3D & SHAPE 3D ROTATION MODULE (Study Note AI)
 * Cho phép vẽ hình (đa giác, đoạn thẳng, khối...), sau đó chọn và xoay 3D
 * toàn bộ nhóm hình đó trong không gian 3 chiều đồng bộ 100%!
 * =======================================================================
 */
(function(window) {
  'use strict';

  const uf = 0.5 * Math.SQRT1_2;
  const Zo = [1, uf, 0, 0, -uf, -1, -uf, 1, -uf]; // Ma trận chiếu SGK Toán 12
  const Cp = [1, 0, 0, 0, 1, 0, 0, 0, 1];         // Ma trận đơn vị (Identity)

  /**
   * Kiểm tra selection hiện tại có thể xoay 3D được không
   */
  function canTurnSelection(board) {
    if (!board || !board.sel) return false;
    const sel = board.sel;
    const pg = board.doc.pages[sel.page];
    if (!pg || !pg.geo) return false;

    // 1. Nếu đã có sẵn solid đơn lẻ
    if (board._origSelectedSolid && board._origSelectedSolid()) return true;

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

    // Hoặc shape được chọn nằm trong một group có nhiều shape
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
   * Tính toán toạ độ 2D của các điểm (Point Map)
   */
  function getPointMap(geo) {
    const map = new Map();
    for (const [id, pt] of Object.entries(geo.points || {})) {
      if (pt && pt.def && pt.def.t === 'free') {
        map.set(id, { x: pt.def.x, y: pt.def.y });
      }
    }
    return map;
  }

  /**
   * Chuẩn bị dữ liệu 3D cho nhóm hình để sẵn sàng xoay 3D
   */
  function prepareGroup3D(board, sel) {
    if (!board || !sel) return null;
    const pg = board.doc.pages[sel.page];
    if (!pg || !pg.geo) return null;
    const geo = pg.geo;

    // Thu thập tất cả shapes được chọn
    const selShapes = geo.shapes.filter(s => sel.shapes.has(s.id));
    const ptIdSet = new Set(sel.points || []);
    selShapes.forEach(s => (s.pts || []).forEach(pid => ptIdSet.add(pid)));
    const ptIds = Array.from(ptIdSet);

    if (ptIds.length < 2) return null;

    // Tìm xem trong nhóm đã có shape solid nào chưa
    let existingSolid = selShapes.find(s => s.kind === 'solid' && s.solid);
    let groupId = existingSolid ? existingSolid.group : (selShapes.find(s => s.group)?.group || ('grp_3d_' + Date.now()));

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
          // Tự động nhận diện đỉnh cao: nếu đỉnh ở trên đỉnh chóp/lăng trụ (y gần minY)
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

    let groupSolid = existingSolid ? newShapes.find(s => s.id === existingSolid.id) : newShapes.find(s => s.kind === 'solid' && s.group === groupId);

    if (!groupSolid) {
      // Trích xuất các mặt (faces) từ các đa giác (polygons) trong nhóm
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
        hidden: true, // Khung solid ảo hỗ trợ xoay 3D mượt mà
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
      // Cập nhật danh sách điểm cho solid bao gồm cả các điểm mới vẽ thêm
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

    // Commit trang
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
   * Hook vào Prototype của Board
   */
  function patchBoardPrototype(BoardProto) {
    if (!BoardProto || BoardProto._group3DPatched) return;
    BoardProto._group3DPatched = true;

    // Lưu lại các hàm gốc
    BoardProto._origSelectedSolid = BoardProto.selectedSolid;
    BoardProto._origSelectionSolid = BoardProto.selectionSolid;
    BoardProto._origStartTurning = BoardProto.startTurning;

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
          // Kiểm tra xem đã có group solid sẵn chưa
          const grpSolid = pg.geo.shapes.find(s => s.kind === 'solid' && s.solid && s.solid.isGroup3D && (
            this.sel.shapes.has(s.id) ||
            pg.geo.shapes.some(x => this.sel.shapes.has(x.id) && x.group === s.group)
          ));
          if (grpSolid) return { page: this.sel.page, id: grpSolid.id, isGroup: true };
          return { page: this.sel.page, id: '_group_selection_', isGroup: true };
        }
      }
      return null;
    };

    // Mở rộng startTurning: Tự động khởi tạo 3D cho nhóm nếu chưa có, sau đó xoay
    BoardProto.startTurning = function() {
      let sol = this.selectedSolid();
      if (!sol && canTurnSelection(this)) {
        sol = prepareGroup3D(this, this.sel);
      } else if (sol && (sol.id === '_group_selection_' || this.sel.shapes.size > 1)) {
        sol = prepareGroup3D(this, this.sel);
      }

      if (!sol) return;

      const pg = this.doc.pages[sol.page];
      if (!pg || !pg.geo) return;

      // Chạy startTurning của solid
      this.sel = null;
      this.turning = {
        page: sol.page,
        id: sol.id,
        mode: this.turnMode || 'table',
        unfold: 0,
        canUnfold: false,
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

    console.log('[Group3D] Đã tích hợp thành công vào Board.prototype');
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
    // Dừng sau 15 giây nếu không tìm thấy
    setTimeout(() => clearInterval(timer), 15000);
  }

  // Xuất API toàn cục
  window.Group3D = {
    canTurnSelection,
    isGroupSelection,
    prepareGroup3D,
    groupSelection,
    ungroupSelection,
    patchBoardPrototype
  };

  console.log('[Module] Group3D loaded successfully.');
})(window);

