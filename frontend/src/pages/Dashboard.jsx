import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [tasks, setTasks] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

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
      await api.post("/tasks", {
        title,
        description,
        status: "pendente",
      });

      setTitle("");
      setDescription("");

      setSuccess("Tarefa criada com sucesso!");

      await carregarTarefas();
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);

      setError(error.response?.data?.message || "Erro ao criar a tarefa.");
    } finally {
      setLoading(false);
    }
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

      <h2>Nova tarefa</h2>

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

        <button type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar tarefa"}
        </button>
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

              <button onClick={() => handleDelete(task._id)}>Excluir</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;
