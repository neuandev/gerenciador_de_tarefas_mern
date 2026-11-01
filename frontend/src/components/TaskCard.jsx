function TaskCard({ task, onToggle }) {
  return (
    <article className={`activity-task-card ${task.status === "concluida" ? "is-done" : ""}`}>
      <div className="task-card-top">
        <span className={`task-category category-${task.categoryKey}`}>{task.category}</span>
        <span className="task-date">{task.date}</span>
      </div>
      <h3>{task.title}</h3>
      <p className="task-description">{task.description}</p>
      <div className="task-card-bottom">
        <div className="task-assignee">
          <span className="assignee-avatar">{task.initials}</span>
          <span>{task.owner}</span>
        </div>
        <button
          className={`task-toggle ${task.status === "concluida" ? "completed" : ""}`}
          onClick={() => onToggle(task.id)}
          type="button"
          aria-label={task.status === "concluida" ? `Reabrir ${task.title}` : `Concluir ${task.title}`}
        >
          {task.status === "concluida" ? "✓ Concluída" : "Marcar concluída"}
        </button>
      </div>
    </article>
  );
}

export default TaskCard;
