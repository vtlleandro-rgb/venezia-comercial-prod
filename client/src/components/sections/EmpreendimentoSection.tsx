import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { EMPREENDIMENTO } from "@/data/empreendimento";
import { Building2, Users, Ruler, Car } from "lucide-react";

export default function EmpreendimentoSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="empreendimento" className="py-24 bg-white">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto px-6 section-fade-in ${isVisible ? "visible" : ""}`}
      >
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#c62828] text-sm font-medium uppercase tracking-widest mb-3">
            O Empreendimento
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-[#1a1a2e] mb-4">
            Residencial Venezia
          </h2>
          <div className="italian-divider mx-auto mb-6" />
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Inspirado na elegância italiana, o Residencial Venezia é um empreendimento exclusivo da ARTEÁ Empreendimentos,
            projetado para quem valoriza qualidade de vida, conforto e sofisticação. Com arquitetura contemporânea
            assinada por Cadu Cavalheiro, cada detalhe foi pensado para proporcionar uma experiência de morar única.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative rounded-lg overflow-hidden shadow-xl">
            <img
              src="/assets/venezia/placeholder.svg"
              alt="Fachada Residencial Venezia"
              className="w-full h-[400px] object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <p className="text-white font-serif text-xl">Arquitetura Contemporânea</p>
              <p className="text-white/70 text-sm">Projeto exclusivo e sofisticado</p>
            </div>
          </div>

          {/* Info Cards */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#f8f7f4] p-5 rounded-lg">
                <Building2 className="text-[#c62828] mb-3" size={24} />
                <p className="text-2xl font-semibold text-[#1a1a2e]">{EMPREENDIMENTO.totalUnidades}</p>
                <p className="text-gray-500 text-sm">Unidades Exclusivas</p>
              </div>
              <div className="bg-[#f8f7f4] p-5 rounded-lg">
                <Users className="text-[#c62828] mb-3" size={24} />
                <p className="text-2xl font-semibold text-[#1a1a2e]">{EMPREENDIMENTO.dormitorios} Suítes</p>
                <p className="text-gray-500 text-sm">Por Apartamento</p>
              </div>
              <div className="bg-[#f8f7f4] p-5 rounded-lg">
                <Ruler className="text-[#c62828] mb-3" size={24} />
                <p className="text-2xl font-semibold text-[#1a1a2e]">{EMPREENDIMENTO.areaPrivativaMin} - {EMPREENDIMENTO.areaPrivativaMax}</p>
                <p className="text-gray-500 text-sm">m² Área Privativa</p>
              </div>
              <div className="bg-[#f8f7f4] p-5 rounded-lg">
                <Car className="text-[#c62828] mb-3" size={24} />
                <p className="text-2xl font-semibold text-[#1a1a2e]">1 Vaga</p>
                <p className="text-gray-500 text-sm">Garagem Coberta</p>
              </div>
            </div>

            <div className="bg-[#1a1a2e] p-6 rounded-lg text-white">
              <h3 className="font-serif text-xl mb-3">Perfil do Empreendimento</h3>
              <ul className="space-y-2 text-white/80 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c62828] rounded-full" />
                  {EMPREENDIMENTO.pavimentos}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#1b5e20] rounded-full" />
                  Elevador e portaria inteligente
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c62828] rounded-full" />
                  Sacada com churrasqueira em todas as unidades
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#1b5e20] rounded-full" />
                  Rooftop exclusivo com vista panorâmica
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c62828] rounded-full" />
                  Área de lazer completa no empreendimento
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
