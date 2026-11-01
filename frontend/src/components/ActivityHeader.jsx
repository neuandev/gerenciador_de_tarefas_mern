function ActivityHeader() {
  return (
    <header className="activity-header">
      <div className="activity-brand">
        <div className="brand-mark">✓</div>
        <span>TaskFlow</span>
      </div>
      <div className="header-right">
        <span className="header-date">Painel de produtividade</span>
        <div className="user-avatar" aria-label="Perfil do usuário">NS</div>
      </div>
    </header>
  );
}

export default ActivityHeader;
