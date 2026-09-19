import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [tasks, setTasks] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pendente");

  const [editingTask, setEditingTask] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const carregarTarefas = async () => {
    try {
      const response = await api.get("/tasks");

      setTasks(response.data.tasks);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);

      setError(error.response?.data?.message || "Erro ao carregar as tarefas.");
    }
  };

  useEffect(() => {
    carregarTarefas();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("O título da tarefa é obrigatório.");
      return;
    }

    setLoading(true);

    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, {
          title,
          description,
          status,
        });

        setSuccess("Tarefa atualizada com sucesso!");
      } else {
        await api.post("/tasks", {
          title,
          description,
          status: "pendente",
        });

        setSuccess("Tarefa criada com sucesso!");
      }

      setTitle("");
      setDescription("");
      setStatus("pendente");
      setEditingTask(null);

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
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setStatus("pendente");

    setError("");
    setSuccess("");
  };

  const handleDelete = async (id) => {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir esta tarefa?",
    );

    if (!confirmar) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.delete(`/tasks/${id}`);

      setSuccess("Tarefa excluída com sucesso!");

      await carregarTarefas();
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);

      setError(error.response?.data?.message || "Erro ao excluir a tarefa.");
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>

      <p>Gerenciador de tarefas</p>

      <hr />

      <h2>{editingTask ? "Editar tarefa" : "Nova tarefa"}</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Título</label>

          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Digite o título da tarefa"
          />
        </div>

        <div>
          <label htmlFor="description">Descrição</label>

          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Digite a descrição da tarefa"
          />
        </div>

        <div>
          <label htmlFor="status">Status</label>

          <select
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="pendente">Pendente</option>
            <option value="concluída">Concluída</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading
            ? "Salvando..."
            : editingTask
              ? "Salvar alterações"
              : "Criar tarefa"}
        </button>

        {editingTask && (
          <button type="button" onClick={handleCancelEdit}>
            Cancelar
          </button>
        )}
      </form>

      {error && <p>{error}</p>}

      {success && <p>{success}</p>}

      <hr />

      <h2>Minhas tarefas</h2>

      {tasks.length === 0 ? (
        <p>Nenhuma tarefa encontrada.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task._id}>
              <strong>{task.title}</strong>

              {task.description && <p>{task.description}</p>}

              <span>Status: {task.status}</span>

              <br />

              <button onClick={() => handleEdit(task)}>Editar</button>

              <button onClick={() => handleDelete(task._id)}>Excluir</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;
