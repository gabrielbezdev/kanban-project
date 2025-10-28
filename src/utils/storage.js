const LS_KEY = "kanban_state_v1";

export const uid = (prefix = "id") =>
  `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 7)}`;

export const DEFAULT_STATE = {
  columns: {
    todo:  { id: "todo",  title: "A Fazer",  cardIds: [], color: "#3b82f6" },
    doing: { id: "doing", title: "Fazendo",  cardIds: [], color: "#f59e0b" },
    done:  { id: "done",  title: "Feito",    cardIds: [], color: "#10b981" },
  },
  cards: {},
  columnOrder: ["todo", "doing", "done"],
};

export function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? JSON.parse(raw) : DEFAULT_STATE;
    for (const colId of parsed.columnOrder) {
      parsed.columns[colId].color ||= "#64748b";
    }
    return parsed;
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {}
}
