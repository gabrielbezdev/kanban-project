import React, { useEffect, useRef, useState } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Card from "./Card.jsx";
import "../styles/column.css";

export default function Column({
  column,
  cards,
  onAddCard,
  onDeleteCard,
  onChangeColor,
  onOpenCard,
  onChangeCardPriority,
  onRenameColumn,
  onDeleteColumn,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(column.title || "");
  const inputRef = useRef(null);
  const headRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef: setSortRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "column" },
    disabled: editing,
  });

  const { setNodeRef: setDropRef } = useDroppable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
    "--col-color": column.color || "#64748b",
  };

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);
  useEffect(() => {
    setDraft(column.title || "");
  }, [column.title]);

  function startEditing(e) {
    e?.stopPropagation();
    setDraft(column.title || "");
    setEditing(true);
  }
  function cancelEditing() {
    setEditing(false);
    setDraft(column.title || "");
  }
  function commitEditing() {
    const next = (draft || "").trim();
    setEditing(false);
    if (!next || next === column.title) return;
    onRenameColumn?.(column.id, next);
  }

  function handleKey(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      commitEditing();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      cancelEditing();
    }
  }

  function handleBlur(e) {
    const next = e.relatedTarget;
    if (next && headRef.current && headRef.current.contains(next)) return;
    commitEditing();
  }

  function handleDeleteColumn() {
    const ok = window.confirm(
      `Excluir a coluna "${column.title}" e todos os seus cards?`
    );
    if (!ok) return;
    onDeleteColumn?.(column.id);
  }

  return (
    <div
      ref={setSortRef}
      className={`kan-col${isDragging ? " is-dragging" : ""}`}
      style={style}
      {...attributes}
    >
      <div
        ref={headRef}
        className="kan-col-head"
        {...listeners}
        style={{ cursor: "grab" }}
      >
        <div className="kan-head-left">
          {!editing ? (
            <>
              <h3 className="kan-title" title="Clique no lápis para renomear">
                {column.title}
              </h3>
              <span
                className="kan-count-badge"
                aria-label="Quantidade de cards"
              >
                {cards.length}
              </span>
            </>
          ) : (
            <input
              ref={inputRef}
              className="kan-title-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKey}
              onBlur={handleBlur}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label="Editar nome da coluna"
            />
          )}
        </div>

        <div className="kan-head-right">
          {editing ? (
            <>
              <label
                className="kan-colorpicker"
                title="Cor da coluna"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <input
                  type="color"
                  value={column.color || "#64748b"}
                  onChange={(e) => onChangeColor(column.id, e.target.value)}
                />
                <span
                  className="kan-color-swatch"
                  style={{ background: column.color || "#64748b" }}
                />
              </label>

              <button
                className="kan-icon-btn"
                title="Excluir coluna"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={handleDeleteColumn}
                aria-label="Excluir coluna"
                style={{ color: "#b91c1c" }}
              >
                🗑️
              </button>
            </>
          ) : (
            <button
              className="kan-icon-btn"
              title="Renomear coluna"
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onClick={startEditing}
              aria-label="Renomear coluna"
            >
              ✎
            </button>
          )}
        </div>
      </div>

      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setDropRef} className="kan-col-body">
          {/* {cards.length === 0 && <div className="kan-empty">Solte aqui</div>} */}
          {cards.map((card) => (
            <Card
              key={card.id}
              id={card.id}
              title={card.title}
              priority={card.priority}
              commentsCount={(card.comments || []).length}
              onDelete={onDeleteCard}
              onOpen={onOpenCard}
              onChangePriority={onChangeCardPriority}
            />
          ))}
        </div>
      </SortableContext>

      <div className="kan-col-footer">
        <button
          className="kan-add-btn"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => onAddCard(column.id)}
        >
          <span className="kan-add-plus">＋</span>
          <span>Criar</span>
        </button>
      </div>
    </div>
  );
}
