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
app.disable("x-powered-by");

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Cabecalhos defensivos para a API.
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

// Permite chamadas sem Origin (curl, health checks e comunicacao servidor-servidor)
// e somente origens explicitamente autorizadas no navegador.
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, !origin || allowedOrigins.includes(origin));
    },
  }),
);

// O limite de 2 MB permite ícones enviados como Data URL (até 1 MB no frontend).
app.use(express.json({ limit: "2mb" }));

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboards", dashboardRoutes);

// Verificacao de disponibilidade da API e do MongoDB.
app.get("/api/health", (req, res) => {
  const databaseReady = require("mongoose").connection.readyState === 1;
  return res.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? "ok" : "degraded",
    database: databaseReady ? "connected" : "disconnected",
  });
});

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

// Tratamento centralizado de erros
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "JSON invalido." });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({ message: "O corpo da requisicao excede o limite de 2 MB." });
  }

  console.error("Erro interno:", error);
  return res.status(500).json({ message: "Erro interno do servidor." });
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
