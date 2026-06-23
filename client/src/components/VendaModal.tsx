import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useAuth, type DadosVenda } from "@/contexts/AuthContext";
import { FileText, User, Download, Mail, History, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { Unidade } from "@/data/empreendimento";

interface VendaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unidade: Unidade | null;
  onConfirm: (dados: DadosVenda) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }).format(value);

const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[^\d,.-]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
};

const formatCPF = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

type TipoValor = "sem_doc" | "com_doc";

// Simulação de parcelas CEF (Price simplificado)
function calcularParcela(valorFinanc: number, taxaAnual: number, prazoMeses: number): number {
  if (valorFinanc <= 0 || prazoMeses <= 0) return 0;
  const taxaMensal = taxaAnual / 12 / 100;
  if (taxaMensal === 0) return valorFinanc / prazoMeses;
  return valorFinanc * (taxaMensal * Math.pow(1 + taxaMensal, prazoMeses)) / (Math.pow(1 + taxaMensal, prazoMeses) - 1);
}

export default function VendaModal({ open, onOpenChange, unidade, onConfirm }: VendaModalProps) {
  const { dadosVenda, propostas, addProposta } = useAuth();

  const [comprador, setComprador] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [imobiliaria, setImobiliaria] = useState("");
  const [corretor, setCorretor] = useState("");
  const [dataAssinatura, setDataAssinatura] = useState("");
  const [tipoValor, setTipoValor] = useState<TipoValor>("com_doc");
  const [percentEntrada, setPercentEntrada] = useState(20);
  const [fgtsValue, setFgtsValue] = useState(0);
  const [fgtsInput, setFgtsInput] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [showHistorico, setShowHistorico] = useState(false);
  const [aceiteDigital, setAceiteDigital] = useState(false);
  const [condicaoEntrada, setCondicaoEntrada] = useState<"avista" | "parcelada">("parcelada");
  const [numParcelas, setNumParcelas] = useState(36);

  // Valor base conforme seleção (automático ao clicar)
  const valorBase = useMemo(() => {
    if (!unidade) return 0;
    return tipoValor === "com_doc" ? unidade.valorComDocumentacao : unidade.valorVenda;
  }, [unidade, tipoValor]);

  // Cálculos automáticos: Entrada = % do valor base
  const valorEntrada = useMemo(() => valorBase * (percentEntrada / 100), [valorBase, percentEntrada]);

  // Valor da parcela da entrada
  const valorParcelaEntrada = useMemo(() => {
    if (condicaoEntrada === "avista" || numParcelas <= 0) return valorEntrada;
    return valorEntrada / numParcelas;
  }, [valorEntrada, condicaoEntrada, numParcelas]);

  // Financiamento = Valor Base - Entrada - FGTS
  const valorFinanciamento = useMemo(() => Math.max(0, valorBase - valorEntrada - fgtsValue), [valorBase, valorEntrada, fgtsValue]);

  // Percentual real de financiamento
  const percentFinanc = useMemo(() => valorBase > 0 ? (valorFinanciamento / valorBase) * 100 : 0, [valorBase, valorFinanciamento]);

  // Simulação de parcelas (3 cenários)
  const parcelas = useMemo(() => {
    return {
      p360: calcularParcela(valorFinanciamento, 9.49, 360), // 30 anos - CEF padrão
      p300: calcularParcela(valorFinanciamento, 9.49, 300), // 25 anos
      p240: calcularParcela(valorFinanciamento, 9.49, 240), // 20 anos
    };
  }, [valorFinanciamento]);

  // Inicializar valores quando unidade muda ou modal abre
  useEffect(() => {
    if (unidade && open) {
      const existente = dadosVenda[unidade.id];
      if (existente) {
        setComprador(existente.comprador || "");
        setCpf(existente.cpf || "");
        setTelefone(existente.telefone || "");
        setImobiliaria(existente.imobiliaria);
        setCorretor(existente.corretor);
        setDataAssinatura(existente.dataAssinatura);
        setFgtsValue(existente.fgts || 0);
        setFgtsInput(existente.fgts > 0 ? String(existente.fgts) : "");
        setObservacoes(existente.observacoes || "");
        // Determinar percentual de entrada
        const valBase = existente.valorSemDocumentacao || unidade.valorComDocumentacao;
        if (valBase > 0 && existente.entrada > 0) {
          setPercentEntrada(Math.round((existente.entrada / valBase) * 100));
        } else {
          setPercentEntrada(20);
        }
        setTipoValor(existente.valorSemDocumentacao === unidade.valorVenda ? "sem_doc" : "com_doc");
      } else {
        // Padrão: 20% entrada, 80% financiamento, com documentação
        setComprador("");
        setCpf("");
        setTelefone("");
        setImobiliaria("");
        setCorretor("");
        setDataAssinatura(new Date().toISOString().split("T")[0]);
        setTipoValor("com_doc");
        setPercentEntrada(20);
        setFgtsValue(0);
        setFgtsInput("");
        setObservacoes("");
      }
      setShowHistorico(false);
      setAceiteDigital(false);
    }
  }, [unidade, open, dadosVenda]);

  // Handler FGTS
  const handleFgtsChange = useCallback((value: string) => {
    setFgtsInput(value);
    setFgtsValue(parseCurrency(value));
  }, []);

  // Handler do slider de entrada (mínimo 20%)
  const handleEntradaSlider = useCallback((values: number[]) => {
    setPercentEntrada(values[0]);
  }, []);

  const validarCamposProposta = useCallback(() => {
    if (!comprador.trim()) {
      toast.error("Preencha o nome do comprador antes de gerar a proposta.");
      return false;
    }
    if (!imobiliaria.trim() || !corretor.trim()) {
      toast.error("Preencha Imobiliária e Corretor antes de gerar a proposta.");
      return false;
    }
    if (!dataAssinatura) {
      toast.error("Preencha a data da assinatura antes de gerar a proposta.");
      return false;
    }
    return true;
  }, [comprador, imobiliaria, corretor, dataAssinatura]);

  // Gerar proposta comercial em PDF com assinatura digital
  const gerarPropostaPDF = useCallback(() => {
    if (!unidade) return;
    if (!validarCamposProposta()) return;
    const dataFormatada = dataAssinatura
      ? new Date(dataAssinatura + "T12:00:00").toLocaleDateString("pt-BR")
      : new Date().toLocaleDateString("pt-BR");

    // Registrar proposta no histórico
    addProposta({
      unidadeId: unidade.id,
      unidadeNumero: unidade.numero,
      comprador: comprador.trim(),
      cpf: cpf || undefined,
      telefone: telefone || undefined,
      imobiliaria: imobiliaria.trim(),
      corretor: corretor.trim(),
      valorBase,
      tipoValor: tipoValor === "com_doc" ? "Com Documentação" : "Sem Documentação",
      entrada: valorEntrada,
      financiamento: valorFinanciamento,
      fgts: fgtsValue,
      observacoes: observacoes.trim() || undefined,
    });

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Proposta Comercial - Unidade ${unidade.numero}</title>
<style>
@page{margin:2cm;size:A4}*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Georgia',serif;color:#1a1a2e;line-height:1.6;padding:40px}
.header{text-align:center;border-bottom:2px solid #c62828;padding-bottom:20px;margin-bottom:30px}
.header h1{font-size:28px;color:#1a1a2e;margin-bottom:4px;letter-spacing:2px}
.header h2{font-size:14px;color:#666;font-weight:normal;letter-spacing:4px;text-transform:uppercase}
.header p{font-size:11px;color:#999;margin-top:10px}
.section{margin-bottom:24px}
.section-title{font-size:13px;font-weight:bold;color:#c62828;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #eee}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 20px}
.info-item{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dotted #ddd}
.info-item .label{color:#666;font-size:12px}
.info-item .value{font-weight:bold;font-size:12px;color:#1a1a2e}
.highlight{background:#f8f7f4;padding:16px;border-radius:8px;border:1px solid #e0e0e0;margin-top:16px}
.highlight .big-value{font-size:24px;font-weight:bold;color:#c62828;text-align:center;margin:8px 0}
.highlight .label{font-size:11px;color:#666;text-align:center;text-transform:uppercase;letter-spacing:1px}
.table{width:100%;border-collapse:collapse;margin-top:12px;font-size:12px}
.table th{background:#1a1a2e;color:white;padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
.table td{padding:8px 12px;border-bottom:1px solid #eee}
.table tr:nth-child(even){background:#f9f9f9}
.table .total{font-weight:bold;background:#f0f0f0}
.parcelas{background:#f0f7ff;border:1px solid #d0e3f7;padding:14px;border-radius:8px;margin-top:16px}
.parcelas h4{font-size:12px;color:#1565c0;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px}
.parcelas .grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.parcelas .item{text-align:center}
.parcelas .item .prazo{font-size:10px;color:#666;margin-bottom:2px}
.parcelas .item .valor{font-size:14px;font-weight:bold;color:#1565c0}
.obs{background:#fffde7;border:1px solid #fff9c4;padding:12px;border-radius:6px;font-size:11px;color:#555;margin-top:16px}
.aceite{background:#e8f5e9;border:1px solid #c8e6c9;padding:14px;border-radius:8px;margin-top:20px}
.aceite h4{font-size:12px;color:#2e7d32;margin-bottom:8px}
.aceite p{font-size:11px;color:#555;line-height:1.5}
.aceite .check{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:12px;font-weight:bold;color:#2e7d32}
.footer{margin-top:40px;padding-top:20px;border-top:1px solid #ddd;text-align:center;font-size:10px;color:#999}
.signatures{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:60px}
.sig-line{border-top:1px solid #333;padding-top:8px;text-align:center;font-size:11px;color:#666}
@media print{body{padding:0}}
</style></head><body>
<div class="header"><h1>VENEZIA</h1><h2>Residencial</h2><p>Loteamento Terra Firme, Bairro Areias, Tijucas/SC</p></div>
<div class="section"><div class="section-title">Proposta Comercial</div>
<div class="info-grid">
<div class="info-item"><span class="label">Data:</span><span class="value">${dataFormatada}</span></div>
<div class="info-item"><span class="label">Unidade:</span><span class="value">${unidade.numero}</span></div>
<div class="info-item"><span class="label">Andar:</span><span class="value">${unidade.andar}º Andar</span></div>
<div class="info-item"><span class="label">Área Privativa:</span><span class="value">${unidade.area} m²</span></div>
</div></div>
<div class="section"><div class="section-title">Dados do Comprador</div>
<div class="info-grid">
<div class="info-item"><span class="label">Comprador:</span><span class="value">${comprador || "—"}</span></div>
<div class="info-item"><span class="label">CPF:</span><span class="value">${cpf || "—"}</span></div>
<div class="info-item"><span class="label">Telefone:</span><span class="value">${telefone || "—"}</span></div>
<div class="info-item"><span class="label">Imobiliária:</span><span class="value">${imobiliaria || "—"}</span></div>
<div class="info-item"><span class="label">Corretor:</span><span class="value">${corretor || "—"}</span></div>
<div class="info-item"><span class="label">Data Assinatura:</span><span class="value">${dataFormatada}</span></div>
</div></div>
<div class="section"><div class="section-title">Composição Financeira</div>
<div class="highlight"><div class="label">Valor do Imóvel (${tipoValor === "com_doc" ? "Com Documentação" : "Sem Documentação"})</div>
<div class="big-value">${formatCurrency(valorBase)}</div></div>
<table class="table"><thead><tr><th>Descrição</th><th>Percentual</th><th>Valor</th></tr></thead><tbody>
<tr><td>Entrada (${condicaoEntrada === "avista" ? "À Vista" : `${numParcelas}x de ${formatCurrency(valorParcelaEntrada)}`})</td><td>${percentEntrada}%</td><td><strong>${formatCurrency(valorEntrada)}</strong></td></tr>
<tr><td>FGTS</td><td>${valorBase > 0 ? ((fgtsValue / valorBase) * 100).toFixed(1) : 0}%</td><td>${formatCurrency(fgtsValue)}</td></tr>
<tr><td>Financiamento Bancário (CEF)</td><td>${percentFinanc.toFixed(1)}%</td><td>${formatCurrency(valorFinanciamento)}</td></tr>
<tr class="total"><td>Total</td><td>100%</td><td>${formatCurrency(valorBase)}</td></tr>
</tbody></table>
<div class="parcelas"><h4>Simulação de Parcelas (Taxa 9,49% a.a. - CEF)</h4>
<div class="grid">
<div class="item"><div class="prazo">360 meses (30 anos)</div><div class="valor">${formatCurrency(parcelas.p360)}</div></div>
<div class="item"><div class="prazo">300 meses (25 anos)</div><div class="valor">${formatCurrency(parcelas.p300)}</div></div>
<div class="item"><div class="prazo">240 meses (20 anos)</div><div class="valor">${formatCurrency(parcelas.p240)}</div></div>
</div></div></div>
<div class="section"><div class="section-title">Informações do Imóvel</div>
<table class="table"><thead><tr><th>Item</th><th>Detalhe</th></tr></thead><tbody>
<tr><td>Tipologia</td><td>2 Suítes</td></tr>
<tr><td>Área Privativa</td><td>${unidade.area} m²</td></tr>
<tr><td>Andar</td><td>${unidade.andar}º Andar</td></tr>
<tr><td>Valor s/ Documentação</td><td>${formatCurrency(unidade.valorVenda)}</td></tr>
<tr><td>Valor c/ Documentação (4%)</td><td>${formatCurrency(unidade.valorComDocumentacao)}</td></tr>
<tr><td>R$/m²</td><td>${formatCurrency(unidade.precoM2)}</td></tr>
<tr><td>Vaga de Garagem</td><td>1 vaga coberta</td></tr>
<tr><td>Sacada</td><td>Com churrasqueira</td></tr>
</tbody></table></div>
${observacoes ? `<div class="obs"><strong>Observações / Condições Especiais:</strong><br>${observacoes.replace(/\n/g, "<br>")}</div>` : ""}
${aceiteDigital ? `<div class="aceite"><h4>Aceite Digital do Comprador</h4><p>Declaro que li e concordo com os termos desta proposta comercial. Estou ciente dos valores, condições de pagamento e características do imóvel descritos acima.</p><div class="check">✓ Aceite registrado digitalmente em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div></div>` : ""}
<div class="signatures"><div class="sig-line">Comprador<br><small>${comprador || "_______________"}</small></div><div class="sig-line">Vendedor / Corretor<br><small>${corretor || "_______________"}</small></div></div>
<div class="footer"><p>Residencial Venezia — ARTEÁ Empreendimentos</p><p>Loteamento Terra Firme, Bairro Areias, Tijucas/SC</p>
<p>Proposta gerada em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} | Válida por 7 dias</p></div>
</body></html>`;

    const printWindow = window.open("", "_blank", "width=800,height=1100");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
      toast.success("Proposta comercial gerada e registrada no histórico!");
    } else {
      toast.error("Bloqueador de pop-ups ativo. Permita pop-ups para gerar o PDF.");
    }
  }, [unidade, validarCamposProposta, comprador, cpf, telefone, imobiliaria, corretor, dataAssinatura, tipoValor, valorBase, valorEntrada, fgtsValue, valorFinanciamento, percentEntrada, percentFinanc, observacoes, aceiteDigital, parcelas, addProposta, condicaoEntrada, numParcelas, valorParcelaEntrada]);

  // Gerar HTML da proposta para link compartilhável
  const gerarHtmlPropostaLink = useCallback(() => {
    if (!unidade) return "";
    const dataFormatada = dataAssinatura
      ? new Date(dataAssinatura + "T12:00:00").toLocaleDateString("pt-BR")
      : new Date().toLocaleDateString("pt-BR");
    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Proposta Comercial - Unidade ${unidade.numero} - Residencial Venezia</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,serif;color:#1a1a2e;line-height:1.6;padding:40px;max-width:800px;margin:0 auto;background:#fff}
.header{text-align:center;border-bottom:2px solid #c62828;padding-bottom:20px;margin-bottom:30px}
.header h1{font-size:28px;letter-spacing:2px;margin-bottom:4px}.header h2{font-size:14px;color:#666;font-weight:normal;letter-spacing:4px;text-transform:uppercase}
.header .date{font-size:11px;color:#999;margin-top:10px}
.section{margin-bottom:24px}.section-title{font-size:13px;font-weight:bold;color:#c62828;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #eee}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 20px}
.item{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dotted #ddd}.item .l{color:#666;font-size:12px}.item .v{font-weight:bold;font-size:12px}
.highlight{background:#f8f7f4;padding:16px;border-radius:8px;border:1px solid #e0e0e0;text-align:center;margin:16px 0}
.highlight .big{font-size:24px;font-weight:bold;color:#c62828;margin:8px 0}.highlight .lbl{font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px}
table{width:100%;border-collapse:collapse;margin-top:12px;font-size:12px}th{background:#1a1a2e;color:white;padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase}td{padding:8px 12px;border-bottom:1px solid #eee}
tr:nth-child(even){background:#f9f9f9}.total td{font-weight:bold;background:#f0f0f0}
.parcelas{background:#f0f7ff;border:1px solid #d0e3f7;padding:14px;border-radius:8px;margin-top:16px}
.parcelas h4{font-size:12px;color:#1565c0;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px}
.parcelas .pgrid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;text-align:center}
.parcelas .prazo{font-size:10px;color:#666;margin-bottom:2px}.parcelas .pval{font-size:14px;font-weight:bold;color:#1565c0}
.obs{background:#fffde7;border:1px solid #fff9c4;padding:12px;border-radius:6px;font-size:11px;color:#555;margin-top:16px}
.footer{margin-top:40px;padding-top:20px;border-top:1px solid #ddd;text-align:center;font-size:10px;color:#999}
.actions{text-align:center;margin-top:30px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.btn{padding:12px 24px;border:none;border-radius:8px;font-size:13px;cursor:pointer;font-weight:bold;text-decoration:none;display:inline-block}
.btn-print{background:#c62828;color:white}.btn-print:hover{background:#b71c1c}
.btn-whats{background:#25d366;color:white}.btn-whats:hover{background:#1da851}
@media print{.actions{display:none!important}}@media(max-width:600px){body{padding:16px}.grid{grid-template-columns:1fr}.parcelas .pgrid{grid-template-columns:1fr}}
</style></head><body>
<div class="header"><h1>VENEZIA</h1><h2>Residencial</h2><p class="date">Proposta Comercial | ${dataFormatada}</p></div>
<div class="section"><div class="section-title">Dados do Comprador</div><div class="grid">
<div class="item"><span class="l">Comprador:</span><span class="v">${comprador || "\u2014"}</span></div>
<div class="item"><span class="l">CPF:</span><span class="v">${cpf || "\u2014"}</span></div>
<div class="item"><span class="l">Telefone:</span><span class="v">${telefone || "\u2014"}</span></div>
<div class="item"><span class="l">Imobili\u00e1ria:</span><span class="v">${imobiliaria || "\u2014"}</span></div>
<div class="item"><span class="l">Corretor:</span><span class="v">${corretor || "\u2014"}</span></div>
<div class="item"><span class="l">Data:</span><span class="v">${dataFormatada}</span></div>
</div></div>
<div class="section"><div class="section-title">Im\u00f3vel</div><div class="grid">
<div class="item"><span class="l">Unidade:</span><span class="v">${unidade.numero}</span></div>
<div class="item"><span class="l">Andar:</span><span class="v">${unidade.andar}\u00ba Andar</span></div>
<div class="item"><span class="l">\u00c1rea Privativa:</span><span class="v">${unidade.area} m\u00b2</span></div>
<div class="item"><span class="l">R$/m\u00b2:</span><span class="v">${formatCurrency(unidade.precoM2)}</span></div>
<div class="item"><span class="l">Sacada:</span><span class="v">Com churrasqueira</span></div>
<div class="item"><span class="l">Garagem:</span><span class="v">1 vaga coberta</span></div>
</div></div>
<div class="section"><div class="section-title">Composi\u00e7\u00e3o Financeira</div>
<div class="highlight"><div class="lbl">Valor do Im\u00f3vel (${tipoValor === "com_doc" ? "Com Documenta\u00e7\u00e3o" : "Sem Documenta\u00e7\u00e3o"})</div><div class="big">${formatCurrency(valorBase)}</div></div>
<table><thead><tr><th>Descri\u00e7\u00e3o</th><th>%</th><th>Valor</th></tr></thead><tbody>
<tr><td>Entrada ${condicaoEntrada === "parcelada" ? `(${numParcelas}x de ${formatCurrency(valorParcelaEntrada)})` : "(\u00c0 Vista)"}</td><td>${percentEntrada}%</td><td><strong>${formatCurrency(valorEntrada)}</strong></td></tr>
<tr><td>FGTS</td><td>${valorBase > 0 ? ((fgtsValue / valorBase) * 100).toFixed(1) : 0}%</td><td>${formatCurrency(fgtsValue)}</td></tr>
<tr><td>Financiamento Banc\u00e1rio (CEF)</td><td>${percentFinanc.toFixed(1)}%</td><td>${formatCurrency(valorFinanciamento)}</td></tr>
<tr class="total"><td>Total</td><td>100%</td><td>${formatCurrency(valorBase)}</td></tr>
</tbody></table>
<div class="parcelas"><h4>Simula\u00e7\u00e3o de Parcelas (Taxa 9,49% a.a. - CEF)</h4><div class="pgrid">
<div><div class="prazo">360 meses (30 anos)</div><div class="pval">${formatCurrency(parcelas.p360)}/m\u00eas</div></div>
<div><div class="prazo">300 meses (25 anos)</div><div class="pval">${formatCurrency(parcelas.p300)}/m\u00eas</div></div>
<div><div class="prazo">240 meses (20 anos)</div><div class="pval">${formatCurrency(parcelas.p240)}/m\u00eas</div></div>
</div></div></div>
${observacoes ? `<div class="obs"><strong>Observa\u00e7\u00f5es:</strong><br>${observacoes.replace(/\n/g, "<br>")}</div>` : ""}
<div class="footer"><p><strong>Residencial Venezia</strong> \u2014 ARTE\u00c1 Empreendimentos</p><p>Loteamento Terra Firme, Bairro Areias, Tijucas/SC</p><p>www.arteaempreendimentos.com.br</p><p style="margin-top:8px">Proposta v\u00e1lida por 7 dias | Gerada em ${new Date().toLocaleDateString("pt-BR")} \u00e0s ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p></div>
<div class="actions"><button class="btn btn-print" onclick="window.print()">Imprimir / Salvar PDF</button>${telefone ? "<a class=\"btn btn-whats\" href=\"https://wa.me/55" + telefone.replace(/\D/g, "") + "?text=" + encodeURIComponent("Ol\u00e1 " + (comprador || "") + "! Segue sua proposta comercial do Residencial Venezia - Unidade " + unidade.numero + ". Valor: " + formatCurrency(valorBase) + ". Entrada: " + formatCurrency(valorEntrada) + " (" + (condicaoEntrada === "parcelada" ? numParcelas + "x de " + formatCurrency(valorParcelaEntrada) : "\u00c0 Vista") + "). Financiamento: " + formatCurrency(valorFinanciamento) + ". Qualquer d\u00favida estou \u00e0 disposi\u00e7\u00e3o!") + "\" target=\"_blank\">Enviar via WhatsApp</a>" : ""}</div>
</body></html>`;
  }, [unidade, comprador, cpf, telefone, imobiliaria, corretor, dataAssinatura, tipoValor, valorBase, valorEntrada, fgtsValue, valorFinanciamento, percentEntrada, percentFinanc, observacoes, parcelas, condicaoEntrada, numParcelas, valorParcelaEntrada]);

  // Enviar proposta por e-mail com link da proposta
  const enviarEmail = useCallback(() => {
    if (!unidade) return;
    if (!validarCamposProposta()) return;

    // Gerar proposta em nova aba (link compartilh\u00e1vel)
    const htmlProposta = gerarHtmlPropostaLink();
    const blob = new Blob([htmlProposta], { type: "text/html" });
    const propostaUrl = URL.createObjectURL(blob);
    const propostaWindow = window.open(propostaUrl, "_blank");
    
    if (!propostaWindow) {
      toast.error("Permita pop-ups para gerar o link da proposta.");
      return;
    }

    const dataFormatada = dataAssinatura
      ? new Date(dataAssinatura + "T12:00:00").toLocaleDateString("pt-BR")
      : new Date().toLocaleDateString("pt-BR");

    const assunto = encodeURIComponent(`Proposta Comercial - Residencial Venezia - Unidade ${unidade.numero}`);
    const corpo = encodeURIComponent(
`Prezado(a) ${comprador || "Cliente"},

Segue a proposta comercial referente \u00e0 Unidade ${unidade.numero} do Residencial Venezia.

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
RESUMO DA PROPOSTA COMERCIAL
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

\u25b8 Unidade: ${unidade.numero} | ${unidade.andar}\u00ba Andar | ${unidade.area} m\u00b2
\u25b8 Valor (${tipoValor === "com_doc" ? "Com Documenta\u00e7\u00e3o" : "Sem Documenta\u00e7\u00e3o"}): ${formatCurrency(valorBase)}

\u25b8 Entrada (${percentEntrada}%): ${formatCurrency(valorEntrada)}
  ${condicaoEntrada === "parcelada" ? `\u2192 Parcelada em ${numParcelas}x de ${formatCurrency(valorParcelaEntrada)}` : "\u2192 Pagamento \u00e0 vista"}
\u25b8 FGTS: ${formatCurrency(fgtsValue)}
\u25b8 Financiamento CEF (${percentFinanc.toFixed(0)}%): ${formatCurrency(valorFinanciamento)}

\u25b8 Parcelas CEF (9,49% a.a.):
  360 meses: ${formatCurrency(parcelas.p360)}/m\u00eas
  300 meses: ${formatCurrency(parcelas.p300)}/m\u00eas
  240 meses: ${formatCurrency(parcelas.p240)}/m\u00eas

${observacoes ? `\u25b8 Observa\u00e7\u00f5es: ${observacoes}\n\n` : ""}\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

\ud83d\udccb A proposta completa foi aberta em uma nova aba.
   Para anexar ao e-mail: Ctrl+P \u2192 "Salvar como PDF"

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

Imobili\u00e1ria: ${imobiliaria || "\u2014"}
Corretor: ${corretor || "\u2014"}
Data: ${dataFormatada}

Residencial Venezia \u2014 ARTE\u00c1 Empreendimentos
Loteamento Terra Firme, Bairro Areias, Tijucas/SC
www.arteaempreendimentos.com.br

\u26a0\ufe0f Proposta v\u00e1lida por 7 dias a partir da data de emiss\u00e3o.
`);
    
    setTimeout(() => {
      window.open(`mailto:?subject=${assunto}&body=${corpo}`, "_self");
      toast.success("Proposta aberta em nova aba + e-mail pronto para envio!");
    }, 600);
  }, [unidade, validarCamposProposta, comprador, tipoValor, valorBase, percentEntrada, valorEntrada, fgtsValue, valorFinanciamento, percentFinanc, imobiliaria, corretor, dataAssinatura, observacoes, parcelas, condicaoEntrada, numParcelas, valorParcelaEntrada, gerarHtmlPropostaLink]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unidade) return;

    if (!comprador.trim()) {
      toast.error("Preencha o nome do comprador");
      return;
    }
    if (!imobiliaria.trim() || !corretor.trim()) {
      toast.error("Preencha Imobiliária e Corretor");
      return;
    }

    const dados: DadosVenda = {
      comprador: comprador.trim(),
      cpf: cpf || undefined,
      telefone: telefone || undefined,
      imobiliaria: imobiliaria.trim(),
      corretor: corretor.trim(),
      dataAssinatura,
      valorSemDocumentacao: valorBase,
      valorFinanciamento,
      fgts: fgtsValue,
      entrada: valorEntrada,
      observacoes: observacoes.trim() || undefined,
    };

    onConfirm(dados);
    onOpenChange(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setComprador("");
      setCpf("");
      setTelefone("");
      setImobiliaria("");
      setCorretor("");
      setDataAssinatura("");
      setFgtsInput("");
      setFgtsValue(0);
      setObservacoes("");
      setTipoValor("com_doc");
      setPercentEntrada(20);
        setShowHistorico(false);
        setAceiteDigital(false);
        setCondicaoEntrada("parcelada");
        setNumParcelas(36);
    }
    onOpenChange(isOpen);
  };

  // Histórico de propostas desta unidade
  const historicoUnidade = useMemo(() => {
    if (!unidade) return [];
    return propostas.filter((p) => p.unidadeId === unidade.id);
  }, [propostas, unidade]);

  if (!unidade) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#1a1a2e] font-serif text-xl">
            <FileText size={20} className="text-[#c62828]" />
            Fechamento — Unidade {unidade.numero}
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-sm">
            Valores calculados automaticamente. Base: 20% entrada / 80% financiamento.
          </DialogDescription>
        </DialogHeader>

        {/* Toggle Histórico */}
        {historicoUnidade.length > 0 && (
          <button
            type="button"
            onClick={() => setShowHistorico(!showHistorico)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#c62828] transition-colors mb-2"
          >
            <History size={12} />
            {showHistorico ? "Ocultar" : "Ver"} histórico ({historicoUnidade.length} proposta{historicoUnidade.length > 1 ? "s" : ""})
          </button>
        )}

        {showHistorico && historicoUnidade.length > 0 && (
          <div className="mb-4 max-h-32 overflow-y-auto border border-gray-100 rounded-lg p-3 bg-gray-50">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2 font-medium">Propostas Emitidas</p>
            {historicoUnidade.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-xs font-medium text-[#1a1a2e]">{p.comprador || "Sem nome"}</p>
                  <p className="text-[10px] text-gray-400">{p.tipoValor} • {formatCurrency(p.valorBase)}</p>
                </div>
                <span className="text-[10px] text-gray-400">
                  {new Date(p.dataGeracao).toLocaleDateString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Comprador + CPF + Telefone */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <User size={12} className="text-[#c62828]" />
              Nome do Comprador *
            </label>
            <Input
              type="text"
              placeholder="Nome completo do comprador"
              value={comprador}
              onChange={(e) => setComprador(e.target.value)}
              className="h-10 text-sm"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">CPF</label>
              <Input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                className="h-10 text-sm"
                maxLength={14}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Telefone</label>
              <Input
                type="text"
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={(e) => setTelefone(formatPhone(e.target.value))}
                className="h-10 text-sm"
                maxLength={15}
              />
            </div>
          </div>

          {/* Imobiliária / Corretor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Imobiliária *</label>
              <Input
                type="text"
                placeholder="Nome da imobiliária"
                value={imobiliaria}
                onChange={(e) => setImobiliaria(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Corretor *</label>
              <Input
                type="text"
                placeholder="Nome do corretor"
                value={corretor}
                onChange={(e) => setCorretor(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
          </div>

          {/* Data da assinatura */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Data da Assinatura</label>
            <Input
              type="date"
              value={dataAssinatura}
              onChange={(e) => setDataAssinatura(e.target.value)}
              className="h-10 text-sm"
            />
          </div>

          {/* Seletor de Valor — com/sem documentação + FÓRMULA PRONTA */}
          <div className="bg-[#f8f7f4] border border-gray-200 p-4 rounded-lg">
            <label className="text-xs font-medium text-gray-700 mb-3 block">
              Valor do Imóvel — Selecione para calcular automaticamente
            </label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setTipoValor("sem_doc")}
                className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                  tipoValor === "sem_doc"
                    ? "border-[#c62828] bg-[#c62828]/5 ring-1 ring-[#c62828]/30"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Sem Documentação</p>
                <p className={`text-lg font-semibold ${tipoValor === "sem_doc" ? "text-[#c62828]" : "text-[#1a1a2e]"}`}>
                  {formatCurrency(unidade.valorVenda)}
                </p>
              </button>
              <button
                type="button"
                onClick={() => setTipoValor("com_doc")}
                className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                  tipoValor === "com_doc"
                    ? "border-[#c62828] bg-[#c62828]/5 ring-1 ring-[#c62828]/30"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Com Documentação (4%)</p>
                <p className={`text-lg font-semibold ${tipoValor === "com_doc" ? "text-[#c62828]" : "text-[#1a1a2e]"}`}>
                  {formatCurrency(unidade.valorComDocumentacao)}
                </p>
              </button>
            </div>

            {/* Fórmula pronta na tela — aparece automaticamente */}
            <div className="bg-white border border-gray-100 rounded-lg p-3 space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-2">Composição Automática</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Valor Base:</span>
                <span className="text-sm font-bold text-[#1a1a2e]">{formatCurrency(valorBase)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Entrada ({percentEntrada}%):</span>
                <span className="text-sm font-bold text-[#c62828]">
                  {condicaoEntrada === "parcelada" ? `${numParcelas}x de ${formatCurrency(valorParcelaEntrada)}` : formatCurrency(valorEntrada)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">FGTS:</span>
                <span className="text-sm font-medium text-[#1a1a2e]">{formatCurrency(fgtsValue)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-1.5">
                <span className="text-xs text-gray-600">Financiamento ({percentFinanc.toFixed(0)}%):</span>
                <span className="text-sm font-bold text-blue-700">{formatCurrency(valorFinanciamento)}</span>
              </div>
            </div>
          </div>

          {/* Entrada com Slider (mínimo 20%) */}
          <div className="bg-[#f8f7f4] border border-gray-200 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-700">Entrada (mín. 20%)</label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-[#c62828]">{percentEntrada}%</span>
                <span className="text-xs text-gray-400">= {formatCurrency(valorEntrada)}</span>
              </div>
            </div>
            <Slider
              value={[percentEntrada]}
              onValueChange={handleEntradaSlider}
              min={20}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-gray-400">20%</span>
              <button type="button" onClick={() => setPercentEntrada(20)} className="text-[10px] text-[#c62828] font-medium hover:underline">Reset 20%</button>
              <span className="text-[10px] text-gray-400">100%</span>
            </div>
          </div>

          {/* Condições de Pagamento da Entrada */}
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg">
            <label className="text-xs font-medium text-gray-700 mb-3 block">Condição de Pagamento da Entrada</label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setCondicaoEntrada("avista")}
                className={`p-2.5 rounded-lg border text-center transition-all duration-200 ${condicaoEntrada === "avista" ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30" : "border-gray-200 bg-white hover:border-gray-300"}`}
              >
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">À Vista</p>
                <p className={`text-sm font-semibold ${condicaoEntrada === "avista" ? "text-amber-700" : "text-[#1a1a2e]"}`}>{formatCurrency(valorEntrada)}</p>
              </button>
              <button
                type="button"
                onClick={() => setCondicaoEntrada("parcelada")}
                className={`p-2.5 rounded-lg border text-center transition-all duration-200 ${condicaoEntrada === "parcelada" ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30" : "border-gray-200 bg-white hover:border-gray-300"}`}
              >
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">Parcelada</p>
                <p className={`text-sm font-semibold ${condicaoEntrada === "parcelada" ? "text-amber-700" : "text-[#1a1a2e]"}`}>{numParcelas}x de {formatCurrency(valorParcelaEntrada)}</p>
              </button>
            </div>
            {condicaoEntrada === "parcelada" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Número de parcelas:</span>
                  <span className="text-sm font-bold text-amber-700">{numParcelas}x</span>
                </div>
                <Slider
                  value={[numParcelas]}
                  onValueChange={(v) => setNumParcelas(v[0])}
                  min={2}
                  max={36}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between">
                  <span className="text-[10px] text-gray-400">2x</span>
                  <div className="flex gap-2">
                    {[6, 12, 24, 36].map((n) => (
                      <button key={n} type="button" onClick={() => setNumParcelas(n)} className={`text-[10px] px-1.5 py-0.5 rounded ${numParcelas === n ? "bg-amber-200 text-amber-800 font-medium" : "text-gray-400 hover:text-amber-600"}`}>{n}x</button>
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400">36x</span>
                </div>
                <div className="bg-white border border-amber-100 rounded p-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Valor por parcela:</span>
                    <span className="text-sm font-bold text-amber-700">{formatCurrency(valorParcelaEntrada)}</span>
                  </div>
                  <p className="text-[9px] text-gray-400 mt-1">Parcelas durante a obra, sem juros. Sujeito à correção pelo INCC.</p>
                </div>
              </div>
            )}
          </div>

          {/* FGTS */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              FGTS
              <span className="text-gray-400 font-normal ml-1">(Deduz do financiamento automaticamente)</span>
            </label>
            <Input
              type="text"
              placeholder="R$ 0,00"
              value={fgtsInput}
              onChange={(e) => handleFgtsChange(e.target.value)}
              className="h-10 text-sm"
            />
          </div>

          {/* Simulação de Parcelas */}
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
            <p className="text-[10px] uppercase tracking-wider text-blue-600 font-medium mb-3">
              Simulação de Parcelas — CEF 9,49% a.a.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-[10px] text-gray-500 mb-1">360 meses</p>
                <p className="text-sm font-bold text-blue-700">{formatCurrency(parcelas.p360)}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-500 mb-1">300 meses</p>
                <p className="text-sm font-bold text-blue-700">{formatCurrency(parcelas.p300)}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-500 mb-1">240 meses</p>
                <p className="text-sm font-bold text-blue-700">{formatCurrency(parcelas.p240)}</p>
              </div>
            </div>
            <p className="text-[9px] text-gray-400 mt-2 text-center">
              Valores estimados — Tabela Price. Sujeito à análise de crédito.
            </p>
          </div>

          {/* Observações */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Observações / Condições Especiais
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Desconto concedido, condição diferenciada, permuta parcial..."
              className="w-full min-h-[60px] px-3 py-2 text-sm border border-gray-200 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-[#c62828]/20 focus:border-[#c62828]/50"
              rows={2}
            />
          </div>

          {/* Aceite Digital */}
          <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
            <button
              type="button"
              onClick={() => setAceiteDigital(!aceiteDigital)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                aceiteDigital ? "bg-emerald-600 border-emerald-600" : "border-gray-300 bg-white"
              }`}
            >
              {aceiteDigital && <CheckCircle2 size={14} className="text-white" />}
            </button>
            <div>
              <p className="text-xs font-medium text-emerald-800">Aceite Digital do Comprador</p>
              <p className="text-[10px] text-emerald-600">Marque para incluir declaração de aceite na proposta PDF</p>
            </div>
          </div>

          <DialogFooter className="gap-2 flex-wrap pt-2">
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={gerarPropostaPDF}
                className="flex-1 sm:flex-none px-3 py-2.5 text-xs font-medium text-[#1a1a2e] bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Download size={13} />
                PDF
              </button>
              <button
                type="button"
                onClick={enviarEmail}
                className="flex-1 sm:flex-none px-3 py-2.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <Mail size={13} />
                E-mail
              </button>
            </div>
            <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium text-white bg-[#c62828] rounded-lg hover:bg-[#b71c1c] transition-colors shadow-sm"
              >
                Confirmar Venda
              </button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
