export function findColumnIdByCard(state, cardId) {
  for (const colId of state.columnOrder) {
    if (state.columns[colId].cardIds.includes(cardId)) return colId;
  }
  return null;
}

export function reorderWithin(state, columnId, activeId, overId) {
  const col = state.columns[columnId];
  const oldIdx = col.cardIds.indexOf(activeId);

  let newIdx = col.cardIds.indexOf(overId);
  if (newIdx === -1) newIdx = col.cardIds.length;

  if (oldIdx === newIdx) return state;

  const newIds = [...col.cardIds];
  newIds.splice(oldIdx, 1);
  newIds.splice(newIdx, 0, activeId);

  return {
    ...state,
    columns: {
      ...state.columns,
      [columnId]: { ...col, cardIds: newIds },
    },
  };
}

export function moveAcross(state, sourceColId, destColId, activeId, overId) {
  const src = state.columns[sourceColId];
  const dst = state.columns[destColId];

  const srcIds = src.cardIds.filter((cid) => cid !== activeId);

  let dstIdx = dst.cardIds.indexOf(overId);
  if (dstIdx === -1) dstIdx = dst.cardIds.length;

  const dstIds = [...dst.cardIds];
  dstIds.splice(dstIdx, 0, activeId);

  return {
    ...state,
    columns: {
      ...state.columns,
      [sourceColId]: { ...src, cardIds: srcIds },
      [destColId]: { ...dst, cardIds: dstIds },
    },
  };
}
