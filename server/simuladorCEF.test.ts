import { describe, it, expect } from "vitest";
import { calcularSimulacaoCEF } from "@/lib/simuladorCEF";

// Testa o helper real usado por SimuladorSection e PropostaComercial.
// Regra do cliente: os reforços são abatidos do FINANCIAMENTO, não da entrada.

describe("Simulador CEF — Regras de Negócio v3 (entrada até 48x, reforços abatem o financiamento, min 20%)", () => {

  describe("Cenário 1: R$ 375.000 | Entrada 20% | Sem reforço | 420 meses | Não cotista", () => {
    const sim = calcularSimulacaoCEF({
      valorImovel: 375000,
      percentualEntrada: 20,
      reforcos: 0,
      prazoMeses: 420,
      isCotista: false,
    });

    it("entrada total = R$ 75.000", () => {
      expect(sim.entradaTotal).toBe(75000);
    });

    it("parcela da entrada = R$ 75.000 / 36 ≈ R$ 2.083,33", () => {
      expect(sim.parcelaEntrada).toBeCloseTo(2083.33, 1);
    });

    it("financiamento = 80% = R$ 300.000", () => {
      expect(sim.valorFinanciado).toBe(300000);
      expect(sim.percentualFinanciado).toBe(80);
    });

    it("taxa anual = 7.66%", () => {
      expect(sim.taxaAnual).toBe(7.66);
    });

    it("parcela do financiamento > R$ 2.100 e < R$ 2.500", () => {
      expect(sim.parcelaFinanciamento).toBeGreaterThan(2100);
      expect(sim.parcelaFinanciamento).toBeLessThan(2500);
    });

    it("número de parcelas da entrada = 36 (padrão)", () => {
      expect(sim.numParcelasEntrada).toBe(36);
    });
  });

  describe("Cenário 2: R$ 419.000 | Entrada 30% | Reforço total R$ 20.000 | 360 meses | Cotista", () => {
    const sim = calcularSimulacaoCEF({
      valorImovel: 419000,
      percentualEntrada: 30,
      reforcos: 20000,
      prazoMeses: 360,
      isCotista: true,
    });

    it("entrada total = 30% de R$ 419.000 = R$ 125.700", () => {
      expect(sim.entradaTotal).toBe(125700);
    });

    it("reforço = R$ 20.000", () => {
      expect(sim.reforcos).toBe(20000);
    });

    it("parcela da entrada NÃO muda com reforço = R$ 125.700 / 36 ≈ R$ 3.491,67", () => {
      expect(sim.parcelaEntrada).toBeCloseTo(3491.67, 1);
    });

    it("financiamento = R$ 419.000 - R$ 125.700 - R$ 20.000 = R$ 273.300", () => {
      expect(sim.valorFinanciado).toBe(273300);
    });

    it("percentual financiado ≈ 65,2%", () => {
      expect(sim.percentualFinanciado).toBeCloseTo(65.2, 1);
    });

    it("taxa anual cotista = 7.16%", () => {
      expect(sim.taxaAnual).toBe(7.16);
    });
  });

  describe("Cenário 3: R$ 398.000 | Entrada 20% | Reforço total R$ 50.000 | 420 meses | Não cotista", () => {
    const sim = calcularSimulacaoCEF({
      valorImovel: 398000,
      percentualEntrada: 20,
      reforcos: 50000,
      prazoMeses: 420,
      isCotista: false,
    });

    it("entrada total = 20% de R$ 398.000 = R$ 79.600", () => {
      expect(sim.entradaTotal).toBe(79600);
    });

    it("parcela da entrada = R$ 79.600 / 36 ≈ R$ 2.211,11", () => {
      expect(sim.parcelaEntrada).toBeCloseTo(2211.11, 1);
    });

    it("financiamento = R$ 398.000 - R$ 79.600 - R$ 50.000 = R$ 268.400", () => {
      expect(sim.reforcos).toBe(50000);
      expect(sim.valorFinanciado).toBe(268400);
    });
  });

  describe("Regras de Validação", () => {
    it("percentual de entrada nunca pode ser menor que 20%", () => {
      const sim = calcularSimulacaoCEF({ valorImovel: 375000, percentualEntrada: 10, reforcos: 0, prazoMeses: 420, isCotista: false });
      expect(sim.percentualEntrada).toBe(20);
    });

    it("reforço não pode ser negativo", () => {
      const sim = calcularSimulacaoCEF({ valorImovel: 375000, percentualEntrada: 20, reforcos: -5000, prazoMeses: 420, isCotista: false });
      expect(sim.reforcos).toBe(0);
    });

    it("reforço não pode ser maior que o saldo a financiar", () => {
      const sim = calcularSimulacaoCEF({ valorImovel: 375000, percentualEntrada: 20, reforcos: 500000, prazoMeses: 420, isCotista: false });
      expect(sim.reforcos).toBe(300000);
      expect(sim.valorFinanciado).toBe(0);
      expect(sim.parcelaEntrada).toBeCloseTo(75000 / 36, 2);
    });

    it("entrada + reforços + financiamento = 100% do valor do imóvel", () => {
      const sim = calcularSimulacaoCEF({ valorImovel: 400000, percentualEntrada: 25, reforcos: 10000, prazoMeses: 420, isCotista: false });
      expect(sim.entradaTotal + sim.reforcos + sim.valorFinanciado).toBe(400000);
    });

    it("cotista FGTS reduz a parcela do financiamento", () => {
      const naoCotista = calcularSimulacaoCEF({ valorImovel: 375000, percentualEntrada: 20, reforcos: 0, prazoMeses: 420, isCotista: false });
      const cotista = calcularSimulacaoCEF({ valorImovel: 375000, percentualEntrada: 20, reforcos: 0, prazoMeses: 420, isCotista: true });
      expect(cotista.parcelaFinanciamento).toBeLessThan(naoCotista.parcelaFinanciamento);
      expect(cotista.taxaAnual).toBe(7.16);
      expect(naoCotista.taxaAnual).toBe(7.66);
    });

    it("prazo menor aumenta a parcela do financiamento", () => {
      const longo = calcularSimulacaoCEF({ valorImovel: 375000, percentualEntrada: 20, reforcos: 0, prazoMeses: 420, isCotista: false });
      const curto = calcularSimulacaoCEF({ valorImovel: 375000, percentualEntrada: 20, reforcos: 0, prazoMeses: 240, isCotista: false });
      expect(curto.parcelaFinanciamento).toBeGreaterThan(longo.parcelaFinanciamento);
    });

    it("parcela do financiamento = amortização + seguros + taxa admin", () => {
      const result = calcularSimulacaoCEF({ valorImovel: 375000, percentualEntrada: 20, reforcos: 0, prazoMeses: 420, isCotista: false });
      const expected = result.parcelaAmortizacao + result.seguroMIP + result.seguroDFI + result.taxaAdm;
      expect(result.parcelaFinanciamento).toBeCloseTo(expected, 2);
    });

    it("reforço reduz a parcela do financiamento", () => {
      const sem = calcularSimulacaoCEF({ valorImovel: 375000, percentualEntrada: 20, reforcos: 0, prazoMeses: 420, isCotista: false });
      const com = calcularSimulacaoCEF({ valorImovel: 375000, percentualEntrada: 20, reforcos: 30000, prazoMeses: 420, isCotista: false });
      expect(com.parcelaFinanciamento).toBeLessThan(sem.parcelaFinanciamento);
      expect(com.parcelaEntrada).toBe(sem.parcelaEntrada);
    });
  });

  describe("Slider: valor muda → tudo recalcula", () => {
    it("ao mudar valor do imóvel, entrada, parcela e financiamento mudam proporcionalmente", () => {
      const v1 = calcularSimulacaoCEF({ valorImovel: 375000, percentualEntrada: 20, reforcos: 0, prazoMeses: 420, isCotista: false });
      const v2 = calcularSimulacaoCEF({ valorImovel: 400000, percentualEntrada: 20, reforcos: 0, prazoMeses: 420, isCotista: false });
      const v3 = calcularSimulacaoCEF({ valorImovel: 419000, percentualEntrada: 20, reforcos: 0, prazoMeses: 420, isCotista: false });

      expect(v2.entradaTotal).toBe(80000);
      expect(v3.entradaTotal).toBe(83800);
      expect(v2.parcelaEntrada).toBeGreaterThan(v1.parcelaEntrada);
      expect(v3.parcelaEntrada).toBeGreaterThan(v2.parcelaEntrada);
      expect(v2.valorFinanciado).toBe(320000);
      expect(v3.valorFinanciado).toBe(335200);
      expect(v2.parcelaFinanciamento).toBeGreaterThan(v1.parcelaFinanciamento);
      expect(v3.parcelaFinanciamento).toBeGreaterThan(v2.parcelaFinanciamento);
    });
  });
});
