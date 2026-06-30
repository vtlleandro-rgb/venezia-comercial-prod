import { describe, it, expect } from "vitest";

// Test the CEF calculation logic (same as used in PropostaComercial and SimuladorSection)
const CEF_PARAMS = {
  taxaAnual: 7.66,
  taxaAnualCotista: 7.16,
  prazoMaxMeses: 420,
  seguroMIP: 0.0003,
  seguroDFI: 0.00005,
  taxaAdm: 25,
};

function calcularSimulacao(valorImovel: number, prazoMeses: number, isCotista: boolean) {
  const entradaTotal = valorImovel * 0.20;
  const reforcoChaves = 20000;
  const entradaLiquida = entradaTotal - reforcoChaves;
  const parcelaEntrada = entradaLiquida / 37;
  const valorFinanciado = valorImovel * 0.80;
  const taxaAnual = isCotista ? CEF_PARAMS.taxaAnualCotista : CEF_PARAMS.taxaAnual;
  const taxaMensal = taxaAnual / 100 / 12;
  const n = prazoMeses;
  const fator = Math.pow(1 + taxaMensal, n);
  const parcelaAmortizacao = valorFinanciado * (taxaMensal * fator) / (fator - 1);
  const seguroMIP = valorFinanciado * CEF_PARAMS.seguroMIP;
  const seguroDFI = valorImovel * CEF_PARAMS.seguroDFI;
  const taxaAdm = CEF_PARAMS.taxaAdm;
  const parcelaFinanciamento = parcelaAmortizacao + seguroMIP + seguroDFI + taxaAdm;

  return {
    valorImovel,
    entradaTotal,
    reforcoChaves,
    entradaLiquida,
    parcelaEntrada,
    valorFinanciado,
    taxaAnual,
    parcelaAmortizacao,
    seguroMIP,
    seguroDFI,
    taxaAdm,
    parcelaFinanciamento,
    prazoMeses,
  };
}

describe("Proposta Comercial - Cálculos CEF", () => {
  it("calcula entrada de 20% corretamente", () => {
    const sim = calcularSimulacao(375000, 420, false);
    expect(sim.entradaTotal).toBe(75000);
    expect(sim.valorFinanciado).toBe(300000);
  });

  it("calcula entrada líquida descontando reforço de R$ 20k", () => {
    const sim = calcularSimulacao(375000, 420, false);
    expect(sim.entradaLiquida).toBe(55000);
    expect(sim.reforcoChaves).toBe(20000);
  });

  it("calcula parcela da entrada como entrada líquida / 37", () => {
    const sim = calcularSimulacao(375000, 420, false);
    expect(sim.parcelaEntrada).toBeCloseTo(55000 / 37, 2);
  });

  it("aplica taxa não cotista de 7.66% a.a.", () => {
    const sim = calcularSimulacao(375000, 420, false);
    expect(sim.taxaAnual).toBe(7.66);
  });

  it("aplica taxa cotista de 7.16% a.a.", () => {
    const sim = calcularSimulacao(375000, 420, true);
    expect(sim.taxaAnual).toBe(7.16);
  });

  it("parcela financiamento inclui amortização + seguros + taxa admin", () => {
    const sim = calcularSimulacao(375000, 420, false);
    const expectedTotal = sim.parcelaAmortizacao + sim.seguroMIP + sim.seguroDFI + sim.taxaAdm;
    expect(sim.parcelaFinanciamento).toBeCloseTo(expectedTotal, 2);
  });

  it("parcela financiamento é positiva e razoável para R$ 375k", () => {
    const sim = calcularSimulacao(375000, 420, false);
    // Parcela deve estar entre R$ 1.500 e R$ 3.000 para financiamento de R$ 300k em 420 meses
    expect(sim.parcelaFinanciamento).toBeGreaterThan(1500);
    expect(sim.parcelaFinanciamento).toBeLessThan(3000);
  });

  it("parcela cotista é menor que não cotista", () => {
    const simNaoCotista = calcularSimulacao(375000, 420, false);
    const simCotista = calcularSimulacao(375000, 420, true);
    expect(simCotista.parcelaFinanciamento).toBeLessThan(simNaoCotista.parcelaFinanciamento);
  });

  it("prazo menor gera parcela maior", () => {
    const sim420 = calcularSimulacao(375000, 420, false);
    const sim300 = calcularSimulacao(375000, 300, false);
    expect(sim300.parcelaFinanciamento).toBeGreaterThan(sim420.parcelaFinanciamento);
  });

  it("calcula corretamente para valor máximo (R$ 419k)", () => {
    const sim = calcularSimulacao(419000, 420, false);
    expect(sim.entradaTotal).toBe(83800);
    expect(sim.valorFinanciado).toBe(335200);
    expect(sim.entradaLiquida).toBe(63800);
    expect(sim.parcelaEntrada).toBeCloseTo(63800 / 37, 2);
  });

  it("seguro MIP é calculado sobre o saldo financiado", () => {
    const sim = calcularSimulacao(375000, 420, false);
    expect(sim.seguroMIP).toBeCloseTo(300000 * 0.0003, 2);
  });

  it("seguro DFI é calculado sobre o valor do imóvel", () => {
    const sim = calcularSimulacao(375000, 420, false);
    expect(sim.seguroDFI).toBeCloseTo(375000 * 0.00005, 2);
  });

  it("taxa administrativa é fixa em R$ 25", () => {
    const sim = calcularSimulacao(375000, 420, false);
    expect(sim.taxaAdm).toBe(25);
  });
});
