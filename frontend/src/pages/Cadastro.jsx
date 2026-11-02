import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Auth.css";

function Cadastro() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password });
      setSuccess("Cadastro realizado com sucesso! Redirecionando para o login...");
      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || "Não foi possível criar sua conta.");
      } else {
        setError("Erro ao conectar com o servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <aside className="auth-showcase" aria-label="Apresentação do TaskFlow">
        <Link className="auth-brand" to="/login">
          <span className="auth-brand-mark">✓</span>
          <span>TaskFlow</span>
        </Link>
        <div className="auth-showcase-copy">
          <span className="auth-eyebrow">Seu próximo passo começa aqui</span>
          <h2>Transforme planos em <span>conquistas.</span></h2>
          <p>Crie seu espaço de organização, reúna suas tarefas e acompanhe cada pequena evolução no seu ritmo.</p>
          <div className="auth-feature-list">
            <span>Organização sem complicação</span>
            <span>Foco no que importa</span>
          </div>
        </div>
        <div className="auth-showcase-footer">© {new Date().getFullYear()} TaskFlow · Organização com propósito.</div>
      </aside>

      <main className="auth-main">
        <div className="auth-form-wrap">
          <Link className="auth-mobile-brand" to="/login">
            <span className="auth-brand-mark">✓</span>
            <span>TaskFlow</span>
          </Link>
          <header className="auth-heading">
            <h1>Crie sua conta</h1>
            <p>Preencha os campos abaixo para começar a se organizar.</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="register-name">Nome</label>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Como podemos chamar você?"
                autoComplete="name"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="register-email">E-mail</label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@exemplo.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="register-password">Senha</label>
              <div className="auth-input-wrap">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Crie uma senha"
                  autoComplete="new-password"
                  required
                />
                <button
                  className="auth-password-toggle"
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={showPassword}
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? "◉" : "◎"}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="register-confirm-password">Confirmar senha</label>
              <div className="auth-input-wrap">
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Digite a senha novamente"
                  autoComplete="new-password"
                  required
                />
                <button
                  className="auth-password-toggle"
                  type="button"
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                  aria-label={showConfirmPassword ? "Ocultar confirmação da senha" : "Mostrar confirmação da senha"}
                  aria-pressed={showConfirmPassword}
                  title={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showConfirmPassword ? "◉" : "◎"}
                </button>
              </div>
            </div>

            {error && <p className="auth-message" role="alert">{error}</p>}
            {success && <p className="auth-message success" role="status">{success}</p>}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Criando conta..." : "Criar minha conta"}
              {!loading && <span className="auth-submit-arrow">→</span>}
            </button>
          </form>

          <p className="auth-switch">
            Já possui uma conta? <Link to="/login">Entrar</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default Cadastro;
