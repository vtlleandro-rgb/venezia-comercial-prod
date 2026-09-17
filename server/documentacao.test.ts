import { describe, it, expect } from "vitest";
import {
  UNIDADES,
  PERCENTUAL_DOCUMENTACAO,
  calcularValorComDocumentacao,
  normalizarUnidades,
  type Unidade,
} from "../client/src/data/empreendimento";

// Valores lidos da tabela em producao (banco), com 101/201/301 divergentes.
const DO_BANCO = [
  { id: "101", valorVenda: 419000, valorComDocumentacao: 390000 },
  { id: "201", valorVenda: 419000, valorComDocumentacao: 425360 },
  { id: "301", valorVenda: 429000, valorComDocumentacao: 435760 },
  { id: "401", valorVenda: 429000, valorComDocumentacao: 446160 },
] as unknown as Unidade[];

describe("valor com documentacao", () => {
  it("aplica exatamente 4% sobre o valor de venda", () => {
    expect(PERCENTUAL_DOCUMENTACAO).toBe(0.04);
    expect(calcularValorComDocumentacao(419000)).toBe(435760);
    expect(calcularValorComDocumentacao(429000)).toBe(446160);
    expect(calcularValorComDocumentacao(375000)).toBe(390000);
  });

  it("corrige as unidades divergentes vindas do banco", () => {
    const corrigidas = normalizarUnidades(DO_BANCO);
    expect(corrigidas.map((u) => u.valorComDocumentacao)).toEqual([
      435760, 435760, 446160, 446160,
    ]);
  });

  it("nao altera unidades que ja estavam corretas", () => {
    const ok = [{ id: "402", valorVenda: 419000, valorComDocumentacao: 435760 }] as unknown as Unidade[];
    expect(normalizarUnidades(ok)[0].valorComDocumentacao).toBe(435760);
  });

  it("mantem a tabela estatica integra (ja estava em 4%)", () => {
    for (const u of UNIDADES) {
      expect(u.valorComDocumentacao).toBe(calcularValorComDocumentacao(u.valorVenda));
    }
  });

  it("o total com documentacao fecha com o total de venda + 4%", () => {
    const n = normalizarUnidades(UNIDADES);
    const venda = n.reduce((s, u) => s + u.valorVenda, 0);
    const comDoc = n.reduce((s, u) => s + u.valorComDocumentacao, 0);
    expect(comDoc).toBe(Math.round(venda * 1.04));
  });
});
