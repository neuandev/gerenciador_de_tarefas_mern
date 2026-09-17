const Task = require("../models/Task");

const createTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "O título da tarefa é obrigatório.",
      });
    }

    const task = await Task.create({
      title,
      description,
      status,
      user: req.userId,
    });

    return res.status(201).json({
      message: "Tarefa criada com sucesso!",
      task,
    });
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
    });

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

module.exports = {
  createTask,
  getTasks,
};
