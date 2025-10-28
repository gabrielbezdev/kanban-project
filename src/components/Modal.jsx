import React from "react";
import "../styles/modal.css";

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="kan-modal-backdrop" onClick={onClose}>
      <div className="kan-modal" onClick={(e) => e.stopPropagation()}>
        <div className="kan-modal-head">
          <h4>{title}</h4>
          <button className="kan-card-del" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="kan-modal-body">{children}</div>
      </div>
    </div>
  );
}
