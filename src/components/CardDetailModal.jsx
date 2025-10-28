import React, { useEffect, useMemo, useState } from "react";
import Modal from "./Modal.jsx";
import "../styles/cardDetailModal.css";

export default function CardDetailModal({
  open,
  card,
  onClose,
  onSaveTitle,
  onSaveDescription,
  onAddComment,
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDesc, setDraftDesc] = useState("");
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (!open) return;
    setDraftTitle(card?.title || "");
    setDraftDesc(card?.description || "");
    setEditingTitle(false);
    setEditingDesc(false);
    setCommentText("");
  }, [open, card?.id]);

  const comments = useMemo(() => card?.comments || [], [card]);

  function saveTitle() {
    const t = (draftTitle || "").trim();
    onSaveTitle?.(card.id, t);
    setEditingTitle(false);
  }

  function saveDesc() {
    const d = (draftDesc || "").trim();
    onSaveDescription?.(card.id, d);
    setEditingDesc(false);
  }

  function submitComment() {
    const text = (commentText || "").trim();
    if (!text) return;
    onAddComment?.(card.id, text);
    setCommentText("");
  }

  return (
    <Modal open={open} title="Detalhes do Card" onClose={onClose}>
      <div className="kan-detail-row">
        <div className="kan-detail-label">Título</div>
        {!editingTitle ? (
          <div className="kan-detail-value">
            <span>{card?.title || "(Sem título)"}</span>
            <button
              className="kan-icon-btn"
              onClick={() => setEditingTitle(true)}
              title="Editar título"
            >
              ✎
            </button>
          </div>
        ) : (
          <div className="kan-detail-edit">
            <input
              className="kan-input"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveTitle();
                if (e.key === "Escape") {
                  setEditingTitle(false);
                  setDraftTitle(card?.title || "");
                }
              }}
              onBlur={saveTitle}
              autoFocus
            />
          </div>
        )}
      </div>

      <div className="kan-detail-row">
        <div className="kan-detail-label">Descrição</div>
        {!editingDesc ? (
          <div className="kan-detail-value multiline">
            <pre className="kan-detail-pre">
              {card?.description || "(Sem descrição)"}
            </pre>
            <button
              className="kan-icon-btn"
              onClick={() => setEditingDesc(true)}
              title="Editar descrição"
            >
              ✎
            </button>
          </div>
        ) : (
          <div className="kan-detail-edit">
            <textarea
              className="kan-input"
              rows={6}
              value={draftDesc}
              onChange={(e) => setDraftDesc(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveDesc();
                if (e.key === "Escape") {
                  setEditingDesc(false);
                  setDraftDesc(card?.description || "");
                }
              }}
              onBlur={saveDesc}
              placeholder="Descreva o que precisa ser feito, critérios, links, etc."
              style={{ width: "100%", resize: "vertical" }}
              autoFocus
            />
            <div className="kan-hint">
              Pressione <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>Enter</kbd> para
              salvar.
            </div>
          </div>
        )}
      </div>

      <div className="kan-detail-row">
        <div className="kan-detail-label">Comentários</div>
        <div className="kan-detail-comments">
          <div className="kan-comment-form">
            <textarea
              className="kan-input"
              rows={3}
              placeholder="Escreva um comentário..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div className="kan-comment-actions">
              <button className="kan-btn" onClick={submitComment}>
                Comentar
              </button>
            </div>
          </div>

          <div className="kan-comment-list">
            {comments.length === 0 && (
              <div className="kan-comment-empty">Nenhum comentário ainda.</div>
            )}
            {comments
              .slice()
              .reverse()
              .map((c) => (
                <div key={c.id} className="kan-comment-item">
                  <div className="kan-comment-meta">
                    <span className="kan-comment-date">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="kan-comment-text">{c.text}</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
