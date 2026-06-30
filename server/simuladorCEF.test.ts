import { describe, it, expect } from "vitest";

// Replicar a lógica do helper para teste (mesmo código de client/src/lib/simuladorCEF.ts)
const CEF_PARAMS = {
  taxaAnual: 7.66,
  taxaAnualCotista: 7.16,
  prazoMaxMeses: 420,
  seguroMIP: 0.0003,
  seguroDFI: 0.00005,
  taxaAdm: 25,
  numParcelasEntrada: 36,
  percentualEntradaMin: 20,
};

interface SimulacaoInput {
  valorImovel: number;
  percentualEntrada?: number;
  reforcos?: number;
  prazoMeses: number;
  isCotista: boolean;
}

function calcularSimulacaoCEF(input: SimulacaoInput) {
  const { valorImovel, prazoMeses, isCotista } = input;
  const percentualEntrada = Math.max(input.percentualEntrada ?? 20, CEF_PARAMS.percentualEntradaMin);
  const reforcos = Math.max(Math.min(input.reforcos ?? 0, valorImovel * percentualEntrada / 100), 0);
  const entradaTotal = valorImovel * percentualEntrada / 100;
  const saldoParcelado = Math.max(entradaTotal - reforcos, 0);
  const numParcelasEntrada = CEF_PARAMS.numParcelasEntrada;
  const parcelaEntrada = saldoParcelado / numParcelasEntrada;
  const percentualFinanciado = 100 - percentualEntrada;
  const valorFinanciado = valorImovel - entradaTotal;
  const taxaAnual = isCotista ? CEF_PARAMS.taxaAnualCotista : CEF_PARAMS.taxaAnual;
  const taxaMensal = taxaAnual / 100 / 12;
  const n = prazoMeses;
  const fator = Math.pow(1 + taxaMensal, n);
  const parcelaAmortizacao = valorFinanciado * (taxaMensal * fator) / (fator - 1);
  const seguroMIP = valorFinanciado * CEF_PARAMS.seguroMIP;
  const seguroDFI = valorImovel * CEF_PARAMS.seguroDFI;
  const taxaAdm = CEF_PARAMS.taxaAdm;
  const parcelaFinanciamento = parcelaAmortizacao + seguroMIP + seguroDFI + taxaAdm;
  const totalOperacao = entradaTotal + (parcelaFinanciamento * prazoMeses);

  return {
    valorImovel, percentualEntrada, entradaTotal, reforcos, saldoParcelado,
    numParcelasEntrada, parcelaEntrada, percentualFinanciado, valorFinanciado,
    taxaAnual, taxaMensal, parcelaAmortizacao, seguroMIP, seguroDFI, taxaAdm,
    parcelaFinanciamento, prazoMeses, isCotista, totalOperacao,
  };
}

describe("Simulador CEF — Regras de Negócio v2 (36x, reforços, min 20%)", () => {

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

    it("saldo parcelado = R$ 75.000 (sem reforço)", () => {
      expect(sim.saldoParcelado).toBe(75000);
    });

    it("parcela da entrada = R$ 75.000 / 36 ≈ R$ 2.083,33", () => {
      expect(sim.parcelaEntrada).toBeCloseTo(2083.33, 1);
    });

    it("financiamento = 80% = R$ 300.000", () => {
      expect(sim.valorFinanciado).toBe(300000);
    });

    it("taxa anual = 7.66%", () => {
      expect(sim.taxaAnual).toBe(7.66);
    });

    it("parcela do financiamento > R$ 2.100 e < R$ 2.500", () => {
      expect(sim.parcelaFinanciamento).toBeGreaterThan(2100);
      expect(sim.parcelaFinanciamento).toBeLessThan(2500);
    });

    it("número de parcelas da entrada = 36", () => {
      expect(sim.numParcelasEntrada).toBe(36);
    });
  });

  describe("Cenário 2: R$ 419.000 | Entrada 30% | Reforço R$ 20.000 | 360 meses | Cotista", () => {
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

    it("saldo parcelado = R$ 125.700 - R$ 20.000 = R$ 105.700", () => {
      expect(sim.saldoParcelado).toBe(105700);
    });

    it("parcela da entrada = R$ 105.700 / 36 ≈ R$ 2.936,11", () => {
      expect(sim.parcelaEntrada).toBeCloseTo(2936.11, 1);
    });

    it("financiamento = 70% = R$ 293.300 (reforço NÃO altera financiamento)", () => {
      expect(sim.valorFinanciado).toBe(293300);
    });

    it("taxa anual cotista = 7.16%", () => {
      expect(sim.taxaAnual).toBe(7.16);
    });

    it("percentual financiado = 70%", () => {
      expect(sim.percentualFinanciado).toBe(70);
    });
  });

  describe("Cenário 3: R$ 398.000 | Entrada 20% | Reforço R$ 50.000 | 420 meses | Não cotista", () => {
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

    it("reforço = R$ 50.000 (menor que entrada, aceito integralmente)", () => {
      expect(sim.reforcos).toBe(50000);
    });

    it("saldo parcelado = R$ 79.600 - R$ 50.000 = R$ 29.600", () => {
      expect(sim.saldoParcelado).toBe(29600);
    });

    it("parcela da entrada = R$ 29.600 / 36 ≈ R$ 822,22", () => {
      expect(sim.parcelaEntrada).toBeCloseTo(822.22, 1);
    });

    it("financiamento = 80% = R$ 318.400 (reforço NÃO altera)", () => {
      expect(sim.valorFinanciado).toBe(318400);
    });

    it("percentual financiado = 80%", () => {
      expect(sim.percentualFinanciado).toBe(80);
    });
  });

  describe("Regras de Validação", () => {
    it("percentual de entrada nunca pode ser menor que 20%", () => {
      const sim = calcularSimulacaoCEF({
        valorImovel: 375000,
        percentualEntrada: 10,
        reforcos: 0,
        prazoMeses: 420,
        isCotista: false,
      });
      expect(sim.percentualEntrada).toBe(20);
    });

    it("reforço não pode ser negativo", () => {
      const sim = calcularSimulacaoCEF({
        valorImovel: 375000,
        percentualEntrada: 20,
        reforcos: -5000,
        prazoMeses: 420,
        isCotista: false,
      });
      expect(sim.reforcos).toBe(0);
    });

    it("reforço não pode ser maior que a entrada total", () => {
      const sim = calcularSimulacaoCEF({
        valorImovel: 375000,
        percentualEntrada: 20,
        reforcos: 100000,
        prazoMeses: 420,
        isCotista: false,
      });
      expect(sim.reforcos).toBe(75000);
      expect(sim.saldoParcelado).toBe(0);
      expect(sim.parcelaEntrada).toBe(0);
    });

    it("entrada + financiamento = 100% do valor do imóvel", () => {
      const sim = calcularSimulacaoCEF({
        valorImovel: 400000,
        percentualEntrada: 25,
        reforcos: 10000,
        prazoMeses: 420,
        isCotista: false,
      });
      expect(sim.entradaTotal + sim.valorFinanciado).toBe(400000);
    });

    it("número de parcelas da entrada é sempre 36", () => {
      const sim = calcularSimulacaoCEF({
        valorImovel: 419000,
        percentualEntrada: 40,
        reforcos: 0,
        prazoMeses: 300,
        isCotista: true,
      });
      expect(sim.numParcelasEntrada).toBe(36);
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
