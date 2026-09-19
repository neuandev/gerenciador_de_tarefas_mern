import api from "../services/api";

function Login() {
  const testarApi = async () => {
    try {
      const response = await api.get("/");

      console.log(response.data);
    } catch (error) {
      console.error("Erro ao conectar com a API:", error);
    }
  };

  return (
    <div>
      <h1>Login</h1>

      <button onClick={testarApi}>Testar API</button>
    </div>
  );
}

export default Login;
