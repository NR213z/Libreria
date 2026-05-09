import fs       from "fs";
import path     from "path";
import bcrypt   from "bcryptjs";
import { fileURLToPath } from "url";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR   = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

const DEFAULT_PASSWORD = "libreria2024";

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

if (!fs.existsSync(USERS_FILE)) {
  const hash = bcrypt.hashSync(DEFAULT_PASSWORD, 10);
  fs.writeFileSync(
    USERS_FILE,
    JSON.stringify(
      [{ email: "nrios@iurd.com.ar", passwordHash: hash, role: "admin", createdAt: new Date().toISOString() }],
      null, 2
    )
  );
  console.log("─────────────────────────────────────────");
  console.log("  ✔  Usuario admin creado");
  console.log("  📧  nrios@iurd.com.ar");
  console.log(`  🔑  Contraseña: ${DEFAULT_PASSWORD}`);
  console.log("  ⚠️  Cambiala desde el panel de Usuarios");
  console.log("─────────────────────────────────────────");
}

export const getUsers  = ()      => JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
export const saveUsers = (users) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
