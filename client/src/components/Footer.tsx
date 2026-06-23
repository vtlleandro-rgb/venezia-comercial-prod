import { IMAGENS } from "@/data/empreendimento";
import { ExternalLink, Send, User, Phone, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Footer() {
  const [formData, setFormData] = useState({ nome: "", telefone: "", mensagem: "" });
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.telefone) {
      toast.error("Preencha nome e telefone para continuar.");
      return;
    }
    setEnviando(true);

    // Monta mensagem para WhatsApp
    const msg = `Olá! Sou ${formData.nome}. Tenho interesse no Residencial Venezia.${formData.mensagem ? ` ${formData.mensagem}` : ""} Meu contato: ${formData.telefone}`;
    const whatsappUrl = `https://wa.me/5548988372020?text=${encodeURIComponent(msg)}`;

    // Abre WhatsApp em nova aba
    window.open(whatsappUrl, "_blank");

    toast.success("Redirecionando para o WhatsApp da Central de Vendas!");
    setEnviando(false);
    setFormData({ nome: "", telefone: "", mensagem: "" });
  };

  return (
    <footer className="bg-[#1a1a2e] text-white">
      {/* Formulário de Contato */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#c62828] text-sm font-medium uppercase tracking-widest mb-3">
                Contato Rápido
              </p>
              <h3 className="font-serif text-3xl md:text-4xl mb-4">
                Fale com um Consultor
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Preencha seus dados e nossa equipe comercial entrará em contato para
                apresentar as melhores condições do Residencial Venezia.
              </p>
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
                {enviando ? "Enviando..." : "Enviar para WhatsApp"}
              </button>
              <p className="text-white/30 text-xs text-center">
                Ao enviar, você será redirecionado ao WhatsApp da Central de Vendas.
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
              src={IMAGENS.logoVenezia}
              alt="Residencial Venezia"
              className="h-12 w-auto brightness-0 invert mb-4"
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
              <img
                src={IMAGENS.logoArtea}
                alt="ARTEÁ Empreendimentos"
                className="h-10 w-auto opacity-80"
              />
              <a
                href="https://www.arteaempreendimentos.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#c62828] hover:text-[#e53935] transition-colors text-sm"
              >
                <ExternalLink size={14} />
                www.arteaempreendimentos.com.br
              </a>
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
            © 2025 ARTEÁ Empreendimentos. Todos os direitos reservados.
          </p>
          <p className="text-white/30 text-xs">
            Imagens meramente ilustrativas. Valores sujeitos a alteração.
          </p>
        </div>
      </div>
    </footer>
  );
}
