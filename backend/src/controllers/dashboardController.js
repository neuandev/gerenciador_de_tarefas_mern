const mongoose = require("mongoose");
const Dashboard = require("../models/Dashboard");
const Task = require("../models/Task");

async function ensureDefaultDashboard(userId) {
  let dashboard = await Dashboard.findOne({
    owner: userId,
    name: "Geral",
    isArchived: false,
  });

  if (!dashboard) {
    dashboard = await Dashboard.create({
      name: "Geral",
      owner: userId,
      position: 0,
    });
  }

  await Task.updateMany(
    {
      user: userId,
      $or: [{ dashboard: { $exists: false } }, { dashboard: null }],
    },
    { $set: { dashboard: dashboard._id } },
  );

  return dashboard;
}

const listDashboards = async (req, res) => {
  try {
    await ensureDefaultDashboard(req.userId);

    const dashboards = await Dashboard.find({
      owner: req.userId,
      isArchived: false,
    }).sort({ position: 1, createdAt: 1 });

    return res.status(200).json(dashboards);
  } catch (error) {
    console.error("Erro ao listar dashboards:", error);
    return res.status(500).json({
      message: "Não foi possível listar os dashboards.",
    });
  }
};

const createDashboard = async (req, res) => {
  try {
    const { name, coverUrl, icon } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "O nome do dashboard é obrigatório.",
      });
    }

    const count = await Dashboard.countDocuments({
      owner: req.userId,
      isArchived: false,
    });

    const dashboard = await Dashboard.create({
      name: name.trim(),
      owner: req.userId,
      coverUrl: coverUrl || "",
      icon: icon || "📄",
      position: count,
    });

    return res.status(201).json(dashboard);
  } catch (error) {
    console.error("Erro ao criar dashboard:", error);
    return res.status(500).json({
      message: "Não foi possível criar o dashboard.",
    });
  }
};

const updateDashboard = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "ID do dashboard inválido.",
      });
    }

    const { name, coverUrl, icon, isFavorite, position } = req.body;

    const dashboard = await Dashboard.findOne({
      _id: req.params.id,
      owner: req.userId,
      isArchived: false,
    });

    if (!dashboard) {
      return res.status(404).json({
        message: "Dashboard não encontrado.",
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "O nome do dashboard não pode ficar vazio.",
        });
      }
      dashboard.name = name.trim();
    }

    if (coverUrl !== undefined) dashboard.coverUrl = coverUrl;
    if (icon !== undefined) dashboard.icon = icon;
    if (isFavorite !== undefined) dashboard.isFavorite = isFavorite;
    if (position !== undefined) dashboard.position = position;

    await dashboard.save();

    return res.status(200).json(dashboard);
  } catch (error) {
    console.error("Erro ao atualizar dashboard:", error);
    return res.status(500).json({
      message: "Não foi possível atualizar o dashboard.",
    });
  }
};

const duplicateDashboard = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "ID do dashboard inválido.",
      });
    }

    const original = await Dashboard.findOne({
      _id: req.params.id,
      owner: req.userId,
      isArchived: false,
    });

    if (!original) {
      return res.status(404).json({
        message: "Dashboard não encontrado.",
      });
    }

    const count = await Dashboard.countDocuments({
      owner: req.userId,
      isArchived: false,
    });

    const dashboard = await Dashboard.create({
      name: `${original.name} (cópia)`,
      owner: req.userId,
      coverUrl: original.coverUrl,
      icon: original.icon,
      position: count,
    });

    const originalTasks = await Task.find({
      user: req.userId,
      dashboard: original._id,
    }).lean();

    if (originalTasks.length) {
      await Task.insertMany(
        originalTasks.map(({ _id, createdAt, updatedAt, ...task }) => ({
          ...task,
          user: req.userId,
          dashboard: dashboard._id,
        })),
      );
    }

    return res.status(201).json({
      dashboard,
      copiedTasks: originalTasks.length,
    });
  } catch (error) {
    console.error("Erro ao duplicar dashboard:", error);
    return res.status(500).json({
      message: "Não foi possível duplicar o dashboard.",
    });
  }
};

const archiveDashboard = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "ID do dashboard inválido.",
      });
    }

    const dashboard = await Dashboard.findOne({
      _id: req.params.id,
      owner: req.userId,
      isArchived: false,
    });

    if (!dashboard) {
      return res.status(404).json({
        message: "Dashboard não encontrado.",
      });
    }

    const activeCount = await Dashboard.countDocuments({
      owner: req.userId,
      isArchived: false,
    });

    if (activeCount <= 1) {
      return res.status(400).json({
        message: "Você precisa manter pelo menos um dashboard.",
      });
    }

    if (dashboard.name === "Geral") {
      return res.status(400).json({
        message:
          "O dashboard Geral não pode ser enviado para a lixeira nesta etapa.",
      });
    }

    dashboard.isArchived = true;
    await dashboard.save();

    return res.status(200).json({
      message: "Dashboard movido para a lixeira.",
      dashboard,
    });
  } catch (error) {
    console.error("Erro ao arquivar dashboard:", error);
    return res.status(500).json({
      message: "Não foi possível arquivar o dashboard.",
    });
  }
};

module.exports = {
  listDashboards,
  createDashboard,
  updateDashboard,
  duplicateDashboard,
  archiveDashboard,
};
