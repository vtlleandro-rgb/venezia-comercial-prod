import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import {
  User, Link2, Copy, Users, FileText, Phone, Building2,
  Mail, Shield, ArrowLeft, Loader2, CheckCircle2, Clock,
  ExternalLink, BarChart3, Pencil, Save, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function PainelCorretor() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"dados" | "leads" | "stats">("dados");
  const [editMode, setEditMode] = useState(false);

  // Form state para edição
  const [editTelefone, setEditTelefone] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editCreci, setEditCreci] = useState("");

  // Buscar lista de corretores para encontrar o corretor logado
  const { data: corretores, isLoading: corretoresLoading, refetch: refetchCorretores } = trpc.corretores.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Encontrar o corretor vinculado ao usuário logado (por email ou nome)
  const meuCorretor = useMemo(() => {
    if (!corretores || !user) return null;
    return corretores.find(
      (c: any) => c.email === user.email || c.nome === user.name
    ) || null;
  }, [corretores, user]);

  // Buscar leads do corretor
  const { data: meusLeads } = trpc.leads.byCorretor.useQuery(
    { corretorId: meuCorretor?.id ?? 0 },
    { enabled: !!meuCorretor?.id }
  );

  // Buscar stats de acessos
  const { data: stats } = trpc.acessos.stats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Mutation para editar dados
  const updateMe = trpc.corretores.updateMe.useMutation({
    onSuccess: () => {
      toast.success("Dados atualizados com sucesso!");
      setEditMode(false);
      refetchCorretores();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao atualizar dados.");
    },
  });

  const meusAcessos = useMemo(() => {
    if (!stats || !meuCorretor) return 0;
    const found = stats.acessosPorCorretor.find((a: any) => a.corretorId === meuCorretor.id);
    return found?.total ?? 0;
  }, [stats, meuCorretor]);

  const meusLeadsCount = useMemo(() => {
    if (!stats || !meuCorretor) return 0;
    const found = stats.leadsPorCorretor.find((l: any) => l.corretorId === meuCorretor.id);
    return found?.total ?? 0;
  }, [stats, meuCorretor]);

  // Loading
  if (authLoading || corretoresLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#c62828]" size={32} />
      </div>
    );
  }

  // Não autenticado
  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  // Link personalizado
  const baseUrl = window.location.origin;
  const meuLink = meuCorretor ? `${baseUrl}/?corretor=${meuCorretor.slug}` : "";

  const copiarLink = () => {
    navigator.clipboard.writeText(meuLink);
    toast.success("Link copiado para a área de transferência!");
  };

  const iniciarEdicao = () => {
    if (meuCorretor) {
      setEditTelefone(meuCorretor.telefone || "");
      setEditWhatsapp(meuCorretor.whatsapp || "");
      setEditEmail(meuCorretor.email || "");
      setEditCreci(meuCorretor.creci || "");
      setEditMode(true);
    }
  };

  const salvarEdicao = () => {
    if (!meuCorretor) return;
    updateMe.mutate({
      id: meuCorretor.id,
      telefone: editTelefone || undefined,
      whatsapp: editWhatsapp || undefined,
      email: editEmail || undefined,
      creci: editCreci || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                <ArrowLeft size={16} className="mr-2" />
                Voltar ao Site
              </Button>
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <h1 className="font-serif text-lg">Painel do Corretor</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#c62828]/20 flex items-center justify-center">
              <User size={16} className="text-[#c62828]" />
            </div>
            <span className="text-sm text-white/70">{user?.name || "Corretor"}</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Corretor não vinculado */}
        {!meuCorretor && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <Shield size={20} className="text-amber-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-200">Corretor não vinculado</h3>
                <p className="text-amber-200/70 text-sm mt-1">
                  Seu usuário ainda não está vinculado a um cadastro de corretor. 
                  Solicite ao administrador que cadastre um corretor com o mesmo e-mail ({user?.email}) 
                  para ativar o painel completo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* KPIs */}
        {meuCorretor && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 size={16} className="text-blue-400" />
                <span className="text-white/50 text-xs uppercase tracking-wider">Acessos</span>
              </div>
              <p className="text-2xl font-semibold">{meusAcessos}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <Users size={16} className="text-emerald-400" />
                <span className="text-white/50 text-xs uppercase tracking-wider">Leads</span>
              </div>
              <p className="text-2xl font-semibold">{meusLeadsCount}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <FileText size={16} className="text-amber-400" />
                <span className="text-white/50 text-xs uppercase tracking-wider">Propostas</span>
              </div>
              <p className="text-2xl font-semibold">
                {meusLeads?.filter((l: any) => l.propostaGerada === 1).length || 0}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 size={16} className="text-[#c62828]" />
                <span className="text-white/50 text-xs uppercase tracking-wider">Conversão</span>
              </div>
              <p className="text-2xl font-semibold">
                {meusAcessos > 0 ? `${((meusLeadsCount / meusAcessos) * 100).toFixed(1)}%` : "—"}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/5 rounded-lg p-1 w-fit">
          {[
            { id: "dados" as const, label: "Meus Dados", icon: User },
            { id: "leads" as const, label: "Meus Leads", icon: Users },
            { id: "stats" as const, label: "Estatísticas", icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-[#c62828] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "dados" && meuCorretor && (
          <div className="space-y-6">
            {/* Link personalizado */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Link2 size={18} className="text-[#c62828]" />
                <h3 className="font-medium">Meu Link Personalizado</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white/80 font-mono truncate">
                  {meuLink}
                </div>
                <Button onClick={copiarLink} className="bg-[#c62828] hover:bg-[#b71c1c]">
                  <Copy size={14} className="mr-2" />
                  Copiar
                </Button>
              </div>
              <p className="text-white/40 text-xs mt-3">
                Envie este link aos seus clientes. Todos os acessos e leads serão vinculados automaticamente a você.
              </p>
            </div>

            {/* Dados pessoais */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <User size={18} className="text-[#c62828]" />
                  <h3 className="font-medium">Meus Dados</h3>
                </div>
                {!editMode ? (
                  <Button onClick={iniciarEdicao} variant="outline" size="sm" className="text-white/60 border-white/20 hover:text-white hover:bg-white/10">
                    <Pencil size={14} className="mr-2" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={() => setEditMode(false)} variant="outline" size="sm" className="text-white/60 border-white/20 hover:text-white hover:bg-white/10">
                      <X size={14} className="mr-2" />
                      Cancelar
                    </Button>
                    <Button onClick={salvarEdicao} size="sm" className="bg-emerald-600 hover:bg-emerald-700" disabled={updateMe.isPending}>
                      {updateMe.isPending ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Save size={14} className="mr-2" />}
                      Salvar
                    </Button>
                  </div>
                )}
              </div>

              {!editMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-white/50 text-xs uppercase tracking-wider">Nome</label>
                    <p className="text-white font-medium">{meuCorretor.nome}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/50 text-xs uppercase tracking-wider">Slug</label>
                    <p className="text-white/80 font-mono text-sm">{meuCorretor.slug}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/50 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Phone size={12} /> Telefone
                    </label>
                    <p className="text-white/80">{meuCorretor.telefone || "Não cadastrado"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/50 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Phone size={12} /> WhatsApp
                    </label>
                    <p className="text-white/80">{meuCorretor.whatsapp || "Não cadastrado"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/50 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Mail size={12} /> E-mail
                    </label>
                    <p className="text-white/80">{meuCorretor.email || "Não cadastrado"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/50 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Shield size={12} /> CRECI
                    </label>
                    <p className="text-white/80">{meuCorretor.creci || "Não cadastrado"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/50 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Building2 size={12} /> Imobiliária
                    </label>
                    <p className="text-white/80">{meuCorretor.imobiliariaNome || "Autônomo"}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-white/50 text-xs uppercase tracking-wider">Nome</label>
                    <p className="text-white font-medium">{meuCorretor.nome}</p>
                    <p className="text-white/30 text-xs">Nome não editável. Solicite ao admin.</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/50 text-xs uppercase tracking-wider">Slug</label>
                    <p className="text-white/80 font-mono text-sm">{meuCorretor.slug}</p>
                    <p className="text-white/30 text-xs">Slug não editável. Solicite ao admin.</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/50 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Phone size={12} /> Telefone
                    </label>
                    <input
                      type="text"
                      value={editTelefone}
                      onChange={(e) => setEditTelefone(e.target.value)}
                      placeholder="(48) 99999-9999"
                      className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-[#c62828]/50 focus:border-[#c62828] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/50 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Phone size={12} /> WhatsApp
                    </label>
                    <input
                      type="text"
                      value={editWhatsapp}
                      onChange={(e) => setEditWhatsapp(e.target.value)}
                      placeholder="5548999999999"
                      className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-[#c62828]/50 focus:border-[#c62828] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/50 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Mail size={12} /> E-mail
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="corretor@email.com"
                      className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-[#c62828]/50 focus:border-[#c62828] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/50 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Shield size={12} /> CRECI
                    </label>
                    <input
                      type="text"
                      value={editCreci}
                      onChange={(e) => setEditCreci(e.target.value)}
                      placeholder="CRECI/SC 00000"
                      className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-[#c62828]/50 focus:border-[#c62828] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "dados" && !meuCorretor && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
            <User size={40} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/50">Nenhum cadastro de corretor vinculado ao seu usuário.</p>
            <p className="text-white/30 text-sm mt-2">Solicite ao administrador para vincular seu e-mail ({user?.email}) ao cadastro.</p>
          </div>
        )}

        {activeTab === "leads" && (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-2">
                <Users size={16} className="text-[#c62828]" />
                Meus Leads ({meusLeads?.length || 0})
              </h3>
            </div>
            {meusLeads && meusLeads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50">
                      <th className="text-left py-3 px-4 font-medium">Cliente</th>
                      <th className="text-left py-3 px-4 font-medium">Telefone</th>
                      <th className="text-left py-3 px-4 font-medium">Unidade</th>
                      <th className="text-left py-3 px-4 font-medium">Origem</th>
                      <th className="text-left py-3 px-4 font-medium">Simulação</th>
                      <th className="text-left py-3 px-4 font-medium">Proposta</th>
                      <th className="text-left py-3 px-4 font-medium">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meusLeads.map((lead: any) => (
                      <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-white font-medium">{lead.nomeCliente}</td>
                        <td className="py-3 px-4 text-white/70">{lead.telefoneCliente || "—"}</td>
                        <td className="py-3 px-4 text-white/70">{lead.unidadeInteresse || "—"}</td>
                        <td className="py-3 px-4">
                          <span className="bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded text-xs">
                            {lead.origem || "site"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {lead.simulacaoRealizada ? (
                            <span className="bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded text-xs">Sim</span>
                          ) : (
                            <span className="text-white/30 text-xs">Não</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {lead.propostaGerada ? (
                            <span className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded text-xs">Sim</span>
                          ) : (
                            <span className="text-white/30 text-xs">Não</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-white/50 text-xs">
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Users size={32} className="text-white/20 mx-auto mb-3" />
                <p className="text-white/50">Nenhum lead capturado ainda.</p>
                <p className="text-white/30 text-sm mt-2">Compartilhe seu link personalizado para começar a receber leads.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "stats" && meuCorretor && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h4 className="text-white/50 text-xs uppercase tracking-wider mb-4">Resumo de Performance</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-white/60 text-sm">Total de Acessos</span>
                    <span className="text-white font-semibold">{meusAcessos}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-white/60 text-sm">Leads Captados</span>
                    <span className="text-emerald-400 font-semibold">{meusLeadsCount}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-white/60 text-sm">Taxa de Conversão</span>
                    <span className="text-[#c62828] font-semibold">
                      {meusAcessos > 0 ? `${((meusLeadsCount / meusAcessos) * 100).toFixed(1)}%` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-white/60 text-sm">Propostas Geradas</span>
                    <span className="text-amber-400 font-semibold">
                      {meusLeads?.filter((l: any) => l.propostaGerada === 1).length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/60 text-sm">Simulações Realizadas</span>
                    <span className="text-blue-400 font-semibold">
                      {meusLeads?.filter((l: any) => l.simulacaoRealizada === 1).length || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h4 className="text-white/50 text-xs uppercase tracking-wider mb-4">Dicas para Melhorar</h4>
                <div className="space-y-3 text-sm text-white/60">
                  <p>• Compartilhe seu link em redes sociais e grupos de WhatsApp</p>
                  <p>• Envie o link junto com materiais do empreendimento</p>
                  <p>• Use o link em anúncios pagos para rastrear conversões</p>
                  <p>• Responda rapidamente os leads para aumentar a conversão</p>
                  <p>• Gere propostas comerciais para formalizar o interesse do cliente</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "stats" && !meuCorretor && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
            <BarChart3 size={32} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/50">Estatísticas indisponíveis sem cadastro de corretor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
