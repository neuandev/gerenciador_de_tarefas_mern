const mongoose = require("mongoose");
const Task = require("../models/Task");
const Dashboard = require("../models/Dashboard");

const createTask = async (req, res) => {
  try {
    const { title, description, status, dashboardId } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "O título da tarefa é obrigatório.",
      });
    }

    if (title.trim().length > 100) {
      return res.status(400).json({
        message: "O título deve ter no máximo 100 caracteres.",
      });
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        message: "A descrição deve ser um texto.",
      });
    }

    if (description && description.trim().length > 1000) {
      return res.status(400).json({
        message: "A descrição deve ter no máximo 1000 caracteres.",
      });
    }

    if (
      status !== undefined &&
      status !== "pendente" &&
      status !== "em andamento" &&
      status !== "concluída"
    ) {
      return res.status(400).json({
        message: "Status inválido.",
      });
    }

    let dashboard;
    if (dashboardId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(dashboardId)) {
        return res.status(400).json({ message: "ID do dashboard inválido." });
      }
      dashboard = await Dashboard.findOne({ _id: dashboardId, owner: req.userId, isArchived: false });
      if (!dashboard) return res.status(404).json({ message: "Dashboard não encontrado." });
    } else {
      dashboard = await Dashboard.findOne({ owner: req.userId, name: "Geral", isArchived: false });
      if (!dashboard) dashboard = await Dashboard.create({ name: "Geral", owner: req.userId, position: 0 });
    }
    const lastTask = await Task.findOne({ user: req.userId, dashboard: dashboard._id }).sort({ position: -1 });
    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      status: status || "pendente",
      user: req.userId,
      dashboard: dashboard._id,
      position: lastTask ? lastTask.position + 1 : 0,
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);

    return res.status(500).json({
      message: "Erro interno do servidor.",
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const filter = { user: req.userId };
    if (req.query.dashboardId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(req.query.dashboardId)) {
        return res.status(400).json({ message: "ID do dashboard inválido." });
      }
      filter.dashboard = req.query.dashboardId;
    }
    const tasks = await Task.find(filter).sort({ position: 1, createdAt: -1 });

    return res.status(200).json({
      tasks,
    });
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);

    return res.status(500).json({
      message: "Erro interno do servidor.",
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "ID da tarefa inválido.",
      });
    }

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "O título da tarefa é obrigatório.",
      });
    }

    if (title.trim().length > 100) {
      return res.status(400).json({
        message: "O título deve ter no máximo 100 caracteres.",
      });
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        message: "A descrição deve ser um texto.",
      });
    }

    if (description && description.trim().length > 1000) {
      return res.status(400).json({
        message: "A descrição deve ter no máximo 1000 caracteres.",
      });
    }

    if (
      status !== "pendente" &&
      status !== "em andamento" &&
      status !== "concluída"
    ) {
      return res.status(400).json({
        message: "Status inválido.",
      });
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId,
      },
      {
        title: title.trim(),
        description: description ? description.trim() : "",
        status,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!task) {
      return res.status(404).json({
        message: "Tarefa não encontrada.",
      });
    }

    return res.status(200).json(task);
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);

    return res.status(500).json({
      message: "Erro interno do servidor.",
    });
  }
};

const reorderTasks = async (req, res) => {
  try {
    const { dashboardId, taskIds } = req.body;
    if (!mongoose.Types.ObjectId.isValid(dashboardId)) {
      return res.status(400).json({ message: "ID do dashboard inválido." });
    }
    if (!Array.isArray(taskIds) || taskIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ message: "A lista de tarefas é inválida." });
    }
    if (new Set(taskIds).size !== taskIds.length) {
      return res.status(400).json({ message: "A lista contém tarefas duplicadas." });
    }
    const dashboard = await Dashboard.findOne({ _id: dashboardId, owner: req.userId, isArchived: false });
    if (!dashboard) {
      return res.status(404).json({ message: "Dashboard não encontrado." });
    }
    const ownedTasks = await Task.find({
      user: req.userId, dashboard: dashboardId, _id: { $in: taskIds },
    }).select("_id");
    if (ownedTasks.length !== taskIds.length) {
      return res.status(400).json({ message: "A lista contém tarefas que não pertencem a este dashboard." });
    }
    if (taskIds.length) {
      await Task.bulkWrite(taskIds.map((id, position) => ({
        updateOne: {
          filter: { _id: id, user: req.userId, dashboard: dashboardId },
          update: { $set: { position } },
        },
      })));
    }
    return res.status(200).json({ message: "Ordem das tarefas atualizada." });
  } catch (error) {
    console.error("Erro ao reordenar tarefas:", error);
    return res.status(500).json({ message: "Não foi possível salvar a ordem das tarefas." });
  }
};

const deleteTask = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "ID da tarefa inválido.",
      });
    }

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!task) {
      return res.status(404).json({
        message: "Tarefa não encontrada.",
      });
    }

    return res.status(200).json({
      message: "Tarefa excluída com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao excluir tarefa:", error);

    return res.status(500).json({
      message: "Erro interno do servidor.",
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  reorderTasks,
  deleteTask,
};
