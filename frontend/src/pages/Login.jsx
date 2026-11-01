import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token } = response.data;
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || "Não foi possível entrar. Verifique seus dados.");
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
          <span className="auth-eyebrow">Organize. Priorize. Conquiste.</span>
          <h2>Menos caos.<br /><span>Mais realizações.</span></h2>
          <p>Um espaço simples e intuitivo para organizar suas tarefas, acompanhar seu progresso e manter o foco no que realmente importa.</p>
          <div className="auth-feature-list">
            <span>Seus projetos em um só lugar</span>
            <span>Progresso sempre visível</span>
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
            <h1>Boas-vindas de volta</h1>
            <p>Entre com seus dados para continuar de onde parou.</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="login-email">E-mail</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@exemplo.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="login-password">Senha</label>
              <div className="auth-input-wrap">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
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

            {error && <p className="auth-message" role="alert">{error}</p>}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar na minha conta"}
              {!loading && <span className="auth-submit-arrow">→</span>}
            </button>
          </form>

          <p className="auth-switch">
            Ainda não tem uma conta? <Link to="/cadastro">Criar conta</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default Login;
