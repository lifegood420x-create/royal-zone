import express, { type Express } from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Serve the built Mini App frontend. On Replit a platform router maps `/`
// to the earning-app artifact, but on other hosts (Railway, etc.) this
// server is the only process — so it must serve the static build itself.
// The bundled server runs from artifacts/api-server/dist/, so the frontend
// build sits two levels up in the earning-app artifact.
const serverDir = path.dirname(fileURLToPath(import.meta.url));
const staticDir =
  process.env.STATIC_DIR ??
  path.resolve(serverDir, "..", "..", "earning-app", "dist", "public");

if (fs.existsSync(path.join(staticDir, "index.html"))) {
  app.use(express.static(staticDir));
  // SPA fallback: any non-API GET serves index.html so wouter routes work.
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
  logger.info({ staticDir }, "Serving Mini App frontend");
} else {
  logger.warn(
    { staticDir },
    "Frontend build not found; serving API only. Run the earning-app build first.",
  );
}

export default app;
