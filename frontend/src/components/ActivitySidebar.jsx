function ActivitySidebar({ activeFilter, onFilterChange, counts }) {
  const filters = [
    { id: "todas", label: "Todas as tarefas", icon: "▦", count: counts.all },
    { id: "pendente", label: "Em andamento", icon: "◷", count: counts.pending },
    { id: "concluida", label: "Concluídas", icon: "✓", count: counts.done },
  ];

  return (
    <aside className="activity-sidebar">
      <p className="sidebar-caption">MENU</p>
      <nav aria-label="Filtros de tarefas">
        {filters.map((filter) => (
          <button
            className={`sidebar-link ${activeFilter === filter.id ? "active" : ""}`}
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            type="button"
          >
            <span className="sidebar-icon">{filter.icon}</span>
            <span>{filter.label}</span>
            <span className="sidebar-count">{filter.count}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-tip">
        <span className="tip-icon">✦</span>
        <strong>Uma coisa de cada vez.</strong>
        <p>Organize suas prioridades e avance no seu ritmo.</p>
      </div>
    </aside>
  );
}

export default ActivitySidebar;
