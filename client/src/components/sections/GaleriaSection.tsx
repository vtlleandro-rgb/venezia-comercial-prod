/*
 * GALERIA DO EMPREENDIMENTO — RESIDENCIAL VENEZIA
 * 12 categorias conforme documento de catalogação oficial
 * 55 imagens totais, mapeadas por página do PDF
 */

import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface GaleriaImage {
  id: string;
  src: string;
  alt: string;
}

interface GaleriaCategory {
  id: string;
  titulo: string;
  imagens: GaleriaImage[];
}

const GALERIA: GaleriaCategory[] = [
  {
    id: "fachadas-diurnas",
    titulo: "Fachadas Diurnas",
    imagens: [
      { id: "IMG-01", src: "/assets/venezia/placeholder.svg", alt: "Fachada frontal do edifício (render 3D)" },
      { id: "IMG-02", src: "/assets/venezia/placeholder.svg", alt: "Fachada lateral/posterior (ângulo lateral esquerdo)" },
      { id: "IMG-03", src: "/assets/venezia/placeholder.svg", alt: "Fachada frontal (vista da rua com carros)" },
      { id: "IMG-04", src: "/assets/venezia/placeholder.svg", alt: "Fachada frontal (vista da rua, ângulo alternativo)" },
      { id: "IMG-05", src: "/assets/venezia/placeholder.svg", alt: "Fachada frontal (vista centralizada com carros)" },
      { id: "IMG-06", src: "/assets/venezia/placeholder.svg", alt: "Fachada frontal (ângulo lateral direito, foco na entrada)" },
      { id: "IMG-07", src: "/assets/venezia/placeholder.svg", alt: "Detalhe da entrada/portaria (close na guarita e portão)" },
      { id: "IMG-08", src: "/assets/venezia/placeholder.svg", alt: "Fachada frontal (vista com portão basculante)" },
      { id: "IMG-09", src: "/assets/venezia/placeholder.svg", alt: "Fachada lateral/fundos (ângulo lateral esquerdo com sacadas)" },
      { id: "IMG-10", src: "/assets/venezia/placeholder.svg", alt: "Fachada lateral/fundos (ângulo oposto com acesso à garagem)" },
      { id: "IMG-11", src: "/assets/venezia/placeholder.svg", alt: "Vista aérea/perspectiva superior (vista elevada frontal)" },
      { id: "IMG-12", src: "/assets/venezia/placeholder.svg", alt: "Vista aérea posterior (fundos com estacionamento térreo)" },
      { id: "IMG-13", src: "/assets/venezia/placeholder.svg", alt: "Vista aérea posterior (foco na área técnica)" },
      { id: "IMG-14", src: "/assets/venezia/placeholder.svg", alt: "Vista aérea lateral (ângulo lateral com sacadas)" },
    ],
  },
  {
    id: "noturnas",
    titulo: "Imagens Noturnas",
    imagens: [
      { id: "IMG-15", src: "/assets/venezia/placeholder.svg", alt: "Fachada frontal noturna (entardecer/céu nublado)" },
      { id: "IMG-16", src: "/assets/venezia/placeholder.svg", alt: "Fachada frontal noturna (vista centralizada com iluminação)" },
      { id: "IMG-17", src: "/assets/venezia/placeholder.svg", alt: "Fachada frontal noturna (ângulo lateral com iluminação)" },
    ],
  },
  {
    id: "living-tipo1",
    titulo: "Living — Apto Tipo 1",
    imagens: [
      { id: "IMG-18", src: "/assets/venezia/placeholder.svg", alt: "Living/sala integrada com cozinha (sofá, TV, mesa de jantar)" },
      { id: "IMG-19", src: "/assets/venezia/placeholder.svg", alt: "Cozinha/jantar (mesa de jantar em madeira, cozinha planejada)" },
      { id: "IMG-20", src: "/assets/venezia/placeholder.svg", alt: "Cozinha (bancada, geladeira, fogão)" },
      { id: "IMG-21", src: "/assets/venezia/placeholder.svg", alt: "Cozinha/jantar (vista da pia para mesa de jantar)" },
      { id: "IMG-22", src: "/assets/venezia/placeholder.svg", alt: "Área de serviço/lavanderia com sacada" },
    ],
  },
  {
    id: "living-tipo23",
    titulo: "Living — Apto Tipo 2 e 3",
    imagens: [
      { id: "IMG-23", src: "/assets/venezia/placeholder.svg", alt: "Living/sala integrada (painel ripado, TV, sofá branco)" },
      { id: "IMG-24", src: "/assets/venezia/placeholder.svg", alt: "Living/sala integrada (ângulo oposto, sacada ao fundo)" },
      { id: "IMG-25", src: "/assets/venezia/placeholder.svg", alt: "Cozinha (fogão, bancada, máquina de lavar)" },
      { id: "IMG-26", src: "/assets/venezia/placeholder.svg", alt: "Cozinha (geladeira preta, mesa de jantar)" },
      { id: "IMG-27", src: "/assets/venezia/placeholder.svg", alt: "Cozinha/área de serviço (pia, máquina de lavar, sacada)" },
    ],
  },
  {
    id: "suite-casal",
    titulo: "Suíte Casal",
    imagens: [
      { id: "IMG-28", src: "/assets/venezia/placeholder.svg", alt: "Suíte casal (cama, armário porta de vidro, painel ripado escuro)" },
      { id: "IMG-29", src: "/assets/venezia/placeholder.svg", alt: "Suíte casal (ângulo oposto com TV, porta do banheiro)" },
      { id: "IMG-30", src: "/assets/venezia/placeholder.svg", alt: "Suíte casal (vista frontal, quadro decorativo, armário vidro)" },
      { id: "IMG-31", src: "/assets/venezia/placeholder.svg", alt: "Suíte casal Tipo 2/3 (armário madeira, painel ripado, quadro)" },
      { id: "IMG-32", src: "/assets/venezia/placeholder.svg", alt: "Suíte casal Tipo 2/3 (ângulo oposto, espelho, TV, quadro)" },
      { id: "IMG-33", src: "/assets/venezia/placeholder.svg", alt: "Suíte casal Tipo 2/3 (painel ripado, TV, armário madeira)" },
    ],
  },
  {
    id: "suite-solteiro",
    titulo: "Suíte Solteiro",
    imagens: [
      { id: "IMG-34", src: "/assets/venezia/placeholder.svg", alt: "Suíte solteiro (cama, TV, ar-condicionado, acesso ao banheiro)" },
    ],
  },
  {
    id: "espaco-gourmet",
    titulo: "Espaço Gourmet",
    imagens: [
      { id: "IMG-35", src: "/assets/venezia/placeholder.svg", alt: "Espaço Gourmet (mesa grande, cozinha ao fundo, quadros)" },
      { id: "IMG-36", src: "/assets/venezia/placeholder.svg", alt: "Espaço Gourmet (ilha com banquetas, geladeira, sacada)" },
      { id: "IMG-37", src: "/assets/venezia/placeholder.svg", alt: "Espaço Gourmet (bancada com fogão, banquetas, área externa)" },
      { id: "IMG-38", src: "/assets/venezia/placeholder.svg", alt: "Espaço Gourmet (churrasqueira, mesa grande, bancada)" },
    ],
  },
  {
    id: "academia",
    titulo: "Academia",
    imagens: [
      { id: "IMG-39", src: "/assets/venezia/placeholder.svg", alt: "Academia (saco de pancada, esteira, bicicleta, neon Fitness)" },
      { id: "IMG-40", src: "/assets/venezia/placeholder.svg", alt: "Academia (halteres, esteira, saco de pancada, neon)" },
      { id: "IMG-41", src: "/assets/venezia/placeholder.svg", alt: "Academia (saco de pancada, luvas, banco, espelho)" },
    ],
  },
  {
    id: "brinquedoteca",
    titulo: "Brinquedoteca",
    imagens: [
      { id: "IMG-42", src: "/assets/venezia/placeholder.svg", alt: "Brinquedoteca (parede azul, árvore decorativa, mesinha infantil)" },
      { id: "IMG-43", src: "/assets/venezia/placeholder.svg", alt: "Brinquedoteca (TV, caixas coloridas, prateleiras com brinquedos)" },
    ],
  },
  {
    id: "terraco-rooftop",
    titulo: "Terraço (Rooftop)",
    imagens: [
      { id: "IMG-44", src: "/assets/venezia/placeholder.svg", alt: "Terraço/Rooftop (vista aérea com pérgola, mesa, playground)" },
      { id: "IMG-45", src: "/assets/venezia/placeholder.svg", alt: "Terraço/Rooftop (vista frontal com pérgola, mesa, plantas)" },
      { id: "IMG-46", src: "/assets/venezia/placeholder.svg", alt: "Terraço/Rooftop (vista lateral com sofá, mesa, pérgola)" },
      { id: "IMG-47", src: "/assets/venezia/placeholder.svg", alt: "Terraço/Rooftop (mesa redonda, sofá, cadeiras, plantas)" },
    ],
  },
  {
    id: "pet-bicicletario",
    titulo: "Pet Place e Bicicletário",
    imagens: [
      { id: "IMG-48", src: "/assets/venezia/placeholder.svg", alt: "Espaço Pet (área com portão, grama, circuito pet)" },
      { id: "IMG-49", src: "/assets/venezia/placeholder.svg", alt: "Bicicletário (garagem com suportes de parede para bicicletas)" },
    ],
  },
];

export default function GaleriaSection() {
  const { ref, isVisible } = useScrollAnimation();
  const [categoriaAtiva, setCategoriaAtiva] = useState(GALERIA[0].id);
  const [lightbox, setLightbox] = useState<{ index: number } | null>(null);

  const categoriaAtual = GALERIA.find((c) => c.id === categoriaAtiva)!;
  const imagens = categoriaAtual.imagens;
  const totalImagens = GALERIA.reduce((acc, cat) => acc + cat.imagens.length, 0);

  const openLightbox = (index: number) => setLightbox({ index });
  const closeLightbox = () => setLightbox(null);
  const navLightbox = (dir: number) => {
    if (!lightbox) return;
    setLightbox({ index: (lightbox.index + dir + imagens.length) % imagens.length });
  };

  return (
    <section id="galeria" className="py-24 bg-[#f8f7f4]">
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-6 section-fade-in ${isVisible ? "visible" : ""}`}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#c62828] text-sm font-medium uppercase tracking-widest mb-3">
            Galeria
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-[#1a1a2e] mb-4">
            Imagens do Empreendimento
          </h2>
          <div className="italian-divider mx-auto mb-6" />
          <p className="text-gray-500 text-sm">
            {totalImagens} imagens em {GALERIA.length} categorias
          </p>
        </div>

        {/* Category Navigation */}
        <div className="overflow-x-auto pb-2 mb-10 -mx-6 px-6">
          <div className="flex gap-2 min-w-max">
            {GALERIA.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setCategoriaAtiva(cat.id); setLightbox(null); }}
                className={`px-4 py-2 text-xs font-medium rounded-full whitespace-nowrap transition-all duration-200 ${
                  categoriaAtiva === cat.id
                    ? "bg-[#1a1a2e] text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {cat.titulo}
                <span className="ml-1 opacity-60">({cat.imagens.length})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {imagens.map((img, idx) => (
            <div
              key={img.id}
              onClick={() => openLightbox(idx)}
              className="group relative overflow-hidden rounded-lg cursor-pointer bg-gray-100"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={28} />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-[11px] font-medium">{img.id}</p>
                <p className="text-white/80 text-[10px]">{img.alt}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Counter */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs">
            {categoriaAtual.titulo} — {imagens.length} {imagens.length === 1 ? "imagem" : "imagens"}
          </p>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
          >
            <X size={32} />
          </button>

          {imagens.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); navLightbox(-1); }}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-white/10 rounded-full z-10"
              >
                <ChevronLeft size={36} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navLightbox(1); }}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-white/10 rounded-full z-10"
              >
                <ChevronRight size={36} />
              </button>
            </>
          )}

          <div className="flex flex-col items-center px-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={imagens[lightbox.index].src}
              alt={imagens[lightbox.index].alt}
              className="max-w-[90vw] max-h-[80vh] object-contain"
            />
            <div className="mt-4 text-center">
              <p className="text-white/90 text-sm font-medium">{imagens[lightbox.index].id}</p>
              <p className="text-white/60 text-xs mt-1">{imagens[lightbox.index].alt}</p>
              <p className="text-white/40 text-[10px] mt-1">
                {lightbox.index + 1} / {imagens.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
