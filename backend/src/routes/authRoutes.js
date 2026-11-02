const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { register, login, getProfile, updateProfile } = require("../controllers/userController");

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getProfile);
router.patch("/me", authMiddleware, updateProfile);

module.exports = router;
