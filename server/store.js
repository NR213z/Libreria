/**
 * Almacenamiento en archivo JSON + OTPs en memoria.
 * Sin base de datos externa — todo vive en server/data/users.json.
 */
import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR   = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// Crear directorio y seed de admin en el primer arranque
if (!fs.existsSync(DATA_DIR))  fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(
    USERS_FILE,
    JSON.stringify(
      [{ email: "nrios@iurd.com.ar", role: "admin", createdAt: new Date().toISOString() }],
      null,
      2
    )
  );
  console.log("✔ Primer arranque: usuario admin nrios@iurd.com.ar creado.");
}

export const getUsers  = ()      => JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
export const saveUsers = (users) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

// OTP en memoria: Map<email, { code, expiresAt }>
const otpStore = new Map();

export const setOTP = (email, code) => {
  otpStore.set(email.toLowerCase(), {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutos
  });
};

export const verifyAndConsumeOTP = (email, code) => {
  const key    = email.toLowerCase();
  const record = otpStore.get(key);
  if (!record)                       return { ok: false, reason: "no_code" };
  if (Date.now() > record.expiresAt) { otpStore.delete(key); return { ok: false, reason: "expired" }; }
  if (record.code !== code)          return { ok: false, reason: "wrong_code" };
  otpStore.delete(key);
  return { ok: true };
};
