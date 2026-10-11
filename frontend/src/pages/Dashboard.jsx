import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";

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

  const navigate = useNavigate();

  const carregarTarefas = async () => {
    try {
      const response = await api.get("/tasks");
      setTasks(response.data.tasks);
      setError("");
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      setError(
        error.response?.data?.message ||
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
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
      setError(error.response?.data?.message || "Erro ao salvar a tarefa.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setStatus(task.status);
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
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir esta tarefa?",
    );

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
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      setError(error.response?.data?.message || "Erro ao excluir a tarefa.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const totalTasks = tasks.length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "pendente",
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "concluída",
  ).length;

  const filteredTasks = tasks
    .filter((task) =>
      (task.title || "")
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase()),
    )
    .filter((task) =>
      statusFilter === "todos" ? true : task.status === statusFilter,
    )
    .sort((a, b) => {
      if (sortOrder === "az") {
        return (a.title || "").localeCompare(b.title || "", "pt-BR");
      }

      if (sortOrder === "za") {
        return (b.title || "").localeCompare(a.title || "", "pt-BR");
      }

      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();

      return dateB - dateA;
    });

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Organize suas tarefas e acompanhe seu progresso.</p>
        </div>

        <button type="button" className="logout-button" onClick={handleLogout}>
          Sair
        </button>
      </header>

      <section className="task-summary" aria-label="Resumo das tarefas">
        <div className="summary-card">
          <span>Total de tarefas</span>
          <strong>{totalTasks}</strong>
        </div>

        <div className="summary-card">
          <span>Pendentes</span>
          <strong>{pendingTasks}</strong>
        </div>

        <div className="summary-card">
          <span>Concluídas</span>
          <strong>{completedTasks}</strong>
        </div>
      </section>

      <section className="task-form">
        <h2>{editingTask ? "Editar tarefa" : "Nova tarefa"}</h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title">Título</label>
            <input
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex.: Estudar React"
              maxLength={100}
              required
            />
            <small>{title.length}/100 caracteres</small>
          </div>

          <div>
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Descreva sua tarefa..."
              maxLength={1000}
              rows={4}
            />
            <small>{description.length}/1000 caracteres</small>
          </div>

          <div>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="pendente">Pendente</option>
              <option value="concluída">Concluída</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading
                ? "Salvando..."
                : editingTask
                  ? "Salvar alterações"
                  : "Criar tarefa"}
            </button>

            {editingTask && (
              <button
                type="button"
                className="cancel-button"
                onClick={handleCancelEdit}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      {error && (
        <p className="message error-message" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="message success-message" role="status">
          {success}
        </p>
      )}

      <section className="tasks-section">
        <div className="tasks-heading">
          <div>
            <h2>Minhas tarefas</h2>
            <p>Pesquise e organize suas atividades.</p>
          </div>

          <span className="task-count">
            {filteredTasks.length} de {totalTasks}
          </span>
        </div>

        <div className="task-filters">
          <input
            type="search"
            placeholder="Buscar tarefa pelo título..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Buscar tarefas pelo título"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filtrar tarefas por status"
          >
            <option value="todos">Todos os status</option>
            <option value="pendente">Pendentes</option>
            <option value="concluída">Concluídas</option>
          </select>

          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            aria-label="Ordenar tarefas"
          >
            <option value="recentes">Mais recentes</option>
            <option value="az">Título: A–Z</option>
            <option value="za">Título: Z–A</option>
          </select>
        </div>

        {loadingTasks ? (
          <p className="empty-state">Carregando tarefas...</p>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <h3>
              {tasks.length === 0
                ? "Nenhuma tarefa cadastrada"
                : "Nenhuma tarefa encontrada"}
            </h3>
            <p>
              {tasks.length === 0
                ? "Crie sua primeira tarefa usando o formulário acima."
                : "Tente alterar a busca ou os filtros selecionados."}
            </p>
          </div>
        ) : (
          <ul className="tasks-list">
            {filteredTasks.map((task) => (
              <li className="task-item" key={task._id}>
                <div className="task-content">
                  <h3>{task.title}</h3>

                  {task.description && <p>{task.description}</p>}

                  <span
                    className={`task-status ${
                      task.status === "concluída"
                        ? "status-completed"
                        : "status-pending"
                    }`}
                  >
                    {task.status === "concluída" ? "Concluída" : "Pendente"}
                  </span>
                </div>

                <div className="task-actions">
                  <button
                    type="button"
                    className="edit-button"
                    onClick={() => handleEdit(task)}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => handleDelete(task._id)}
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default Dashboard;
