import { IMAGENS } from "@/data/empreendimento";
import { ExternalLink, Send, User, Phone, MessageSquare, Mail, Award } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface CorretorData {
  id: number;
  nome: string;
  slug: string;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
  creci: string | null;
  fotoUrl: string | null;
  imobiliariaId: number | null;
  imobiliariaNome: string | null;
}

interface FooterProps {
  corretor?: CorretorData | null;
}

export default function Footer({ corretor }: FooterProps) {
  const [formData, setFormData] = useState({ nome: "", telefone: "", email: "", mensagem: "" });
  const [enviando, setEnviando] = useState(false);

  const registrarLead = trpc.leads.registrar.useMutation();

  // Número de WhatsApp: do corretor ou padrão
  const whatsappNumber = corretor?.whatsapp
    ? corretor.whatsapp.replace(/\D/g, "")
    : "5548996962020";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.telefone) {
      toast.error("Preencha nome e telefone para continuar.");
      return;
    }
    setEnviando(true);

    // Registrar lead no banco de dados
    try {
      await registrarLead.mutateAsync({
        nomeCliente: formData.nome,
        telefoneCliente: formData.telefone,
        emailCliente: formData.email || undefined,
        corretorId: corretor?.id ?? null,
        imobiliariaId: corretor?.imobiliariaId ?? null,
        origem: corretor ? `link-corretor-${corretor.slug}` : "site-direto",
        mensagem: formData.mensagem || undefined,
      });
    } catch {
      // Silently fail - não impedir o contato mesmo se o banco falhar
      console.warn("Falha ao registrar lead no banco");
    }

    // Monta mensagem para WhatsApp
    const atendimento = corretor ? `Estou sendo atendido por ${corretor.nome}.` : "";
    const msg = `Olá! Sou ${formData.nome}. Tenho interesse no Residencial Venezia. ${atendimento}${formData.mensagem ? ` ${formData.mensagem}` : ""} Meu contato: ${formData.telefone}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;

    // Abre WhatsApp em nova aba
    window.open(whatsappUrl, "_blank");

    const destino = corretor ? corretor.nome : "Central de Vendas";
    toast.success(`Redirecionando para o WhatsApp de ${destino}!`);
    setEnviando(false);
    setFormData({ nome: "", telefone: "", email: "", mensagem: "" });
  };

  return (
    <footer className="bg-[#1a1a2e] text-white">
      {/* Banner do Corretor - aparece quando acessado via link personalizado */}
      {corretor && (
        <div className="bg-gradient-to-r from-[#1a1a2e] via-[#2a2a4e] to-[#1a1a2e] border-b border-[#c62828]/30">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex items-center gap-5">
              {corretor.fotoUrl ? (
                <img
                  src={corretor.fotoUrl}
                  alt={corretor.nome}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#c62828]/50"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#c62828]/20 border-2 border-[#c62828]/50 flex items-center justify-center">
                  <User size={24} className="text-[#c62828]" />
                </div>
              )}
              <div>
                <p className="text-[#c62828] text-xs font-medium uppercase tracking-widest mb-1">
                  Seu Consultor
                </p>
                <h4 className="font-serif text-xl text-white">{corretor.nome}</h4>
                <div className="flex flex-wrap items-center gap-4 mt-1.5 text-white/60 text-sm">
                  {corretor.creci && (
                    <span className="flex items-center gap-1">
                      <Award size={12} className="text-[#c62828]" />
                      CRECI {corretor.creci}
                    </span>
                  )}
                  {corretor.imobiliariaNome && (
                    <span className="text-white/50">
                      {corretor.imobiliariaNome}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulário de Contato */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#c62828] text-sm font-medium uppercase tracking-widest mb-3">
                Contato Rápido
              </p>
              <h3 className="font-serif text-3xl md:text-4xl mb-4">
                {corretor ? `Fale com ${corretor.nome.split(" ")[0]}` : "Fale com um Consultor"}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {corretor
                  ? `Preencha seus dados e ${corretor.nome.split(" ")[0]} entrará em contato para apresentar as melhores condições do Residencial Venezia.`
                  : "Preencha seus dados e nossa equipe comercial entrará em contato para apresentar as melhores condições do Residencial Venezia."}
              </p>
              {corretor && (
                <div className="mt-4 space-y-2 text-white/50 text-sm">
                  {corretor.telefone && (
                    <p className="flex items-center gap-2">
                      <Phone size={14} className="text-[#c62828]" />
                      {corretor.telefone}
                    </p>
                  )}
                  {corretor.email && (
                    <p className="flex items-center gap-2">
                      <Mail size={14} className="text-[#c62828]" />
                      {corretor.email}
                    </p>
                  )}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#c62828]/50 focus:ring-1 focus:ring-[#c62828]/30 transition-all"
                />
              </div>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#c62828]/50 focus:ring-1 focus:ring-[#c62828]/30 transition-all"
                />
              </div>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  placeholder="E-mail (opcional)"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#c62828]/50 focus:ring-1 focus:ring-[#c62828]/30 transition-all"
                />
              </div>
              <div className="relative">
                <MessageSquare size={16} className="absolute left-4 top-4 text-white/40" />
                <textarea
                  placeholder="Mensagem (opcional)"
                  value={formData.mensagem}
                  onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#c62828]/50 focus:ring-1 focus:ring-[#c62828]/30 transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-[#c62828] hover:bg-[#b71c1c] text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
              >
                <Send size={16} />
                {enviando
                  ? "Enviando..."
                  : corretor
                    ? `Enviar para ${corretor.nome.split(" ")[0]}`
                    : "Enviar para WhatsApp"}
              </button>
              <p className="text-white/30 text-xs text-center">
                {corretor
                  ? `Ao enviar, você será redirecionado ao WhatsApp de ${corretor.nome.split(" ")[0]}.`
                  : "Ao enviar, você será redirecionado ao WhatsApp da Central de Vendas."}
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <img
              src={IMAGENS.logoVeneziaOficial}
              alt="Residencial Venezia"
              className="h-14 w-auto mb-4 rounded"
            />
            <p className="text-white/50 text-sm leading-relaxed">
              Residencial Venezia. Sofisticação para viver. Exclusividade para investir.
            </p>
            <div className="italian-divider mt-4" />
          </div>

          {/* Realização */}
          <div>
            <h4 className="font-serif text-lg mb-4">Realização</h4>
            <div className="space-y-3">
              <p className="text-white/80 font-medium text-sm tracking-wide">SPE-VENEZIA EMPREENDIMENTOS<br/>IMOBILIARIOS LTDA</p>
              <p className="text-white/50 text-xs mt-2">Tijucas/SC</p>
            </div>
          </div>

          {/* Construção e Incorporação */}
          <div>
            <h4 className="font-serif text-lg mb-4">Construção e Incorporação</h4>
            <div className="space-y-3 text-white/60 text-sm">
              <p className="font-medium text-white/80">SPE-VENEZIA RESIDENCIAL LTDA</p>
              <p>Loteamento Terra Firme, Bairro Areias</p>
              <p>Tijucas — Santa Catarina</p>
            </div>
            <p className="text-white/30 text-xs mt-6">
              Central Comercial — Uso exclusivo da equipe de vendas
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-xs">
            © 2025 SPE-VENEZIA EMPREENDIMENTOS IMOBILIARIOS LTDA. Todos os direitos reservados.
          </p>
          <p className="text-white/30 text-xs">
            Imagens meramente ilustrativas. Valores sujeitos a alteração.
          </p>
        </div>
      </div>
    </footer>
  );
}
