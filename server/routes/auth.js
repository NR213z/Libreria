import express from "express";
import jwt     from "jsonwebtoken";
import { Resend } from "resend";
import { getUsers, setOTP, verifyAndConsumeOTP } from "../store.js";

const router     = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "cambiar-este-secreto-en-produccion";

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/* ── Envío de email ──────────────────────────────────────────────────────── */
const sendOTPEmail = async (to, code) => {
  // Sin API key → modo desarrollo: mostrar en consola
  if (!process.env.RESEND_API_KEY) {
    console.log("\n──────────────────────────────────────");
    console.log(`  📧  OTP para ${to}`);
    console.log(`  🔑  Código: ${code}`);
    console.log("──────────────────────────────────────\n");
    return;
  }

  // Con API key → enviar email real via Resend
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from:    "LibraPedidos <onboarding@resend.dev>",
    to:      [to],
    subject: "Tu código de acceso — LibraPedidos",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:420px;margin:0 auto;padding:24px">
        <div style="margin-bottom:24px">
          <span style="font-size:22px;font-weight:700;color:#1E293B">📚 LibraPedidos</span>
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
};

/* ── POST /api/auth/request-otp ─────────────────────────────────────────── */
router.post("/request-otp", async (req, res) => {
  const email = (req.body.email || "").toLowerCase().trim();
  if (!email) return res.status(400).json({ error: "Email requerido" });

  const users    = getUsers();
  const authUser = users.find((u) => u.email === email);
  if (!authUser) {
    return res.status(403).json({ error: "Este email no está autorizado para acceder al sistema." });
  }

  const code = generateOTP();
  setOTP(email, code);

  try {
    await sendOTPEmail(email, code);
    res.json({ ok: true, dev: !process.env.RESEND_API_KEY });
  } catch (err) {
    console.error("Error enviando email:", err.message);
    res.status(500).json({ error: "No se pudo enviar el código. Revisá la configuración de email." });
  }
});

/* ── POST /api/auth/verify-otp ──────────────────────────────────────────── */
router.post("/verify-otp", (req, res) => {
  const email = (req.body.email || "").toLowerCase().trim();
  const token = (req.body.token || "").trim();
  if (!email || !token) return res.status(400).json({ error: "Datos incompletos" });

  const result = verifyAndConsumeOTP(email, token);
  if (!result.ok) {
    const msg =
      result.reason === "expired"
        ? "El código venció. Solicitá uno nuevo."
        : "Código incorrecto. Revisá que hayas copiado bien los 6 dígitos.";
    return res.status(401).json({ error: msg });
  }

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

/* ── GET /api/auth/me ───────────────────────────────────────────────────── */
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autenticado" });
  }
  try {
    const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET);
    const users   = getUsers();
    const user    = users.find((u) => u.email === decoded.email);
    if (!user) return res.status(403).json({ error: "Usuario eliminado del sistema" });
    res.json({ email: user.email, role: user.role });
  } catch {
    res.status(401).json({ error: "Token inválido o vencido" });
  }
});

export default router;
