import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

/* ===================================================================
   IMPLANTAÇÃO E TIPOLOGIAS — Residencial Venezia
   Seção exclusiva conforme prompt:
   - Implantação Geral (térreo)
   - Pavimento Tipo
   - Rooftop
   - Tipologia Final 01
   - Tipologia Final 02
   - Tipologia Final 03
   Sem crop, sem zoom automático, proporção original integral.
   =================================================================== */

interface PlantaItem {
  id: string;
  titulo: string;
  descricao: string;
  imagem: string;
}

const PLANTAS: PlantaItem[] = [
  {
    id: "implantacao-terreo",
    titulo: "Implantação — Pavimento Térreo / Garagens",
    descricao: "12 vagas de garagem, bicicletário, espaço pet, circulação, acesso de pedestres e acesso veicular.",
    imagem: "/assets/venezia/planta-comercial-venezia.png",
  },
  {
    id: "pavimento-tipo",
    titulo: "Pavimento Tipo",
    descricao: "Planta do pavimento tipo com 3 unidades por andar: Final 01 (60,85m²), Final 02 (56,30m²) e Final 03 (56,30m²).",
    imagem: "/assets/venezia/planta-comercial-venezia.png",
  },
  {
    id: "implantacao-rooftop",
    titulo: "Implantação — Pavimento Rooftop",
    descricao: "Espaço gourmet, academia, espaço kids, terraço descoberto, sacadas e WC PCD.",
    imagem: "/assets/venezia/planta-comercial-venezia.png",
  },
  {
    id: "tipologia-final-01",
    titulo: "Tipologia Final 01",
    descricao: "Apartamento com 60,85m² — 2 suítes, living integrado, cozinha americana, sacada com churrasqueira e 1 vaga.",
    imagem: "/assets/venezia/planta-comercial-venezia.png",
  },
  {
    id: "tipologia-final-02",
    titulo: "Tipologia Final 02",
    descricao: "Apartamento com 56,30m² — 2 suítes, living integrado, cozinha americana, sacada com churrasqueira e 1 vaga.",
    imagem: "/assets/venezia/planta-comercial-venezia.png",
  },
  {
    id: "tipologia-final-03",
    titulo: "Tipologia Final 03",
    descricao: "Apartamento com 56,30m² — 2 suítes, planta espelhada do Final 02, sacada com churrasqueira e 1 vaga.",
    imagem: "/assets/venezia/planta-comercial-venezia.png",
  },
];

export default function PlantasSection() {
  const { ref, isVisible } = useScrollAnimation();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openPlanta = (index: number) => setSelectedIndex(index);
  const closePlanta = () => setSelectedIndex(null);

  const navPlanta = (dir: number) => {
    if (selectedIndex === null) return;
    const newIndex = (selectedIndex + dir + PLANTAS.length) % PLANTAS.length;
    setSelectedIndex(newIndex);
  };

  return (
    <section id="plantas" className="py-24 bg-[#f8f7f4]">
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-6 section-fade-in ${isVisible ? "visible" : ""}`}
      >
        <div className="text-center mb-16">
          <p className="text-[#c62828] text-sm font-medium uppercase tracking-widest mb-3">
            Projeto
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-[#1a1a2e] mb-4">
            Implantação e Tipologias
          </h2>
          <div className="italian-divider mx-auto mb-6" />
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Conheça a implantação do empreendimento e as tipologias disponíveis. Clique para ampliar.
          </p>
        </div>

        {/* Grid de Plantas */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLANTAS.map((planta, index) => (
            <div
              key={planta.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
              onClick={() => openPlanta(index)}
            >
              {/* Imagem - proporção original, sem crop */}
              <div className="relative bg-gray-50 p-4">
                <img
                  src={planta.imagem}
                  alt={planta.titulo}
                  className="w-full h-auto object-contain max-h-[300px]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                  <Maximize2
                    className="text-[#1a1a2e] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/80 rounded-full p-2"
                    size={40}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="font-serif text-lg text-[#1a1a2e] font-semibold mb-2">
                  {planta.titulo}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {planta.descricao}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen View - proporção original integral */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closePlanta}
        >
          <button
            onClick={closePlanta}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
          >
            <X size={32} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); navPlanta(-1); }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-2 bg-white/10 rounded-full z-10"
          >
            <ChevronLeft size={36} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navPlanta(1); }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-2 bg-white/10 rounded-full z-10"
          >
            <ChevronRight size={36} />
          </button>

          <div className="flex flex-col items-center px-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={PLANTAS[selectedIndex].imagem}
              alt={PLANTAS[selectedIndex].titulo}
              className="max-w-[90vw] max-h-[80vh] object-contain"
            />
            <div className="mt-4 text-center">
              <p className="text-white/90 text-base font-medium font-serif">
                {PLANTAS[selectedIndex].titulo}
              </p>
              <p className="text-white/50 text-xs mt-1">
                {selectedIndex + 1} / {PLANTAS.length} — {PLANTAS[selectedIndex].descricao}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
