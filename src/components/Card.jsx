import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function Card({ id, content, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="kan-card"
      {...attributes}
      {...listeners}
    >
      <div className="kan-card-content">{content}</div>
      <button
        className="kan-card-del"
        title="Remover card"
        onClick={() => onDelete(id)}
      >
        ×
      </button>
    </div>
  );
}
