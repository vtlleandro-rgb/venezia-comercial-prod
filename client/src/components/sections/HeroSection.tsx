import { IMAGENS, EMPREENDIMENTO } from "@/data/empreendimento";

export default function HeroSection() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={IMAGENS.heroBanner}
          alt="Residencial Venezia"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <img
          src={IMAGENS.logoVenezia}
          alt="Residencial Venezia"
          className="h-24 md:h-32 w-auto mx-auto mb-8 brightness-0 invert drop-shadow-lg"
        />
        
        <p className="text-white/80 text-lg md:text-xl font-light tracking-wide mb-2 font-sans">
          {EMPREENDIMENTO.localizacao}
        </p>

        <h1 className="text-white text-3xl md:text-5xl font-serif font-semibold mt-4 mb-6 leading-tight">
          Elegância, exclusividade e conforto<br />em cada detalhe.
        </h1>

        <div className="italian-divider mx-auto mb-8" />

        <p className="text-white/70 text-base md:text-lg font-light max-w-2xl mx-auto mb-10">
          Apartamentos de 2 suítes com {EMPREENDIMENTO.areaPrivativaMin} a {EMPREENDIMENTO.areaPrivativaMax} m² de área privativa.
          Sacada com churrasqueira, elevador e rooftop exclusivo.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => scrollTo("tabela")}
            className="bg-white text-[#1a1a2e] px-8 py-3 rounded font-medium text-sm hover:bg-white/90 transition-all duration-200 active:scale-[0.97]"
          >
            Ver Disponibilidade
          </button>
          <button
            onClick={() => scrollTo("simulador")}
            className="border border-white/40 text-white px-8 py-3 rounded font-medium text-sm hover:bg-white/10 transition-all duration-200 active:scale-[0.97]"
          >
            Simular Proposta
          </button>
          <button
            onClick={() => scrollTo("empreendimento")}
            className="border border-white/40 text-white px-8 py-3 rounded font-medium text-sm hover:bg-white/10 transition-all duration-200 active:scale-[0.97]"
          >
            Conhecer o Empreendimento
          </button>
        </div>

        {/* Key Numbers */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "12", label: "Unidades" },
            { value: "2", label: "Suítes" },
            { value: "57m²", label: "Até" },
            { value: "R$ 375k", label: "A partir de" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-white text-2xl md:text-3xl font-semibold font-sans">{item.value}</p>
              <p className="text-white/50 text-xs mt-1 uppercase tracking-wider">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
