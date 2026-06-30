import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth, type LogEntry, type PropostaRegistro } from "@/contexts/AuthContext";
import { Settings, Key, History, Eye, EyeOff, Check, AlertCircle, Download, FileSpreadsheet, FileText, Trophy, Users, Filter } from "lucide-react";
import { toast } from "sonner";

interface AdminPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(value);

const statusLabel = (status: string) => {
  switch (status) {
    case "disponivel": return "Disponível";
    case "reservado": return "Reservado";
    case "vendido": return "Vendido";
    default: return status;
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case "disponivel": return "text-emerald-600";
    case "reservado": return "text-amber-600";
    case "vendido": return "text-red-600";
    default: return "text-gray-600";
  }
};

// Exportar log como CSV
const exportarCSV = (log: LogEntry[]) => {
  if (log.length === 0) { toast.error("Nenhum registro para exportar."); return; }
  const header = "Data;Unidade;Status Anterior;Status Novo;Detalhes;Usuário";
  const rows = log.map((entry) => {
    const data = formatDate(entry.data);
    const detalhes = (entry.detalhes || "").replace(/;/g, ",");
    return `${data};${entry.unidade};${statusLabel(entry.statusAnterior)};${statusLabel(entry.statusNovo)};${detalhes};${entry.usuario || "—"}`;
  });
  const csvContent = "\uFEFF" + [header, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `venezia_log_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success("CSV exportado!");
};

// Exportar log como PDF
const exportarPDF = (log: LogEntry[]) => {
  if (log.length === 0) { toast.error("Nenhum registro para exportar."); return; }
  const rows = log.map((entry) => `<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:11px;">${formatDate(entry.data)}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:11px;font-weight:600;">${entry.unidade}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:11px;">${statusLabel(entry.statusAnterior)}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:11px;">${statusLabel(entry.statusNovo)}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:11px;">${entry.detalhes || "—"}</td></tr>`).join("");
  const html = `<!DOCTYPE html><html><head><title>Log de Alterações</title><style>body{font-family:'Segoe UI',sans-serif;padding:40px;color:#1a1a2e}h1{font-size:20px;margin-bottom:4px}.sub{color:#666;font-size:12px;margin-bottom:24px}table{width:100%;border-collapse:collapse}th{background:#1a1a2e;color:white;padding:8px;font-size:11px;text-align:left}.ft{margin-top:30px;font-size:10px;color:#999;border-top:1px solid #eee;padding-top:10px}</style></head><body><h1>Residencial Venezia — Log de Alterações</h1><p class="sub">Gerado em ${new Date().toLocaleDateString("pt-BR")} | ${log.length} registro(s)</p><table><thead><tr><th>Data</th><th>Unidade</th><th>De</th><th>Para</th><th>Detalhes</th></tr></thead><tbody>${rows}</tbody></table><div class="ft">SPE-VENEZIA EMPREENDIMENTOS IMOBILIARIOS LTDA — Tijucas/SC</div></body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); toast.success("PDF pronto!"); }
};

export default function AdminPanel({ open, onOpenChange }: AdminPanelProps) {
  const { alterarSenha, log, propostas } = useAuth();
  const [tab, setTab] = useState<"log" | "propostas" | "performance" | "senha">("log");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [senhaConfirm, setSenhaConfirm] = useState("");
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showSenhaNova, setShowSenhaNova] = useState(false);
  const [erro, setErro] = useState("");
  const [filtroCorretor, setFiltroCorretor] = useState("");
  const [filtroData, setFiltroData] = useState("");

  // Propostas filtradas
  const propostasFiltradas = useMemo(() => {
    let result = propostas;
    if (filtroCorretor) {
      const term = filtroCorretor.toLowerCase();
      result = result.filter((p) =>
        p.corretor.toLowerCase().includes(term) ||
        p.imobiliaria.toLowerCase().includes(term)
      );
    }
    if (filtroData) {
      result = result.filter((p) => p.dataGeracao.startsWith(filtroData));
    }
    return result;
  }, [propostas, filtroCorretor, filtroData]);

  // Performance por corretor/imobiliária
  const performanceData = useMemo(() => {
    const corretorMap: Record<string, { propostas: number; vendas: number; vgv: number; imobiliaria: string }> = {};

    // Contar propostas por corretor
    propostas.forEach((p) => {
      const key = p.corretor || "Sem corretor";
      if (!corretorMap[key]) {
        corretorMap[key] = { propostas: 0, vendas: 0, vgv: 0, imobiliaria: p.imobiliaria || "—" };
      }
      corretorMap[key].propostas += 1;
    });

    // Contar vendas por corretor (do log)
    log.forEach((entry) => {
      if (entry.statusNovo === "vendido" && entry.detalhes) {
        const corretorMatch = entry.detalhes.match(/Corretor:\s*([^|]+)/);
        if (corretorMatch) {
          const key = corretorMatch[1].trim();
          if (!corretorMap[key]) {
            const imobMatch = entry.detalhes.match(/Imobiliária:\s*([^|]+)/);
            corretorMap[key] = { propostas: 0, vendas: 0, vgv: 0, imobiliaria: imobMatch ? imobMatch[1].trim() : "—" };
          }
          corretorMap[key].vendas += 1;
        }
      }
    });

    // Calcular VGV por corretor (das propostas que viraram venda)
    propostas.forEach((p) => {
      const key = p.corretor || "Sem corretor";
      // Verificar se essa unidade foi vendida
      const vendida = log.some((l) => l.statusNovo === "vendido" && l.unidade === p.unidadeNumero);
      if (vendida && corretorMap[key]) {
        corretorMap[key].vgv += p.valorBase;
      }
    });

    return Object.entries(corretorMap)
      .map(([corretor, data]) => ({ corretor, ...data }))
      .sort((a, b) => b.vendas - a.vendas || b.propostas - a.propostas);
  }, [propostas, log]);

  // Estatísticas gerais
  const stats = useMemo(() => {
    const totalPropostas = propostas.length;
    const totalVendas = log.filter((l) => l.statusNovo === "vendido").length;
    const totalReservas = log.filter((l) => l.statusNovo === "reservado").length;
    const vgvTotal = propostas.reduce((acc, p) => {
      const vendida = log.some((l) => l.statusNovo === "vendido" && l.unidade === p.unidadeNumero);
      return vendida ? acc + p.valorBase : acc;
    }, 0);
    return { totalPropostas, totalVendas, totalReservas, vgvTotal };
  }, [propostas, log]);

  const handleAlterarSenha = (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    if (senhaNova.length < 4) { setErro("A nova senha deve ter pelo menos 4 caracteres."); return; }
    if (senhaNova !== senhaConfirm) { setErro("As senhas não coincidem."); return; }
    const sucesso = alterarSenha(senhaAtual, senhaNova);
    if (sucesso) {
      toast.success("Senha alterada com sucesso!");
      setSenhaAtual(""); setSenhaNova(""); setSenhaConfirm("");
    } else { setErro("Senha atual incorreta."); }
  };

  // Exportar propostas como CSV
  const exportarPropostasCSV = () => {
    if (propostasFiltradas.length === 0) { toast.error("Nenhuma proposta para exportar."); return; }
    const header = "Data;Unidade;Comprador;CPF;Telefone;Imobiliária;Corretor;Tipo Valor;Valor Base;Entrada;Financiamento;FGTS";
    const rows = propostasFiltradas.map((p) =>
      `${formatDate(p.dataGeracao)};${p.unidadeNumero};${p.comprador};${p.cpf || "—"};${p.telefone || "—"};${p.imobiliaria};${p.corretor};${p.tipoValor};${p.valorBase};${p.entrada};${p.financiamento};${p.fgts}`
    );
    const csvContent = "\uFEFF" + [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `venezia_propostas_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Propostas exportadas!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl bg-white max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#1a1a2e] font-serif text-xl">
            <Settings size={20} className="text-[#c62828]" />
            Painel Administrativo
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-sm">
            Gerencie propostas, histórico, performance e configurações.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mt-2 overflow-x-auto">
          <button
            onClick={() => setTab("log")}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === "log" ? "border-[#c62828] text-[#c62828]" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <History size={13} />
            Histórico
          </button>
          <button
            onClick={() => setTab("propostas")}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === "propostas" ? "border-[#c62828] text-[#c62828]" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText size={13} />
            Propostas ({propostas.length})
          </button>
          <button
            onClick={() => setTab("performance")}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === "performance" ? "border-[#c62828] text-[#c62828]" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Trophy size={13} />
            Performance
          </button>
          <button
            onClick={() => setTab("senha")}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === "senha" ? "border-[#c62828] text-[#c62828]" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Key size={13} />
            Senha
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto mt-4">
          {/* === HISTÓRICO === */}
          {tab === "log" && (
            <div className="space-y-2">
              {log.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <History size={40} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Nenhuma alteração registrada ainda.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-400">{log.length} registro(s)</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => exportarCSV(log)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                        <FileSpreadsheet size={12} /> CSV
                      </button>
                      <button onClick={() => exportarPDF(log)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#c62828] rounded-md hover:bg-[#b71c1c] transition-colors">
                        <Download size={12} /> PDF
                      </button>
                    </div>
                  </div>
                  {log.map((entry: LogEntry) => {
                    const tipoIcon = entry.tipo === "cancelamento" ? "❌" : entry.tipo === "venda" ? "✅" : entry.tipo === "reserva" ? "🟡" : entry.tipo === "distrato" ? "⚠️" : "🔄";
                    const tipoBg = entry.tipo === "cancelamento" ? "bg-red-50 border-red-100" : entry.tipo === "venda" ? "bg-emerald-50 border-emerald-100" : entry.tipo === "reserva" ? "bg-amber-50 border-amber-100" : "bg-gray-50 border-gray-100";
                    return (
                    <div key={entry.id} className={`flex items-start gap-3 p-3 rounded-lg border ${tipoBg}`}>
                      <div className="w-8 h-8 rounded-full bg-[#1a1a2e]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-[#1a1a2e]">{entry.unidade}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs">{tipoIcon}</span>
                          {entry.tipo && <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500 bg-white/80 px-1.5 py-0.5 rounded">{entry.tipo}</span>}
                          <span className={`text-xs font-medium ${statusColor(entry.statusAnterior)}`}>{statusLabel(entry.statusAnterior)}</span>
                          <span className="text-gray-300">→</span>
                          <span className={`text-xs font-medium ${statusColor(entry.statusNovo)}`}>{statusLabel(entry.statusNovo)}</span>
                        </div>
                        {entry.motivo && <p className="text-xs text-red-600 mt-0.5"><strong>Motivo:</strong> {entry.motivo}</p>}
                        {entry.detalhes && <p className="text-xs text-gray-500 mt-0.5">{entry.detalhes}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-400">{formatDate(entry.data)}</span>
                          {entry.usuario && <span className="text-[10px] text-gray-400">• {entry.usuario}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                </>
              )}
            </div>
          )}

          {/* === PROPOSTAS EMITIDAS === */}
          {tab === "propostas" && (
            <div className="space-y-3">
              {/* Filtros */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
                  <Filter size={12} className="text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Filtrar por corretor ou imobiliária..."
                    value={filtroCorretor}
                    onChange={(e) => setFiltroCorretor(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <Input
                  type="date"
                  value={filtroData}
                  onChange={(e) => setFiltroData(e.target.value)}
                  className="h-8 text-xs w-36"
                />
                <button onClick={exportarPropostasCSV} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                  <FileSpreadsheet size={12} /> Exportar
                </button>
              </div>

              {propostasFiltradas.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FileText size={40} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Nenhuma proposta emitida{filtroCorretor || filtroData ? " com este filtro" : ""}.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">{propostasFiltradas.length} proposta(s)</p>
                  {propostasFiltradas.map((p: PropostaRegistro) => (
                    <div key={p.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#1a1a2e] bg-[#1a1a2e]/10 px-2 py-0.5 rounded">
                            Unid. {p.unidadeNumero}
                          </span>
                          <span className="text-xs font-medium text-[#1a1a2e]">{p.comprador || "Sem nome"}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">{formatDate(p.dataGeracao)}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div>
                          <span className="text-gray-400">Corretor:</span>
                          <p className="font-medium text-[#1a1a2e]">{p.corretor || "—"}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Imobiliária:</span>
                          <p className="font-medium text-[#1a1a2e]">{p.imobiliaria || "—"}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Valor ({p.tipoValor}):</span>
                          <p className="font-medium text-[#c62828]">{formatCurrency(p.valorBase)}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Entrada:</span>
                          <p className="font-medium text-[#1a1a2e]">{formatCurrency(p.entrada)}</p>
                        </div>
                      </div>
                      {p.cpf && <p className="text-[10px] text-gray-400 mt-1">CPF: {p.cpf} | Tel: {p.telefone || "—"}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* === PERFORMANCE === */}
          {tab === "performance" && (
            <div className="space-y-4">
              {/* KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#f8f7f4] p-3 rounded-lg border border-gray-100 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Propostas</p>
                  <p className="text-2xl font-bold text-[#1a1a2e]">{stats.totalPropostas}</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-600 mb-1">Vendas</p>
                  <p className="text-2xl font-bold text-emerald-700">{stats.totalVendas}</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-amber-600 mb-1">Reservas</p>
                  <p className="text-2xl font-bold text-amber-700">{stats.totalReservas}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-blue-600 mb-1">VGV Vendido</p>
                  <p className="text-lg font-bold text-blue-700">{formatCurrency(stats.vgvTotal)}</p>
                </div>
              </div>

              {/* Ranking de Corretores */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users size={14} className="text-[#c62828]" />
                  <h3 className="text-sm font-semibold text-[#1a1a2e]">Ranking de Corretores / Imobiliárias</h3>
                </div>

                {performanceData.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Trophy size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs">Nenhum dado de performance ainda.</p>
                    <p className="text-[10px] mt-1">Os dados aparecerão conforme propostas forem geradas.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {performanceData.map((item, index) => (
                      <div key={item.corretor} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                          index === 0 ? "bg-yellow-100 text-yellow-700" :
                          index === 1 ? "bg-gray-200 text-gray-600" :
                          index === 2 ? "bg-orange-100 text-orange-700" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {index + 1}º
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1a1a2e] truncate">{item.corretor}</p>
                          <p className="text-[10px] text-gray-400">{item.imobiliaria}</p>
                        </div>
                        <div className="flex items-center gap-4 text-center">
                          <div>
                            <p className="text-xs font-bold text-[#1a1a2e]">{item.propostas}</p>
                            <p className="text-[9px] text-gray-400">Propostas</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-emerald-600">{item.vendas}</p>
                            <p className="text-[9px] text-gray-400">Vendas</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-blue-600">{item.vgv > 0 ? formatCurrency(item.vgv) : "—"}</p>
                            <p className="text-[9px] text-gray-400">VGV</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#c62828]">
                              {item.propostas > 0 ? `${Math.round((item.vendas / item.propostas) * 100)}%` : "—"}
                            </p>
                            <p className="text-[9px] text-gray-400">Conversão</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* === ALTERAR SENHA === */}
          {tab === "senha" && (
            <form onSubmit={handleAlterarSenha} className="space-y-4 max-w-sm">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Senha Atual</label>
                <div className="relative">
                  <Input
                    type={showSenhaAtual ? "text" : "password"}
                    placeholder="Digite a senha atual"
                    value={senhaAtual}
                    onChange={(e) => { setSenhaAtual(e.target.value); setErro(""); }}
                    className="h-10 text-sm pr-10"
                  />
                  <button type="button" onClick={() => setShowSenhaAtual(!showSenhaAtual)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showSenhaAtual ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Nova Senha</label>
                <div className="relative">
                  <Input
                    type={showSenhaNova ? "text" : "password"}
                    placeholder="Mínimo 4 caracteres"
                    value={senhaNova}
                    onChange={(e) => { setSenhaNova(e.target.value); setErro(""); }}
                    className="h-10 text-sm pr-10"
                  />
                  <button type="button" onClick={() => setShowSenhaNova(!showSenhaNova)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showSenhaNova ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Confirmar Nova Senha</label>
                <Input
                  type="password"
                  placeholder="Repita a nova senha"
                  value={senhaConfirm}
                  onChange={(e) => { setSenhaConfirm(e.target.value); setErro(""); }}
                  className="h-10 text-sm"
                />
              </div>
              {erro && <div className="flex items-center gap-2 text-red-600 text-sm"><AlertCircle size={14} />{erro}</div>}
              {senhaNova && senhaConfirm && senhaNova === senhaConfirm && (
                <div className="flex items-center gap-2 text-emerald-600 text-xs"><Check size={14} />Senhas coincidem</div>
              )}
              <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-[#c62828] rounded-lg hover:bg-[#b71c1c] transition-colors shadow-sm">
                Alterar Senha
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
