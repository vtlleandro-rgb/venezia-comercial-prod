import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import path from "path";
import { fileURLToPath } from "url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const viteConfigPath = "../../vite.config";

/**
 * Injeta Open Graph meta tags para páginas de proposta
 * Permite que o WhatsApp/Telegram/Facebook exibam preview visual da proposta
 */
async function injectPropostaOGTags(url: string, template: string): Promise<string> {
  const propostaMatch = url.match(/^\/proposta\/([A-Z0-9-]+)/i);
  if (!propostaMatch) return template;

  const codigo = propostaMatch[1];
  try {
    const { getPropostaByCodigo } = await import("../db");
    const proposta = await getPropostaByCodigo(codigo);
    if (!proposta) return template;

    const title = `Proposta Comercial ${codigo} | Residencial Venezia`;
    const description = `Proposta comercial personalizada - Residencial Venezia, Tijucas/SC. Apartamentos de 2 su\u00edtes com 56,30 a 60,85 m\u00b2.`;
    const thumbnailUrl = `/api/propostas/${codigo}/thumbnail`;

    const ogTags = `
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${thumbnailUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${thumbnailUrl}" />
    `;

    // Inject before </head>
    return template.replace("</head>", `${ogTags}</head>`);
  } catch (err) {
    console.error("[OG Tags] Error injecting meta tags:", err);
    return template;
  }
}

export async function setupVite(app: Express, server: Server) {
  const [{ nanoid }, { createServer: createViteServer }, { default: viteConfig }] =
    await Promise.all([
      import("nanoid"),
      import("vite"),
      import(viteConfigPath),
    ]);

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        currentDir,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );

      // Inject Open Graph meta tags for proposal pages
      template = await injectPropostaOGTags(url, template);

      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(currentDir, "../..", "dist", "public")
      : path.resolve(currentDir, "public");
  const indexPath = path.resolve(distPath, "index.html");

  if (!fs.existsSync(indexPath)) {
    console.warn(
      `[API-only] Frontend build not found at ${indexPath}. Serving backend API routes only.`
    );
    app.use("*", (req, res) => {
      if (req.originalUrl.startsWith("/api/")) {
        res.status(404).json({ ok: false, error: "API route not found." });
        return;
      }

      res.status(404).json({
        ok: false,
        error: "Frontend is not served by this backend. Use the Vercel frontend URL.",
      });
    });
    return;
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  // Inject OG tags for proposal pages in production
  app.use("*", async (req, res) => {
    let html = await fs.promises.readFile(indexPath, "utf-8");
    html = await injectPropostaOGTags(req.originalUrl, html);
    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  });
}
