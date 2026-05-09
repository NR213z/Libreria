import express    from "express";
import jwt        from "jsonwebtoken";
import nodemailer from "nodemailer";
import { getUsers, setOTP, verifyAndConsumeOTP } from "../store.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "cambiar-este-secreto-en-produccion";
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/* ── Configurar transporte de email ── */
const makeTransport = () =>
  nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

/* ── POST /api/auth/request-otp ── */
router.post("/request-otp", async (req, res) => {
  const email = (req.body.email || "").toLowerCase().trim();
  if (!email) return res.status(400).json({ error: "Email requerido" });

  // ¿Está autorizado?
  const users    = getUsers();
  const authUser = users.find((u) => u.email === email);
  if (!authUser) {
    return res.status(403).json({ error: "Este email no está autorizado para acceder al sistema." });
  }

  // Generar y guardar OTP
  const code = generateOTP();
  setOTP(email, code);

  // Enviar email
  try {
    const transport = makeTransport();
    await transport.sendMail({
      from:    process.env.SMTP_FROM || process.env.SMTP_USER,
      to:      email,
      subject: "Tu código de acceso — LibraPedidos",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:420px;margin:0 auto;padding:24px">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
            <div style="background:#4F46E5;padding:8px;border-radius:8px;display:inline-block">
              <span style="color:#fff;font-size:20px">📚</span>
            </div>
            <span style="font-size:20px;font-weight:700;color:#1E293B">LibraPedidos</span>
          </div>
          <p style="color:#475569;margin-bottom:8px">Tu código de verificación es:</p>
          <div style="font-size:40px;font-weight:800;letter-spacing:12px;color:#1E293B;
                      background:#F1F5F9;padding:20px;border-radius:12px;text-align:center;
                      margin-bottom:16px">
            ${code}
          </div>
          <p style="color:#94A3B8;font-size:13px">
            Válido por <strong>10 minutos</strong>. No compartas este código.
          </p>
        </div>
      `,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error("Error enviando email:", err.message);
    res.status(500).json({ error: "No se pudo enviar el código. Revisá la configuración SMTP." });
  }
});

/* ── POST /api/auth/verify-otp ── */
router.post("/verify-otp", (req, res) => {
  const email = (req.body.email || "").toLowerCase().trim();
  const token = (req.body.token || "").trim();
  if (!email || !token) return res.status(400).json({ error: "Datos incompletos" });

  const result = verifyAndConsumeOTP(email, token);
  if (!result.ok) {
    const msg =
      result.reason === "expired"
        ? "El código venció. Solicitá uno nuevo."
        : "Código incorrecto o vencido. Intentá de nuevo.";
    return res.status(401).json({ error: msg });
  }

  // Obtener rol actualizado del archivo
  const users = getUsers();
  const user  = users.find((u) => u.email === email);
  if (!user) return res.status(403).json({ error: "Usuario no encontrado" });

  const jwtToken = jwt.sign(
    { email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({ token: jwtToken, email: user.email, role: user.role });
});

/* ── GET /api/auth/me ── */
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET);
    // Verificar que el usuario todavía esté autorizado
    const users = getUsers();
    const user  = users.find((u) => u.email === decoded.email);
    if (!user) return res.status(403).json({ error: "Usuario eliminado del sistema" });
    res.json({ email: user.email, role: user.role });
  } catch {
    res.status(401).json({ error: "Token inválido o vencido" });
  }
});

export default router;
