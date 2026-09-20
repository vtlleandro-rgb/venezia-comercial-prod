/**
 * Simulador CEF — Fonte única de verdade
 * Usado por SimuladorSection e PropostaComercial
 * MCMV Faixa 3 — Tabela Price + TR
 *
 * REGRAS CENTRAIS:
 * - Entrada mínima: 20% do valor da unidade
 * - Entrada parcelada em até 48x (padrão 36x), escolhido pelo usuário
 * - Reforços: periódicos (trimestral, semestral ou anual) dentro do prazo da entrada;
 *   abatidos da entrada antes do parcelamento (NÃO diminuem o financiamento)
 * - Financiamento = Valor Unidade - Entrada Total (máximo 80%)
 * - Entrada + Financiamento = sempre 100% do valor da unidade
 *
 * Fórmula:
 *   Entrada Total = Valor × % Entrada
 *   Qtd Reforços   = floor(Nº Parcelas Entrada / meses da periodicidade)
 *   Reforços       = Valor do Reforço × Qtd Reforços (limitado à Entrada Total)
 *   Saldo Parcelado = Entrada Total - Reforços
 *   Parcela Mensal = Saldo Parcelado / Nº Parcelas Entrada
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
  numParcelasEntradaMin: 1,
  numParcelasEntradaMax: 48,
  percentualEntradaMin: 20,
};

export type PeriodicidadeReforco = "trimestral" | "semestral" | "anual";

export const PERIODICIDADE_REFORCO: Record<PeriodicidadeReforco, { meses: number; label: string }> = {
  trimestral: { meses: 3, label: "Trimestral" },
  semestral: { meses: 6, label: "Semestral" },
  anual: { meses: 12, label: "Anual" },
};

/** Limita o número de parcelas da entrada ao intervalo permitido (1 a 48). */
export function limitarParcelasEntrada(n: number | undefined): number {
  const v = Math.round(n ?? CEF_PARAMS.numParcelasEntrada);
  if (!Number.isFinite(v)) return CEF_PARAMS.numParcelasEntrada;
  return Math.min(Math.max(v, CEF_PARAMS.numParcelasEntradaMin), CEF_PARAMS.numParcelasEntradaMax);
}

/** Meses em que os reforços vencem dentro do prazo da entrada (ex.: semestral em 36x → 6, 12, 18, 24, 30, 36). */
export function mesesDosReforcos(numParcelasEntrada: number, periodicidade: PeriodicidadeReforco): number[] {
  const intervalo = PERIODICIDADE_REFORCO[periodicidade].meses;
  const meses: number[] = [];
  for (let m = intervalo; m <= numParcelasEntrada; m += intervalo) meses.push(m);
  return meses;
}

export interface SimulacaoCEF {
  valorImovel: number;
  percentualEntrada: number;
  entradaTotal: number;
  reforcos: number;
  valorReforco: number;
  periodicidadeReforco: PeriodicidadeReforco;
  quantidadeReforcos: number;
  mesesReforcos: number[];
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
  numParcelasEntrada?: number; // default 36, min 1, max 48
  /** Valor de cada reforço periódico. Quando informado, tem prioridade sobre `reforcos`. */
  valorReforco?: number;
  periodicidadeReforco?: PeriodicidadeReforco; // default "semestral"
  /** Total de reforços (compatibilidade: usado só quando `valorReforco` não é informado). */
  reforcos?: number; // default 0
  prazoMeses: number;
  isCotista: boolean;
}

/**
 * Calcula todos os valores da simulação CEF a partir dos parâmetros de entrada.
 * Mesma fórmula usada em todos os módulos do sistema.
 *
 * REGRA-CHAVE: "reforço não diminui o financiamento;
 * reforço apenas reduz o saldo da entrada que será dividido em até 48x."
 */
export function calcularSimulacaoCEF(input: SimulacaoInput): SimulacaoCEF {
  const { valorImovel, prazoMeses, isCotista } = input;

  // Percentual de entrada (mínimo 20%)
  const percentualEntrada = Math.max(input.percentualEntrada ?? 20, CEF_PARAMS.percentualEntradaMin);

  // Entrada Total = Valor × % Entrada
  const entradaTotal = valorImovel * percentualEntrada / 100;

  // Nº de parcelas da entrada (1 a 48, padrão 36)
  const numParcelasEntrada = limitarParcelasEntrada(input.numParcelasEntrada);

  // Reforços periódicos dentro do prazo da entrada
  const periodicidadeReforco: PeriodicidadeReforco = input.periodicidadeReforco ?? "semestral";
  const mesesReforcos = mesesDosReforcos(numParcelasEntrada, periodicidadeReforco);
  const valorReforco = Math.max(input.valorReforco ?? 0, 0);
  const quantidadeReforcos = valorReforco > 0 ? mesesReforcos.length : 0;
  const reforcosBrutos = input.valorReforco !== undefined
    ? valorReforco * quantidadeReforcos
    : (input.reforcos ?? 0);

  // Total de reforços (não pode ser negativo, não pode ser maior que a entrada)
  const reforcos = Math.max(Math.min(reforcosBrutos, entradaTotal), 0);

  // Saldo Parcelado = Entrada Total - Reforços
  const saldoParcelado = Math.max(entradaTotal - reforcos, 0);

  // Parcela Mensal da Entrada = Saldo Parcelado / Nº Parcelas
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
    valorReforco,
    periodicidadeReforco,
    quantidadeReforcos,
    mesesReforcos,
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
