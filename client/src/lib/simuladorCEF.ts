/**
 * Simulador CEF — Fonte única de verdade
 * Usado por SimuladorSection e PropostaComercial
 * MCMV Faixa 3 — Tabela Price + TR
 *
 * REGRAS CENTRAIS:
 * - Entrada mínima: 20% do valor da unidade
 * - Entrada parcelada em 36x
 * - Reforços: abatidos da entrada antes do parcelamento (NÃO diminuem o financiamento)
 * - Financiamento = Valor Unidade - Entrada Total (máximo 80%)
 * - Entrada + Financiamento = sempre 100% do valor da unidade
 *
 * Fórmula:
 *   Entrada Total = Valor × % Entrada
 *   Saldo Parcelado = Entrada Total - Reforços
 *   Parcela Mensal = Saldo Parcelado / 36
 *   Financiamento = Valor - Entrada Total (nunca > 80%)
 */

export const CEF_PARAMS = {
  taxaAnual: 7.66,
  taxaAnualCotista: 7.16,
  prazoMaxMeses: 420,
  seguroMIP: 0.0003,
  seguroDFI: 0.00005,
  taxaAdm: 25,
  numParcelasEntrada: 36,
  percentualEntradaMin: 20,
};

export interface SimulacaoCEF {
  valorImovel: number;
  percentualEntrada: number;
  entradaTotal: number;
  reforcos: number;
  saldoParcelado: number;
  numParcelasEntrada: number;
  parcelaEntrada: number;
  percentualFinanciado: number;
  valorFinanciado: number;
  taxaAnual: number;
  taxaMensal: number;
  parcelaAmortizacao: number;
  seguroMIP: number;
  seguroDFI: number;
  taxaAdm: number;
  parcelaFinanciamento: number;
  prazoMeses: number;
  isCotista: boolean;
  totalOperacao: number;
}

export interface SimulacaoInput {
  valorImovel: number;
  percentualEntrada?: number; // default 20, min 20, max ~80
  reforcos?: number; // default 0
  prazoMeses: number;
  isCotista: boolean;
}

/**
 * Calcula todos os valores da simulação CEF a partir dos parâmetros de entrada.
 * Mesma fórmula usada em todos os módulos do sistema.
 *
 * REGRA-CHAVE: "reforço não diminui o financiamento;
 * reforço apenas reduz o saldo da entrada que será dividido em 36x."
 */
export function calcularSimulacaoCEF(input: SimulacaoInput): SimulacaoCEF {
  const { valorImovel, prazoMeses, isCotista } = input;

  // Percentual de entrada (mínimo 20%)
  const percentualEntrada = Math.max(input.percentualEntrada ?? 20, CEF_PARAMS.percentualEntradaMin);

  // Reforços (default 0, não pode ser negativo, não pode ser maior que a entrada)
  const reforcos = Math.max(Math.min(input.reforcos ?? 0, valorImovel * percentualEntrada / 100), 0);

  // Entrada Total = Valor × % Entrada
  const entradaTotal = valorImovel * percentualEntrada / 100;

  // Saldo Parcelado = Entrada Total - Reforços
  const saldoParcelado = Math.max(entradaTotal - reforcos, 0);

  // Parcela Mensal da Entrada = Saldo Parcelado / 36
  const numParcelasEntrada = CEF_PARAMS.numParcelasEntrada;
  const parcelaEntrada = saldoParcelado / numParcelasEntrada;

  // Financiamento = Valor - Entrada Total (máximo 80%)
  // IMPORTANTE: Reforço NÃO altera o financiamento
  const percentualFinanciado = 100 - percentualEntrada;
  const valorFinanciado = valorImovel - entradaTotal;

  // Taxa mensal (Price)
  const taxaAnual = isCotista ? CEF_PARAMS.taxaAnualCotista : CEF_PARAMS.taxaAnual;
  const taxaMensal = taxaAnual / 100 / 12;
  const n = prazoMeses;

  // Cálculo da parcela Price: PMT = PV * [i * (1+i)^n] / [(1+i)^n - 1]
  const fator = Math.pow(1 + taxaMensal, n);
  const parcelaAmortizacao = valorFinanciado * (taxaMensal * fator) / (fator - 1);

  // Seguros e taxa de administração
  const seguroMIP = valorFinanciado * CEF_PARAMS.seguroMIP;
  const seguroDFI = valorImovel * CEF_PARAMS.seguroDFI;
  const taxaAdm = CEF_PARAMS.taxaAdm;

  // Parcela total do financiamento (1ª parcela)
  const parcelaFinanciamento = parcelaAmortizacao + seguroMIP + seguroDFI + taxaAdm;

  // Total da operação = Entrada Total + Financiamento Total (parcelas × prazo)
  const totalOperacao = entradaTotal + (parcelaFinanciamento * prazoMeses);

  return {
    valorImovel,
    percentualEntrada,
    entradaTotal,
    reforcos,
    saldoParcelado,
    numParcelasEntrada,
    parcelaEntrada,
    percentualFinanciado,
    valorFinanciado,
    taxaAnual,
    taxaMensal,
    parcelaAmortizacao,
    seguroMIP,
    seguroDFI,
    taxaAdm,
    parcelaFinanciamento,
    prazoMeses,
    isCotista,
    totalOperacao,
  };
}
