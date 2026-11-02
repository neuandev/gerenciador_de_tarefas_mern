const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email });

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("name email");
    if (!user) return res.status(404).json({ message: "Usuário não encontrado." });
    return res.status(200).json({ user: publicUser(user) });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return res.status(500).json({ message: "Não foi possível carregar o perfil." });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80)
        return res.status(400).json({ message: "O nome deve ter entre 2 e 80 caracteres." });
      user.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string" || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email.trim()))
        return res.status(400).json({ message: "Informe um e-mail válido." });
      const normalizedEmail = email.trim().toLowerCase();
      const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
      if (existing) return res.status(409).json({ message: "Este e-mail já está em uso." });
      user.email = normalizedEmail;
    }

    if (newPassword !== undefined && newPassword !== "") {
      if (typeof currentPassword !== "string" || !(await bcrypt.compare(currentPassword, user.password)))
        return res.status(400).json({ message: "A senha atual está incorreta." });
      if (typeof newPassword !== "string" || newPassword.length < 6)
        return res.status(400).json({ message: "A nova senha deve ter pelo menos 6 caracteres." });
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return res.status(200).json({ message: "Perfil atualizado com sucesso.", user: publicUser(user), token });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return res.status(500).json({ message: "Não foi possível atualizar o perfil." });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Nome, e-mail e senha são obrigatórios." });
    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string")
      return res.status(400).json({ message: "Nome, e-mail e senha devem ser textos." });
    const nameTrimmed = name.trim();
    const emailTrimmed = email.trim().toLowerCase();
    if (nameTrimmed.length < 2) return res.status(400).json({ message: "O nome deve ter pelo menos 2 caracteres." });
    if (password.length < 6) return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres." });
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(emailTrimmed)) return res.status(400).json({ message: "Informe um e-mail válido." });
    if (await User.findOne({ email: emailTrimmed })) return res.status(400).json({ message: "Este email já está cadastrado." });
    const user = await User.create({ name: nameTrimmed, email: emailTrimmed, password: await bcrypt.hash(password, 10) });
    return res.status(201).json({ message: "Usuário cadastrado com sucesso.", user: publicUser(user) });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
    if (typeof email !== "string" || typeof password !== "string") return res.status(400).json({ message: "E-mail e senha devem ser textos." });
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "E-mail ou senha inválidos." });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return res.status(200).json({ message: "Login realizado com sucesso.", token, user: publicUser(user) });
  } catch (error) {
    console.error("Erro ao realizar login:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};

module.exports = { register, login, getProfile, updateProfile };
