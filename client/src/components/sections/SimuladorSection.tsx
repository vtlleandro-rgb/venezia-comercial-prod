import { useState, useMemo } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { EMPREENDIMENTO } from "@/data/empreendimento";
import { Calculator, Landmark, CreditCard, Info, FileText, DollarSign } from "lucide-react";
import PropostaComercial from "@/components/PropostaComercial";
import { calcularSimulacaoCEF, CEF_PARAMS } from "@/lib/simuladorCEF";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(value);

const formatCurrencyDecimal = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }).format(value);

interface SimuladorSectionProps {
  corretor?: any;
}

export default function SimuladorSection({ corretor }: SimuladorSectionProps) {
  const { ref, isVisible } = useScrollAnimation();
  const [valorImovel, setValorImovel] = useState(EMPREENDIMENTO.valorMin);
  const [percentualEntrada, setPercentualEntrada] = useState(20);
  const [reforcos, setReforcos] = useState(0);
  const [prazoMeses, setPrazoMeses] = useState(420);
  const [isCotista, setIsCotista] = useState(false);
  const [showProposta, setShowProposta] = useState(false);

  const simulacao = useMemo(() => {
    return calcularSimulacaoCEF({ valorImovel, percentualEntrada, reforcos, prazoMeses, isCotista });
  }, [valorImovel, percentualEntrada, reforcos, prazoMeses, isCotista]);

  const prazoAnos = prazoMeses / 12;

  // Formatar input de reforços
  const handleReforcosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setReforcos(Number(raw));
  };

  const reforcosFormatado = reforcos > 0
    ? new Intl.NumberFormat("pt-BR").format(reforcos)
    : "";

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

          {/* Cursor de Entrada (min 20%) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Percentual de Entrada</label>
              <span className="text-sm font-bold text-[#c62828]">{percentualEntrada}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={50}
              step={1}
              value={percentualEntrada}
              onChange={(e) => setPercentualEntrada(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#c62828]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>20% (mínimo)</span>
              <span>50%</span>
            </div>
          </div>

          {/* Campo de Reforços */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Reforços (abatido da entrada)</label>
              <span className="text-xs text-gray-400">Opcional • Não altera o financiamento</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
              <input
                type="text"
                inputMode="numeric"
                value={reforcosFormatado}
                onChange={handleReforcosChange}
                placeholder="0"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-[#1a1a2e] font-medium focus:outline-none focus:ring-2 focus:ring-[#c62828]/30 focus:border-[#c62828] transition-all"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Reforços são pagos em datas específicas e reduzem o saldo parcelado da entrada (36x)
            </p>
          </div>

          {/* Destaque: Entrada */}
          <div className="p-6 bg-gradient-to-r from-[#c62828]/5 to-[#c62828]/10 border-2 border-[#c62828]/20 rounded-xl mb-6">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard size={18} className="text-[#c62828]" />
              <span className="text-sm font-medium text-[#1a1a2e]">Entrada — {simulacao.percentualEntrada}%</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-[#c62828]">{formatCurrencyDecimal(simulacao.parcelaEntrada)}</span>
              <span className="text-sm text-gray-500">/mês • 36 parcelas</span>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-xs text-gray-600">
                Entrada Total: <span className="font-semibold">{formatCurrency(simulacao.entradaTotal)}</span>
              </p>
              {simulacao.reforcos > 0 && (
                <p className="text-xs text-gray-600">
                  Reforços: <span className="font-semibold text-[#c62828]">- {formatCurrency(simulacao.reforcos)}</span>
                </p>
              )}
              <p className="text-xs text-gray-600">
                Saldo Parcelado: <span className="font-semibold">{formatCurrency(simulacao.saldoParcelado)}</span> ÷ 36 = <span className="font-semibold">{formatCurrencyDecimal(simulacao.parcelaEntrada)}</span>
              </p>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Correção pelo INCC-M durante a obra
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
          <div className="p-6 bg-[#1a1a2e] rounded-xl text-white mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Calculator size={18} className="text-emerald-400" />
              <span className="text-sm font-medium text-white/80">Financiamento CEF — {simulacao.percentualFinanciado}%</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-bold text-emerald-400">{formatCurrencyDecimal(simulacao.parcelaFinanciamento)}</span>
              <span className="text-sm text-white/50">/mês • {prazoMeses} parcelas • Tabela Price + TR</span>
            </div>
            <p className="text-xs text-white/40 mt-2">
              Valor Financiado: {formatCurrency(simulacao.valorFinanciado)} • Taxa: {simulacao.taxaAnual}% a.a. + TR
            </p>
          </div>

          {/* ===== RESUMO COMPLETO DA SIMULAÇÃO ===== */}
          <div className="mt-6 pt-6 border-t-2 border-[#c62828]/20">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={18} className="text-[#c62828]" />
              <h4 className="text-sm font-bold text-[#1a1a2e] uppercase tracking-wide">Resumo da Simulação</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Valor da Unidade</p>
                <p className="text-sm font-bold text-[#1a1a2e]">{formatCurrency(simulacao.valorImovel)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">% Entrada</p>
                <p className="text-sm font-bold text-[#c62828]">{simulacao.percentualEntrada}%</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Valor Total da Entrada</p>
                <p className="text-sm font-bold text-[#1a1a2e]">{formatCurrency(simulacao.entradaTotal)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Reforços</p>
                <p className="text-sm font-bold text-[#1a1a2e]">{formatCurrency(simulacao.reforcos)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Saldo Parcelado</p>
                <p className="text-sm font-bold text-[#1a1a2e]">{formatCurrency(simulacao.saldoParcelado)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Parcela da Entrada (36x)</p>
                <p className="text-sm font-bold text-[#c62828]">{formatCurrencyDecimal(simulacao.parcelaEntrada)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">% Financiado</p>
                <p className="text-sm font-bold text-[#0d47a1]">{simulacao.percentualFinanciado}%</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Valor Financiado</p>
                <p className="text-sm font-bold text-[#0d47a1]">{formatCurrency(simulacao.valorFinanciado)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Total da Operação</p>
                <p className="text-sm font-bold text-[#1a1a2e]">{formatCurrency(simulacao.totalOperacao)}</p>
              </div>
            </div>
          </div>

          {/* Detalhamento Financiamento */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-[#1a1a2e] mb-4">Detalhamento do Financiamento</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                <p className="text-sm font-medium text-[#1a1a2e]">{simulacao.taxaAnual}% a.a. + TR</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Prazo</p>
                <p className="text-sm font-medium text-[#1a1a2e]">{prazoMeses} meses ({prazoAnos} anos)</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Sistema</p>
                <p className="text-sm font-medium text-[#1a1a2e]">Tabela Price + TR</p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Parâmetros CEF — Faixa 3 MCMV — Tijucas/SC</p>
                <p>Entrada mínima: 20% do valor | Parcelamento: 36x (INCC-M)</p>
                <p>Reforços: abatidos da entrada antes do parcelamento (não alteram o financiamento)</p>
                <p>Financiamento: máximo 80% via Programa MCMV | Sistema Price + TR | Prazo máximo: 420 meses</p>
              </div>
            </div>
          </div>

          {/* Botão Gerar Proposta */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowProposta(true)}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#c62828] text-white font-semibold rounded-lg hover:bg-[#b71c1c] transition-all duration-200 shadow-lg shadow-[#c62828]/20 hover:shadow-xl hover:shadow-[#c62828]/30 active:scale-[0.97]"
            >
              <FileText size={18} />
              Gerar Proposta Comercial
            </button>
            <p className="text-xs text-gray-500 mt-3">Gere uma proposta profissional com PDF, WhatsApp e e-mail</p>
          </div>

          <p className="text-gray-400 text-xs text-center mt-6">
            * Simulação ilustrativa baseada nos parâmetros CEF vigentes. Valores sujeitos a análise de crédito.
            Saldo da entrada corrigido pelo INCC-M durante a obra. Consulte um correspondente Caixa.
          </p>
        </div>
      </div>

      {/* Modal de Proposta Comercial */}
      <PropostaComercial
        open={showProposta}
        onClose={() => setShowProposta(false)}
        valorSimulado={valorImovel}
        percentualEntradaSimulado={percentualEntrada}
        reforcosSimulado={reforcos}
        corretorData={corretor ? {
          id: corretor.id,
          nome: corretor.nome,
          whatsapp: corretor.whatsapp,
          telefone: corretor.telefone,
          email: corretor.email,
          creci: corretor.creci,
          imobiliariaNome: corretor.imobiliariaNome,
          imobiliariaId: corretor.imobiliariaId,
        } : undefined}
      />
    </section>
  );
}
