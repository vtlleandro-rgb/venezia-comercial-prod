import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { getLoginUrl } from "@/const";
import {
  Users,
  Building2,
  UserPlus,
  Link2,
  BarChart3,
  Eye,
  Phone,
  Mail,
  Award,
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  Copy,
  Check,
  X,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

const formatDate = (d: Date | string | null) => {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminCorretores() {
  const { isAuthenticated, canManage, loading, user, isAdmin } = useAuth({ redirectOnUnauthenticated: true });
  const [tab, setTab] = useState<"corretores" | "imobiliarias" | "leads" | "analytics" | "gerentes">("corretores");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    nome: "",
    slug: "",
    telefone: "",
    whatsapp: "",
    email: "",
    creci: "",
    imobiliariaId: undefined as number | undefined,
  });

  const [imobForm, setImobForm] = useState({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
  });
  const [showImobForm, setShowImobForm] = useState(false);

  // Gerentes
  const [gerenteForm, setGerenteForm] = useState({ nome: "", email: "", senha: "" });
  const [showGerenteForm, setShowGerenteForm] = useState(false);
  const [gerentes, setGerentes] = useState<any[]>([]);
  const [gerentesLoading, setGerentesLoading] = useState(false);

  const loadGerentes = async () => {
    setGerentesLoading(true);
    try {
      const res = await fetch("/api/users", { credentials: "include" });
      if (res.ok) setGerentes(await res.json());
    } catch { /* ignore */ } finally { setGerentesLoading(false); }
  };

  const handleCreateGerente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gerenteForm.nome || !gerenteForm.email || !gerenteForm.senha) {
      toast.error("Preencha nome, e-mail e senha.");
      return;
    }
    if (gerenteForm.senha.length < 8) {
      toast.error("Senha deve ter ao menos 8 caracteres.");
      return;
    }
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: gerenteForm.nome, email: gerenteForm.email, password: gerenteForm.senha, role: "gerente" }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao criar gerente."); return; }
      toast.success("Gerente cadastrado com sucesso!");
      setGerenteForm({ nome: "", email: "", senha: "" });
      setShowGerenteForm(false);
      loadGerentes();
    } catch { toast.error("Erro de conexão."); }
  };

  const handleDeleteGerente = async (id: number) => {
    if (!confirm("Remover este gerente?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) { toast.success("Gerente removido."); loadGerentes(); }
      else toast.error("Erro ao remover.");
    } catch { toast.error("Erro de conexão."); }
  };

  // tRPC queries - apenas habilitadas para admin ou gerente
  const corretoresQuery = trpc.corretores.list.useQuery(undefined, { enabled: canManage, retry: false });
  const imobiliariasQuery = trpc.imobiliarias.list.useQuery(undefined, { enabled: canManage, retry: false });
  const leadsQuery = trpc.leads.list.useQuery(undefined, { enabled: canManage, retry: false });
  const statsQuery = trpc.acessos.stats.useQuery(undefined, { enabled: canManage, retry: false });

  // Mutations
  const createCorretor = trpc.corretores.create.useMutation({
    onSuccess: () => {
      toast.success("Corretor cadastrado com sucesso!");
      corretoresQuery.refetch();
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateCorretor = trpc.corretores.update.useMutation({
    onSuccess: () => {
      toast.success("Corretor atualizado!");
      corretoresQuery.refetch();
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteCorretor = trpc.corretores.delete.useMutation({
    onSuccess: () => {
      toast.success("Corretor desativado.");
      corretoresQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const createImobiliaria = trpc.imobiliarias.create.useMutation({
    onSuccess: () => {
      toast.success("Imobiliária cadastrada!");
      imobiliariasQuery.refetch();
      setShowImobForm(false);
      setImobForm({ nome: "", cnpj: "", telefone: "", email: "" });
    },
    onError: (err) => toast.error(err.message),
  });

  const resetForm = () => {
    setForm({ nome: "", slug: "", telefone: "", whatsapp: "", email: "", creci: "", imobiliariaId: undefined });
    setShowForm(false);
    setEditingId(null);
  };

  const generateSlug = (nome: string) => {
    return nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleSubmitCorretor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.slug) {
      toast.error("Nome e slug são obrigatórios.");
      return;
    }

    const data = {
      nome: form.nome,
      slug: form.slug,
      telefone: form.telefone || undefined,
      whatsapp: form.whatsapp || undefined,
      email: form.email || undefined,
      creci: form.creci || undefined,
      imobiliariaId: form.imobiliariaId,
    };

    if (editingId) {
      updateCorretor.mutate({ id: editingId, ...data });
    } else {
      createCorretor.mutate(data);
    }
  };

  const handleEditCorretor = (corretor: any) => {
    setForm({
      nome: corretor.nome,
      slug: corretor.slug,
      telefone: corretor.telefone || "",
      whatsapp: corretor.whatsapp || "",
      email: corretor.email || "",
      creci: corretor.creci || "",
      imobiliariaId: corretor.imobiliariaId || undefined,
    });
    setEditingId(corretor.id);
    setShowForm(true);
    setTimeout(() => {
      document.getElementById("form-corretor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleSubmitImobiliaria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imobForm.nome) {
      toast.error("Nome da imobiliária é obrigatório.");
      return;
    }
    createImobiliaria.mutate({
      nome: imobForm.nome,
      cnpj: imobForm.cnpj || undefined,
      telefone: imobForm.telefone || undefined,
      email: imobForm.email || undefined,
    });
  };

  const copyLink = (slug: string) => {
    const url = `https://residencialvenezia.com/?corretor=${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    toast.success("Link copiado!");
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  useEffect(() => {
    if (tab === "gerentes" && isAdmin) loadGerentes();
  }, [tab, isAdmin]);

  // Analytics data
  const analyticsData = useMemo(() => {
    if (!statsQuery.data || !corretoresQuery.data) return [];
    const corretores = corretoresQuery.data;
    const { acessosPorCorretor, leadsPorCorretor } = statsQuery.data;

    return corretores.map((c: any) => {
      const acessos = acessosPorCorretor.find((a: any) => a.corretorId === c.id);
      const leads = leadsPorCorretor.find((l: any) => l.corretorId === c.id);
      return {
        ...c,
        totalAcessos: acessos?.total ?? 0,
        totalLeads: leads?.total ?? 0,
      };
    }).sort((a: any, b: any) => b.totalLeads - a.totalLeads || b.totalAcessos - a.totalAcessos);
  }, [statsQuery.data, corretoresQuery.data]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#c62828] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4]">
        <div className="text-center">
          <Users size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">Acesso restrito. Faça login para continuar.</p>
          <a
            href={getLoginUrl()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#c62828] rounded-lg hover:bg-[#b71c1c] transition-colors"
          >
            Fazer Login
          </a>
        </div>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4]">
        <div className="text-center">
          <Users size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 font-medium mb-2">Acesso não autorizado</p>
          <p className="text-gray-500 text-sm mb-4">Esta área é restrita a administradores e gerentes.</p>
          <a href="/corretor" className="text-[#c62828] text-sm hover:underline">
            Ir para o Painel do Corretor
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      {/* Header */}
      <div className="bg-[#1a1a2e] text-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft size={16} />
                Voltar ao site
              </a>
              <div className="h-6 w-px bg-white/20" />
              <h1 className="font-serif text-xl">Painel de Corretores</h1>
            </div>
            <p className="text-white/50 text-xs hidden sm:block">Residencial Venezia — Gestão Comercial</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex overflow-x-auto">
            {([
              { key: "corretores", label: "Corretores", icon: Users },
              { key: "imobiliarias", label: "Imobiliárias", icon: Building2 },
              { key: "leads", label: "Leads", icon: UserPlus },
              { key: "analytics", label: "Analytics", icon: BarChart3 },
              ...(isAdmin ? [{ key: "gerentes", label: "Gerentes", icon: ShieldCheck }] : []),
            ] as { key: string; label: string; icon: any }[]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key as any)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  tab === key
                    ? "border-[#c62828] text-[#c62828]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* === CORRETORES === */}
        {tab === "corretores" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#1a1a2e]">Corretores Cadastrados</h2>
                <p className="text-sm text-gray-500">
                  {corretoresQuery.data?.length ?? 0} corretor(es) ativo(s)
                </p>
              </div>
              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#c62828] rounded-lg hover:bg-[#b71c1c] transition-colors"
              >
                <Plus size={16} />
                Novo Corretor
              </button>
            </div>

            {/* Form */}
            {showForm && (
              <div id="form-corretor" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-[#1a1a2e]">
                    {editingId ? "Editar Corretor" : "Novo Corretor"}
                  </h3>
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleSubmitCorretor} className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Nome Completo *</label>
                    <Input
                      value={form.nome}
                      onChange={(e) => {
                        setForm({ ...form, nome: e.target.value, slug: form.slug || generateSlug(e.target.value) });
                      }}
                      placeholder="João da Silva"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Slug (URL) *</label>
                    <Input
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                      placeholder="joao-silva"
                      className="h-10"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Link: residencialvenezia.com/?corretor={form.slug || "slug"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Telefone</label>
                    <Input
                      value={form.telefone}
                      onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                      placeholder="(48) 99999-0000"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">WhatsApp</label>
                    <Input
                      value={form.whatsapp}
                      onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                      placeholder="5548999990000"
                      className="h-10"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Formato: código do país + DDD + número</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">E-mail</label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="joao@imobiliaria.com"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">CRECI</label>
                    <Input
                      value={form.creci}
                      onChange={(e) => setForm({ ...form, creci: e.target.value })}
                      placeholder="12345-F"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Imobiliária</label>
                    <select
                      value={form.imobiliariaId ?? ""}
                      onChange={(e) => setForm({ ...form, imobiliariaId: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full h-10 border border-gray-200 rounded-md px-3 text-sm bg-white"
                    >
                      <option value="">Sem vínculo</option>
                      {(imobiliariasQuery.data ?? []).map((imob: any) => (
                        <option key={imob.id} value={imob.id}>
                          {imob.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={createCorretor.isPending || updateCorretor.isPending}
                      className="px-6 py-2.5 text-sm font-medium text-white bg-[#c62828] rounded-lg hover:bg-[#b71c1c] transition-colors disabled:opacity-50"
                    >
                      {editingId ? "Salvar Alterações" : "Cadastrar Corretor"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Lista de Corretores */}
            {corretoresQuery.isLoading ? (
              <div className="text-center py-12 text-gray-400">Carregando...</div>
            ) : (corretoresQuery.data ?? []).length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Users size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-sm">Nenhum corretor cadastrado.</p>
                <p className="text-xs mt-1">Clique em "Novo Corretor" para começar.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {(corretoresQuery.data ?? []).filter((c: any) => c.ativo === 1).map((corretor: any) => (
                  <div key={corretor.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#c62828]/10 flex items-center justify-center">
                          <Users size={20} className="text-[#c62828]" />
                        </div>
                        <div>
                          <h3 className="font-medium text-[#1a1a2e]">{corretor.nome}</h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            {corretor.creci && (
                              <span className="flex items-center gap-1">
                                <Award size={11} /> CRECI {corretor.creci}
                              </span>
                            )}
                            {corretor.telefone && (
                              <span className="flex items-center gap-1">
                                <Phone size={11} /> {corretor.telefone}
                              </span>
                            )}
                            {corretor.email && (
                              <span className="flex items-center gap-1">
                                <Mail size={11} /> {corretor.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyLink(corretor.slug)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#c62828] bg-[#c62828]/5 rounded-md hover:bg-[#c62828]/10 transition-colors"
                        >
                          {copiedSlug === corretor.slug ? <Check size={12} /> : <Link2 size={12} />}
                          {copiedSlug === corretor.slug ? "Copiado!" : "Copiar Link"}
                        </button>
                        <button
                          onClick={() => handleEditCorretor(corretor)}
                          className="p-2 text-gray-400 hover:text-[#1a1a2e] transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Desativar ${corretor.nome}?`)) {
                              deleteCorretor.mutate({ id: corretor.id });
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {/* Link preview */}
                    <div className="mt-3 flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                      <Link2 size={12} className="text-gray-400" />
                      <code className="text-xs text-gray-600">
                        residencialvenezia.com/?corretor={corretor.slug}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === IMOBILIÁRIAS === */}
        {tab === "imobiliarias" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#1a1a2e]">Imobiliárias Parceiras</h2>
                <p className="text-sm text-gray-500">
                  {imobiliariasQuery.data?.length ?? 0} imobiliária(s)
                </p>
              </div>
              <button
                onClick={() => setShowImobForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#c62828] rounded-lg hover:bg-[#b71c1c] transition-colors"
              >
                <Plus size={16} />
                Nova Imobiliária
              </button>
            </div>

            {showImobForm && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-[#1a1a2e]">Nova Imobiliária</h3>
                  <button onClick={() => setShowImobForm(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleSubmitImobiliaria} className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Nome *</label>
                    <Input
                      value={imobForm.nome}
                      onChange={(e) => setImobForm({ ...imobForm, nome: e.target.value })}
                      placeholder="Imobiliária XYZ"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">CNPJ</label>
                    <Input
                      value={imobForm.cnpj}
                      onChange={(e) => setImobForm({ ...imobForm, cnpj: e.target.value })}
                      placeholder="00.000.000/0001-00"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Telefone</label>
                    <Input
                      value={imobForm.telefone}
                      onChange={(e) => setImobForm({ ...imobForm, telefone: e.target.value })}
                      placeholder="(48) 3333-0000"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">E-mail</label>
                    <Input
                      type="email"
                      value={imobForm.email}
                      onChange={(e) => setImobForm({ ...imobForm, email: e.target.value })}
                      placeholder="contato@imobiliaria.com"
                      className="h-10"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={createImobiliaria.isPending}
                      className="px-6 py-2.5 text-sm font-medium text-white bg-[#c62828] rounded-lg hover:bg-[#b71c1c] transition-colors disabled:opacity-50"
                    >
                      Cadastrar Imobiliária
                    </button>
                  </div>
                </form>
              </div>
            )}

            {imobiliariasQuery.isLoading ? (
              <div className="text-center py-12 text-gray-400">Carregando...</div>
            ) : (imobiliariasQuery.data ?? []).length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Building2 size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-sm">Nenhuma imobiliária cadastrada.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {(imobiliariasQuery.data ?? []).map((imob: any) => (
                  <div key={imob.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Building2 size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#1a1a2e]">{imob.nome}</h3>
                        <p className="text-xs text-gray-400">{imob.cnpj || "Sem CNPJ"}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                      {imob.telefone && <span className="flex items-center gap-1"><Phone size={11} />{imob.telefone}</span>}
                      {imob.email && <span className="flex items-center gap-1"><Mail size={11} />{imob.email}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === LEADS === */}
        {tab === "leads" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[#1a1a2e]">Leads Capturados</h2>
              <p className="text-sm text-gray-500">
                {leadsQuery.data?.length ?? 0} lead(s) registrado(s)
              </p>
            </div>

            {leadsQuery.isLoading ? (
              <div className="text-center py-12 text-gray-400">Carregando...</div>
            ) : (leadsQuery.data ?? []).length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <UserPlus size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-sm">Nenhum lead capturado ainda.</p>
                <p className="text-xs mt-1">Os leads aparecerão conforme visitantes preencherem o formulário.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(leadsQuery.data ?? []).map((lead: any) => {
                  const corretor = (corretoresQuery.data ?? []).find((c: any) => c.id === lead.corretorId);
                  return (
                    <div key={lead.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-[#1a1a2e]">{lead.nomeCliente}</h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            {lead.telefoneCliente && (
                              <span className="flex items-center gap-1"><Phone size={11} />{lead.telefoneCliente}</span>
                            )}
                            {lead.emailCliente && (
                              <span className="flex items-center gap-1"><Mail size={11} />{lead.emailCliente}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400">{formatDate(lead.createdAt)}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs">
                        {corretor && (
                          <span className="bg-[#c62828]/5 text-[#c62828] px-2 py-0.5 rounded font-medium">
                            {corretor.nome}
                          </span>
                        )}
                        {lead.origem && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {lead.origem}
                          </span>
                        )}
                      </div>
                      {lead.mensagem && (
                        <p className="mt-2 text-xs text-gray-500 italic">"{lead.mensagem}"</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* === ANALYTICS === */}
        {tab === "analytics" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[#1a1a2e]">Analytics por Corretor</h2>
              <p className="text-sm text-gray-500">Acessos e leads por link personalizado</p>
            </div>

            {statsQuery.isLoading ? (
              <div className="text-center py-12 text-gray-400">Carregando...</div>
            ) : analyticsData.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <BarChart3 size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-sm">Nenhum dado de analytics ainda.</p>
                <p className="text-xs mt-1">Os dados aparecerão conforme os links forem acessados.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analyticsData.map((item: any, index: number) => (
                  <div key={item.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? "bg-yellow-100 text-yellow-700" :
                          index === 1 ? "bg-gray-200 text-gray-600" :
                          index === 2 ? "bg-orange-100 text-orange-700" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {index + 1}º
                        </div>
                        <div>
                          <h3 className="font-medium text-[#1a1a2e]">{item.nome}</h3>
                          <p className="text-xs text-gray-400">{item.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-center">
                        <div>
                          <p className="text-lg font-bold text-[#1a1a2e]">{item.totalAcessos}</p>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1"><Eye size={10} />Acessos</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-[#c62828]">{item.totalLeads}</p>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1"><UserPlus size={10} />Leads</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-emerald-600">
                            {item.totalAcessos > 0 ? `${Math.round((item.totalLeads / item.totalAcessos) * 100)}%` : "—"}
                          </p>
                          <p className="text-[10px] text-gray-400">Conversão</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* === GERENTES === */}
        {tab === "gerentes" && isAdmin && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Gerentes Comerciais</h2>
                <p className="text-sm text-gray-500 mt-0.5">Usuários com acesso a reservas, vendas e gestão de corretores</p>
              </div>
              <button
                onClick={() => setShowGerenteForm(!showGerenteForm)}
                className="flex items-center gap-2 px-4 py-2 bg-[#c62828] text-white text-sm font-medium rounded-lg hover:bg-[#b71c1c] transition-colors"
              >
                <Plus size={16} />
                Novo Gerente
              </button>
            </div>

            {showGerenteForm && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Cadastrar Gerente</h3>
                <form onSubmit={handleCreateGerente} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Nome completo *</label>
                      <Input value={gerenteForm.nome} onChange={e => setGerenteForm({ ...gerenteForm, nome: e.target.value })} placeholder="Nome do gerente" required />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">E-mail *</label>
                      <Input type="email" value={gerenteForm.email} onChange={e => setGerenteForm({ ...gerenteForm, email: e.target.value })} placeholder="gerente@email.com" required />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Senha inicial * (mín. 8 caracteres)</label>
                      <Input type="password" value={gerenteForm.senha} onChange={e => setGerenteForm({ ...gerenteForm, senha: e.target.value })} placeholder="Senha segura" required minLength={8} />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="px-4 py-2 bg-[#c62828] text-white text-sm font-medium rounded-lg hover:bg-[#b71c1c] transition-colors">
                      Cadastrar
                    </button>
                    <button type="button" onClick={() => { setShowGerenteForm(false); setGerenteForm({ nome: "", email: "", senha: "" }); }} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {gerentesLoading ? (
                <div className="p-8 text-center text-gray-400 text-sm">Carregando...</div>
              ) : gerentes.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">Nenhum gerente cadastrado ainda.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Último acesso</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {gerentes.map((g: any) => (
                      <tr key={g.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{g.name ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{g.email}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${g.role === "admin" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                            <ShieldCheck size={10} />
                            {g.role === "admin" ? "Administrador" : "Gerente"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(g.lastSignedIn)}</td>
                        <td className="px-4 py-3 text-right">
                          {g.role !== "admin" && (
                            <button onClick={() => handleDeleteGerente(g.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded" title="Remover gerente">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
