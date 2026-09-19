const Task = require("../models/Task");

const createTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;

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

    if (
      status !== undefined &&
      status !== "pendente" &&
      status !== "concluída"
    ) {
      return res.status(400).json({
        message: "Status inválido.",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      status: status || "pendente",
      user: req.userId,
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
    const tasks = await Task.find({
      user: req.userId,
    }).sort({ createdAt: -1 });

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

    if (status !== "pendente" && status !== "concluída") {
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

const deleteTask = async (req, res) => {
  try {
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
  deleteTask,
};
