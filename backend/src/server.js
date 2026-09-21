const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

dotenv.config();

// Validação das variáveis de ambiente
if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI não configurada.");
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET deve ter pelo menos 32 caracteres.");
}

const app = express();

// Configuração do CORS
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

// Permite receber JSON nas requisições
app.use(express.json());

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Rota principal
app.get("/", (req, res) => {
  res.json({
    message: "API do Gerenciador de Tarefas funcionando!",
  });
});

// Rota da API
app.get("/api", (req, res) => {
  res.json({
    message: "API do Gerenciador de Tarefas funcionando!",
  });
});

// Tratamento de erros
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      message: "JSON inválido.",
    });
  }

  console.error("Erro interno:", error);

  return res.status(500).json({
    message: "Erro interno do servidor.",
  });
});

const PORT = process.env.PORT || 3000;

// Conexão com o MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB conectado com sucesso!");

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao conectar ao MongoDB:", error.message);
  });
