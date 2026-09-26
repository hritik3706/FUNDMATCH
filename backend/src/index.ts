import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { profileRouter } from "./routes/profiles.routes";
import { schemeRouter } from "./routes/schemes.routes";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL || true,
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/profiles", profileRouter);
app.use("/api/schemes", schemeRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Resource not found",
    message: `Route ${req.method} ${req.path} not found`,
  });
});

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`FundMatch API listening on port ${env.PORT}`);
});
