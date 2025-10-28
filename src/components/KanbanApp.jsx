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
import Column from "./Column.jsx";
import Modal from "./Modal.jsx";
import { loadState, saveState, uid } from "../utils/storage.js";
import {
  findColumnIdByCard,
  reorderWithin,
  moveAcross,
} from "../utils/dnd.js";

const DEFAULT_COLORS = [
  "#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16",
];

export default function KanbanApp() {
  const [state, setState] = useState(loadState);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTargetColumn, setModalTargetColumn] = useState(null);
  const [newCardText, setNewCardText] = useState("");
  const [newColumnName, setNewColumnName] = useState("");
  const [activeCardId, setActiveCardId] = useState(null);

  useEffect(() => { saveState(state); }, [state]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor)
  );

  const columns = state.columnOrder.map((id) => state.columns[id]);

  const cardsByColumn = useMemo(() => {
    const map = {};
    for (const col of columns) {
      map[col.id] = col.cardIds
        .map((cid) => state.cards[cid])
        .filter(Boolean);
    }
    return map;
  }, [columns, state.cards]);

  function openAddCardModal(columnId) {
    setModalTargetColumn(columnId);
    setNewCardText("");
    setModalOpen(true);
  }

  function addCard() {
    if (!newCardText.trim() || !modalTargetColumn) return;
    const id = uid("card");
    setState((prev) => ({
      ...prev,
      cards: { ...prev.cards, [id]: { id, content: newCardText.trim() } },
      columns: {
        ...prev.columns,
        [modalTargetColumn]: {
          ...prev.columns[modalTargetColumn],
          cardIds: [id, ...prev.columns[modalTargetColumn].cardIds],
        },
      },
    }));
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

  function changeColumnColor(columnId, color) {
    setState((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [columnId]: { ...prev.columns[columnId], color },
      },
    }));
  }

  function onDragStart(e) {
    setActiveCardId(e.active.id);
  }

  function onDragEnd(e) {
    const { active, over } = e;
    setActiveCardId(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const sourceColId = findColumnIdByCard(state, activeId);

    let destColId = state.columns[overId] ? overId : findColumnIdByCard(state, overId);

    if (!sourceColId || !destColId) return;

    if (sourceColId === destColId) {
      setState((prev) => reorderWithin(prev, sourceColId, activeId, overId));
    } else {
      setState((prev) => moveAcross(prev, sourceColId, destColId, activeId, overId));
    }
  }

  return (
    <div className="kan-wrap">
      <header className="kan-topbar">
        <h2 className="kan-app-title">Meu Kanban</h2>
        <input
          className="kan-input"
          placeholder="Nome do novo quadro (coluna)"
          value={newColumnName}
          onChange={(e) => setNewColumnName(e.target.value)}
        />
        <button className="kan-btn" onClick={addColumn}>+ Coluna</button>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="kan-grid">
          {columns.map((col) => (
            <div key={col.id} id={col.id}>
              <Column
                column={col}
                cards={cardsByColumn[col.id] || []}
                onAddCard={openAddCardModal}
                onDeleteCard={deleteCard}
                onChangeColor={changeColumnColor}
              />
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeCardId ? (
            <div
              className="kan-card"
              style={{ boxShadow: "0 6px 20px rgba(0,0,0,0.15)", transform: "scale(1.02)" }}
            >
              <div className="kan-card-content">{state.cards[activeCardId]?.content}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Modal open={modalOpen} title="Novo Card" onClose={() => setModalOpen(false)}>
        <label>
          <div style={{ marginBottom: 6 }}>Conteúdo</div>
          <textarea
            rows={4}
            className="kan-input"
            style={{ width: "100%", resize: "vertical" }}
            value={newCardText}
            onChange={(e) => setNewCardText(e.target.value)}
          />
        </label>
        <div className="kan-footer">
          <button className="kan-btn" onClick={addCard}>Adicionar</button>
          <button className="kan-btn" onClick={() => setModalOpen(false)}>Cancelar</button>
        </div>
      </Modal>
    </div>
  );
}
