const { test } = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { MongoClient, ObjectId } = require("mongodb");

const API_URL = process.env.TEST_API_URL || "http://localhost:3000/api";
const MONGODB_URI = process.env.MONGODB_URI;

async function request(path, { method = "GET", token, body } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = text; }
  return { status: response.status, data };
}

test("API: autenticação, perfil, dashboards e CRUD de tarefas", { timeout: 60_000 }, async (t) => {
  assert.ok(MONGODB_URI, "MONGODB_URI deve estar configurada para limpar os dados temporários");
  const suffix = randomUUID();
  const firstUser = { name: "Usuário de Teste", email: `api-test-${suffix}@example.test`, password: "TestPassword123" };
  const secondUser = { name: "Segundo Usuário de Teste", email: `api-test-owner-${suffix}@example.test`, password: "TestPassword123" };
  let firstUserId;
  let secondUserId;
  let token;

  try {
    await t.test("bloqueia rotas protegidas sem token", async () => {
      assert.equal((await request("/auth/me")).status, 401);
    });

    await t.test("cadastra usuário e rejeita e-mail duplicado", async () => {
      const result = await request("/auth/register", { method: "POST", body: firstUser });
      assert.equal(result.status, 201);
      assert.equal(result.data.user.email, firstUser.email);
      firstUserId = result.data.user.id;
      assert.equal((await request("/auth/register", { method: "POST", body: firstUser })).status, 400);
    });

    await t.test("valida login e autentica usuário", async () => {
      assert.equal((await request("/auth/login", {
        method: "POST", body: { email: firstUser.email, password: "senha-incorreta" },
      })).status, 401);
      const result = await request("/auth/login", {
        method: "POST", body: { email: firstUser.email, password: firstUser.password },
      });
      assert.equal(result.status, 200);
      assert.ok(result.data.token);
      token = result.data.token;
    });

    await t.test("consulta e atualiza perfil autenticado", async () => {
      const profile = await request("/auth/me", { token });
      assert.equal(profile.status, 200);
      assert.equal(profile.data.user.email, firstUser.email);
      const updated = await request("/auth/me", {
        method: "PATCH", token, body: { name: "Usuário de Teste Atualizado" },
      });
      assert.equal(updated.status, 200);
      assert.equal(updated.data.user.name, "Usuário de Teste Atualizado");
      token = updated.data.token;
    });

    let defaultDashboardId;
    let dashboardId;
    let duplicatedDashboardId;
    let firstTaskId;
    let secondTaskId;

    await t.test("lista dashboards e garante dashboard Geral", async () => {
      const result = await request("/dashboards", { token });
      assert.equal(result.status, 200);
      const general = result.data.dashboards.find((item) => item.name === "Geral");
      assert.ok(general);
      defaultDashboardId = general._id;
    });

    await t.test("cria, atualiza e duplica dashboard", async () => {
      const created = await request("/dashboards", {
        method: "POST", token, body: { name: "Dashboard de Teste", icon: "🧪" },
      });
      assert.equal(created.status, 201);
      dashboardId = created.data.dashboard._id;

      const updated = await request(`/dashboards/${dashboardId}`, {
        method: "PATCH", token, body: { name: "Dashboard de Teste Atualizado", isFavorite: true },
      });
      assert.equal(updated.status, 200);
      assert.equal(updated.data.dashboard.name, "Dashboard de Teste Atualizado");
      assert.equal(updated.data.dashboard.isFavorite, true);

      const duplicated = await request(`/dashboards/${dashboardId}/duplicate`, { method: "POST", token });
      assert.equal(duplicated.status, 201);
      duplicatedDashboardId = duplicated.data.dashboard._id;
      assert.equal(duplicated.data.copiedTasks, 0);
    });

    await t.test("cria, lista, edita e reordena tarefas", async () => {
      const created = await request("/tasks", {
        method: "POST", token,
        body: { title: "Primeira tarefa de teste", description: "Descrição inicial", dashboardId },
      });
      assert.equal(created.status, 201);
      firstTaskId = created.data._id;

      const createdSecond = await request("/tasks", {
        method: "POST", token,
        body: { title: "Segunda tarefa de teste", status: "em andamento", dashboardId },
      });
      assert.equal(createdSecond.status, 201);
      secondTaskId = createdSecond.data._id;

      const listed = await request(`/tasks?dashboardId=${dashboardId}`, { token });
      assert.equal(listed.status, 200);
      assert.equal(listed.data.tasks.length, 2);

      const updated = await request(`/tasks/${firstTaskId}`, {
        method: "PUT", token,
        body: { title: "Primeira tarefa atualizada", description: "Descrição atualizada", status: "concluída" },
      });
      assert.equal(updated.status, 200);
      assert.equal(updated.data.status, "concluída");

      const reordered = await request("/tasks/reorder", {
        method: "PATCH", token, body: { dashboardId, taskIds: [secondTaskId, firstTaskId] },
      });
      assert.equal(reordered.status, 200);
    });

    await t.test("rejeita dados inválidos e IDs malformados", async () => {
      assert.equal((await request("/tasks", {
        method: "POST", token, body: { title: "   ", dashboardId },
      })).status, 400);
      assert.equal((await request("/tasks/not-an-object-id", {
        method: "PUT", token, body: { title: "Título", status: "pendente" },
      })).status, 400);
      assert.equal((await request(`/tasks/${firstTaskId}`, {
        method: "PUT", token, body: { title: "Título", status: "status-inexistente" },
      })).status, 400);
    });

    await t.test("impede acesso às tarefas de outro usuário", async () => {
      const registered = await request("/auth/register", { method: "POST", body: secondUser });
      assert.equal(registered.status, 201);
      secondUserId = registered.data.user.id;
      const loggedIn = await request("/auth/login", {
        method: "POST", body: { email: secondUser.email, password: secondUser.password },
      });
      assert.equal(loggedIn.status, 200);

      const list = await request(`/tasks?dashboardId=${dashboardId}`, { token: loggedIn.data.token });
      assert.equal(list.status, 200);
      assert.equal(list.data.tasks.length, 0);
      const access = await request(`/tasks/${firstTaskId}`, {
        method: "PUT", token: loggedIn.data.token,
        body: { title: "Tentativa indevida", status: "pendente" },
      });
      assert.equal(access.status, 404);
    });

    await t.test("exclui tarefas e arquiva dashboards de teste", async () => {
      assert.equal((await request(`/tasks/${firstTaskId}`, { method: "DELETE", token })).status, 200);
      assert.equal((await request(`/tasks/${secondTaskId}`, { method: "DELETE", token })).status, 200);
      assert.equal((await request(`/dashboards/${duplicatedDashboardId}`, { method: "DELETE", token })).status, 200);
      assert.equal((await request(`/dashboards/${dashboardId}`, { method: "DELETE", token })).status, 200);
      assert.equal((await request(`/dashboards/${defaultDashboardId}`, { method: "DELETE", token })).status, 400);
    });
  } finally {
    // Remove somente os registros criados por esta execução de teste.
    const client = new MongoClient(MONGODB_URI);
    try {
      await client.connect();
      const databaseName = new URL(MONGODB_URI).pathname.slice(1);
      const db = client.db(databaseName);
      const ids = [firstUserId, secondUserId].filter(Boolean).map((id) => new ObjectId(id));
      if (ids.length) {
        await db.collection("tasks").deleteMany({ user: { $in: ids } });
        await db.collection("dashboards").deleteMany({ owner: { $in: ids } });
        await db.collection("users").deleteMany({ _id: { $in: ids } });
      }
    } finally {
      await client.close();
    }
  }
});
