import "dotenv/config";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { ENV } from "./env";
import { serveStatic, setupVite } from "./vite";

const CORS_METHODS = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
const CORS_DEFAULT_HEADERS = "Content-Type, Authorization, X-Requested-With, trpc-accept, x-trpc-source";
const LOCAL_DEV_ORIGINS = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

function normalizeOrigin(origin?: string) {
  if (!origin) return "";
  try {
    const url = new URL(origin);
    return `${url.protocol}//${url.host}`;
  } catch {
    return origin.replace(/\/$/, "");
  }
}

function isAllowedCorsOrigin(origin?: string) {
  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) return false;

  const configuredFrontend = normalizeOrigin(ENV.frontendUrl);
  if (configuredFrontend && normalizedOrigin === configuredFrontend) {
    return true;
  }

  return !ENV.isProduction && LOCAL_DEV_ORIGINS.has(normalizedOrigin);
}

function applyCors(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  const allowedOrigin = isAllowedCorsOrigin(origin) ? normalizeOrigin(origin) : "";

  if (allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", CORS_METHODS);
    res.setHeader(
      "Access-Control-Allow-Headers",
      typeof req.headers["access-control-request-headers"] === "string"
        ? req.headers["access-control-request-headers"]
        : CORS_DEFAULT_HEADERS
    );
  }

  if (req.method === "OPTIONS" && origin) {
    res.sendStatus(allowedOrigin ? 204 : 403);
    return;
  }

  next();
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.set("trust proxy", true);
  app.use(applyCors);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.get("/api/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  // PDF & Thumbnail generation endpoints
  app.get("/api/propostas/:codigo/pdf", async (req, res) => {
    try {
      const { codigo } = req.params;
      const { getPropostaByCodigo } = await import("../db");
      const proposta = await getPropostaByCodigo(codigo);
      if (!proposta) {
        res.status(404).json({ error: "Proposta n\u00e3o encontrada" });
        return;
      }
      const { generatePdfFromHtml } = await import("../pdfGenerator");
      const pdfBuffer = await generatePdfFromHtml({ htmlContent: proposta.htmlContent });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="Proposta-${codigo}.pdf"`);
      res.setHeader("Content-Length", pdfBuffer.length.toString());
      res.send(pdfBuffer);
    } catch (err) {
      console.error("[PDF Generation Error]", err);
      res.status(500).json({ error: "Erro ao gerar PDF" });
    }
  });

  app.get("/api/propostas/:codigo/thumbnail", async (req, res) => {
    try {
      const { codigo } = req.params;
      const { getPropostaByCodigo } = await import("../db");
      const proposta = await getPropostaByCodigo(codigo);
      if (!proposta) {
        res.status(404).json({ error: "Proposta n\u00e3o encontrada" });
        return;
      }
      const { generateScreenshotFromHtml } = await import("../pdfGenerator");
      const imgBuffer = await generateScreenshotFromHtml({ htmlContent: proposta.htmlContent });
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.setHeader("Content-Length", imgBuffer.length.toString());
      res.send(imgBuffer);
    } catch (err) {
      console.error("[Thumbnail Generation Error]", err);
      res.status(500).json({ error: "Erro ao gerar thumbnail" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
