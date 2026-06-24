import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";

interface WhatsAppFloatProps {
  corretor?: {
    nome: string;
    whatsapp: string | null;
    fotoUrl?: string | null;
    imobiliariaNome?: string | null;
  } | null;
}

// WhatsApp padrão da empresa (quando não há corretor vinculado)
const WHATSAPP_PADRAO = "5548996962020";
const NOME_PADRAO = "Residencial Venezia";
const MSG_PADRAO = "Olá! Tenho interesse no Residencial Venezia. Gostaria de mais informações.";

export default function WhatsAppFloat({ corretor }: WhatsAppFloatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Mostrar tooltip após 3 segundos na primeira visita
  useEffect(() => {
    const timer = setTimeout(() => {
      const shown = sessionStorage.getItem("whatsapp-tooltip-shown");
      if (!shown) {
        setShowTooltip(true);
        sessionStorage.setItem("whatsapp-tooltip-shown", "1");
        setTimeout(() => setShowTooltip(false), 5000);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const whatsappNumber = corretor?.whatsapp || WHATSAPP_PADRAO;
  const nomeAtendente = corretor?.nome || NOME_PADRAO;
  const imobiliaria = corretor?.imobiliariaNome || "";

  const mensagem = corretor
    ? `Olá ${corretor.nome}! Acessei o site do Residencial Venezia pelo seu link e gostaria de mais informações.`
    : MSG_PADRAO;

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(mensagem)}`;

  return (
    <>
      {/* Tooltip */}
      {showTooltip && !isOpen && (
        <div className="fixed bottom-24 right-6 z-[9998] animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 px-4 py-3 max-w-[240px]">
            <p className="text-sm text-gray-700">
              {corretor
                ? `Fale direto com ${corretor.nome} pelo WhatsApp!`
                : "Fale conosco pelo WhatsApp!"}
            </p>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45" />
          </div>
        </div>
      )}

      {/* Card expandido */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[9998] animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[320px] overflow-hidden">
            {/* Header */}
            <div className="bg-[#075e54] px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                {corretor?.fotoUrl ? (
                  <img src={corretor.fotoUrl} alt={nomeAtendente} className="w-full h-full object-cover" />
                ) : (
                  <MessageCircle size={20} className="text-white" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{nomeAtendente}</p>
                {imobiliaria && <p className="text-white/70 text-xs">{imobiliaria}</p>}
                <p className="text-emerald-300 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  Online agora
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 bg-[#ece5dd]">
              <div className="bg-white rounded-lg rounded-tl-none px-4 py-3 shadow-sm max-w-[85%]">
                <p className="text-sm text-gray-700">
                  Olá! 👋 Sou {corretor ? corretor.nome : "o atendimento"} do Residencial Venezia.
                  Como posso ajudá-lo(a)?
                </p>
                <p className="text-[10px] text-gray-400 mt-1 text-right">agora</p>
              </div>
            </div>

            {/* CTA */}
            <div className="p-4 border-t border-gray-100">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#1da851] text-white font-medium py-3 px-4 rounded-full transition-all duration-200 transform active:scale-[0.97]"
              >
                <MessageCircle size={18} />
                Iniciar conversa
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Botão flutuante */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        className={`fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95 ${
          isOpen
            ? "bg-gray-600 hover:bg-gray-700 rotate-0"
            : "bg-[#25d366] hover:bg-[#1da851]"
        }`}
        aria-label="WhatsApp"
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <MessageCircle size={24} className="text-white" />
        )}
      </button>

      {/* Pulse animation quando não aberto */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-[9998] w-14 h-14 rounded-full bg-[#25d366] animate-ping opacity-20 pointer-events-none" />
      )}
    </>
  );
}
