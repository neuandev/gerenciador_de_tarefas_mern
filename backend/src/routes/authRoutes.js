const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { createRateLimiter } = require("../middlewares/rateLimitMiddleware");
const { register, login, getProfile, updateProfile } = require("../controllers/userController");

const router = express.Router();

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Muitas tentativas de login. Aguarde 15 minutos e tente novamente.",
});

const registerLimiter = createRateLimiter({
  windowMs: 60 *  60 * 1000,
  max: 5,
  message: "Muitas tentativas de cadastro. Aguarde uma hora e tente novamente.",
});

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.get("/me", authMiddleware, getProfile);
router.patch("/me", authMiddleware, updateProfile);

module.exports = router;
