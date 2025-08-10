import "dotenv/config.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import { router as dsarRouter } from "./routes/dsar.js";
import { router as consentRouter } from "./routes/consent.js";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_, res) => res.json({ ok: true }));
app.use("/api/dsar", dsarRouter);
app.use("/api/consent", consentRouter);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
