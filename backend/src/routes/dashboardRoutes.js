const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  listDashboards,
  createDashboard,
  updateDashboard,
  duplicateDashboard,
  archiveDashboard,
} = require("../controllers/dashboardController");

const router = express.Router();
router.use(authMiddleware);
router.get("/", listDashboards);
router.post("/", createDashboard);
router.post("/:id/duplicate", duplicateDashboard);
router.patch("/:id", updateDashboard);
router.delete("/:id", archiveDashboard);
module.exports = router;
