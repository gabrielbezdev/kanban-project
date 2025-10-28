import React from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import Card from "./Card.jsx";

export default function Column({
  column,
  cards,
  onAddCard,
  onDeleteCard,
  onChangeColor,
}) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div className="kan-col" style={{ "--col-color": column.color || "#64748b" }}>
      <div className="kan-col-head">
        <h3 className="kan-title">{column.title}</h3>

        <div className="kan-head-actions">
          <label className="kan-colorpicker" title="Cor da coluna">
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
          <button className="kan-btn small" onClick={() => onAddCard(column.id)}>
            + Card
          </button>
        </div>
      </div>

      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="kan-col-body">
          {cards.length === 0 && <div className="kan-empty">Solte aqui</div>}
          {cards.map((card) => (
            <Card
              key={card.id}
              id={card.id}
              content={card.content}
              onDelete={onDeleteCard}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
