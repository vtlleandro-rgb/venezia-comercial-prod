import { useState, useMemo, useCallback, useEffect } from "react";
import { X, FileText, Printer, Share2, Mail, MessageCircle, Building2, User, CreditCard, Eye, Calculator, Landmark, Download, Loader2, CheckCircle2, DollarSign } from "lucide-react";
import { UNIDADES, EMPREENDIMENTO, TIPOLOGIAS, IMAGENS, CONDICOES_COMERCIAIS, normalizarUnidades, calcularValorComDocumentacao, PERCENTUAL_DOCUMENTACAO, type Unidade } from "@/data/empreendimento";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

import { apiUrl } from "@/lib/api";
import { calcularSimulacaoCEF, CEF_PARAMS, PERIODICIDADE_REFORCO, formatarPercentual, type PeriodicidadeReforco } from "@/lib/simuladorCEF";
import { generatePdfClientSide } from "@/lib/pdfClientFallback";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(value);

const formatCurrencyDecimal = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }).format(value);

interface CorretorData {
  id: number;
  nome: string;
  whatsapp?: string | null;
  email?: string | null;
  creci?: string | null;
  telefone?: string | null;
  imobiliariaNome?: string | null;
  imobiliariaId?: number | null;
}

interface PropostaComercialProps {
  open: boolean;
  onClose: () => void;
  /** Valor livre do cursor (usado quando nenhuma unidade está selecionada) */
  valorSimulado?: number;
  unidadeIdSimulado?: string;
  comDocumentacaoSimulado?: boolean;
  percentualEntradaSimulado?: number;
  numParcelasEntradaSimulado?: number;
  valorReforcoSimulado?: number;
  periodicidadeReforcoSimulado?: PeriodicidadeReforco;
  corretorData?: CorretorData | null;
}

export default function PropostaComercial({
  open, onClose, valorSimulado, unidadeIdSimulado, comDocumentacaoSimulado, percentualEntradaSimulado,
  numParcelasEntradaSimulado, valorReforcoSimulado, periodicidadeReforcoSimulado, corretorData,
}: PropostaComercialProps) {
  const { addProposta } = useAuth();
  const registrarLead = trpc.leads.registrar.useMutation();
  const salvarPropostaMutation = trpc.propostas.salvar.useMutation();
  const [linkProposta, setLinkProposta] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfStatus, setPdfStatus] = useState<"idle" | "saving" | "rendering" | "finalizing" | "done" | "error">("idle");

  // ===== SLIDER DO VALOR DO IMÓVEL (MESMO DO SIMULADOR PÚBLICO) =====
  const [valorLivre, setValorLivre] = useState(valorSimulado || EMPREENDIMENTO.valorMin);
  const [comDocumentacao, setComDocumentacao] = useState(comDocumentacaoSimulado ?? false);
  const [percentualEntrada, setPercentualEntrada] = useState(percentualEntradaSimulado || 20);
  const [numParcelasEntrada, setNumParcelasEntrada] = useState(numParcelasEntradaSimulado || CEF_PARAMS.numParcelasEntrada);
  const [valorReforco, setValorReforco] = useState(valorReforcoSimulado || 0);
  const [periodicidadeReforco, setPeriodicidadeReforco] = useState<PeriodicidadeReforco>(periodicidadeReforcoSimulado || "semestral");
  const [prazoMeses, setPrazoMeses] = useState(420);
  const [isCotista, setIsCotista] = useState(false);

  // Sincronizar valores vindos do SimuladorSection
  useEffect(() => {
    if (valorSimulado) setValorLivre(valorSimulado);
  }, [valorSimulado]);
  useEffect(() => {
    if (comDocumentacaoSimulado !== undefined) setComDocumentacao(comDocumentacaoSimulado);
  }, [comDocumentacaoSimulado]);
  useEffect(() => {
    if (percentualEntradaSimulado !== undefined) setPercentualEntrada(percentualEntradaSimulado);
  }, [percentualEntradaSimulado]);
  useEffect(() => {
    if (numParcelasEntradaSimulado !== undefined) setNumParcelasEntrada(numParcelasEntradaSimulado);
  }, [numParcelasEntradaSimulado]);
  useEffect(() => {
    if (valorReforcoSimulado !== undefined) setValorReforco(valorReforcoSimulado);
  }, [valorReforcoSimulado]);
  useEffect(() => {
    if (periodicidadeReforcoSimulado !== undefined) setPeriodicidadeReforco(periodicidadeReforcoSimulado);
  }, [periodicidadeReforcoSimulado]);

  // Seleção de unidade — mesma fonte da tabela de vendas (banco, com fallback estático), vinda do simulador
  const unidadesQuery = trpc.configuracoes.getUnidades.useQuery(undefined, { staleTime: 0, refetchOnMount: true, refetchOnWindowFocus: true });
  const unidades: Unidade[] = useMemo(
    () => normalizarUnidades((unidadesQuery.data as Unidade[] | null) ?? UNIDADES),
    [unidadesQuery.data],
  );
  const [unidadeId, setUnidadeId] = useState<string>(unidadeIdSimulado || "");
  useEffect(() => {
    if (unidadeIdSimulado !== undefined) setUnidadeId(unidadeIdSimulado);
  }, [unidadeIdSimulado]);
  const unidade = useMemo(() => unidades.find((u) => u.id === unidadeId) || null, [unidades, unidadeId]);

  // Valor base: tabela (unidade) ou livre (cursor); com documentação soma 4%
  const valorBase = unidade ? unidade.valorVenda : valorLivre;
  const valorImovel = comDocumentacao ? calcularValorComDocumentacao(valorBase) : valorBase;

  // Dados do comprador
  const [comprador, setComprador] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefoneCliente, setTelefoneCliente] = useState("");

  // Dados do corretor (auto-preenchidos)
  const [corretorNome, setCorretorNome] = useState(corretorData?.nome || "");
  const [corretorCreci, setCorretorCreci] = useState(corretorData?.creci || "");
  const [corretorWhatsapp, setCorretorWhatsapp] = useState(corretorData?.whatsapp || "");
  const [corretorTelefone, setCorretorTelefone] = useState(corretorData?.telefone || "");
  const [corretorEmail, setCorretorEmail] = useState(corretorData?.email || "");
  const [imobiliaria, setImobiliaria] = useState(corretorData?.imobiliariaNome || "");
  const [observacoes, setObservacoes] = useState("");

  // Sincronizar dados do corretor quando carregam de forma assíncrona
  useEffect(() => {
    if (corretorData) {
      setCorretorNome(corretorData.nome || "");
      setCorretorCreci(corretorData.creci || "");
      setCorretorWhatsapp(corretorData.whatsapp || "");
      setCorretorTelefone(corretorData.telefone || "");
      setCorretorEmail(corretorData.email || "");
      setImobiliaria(corretorData.imobiliariaNome || "");
    }
  }, [corretorData]);

  // ===== CÁLCULOS CEF — HELPER COMPARTILHADO (FONTE ÚNICA) =====
  const simulacao = useMemo(() => {
    return calcularSimulacaoCEF({ valorImovel, percentualEntrada, numParcelasEntrada, valorReforco, periodicidadeReforco, prazoMeses, isCotista });
  }, [valorImovel, percentualEntrada, numParcelasEntrada, valorReforco, periodicidadeReforco, prazoMeses, isCotista]);

  // Tipologia da unidade
  const tipologia = useMemo(() => {
    if (!unidade) return TIPOLOGIAS[0];
    return TIPOLOGIAS.find((t) => t.id === `final-${unidade.final.replace("Final ", "").padStart(2, "0")}`) || TIPOLOGIAS[0];
  }, [unidade]);

  const prazoAnos = prazoMeses / 12;

  // Formatar input do valor de cada reforço
  const handleReforcoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setValorReforco(Number(raw));
  };

  const reforcoFormatado = valorReforco > 0
    ? new Intl.NumberFormat("pt-BR").format(valorReforco)
    : "";

  // Textos compartilhados por PDF, WhatsApp, e-mail e modal
  const docLabel = comDocumentacao ? ` (com documentação ${PERCENTUAL_DOCUMENTACAO * 100}%)` : "";
  const reforcosLabel = simulacao.quantidadeReforcos > 0
    ? `${simulacao.quantidadeReforcos}x ${PERIODICIDADE_REFORCO[simulacao.periodicidadeReforco].label.toLowerCase()} de ${formatCurrency(simulacao.valorReforco)}`
    : "";

  // ===== GERAR HTML DA PROPOSTA =====
  const gerarHtmlProposta = useCallback(() => {
    const dataFormatada = new Date().toLocaleDateString("pt-BR");
    const horaFormatada = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const areaFormatada = unidade ? unidade.area.toFixed(2).replace(".", ",") : `${EMPREENDIMENTO.areaPrivativaMin.toFixed(2).replace(".", ",")} a ${EMPREENDIMENTO.areaPrivativaMax.toFixed(2).replace(".", ",")}`;

    const origin = window.location.origin;
    const logoVeneziaUrl = IMAGENS.logoVenezia.startsWith("http") ? IMAGENS.logoVenezia : `${origin}${IMAGENS.logoVenezia}`;
    const logoArteaUrl = IMAGENS.logoArteaColor.startsWith("http") ? IMAGENS.logoArteaColor : `${origin}${IMAGENS.logoArteaColor}`;
    const logoBlueUrl = IMAGENS.logoBlueRealEstate.startsWith("http") ? IMAGENS.logoBlueRealEstate : `${origin}${IMAGENS.logoBlueRealEstate}`;

    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Proposta Comercial - Residencial Venezia</title>
<style>
@page{margin:1cm;size:A4}
*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}
body{font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;color:#1a1a2e;line-height:1.5;padding:0;background:#fff;font-size:13px;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}
.page{max-width:800px;margin:0 auto;padding:30px 40px}
.header{text-align:center;padding:24px 0;border-bottom:3px solid #c62828;margin-bottom:24px}
.header .logos{display:flex;justify-content:center;align-items:center;gap:24px;margin-bottom:12px}
.header .logos img{height:45px}
.header h1{font-size:28px;color:#1a1a2e;letter-spacing:4px;font-weight:700;margin:0}
.header h2{font-size:11px;color:#666;font-weight:400;letter-spacing:5px;text-transform:uppercase;margin-top:2px}
.header .spe{font-size:9px;color:#999;margin-top:8px;letter-spacing:1px}
.header .date{font-size:9px;color:#aaa;margin-top:4px}

.hero-box{background:linear-gradient(135deg,#c62828 0%,#8e0000 100%)!important;color:white!important;padding:20px 28px;border-radius:12px;text-align:center;margin-bottom:24px;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
.hero-box .tagline{font-size:10px;text-transform:uppercase;letter-spacing:2px;opacity:0.8;margin-bottom:6px}
.hero-box .main-text{font-size:18px;font-weight:700;line-height:1.3}
.hero-box .sub-text{font-size:11px;opacity:0.85;margin-top:6px}

.block{margin-bottom:20px;page-break-inside:avoid}
.block-title{font-size:12px;font-weight:700;color:#c62828;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #c62828}

.bloco-obra{background:#fafafa!important;border:2px solid #c62828;border-radius:12px;padding:20px;margin-bottom:20px;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
.bloco-obra h3{font-size:13px;color:#c62828;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px}
.bloco-obra .item{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dotted #ddd}
.bloco-obra .item:last-child{border-bottom:none}
.bloco-obra .item .label{color:#555;font-size:12px}
.bloco-obra .item .value{font-weight:700;font-size:12px;color:#1a1a2e}
.bloco-obra .destaque{background:#fff3e0!important;border:2px solid #f57c00;border-radius:8px;padding:12px;text-align:center;margin-top:14px;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
.bloco-obra .destaque .dl{font-size:10px;color:#e65100;text-transform:uppercase;letter-spacing:1px}
.bloco-obra .destaque .dv{font-size:20px;font-weight:800;color:#e65100;margin-top:4px}
.bloco-obra .destaque .dd{font-size:10px;color:#bf360c;margin-top:2px}

.bloco-cef{background:#e3f2fd!important;border:2px solid #1565c0;border-radius:12px;padding:20px;margin-bottom:20px;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
.bloco-cef h3{font-size:13px;color:#0d47a1;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px}
.bloco-cef .item{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dotted #90caf9}
.bloco-cef .item:last-child{border-bottom:none}
.bloco-cef .item .label{color:#1565c0;font-size:12px}
.bloco-cef .item .value{font-weight:700;font-size:12px;color:#0d47a1}
.bloco-cef .destaque{background:#0d47a1!important;color:white!important;border-radius:8px;padding:14px;text-align:center;margin-top:14px;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
.bloco-cef .destaque .dl{font-size:10px;opacity:0.8;text-transform:uppercase;letter-spacing:1px}
.bloco-cef .destaque .dv{font-size:22px;font-weight:800;margin-top:4px}
.bloco-cef .destaque .dd{font-size:10px;opacity:0.7;margin-top:4px}

.data-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 20px}
.data-item{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px dotted #e0e0e0}
.data-item .label{color:#666;font-size:11px}.data-item .value{font-weight:600;font-size:11px;color:#1a1a2e}

.corretor-box{background:#f1f8e9!important;border:1px solid #c5e1a5;border-radius:10px;padding:14px;margin-top:16px;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
.corretor-box h4{font-size:11px;color:#33691e;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;font-weight:700}
.corretor-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 16px}
.corretor-item{font-size:11px;padding:3px 0}
.corretor-item .cl{color:#558b2f;font-weight:600}

.footer{margin-top:24px;padding-top:16px;border-top:2px solid #1a1a2e;text-align:center;font-size:9px;color:#999}
.footer strong{color:#1a1a2e}
.footer .validade{font-size:10px;color:#c62828;font-weight:700;margin-top:8px}

.actions{text-align:center;margin-top:24px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.btn{padding:10px 20px;border:none;border-radius:8px;font-size:11px;cursor:pointer;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:6px;transition:all .2s}
.btn-print{background:#c62828;color:white}.btn-print:hover{background:#b71c1c}
.btn-whats{background:#25d366;color:white}.btn-whats:hover{background:#1da851}
.btn-email{background:#1565c0;color:white}.btn-email:hover{background:#0d47a1}
@media print{.actions{display:none!important}body{padding:0;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}.page{padding:20px}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}}
@media(max-width:600px){.page{padding:16px}.data-grid,.corretor-grid{grid-template-columns:1fr}}
</style></head><body>
<div class="page">

<!-- HEADER -->
<div class="header">
<div class="logos">
<img src="${logoVeneziaUrl}" alt="Venezia" style="height:50px" onerror="this.style.display='none'"/>
<img src="${logoArteaUrl}" alt="ARTEÁ Empreendimentos" style="height:40px" onerror="this.style.display='none'"/>
<img src="${logoBlueUrl}" alt="Blue Real Estate" style="height:36px;border-radius:4px" onerror="this.style.display='none'"/>
</div>
<h1>VENEZIA</h1>
<h2>Residencial</h2>
<p class="spe">SPE-VENEZIA EMPREENDIMENTOS IMOBILIARIOS LTDA</p>
<p class="date">Proposta Comercial N° ${Date.now().toString(36).toUpperCase()} • ${dataFormatada} às ${horaFormatada}</p>
</div>

<!-- QUADRO DE DESTAQUE -->
<div class="hero-box">
<p class="tagline">Seu novo lar começa aqui</p>
<p class="main-text">Apartamento de ${formatCurrency(simulacao.valorImovel)}<br/>Entrada a partir de ${formatCurrencyDecimal(simulacao.parcelaEntrada)}/mês e financiamento de ${formatCurrencyDecimal(simulacao.parcelaFinanciamento)}/mês</p>
<p class="sub-text">Financiamento CEF • MCMV Faixa 3 • Tabela Price + TR • ${prazoAnos} anos</p>
</div>

<!-- DADOS DO IMÓVEL -->
<div class="block">
<div class="block-title">Dados do Imóvel</div>
<div class="data-grid">
<div class="data-item"><span class="label">Empreendimento:</span><span class="value">${EMPREENDIMENTO.nome}</span></div>
<div class="data-item"><span class="label">Localização:</span><span class="value">${EMPREENDIMENTO.localizacao}</span></div>
<div class="data-item"><span class="label">Unidade:</span><span class="value">${unidade ? unidade.numero : "A definir"}</span></div>
<div class="data-item"><span class="label">Área Privativa:</span><span class="value">${areaFormatada} m²</span></div>
<div class="data-item"><span class="label">Tipologia:</span><span class="value">${tipologia.nome}</span></div>
<div class="data-item"><span class="label">Valor do Imóvel:</span><span class="value">${formatCurrency(simulacao.valorImovel)}${docLabel}</span></div>
</div>
</div>

<!-- BLOCO 1: DURANTE A OBRA (ENTRADA) -->
<div class="bloco-obra">
<h3>① Durante a Obra — Entrada ${simulacao.percentualEntrada}%</h3>
<div class="item"><span class="label">Valor do Imóvel:</span><span class="value">${formatCurrency(simulacao.valorImovel)}${docLabel}</span></div>
<div class="item"><span class="label">Entrada (${simulacao.percentualEntrada}%):</span><span class="value">${formatCurrency(simulacao.entradaTotal)}</span></div>
<div class="item"><span class="label">Entrada Parcelada:</span><span class="value">${simulacao.numParcelasEntrada}x de ${formatCurrencyDecimal(simulacao.parcelaEntrada)}</span></div>
<div class="destaque">
<p class="dl">Parcela da Entrada</p>
<p class="dv">${formatCurrencyDecimal(simulacao.parcelaEntrada)}/mês</p>
<p class="dd">${simulacao.numParcelasEntrada} parcelas • Correção pelo INCC-M</p>
</div>
</div>

<!-- BLOCO 2: FINANCIAMENTO CEF -->
<div class="bloco-cef">
<h3>② Financiamento CEF — ${formatarPercentual(simulacao.percentualFinanciado)}%</h3>
${simulacao.reforcos > 0 ? `<div class="item"><span class="label">Reforços${reforcosLabel ? ` (${reforcosLabel})` : ""} abatidos do financiamento:</span><span class="value">- ${formatCurrency(simulacao.reforcos)}</span></div>` : ""}
<div class="item"><span class="label">Valor Financiado (${formatarPercentual(simulacao.percentualFinanciado)}%):</span><span class="value">${formatCurrency(simulacao.valorFinanciado)}</span></div>
<div class="item"><span class="label">Prazo:</span><span class="value">${simulacao.prazoMeses} meses (${prazoAnos} anos)</span></div>
<div class="item"><span class="label">Sistema:</span><span class="value">Tabela Price + TR</span></div>
<div class="item"><span class="label">Taxa de Juros:</span><span class="value">${simulacao.taxaAnual.toFixed(2)}% a.a. + TR${simulacao.isCotista ? " (Cotista FGTS)" : ""}</span></div>
<div class="item"><span class="label">Amortização + Juros:</span><span class="value">${formatCurrencyDecimal(simulacao.parcelaAmortizacao)}</span></div>
<div class="item"><span class="label">Seguros (MIP + DFI):</span><span class="value">${formatCurrencyDecimal(simulacao.seguroMIP + simulacao.seguroDFI)}</span></div>
<div class="item"><span class="label">Taxa Administrativa:</span><span class="value">${formatCurrencyDecimal(simulacao.taxaAdm)}</span></div>
<div class="destaque">
<p class="dl">Parcela Estimada do Financiamento</p>
<p class="dv">${formatCurrencyDecimal(simulacao.parcelaFinanciamento)}/mês</p>
<p class="dd">${simulacao.prazoMeses} parcelas • Tabela Price + TR • ${simulacao.taxaAnual.toFixed(2)}% a.a.</p>
</div>
</div>

${comprador ? `
<!-- DADOS DO CLIENTE -->
<div class="block">
<div class="block-title">Dados do Cliente</div>
<div class="data-grid">
<div class="data-item"><span class="label">Nome:</span><span class="value">${comprador}</span></div>
${cpf ? `<div class="data-item"><span class="label">CPF:</span><span class="value">${cpf}</span></div>` : ""}
${telefoneCliente ? `<div class="data-item"><span class="label">Telefone:</span><span class="value">${telefoneCliente}</span></div>` : ""}
</div>
</div>` : ""}

<!-- DADOS DO CORRETOR -->
${corretorNome ? `
<div class="corretor-box">
<h4>Corretor Responsável</h4>
<div class="corretor-grid">
<div class="corretor-item"><span class="cl">Nome:</span> ${corretorNome}</div>
${corretorCreci ? `<div class="corretor-item"><span class="cl">CRECI:</span> ${corretorCreci}</div>` : ""}
${corretorWhatsapp ? `<div class="corretor-item"><span class="cl">WhatsApp:</span> ${corretorWhatsapp}</div>` : ""}
${corretorTelefone ? `<div class="corretor-item"><span class="cl">Telefone:</span> ${corretorTelefone}</div>` : ""}
${corretorEmail ? `<div class="corretor-item"><span class="cl">E-mail:</span> ${corretorEmail}</div>` : ""}
${imobiliaria ? `<div class="corretor-item"><span class="cl">Imobiliária:</span> ${imobiliaria}</div>` : ""}
</div>
</div>` : ""}

${observacoes ? `<div style="background:#fffde7;border:1px solid #fff9c4;padding:10px;border-radius:6px;font-size:11px;color:#555;margin-top:12px"><strong>Observações:</strong> ${observacoes}</div>` : ""}

<!-- FOOTER -->
<div class="footer">
<div style="display:flex;justify-content:center;align-items:center;gap:20px;margin-bottom:12px;flex-wrap:wrap">
<img src="${logoArteaUrl}" alt="ARTEÁ" style="height:28px" onerror="this.style.display='none'"/>
<img src="${logoBlueUrl}" alt="Blue Real Estate" style="height:24px;border-radius:3px" onerror="this.style.display='none'"/>
</div>
<p><strong>SPE-VENEZIA EMPREENDIMENTOS IMOBILIARIOS LTDA</strong></p>
<p>${EMPREENDIMENTO.localizacao}</p>
<p style="font-size:9px;color:#666;margin-top:4px">Realização: ARTEÁ Empreendimentos • Vendas: Blue Real Estate • Construção: RB Construtora</p>
<p class="validade">Proposta válida por 7 dias a partir de ${dataFormatada}</p>
<p style="margin-top:6px;font-size:8px">* Simulação ilustrativa baseada nos parâmetros CEF vigentes. Valores sujeitos a análise de crédito.</p>
</div>

</div></body></html>`;
  }, [simulacao, unidade, tipologia, comprador, cpf, telefoneCliente, corretorNome, corretorCreci, corretorWhatsapp, corretorTelefone, corretorEmail, imobiliaria, observacoes, prazoAnos]);

  // ===== AÇÕES =====
  const handleVisualizar = useCallback(() => {
    const html = gerarHtmlProposta();
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
    toast.success("Proposta aberta em nova aba.");
  }, [gerarHtmlProposta]);

  // Baixar PDF server-side (alta qualidade via Puppeteer)
  const handleBaixarPDF = useCallback(async () => {
    const html = gerarHtmlProposta();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setPdfLoading(true);
    setPdfProgress(0);
    setPdfStatus("saving");

    // Animação de progresso simulada
    const progressInterval = setInterval(() => {
      setPdfProgress(prev => {
        if (prev >= 90) { clearInterval(progressInterval); return 90; }
        return prev + Math.random() * 15;
      });
    }, 400);

    try {
      // Etapa 1: Salvar proposta
      setPdfStatus("saving");
      const result = await salvarPropostaMutation.mutateAsync({
        htmlContent: html,
        corretorId: corretorData?.id || undefined,
        nomeCliente: comprador || undefined,
        valorImovel: simulacao.valorImovel,
        unidadeNumero: unidade?.numero || undefined,
      });

      // Etapa 2: Renderizar PDF
      setPdfStatus("rendering");
      setPdfProgress(50);

      if (isMobile) {
        // MOBILE: sempre usar client-side (servidor não tem Chromium em produção)
        setPdfProgress(60);
        await generatePdfClientSide({ htmlContent: html, filename: `Proposta-${result.codigo}.pdf` });
      } else {
        // DESKTOP: tentar servidor primeiro, fallback client-side
        setPdfStatus("finalizing");
        setPdfProgress(85);
        const pdfResponse = await fetch(apiUrl(`/api/propostas/${result.codigo}/pdf`), {
          credentials: "include",
        });
        if (pdfResponse.ok) {
          const blob = await pdfResponse.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `Proposta-${result.codigo}.pdf`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 5000);
        } else {
          await generatePdfClientSide({ htmlContent: html, filename: `Proposta-${result.codigo}.pdf` });
        }
      }

      setLinkProposta(`${window.location.origin}/proposta/${result.codigo}`);

      clearInterval(progressInterval);
      setPdfProgress(100);
      setPdfStatus("done");

      setTimeout(() => {
        setPdfLoading(false);
        setPdfStatus("idle");
        setPdfProgress(0);
      }, 1500);
    } catch {
      clearInterval(progressInterval);
      setPdfStatus("rendering");
      setPdfProgress(60);

      // Fallback: gerar PDF client-side diretamente
      try {
        toast.info("Gerando PDF localmente...");
        await generatePdfClientSide({ htmlContent: html, filename: `Proposta-Venezia.pdf` });
        setPdfProgress(100);
        setPdfStatus("done");
        setTimeout(() => {
          setPdfLoading(false);
          setPdfStatus("idle");
          setPdfProgress(0);
        }, 1500);
      } catch {
        setPdfStatus("error");
        setPdfProgress(0);
        setTimeout(() => {
          setPdfLoading(false);
          setPdfStatus("idle");
        }, 2000);
        toast.error("Erro ao gerar PDF. Tente novamente.");
      }
    }
  }, [gerarHtmlProposta, salvarPropostaMutation, corretorData, comprador, simulacao, unidade]);

  const handleGerarPDF = useCallback(async () => {
    const html = gerarHtmlProposta();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Em mobile, gerar PDF diretamente (window.open + print não funciona bem)
      setPdfLoading(true);
      setPdfProgress(30);
      setPdfStatus("rendering");
      try {
        await generatePdfClientSide({ htmlContent: html, filename: "Proposta-Venezia.pdf" });
        setPdfProgress(100);
        setPdfStatus("done");
        setTimeout(() => {
          setPdfLoading(false);
          setPdfStatus("idle");
          setPdfProgress(0);
        }, 1500);
      } catch {
        setPdfLoading(false);
        setPdfStatus("idle");
        setPdfProgress(0);
        toast.error("Erro ao gerar PDF. Tente novamente.");
      }
    } else {
      // Desktop: abrir em nova janela para impressão
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        const waitForImages = () => {
          const images = win.document.querySelectorAll('img');
          const promises = Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            });
          });
          return Promise.all(promises);
        };
        waitForImages().then(() => {
          setTimeout(() => win.print(), 300);
        });
      }
    }

    // Registrar proposta no histórico local
    if (addProposta) {
      addProposta({
        unidadeId: unidade?.id || "",
        unidadeNumero: unidade ? unidade.numero : "Simulação",
        comprador: comprador || "Não informado",
        cpf: cpf || undefined,
        telefone: telefoneCliente || undefined,
        imobiliaria: imobiliaria || "",
        corretor: corretorNome || "",
        valorBase: simulacao.valorImovel,
        tipoValor: "Tabela",
        entrada: simulacao.entradaTotal,
        financiamento: simulacao.valorFinanciado,
        fgts: 0,
        observacoes: observacoes || undefined,
      });
    }

    // Registrar lead no backend
    if (corretorData?.id) {
      registrarLead.mutate({
        nomeCliente: comprador || "Proposta gerada",
        telefoneCliente: telefoneCliente || undefined,
        emailCliente: undefined,
        corretorId: corretorData.id,
        imobiliariaId: corretorData.imobiliariaId || undefined,
        origem: "proposta",
        unidadeInteresse: unidade?.numero || undefined,
        propostaGerada: 1,
        valorSimulado: simulacao.valorImovel,
      }, {
        onError: () => { /* silently fail */ }
      });
    }

    toast.success("Proposta gerada com sucesso!");
  }, [gerarHtmlProposta, addProposta, unidade, simulacao, comprador, telefoneCliente, corretorData, registrarLead]);

  // Salvar proposta online e gerar link
  const handleSalvarECompartilhar = useCallback(async (canal: "whatsapp" | "email") => {
    const html = gerarHtmlProposta();
    try {
      const result = await salvarPropostaMutation.mutateAsync({
        htmlContent: html,
        corretorId: corretorData?.id || undefined,
        nomeCliente: comprador || undefined,
        valorImovel: simulacao.valorImovel,
        unidadeNumero: unidade?.numero || undefined,
      });
      const link = `${window.location.origin}/proposta/${result.codigo}`;
      setLinkProposta(link);

      if (canal === "whatsapp") {
        compartilharWhatsApp(link);
      } else {
        compartilharEmail(link);
      }
    } catch {
      // Fallback: compartilhar sem link
      if (canal === "whatsapp") {
        compartilharWhatsApp(null);
      } else {
        compartilharEmail(null);
      }
    }
  }, [gerarHtmlProposta, salvarPropostaMutation, corretorData, comprador, simulacao, unidade]);

  const compartilharWhatsApp = (link: string | null) => {
    const texto =
      `*⭐ PROPOSTA COMERCIAL — RESIDENCIAL VENEZIA*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `🏢 *${EMPREENDIMENTO.nome}*\n` +
      `📍 ${EMPREENDIMENTO.localizacao}\n` +
      (unidade ? `🏠 Unidade ${unidade.numero} — ${unidade.area.toFixed(2).replace(".", ",")} m²\n` : "") +
      `\n💰 *VALOR DO IMÓVEL:* ${formatCurrency(simulacao.valorImovel)}${docLabel}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `*🛠️ DURANTE A OBRA (Entrada ${simulacao.percentualEntrada}%):*\n\n` +
      `✅ Entrada Total: ${formatCurrency(simulacao.entradaTotal)}\n` +
      `✅ Parcelamento: *${simulacao.numParcelasEntrada}x de ${formatCurrencyDecimal(simulacao.parcelaEntrada)}*\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `*🏦 FINANCIAMENTO CEF (${formatarPercentual(simulacao.percentualFinanciado)}%):*\n\n` +
      (simulacao.reforcos > 0 ? `✅ Reforços${reforcosLabel ? ` (${reforcosLabel})` : ""} abatidos do financiamento: - ${formatCurrency(simulacao.reforcos)}\n` : "") +
      `💳 Saldo Financiado: ${formatCurrency(simulacao.valorFinanciado)}\n` +
      `📊 *Parcela Estimada: ${formatCurrencyDecimal(simulacao.parcelaFinanciamento)}/mês*\n` +
      `⏱️ Prazo: ${simulacao.prazoMeses} meses (${prazoAnos} anos)\n` +
      `📈 Taxa: ${simulacao.taxaAnual.toFixed(2)}% a.a. + TR\n` +
      `📝 Sistema: Tabela Price + TR\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      (corretorNome ? `👤 *Corretor:* ${corretorNome}\n` : "") +
      (corretorCreci ? `🏢 CRECI: ${corretorCreci}\n` : "") +
      (corretorWhatsapp ? `📱 WhatsApp: ${corretorWhatsapp}\n` : "") +
      (imobiliaria ? `🏢 Imobiliária: ${imobiliaria}\n` : "") +
      `\n⭐ *Seu apartamento próprio a partir de ${formatCurrencyDecimal(simulacao.parcelaEntrada)}/mês na obra e ${formatCurrencyDecimal(simulacao.parcelaFinanciamento)}/mês no financiamento!*\n\n` +
      `_SPE-VENEZIA EMPREENDIMENTOS IMOBILIARIOS LTDA_\n` +
      `_Proposta válida por 7 dias • Sujeita a análise de crédito_`;

    if (link) {
      const textoComLink = texto + `\n\n🔗 *Visualize a proposta completa:*\n${link}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(textoComLink)}`, "_blank");
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
    }
    toast.success("Proposta preparada para WhatsApp.");
  };

  const compartilharEmail = (link: string | null) => {
    const assunto = encodeURIComponent(`Proposta Comercial - Residencial Venezia${unidade ? ` - Unidade ${unidade.numero}` : ""} - ${formatCurrency(simulacao.valorImovel)}`);
    const corpo = encodeURIComponent(
      `PROPOSTA COMERCIAL — RESIDENCIAL VENEZIA\n` +
      `${'━'.repeat(50)}\n\n` +
      `Empreendimento: ${EMPREENDIMENTO.nome}\n` +
      `Localização: ${EMPREENDIMENTO.localizacao}\n` +
      (unidade ? `Unidade: ${unidade.numero} — ${unidade.area.toFixed(2).replace(".", ",")} m²\n` : "") +
      `Valor do Imóvel: ${formatCurrency(simulacao.valorImovel)}${docLabel}\n\n` +
      `${'━'.repeat(50)}\n` +
      `DURANTE A OBRA (ENTRADA ${simulacao.percentualEntrada}%)\n\n` +
      `  Entrada Total (${simulacao.percentualEntrada}%): ${formatCurrency(simulacao.entradaTotal)}\n` +
      `  Parcelamento: ${simulacao.numParcelasEntrada}x de ${formatCurrencyDecimal(simulacao.parcelaEntrada)}\n\n` +
      `  >>> PARCELA DA ENTRADA: ${formatCurrencyDecimal(simulacao.parcelaEntrada)}/mês\n\n` +
      `${'━'.repeat(50)}\n` +
      `FINANCIAMENTO CEF (${formatarPercentual(simulacao.percentualFinanciado)}%)\n\n` +
      (simulacao.reforcos > 0 ? `  Reforços${reforcosLabel ? ` (${reforcosLabel})` : ""} abatidos do financiamento: - ${formatCurrency(simulacao.reforcos)}\n` : "") +
      `  Saldo Financiado: ${formatCurrency(simulacao.valorFinanciado)}\n` +
      `  Prazo: ${simulacao.prazoMeses} meses (${prazoAnos} anos)\n` +
      `  Sistema: Tabela Price + TR\n` +
      `  Taxa de Juros: ${simulacao.taxaAnual.toFixed(2)}% a.a. + TR${simulacao.isCotista ? " (Cotista FGTS)" : ""}\n` +
      `  Amortização + Juros: ${formatCurrencyDecimal(simulacao.parcelaAmortizacao)}\n` +
      `  Seguros (MIP + DFI): ${formatCurrencyDecimal(simulacao.seguroMIP + simulacao.seguroDFI)}\n` +
      `  Taxa Administrativa: ${formatCurrencyDecimal(simulacao.taxaAdm)}\n\n` +
      `  >>> PARCELA DO FINANCIAMENTO: ${formatCurrencyDecimal(simulacao.parcelaFinanciamento)}/mês\n\n` +
      `${'━'.repeat(50)}\n` +
      (corretorNome ? `Corretor: ${corretorNome}\n` : "") +
      (corretorCreci ? `CRECI: ${corretorCreci}\n` : "") +
      (corretorWhatsapp ? `WhatsApp: ${corretorWhatsapp}\n` : "") +
      (corretorEmail ? `E-mail: ${corretorEmail}\n` : "") +
      (imobiliaria ? `Imobiliária: ${imobiliaria}\n` : "") +
      `\n${'━'.repeat(50)}\n` +
      `SPE-VENEZIA EMPREENDIMENTOS IMOBILIARIOS LTDA\n` +
      `${EMPREENDIMENTO.localizacao}\n\n` +
      `* Simulação ilustrativa baseada nos parâmetros CEF vigentes.\n` +
      `* Valores sujeitos a análise de crédito.\n` +
      `* Proposta válida por 7 dias.`
    );
    if (link) {
      const corpoComLink = corpo + encodeURIComponent(`\n\nVisualize a proposta completa: ${link}`);
      window.open(`mailto:?subject=${assunto}&body=${corpoComLink}`, "_self");
    } else {
      window.open(`mailto:?subject=${assunto}&body=${corpo}`, "_self");
    }
    toast.success("E-mail preparado.");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#c62828] rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1a1a2e]">Proposta Comercial</h2>
              <p className="text-xs text-gray-500">Mesmo simulador da página pública • Atualização em tempo real</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6">

          {/* ===== SIMULADOR CEF INTEGRADO (MESMO DA PÁGINA PÚBLICA) ===== */}
          <div className="bg-white rounded-xl border-2 border-[#c62828]/20 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Landmark size={20} className="text-[#c62828]" />
              <span className="text-sm font-bold text-[#1a1a2e]">Simulador CEF • MCMV Faixa 3</span>
              <span className="text-[10px] bg-[#c62828]/10 text-[#c62828] px-2 py-0.5 rounded-full font-medium">Mesmo da página</span>
            </div>

            {/* Valor do Imóvel: unidade da tabela + documentação + cursor livre (importados do simulador) */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="unidade-proposta" className="text-sm font-medium text-gray-700">Valor do Imóvel</label>
                <span className="text-xs text-gray-500">
                  {formatCurrency(EMPREENDIMENTO.valorMin)} — {formatCurrency(EMPREENDIMENTO.valorMax)}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 mb-3">
                <select
                  id="unidade-proposta"
                  value={unidadeId}
                  onChange={(e) => setUnidadeId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#1a1a2e] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#c62828]/30 focus:border-[#c62828] transition-all"
                >
                  <option value="">Valor livre — use o cursor abaixo</option>
                  {unidades.filter((u) => u.status === "disponivel").map((u) => (
                    <option key={u.id} value={u.id}>
                      Unidade {u.numero} — {u.andar}º andar — {u.area.toFixed(2).replace(".", ",")} m² — {formatCurrency(u.valorVenda)}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2" role="group" aria-label="Documentação">
                  <button
                    type="button"
                    onClick={() => setComDocumentacao(false)}
                    aria-pressed={!comDocumentacao}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      !comDocumentacao ? "bg-[#1a1a2e] text-white border-[#1a1a2e]" : "bg-white text-gray-700 border-gray-200 hover:border-[#1a1a2e]/50"
                    }`}
                  >
                    Sem documentação
                  </button>
                  <button
                    type="button"
                    onClick={() => setComDocumentacao(true)}
                    aria-pressed={comDocumentacao}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      comDocumentacao ? "bg-[#1a1a2e] text-white border-[#1a1a2e]" : "bg-white text-gray-700 border-gray-200 hover:border-[#1a1a2e]/50"
                    }`}
                  >
                    Com documentação (+{PERCENTUAL_DOCUMENTACAO * 100}%)
                  </button>
                </div>
              </div>
              <div className="text-center mb-3">
                <span className="text-3xl font-bold text-[#1a1a2e]">{formatCurrency(valorImovel)}</span>
                <p className="text-xs text-gray-500 mt-1">
                  {unidade ? `Unidade ${unidade.numero} — valor da tabela ${formatCurrency(unidade.valorVenda)}` : `Valor livre ${formatCurrency(valorLivre)}`}
                  {comDocumentacao ? ` + ${PERCENTUAL_DOCUMENTACAO * 100}% de documentação = ${formatCurrency(valorImovel)}` : " (sem documentação)"}
                </p>
              </div>
              {!unidade && (
                <>
                  <input
                    type="range"
                    min={EMPREENDIMENTO.valorMin}
                    max={EMPREENDIMENTO.valorMax}
                    step={1000}
                    value={Math.min(Math.max(valorLivre, EMPREENDIMENTO.valorMin), EMPREENDIMENTO.valorMax)}
                    onChange={(e) => setValorLivre(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#c62828]"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{formatCurrency(EMPREENDIMENTO.valorMin)}</span>
                    <span>{formatCurrency(EMPREENDIMENTO.valorMax)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Cursor de Entrada (min 20%) */}
            <div className="mb-5">
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

            {/* Parcelas da Entrada (máx. 48) */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="parcelas-entrada-proposta" className="text-sm font-medium text-gray-700">Parcelas da Entrada</label>
                <span className="text-sm font-bold text-[#c62828]">{numParcelasEntrada}x</span>
              </div>
              <input
                id="parcelas-entrada-proposta"
                type="range"
                min={CEF_PARAMS.numParcelasEntradaMin}
                max={CEF_PARAMS.numParcelasEntradaMax}
                step={1}
                value={numParcelasEntrada}
                onChange={(e) => setNumParcelasEntrada(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#c62828]"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{CEF_PARAMS.numParcelasEntradaMin}x</span>
                <span>{CEF_PARAMS.numParcelasEntradaMax}x (máximo)</span>
              </div>
            </div>

            {/* Reforços periódicos */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="valor-reforco-proposta" className="text-sm font-medium text-gray-700">Reforços (abatidos do financiamento)</label>
                <span className="text-xs text-gray-400">Não altera a entrada</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                  <input
                    id="valor-reforco-proposta"
                    type="text"
                    inputMode="numeric"
                    value={reforcoFormatado}
                    onChange={handleReforcoChange}
                    placeholder="Valor de cada reforço"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[#1a1a2e] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#c62828]/30 focus:border-[#c62828] transition-all"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2" role="group" aria-label="Periodicidade dos reforços">
                  {(Object.keys(PERIODICIDADE_REFORCO) as PeriodicidadeReforco[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPeriodicidadeReforco(p)}
                      aria-pressed={periodicidadeReforco === p}
                      className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                        periodicidadeReforco === p
                          ? "bg-[#c62828] text-white border-[#c62828]"
                          : "bg-white text-gray-700 border-gray-200 hover:border-[#c62828]/50"
                      }`}
                    >
                      {PERIODICIDADE_REFORCO[p].label}
                    </button>
                  ))}
                </div>
              </div>
              {simulacao.quantidadeReforcos > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {reforcosLabel} = <span className="font-semibold">{formatCurrency(simulacao.reforcos)}</span> (meses {simulacao.mesesReforcos.join(", ")})
                </p>
              )}
            </div>

            {/* BLOCO 1: DURANTE A OBRA — ENTRADA */}
            <div className="bg-gradient-to-r from-[#c62828]/5 to-[#c62828]/10 rounded-xl p-5 mb-4 border border-[#c62828]/10">
              <h4 className="text-xs font-bold text-[#c62828] uppercase tracking-wider mb-4 flex items-center gap-2">
                <CreditCard size={14} /> Bloco 1 — Durante a Obra (Entrada {simulacao.percentualEntrada}%)
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Valor do Imóvel{docLabel}:</span>
                  <span className="text-sm font-bold text-[#1a1a2e]">{formatCurrency(simulacao.valorImovel)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Entrada ({simulacao.percentualEntrada}%):</span>
                  <span className="text-sm font-bold text-[#c62828]">{formatCurrency(simulacao.entradaTotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Entrada Parcelada:</span>
                  <span className="text-sm font-bold text-[#1a1a2e]">{simulacao.numParcelasEntrada}x de {formatCurrencyDecimal(simulacao.parcelaEntrada)}</span>
                </div>
              </div>
              <div className="mt-4 bg-white rounded-lg p-3 text-center border border-[#c62828]/20">
                <p className="text-[10px] text-[#c62828] uppercase tracking-wider font-medium">Valor da Parcela da Entrada</p>
                <p className="text-2xl font-bold text-[#c62828] mt-1">{formatCurrencyDecimal(simulacao.parcelaEntrada)}<span className="text-sm font-normal text-gray-500">/mês</span></p>
              </div>
            </div>

            {/* Prazo do Financiamento */}
            <div className="mb-4">
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
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1565c0]"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>10 anos</span>
                <span>20 anos</span>
                <span>30 anos</span>
                <span>35 anos</span>
              </div>
            </div>

            {/* Cotista FGTS */}
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="cotista-proposta"
                checked={isCotista}
                onChange={(e) => setIsCotista(e.target.checked)}
                className="w-4 h-4 accent-[#1565c0] rounded"
              />
              <label htmlFor="cotista-proposta" className="text-sm text-gray-700">
                Cotista FGTS (3+ anos) — taxa reduzida para {CEF_PARAMS.taxaAnualCotista}% a.a.
              </label>
            </div>

            {/* BLOCO 2: FINANCIAMENTO CEF */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
              <h4 className="text-xs font-bold text-[#0d47a1] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calculator size={14} /> Bloco 2 — Financiamento CEF ({formatarPercentual(simulacao.percentualFinanciado)}%)
              </h4>
              <div className="space-y-2">
                {simulacao.reforcos > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">Reforços{reforcosLabel ? ` (${reforcosLabel})` : ""} abatidos do financiamento:</span>
                    <span className="text-sm font-bold text-[#0d47a1]">- {formatCurrency(simulacao.reforcos)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Valor Financiado ({formatarPercentual(simulacao.percentualFinanciado)}%):</span>
                  <span className="text-sm font-bold text-[#0d47a1]">{formatCurrency(simulacao.valorFinanciado)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Prazo:</span>
                  <span className="text-sm font-bold text-[#0d47a1]">{simulacao.prazoMeses} meses ({prazoAnos} anos)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Sistema:</span>
                  <span className="text-sm font-bold text-[#0d47a1]">Tabela Price + TR</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Taxa de Juros:</span>
                  <span className="text-sm font-bold text-[#0d47a1]">{simulacao.taxaAnual.toFixed(2)}% a.a. + TR</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Amortização + Juros:</span>
                  <span className="text-sm font-bold text-[#0d47a1]">{formatCurrencyDecimal(simulacao.parcelaAmortizacao)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Seguros (MIP + DFI):</span>
                  <span className="text-sm font-bold text-[#0d47a1]">{formatCurrencyDecimal(simulacao.seguroMIP + simulacao.seguroDFI)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Taxa Administrativa:</span>
                  <span className="text-sm font-bold text-[#0d47a1]">{formatCurrencyDecimal(simulacao.taxaAdm)}</span>
                </div>
              </div>
              <div className="mt-4 bg-[#0d47a1] rounded-lg p-4 text-center">
                <p className="text-[10px] text-white/70 uppercase tracking-wider font-medium">Parcela Estimada do Financiamento</p>
                <p className="text-2xl font-bold text-white mt-1">{formatCurrencyDecimal(simulacao.parcelaFinanciamento)}<span className="text-sm font-normal text-white/60">/mês</span></p>
                <p className="text-[10px] text-white/50 mt-1">{simulacao.prazoMeses} parcelas • Tabela Price + TR</p>
              </div>
            </div>
          </div>

          {/* Dados do Cliente */}
          <div>
            <h3 className="text-sm font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2">
              <User size={14} /> Dados do Cliente (opcional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Nome do cliente"
                value={comprador}
                onChange={(e) => setComprador(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#c62828]/20 focus:border-[#c62828]"
              />
              <input
                type="text"
                placeholder="CPF"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#c62828]/20 focus:border-[#c62828]"
              />
              <input
                type="text"
                placeholder="Telefone"
                value={telefoneCliente}
                onChange={(e) => setTelefoneCliente(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#c62828]/20 focus:border-[#c62828]"
              />
            </div>
          </div>

          {/* Dados do Corretor */}
          <div>
            <h3 className="text-sm font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2">
              <Building2 size={14} /> Corretor Responsável
              {corretorData && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Auto-preenchido</span>}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" placeholder="Nome do corretor" value={corretorNome} onChange={(e) => setCorretorNome(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#c62828]/20 focus:border-[#c62828]" />
              <input type="text" placeholder="CRECI" value={corretorCreci} onChange={(e) => setCorretorCreci(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#c62828]/20 focus:border-[#c62828]" />
              <input type="text" placeholder="WhatsApp" value={corretorWhatsapp} onChange={(e) => setCorretorWhatsapp(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#c62828]/20 focus:border-[#c62828]" />
              <input type="text" placeholder="Telefone" value={corretorTelefone} onChange={(e) => setCorretorTelefone(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#c62828]/20 focus:border-[#c62828]" />
              <input type="email" placeholder="E-mail" value={corretorEmail} onChange={(e) => setCorretorEmail(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#c62828]/20 focus:border-[#c62828]" />
              <input type="text" placeholder="Imobiliária" value={imobiliaria} onChange={(e) => setImobiliaria(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#c62828]/20 focus:border-[#c62828]" />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-semibold text-[#1a1a2e] mb-2">Observações (opcional)</label>
            <textarea
              placeholder="Condições especiais, informações adicionais..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#c62828]/20 focus:border-[#c62828] resize-none"
            />
          </div>

          {/* Overlay de Loading do PDF */}
          {pdfLoading && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-md">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
                {/* Ícone animado */}
                <div className="relative mx-auto w-20 h-20">
                  {pdfStatus === "done" ? (
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-300">
                      <CheckCircle2 size={40} className="text-green-600" />
                    </div>
                  ) : pdfStatus === "error" ? (
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-300">
                      <X size={40} className="text-red-600" />
                    </div>
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-full border-4 border-gray-200" />
                      <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-[#c62828] animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FileText size={24} className="text-[#c62828]" />
                      </div>
                    </>
                  )}
                </div>

                {/* Texto de status */}
                <div>
                  <h3 className="text-lg font-bold text-[#1a1a2e]">
                    {pdfStatus === "saving" && "Salvando proposta..."}
                    {pdfStatus === "rendering" && "Renderizando PDF..."}
                    {pdfStatus === "finalizing" && "Finalizando documento..."}
                    {pdfStatus === "done" && "PDF gerado com sucesso!"}
                    {pdfStatus === "error" && "Erro na geração"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {pdfStatus === "saving" && "Preparando dados da proposta comercial"}
                    {pdfStatus === "rendering" && "Gerando PDF de alta qualidade com cores e imagens"}
                    {pdfStatus === "finalizing" && "Aplicando acabamentos finais ao documento"}
                    {pdfStatus === "done" && "Seu PDF está pronto para download"}
                    {pdfStatus === "error" && "Usando impressão do navegador como alternativa"}
                  </p>
                </div>

                {/* Barra de progresso */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      pdfStatus === "done" ? "bg-green-500" : pdfStatus === "error" ? "bg-red-500" : "bg-[#c62828]"
                    }`}
                    style={{ width: `${Math.min(pdfProgress, 100)}%` }}
                  />
                </div>

                {/* Porcentagem */}
                <p className="text-xs text-gray-400 font-mono">
                  {Math.round(Math.min(pdfProgress, 100))}%
                </p>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-4 border-t border-gray-100">
            <button onClick={handleVisualizar} className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-all active:scale-[0.97]">
              <Eye size={14} /> Visualizar
            </button>
            <button onClick={handleBaixarPDF} disabled={pdfLoading} className="flex items-center justify-center gap-2 px-4 py-3 bg-[#c62828] hover:bg-[#b71c1c] text-white rounded-lg text-xs font-medium transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed">
              {pdfLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Baixar PDF
            </button>
            <button onClick={handleGerarPDF} className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-xs font-medium transition-all active:scale-[0.97]">
              <Printer size={14} /> Imprimir
            </button>
            <button onClick={() => handleSalvarECompartilhar("whatsapp")} className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25d366] hover:bg-[#1da851] text-white rounded-lg text-xs font-medium transition-all active:scale-[0.97]">
              <MessageCircle size={14} /> WhatsApp
            </button>
            <button onClick={() => handleSalvarECompartilhar("email")} className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1565c0] hover:bg-[#0d47a1] text-white rounded-lg text-xs font-medium transition-all active:scale-[0.97]">
              <Mail size={14} /> E-mail
            </button>
            <button onClick={onClose} className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg text-xs font-medium transition-all border border-gray-200">
              <X size={14} /> Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
