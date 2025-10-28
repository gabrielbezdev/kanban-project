import React, { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import Column from "./Column.jsx";
import Modal from "./Modal.jsx";
import CardDetailModal from "./CardDetailModal.jsx";
import { loadState, saveState, uid } from "../utils/storage.js";
import {
  findColumnIdByCard,
  reorderWithin,
  moveAcross,
  sortColumnByPriority,
} from "../utils/dnd.js";

const DEFAULT_COLORS = [
  "#3b82f6",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
];

export default function KanbanApp() {
  const [state, setState] = useState(loadState);
  const [activeCardId, setActiveCardId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTargetColumn, setModalTargetColumn] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDesc, setNewCardDesc] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCardId, setDetailCardId] = useState(null);
  const [newColumnName, setNewColumnName] = useState("");

  useEffect(() => {
    saveState(state);
  }, [state]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor)
  );

  const columns = state.columnOrder.map((id) => state.columns[id]);

  const normalizedCards = useMemo(() => {
    const out = {};
    for (const [id, card] of Object.entries(state.cards)) {
      out[id] = {
        id,
        title: (card.title ?? card.content ?? "").toString(),
        description: (card.description ?? "").toString(),
        priority: card.priority ?? "none",
        comments: Array.isArray(card.comments) ? card.comments : [],
      };
    }
    return out;
  }, [state.cards]);

  const cardsByColumn = useMemo(() => {
    const map = {};
    for (const col of columns) {
      map[col.id] = col.cardIds
        .map((cid) => normalizedCards[cid])
        .filter(Boolean);
    }
    return map;
  }, [columns, normalizedCards]);

  function openAddCardModal(columnId) {
    setModalTargetColumn(columnId);
    setNewCardTitle("");
    setNewCardDesc("");
    setModalOpen(true);
  }

  function addCard() {
    if (!newCardTitle.trim() || !modalTargetColumn) return;
    const id = uid("card");
    const card = {
      id,
      title: newCardTitle.trim(),
      description: newCardDesc.trim(),
      priority: "none",
      comments: [],
    };
    setState((prev) => {
      let next = {
        ...prev,
        cards: { ...prev.cards, [id]: card },
        columns: {
          ...prev.columns,
          [modalTargetColumn]: {
            ...prev.columns[modalTargetColumn],
            cardIds: [id, ...prev.columns[modalTargetColumn].cardIds],
          },
        },
      };
      next = sortColumnByPriority(next, modalTargetColumn);
      return next;
    });
    setModalOpen(false);
  }

  function deleteCard(id) {
    setState((prev) => {
      const { [id]: _, ...restCards } = prev.cards;
      const newColumns = { ...prev.columns };
      for (const colId of prev.columnOrder) {
        newColumns[colId] = {
          ...newColumns[colId],
          cardIds: newColumns[colId].cardIds.filter((cid) => cid !== id),
        };
      }
      return { ...prev, cards: restCards, columns: newColumns };
    });
  }

  function addColumn() {
    const title = newColumnName.trim();
    if (!title) return;
    const id = uid("col");
    const idx = state.columnOrder.length % DEFAULT_COLORS.length;
    const color = DEFAULT_COLORS[idx];
    setState((prev) => ({
      ...prev,
      columns: { ...prev.columns, [id]: { id, title, cardIds: [], color } },
      columnOrder: [...prev.columnOrder, id],
    }));
    setNewColumnName("");
  }

    function deleteColumn(columnId) {
    setState((prev) => {
      const col = prev.columns[columnId];
      if (!col) return prev;

      const nextColumns = { ...prev.columns };
      delete nextColumns[columnId];

      const nextOrder = prev.columnOrder.filter((id) => id !== columnId);
      const removeIds = new Set(col.cardIds);
      const nextCards = Object.fromEntries(
        Object.entries(prev.cards).filter(([id]) => !removeIds.has(id))
      );

      return {
        ...prev,
        columns: nextColumns,
        columnOrder: nextOrder,
        cards: nextCards,
      };
    });
  }

  function changeColumnColor(columnId, color) {
    setState((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [columnId]: { ...prev.columns[columnId], color },
      },
    }));
  }

  function renameColumn(columnId, nextTitle) {
    const title = (nextTitle || "").trim();
    if (!title) return;
    setState((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [columnId]: { ...prev.columns[columnId], title },
      },
    }));
  }

  function openCardDetail(cardId) {
    setDetailCardId(cardId);
    setDetailOpen(true);
  }

  function saveCardTitle(cardId, nextTitle) {
    setState((prev) => ({
      ...prev,
      cards: {
        ...prev.cards,
        [cardId]: { ...prev.cards[cardId], title: (nextTitle || "").trim() },
      },
    }));
  }
  function saveCardDescription(cardId, nextDesc) {
    setState((prev) => ({
      ...prev,
      cards: {
        ...prev.cards,
        [cardId]: {
          ...prev.cards[cardId],
          description: (nextDesc || "").trim(),
        },
      },
    }));
  }
  function addComment(cardId, text) {
    const ts = new Date().toISOString();
    const newComment = { id: uid("cmt"), text, createdAt: ts };
    setState((prev) => {
      const current = Array.isArray(prev.cards[cardId]?.comments)
        ? prev.cards[cardId].comments
        : [];
      return {
        ...prev,
        cards: {
          ...prev.cards,
          [cardId]: {
            ...prev.cards[cardId],
            comments: [...current, newComment],
          },
        },
      };
    });
  }

  function changeCardPriority(cardId, priority) {
    setState((prev) => {
      let next = {
        ...prev,
        cards: { ...prev.cards, [cardId]: { ...prev.cards[cardId], priority } },
      };
      const colId = findColumnIdByCard(next, cardId);
      if (colId) next = sortColumnByPriority(next, colId);
      return next;
    });
  }

  function onDragStart(e) {
    setActiveCardId(
      e.active?.data?.current?.type === "card" ? e.active.id : null
    );
  }

  function onDragEnd(e) {
    const { active, over } = e;
    if (!over) {
      setActiveCardId(null);
      return;
    }
    const activeType = active.data.current?.type;
    const overId = over.id;

    if (activeType === "column") {
      const activeId = active.id;
      if (activeId === overId) return;

      setState((prev) => {
        const order = [...prev.columnOrder];
        const from = order.indexOf(activeId);
        const to = order.indexOf(overId);
        if (from === -1 || to === -1) return prev;
        order.splice(to, 0, ...order.splice(from, 1));
        return { ...prev, columnOrder: order };
      });
      return;
    }

    const activeId = active.id;
    const sourceColId = findColumnIdByCard(state, activeId);
    let destColId = state.columns[overId]
      ? overId
      : findColumnIdByCard(state, overId);
    setActiveCardId(null);
    if (!sourceColId || !destColId) return;

    if (sourceColId === destColId) {
      setState((prev) => {
        let next = reorderWithin(prev, sourceColId, activeId, overId);
        next = sortColumnByPriority(next, sourceColId);
        return next;
      });
    } else {
      setState((prev) => {
        let next = moveAcross(prev, sourceColId, destColId, activeId, overId);
        next = sortColumnByPriority(next, sourceColId);
        next = sortColumnByPriority(next, destColId);
        return next;
      });
    }
  }

  const detailCard = detailCardId ? normalizedCards[detailCardId] : null;

  return (
    <div className="kan-wrap">
      <header className="kan-topbar">
        <h2 className="kan-app-title">Ainda tô pensando no nome...</h2>
        <input
          className="kan-input"
          placeholder="Nome do novo quadro (coluna)"
          value={newColumnName}
          onChange={(e) => setNewColumnName(e.target.value)}
        />
        <button className="kan-btn" onClick={addColumn}>
          + Coluna
        </button>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={state.columnOrder}
          strategy={horizontalListSortingStrategy}
        >
          <div className="kan-grid">
            {columns.map((col) => (
              <Column
                key={col.id}
                column={col}
                cards={cardsByColumn[col.id] || []}
                onAddCard={openAddCardModal}
                onDeleteCard={deleteCard}
                onChangeColor={changeColumnColor}
                onOpenCard={openCardDetail}
                onChangeCardPriority={changeCardPriority}
                onRenameColumn={renameColumn}
                onDeleteColumn={deleteColumn}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeCardId ? (
            <div
              className="kan-card"
              style={{
                boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                transform: "scale(1.02)",
                width: "240px",
                height: "140px",
              }}
            >
              <div className="kan-badge kan-badge--ghost">Movendo…</div>
              <div className="kan-card-content">
                <div className="kan-card-title">
                  {(state.cards[activeCardId]?.title ??
                    state.cards[activeCardId]?.content ??
                    "") ||
                    "(Sem título)"}
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Modal
        open={modalOpen}
        title="Novo Card"
        onClose={() => setModalOpen(false)}
      >
        <label>
          <div style={{ marginBottom: 6 }}>Título</div>
          <input
            className="kan-input"
            style={{ width: "100%" }}
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            placeholder="Ex.: Implementar login"
          />
        </label>
        <label>
          <div style={{ margin: "10px 0 6px" }}>Descrição</div>
          <textarea
            rows={4}
            className="kan-input"
            style={{ width: "100%", resize: "vertical" }}
            value={newCardDesc}
            onChange={(e) => setNewCardDesc(e.target.value)}
            placeholder="Detalhes, critérios de aceite, etc."
          />
        </label>
        <div className="kan-footer">
          <button className="kan-btn" onClick={addCard}>
            Adicionar
          </button>
          <button className="kan-btn" onClick={() => setModalOpen(false)}>
            Cancelar
          </button>
        </div>
      </Modal>

      <CardDetailModal
        open={detailOpen}
        card={detailCard}
        onClose={() => setDetailOpen(false)}
        onSaveTitle={saveCardTitle}
        onSaveDescription={saveCardDescription}
        onAddComment={addComment}
      />
    </div>
  );
}
