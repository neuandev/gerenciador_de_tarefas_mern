import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const carregarTarefas = async () => {
      try {
        const response = await api.get("/tasks");

        setTasks(response.data.tasks);
      } catch (error) {
        console.error("Erro ao buscar tarefas:", error);

        setError(
          error.response?.data?.message || "Erro ao carregar as tarefas.",
        );
      }
    };

    carregarTarefas();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>

      <p>Gerenciador de tarefas</p>

      {error && <p>{error}</p>}

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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;
