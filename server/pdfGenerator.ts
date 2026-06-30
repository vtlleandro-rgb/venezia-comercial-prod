import { execSync } from "child_process";
import puppeteer from "puppeteer-core";

function resolveChromiumPath(): string {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  for (const cmd of ["chromium", "chromium-browser", "google-chrome", "google-chrome-stable"]) {
    try {
      const p = execSync(`which ${cmd}`, { stdio: ["pipe", "pipe", "ignore"] }).toString().trim();
      if (p) return p;
    } catch { /* try next */ }
  }
  return "/usr/bin/chromium";
}

const CHROMIUM_PATH = resolveChromiumPath();

interface PdfOptions {
  htmlContent: string;
  format?: "A4" | "Letter";
  landscape?: boolean;
}

interface ScreenshotOptions {
  htmlContent: string;
  width?: number;
  height?: number;
  quality?: number;
}

/**
 * Gera PDF a partir de HTML usando Puppeteer (server-side)
 * Garante fidelidade visual total: cores, fundos, logos, tipografia
 */
export async function generatePdfFromHtml(options: PdfOptions): Promise<Buffer> {
  const { htmlContent, format = "A4", landscape = false } = options;

  const browser = await puppeteer.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--font-render-hinting=none",
    ],
  });

  try {
    const page = await browser.newPage();

    // Configurar viewport para A4
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

    // Carregar o HTML
    await page.setContent(htmlContent, {
      waitUntil: "load",
      timeout: 30000,
    });

    // Aguardar imagens carregarem
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.querySelectorAll("img")).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            setTimeout(resolve, 5000);
          });
        })
      );
    });

    // Delay para renderização final (fontes, gradientes)
    await new Promise((r) => setTimeout(r, 1000));

    // Gerar PDF com backgrounds preservados
    const pdfBuffer = await page.pdf({
      format,
      landscape,
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

/**
 * Gera screenshot/thumbnail da proposta para Open Graph preview
 */
export async function generateScreenshotFromHtml(options: ScreenshotOptions): Promise<Buffer> {
  const { htmlContent, width = 1200, height = 630, quality = 85 } = options;

  const browser = await puppeteer.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({ width, height, deviceScaleFactor: 2 });

    await page.setContent(htmlContent, {
      waitUntil: "load",
      timeout: 30000,
    });

    // Aguardar imagens
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.querySelectorAll("img")).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            setTimeout(resolve, 5000);
          });
        })
      );
    });

    await new Promise((r) => setTimeout(r, 500));

    const screenshot = await page.screenshot({
      type: "jpeg",
      quality,
      clip: { x: 0, y: 0, width, height },
    });

    return Buffer.from(screenshot);
  } finally {
    await browser.close();
  }
}
