const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const connectDatabase = require("./config/database");

// Validacao das variaveis de ambiente
if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI nao configurada.");
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET deve ter pelo menos 32 caracteres.");
}

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Permite chamadas sem Origin (curl, health checks e comunicacao servidor-servidor)
// e somente origens explicitamente autorizadas no navegador.
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, !origin || allowedOrigins.includes(origin));
    },
  }),
);

app.use(express.json({ limit: "2mb" }));

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboards", dashboardRoutes);

// Rota principal
app.get("/", (req, res) => {
  res.json({
    message: "API do Gerenciador de Tarefas funcionando!",
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "API do Gerenciador de Tarefas funcionando!",
  });
});

// Rota inexistente da API
app.use("/api", (req, res) => {
  res.status(404).json({ message: "Rota da API nao encontrada." });
});

// Tratamento de erros
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      message: "JSON invalido.",
    });
  }

  console.error("Erro interno:", error);

  return res.status(500).json({
    message: "Erro interno do servidor.",
  });
});

const PORT = process.env.PORT || 3000;

// Inicia a API somente depois de conectar ao MongoDB
const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error("Falha ao conectar ao MongoDB:", error.message);
    process.exit(1);
  }
};

startServer();
