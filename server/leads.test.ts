import { describe, it, expect, vi } from "vitest";
import { z } from "zod";

// Test the leads input schema validation
describe("Leads Router - Input Validation", () => {
  const leadsRegistrarSchema = z.object({
    nomeCliente: z.string().min(1),
    telefoneCliente: z.string().optional(),
    emailCliente: z.string().email().optional(),
    corretorId: z.number().nullable().optional(),
    imobiliariaId: z.number().nullable().optional(),
    origem: z.string().optional(),
    mensagem: z.string().optional(),
    unidadeInteresse: z.string().optional(),
    simulacaoRealizada: z.number().optional(),
    propostaGerada: z.number().optional(),
    valorSimulado: z.number().optional(),
  });

  it("should validate a complete lead registration", () => {
    const input = {
      nomeCliente: "João Silva",
      telefoneCliente: "47999999999",
      emailCliente: "joao@email.com",
      corretorId: 1,
      imobiliariaId: 2,
      origem: "proposta",
      unidadeInteresse: "A101",
      simulacaoRealizada: 1,
      propostaGerada: 1,
      valorSimulado: 375000,
    };
    const result = leadsRegistrarSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nomeCliente).toBe("João Silva");
      expect(result.data.unidadeInteresse).toBe("A101");
      expect(result.data.valorSimulado).toBe(375000);
    }
  });

  it("should validate a minimal lead (only name required)", () => {
    const input = { nomeCliente: "Maria" };
    const result = leadsRegistrarSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("should reject empty name", () => {
    const input = { nomeCliente: "" };
    const result = leadsRegistrarSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("should reject invalid email", () => {
    const input = { nomeCliente: "Test", emailCliente: "not-an-email" };
    const result = leadsRegistrarSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("should allow null corretorId and imobiliariaId", () => {
    const input = {
      nomeCliente: "Test",
      corretorId: null,
      imobiliariaId: null,
    };
    const result = leadsRegistrarSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("should validate lead from link-corretor origin", () => {
    const input = {
      nomeCliente: "Cliente via Link",
      telefoneCliente: "47988887777",
      corretorId: 5,
      imobiliariaId: 3,
      origem: "link-corretor-joao-silva",
      unidadeInteresse: "B203",
      simulacaoRealizada: 0,
      propostaGerada: 0,
    };
    const result = leadsRegistrarSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.origem).toBe("link-corretor-joao-silva");
      expect(result.data.simulacaoRealizada).toBe(0);
    }
  });
});

describe("Corretores Router - Slug Validation", () => {
  const slugSchema = z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens");

  it("should accept valid slugs", () => {
    expect(slugSchema.safeParse("joao-silva").success).toBe(true);
    expect(slugSchema.safeParse("maria-123").success).toBe(true);
    expect(slugSchema.safeParse("corretor-a").success).toBe(true);
  });

  it("should reject invalid slugs", () => {
    expect(slugSchema.safeParse("João Silva").success).toBe(false);
    expect(slugSchema.safeParse("UPPER").success).toBe(false);
    expect(slugSchema.safeParse("has spaces").success).toBe(false);
    expect(slugSchema.safeParse("").success).toBe(false);
  });
});
