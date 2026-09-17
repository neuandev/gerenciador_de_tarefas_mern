const express = require("express");

const {
  createTask,
  getTasks,
  updateTask,
} = require("../controllers/taskController");

const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createTask);
router.get("/", authMiddleware, getTasks);
router.put("/:id", authMiddleware, updateTask);

module.exports = router;
