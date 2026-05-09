import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config(); // fallback a .env si existe
import express from "express";
import path    from "path";
import { fileURLToPath } from "url";
import authRouter  from "./routes/auth.js";
import usersRouter from "./routes/users.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

/* ── API routes ── */
app.use("/api/auth",  authRouter);
app.use("/api/users", usersRouter);

/* ── Servir el frontend de React en producción ── */
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));
app.get("/{*path}", (_req, res) =>
  res.sendFile(path.join(distPath, "index.html"))
);

app.listen(PORT, () => {
  console.log(`✔ LibraPedidos server corriendo en http://localhost:${PORT}`);
});
