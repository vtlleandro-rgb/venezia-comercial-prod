import { useState, useMemo } from "react";
import { useUnidadesStatus } from "@/hooks/useUnidadesStatus";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { UNIDADES, EMPREENDIMENTO, type Unidade, type UnidadeStatus } from "@/data/empreendimento";
import { BarChart3, TrendingUp, Target, DollarSign, Check, Lock, ShieldCheck, PieChart, Printer } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import type { DadosVenda } from "@/contexts/AuthContext";
import VendaModal from "@/components/VendaModal";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(value);

// Componente de Relatório Consolidado com gráfico
function RelatorioConsolidado({
  unidades,
  vgvVendido,
  vgvReservado,
  vgvDisponivel,
  vendidos,
  reservados,
  disponiveis,
}: {
  unidades: (typeof UNIDADES[0] & { status: UnidadeStatus })[];
  vgvVendido: number;
  vgvReservado: number;
  vgvDisponivel: number;
  vendidos: number;
  reservados: number;
  disponiveis: number;
}) {
  // Log e dadosVenda eram localStorage — removidos; dados no banco via tRPC
  const log: import("@/contexts/AuthContext").LogEntry[] = [];
  const dadosVenda: Record<string, import("@/contexts/AuthContext").DadosVenda> = {};

  // Dados por andar
  const dadosPorAndar = useMemo(() => {
    const andares = [1, 2, 3, 4];
    return andares.map((andar) => {
      const unidadesAndar = unidades.filter((u) => u.andar === andar);
      const vendidosAndar = unidadesAndar.filter((u) => u.status === "vendido").length;
      const reservadosAndar = unidadesAndar.filter((u) => u.status === "reservado").length;
      const disponiveisAndar = unidadesAndar.filter((u) => u.status === "disponivel").length;
      return {
        andar: `${andar}º Andar`,
        vendidos: vendidosAndar,
        reservados: reservadosAndar,
        disponiveis: disponiveisAndar,
        total: unidadesAndar.length,
      };
    });
  }, [unidades]);

  // Evolução temporal baseada no log
  const evolucaoVendas = useMemo(() => {
    const vendasPorData: Record<string, number> = {};
    log.forEach((entry) => {
      if (entry.statusNovo === "vendido") {
        const data = new Date(entry.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
        vendasPorData[data] = (vendasPorData[data] || 0) + 1;
      }
    });
    return Object.entries(vendasPorData)
      .map(([data, qtd]) => ({ data, vendas: qtd }))
      .reverse()
      .slice(-10); // últimos 10 registros
  }, [log]);

  // Relatório de vendas realizadas
  const vendasRealizadas = useMemo(() => {
    return unidades
      .filter((u) => u.status === "vendido")
      .map((u) => ({
        ...u,
        dados: dadosVenda[u.id],
      }));
  }, [unidades, dadosVenda]);

  const chartConfig = {
    vendidos: { label: "Vendidos", color: "#ef4444" },
    reservados: { label: "Reservados", color: "#f59e0b" },
    disponiveis: { label: "Disponíveis", color: "#10b981" },
  };

  return (
    <div className="mt-10 space-y-6">
      {/* Título */}
      <div className="flex items-center gap-3 mb-6">
        <PieChart size={20} className="text-[#c62828]" />
        <h3 className="font-serif text-xl text-white">Relatório Consolidado de Vendas</h3>
      </div>

      {/* Resumo Financeiro */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
        <h4 className="text-sm font-medium text-white/70 mb-4 uppercase tracking-wider">Resumo Financeiro</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/60 text-sm">VGV Total</span>
              <span className="text-white font-semibold">{formatCurrency(EMPREENDIMENTO.vgvTotal)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/60 text-sm">VGV Vendido</span>
              <span className="text-red-400 font-semibold">{formatCurrency(vgvVendido)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/60 text-sm">VGV Reservado</span>
              <span className="text-amber-400 font-semibold">{formatCurrency(vgvReservado)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-white/60 text-sm">VGV Disponível</span>
              <span className="text-emerald-400 font-semibold">{formatCurrency(vgvDisponivel)}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/60 text-sm">Ticket Médio</span>
              <span className="text-white font-semibold">{formatCurrency(EMPREENDIMENTO.ticketMedio)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/60 text-sm">Absorção (Vendas)</span>
              <span className="text-white font-semibold">{((vendidos / EMPREENDIMENTO.totalUnidades) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-white/60 text-sm">Absorção (Vendas + Reservas)</span>
              <span className="text-white font-semibold">{(((vendidos + reservados) / EMPREENDIMENTO.totalUnidades) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-white/60 text-sm">Unidades Restantes</span>
              <span className="text-white font-semibold">{disponiveis} de {EMPREENDIMENTO.totalUnidades}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparativo VGV sem Doc vs. com Doc */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
        <h4 className="text-sm font-medium text-white/70 mb-4 uppercase tracking-wider">Comparativo VGV — Sem Documentação vs. Com Documentação</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-center">
            <p className="text-white/50 text-xs mb-2 uppercase">VGV sem Documentação</p>
            <p className="text-2xl font-semibold text-white">{formatCurrency(EMPREENDIMENTO.vgvTotal)}</p>
            <p className="text-white/40 text-xs mt-1">Valor de venda das unidades</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-center">
            <p className="text-white/50 text-xs mb-2 uppercase">VGV com Documentação</p>
            <p className="text-2xl font-semibold text-[#c62828]">{formatCurrency(EMPREENDIMENTO.vgvComDocumentacao)}</p>
            <p className="text-white/40 text-xs mt-1">Valor com custos de documentação (4%)</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-center">
            <p className="text-white/50 text-xs mb-2 uppercase">Diferença (Documentação)</p>
            <p className="text-2xl font-semibold text-amber-400">{formatCurrency(EMPREENDIMENTO.vgvComDocumentacao - EMPREENDIMENTO.vgvTotal)}</p>
            <p className="text-white/40 text-xs mt-1">Receita adicional com documentação (4%)</p>
          </div>
        </div>
        <div className="mt-4 bg-white/5 border border-white/10 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-2 px-3 text-left text-white/50 font-medium">Andar</th>
                <th className="py-2 px-3 text-right text-white/50 font-medium">VGV sem Doc</th>
                <th className="py-2 px-3 text-right text-white/50 font-medium">VGV com Doc</th>
                <th className="py-2 px-3 text-right text-white/50 font-medium">Diferença</th>
                <th className="py-2 px-3 text-center text-white/50 font-medium">% Doc</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((andar) => {
                const unidadesAndar = unidades.filter((u) => u.andar === andar);
                const vgvSemDoc = unidadesAndar.reduce((s, u) => s + u.valorVenda, 0);
                const vgvComDoc = unidadesAndar.reduce((s, u) => s + u.valorComDocumentacao, 0);
                return (
                  <tr key={andar} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 px-3 text-white/70">{andar}º Andar</td>
                    <td className="py-2 px-3 text-right text-white/70">{formatCurrency(vgvSemDoc)}</td>
                    <td className="py-2 px-3 text-right text-white font-medium">{formatCurrency(vgvComDoc)}</td>
                    <td className="py-2 px-3 text-right text-amber-400">{formatCurrency(vgvComDoc - vgvSemDoc)}</td>
                    <td className="py-2 px-3 text-center text-white/50">4%</td>
                  </tr>
                );
              })}
              <tr className="bg-white/5 font-semibold">
                <td className="py-2 px-3 text-white">TOTAL</td>
                <td className="py-2 px-3 text-right text-white">{formatCurrency(EMPREENDIMENTO.vgvTotal)}</td>
                <td className="py-2 px-3 text-right text-[#c62828]">{formatCurrency(EMPREENDIMENTO.vgvComDocumentacao)}</td>
                <td className="py-2 px-3 text-right text-amber-400">{formatCurrency(EMPREENDIMENTO.vgvComDocumentacao - EMPREENDIMENTO.vgvTotal)}</td>
                <td className="py-2 px-3 text-center text-white/50">4%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfico por Andar */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
        <h4 className="text-sm font-medium text-white/70 mb-4 uppercase tracking-wider">Distribuição por Andar</h4>
        <div className="h-48">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart data={dadosPorAndar} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="andar" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="vendidos" fill="#ef4444" radius={[2, 2, 0, 0]} />
              <Bar dataKey="reservados" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              <Bar dataKey="disponiveis" fill="#10b981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-red-500" />
            <span className="text-white/60 text-xs">Vendidos</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-amber-500" />
            <span className="text-white/60 text-xs">Reservados</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span className="text-white/60 text-xs">Disponíveis</span>
          </div>
        </div>
      </div>

      {/* Evolução Temporal */}
      {evolucaoVendas.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
          <h4 className="text-sm font-medium text-white/70 mb-4 uppercase tracking-wider">Evolução de Vendas (Timeline)</h4>
          <div className="h-40">
            <ChartContainer config={{ vendas: { label: "Vendas", color: "#c62828" } }} className="h-full w-full">
              <BarChart data={evolucaoVendas}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="data" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="vendas" fill="#c62828" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
          <p className="text-white/30 text-xs mt-3 text-center">Baseado no histórico de alterações de status</p>
        </div>
      )}

      {/* Tabela de Vendas Realizadas */}
      {vendasRealizadas.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-lg overflow-x-auto">
          <h4 className="text-sm font-medium text-white/70 mb-4 uppercase tracking-wider">Vendas Realizadas — Detalhamento</h4>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-2 text-white/50 font-medium">Unidade</th>
                <th className="text-left py-2 px-2 text-white/50 font-medium">Comprador</th>
                <th className="text-left py-2 px-2 text-white/50 font-medium">Corretor</th>
                <th className="text-left py-2 px-2 text-white/50 font-medium">Imobiliária</th>
                <th className="text-right py-2 px-2 text-white/50 font-medium">Valor</th>
                <th className="text-right py-2 px-2 text-white/50 font-medium">Financ.</th>
                <th className="text-right py-2 px-2 text-white/50 font-medium">Entrada</th>
                <th className="text-center py-2 px-2 text-white/50 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {vendasRealizadas.map((v) => (
                <tr key={v.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2 px-2 text-white font-medium">{v.numero}</td>
                  <td className="py-2 px-2 text-white/70">{v.dados?.comprador || "—"}</td>
                  <td className="py-2 px-2 text-white/70">{v.dados?.corretor || "—"}</td>
                  <td className="py-2 px-2 text-white/70">{v.dados?.imobiliaria || "—"}</td>
                  <td className="py-2 px-2 text-white/70 text-right">{formatCurrency(v.valorVenda)}</td>
                  <td className="py-2 px-2 text-white/70 text-right">{v.dados ? formatCurrency(v.dados.valorFinanciamento) : "—"}</td>
                  <td className="py-2 px-2 text-white/70 text-right">{v.dados ? formatCurrency(v.dados.entrada) : "—"}</td>
                  <td className="py-2 px-2 text-white/50 text-center">{v.dados?.dataAssinatura || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function DashboardSection() {
  const { ref, isVisible } = useScrollAnimation();
  const { canManage } = useAuth();
  const registrarVendaMutation = trpc.vendas.registrar.useMutation();
  const [editando, setEditando] = useState<string | null>(null);

  // Estado sincronizado entre módulos
  const { unidadesStatus, updateStatus } = useUnidadesStatus();

  // Modal de venda
  const [showVendaModal, setShowVendaModal] = useState(false);
  const [vendaUnidade, setVendaUnidade] = useState<Unidade | null>(null);
  const [vendaPendingId, setVendaPendingId] = useState<string | null>(null);

  const unidades = useMemo(
    () => UNIDADES.map((u) => ({ ...u, status: unidadesStatus[u.id] || u.status })),
    [unidadesStatus]
  );

  const disponiveis = unidades.filter((u) => u.status === "disponivel").length;
  const reservados = unidades.filter((u) => u.status === "reservado").length;
  const vendidos = unidades.filter((u) => u.status === "vendido").length;

  const vgvDisponivel = unidades.filter((u) => u.status === "disponivel")
    .reduce((sum, u) => sum + u.valorVenda, 0);
  const vgvVendido = unidades.filter((u) => u.status === "vendido")
    .reduce((sum, u) => sum + u.valorVenda, 0);
  const vgvReservado = unidades.filter((u) => u.status === "reservado")
    .reduce((sum, u) => sum + u.valorVenda, 0);

  const percentVendido = ((vendidos / EMPREENDIMENTO.totalUnidades) * 100).toFixed(0);
  const percentReservado = ((reservados / EMPREENDIMENTO.totalUnidades) * 100).toFixed(0);

  // Função de impressão do espelho de vendas
  const imprimirEspelho = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Espelho de Vendas - Residencial Venezia</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: white; color: #1a1a2e; }
  .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #c62828; padding-bottom: 15px; }
  .header h1 { font-size: 24px; color: #1a1a2e; margin-bottom: 5px; }
  .header p { font-size: 12px; color: #666; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 25px; }
  .kpi { border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; text-align: center; }
  .kpi .value { font-size: 18px; font-weight: 700; color: #1a1a2e; }
  .kpi .label { font-size: 10px; color: #666; margin-top: 3px; }
  .espelho { margin-bottom: 25px; }
  .andar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .andar-label { width: 60px; text-align: right; font-size: 11px; font-weight: 600; color: #666; }
  .units { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; flex: 1; }
  .unit { padding: 10px; border-radius: 6px; text-align: center; border: 1px solid; }
  .unit.disponivel { background: #ecfdf5; border-color: #6ee7b7; }
  .unit.reservado { background: #fffbeb; border-color: #fbbf24; }
  .unit.vendido { background: #fef2f2; border-color: #fca5a5; }
  .unit .numero { font-size: 13px; font-weight: 700; }
  .unit .info { font-size: 9px; color: #666; margin-top: 2px; }
  .unit .status { font-size: 8px; text-transform: uppercase; font-weight: 600; margin-top: 4px; letter-spacing: 0.5px; }
  .unit.disponivel .status { color: #059669; }
  .unit.reservado .status { color: #d97706; }
  .unit.vendido .status { color: #dc2626; }
  .legend { display: flex; gap: 20px; justify-content: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb; }
  .legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #666; }
  .legend-dot { width: 12px; height: 12px; border-radius: 3px; }
  .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #999; }
  @media print { body { padding: 10px; } .kpis { gap: 5px; } }
</style></head><body>
<div class="header">
  <h1>Residencial Venezia — Espelho de Vendas</h1>
  <p>SPE-VENEZIA EMPREENDIMENTOS IMOBILIARIOS LTDA | Loteamento Terra Firme, Bairro Areias, Tijucas/SC</p>
  <p style="margin-top:5px;">Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
</div>
<div class="kpis">
  <div class="kpi"><div class="value">${formatCurrency(EMPREENDIMENTO.vgvTotal)}</div><div class="label">VGV Total</div></div>
  <div class="kpi"><div class="value">${disponiveis}</div><div class="label">Disponíveis</div></div>
  <div class="kpi"><div class="value">${reservados}</div><div class="label">Reservados</div></div>
  <div class="kpi"><div class="value">${vendidos}</div><div class="label">Vendidos</div></div>
</div>
<div class="espelho">
${[4, 3, 2, 1].map((andar) => {
  const unidadesAndar = unidades.filter((u) => u.andar === andar);
  if (unidadesAndar.length === 0) return "";
  return `<div class="andar-row"><div class="andar-label">${andar}º Andar</div><div class="units">${unidadesAndar.map((u) => `<div class="unit ${u.status}"><div class="numero">${u.numero}</div><div class="info">${u.area.toFixed(2).replace('.', ',')}m² • ${formatCurrency(u.valorVenda)}</div><div class="info">c/ Doc: ${formatCurrency(u.valorComDocumentacao)}</div><div class="status">${u.status === "disponivel" ? "Disponível" : u.status === "reservado" ? "Reservado" : "Vendido"}</div></div>`).join("")}</div></div>`;
}).join("")}
</div>
<div class="legend">
  <div class="legend-item"><div class="legend-dot" style="background:#6ee7b7;"></div>Disponível (${disponiveis})</div>
  <div class="legend-item"><div class="legend-dot" style="background:#fbbf24;"></div>Reservado (${reservados})</div>
  <div class="legend-item"><div class="legend-dot" style="background:#fca5a5;"></div>Vendido (${vendidos})</div>
</div>
<div class="footer">
  <p>Residencial Venezia — SPE-VENEZIA EMPREENDIMENTOS IMOBILIARIOS LTDA | VGV Vendido: ${formatCurrency(vgvVendido)} | VGV Reservado: ${formatCurrency(vgvReservado)} | VGV Disponível: ${formatCurrency(vgvDisponivel)}</p>
</div>
</body></html>`;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 400);
      toast.success("Espelho de vendas pronto para impressão!");
    } else {
      toast.error("Bloqueador de pop-ups ativo. Permita pop-ups para imprimir.");
    }
  };

  const executeStatusChange = (id: string, novoStatus: UnidadeStatus) => {
    // Se vai para vendido, abrir modal de venda
    if (novoStatus === "vendido") {
      const unidade = unidades.find((u) => u.id === id);
      setVendaUnidade(unidade || null);
      setVendaPendingId(id);
      setShowVendaModal(true);
      setEditando(null);
      return;
    }

    const unidade = UNIDADES.find((u) => u.id === id);
    const statusLabel = novoStatus === "disponivel" ? "Disponível" : novoStatus === "reservado" ? "Reservado" : "Vendido";
    updateStatus(id, novoStatus);
    setEditando(null);
    toast.success(`Unidade ${unidade?.numero} alterada para ${statusLabel}`);
  };

  const handleVendaConfirm = (dados: DadosVenda) => {
    if (vendaPendingId) {
      const unidade = UNIDADES.find((u) => u.id === vendaPendingId);
      registrarVendaMutation.mutate({
        unidadeId: vendaPendingId,
        comprador: dados.comprador,
        cpf: dados.cpf,
        telefone: dados.telefone,
        imobiliaria: dados.imobiliaria,
        corretor: dados.corretor,
        dataAssinatura: dados.dataAssinatura,
        valorSemDocumentacao: dados.valorSemDocumentacao,
        valorFinanciamento: dados.valorFinanciamento,
        fgts: dados.fgts,
        entrada: dados.entrada,
        observacoes: dados.observacoes,
      });
      updateStatus(vendaPendingId, "vendido");
      toast.success(`Unidade ${unidade?.numero} — Venda registrada com sucesso!`);
      setVendaPendingId(null);
      setVendaUnidade(null);
    }
  };

  const alterarStatus = (id: string, novoStatus: UnidadeStatus) => {
    if (canManage) {
      executeStatusChange(id, novoStatus);
    }
  };

  const handleUnitClick = (id: string) => {
    if (canManage) {
      setEditando(editando === id ? null : id);
    }
  };

  return (
    <section id="dashboard" className="py-24 bg-[#1a1a2e] text-white">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto px-6 section-fade-in ${isVisible ? "visible" : ""}`}
      >
        <div className="text-center mb-12">
          <p className="text-[#c62828] text-sm font-medium uppercase tracking-widest mb-3">
            Indicadores
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-white mb-4">
            Dashboard Executivo
          </h2>
          <div className="italian-divider mx-auto mb-6" />
        </div>

        {/* Tela de bloqueio — visível apenas para visitantes e corretores sem permissão */}
        {!canManage && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 mb-6">
              <Lock size={32} className="text-white/40" />
            </div>
            <h3 className="font-serif text-2xl text-white mb-3">Área Restrita</h3>
            <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">
              O Dashboard Executivo é uma área restrita. Faça login como administrador ou gerente para acessar os indicadores e espelho de vendas.
            </p>
            <a
              href="/login"
              className="inline-block px-6 py-3 bg-[#c62828] text-white text-sm font-medium rounded-lg hover:bg-[#b71c1c] transition-colors shadow-lg"
            >
              Fazer Login
            </a>
          </div>
        )}

        {canManage && (
          <>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-lg">
            <DollarSign size={20} className="text-[#c62828] mb-2" />
            <p className="text-2xl md:text-3xl font-semibold">{formatCurrency(EMPREENDIMENTO.vgvTotal)}</p>
            <p className="text-white/50 text-xs mt-1">VGV Total</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-lg">
            <Target size={20} className="text-emerald-400 mb-2" />
            <p className="text-2xl md:text-3xl font-semibold">{formatCurrency(vgvDisponivel)}</p>
            <p className="text-white/50 text-xs mt-1">VGV Disponível</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-lg">
            <BarChart3 size={20} className="text-blue-400 mb-2" />
            <p className="text-2xl md:text-3xl font-semibold">{formatCurrency(EMPREENDIMENTO.ticketMedio)}</p>
            <p className="text-white/50 text-xs mt-1">Ticket Médio</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-lg">
            <TrendingUp size={20} className="text-amber-400 mb-2" />
            <p className="text-2xl md:text-3xl font-semibold">R$ {EMPREENDIMENTO.precoM2Min} - {EMPREENDIMENTO.precoM2Max}</p>
            <p className="text-white/50 text-xs mt-1">R$/m² (range)</p>
          </div>
        </div>

        {/* Visual Espelho de Vendas */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-xl">Espelho de Vendas</h3>
            <p className="text-white/40 text-xs flex items-center gap-1.5">
              {canManage ? (
                <>
                  <ShieldCheck size={12} className="text-emerald-400" />
                  <span className="text-emerald-400/70">Acesso liberado — clique para alterar</span>
                </>
              ) : (
                <>
                  <Lock size={12} />
                  <span>Requer senha para alterar status</span>
                </>
              )}
            </p>
          </div>
          
          <div className="space-y-3">
            {[4, 3, 2, 1].map((andar) => {
              const unidadesAndar = unidades.filter((u) => u.andar === andar);
              if (unidadesAndar.length === 0) return null;
              return (
                <div key={andar} className="flex items-center gap-3">
                  <span className="text-white/50 text-sm w-16 text-right">
                    {`${andar}º And.`}
                  </span>
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    {unidadesAndar.map((u) => (
                      <div key={u.id} className="relative">
                        <div
                          onClick={() => handleUnitClick(u.id)}
                          className={`p-3 rounded text-center text-xs font-medium transition-all cursor-pointer hover:scale-[1.02] ${
                            u.status === "disponivel"
                              ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                              : u.status === "reservado"
                              ? "bg-amber-500/20 border border-amber-500/40 text-amber-300"
                              : "bg-red-500/20 border border-red-500/40 text-red-300"
                          }`}
                        >
                          <p className="font-semibold">{u.numero}</p>
                          <p className="text-[10px] opacity-70">{u.area.toFixed(2).replace('.', ',')}m² • {formatCurrency(u.valorVenda)}</p>
                          <p className="text-[9px] opacity-50">c/ Doc: {formatCurrency(u.valorComDocumentacao)}</p>
                          <p className="text-[9px] uppercase mt-1 opacity-60 flex items-center justify-center gap-1">
                            {u.status === "disponivel" ? "Disponível" : u.status === "reservado" ? "Reservado" : "Vendido"}
                            {!canManage && <Lock size={8} className="opacity-50" />}
                          </p>
                        </div>

                        {/* Menu de status - só aparece se autenticado */}
                        {editando === u.id && canManage && (
                          <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-[#2a2a4e] border border-white/20 rounded-lg shadow-xl overflow-hidden">
                            <button
                              onClick={() => alterarStatus(u.id, "disponivel")}
                              className={`w-full px-3 py-2 text-xs text-left flex items-center gap-2 hover:bg-white/10 transition-colors ${u.status === "disponivel" ? "text-emerald-300" : "text-white/70"}`}
                            >
                              {u.status === "disponivel" && <Check size={12} />}
                              <span>Disponível</span>
                            </button>
                            <button
                              onClick={() => alterarStatus(u.id, "reservado")}
                              className={`w-full px-3 py-2 text-xs text-left flex items-center gap-2 hover:bg-white/10 transition-colors ${u.status === "reservado" ? "text-amber-300" : "text-white/70"}`}
                            >
                              {u.status === "reservado" && <Check size={12} />}
                              <span>Reservado</span>
                            </button>
                            <button
                              onClick={() => alterarStatus(u.id, "vendido")}
                              className={`w-full px-3 py-2 text-xs text-left flex items-center gap-2 hover:bg-white/10 transition-colors ${u.status === "vendido" ? "text-red-300" : "text-white/70"}`}
                            >
                              {u.status === "vendido" && <Check size={12} />}
                              <span>Vendido</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botão Imprimir Espelho */}
          <div className="flex justify-end mt-4">
            <button
              onClick={() => imprimirEspelho()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white/70 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
            >
              <Printer size={14} />
              Imprimir Espelho
            </button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-6 mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-emerald-500/40" />
              <span className="text-white/60 text-xs">Disponível ({disponiveis})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-amber-500/40" />
              <span className="text-white/60 text-xs">Reservado ({reservados})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-red-500/40" />
              <span className="text-white/60 text-xs">Vendido ({vendidos})</span>
            </div>
            <div className="ml-auto text-white/30 text-xs">
              VGV Vendido: {formatCurrency(vgvVendido)} | Reservado: {formatCurrency(vgvReservado)}
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/5 border border-white/10 p-5 rounded-lg text-center">
            <p className="text-3xl font-semibold text-emerald-400">{percentVendido}%</p>
            <p className="text-white/50 text-xs mt-1">Vendas Realizadas</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 rounded-lg text-center">
            <p className="text-3xl font-semibold text-amber-400">{percentReservado}%</p>
            <p className="text-white/50 text-xs mt-1">Reservas Ativas</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 rounded-lg text-center">
            <p className="text-3xl font-semibold text-white">{disponiveis}</p>
            <p className="text-white/50 text-xs mt-1">Unidades Disponíveis</p>
          </div>
        </div>

        {/* Relatório Consolidado de Vendas */}
        <RelatorioConsolidado
          unidades={unidades}
          vgvVendido={vgvVendido}
          vgvReservado={vgvReservado}
          vgvDisponivel={vgvDisponivel}
          vendidos={vendidos}
          reservados={reservados}
          disponiveis={disponiveis}
        />
          </>
        )}
      </div>

      {/* Venda Modal */}
      <VendaModal
        open={showVendaModal}
        onOpenChange={setShowVendaModal}
        unidade={vendaUnidade}
        onConfirm={handleVendaConfirm}
      />
    </section>
  );
}
