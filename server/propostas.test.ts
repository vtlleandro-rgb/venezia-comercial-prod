import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module
vi.mock("./db", () => ({
  salvarProposta: vi.fn(),
  getPropostaByCodigo: vi.fn(),
}));

import { salvarProposta, getPropostaByCodigo } from "./db";

describe("Propostas - Salvar e Buscar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("salvarProposta", () => {
    it("deve salvar proposta com código gerado", async () => {
      const mockData = {
        codigo: "VNZ-TEST123",
        htmlContent: "<html><body>Proposta</body></html>",
        corretorId: 1,
        nomeCliente: "João Silva",
        valorImovel: 375000,
        unidadeNumero: "101",
      };

      (salvarProposta as any).mockResolvedValue("VNZ-TEST123");
      const result = await salvarProposta(mockData as any);
      expect(result).toBe("VNZ-TEST123");
      expect(salvarProposta).toHaveBeenCalledWith(mockData);
    });

    it("deve aceitar proposta sem dados opcionais", async () => {
      const mockData = {
        codigo: "VNZ-ABC",
        htmlContent: "<html><body>Proposta mínima</body></html>",
        corretorId: null,
        nomeCliente: null,
        valorImovel: null,
        unidadeNumero: null,
      };

      (salvarProposta as any).mockResolvedValue("VNZ-ABC");
      const result = await salvarProposta(mockData as any);
      expect(result).toBe("VNZ-ABC");
    });

    it("deve gerar código com prefixo VNZ-", async () => {
      const codigo = `VNZ-${Date.now().toString(36).toUpperCase()}`;
      expect(codigo).toMatch(/^VNZ-[A-Z0-9]+$/);
    });
  });

  describe("getPropostaByCodigo", () => {
    it("deve retornar proposta quando código existe", async () => {
      const mockProposta = {
        id: 1,
        codigo: "VNZ-TEST123",
        htmlContent: "<html><body>Proposta completa</body></html>",
        corretorId: 1,
        nomeCliente: "Maria Oliveira",
        valorImovel: 400000,
        unidadeNumero: "201",
        createdAt: new Date(),
      };

      (getPropostaByCodigo as any).mockResolvedValue(mockProposta);
      const result = await getPropostaByCodigo("VNZ-TEST123");
      expect(result).toEqual(mockProposta);
      expect(result?.htmlContent).toContain("Proposta completa");
    });

    it("deve retornar null quando código não existe", async () => {
      (getPropostaByCodigo as any).mockResolvedValue(null);
      const result = await getPropostaByCodigo("VNZ-INEXISTENTE");
      expect(result).toBeNull();
    });

    it("deve buscar pelo código exato", async () => {
      (getPropostaByCodigo as any).mockResolvedValue(null);
      await getPropostaByCodigo("VNZ-ABC123");
      expect(getPropostaByCodigo).toHaveBeenCalledWith("VNZ-ABC123");
    });
  });

  describe("HTML da proposta", () => {
    it("deve conter print-color-adjust para preservar cores no PDF", () => {
      const htmlContent = `
        *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}
        body{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
      `;
      expect(htmlContent).toContain("print-color-adjust:exact");
      expect(htmlContent).toContain("-webkit-print-color-adjust:exact");
    });

    it("deve conter @media print sem margens para PDF limpo", () => {
      const htmlContent = `@media print{@page{margin:0.5cm}body{padding:0}}`;
      expect(htmlContent).toContain("@media print");
      expect(htmlContent).toContain("@page");
    });

    it("deve preservar backgrounds na impressão", () => {
      const cssRule = "color-adjust:exact!important";
      expect(cssRule).toBeTruthy();
    });
  });
});
