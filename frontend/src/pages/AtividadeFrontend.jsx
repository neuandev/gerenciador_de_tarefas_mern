import { useMemo, useState } from "react";
import ActivityHeader from "../components/ActivityHeader";
import ActivitySidebar from "../components/ActivitySidebar";
import TaskCard from "../components/TaskCard";
import "./AtividadeFrontend.css";

const initialTasks = [
  { id: 1, title: "Revisar identidade visual", description: "Ajustar cores, tipografia e consistência dos componentes do projeto.", category: "Design", categoryKey: "design", owner: "Neuan S.", initials: "NS", date: "Hoje", status: "pendente" },
  { id: 2, title: "Finalizar tela de cadastro", description: "Validar os campos e revisar o fluxo de criação de conta.", category: "Desenvolvimento", categoryKey: "dev", owner: "Sophia L.", initials: "SL", date: "Hoje", status: "pendente" },
  { id: 3, title: "Organizar documentação", description: "Atualizar o README com instalação, estrutura e instruções de execução.", category: "Documentação", categoryKey: "docs", owner: "Neuan S.", initials: "NS", date: "02 nov", status: "concluida" },
  { id: 4, title: "Implementar filtros de tarefas", description: "Permitir visualizar todas, pendentes e concluídas no painel.", category: "Desenvolvimento", categoryKey: "dev", owner: "Sophia L.", initials: "SL", date: "03 nov", status: "pendente" },
  { id: 5, title: "Preparar apresentação", description: "Selecionar capturas de tela e organizar a demonstração da aplicação.", category: "Acadêmico", categoryKey: "academic", owner: "Neuan S.", initials: "NS", date: "04 nov", status: "pendente" },
  { id: 6, title: "Testar responsividade", description: "Conferir a experiência em telas menores e corrigir espaçamentos.", category: "Design", categoryKey: "design", owner: "Sophia L.", initials: "SL", date: "05 nov", status: "concluida" },
];

function AtividadeFrontend() {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeFilter, setActiveFilter] = useState("todas");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => ({
    all: tasks.length,
    pending: tasks.filter((task) => task.status === "pendente").length,
    done: tasks.filter((task) => task.status === "concluida").length,
  }), [tasks]);

  const visibleTasks = useMemo(() => tasks.filter((task) => {
    const matchesFilter = activeFilter === "todas" || task.status === activeFilter;
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || `${task.title} ${task.description} ${task.owner}`.toLowerCase().includes(term);
    return matchesFilter && matchesSearch;
  }), [tasks, activeFilter, search]);

  const toggleTask = (id) => {
    setTasks((current) => current.map((task) => (
      task.id === id
        ? { ...task, status: task.status === "concluida" ? "pendente" : "concluida" }
        : task
    )));
  };

  const progress = counts.all ? Math.round((counts.done / counts.all) * 100) : 0;

  return (
    <div className="activity-app">
      <ActivityHeader />
      <div className="activity-layout">
        <ActivitySidebar activeFilter={activeFilter} onFilterChange={setActiveFilter} counts={counts} />
        <main className="activity-main">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">VISÃO GERAL</p>
              <h1>Olá, Neuan <span>✦</span></h1>
              <p className="welcome-subtitle">Aqui está o resumo das suas atividades.</p>
            </div>
            <div className="today-chip">◷ &nbsp; Domingo, 01 de novembro</div>
          </div>

          <section className="stats-grid" aria-label="Resumo das tarefas">
            <div className="stat-card"><span className="stat-label">Total de tarefas</span><strong>{counts.all.toString().padStart(2, "0")}</strong><span className="stat-foot">Atividades cadastradas</span></div>
            <div className="stat-card"><span className="stat-label">Em andamento</span><strong>{counts.pending.toString().padStart(2, "0")}</strong><span className="stat-foot">Precisam da sua atenção</span></div>
            <div className="stat-card"><span className="stat-label">Concluídas</span><strong>{counts.done.toString().padStart(2, "0")}</strong><span className="stat-foot">Você está avançando!</span></div>
          </section>

          <section className="progress-panel">
            <div className="progress-copy"><div><strong>Progresso geral</strong><p>Continue assim. Cada etapa conta.</p></div><strong className="progress-value">{progress}%</strong></div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          </section>

          <section className="tasks-section">
            <div className="section-heading"><div><p className="eyebrow">SEU TRABALHO</p><h2>Minhas tarefas <span>{visibleTasks.length}</span></h2></div>
              <label className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar tarefa..." aria-label="Buscar tarefa" /></label>
            </div>
            {visibleTasks.length ? <div className="activity-task-grid">{visibleTasks.map((task) => <TaskCard key={task.id} task={task} onToggle={toggleTask} />)}</div> : <div className="empty-state">Nenhuma tarefa encontrada para esse filtro.</div>}
          </section>
          <footer className="activity-footer">TaskFlow · Demonstração de Front-end com dados simulados em React</footer>
        </main>
      </div>
    </div>
  );
}

export default AtividadeFrontend;
