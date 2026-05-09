import express from "express";
import jwt     from "jsonwebtoken";
import { getUsers, saveUsers } from "../store.js";

const router     = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "cambiar-este-secreto-en-produccion";

/* ── Middleware: solo admins ── */
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autenticado" });
  }
  try {
    const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Se requiere rol de administrador" });
    }
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
};

/* ── GET /api/users ── */
router.get("/", requireAdmin, (_req, res) => {
  res.json(getUsers());
});

/* ── POST /api/users ── */
router.post("/", requireAdmin, (req, res) => {
  const { email, role = "usuario" } = req.body;
  if (!email) return res.status(400).json({ error: "Email requerido" });
  if (!["admin", "usuario"].includes(role)) {
    return res.status(400).json({ error: "Rol inválido" });
  }

  const emailNorm = email.toLowerCase().trim();
  const users     = getUsers();

  if (users.find((u) => u.email === emailNorm)) {
    return res.status(409).json({ error: "Ese email ya está registrado" });
  }

  users.push({ email: emailNorm, role, createdAt: new Date().toISOString() });
  saveUsers(users);
  res.json({ ok: true });
});

/* ── DELETE /api/users/:email ── */
router.delete("/:email", requireAdmin, (req, res) => {
  const target = decodeURIComponent(req.params.email).toLowerCase();
  const users  = getUsers().filter((u) => u.email !== target);
  saveUsers(users);
  res.json({ ok: true });
});

export default router;
