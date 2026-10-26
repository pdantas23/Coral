import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter    from "./routes/authRoutes";
import catalogRouter from "./features/catalog/catalogRoutes";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/auth",          authRouter);
app.use("/api/products",  catalogRouter);

app.listen(3001, () => {
  console.log("Servidor rodando na porta 3001");
});
