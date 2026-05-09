import express from "express";
import jwt     from "jsonwebtoken";
import bcrypt  from "bcryptjs";
import { getUsers, saveUsers } from "../store.js";

const router     = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "cambiar-este-secreto-en-produccion";

/* ── Middleware: solo admins ── */
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ error: "No autenticado" });
  try {
    const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET);
    if (decoded.role !== "admin")
      return res.status(403).json({ error: "Se requiere rol de administrador" });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
};

/* ── GET /api/users ── */
router.get("/", requireAdmin, (_req, res) => {
  // No devolver el hash de contraseña al frontend
  const users = getUsers().map(({ passwordHash: _, ...u }) => u);
  res.json(users);
});

/* ── POST /api/users — crear usuario ── */
router.post("/", requireAdmin, (req, res) => {
  const { email, password, role = "usuario" } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email y contraseña requeridos" });
  if (!["admin", "usuario"].includes(role))
    return res.status(400).json({ error: "Rol inválido" });

  const emailNorm = email.toLowerCase().trim();
  const users     = getUsers();

  if (users.find((u) => u.email === emailNorm))
    return res.status(409).json({ error: "Ese email ya está registrado" });

  users.push({
    email:        emailNorm,
    passwordHash: bcrypt.hashSync(password, 10),
    role,
    createdAt:    new Date().toISOString(),
  });
  saveUsers(users);
  res.json({ ok: true });
});

/* ── PUT /api/users/:email/password — cambiar contraseña ── */
router.put("/:email/password", requireAdmin, (req, res) => {
  const target   = decodeURIComponent(req.params.email).toLowerCase();
  const { password } = req.body;
  if (!password || password.length < 4)
    return res.status(400).json({ error: "La contraseña debe tener al menos 4 caracteres" });

  const users = getUsers();
  const idx   = users.findIndex((u) => u.email === target);
  if (idx === -1) return res.status(404).json({ error: "Usuario no encontrado" });

  users[idx].passwordHash = bcrypt.hashSync(password, 10);
  saveUsers(users);
  res.json({ ok: true });
});

/* ── DELETE /api/users/:email ── */
router.delete("/:email", requireAdmin, (req, res) => {
  const target = decodeURIComponent(req.params.email).toLowerCase();
  saveUsers(getUsers().filter((u) => u.email !== target));
  res.json({ ok: true });
});

export default router;
