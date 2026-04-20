import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter  from "./routes/authRoutes";
import leadsRouter from "./routes/leadsRoutes";

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
// ALLOWED_ORIGINS aceita múltiplas origens separadas por vírgula no .env
// Ex: ALLOWED_ORIGINS=https://formaevntos.com.br,https://www.formaevntos.com.br
const rawOrigins = process.env.ALLOWED_ORIGINS ?? "http://localhost:3000";
const allowedOrigins = rawOrigins.split(",").map(o => o.trim());

app.use(
  cors({
    origin(origin, callback) {
      // Permite requisições sem origin (ex: Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS bloqueado para origem: ${origin}`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ─── Rotas ────────────────────────────────────────────────────────────────────
app.use("/auth",      authRouter);
app.use("/api/leads", leadsRouter);

// ─── Healthcheck ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ ok: true }));

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, () => {
  console.log(`[forma] servidor na porta ${PORT} | origens: ${allowedOrigins.join(", ")}`);
});
