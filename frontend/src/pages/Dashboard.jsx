import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";

const THEME_KEY = "gerenciador-tarefas-theme";

function readSavedTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pendente");
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [sortOrder, setSortOrder] = useState("recentes");
  const [theme, setTheme] = useState(readSavedTheme);

  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (storageError) {
      console.warn("Não foi possível salvar a preferência de tema.", storageError);
    }
  }, [theme]);

  const carregarTarefas = async () => {
    try {
      const response = await api.get("/tasks");
      setTasks(response.data.tasks || []);
      setError("");
    } catch (requestError) {
      console.error("Erro ao buscar tarefas:", requestError);
      setError(
        requestError.response?.data?.message ||
          "Erro ao carregar as tarefas. Verifique a conexão com o servidor.",
      );
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    carregarTarefas();
  }, []);

  const limparFormulario = () => {
    setTitle("");
    setDescription("");
    setStatus("pendente");
    setEditingTask(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("O título da tarefa é obrigatório.");
      return;
    }

    if (title.trim().length > 100) {
      setError("O título deve ter no máximo 100 caracteres.");
      return;
    }

    if (description.length > 1000) {
      setError("A descrição deve ter no máximo 1000 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        status,
      };

      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, taskData);
        setSuccess("Tarefa atualizada com sucesso!");
      } else {
        await api.post("/tasks", taskData);
        setSuccess("Tarefa criada com sucesso!");
      }

      limparFormulario();
      await carregarTarefas();
    } catch (requestError) {
      console.error("Erro ao salvar tarefa:", requestError);
      setError(requestError.response?.data?.message || "Erro ao salvar a tarefa.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title || "");
    setDescription(task.description || "");
    setStatus(task.status || "pendente");
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    limparFormulario();
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id) => {
    const confirmar = window.confirm("Tem certeza que deseja excluir esta tarefa?");
    if (!confirmar) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/tasks/${id}`);

      if (editingTask?._id === id) {
        limparFormulario();
      }

      setSuccess("Tarefa excluída com sucesso!");
      await carregarTarefas();
    } catch (requestError) {
      console.error("Erro ao excluir tarefa:", requestError);
      setError(requestError.response?.data?.message || "Erro ao excluir a tarefa.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((task) => task.status === "pendente").length;
  const completedTasks = tasks.filter((task) => task.status === "concluída").length;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const filteredTasks = tasks
    .filter((task) =>
      (task.title || "").toLowerCase().includes(searchTerm.trim().toLowerCase()),
    )
    .filter((task) => (statusFilter === "todos" ? true : task.status === statusFilter))
    .sort((a, b) => {
      if (sortOrder === "az") {
        return (a.title || "").localeCompare(b.title || "", "pt-BR");
      }
      if (sortOrder === "za") {
        return (b.title || "").localeCompare(a.title || "", "pt-BR");
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  const isDark = theme === "dark";

  return (
    <main className={`dashboard-app ${isDark ? "theme-dark" : "theme-light"}`}>
      <aside className="sidebar">
        <a className="brand" href="#dashboard" aria-label="Gerenciador de tarefas, início">
          <span className="brand-mark" aria-hidden="true">✓</span>
          <span className="brand-copy">
            <strong>TaskFlow</strong>
            <small>Gerenciador de tarefas</small>
          </span>
        </a>

        <div className="sidebar-label">MENU PRINCIPAL</div>
        <nav className="sidebar-nav" aria-label="Navegação principal">
          <a className="nav-link active" href="#dashboard">
            <span className="nav-icon" aria-hidden="true">▦</span>
            <span>Dashboard</span>
          </a>
          <a
            className="nav-link"
            href="#minhas-tarefas"
            onClick={(event) => {
              event.preventDefault();
              document.getElementById("minhas-tarefas")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span className="nav-icon" aria-hidden="true">☷</span>
            <span>Minhas tarefas</span>
            <span className="nav-count">{totalTasks}</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="theme-card">
            <div className="theme-card-copy">
              <span className="theme-icon" aria-hidden="true">{isDark ? "☾" : "☼"}</span>
              <span>
                <strong>{isDark ? "Modo escuro" : "Modo claro"}</strong>
                <small>Personalize sua tela</small>
              </span>
            </div>
            <button
              type="button"
              className={`theme-toggle ${isDark ? "is-on" : ""}`}
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
              aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
              aria-pressed={isDark}
              title={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
            >
              <span />
            </button>
          </div>

          <div className="sidebar-user">
            <div className="user-avatar" aria-hidden="true">T</div>
            <div className="user-copy">
              <strong>Meu espaço</strong>
              <small>Área pessoal</small>
            </div>
            <button type="button" className="sidebar-logout" onClick={handleLogout} aria-label="Sair da conta" title="Sair">
              ↗
            </button>
          </div>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-separator">/</span><strong>Dashboard</strong></div>
          <div className="topbar-actions">
            <span className="topbar-date">Seu espaço de produtividade</span>
            <button type="button" className="topbar-theme-button" onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}>
              <span aria-hidden="true">{isDark ? "☼" : "☾"}</span>
              {isDark ? "Modo claro" : "Modo escuro"}
            </button>
            <button type="button" className="topbar-logout" onClick={handleLogout}>Sair <span aria-hidden="true">↗</span></button>
          </div>
        </header>

        <div className="page-content" id="dashboard">
          <section className="welcome-section">
            <div>
              <p className="eyebrow">VISÃO GERAL</p>
              <h1>Dashboard</h1>
              <p className="welcome-description">Organize suas tarefas e acompanhe seu progresso.</p>
            </div>
            <a className="primary-link" href="#nova-tarefa" onClick={(event) => {
              event.preventDefault();
              document.getElementById("nova-tarefa")?.scrollIntoView({ behavior: "smooth", block: "start" });
              document.getElementById("title")?.focus({ preventScroll: true });
            }}>
              <span aria-hidden="true">＋</span> Nova tarefa
            </a>
          </section>

          <section className="task-summary" aria-label="Resumo das tarefas">
            <article className="summary-card summary-total">
              <div className="summary-topline"><span className="summary-icon" aria-hidden="true">▦</span><span className="summary-trend">Geral</span></div>
              <p>Total de tarefas</p>
              <strong>{totalTasks}</strong>
              <small>Tarefas no seu espaço</small>
            </article>
            <article className="summary-card summary-pending">
              <div className="summary-topline"><span className="summary-icon" aria-hidden="true">◷</span><span className="summary-trend">Em andamento</span></div>
              <p>Pendentes</p>
              <strong>{pendingTasks}</strong>
              <small>Precisam da sua atenção</small>
            </article>
            <article className="summary-card summary-completed">
              <div className="summary-topline"><span className="summary-icon" aria-hidden="true">✓</span><span className="summary-trend">{completionRate}%</span></div>
              <p>Concluídas</p>
              <strong>{completedTasks}</strong>
              <small>Do total de tarefas</small>
              <div className="progress-track" aria-label={`${completionRate}% das tarefas concluídas`}>
                <span style={{ width: `${completionRate}%` }} />
              </div>
            </article>
          </section>

          {error && <p className="message error-message" role="alert">{error}</p>}
          {success && <p className="message success-message" role="status">{success}</p>}

          <section className="workspace-grid">
            <section className="panel task-form-panel" id="nova-tarefa">
              <div className="panel-heading">
                <div>
                  <span className="panel-kicker">{editingTask ? "ATUALIZE OS DETALHES" : "ADICIONE À SUA ROTINA"}</span>
                  <h2>{editingTask ? "Editar tarefa" : "Nova tarefa"}</h2>
                  <p>{editingTask ? "Altere as informações da tarefa selecionada." : "Registre o que você precisa fazer."}</p>
                </div>
                <span className="panel-heading-icon" aria-hidden="true">＋</span>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-field">
                  <label htmlFor="title">Título <span>*</span></label>
                  <input id="title" name="title" type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Estudar React" maxLength={100} required />
                  <small>{title.length}/100 caracteres</small>
                </div>
                <div className="form-field">
                  <label htmlFor="description">Descrição</label>
                  <textarea id="description" name="description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Adicione detalhes para não esquecer..." maxLength={1000} rows={4} />
                  <small>{description.length}/1000 caracteres</small>
                </div>
                <div className="form-field">
                  <label htmlFor="status">Status</label>
                  <select id="status" name="status" value={status} onChange={(event) => setStatus(event.target.value)}>
                    <option value="pendente">Pendente</option>
                    <option value="concluída">Concluída</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button type="submit" className="primary-button" disabled={loading}>
                    {loading ? "Salvando..." : editingTask ? "Salvar alterações" : "Criar tarefa"}
                    {!loading && <span aria-hidden="true">→</span>}
                  </button>
                  {editingTask && <button type="button" className="secondary-button" onClick={handleCancelEdit}>Cancelar</button>}
                </div>
              </form>
            </section>

            <section className="panel tasks-panel" id="minhas-tarefas">
              <div className="panel-heading tasks-panel-heading">
                <div>
                  <span className="panel-kicker">ACOMPANHAMENTO</span>
                  <h2>Minhas tarefas</h2>
                  <p>Um passo de cada vez.</p>
                </div>
                <span className="task-count">{filteredTasks.length} <span>de {totalTasks}</span></span>
              </div>

              <div className="task-filters">
                <label className="search-field">
                  <span aria-hidden="true">⌕</span>
                  <input type="search" placeholder="Buscar tarefa pelo título..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} aria-label="Buscar tarefas pelo título" />
                </label>
                <div className="filter-selects">
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filtrar tarefas por status">
                    <option value="todos">Todos os status</option>
                    <option value="pendente">Pendentes</option>
                    <option value="concluída">Concluídas</option>
                  </select>
                  <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} aria-label="Ordenar tarefas">
                    <option value="recentes">Mais recentes</option>
                    <option value="az">Título: A–Z</option>
                    <option value="za">Título: Z–A</option>
                  </select>
                </div>
              </div>

              {loadingTasks ? (
                <div className="empty-state"><span className="empty-state-icon" aria-hidden="true">◌</span><h3>Carregando tarefas...</h3><p>Estamos preparando sua lista.</p></div>
              ) : filteredTasks.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state-icon" aria-hidden="true">☷</span>
                  <h3>{tasks.length === 0 ? "Nenhuma tarefa cadastrada" : "Nenhuma tarefa encontrada"}</h3>
                  <p>{tasks.length === 0 ? "Crie sua primeira tarefa usando o formulário." : "Tente alterar a busca ou os filtros selecionados."}</p>
                </div>
              ) : (
                <ul className="tasks-list">
                  {filteredTasks.map((task) => {
                    const completed = task.status === "concluída";
                    return (
                      <li className={`task-item ${completed ? "task-is-completed" : ""}`} key={task._id}>
                        <span className={`task-check ${completed ? "checked" : ""}`} aria-hidden="true">{completed ? "✓" : "•"}</span>
                        <div className="task-content">
                          <h3>{task.title}</h3>
                          {task.description && <p>{task.description}</p>}
                          <div className="task-meta">
                            <span className={`task-status ${completed ? "status-completed" : "status-pending"}`}><span />{completed ? "Concluída" : "Pendente"}</span>
                            <span className="task-meta-label">{completed ? "Finalizada" : "A fazer"}</span>
                          </div>
                        </div>
                        <div className="task-actions">
                          <button type="button" className="edit-button" onClick={() => handleEdit(task)} aria-label={`Editar tarefa ${task.title}`}>Editar</button>
                          <button type="button" className="delete-button" onClick={() => handleDelete(task._id)} aria-label={`Excluir tarefa ${task.title}`} title="Excluir tarefa">×</button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </section>

          <footer className="dashboard-footer">
            <span>TaskFlow <span aria-hidden="true">·</span> Organize suas tarefas com clareza.</span>
            <span>Seu progresso, no seu ritmo.</span>
          </footer>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
