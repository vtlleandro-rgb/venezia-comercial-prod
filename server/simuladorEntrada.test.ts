import { describe, it, expect } from "vitest";
import {
  calcularSimulacaoCEF,
  limitarParcelasEntrada,
  mesesDosReforcos,
  CEF_PARAMS,
} from "@/lib/simuladorCEF";

describe("Simulador CEF — parcelas da entrada (até 48x) e reforços periódicos abatidos do financiamento", () => {
  it("mantém 36x como padrão quando nada é informado", () => {
    const sim = calcularSimulacaoCEF({ valorImovel: 375000, percentualEntrada: 20, prazoMeses: 420, isCotista: false });
    expect(sim.numParcelasEntrada).toBe(36);
    expect(sim.parcelaEntrada).toBeCloseTo(75000 / 36, 2);
    expect(sim.reforcos).toBe(0);
  });

  it("aceita qualquer prazo entre 1 e 48 e bloqueia acima de 48", () => {
    expect(CEF_PARAMS.numParcelasEntradaMax).toBe(48);
    expect(limitarParcelasEntrada(48)).toBe(48);
    expect(limitarParcelasEntrada(60)).toBe(48);
    expect(limitarParcelasEntrada(0)).toBe(1);
    expect(limitarParcelasEntrada(undefined)).toBe(36);
    const sim = calcularSimulacaoCEF({ valorImovel: 375000, percentualEntrada: 20, numParcelasEntrada: 120, prazoMeses: 420, isCotista: false });
    expect(sim.numParcelasEntrada).toBe(48);
    expect(sim.parcelaEntrada).toBeCloseTo(75000 / 48, 2);
  });

  it("distribui os reforços dentro do prazo da entrada", () => {
    expect(mesesDosReforcos(36, "semestral")).toEqual([6, 12, 18, 24, 30, 36]);
    expect(mesesDosReforcos(48, "anual")).toEqual([12, 24, 36, 48]);
    expect(mesesDosReforcos(48, "trimestral")).toHaveLength(16);
    expect(mesesDosReforcos(5, "semestral")).toEqual([]);
  });

  it("reforços semestrais de R$ 5.000 em 36x abatem o financiamento, não a entrada", () => {
    const sim = calcularSimulacaoCEF({
      valorImovel: 375000, percentualEntrada: 20, numParcelasEntrada: 36,
      valorReforco: 5000, periodicidadeReforco: "semestral", prazoMeses: 420, isCotista: false,
    });
    expect(sim.quantidadeReforcos).toBe(6);
    expect(sim.reforcos).toBe(30000);
    // entrada intacta
    expect(sim.entradaTotal).toBe(75000);
    expect(sim.parcelaEntrada).toBeCloseTo(75000 / 36, 2);
    // financiamento reduzido
    expect(sim.valorFinanciado).toBe(270000);
    expect(sim.percentualFinanciado).toBe(72);
    expect(sim.entradaTotal + sim.reforcos + sim.valorFinanciado).toBe(375000);
  });

  it("reforços anuais em 48x e trimestrais em 48x", () => {
    const anual = calcularSimulacaoCEF({
      valorImovel: 400000, percentualEntrada: 20, numParcelasEntrada: 48,
      valorReforco: 10000, periodicidadeReforco: "anual", prazoMeses: 420, isCotista: false,
    });
    expect(anual.quantidadeReforcos).toBe(4);
    expect(anual.reforcos).toBe(40000);
    expect(anual.parcelaEntrada).toBeCloseTo(80000 / 48, 2);
    expect(anual.valorFinanciado).toBe(280000);

    const trimestral = calcularSimulacaoCEF({
      valorImovel: 400000, percentualEntrada: 20, numParcelasEntrada: 48,
      valorReforco: 2000, periodicidadeReforco: "trimestral", prazoMeses: 420, isCotista: false,
    });
    expect(trimestral.quantidadeReforcos).toBe(16);
    expect(trimestral.reforcos).toBe(32000);
    expect(trimestral.valorFinanciado).toBe(288000);
  });

  it("limita os reforços ao saldo a financiar", () => {
    const sim = calcularSimulacaoCEF({
      valorImovel: 375000, percentualEntrada: 20, numParcelasEntrada: 48,
      valorReforco: 100000, periodicidadeReforco: "anual", prazoMeses: 420, isCotista: false,
    });
    expect(sim.reforcos).toBe(300000);
    expect(sim.valorFinanciado).toBe(0);
    expect(sim.parcelaEntrada).toBeCloseTo(75000 / 48, 2);
  });

  it("continua aceitando o total de reforços (compatibilidade)", () => {
    const sim = calcularSimulacaoCEF({ valorImovel: 375000, percentualEntrada: 20, numParcelasEntrada: 40, reforcos: 30000, prazoMeses: 420, isCotista: false });
    expect(sim.reforcos).toBe(30000);
    expect(sim.parcelaEntrada).toBeCloseTo(75000 / 40, 2);
    expect(sim.valorFinanciado).toBe(270000);
  });

  it("com documentação (4%): 301 a R$ 435.760, 48x, 8 reforços semestrais de R$ 5.000", () => {
    const sim = calcularSimulacaoCEF({
      valorImovel: 435760, percentualEntrada: 20, numParcelasEntrada: 48,
      valorReforco: 5000, periodicidadeReforco: "semestral", prazoMeses: 420, isCotista: false,
    });
    expect(sim.entradaTotal).toBe(87152);
    expect(sim.parcelaEntrada).toBeCloseTo(87152 / 48, 2);
    expect(sim.quantidadeReforcos).toBe(8);
    expect(sim.reforcos).toBe(40000);
    expect(sim.valorFinanciado).toBe(308608);
  });
});
