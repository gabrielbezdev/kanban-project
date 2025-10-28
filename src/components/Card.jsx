import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "../styles/card.css";

const PRIORITY_LABEL = {
  none: "Defina a prioridade",
  high: "Alta prioridade",
  medium: "Média prioridade",
  low: "Baixa prioridade",
};

export default function Card({
  id,
  title,
  priority = "none",
  commentsCount = 0,
  onDelete,
  onOpen,
  onChangePriority,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, data: { type: "card" } });

  const [menuOpen, setMenuOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    cursor: "grab",
  };

  const safeTitle = title?.trim() || "(Sem título)";
  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen((v) => !v);
  };
  const pickPriority = (p) => {
    onChangePriority?.(id, p);
    setMenuOpen(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="kan-card"
      {...attributes}
      {...listeners}
      onDoubleClick={() => onOpen?.(id)}
      title="Duplo clique para ver/editar o card"
    >
      <div className="kan-card-head">
        <button
          className={`kan-badge ${
            priority === "high"
              ? "kan-badge--high"
              : priority === "medium"
              ? "kan-badge--medium"
              : priority === "low"
              ? "kan-badge--low"
              : "kan-badge--ghost"
          }`}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={toggleMenu}
          title="Clique para definir a prioridade"
        >
          {PRIORITY_LABEL[priority]}
        </button>

        {menuOpen && (
          <div
            className="kan-badge-menu"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="kan-badge-item kan-badge--high"
              onClick={() => pickPriority("high")}
            >
              Alta prioridade
            </div>
            <div
              className="kan-badge-item kan-badge--medium"
              onClick={() => pickPriority("medium")}
            >
              Média prioridade
            </div>
            <div
              className="kan-badge-item kan-badge--low"
              onClick={() => pickPriority("low")}
            >
              Baixa prioridade
            </div>
          </div>
        )}

        <button
          className="kan-card-del"
          title="Remover card"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
        >
          ×
        </button>
      </div>

      <div className="kan-card-content">
        <div className="kan-card-title">{safeTitle}</div>
      </div>

      <div className="kan-card-footer">
        <button
          className="kan-comment-chip"
          title={`${commentsCount} comentário(s)`}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onOpen?.(id);
          }}
        >
          <span className="kan-comment-icon">💬</span>
          <span className="kan-comment-count">{commentsCount}</span>
        </button>
      </div>
    </div>
  );
}
