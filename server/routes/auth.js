import express from "express";
import jwt     from "jsonwebtoken";
import bcrypt  from "bcryptjs";
import { getUsers } from "../store.js";

const router     = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "cambiar-este-secreto-en-produccion";

/* ── POST /api/auth/login ── */
router.post("/login", (req, res) => {
  const email    = (req.body.email    || "").toLowerCase().trim();
  const password =  req.body.password || "";

  if (!email || !password)
    return res.status(400).json({ error: "Email y contraseña requeridos" });

  const users = getUsers();
  const user  = users.find((u) => u.email === email);

  // Mismo mensaje para email no encontrado o contraseña incorrecta (seguridad)
  if (!user || !bcrypt.compareSync(password, user.passwordHash))
    return res.status(401).json({ error: "Email o contraseña incorrectos" });

  const token = jwt.sign(
    { email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({ token, email: user.email, role: user.role });
});

/* ── GET /api/auth/me ── */
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ error: "No autenticado" });

  try {
    const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET);
    const user    = getUsers().find((u) => u.email === decoded.email);
    if (!user) return res.status(403).json({ error: "Usuario eliminado del sistema" });
    res.json({ email: user.email, role: user.role });
  } catch {
    res.status(401).json({ error: "Sesión vencida, volvé a ingresar" });
  }
});

export default router;
