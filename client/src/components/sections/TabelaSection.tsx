import { useState, useMemo, useCallback, useEffect } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { UNIDADES, EMPREENDIMENTO, CONDICOES_COMERCIAIS, type UnidadeStatus, type Unidade } from "@/data/empreendimento";
import { ArrowUpDown, Filter, CheckCircle2, Clock, XCircle, Lock, ShieldCheck, Settings } from "lucide-react";
import { useAuth, type DadosVenda } from "@/contexts/AuthContext";
import PasswordModal from "@/components/PasswordModal";
import VendaModal from "@/components/VendaModal";
import AdminPanel from "@/components/AdminPanel";
import { toast } from "sonner";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(value);

const formatCurrencyDecimal = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }).format(value);

const statusColors: Record<UnidadeStatus, string> = {
  disponivel: "bg-emerald-100 text-emerald-800 border-emerald-200",
  reservado: "bg-amber-100 text-amber-800 border-amber-200",
  vendido: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels: Record<UnidadeStatus, string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
};

const statusIcons: Record<UnidadeStatus, typeof CheckCircle2> = {
  disponivel: CheckCircle2,
  reservado: Clock,
  vendido: XCircle,
};

const nextStatus: Record<UnidadeStatus, UnidadeStatus> = {
  disponivel: "reservado",
  reservado: "vendido",
  vendido: "disponivel",
};

const getInitialStatuses = (): Record<string, UnidadeStatus> => {
  const fallback = Object.fromEntries(UNIDADES.map((u) => [u.id, u.status])) as Record<string, UnidadeStatus>;
  try {
    const saved = localStorage.getItem("venezia_unidades_status");
    return saved ? { ...fallback, ...JSON.parse(saved) } : fallback;
  } catch {
    localStorage.removeItem("venezia_unidades_status");
    return fallback;
  }
};

type SortKey = "numero" | "andar" | "area" | "valorVenda" | "precoM2";

export default function TabelaSection() {
  const { ref, isVisible } = useScrollAnimation();
  const { isAuthenticated, logout, addLog, salvarDadosVenda } = useAuth();
  const [sortKey, setSortKey] = useState<SortKey>("andar");
  const [sortAsc, setSortAsc] = useState(true);
  const [filterAndar, setFilterAndar] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<UnidadeStatus | null>(null);

  // Modal de senha
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  // Modal de venda
  const [showVendaModal, setShowVendaModal] = useState(false);
  const [vendaUnidade, setVendaUnidade] = useState<Unidade | null>(null);
  const [vendaPendingId, setVendaPendingId] = useState<string | null>(null);

  // Admin panel
  const [showAdmin, setShowAdmin] = useState(false);

  // Estado local para controlar status das unidades
  const [unidadesStatus, setUnidadesStatus] = useState<Record<string, UnidadeStatus>>(
    getInitialStatuses
  );

  useEffect(() => {
    const syncStatuses = () => setUnidadesStatus(getInitialStatuses());
    window.addEventListener("storage", syncStatuses);
    window.addEventListener("venezia-status-update", syncStatuses);
    return () => {
      window.removeEventListener("storage", syncStatuses);
      window.removeEventListener("venezia-status-update", syncStatuses);
    };
  }, []);

  const unidadesComStatus: Unidade[] = useMemo(
    () => UNIDADES.map((u) => ({ ...u, status: unidadesStatus[u.id] || u.status })),
    [unidadesStatus]
  );

  const filteredUnidades = useMemo(() => {
    let result = [...unidadesComStatus];
    if (filterAndar !== null) result = result.filter((u) => u.andar === filterAndar);
    if (filterStatus !== null) result = result.filter((u) => u.status === filterStatus);
    result.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return result;
  }, [sortKey, sortAsc, filterAndar, filterStatus, unidadesComStatus]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const executeStatusChange = useCallback((id: string, forceStatus?: UnidadeStatus) => {
    setUnidadesStatus((prev) => {
      const currentStatus = prev[id] || "disponivel";
      const newStatus = forceStatus || nextStatus[currentStatus];
      const unidade = UNIDADES.find((u) => u.id === id);
      
      // Registrar no log
      addLog({
        unidade: unidade?.numero || id,
        statusAnterior: currentStatus,
        statusNovo: newStatus,
        usuario: "Administrador",
      });

      toast.success(`Unidade ${unidade?.numero} alterada para ${statusLabels[newStatus]}`);
      const updated = { ...prev, [id]: newStatus };
      localStorage.setItem("venezia_unidades_status", JSON.stringify(updated));
      window.dispatchEvent(new Event("venezia-status-update"));
      return updated;
    });
  }, [addLog]);

  const handleStatusChange = (id: string) => {
    if (!isAuthenticated) {
      setPendingAction(id);
      setShowPasswordModal(true);
      return;
    }

    const currentStatus = unidadesStatus[id];
    const newStatus = nextStatus[currentStatus];

    // Se vai para "vendido", abrir modal de fechamento de venda
    if (newStatus === "vendido") {
      const unidade = unidadesComStatus.find((u) => u.id === id);
      setVendaUnidade(unidade || null);
      setVendaPendingId(id);
      setShowVendaModal(true);
    } else {
      executeStatusChange(id);
    }
  };

  const handleVendaConfirm = (dados: DadosVenda) => {
    if (vendaPendingId) {
      salvarDadosVenda(vendaPendingId, dados);
      
      // Registrar no log com detalhes
      const unidade = UNIDADES.find((u) => u.id === vendaPendingId);
      addLog({
        unidade: unidade?.numero || vendaPendingId,
        statusAnterior: unidadesStatus[vendaPendingId],
        statusNovo: "vendido",
        usuario: "Administrador",
        detalhes: `Comprador: ${dados.comprador} | Corretor: ${dados.corretor} | Imob: ${dados.imobiliaria} | Data: ${dados.dataAssinatura}`,
      });

      setUnidadesStatus((prev) => {
        const updated = { ...prev, [vendaPendingId!]: "vendido" as UnidadeStatus };
        localStorage.setItem("venezia_unidades_status", JSON.stringify(updated));
        window.dispatchEvent(new Event("venezia-status-update"));
        return updated;
      });

      toast.success(`Unidade ${unidade?.numero} — Venda registrada com sucesso!`);
      setVendaPendingId(null);
      setVendaUnidade(null);
    }
  };

  const handlePasswordSuccess = () => {
    toast.success("Acesso desbloqueado para esta sessão");
    if (pendingAction) {
      // Após autenticação, executar a ação pendente
      const currentStatus = unidadesStatus[pendingAction];
      const newStatus = nextStatus[currentStatus];
      
      if (newStatus === "vendido") {
        const unidade = unidadesComStatus.find((u) => u.id === pendingAction);
        setVendaUnidade(unidade || null);
        setVendaPendingId(pendingAction);
        setShowVendaModal(true);
      } else {
        executeStatusChange(pendingAction);
      }
      setPendingAction(null);
    }
  };

  const disponiveis = unidadesComStatus.filter((u) => u.status === "disponivel").length;
  const reservados = unidadesComStatus.filter((u) => u.status === "reservado").length;
  const vendidos = unidadesComStatus.filter((u) => u.status === "vendido").length;

  // Totais
  const totalVGV = unidadesComStatus.reduce((s, u) => s + u.valorVenda, 0);
  const totalEntrada = unidadesComStatus.reduce((s, u) => s + u.entrada20, 0);
  const totalEntradaLiquida = unidadesComStatus.reduce((s, u) => s + u.entradaMenosReforco, 0);
  const totalReforcoChaves = unidadesComStatus.reduce((s, u) => s + u.reforcoChaves, 0);
  const totalFinanc = unidadesComStatus.reduce((s, u) => s + u.financCEF, 0);

  return (
    <section id="tabela" className="py-24 bg-white">
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-6 section-fade-in ${isVisible ? "visible" : ""}`}
      >
        <div className="text-center mb-12">
          <p className="text-[#c62828] text-sm font-medium uppercase tracking-widest mb-3">
            Disponibilidade
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-[#1a1a2e] mb-4">
            Tabela de Vendas
          </h2>
          <div className="italian-divider mx-auto mb-6" />
          <p className="text-gray-500 text-sm">
            {isAuthenticated ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600">
                <ShieldCheck size={14} />
                Acesso desbloqueado — clique no status para alterar
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Lock size={14} />
                Clique no status de uma unidade para alterar (requer senha)
              </span>
            )}
          </p>
        </div>

        {/* Auth indicator + Admin */}
        {isAuthenticated && (
          <div className="flex justify-end mb-4 gap-3">
            <button
              onClick={() => setShowAdmin(true)}
              className="text-xs text-gray-500 hover:text-[#c62828] transition-colors flex items-center gap-1"
            >
              <Settings size={12} />
              Painel Admin
            </button>
            <button
              onClick={logout}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <Lock size={12} />
              Bloquear acesso
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#f8f7f4] p-4 rounded-lg text-center">
            <p className="text-2xl font-semibold text-[#1a1a2e]">{EMPREENDIMENTO.totalUnidades}</p>
            <p className="text-gray-500 text-xs mt-1">Total de Unidades</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-semibold text-emerald-700">{disponiveis}</p>
            <p className="text-emerald-600 text-xs mt-1">Disponíveis</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-semibold text-amber-700">{reservados}</p>
            <p className="text-amber-600 text-xs mt-1">Reservados</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-semibold text-red-700">{vendidos}</p>
            <p className="text-red-600 text-xs mt-1">Vendidos</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <Filter size={16} className="text-gray-400" />
          <select
            value={filterAndar ?? ""}
            onChange={(e) => setFilterAndar(e.target.value ? Number(e.target.value) : null)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">Todos os Andares</option>
            <option value="1">1º Andar</option>
            <option value="2">2º Andar</option>
            <option value="3">3º Andar</option>
            <option value="4">4º Andar</option>
          </select>
          <select
            value={filterStatus ?? ""}
            onChange={(e) => setFilterStatus(e.target.value ? (e.target.value as UnidadeStatus) : null)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">Todos os Status</option>
            <option value="disponivel">Disponível</option>
            <option value="reservado">Reservado</option>
            <option value="vendido">Vendido</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-[#1a1a2e] text-white">
              <tr>
                {[
                  { key: "numero" as SortKey, label: "Unidade" },
                  { key: "andar" as SortKey, label: "Andar" },
                  { key: "area" as SortKey, label: "Área (m²)" },
                  { key: "valorVenda" as SortKey, label: "Valor Venda" },
                  { key: "valorVenda" as SortKey, label: "Valor c/ Doc" },
                  { key: "precoM2" as SortKey, label: "% Doc" },
                  { key: "precoM2" as SortKey, label: "R$/m²" },
                ].map((col, colIdx) => (
                  <th
                    key={`${col.label}-${colIdx}`}
                    onClick={() => toggleSort(col.key)}
                    className="px-3 py-3 text-left font-medium cursor-pointer hover:bg-white/10 transition-colors whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      <ArrowUpDown size={12} className="opacity-50" />
                    </div>
                  </th>
                ))}
                <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Entrada 20%</th>
                <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Entrada - 20k</th>
                <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Ato + 36x</th>
                <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Chaves R$ 20k</th>
                <th className="px-3 py-3 text-left font-medium whitespace-nowrap">Financ. CEF</th>
                <th className="px-3 py-3 text-center font-medium whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    Status
                    {!isAuthenticated && <Lock size={11} className="opacity-60" />}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUnidades.map((unidade, idx) => {
                const StatusIcon = statusIcons[unidade.status];
                return (
                  <tr
                    key={unidade.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    } ${unidade.status === "vendido" ? "opacity-60" : ""}`}
                  >
                    <td className="px-3 py-3 font-medium text-[#1a1a2e] whitespace-nowrap">
                      {unidade.numero}
                    </td>
                    <td className="px-3 py-3 text-gray-600">{`${unidade.andar}º`}</td>
                    <td className="px-3 py-3 text-gray-600">{unidade.area}</td>
                    <td className="px-3 py-3 font-medium text-[#1a1a2e]">{formatCurrency(unidade.valorVenda)}</td>
                    <td className="px-3 py-3 font-medium text-[#1a1a2e]">{formatCurrency(unidade.valorComDocumentacao)}</td>
                    <td className="px-3 py-3 text-center text-gray-500 font-medium">4%</td>
                    <td className="px-3 py-3 text-gray-600">{formatCurrency(unidade.precoM2)}</td>
                    <td className="px-3 py-3 text-gray-600">{formatCurrency(unidade.entrada20)}</td>
                    <td className="px-3 py-3 text-gray-600">{formatCurrency(unidade.entradaMenosReforco)}</td>
                    <td className="px-3 py-3 text-[#c62828] font-semibold">{formatCurrencyDecimal(unidade.parcela36x)}</td>
                    <td className="px-3 py-3 text-gray-600">{formatCurrency(unidade.reforcoChaves)}</td>
                    <td className="px-3 py-3 text-gray-600">{formatCurrency(unidade.financCEF)}</td>
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => handleStatusChange(unidade.id)}
                        className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium border transition-all duration-200 hover:scale-105 active:scale-95 ${statusColors[unidade.status]}`}
                        title={isAuthenticated ? `Clique para alterar status (atual: ${statusLabels[unidade.status]})` : "Requer senha para alterar"}
                      >
                        <StatusIcon size={12} />
                        {statusLabels[unidade.status]}
                        {!isAuthenticated && <Lock size={10} className="ml-0.5 opacity-60" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {/* Total Row */}
              <tr className="bg-[#1a1a2e]/5 font-semibold border-t-2 border-[#1a1a2e]/20">
                <td className="px-3 py-3 text-[#1a1a2e]" colSpan={3}>TOTAL</td>
                <td className="px-3 py-3 text-[#1a1a2e]">{formatCurrency(totalVGV)}</td>
                <td className="px-3 py-3 text-[#1a1a2e]">{formatCurrency(unidadesComStatus.reduce((s, u) => s + u.valorComDocumentacao, 0))}</td>
                <td className="px-3 py-3 text-center text-gray-500">4%</td>
                <td className="px-3 py-3"></td>
                <td className="px-3 py-3 text-gray-700">{formatCurrency(totalEntrada)}</td>
                <td className="px-3 py-3 text-gray-700">{formatCurrency(totalEntradaLiquida)}</td>
                <td className="px-3 py-3"></td>
                <td className="px-3 py-3 text-gray-700">{formatCurrency(totalReforcoChaves)}</td>
                <td className="px-3 py-3 text-gray-700">{formatCurrency(totalFinanc)}</td>
                <td className="px-3 py-3"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 items-center text-xs text-gray-500">
          <span className="font-medium text-gray-700">Legenda:</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400"></span> Disponível
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400"></span> Reservado
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400"></span> Vendido
          </span>
          <span className="ml-auto text-gray-400 italic">
            {isAuthenticated ? "Sessão autenticada" : "Protegido por senha"}
          </span>
        </div>

        {/* Conditions */}
        <div className="mt-6 bg-[#f8f7f4] p-5 rounded-lg">
          <h4 className="font-serif text-lg text-[#1a1a2e] mb-3">Condições Comerciais</h4>
          <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
            <p><span className="font-medium text-[#1a1a2e]">Entrada:</span> {CONDICOES_COMERCIAIS.entrada}</p>
            <p><span className="font-medium text-[#1a1a2e]">Parcelamento:</span> {CONDICOES_COMERCIAIS.parcelamento}</p>
            <p><span className="font-medium text-[#1a1a2e]">Reforço:</span> {CONDICOES_COMERCIAIS.reforcos}</p>
            <p><span className="font-medium text-[#1a1a2e]">Financiamento:</span> {CONDICOES_COMERCIAIS.financiamento}</p>
            <p><span className="font-medium text-[#1a1a2e]">Correção:</span> {CONDICOES_COMERCIAIS.correcao}</p>
          </div>
          <p className="text-xs text-gray-400 mt-3">* Valores sujeitos a alteração sem aviso prévio. Consulte condições atualizadas.</p>
        </div>
      </div>

      {/* Password Modal */}
      <PasswordModal
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
        onSuccess={handlePasswordSuccess}
      />

      {/* Venda Modal */}
      <VendaModal
        open={showVendaModal}
        onOpenChange={setShowVendaModal}
        unidade={vendaUnidade}
        onConfirm={handleVendaConfirm}
      />

      {/* Admin Panel */}
      <AdminPanel
        open={showAdmin}
        onOpenChange={setShowAdmin}
      />
    </section>
  );
}
