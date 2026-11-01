import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";

const THEME_KEY = "gerenciador-tarefas-theme";
const emojiOptions = [
  "📚","📖","✏️","📝","💡","🎯","⭐","🔥","💼","💻","📅","📌",
  "🏠","🏆","🎓","🧠","🎨","🎵","🎮","💰","🛒","✈️","🌱","❤️",
  "☕","⚡","🔧","📂","📊","🗂️","🧾","🔔","🧪","🌎","🚀","✅",
  "📷","🎬","🏋️","🧘","🍀","🌙","☀️","🔑","💬","📦","🖥️","🗓️"
];
const iconOptions = ["≡", "⌂", "▦", "◇", "○", "□", "＋", "✓", "☆", "♡", "⚑", "⌘", "⌕", "↗", "↻", "◷", "☼", "☾", "⚙", "∞", "⊙", "△", "⬡", "▱", "▤", "▣", "⊞", "⊟", "⌁", "⌖", "◈", "◉"];
const isImageIcon = (value) => typeof value === "string" && value.startsWith("data:image/");
const DashboardIcon = ({ value, className = "" }) => isImageIcon(value)
  ? <img className={`dashboard-custom-image ${className}`} src={value} alt="" />
  : <span className={className}>{value || "≡"}</span>;
const savedTheme = () => { try { return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark"; } catch { return "dark"; } };

export default function Dashboard() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(savedTheme);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => { try { return localStorage.getItem("taskflow-sidebar-collapsed-v2") === "true"; } catch { return false; } });
  const [dashboards, setDashboards] = useState([]);
  const [activeDashboardId, setActiveDashboardId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pendente");
  const [loading, setLoading] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [renameId, setRenameId] = useState("");
  const [renameDraft, setRenameDraft] = useState("");
  const [contextMenu, setContextMenu] = useState(null);
  const [iconPickerDashboard, setIconPickerDashboard] = useState(null);
  const [iconPickerTab, setIconPickerTab] = useState("emoji");
  const [iconSearch, setIconSearch] = useState("");
  const [draggedId, setDraggedId] = useState("");
  const activeDashboard = dashboards.find((d) => d._id === activeDashboardId) || null;
  const isDark = theme === "dark";

  useEffect(() => { document.documentElement.dataset.theme = theme; try { localStorage.setItem(THEME_KEY, theme); } catch {} }, [theme]);
  useEffect(() => { try { localStorage.setItem("taskflow-sidebar-collapsed-v2", String(sidebarCollapsed)); } catch {} }, [sidebarCollapsed]);
  useEffect(() => { const close = () => setContextMenu(null); window.addEventListener("click", close); return () => window.removeEventListener("click", close); }, []);

  const loadDashboards = useCallback(async (preferred) => {
    const res = await api.get("/dashboards");
    const list = res.data.dashboards || [];
    setDashboards(list);
    const id = (preferred && list.some((d) => d._id === preferred) && preferred) || (activeDashboardId && list.some((d) => d._id === activeDashboardId) && activeDashboardId) || list[0]?._id || "";
    setActiveDashboardId(id);
    return id;
  }, [activeDashboardId]);
  const loadTasks = useCallback(async (dashboardId) => {
    if (!dashboardId) { setTasks([]); setLoadingTasks(false); return; }
    setLoadingTasks(true);
    try { const res = await api.get("/tasks", { params: { dashboardId } }); setTasks(res.data.tasks || []); setError(""); }
    catch (e) { setError(e.response?.data?.message || "Não foi possível carregar as tarefas."); }
    finally { setLoadingTasks(false); }
  }, []);
  useEffect(() => { loadDashboards().catch((e) => setError(e.response?.data?.message || "Não foi possível carregar os dashboards.")); /* initial load */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { loadTasks(activeDashboardId); }, [activeDashboardId, loadTasks]);

  const resetForm = () => { setTitle(""); setDescription(""); setStatus("pendente"); setEditingTask(null); };
  const openNewTask = () => { resetForm(); setError(""); setModalOpen(true); };
  const openEditTask = (task) => { setEditingTask(task); setTitle(task.title || ""); setDescription(task.description || ""); setStatus(task.status || "pendente"); setError(""); setModalOpen(true); };
  const submitTask = async (event) => {
    event.preventDefault(); setError(""); setNotice("");
    if (!title.trim()) return setError("O título da tarefa é obrigatório.");
    if (!activeDashboardId) return setError("Selecione um dashboard primeiro.");
    setLoading(true);
    try {
      const payload = { title: title.trim(), description: description.trim(), status };
      if (editingTask) await api.put(`/tasks/${editingTask._id}`, payload);
      else await api.post("/tasks", { ...payload, dashboardId: activeDashboardId });
      setModalOpen(false); resetForm(); await loadTasks(activeDashboardId); setNotice(editingTask ? "Tarefa atualizada." : "Tarefa criada.");
    } catch (e) { setError(e.response?.data?.message || "Não foi possível salvar a tarefa."); }
    finally { setLoading(false); }
  };
  const toggleTask = async (task) => {
    const next = task.status === "concluída" ? "pendente" : "concluída";
    try { await api.put(`/tasks/${task._id}`, { title: task.title, description: task.description || "", status: next }); setTasks((old) => old.map((t) => t._id === task._id ? { ...t, status: next } : t)); }
    catch (e) { setError(e.response?.data?.message || "Não foi possível atualizar o status."); }
  };
  const deleteTask = async (task) => {
    if (!window.confirm(`Excluir “${task.title}”?`)) return;
    try { await api.delete(`/tasks/${task._id}`); await loadTasks(activeDashboardId); setNotice("Tarefa excluída."); }
    catch (e) { setError(e.response?.data?.message || "Não foi possível excluir a tarefa."); }
  };
  const createDashboard = async () => {
    const name = window.prompt("Nome do dashboard:", "Novo dashboard");
    if (name === null) return;
    if (!name.trim()) return setError("Digite um nome para o dashboard.");
    try { const res = await api.post("/dashboards", { name: name.trim(), icon: "≡" }); await loadDashboards(res.data.dashboard?._id); setNotice("Dashboard criado."); setError(""); }
    catch (e) { setError(e.response?.data?.message || "Não foi possível criar o dashboard."); }
  };
  const renameDashboard = async (dashboard) => {
    if (!renameDraft.trim()) return setRenameId("");
    try { const res = await api.patch(`/dashboards/${dashboard._id}`, { name: renameDraft.trim() }); setDashboards((old) => old.map((d) => d._id === dashboard._id ? res.data.dashboard : d)); setNotice("Nome atualizado."); setError(""); }
    catch (e) { setError(e.response?.data?.message || "Não foi possível renomear."); }
    setRenameId("");
  };
  const updateDashboardIcon = async (dashboard, icon) => {
    try {
      const res = await api.patch(`/dashboards/${dashboard._id}`, { icon });
      setDashboards((old) => old.map((d) => d._id === dashboard._id ? { ...d, ...(res.data.dashboard || {}), icon } : d));
      setIconPickerDashboard(null);
      setIconSearch("");
      setNotice(icon ? "Ícone atualizado." : "Ícone removido.");
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || "Não foi possível atualizar o ícone.");
    }
  };
  const uploadDashboardIcon = (event, dashboard) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Selecione um arquivo de imagem."); event.target.value = ""; return; }
    if (file.size > 1024 * 1024) { setError("A imagem deve ter no máximo 1 MB."); event.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => updateDashboardIcon(dashboard, String(reader.result || ""));
    reader.onerror = () => setError("Não foi possível ler a imagem selecionada.");
    reader.readAsDataURL(file);
    event.target.value = "";
  };
  const openIconPicker = (dashboard) => { setIconPickerDashboard(dashboard); setIconPickerTab("emoji"); setIconSearch(""); };
  const updateCover = async (dashboard) => {
    const coverUrl = window.prompt("URL da imagem de capa (vazio remove a capa):", dashboard.coverUrl || "");
    if (coverUrl === null) return;
    try { const res = await api.patch(`/dashboards/${dashboard._id}`, { coverUrl: coverUrl.trim() }); setDashboards((old) => old.map((d) => d._id === dashboard._id ? res.data.dashboard : d)); setNotice("Capa atualizada."); }
    catch (e) { setError(e.response?.data?.message || "Não foi possível atualizar a capa."); }
  };
  const duplicateDashboard = async (dashboard) => {
    try { const res = await api.post(`/dashboards/${dashboard._id}/duplicate`); await loadDashboards(res.data.dashboard?._id); setNotice("Dashboard duplicado."); setError(""); }
    catch (e) { setError(e.response?.data?.message || "Não foi possível duplicar."); }
  };
  const archiveDashboard = async (dashboard) => {
    if (!window.confirm(`Arquivar “${dashboard.name}”?`)) return;
    try { await api.delete(`/dashboards/${dashboard._id}`); const remaining = dashboards.filter((d) => d._id !== dashboard._id); setDashboards(remaining); if (activeDashboardId === dashboard._id) setActiveDashboardId(remaining[0]?._id || ""); setNotice("Dashboard arquivado."); }
    catch (e) { setError(e.response?.data?.message || "Não foi possível arquivar."); }
  };
  const reorder = (target) => {
    if (!draggedId || draggedId === target._id) return;
    const ordered = [...tasks]; const from = ordered.findIndex((t) => t._id === draggedId); const to = ordered.findIndex((t) => t._id === target._id);
    if (from < 0 || to < 0) return;
    const [item] = ordered.splice(from, 1); ordered.splice(to, 0, item); setTasks(ordered.map((t, i) => ({ ...t, position: i }))); setDraggedId("");
  };
  const filteredTasks = useMemo(() => tasks.filter((t) => (t.title || "").toLowerCase().includes(search.toLowerCase().trim())).filter((t) => statusFilter === "todos" || t.status === statusFilter).sort((a, b) => (a.position ?? 0) - (b.position ?? 0)), [tasks, search, statusFilter]);
  const total = tasks.length; const done = tasks.filter((t) => t.status === "concluída").length; const pending = total - done;
  const logout = () => { localStorage.removeItem("token"); navigate("/login"); };

  return <main className={`notion-app ${isDark ? "theme-dark" : "theme-light"} ${sidebarCollapsed ? "sidebar-is-collapsed" : ""}`}>
    <aside className="notion-sidebar">
      <div className="notion-brand"><span className="brand-check">✓</span><strong>TaskFlow</strong><button className="sidebar-collapse" onClick={() => setSidebarCollapsed((value) => !value)} aria-label={sidebarCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"} title={sidebarCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}>{sidebarCollapsed ? "›" : "‹"}</button></div>
      <div className="side-label">ESPAÇO</div>
      <button className="side-link" onClick={() => { setSearch(""); setStatusFilter("todos"); }}><span className="side-icon">⌂</span>Visão geral</button>
      <div className="side-label dashboards-label">MEUS DASHBOARDS</div>
      <nav className="dashboard-nav" aria-label="Meus dashboards">
        {dashboards.map((d) => <div key={d._id} className={`dashboard-nav-item ${d._id === activeDashboardId ? "selected" : ""}`} onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, dashboard: d }); }}>
          {renameId === d._id ? <form className="rename-inline" onSubmit={(e) => { e.preventDefault(); renameDashboard(d); }}><input autoFocus value={renameDraft} onChange={(e) => setRenameDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") setRenameId(""); }} /><button aria-label="Salvar nome">✓</button></form> : <><button className="dashboard-nav-open" onClick={() => setActiveDashboardId(d._id)}><DashboardIcon value={d.icon === "▤" ? "≡" : d.icon} className="side-icon dashboard-emoji" /><span className="nav-dashboard-text">{d.name}</span></button><button className="nav-more" aria-label={`Opções de ${d.name}`} onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setContextMenu({ x: r.right, y: r.bottom, dashboard: d }); }}>···</button></>}
        </div>)}
      </nav>
      <button className="side-link add-dashboard" onClick={createDashboard}><span className="side-icon">＋</span>Novo dashboard</button>
      <div className="sidebar-spacer" />
      <div className="sidebar-bottom"><button className="theme-switch-row" onClick={() => setTheme(isDark ? "light" : "dark")}><span className="side-icon">{isDark ? "☾" : "☼"}</span><span>Modo {isDark ? "escuro" : "claro"}</span><span className={`switch ${isDark ? "on" : ""}`}><i /></span></button><div className="sidebar-profile"><span className="profile-avatar">N</span><span className="profile-label"><strong>Meu espaço</strong><small>Área pessoal</small></span><button className="profile-exit" onClick={logout} title="Sair">↗</button></div></div>
    </aside>
    <section className="notion-main">
      <header className="notion-topbar"><div className="crumbs"><span>⌂</span><span>Meus dashboards</span><i>/</i><strong>{activeDashboard?.name || "Dashboard"}</strong></div><div className="topbar-tools"><label className="top-search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar" aria-label="Buscar tarefas" /></label><button className="icon-tool" onClick={() => setTheme(isDark ? "light" : "dark")} title="Alternar tema">{isDark ? "☾" : "☼"}</button><span className="top-avatar">N</span><button className="top-logout" onClick={logout} title="Sair">⌄</button></div></header>
      <div className="notion-content">
        {activeDashboard?.coverUrl && <div className="notion-cover" style={{ backgroundImage: `linear-gradient(0deg, var(--page-bg), transparent 65%), url("${activeDashboard.coverUrl.replace(/"/g, "%22")}")` }} />}
        <section className="notion-page-heading"><button className="page-icon" type="button" onClick={() => activeDashboard && openIconPicker(activeDashboard)} aria-label="Trocar ícone do dashboard" title="Trocar ícone"><DashboardIcon value={activeDashboard?.icon === "▤" ? "≡" : activeDashboard?.icon} /></button><div className="page-title-line"><div><h1>{activeDashboard?.name || "Meus dashboards"}</h1><p>Organize suas tarefas, atividades e prazos.</p></div><button className="primary-action" onClick={openNewTask}><span>＋</span> Nova tarefa</button></div>
          <div className="page-toolbar"><button className="view-picker">▤ <span>Todas as tarefas</span>⌄</button><button className="view-tab active">▤ <span>Tabela</span></button><button className="view-tab" title="Visualização em quadro ainda não disponível">◫ <span>Quadro</span></button><button className="view-tab" title="Calendário ainda não disponível">▦ <span>Calendário</span></button><div className="toolbar-spacer" /><button className="page-menu-button" onClick={() => activeDashboard && updateCover(activeDashboard)}>Capa</button><button className="page-menu-button" onClick={() => { if (activeDashboard) { setRenameId(activeDashboard._id); setRenameDraft(activeDashboard.name); } }}>···</button></div>
        </section>
        {(error || notice) && <div className={`inline-message ${error ? "has-error" : ""}`} role={error ? "alert" : "status"}>{error || notice}<button onClick={() => { setError(""); setNotice(""); }}>×</button></div>}
        <section className="table-card" aria-label="Tabela de tarefas"><div className="table-scroll"><table className="notion-table"><thead><tr><th className="drag-col"></th><th className="check-col"><span title="Concluída">☑</span></th><th className="name-col"><span className="property-type">Aa</span>Tarefa</th><th><span className="property-type">◷</span>Status</th><th className="action-col">Ações</th></tr></thead><tbody>
          {loadingTasks ? <tr><td colSpan="5" className="table-empty">Carregando tarefas…</td></tr> : filteredTasks.length === 0 ? <tr><td colSpan="5" className="table-empty"><span>▤</span><strong>{tasks.length ? "Nenhuma tarefa encontrada" : "Esta página ainda está vazia"}</strong><small>{tasks.length ? "Tente mudar a busca ou o filtro." : "Adicione uma tarefa para começar."}</small><button onClick={openNewTask}>＋ Nova tarefa</button></td></tr> : filteredTasks.map((task) => { const completed = task.status === "concluída"; return <tr key={task._id} draggable={!search && statusFilter === "todos"} onDragStart={() => setDraggedId(task._id)} onDragOver={(e) => e.preventDefault()} onDrop={() => reorder(task)} className={`${completed ? "is-complete" : ""} ${draggedId === task._id ? "is-dragging" : ""}`}><td className="drag-handle" title="Arraste para reordenar">⠿</td><td><button className={`table-checkbox ${completed ? "checked" : ""}`} onClick={() => toggleTask(task)} aria-label={completed ? `Reabrir ${task.title}` : `Concluir ${task.title}`}>{completed ? "✓" : ""}</button></td><td className="task-name-cell"><button className="task-name-button" onClick={() => openEditTask(task)}>{task.title}</button>{task.description && <small>{task.description}</small>}</td><td><button className={`status-pill ${completed ? "completed" : "pending"}`} onClick={() => toggleTask(task)}><i />{completed ? "Concluída" : "Pendente"}</button></td><td><div className="row-actions"><button onClick={() => openEditTask(task)} title="Editar tarefa">···</button><button className="delete-task-button" onClick={() => deleteTask(task)} title="Excluir tarefa" aria-label={`Excluir ${task.title}`}><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13M10 11v5m4-5v5" /></svg></button></div></td></tr>; })}
          </tbody><tfoot><tr><td></td><td></td><td colSpan="3"><button className="add-row" onClick={openNewTask}>＋ Nova página</button><span className="reorder-hint">↕ Arraste e solte para reordenar as tarefas</span></td></tr></tfoot></table></div></section>
        <footer className="notion-summary"><span className="summary-symbol">◉</span><div className="summary-copy"><strong>{total} {total === 1 ? "tarefa no total" : "tarefas no total"}</strong><small>{pending} pendentes · {done} concluídas</small></div><div className="summary-updated"><span>◷</span><div><small>Visão geral</small><strong>{Math.round((done / (total || 1)) * 100)}% concluído</strong></div></div></footer>
      </div>
    </section>
    {modalOpen && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) { setModalOpen(false); resetForm(); } }}><section className="task-modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title"><header><div><small>{editingTask ? "EDITAR ITEM" : "NOVA PÁGINA"}</small><h2 id="task-modal-title">{editingTask ? "Editar tarefa" : "Adicionar tarefa"}</h2></div><button className="modal-close" onClick={() => { setModalOpen(false); resetForm(); }} aria-label="Fechar">×</button></header><form onSubmit={submitTask}><label htmlFor="task-title">Nome da tarefa</label><input id="task-title" autoFocus maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Estudar React" required /><label htmlFor="task-description">Descrição <span>Opcional</span></label><textarea id="task-description" maxLength={1000} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Adicione detalhes…" /><label htmlFor="task-status">Status</label><select id="task-status" value={status} onChange={(e) => setStatus(e.target.value)}><option value="pendente">Pendente</option><option value="concluída">Concluída</option></select>{error && <p className="modal-error">{error}</p>}<footer><button type="button" className="modal-cancel" onClick={() => { setModalOpen(false); resetForm(); }}>Cancelar</button><button className="primary-action" type="submit" disabled={loading}>{loading ? "Salvando…" : editingTask ? "Salvar alterações" : "Criar tarefa"}</button></footer></form></section></div>}
    {iconPickerDashboard && <div className="icon-picker-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setIconPickerDashboard(null); }}>
      <section className="icon-picker" role="dialog" aria-modal="true" aria-label="Escolher ícone do dashboard">
        <header className="icon-picker-header"><strong>Personalizar ícone</strong><button type="button" onClick={() => setIconPickerDashboard(null)} aria-label="Fechar">×</button></header>
        <div className="icon-picker-tabs"><button className={iconPickerTab === "emoji" ? "active" : ""} onClick={() => setIconPickerTab("emoji")}>Emoji</button><button className={iconPickerTab === "icons" ? "active" : ""} onClick={() => setIconPickerTab("icons")}>Ícones</button><label className={`upload-icon-tab ${iconPickerTab === "upload" ? "active" : ""}`}>Fazer upload<input type="file" accept="image/*" onChange={(e) => uploadDashboardIcon(e, iconPickerDashboard)} /></label><button className="remove-icon" onClick={() => updateDashboardIcon(iconPickerDashboard, "")}>Remover</button></div>
        <label className="icon-picker-search"><span>⌕</span><input value={iconSearch} onChange={(e) => setIconSearch(e.target.value)} placeholder={iconPickerTab === "emoji" ? "Buscar emoji…" : "Buscar ícone…"} autoFocus /></label>
        {iconPickerTab === "upload" ? <div className="icon-upload-hint">Escolha uma imagem no botão “Fazer upload”. PNG, JPG ou WEBP, até 1 MB.</div> : <div className="icon-picker-grid">{(iconPickerTab === "emoji" ? emojiOptions : iconOptions).filter((item) => !iconSearch || item.toLocaleLowerCase().includes(iconSearch.toLocaleLowerCase())).map((item, i) => <button key={`${item}-${i}`} type="button" onClick={() => updateDashboardIcon(iconPickerDashboard, item)} title={`Usar ${item}`}>{item}</button>)}{(iconPickerTab === "emoji" ? emojiOptions : iconOptions).filter((item) => !iconSearch || item.toLocaleLowerCase().includes(iconSearch.toLocaleLowerCase())).length === 0 && <p className="icon-picker-empty">Nenhum resultado encontrado.</p>}</div>}
        <footer>O ícone será salvo neste dashboard.</footer>
      </section>
    </div>}
    {contextMenu && <div className="notion-context-menu" style={{ left: Math.min(contextMenu.x, window.innerWidth - 205), top: Math.min(contextMenu.y, window.innerHeight - 180) }} onClick={(e) => e.stopPropagation()}><strong>{contextMenu.dashboard.name}</strong><button onClick={() => { setActiveDashboardId(contextMenu.dashboard._id); setRenameId(contextMenu.dashboard._id); setRenameDraft(contextMenu.dashboard.name); setContextMenu(null); }}>✎ Renomear</button><button onClick={() => { updateCover(contextMenu.dashboard); setContextMenu(null); }}>▧ Personalizar capa</button><button onClick={() => { duplicateDashboard(contextMenu.dashboard); setContextMenu(null); }}>▣ Duplicar</button><button className="danger" onClick={() => { archiveDashboard(contextMenu.dashboard); setContextMenu(null); }}>⌫ Arquivar</button></div>}
  </main>;
}
