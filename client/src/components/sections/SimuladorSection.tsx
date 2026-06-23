import { useState, useMemo } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { EMPREENDIMENTO } from "@/data/empreendimento";
import { Calculator, Landmark, CreditCard, Info } from "lucide-react";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(value);

const formatCurrencyDecimal = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }).format(value);

// Parâmetros CEF - Faixa 3 MCMV - Tabela Price/TR
const CEF_PARAMS = {
  taxaAnual: 7.66, // % a.a. + TR (não cotista FGTS)
  taxaAnualCotista: 7.16, // % a.a. + TR (cotista FGTS 3+ anos)
  prazoMaxMeses: 420, // 35 anos
  seguroMIP: 0.0003, // ~0.03% do saldo/mês
  seguroDFI: 0.00005, // ~0.005% do valor imóvel/mês
  taxaAdm: 25, // R$ 25/mês
};

export default function SimuladorSection() {
  const { ref, isVisible } = useScrollAnimation();
  const [valorImovel, setValorImovel] = useState(EMPREENDIMENTO.valorMin);
  const [prazoMeses, setPrazoMeses] = useState(420);
  const [isCotista, setIsCotista] = useState(false);

  const simulacao = useMemo(() => {
    // Entrada = 20% do valor de venda
    const entradaTotal = valorImovel * 0.20;
    
    // Reforço: R$ 20.000 na entrega das chaves (36 meses)
    const reforcoChaves = 20000;
    
    // Entrada líquida = Entrada 20% - R$ 20k reforço chaves
    const entradaLiquida = entradaTotal - reforcoChaves;
    
    // Parcela da entrada: Ato + 36x (entrada líquida / 37)
    const parcelaEntrada = entradaLiquida / 37;
    
    // Financiamento CEF = 80% do valor (Programa MCMV)
    const valorFinanciado = valorImovel * 0.80;

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
  }, [valorImovel, prazoMeses, isCotista]);

  const prazoAnos = prazoMeses / 12;

  return (
    <section id="simulador" className="py-24 bg-[#f8f7f4]">
      <div
        ref={ref}
        className={`max-w-5xl mx-auto px-6 section-fade-in ${isVisible ? "visible" : ""}`}
      >
        <div className="text-center mb-12">
          <p className="text-[#c62828] text-sm font-medium uppercase tracking-widest mb-3">
            Simulador CEF
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-[#1a1a2e] mb-4">
            Simule seu Financiamento
          </h2>
          <div className="italian-divider mx-auto mb-6" />
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Simulação baseada nos parâmetros da Caixa Econômica Federal — MCMV Faixa 3 — Tabela Price + TR
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 md:p-10">
          {/* Header Badge */}
          <div className="flex items-center gap-2 mb-8">
            <Landmark size={20} className="text-[#c62828]" />
            <span className="text-sm font-medium text-[#1a1a2e]">Caixa Econômica Federal • MCMV Faixa 3</span>
          </div>

          {/* Valor do Imóvel - Slider */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Valor do Imóvel</label>
              <span className="text-sm text-gray-500">
                {formatCurrency(EMPREENDIMENTO.valorMin)} — {formatCurrency(EMPREENDIMENTO.valorMax)}
              </span>
            </div>
            <div className="text-center mb-3">
              <span className="text-3xl font-bold text-[#1a1a2e]">{formatCurrency(valorImovel)}</span>
            </div>
            <input
              type="range"
              min={EMPREENDIMENTO.valorMin}
              max={EMPREENDIMENTO.valorMax}
              step={1000}
              value={valorImovel}
              onChange={(e) => setValorImovel(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#c62828]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatCurrency(EMPREENDIMENTO.valorMin)}</span>
              <span>{formatCurrency(EMPREENDIMENTO.valorMax)}</span>
            </div>
          </div>

          {/* Entrada Obrigatória */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
            <div>
              <p className="text-sm text-gray-600">Entrada Obrigatória</p>
              <p className="text-xs text-gray-400">20% FIXO</p>
            </div>
            <p className="text-xl font-bold text-[#1a1a2e]">{formatCurrency(simulacao.entradaTotal)}</p>
          </div>

          {/* Destaque: Parcela da Entrada */}
          <div className="p-6 bg-gradient-to-r from-[#c62828]/5 to-[#c62828]/10 border-2 border-[#c62828]/20 rounded-xl mb-6">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard size={18} className="text-[#c62828]" />
              <span className="text-sm font-medium text-[#1a1a2e]">Parcela da Entrada</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-[#c62828]">{formatCurrencyDecimal(simulacao.parcelaEntrada)}</span>
              <span className="text-sm text-gray-500">/mês</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Ato + 36x sem juros • Apenas INCC-M • Reforço: R$ 20.000 na entrega das chaves (36 meses)
            </p>
          </div>

          {/* Prazo do Financiamento */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Prazo do Financiamento</label>
              <span className="text-sm text-[#1a1a2e] font-medium">{prazoMeses} meses ({prazoAnos} anos)</span>
            </div>
            <input
              type="range"
              min={120}
              max={420}
              step={12}
              value={prazoMeses}
              onChange={(e) => setPrazoMeses(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#c62828]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>10 anos</span>
              <span>20 anos</span>
              <span>30 anos</span>
              <span>35 anos</span>
            </div>
          </div>

          {/* Cotista FGTS */}
          <div className="flex items-center gap-3 mb-8">
            <input
              type="checkbox"
              id="cotista"
              checked={isCotista}
              onChange={(e) => setIsCotista(e.target.checked)}
              className="w-4 h-4 accent-[#c62828] rounded"
            />
            <label htmlFor="cotista" className="text-sm text-gray-700">
              Cotista FGTS (3+ anos) — taxa reduzida para {CEF_PARAMS.taxaAnualCotista}% a.a.
            </label>
          </div>

          {/* Destaque: Parcela do Financiamento */}
          <div className="p-6 bg-[#1a1a2e] rounded-xl text-white">
            <div className="flex items-center gap-2 mb-1">
              <Calculator size={18} className="text-emerald-400" />
              <span className="text-sm font-medium text-white/80">Parcela Estimada do Financiamento</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-bold text-emerald-400">{formatCurrencyDecimal(simulacao.parcelaFinanciamento)}</span>
              <span className="text-sm text-white/50">/mês • {prazoMeses} parcelas • Tabela Price + TR</span>
            </div>
          </div>

          {/* Detalhamento */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-[#1a1a2e] mb-4">Detalhamento</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Saldo Financiado (80%)</p>
                <p className="text-sm font-medium text-[#1a1a2e]">{formatCurrency(simulacao.valorFinanciado)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Amortização + Juros</p>
                <p className="text-sm font-medium text-[#1a1a2e]">{formatCurrencyDecimal(simulacao.parcelaAmortizacao)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Seguros (MIP + DFI)</p>
                <p className="text-sm font-medium text-[#1a1a2e]">{formatCurrencyDecimal(simulacao.seguroMIP + simulacao.seguroDFI)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Taxa Administrativa</p>
                <p className="text-sm font-medium text-[#1a1a2e]">{formatCurrencyDecimal(simulacao.taxaAdm)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Taxa de Juros Anual</p>
                <p className="text-sm font-medium text-[#1a1a2e]">{simulacao.taxaAnual}% a.a.</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Reforço na Entrega</p>
                <p className="text-sm font-medium text-[#1a1a2e]">{formatCurrency(simulacao.reforcoChaves)}</p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Parâmetros CEF — Faixa 3 MCMV — Tijucas/SC</p>
                <p>Entrada: 20% do valor de venda | Parcelamento: Ato + 36x (INCC-M)</p>
                <p>Reforço: R$ 20.000 na entrega das chaves (36 meses)</p>
                <p>Financiamento: 80% do valor via Programa MCMV | Sistema Price + TR | Prazo máximo: 420 meses</p>
              </div>
            </div>
          </div>

          <p className="text-gray-400 text-xs text-center mt-6">
            * Simulação ilustrativa baseada nos parâmetros CEF vigentes. Valores sujeitos a análise de crédito.
            Saldo da entrada corrigido pelo INCC-M durante a obra. Consulte um correspondente Caixa.
          </p>
        </div>
      </div>
    </section>
  );
}
