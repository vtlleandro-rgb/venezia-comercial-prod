import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

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
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);

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
