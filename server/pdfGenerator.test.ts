import { describe, it, expect } from "vitest";

// Unit tests for pdfGenerator module
// Note: These test the module structure and configuration, not actual Puppeteer rendering
// (which requires a running Chromium instance)

describe("pdfGenerator module", () => {
  it("should export generatePdfFromHtml function", async () => {
    const mod = await import("./pdfGenerator");
    expect(mod.generatePdfFromHtml).toBeDefined();
    expect(typeof mod.generatePdfFromHtml).toBe("function");
  });

  it("should export generateScreenshotFromHtml function", async () => {
    const mod = await import("./pdfGenerator");
    expect(mod.generateScreenshotFromHtml).toBeDefined();
    expect(typeof mod.generateScreenshotFromHtml).toBe("function");
  });

  it("generatePdfFromHtml should accept PdfOptions with defaults", async () => {
    const mod = await import("./pdfGenerator");
    // Verify function signature accepts htmlContent
    // We can't run Puppeteer in test env, but we verify the function exists
    expect(mod.generatePdfFromHtml.length).toBeGreaterThanOrEqual(1);
  });

  it("generateScreenshotFromHtml should accept ScreenshotOptions with defaults", async () => {
    const mod = await import("./pdfGenerator");
    expect(mod.generateScreenshotFromHtml.length).toBeGreaterThanOrEqual(1);
  });
});

describe("PDF generation configuration", () => {
  it("should use printBackground: true for color fidelity", async () => {
    // Verify by reading the source - the key configuration that ensures
    // colors, backgrounds, and gradients are preserved in the PDF output
    const fs = await import("fs");
    const source = fs.readFileSync("./server/pdfGenerator.ts", "utf-8");
    expect(source).toContain("printBackground: true");
  });

  it("should use deviceScaleFactor: 2 for high resolution", async () => {
    const fs = await import("fs");
    const source = fs.readFileSync("./server/pdfGenerator.ts", "utf-8");
    expect(source).toContain("deviceScaleFactor: 2");
  });

  it("should wait for images to load before generating PDF", async () => {
    const fs = await import("fs");
    const source = fs.readFileSync("./server/pdfGenerator.ts", "utf-8");
    expect(source).toContain("img.onload");
    expect(source).toContain("img.complete");
  });

  it("should use zero margins for full-bleed PDF", async () => {
    const fs = await import("fs");
    const source = fs.readFileSync("./server/pdfGenerator.ts", "utf-8");
    expect(source).toContain('margin: { top: "0", right: "0", bottom: "0", left: "0" }');
  });

  it("should use --no-sandbox for server environments", async () => {
    const fs = await import("fs");
    const source = fs.readFileSync("./server/pdfGenerator.ts", "utf-8");
    expect(source).toContain("--no-sandbox");
  });

  it("should generate JPEG screenshots with configurable quality", async () => {
    const fs = await import("fs");
    const source = fs.readFileSync("./server/pdfGenerator.ts", "utf-8");
    expect(source).toContain('type: "jpeg"');
    expect(source).toContain("quality");
  });

  it("should use 1200x630 viewport for OG-compliant thumbnails", async () => {
    const fs = await import("fs");
    const source = fs.readFileSync("./server/pdfGenerator.ts", "utf-8");
    expect(source).toContain("width = 1200");
    expect(source).toContain("height = 630");
  });
});

describe("Server endpoints configuration", () => {
  it("should have PDF endpoint route defined", async () => {
    const fs = await import("fs");
    const source = fs.readFileSync("./server/_core/index.ts", "utf-8");
    expect(source).toContain("/api/propostas/:codigo/pdf");
  });

  it("should have thumbnail endpoint route defined", async () => {
    const fs = await import("fs");
    const source = fs.readFileSync("./server/_core/index.ts", "utf-8");
    expect(source).toContain("/api/propostas/:codigo/thumbnail");
  });

  it("should set correct content-type for PDF response", async () => {
    const fs = await import("fs");
    const source = fs.readFileSync("./server/_core/index.ts", "utf-8");
    expect(source).toContain("application/pdf");
  });

  it("should set correct content-type for thumbnail response", async () => {
    const fs = await import("fs");
    const source = fs.readFileSync("./server/_core/index.ts", "utf-8");
    expect(source).toContain("image/jpeg");
  });
});

describe("Open Graph meta tags", () => {
  it("should inject OG tags for proposal pages", async () => {
    const fs = await import("fs");
    const source = fs.readFileSync("./server/_core/vite.ts", "utf-8");
    expect(source).toContain("og:title");
    expect(source).toContain("og:description");
    expect(source).toContain("og:image");
  });

  it("should use twitter:card summary_large_image for rich preview", async () => {
    const fs = await import("fs");
    const source = fs.readFileSync("./server/_core/vite.ts", "utf-8");
    expect(source).toContain("summary_large_image");
  });

  it("should point OG image to thumbnail endpoint", async () => {
    const fs = await import("fs");
    const source = fs.readFileSync("./server/_core/vite.ts", "utf-8");
    expect(source).toContain("/api/propostas/");
    expect(source).toContain("/thumbnail");
  });
});
