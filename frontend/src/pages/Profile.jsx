import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", currentPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    api.get("/auth/me").then(({ data }) => setForm((old) => ({ ...old, name: data.user.name, email: data.user.email })))
      .catch((e) => setError(e.response?.data?.message || "Não foi possível carregar seu perfil."))
      .finally(() => setLoading(false));
  }, []);
  const change = (key) => (event) => setForm((old) => ({ ...old, [key]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault(); setError(""); setMessage(""); setSaving(true);
    try {
      const { data } = await api.patch("/auth/me", form);
      if (data.token) localStorage.setItem("token", data.token);
      setForm((old) => ({ ...old, name: data.user.name, email: data.user.email, currentPassword: "", newPassword: "" }));
      setMessage(data.message || "Perfil atualizado.");
    } catch (e) { setError(e.response?.data?.message || "Não foi possível salvar as alterações."); }
    finally { setSaving(false); }
  };
  return <main className="profile-page">
    <header className="profile-top"><Link to="/dashboard">← Voltar ao dashboard</Link><span>TaskFlow</span></header>
    <section className="profile-wrap">
      <div className="profile-heading"><span className="profile-kicker">CONTA</span><h1>Meu perfil</h1><p>Gerencie suas informações pessoais e sua senha.</p></div>
      {loading ? <p>Carregando perfil…</p> : <form className="profile-form" onSubmit={submit}>
        <div className="profile-avatar-large">{form.name.trim().charAt(0).toUpperCase() || "U"}</div>
        <label>Nome completo<input value={form.name} onChange={change("name")} minLength={2} maxLength={80} required /></label>
        <label>E-mail<input type="email" value={form.email} onChange={change("email")} required /></label>
        <div className="profile-divider"><strong>Alterar senha</strong><span>Deixe em branco para manter a senha atual.</span></div>
        <label>Senha atual<input type="password" autoComplete="current-password" value={form.currentPassword} onChange={change("currentPassword")} /></label>
        <label>Nova senha<input type="password" autoComplete="new-password" minLength={6} value={form.newPassword} onChange={change("newPassword")} /></label>
        {error && <p className="profile-feedback error" role="alert">{error}</p>}
        {message && <p className="profile-feedback success" role="status">{message}</p>}
        <button disabled={saving}>{saving ? "Salvando…" : "Salvar alterações"}</button>
      </form>}
      <button className="profile-logout" onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>Sair da conta</button>
    </section>
  </main>;
}