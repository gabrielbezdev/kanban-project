# 🗂️ Kanban Board

Um **Kanban interativo** desenvolvido com **React + Vite**, totalmente funcional com **arrastar e soltar (drag & drop)**, persistência local e sistema de **prioridades automáticas** — inspirado em ferramentas como **Trello** e **Jira**.

---

## 🚀 Tecnologias utilizadas

| Área | Ferramentas / Bibliotecas | Função |
|------|----------------------------|---------|
| 🧩 Framework | [React](https://react.dev/) via [Vite](https://vitejs.dev/) | Criação da SPA |
| 🎯 Drag & Drop | [`@dnd-kit/core`](https://docs.dndkit.com/) e [`@dnd-kit/sortable`](https://docs.dndkit.com/api-documentation/sortable) | Sistema moderno e performático de arrastar e soltar |
| 💾 Persistência | `localStorage` (com `loadState` e `saveState`) | Salva dados localmente, sem precisar de backend (futuramente desejo criar o backend) |
| 🧠 Utilitários | `utils/storage.js` e `utils/dnd.js` | Funções puras para manipular estado e ordenação |
| 🎨 Estilo | CSS puro modularizado por componente | Interface limpa e responsiva |

---

## ⚙️ Funcionalidades principais

### 🧱 Colunas
- Criar novas colunas com **nome e cor personalizados**  
- **Editar** título e **mudar cor** (via color picker 🎨)  
- **Excluir coluna** (ícone 🗑️ aparece no modo de edição)  
- **Reordenar colunas** arrastando horizontalmente  
- Contador de **quantos cards existem** por coluna  

---

### 🗂️ Cards
- Criar cards com **título** e **descrição**
- **Excluir** cards individualmente
- **Arrastar** cards entre colunas ou dentro da mesma
- Cada card tem:
  - **Título**
  - **Descrição**
  - **Prioridade (Alta, Média, Baixa)**
  - **Comentários**
- Duplo clique → abre modal de **detalhes**:
  - editar título e descrição
  - adicionar comentários

---

### 🏷️ Sistema de prioridade automática
Cards são automaticamente **reordenados por prioridade**:
1. 🔴 **Alta prioridade** → sempre no topo  
2. 🟠 **Média prioridade** → abaixo das altas  
3. 🟢 **Baixa prioridade** → por último  

A ordenação acontece sempre que:
- o card é criado,
- a prioridade é alterada,
- o card é movido entre colunas.

---

### 💾 Persistência local
- Tudo é salvo automaticamente no **localStorage**
- Ao fechar e reabrir o navegador, o Kanban volta igual
- Dados persistem indefinidamente (até serem apagados)

---

### 🖱️ Drag & Drop moderno
- Implementado com [`@dnd-kit`](https://docs.dndkit.com/)
- Suporte a:
  - mover **colunas** horizontalmente
  - mover **cards** vertical ou entre colunas
- Animações suaves com `DragOverlay` durante o arraste

---

## 💡 Ideias que estão no radar

| Ideia | Descrição |
|---------|------------|
| ☁️ Backend API | Persistência real em banco (ex: Express + MongoDB) |
| 👥 Multiusuário | Login e quadros separados por usuário |
| 🎨 Tema dinâmico | Modo claro/escuro com CSS variables |
| 🔍 Filtros e busca | Filtrar cards por prioridade, texto, etc. |
| 📅 Deadlines | Adicionar prazos e cores automáticas por vencimento |
| 📤 Export/Import | Salvar e carregar boards em JSON |

---

## 🧰 Como rodar o projeto

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/kanban-board.git
cd kanban-board

# Instalar dependências
npm install

# Rodar servidor de desenvolvimento
npm run dev
```
---

👨‍💻 Autor

Gabriel Bezerra - 
Desenvolvedor Full-Stack • Estudante de ADS • Apaixonado por Front-End 💙

✨ Este projeto está sendo construído com foco em aprendizado, componentização e boas práticas de código em React. Inspiração: Jira, Trello e Notion.