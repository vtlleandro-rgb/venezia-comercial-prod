/*
 * GALERIA DO EMPREENDIMENTO — RESIDENCIAL VENEZIA
 * 12 categorias + vídeo | material oficial (release midia-venezia), assets em WebP
 */

import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { X, ChevronLeft, ChevronRight, ZoomIn, Play } from "lucide-react";

interface GaleriaImage {
  id: string;
  src: string;
  alt: string;
}

interface GaleriaCategory {
  id: string;
  titulo: string;
  imagens: GaleriaImage[];
  video?: string;
}

const GALERIA: GaleriaCategory[] = [
  {
    id: "video",
    titulo: "Vídeo de Apresentação",
    imagens: [],
    video: "/assets/venezia/venezia-apresentacao.mp4",
  },
  {
    id: "fachadas-diurnas",
    titulo: "Fachadas Diurnas",
    imagens: [
      { id: "IMG-01", src: "/assets/venezia/fachada-01-dia.webp", alt: "Fachada 01 — diurna" },
      { id: "IMG-02", src: "/assets/venezia/fachada-02.webp", alt: "Fachada 02" },
      { id: "IMG-03", src: "/assets/venezia/fachada-03.webp", alt: "Fachada 03" },
      { id: "IMG-04", src: "/assets/venezia/fachada-04-dia.webp", alt: "Fachada 04 — diurna" },
    ],
  },
  {
    id: "noturnas",
    titulo: "Imagens Noturnas",
    imagens: [
      { id: "IMG-05", src: "/assets/venezia/fachada-01-noite.webp", alt: "Fachada 01 — noturna" },
      { id: "IMG-06", src: "/assets/venezia/fachada-04-noite.webp", alt: "Fachada 04 — noturna" },
    ],
  },
  {
    id: "living-tipo1",
    titulo: "Living — Apto Tipo 1",
    imagens: [
      { id: "IMG-07", src: "/assets/venezia/apto-1-living-1.webp", alt: "Living Apto Tipo 1 — ângulo 1" },
      { id: "IMG-08", src: "/assets/venezia/apto-1-living-2.webp", alt: "Living Apto Tipo 1 — ângulo 2" },
      { id: "IMG-09", src: "/assets/venezia/apto-1-living-3.webp", alt: "Living Apto Tipo 1 — ângulo 3" },
      { id: "IMG-10", src: "/assets/venezia/apto-1-living-4.webp", alt: "Living Apto Tipo 1 — ângulo 4" },
      { id: "IMG-11", src: "/assets/venezia/apto-1-sacada.webp", alt: "Sacada Apto Tipo 1" },
    ],
  },
  {
    id: "living-tipo23",
    titulo: "Living — Apto Tipo 2 e 3",
    imagens: [
      { id: "IMG-12", src: "/assets/venezia/apto-2-e-3-living-1.webp", alt: "Living Apto Tipo 2/3 — ângulo 1" },
      { id: "IMG-13", src: "/assets/venezia/apto-2-e-3-living-2.webp", alt: "Living Apto Tipo 2/3 — ângulo 2" },
      { id: "IMG-14", src: "/assets/venezia/apto-2-e-3-living-3.webp", alt: "Living Apto Tipo 2/3 — ângulo 3" },
      { id: "IMG-15", src: "/assets/venezia/apto-2-e-3-living-4.webp", alt: "Living Apto Tipo 2/3 — ângulo 4" },
    ],
  },
  {
    id: "suite-casal",
    titulo: "Suíte Casal",
    imagens: [
      { id: "IMG-16", src: "/assets/venezia/apto-1-quarto-casal-b1.webp", alt: "Suíte casal Apto Tipo 1 — ângulo B1" },
      { id: "IMG-17", src: "/assets/venezia/apto-1-quarto-casal-b2.webp", alt: "Suíte casal Apto Tipo 1 — ângulo B2" },
      { id: "IMG-18", src: "/assets/venezia/apto-2-e-3-quarto-casal-a1.webp", alt: "Suíte casal Apto Tipo 2/3 — ângulo A1" },
      { id: "IMG-19", src: "/assets/venezia/apto-2-e-3-apto-quarto-casal-a2.webp", alt: "Suíte casal Apto Tipo 2/3 — ângulo A2" },
    ],
  },
  {
    id: "suite-solteiro",
    titulo: "Suíte Solteiro",
    imagens: [
      { id: "IMG-20", src: "/assets/venezia/apto-1-quarto-solteiro-1.webp", alt: "Suíte solteiro Apto Tipo 1 — ângulo 1" },
      { id: "IMG-21", src: "/assets/venezia/apto-1-quarto-solteiro-2.webp", alt: "Suíte solteiro Apto Tipo 1 — ângulo 2" },
    ],
  },
  {
    id: "espaco-gourmet",
    titulo: "Espaço Gourmet",
    imagens: [
      { id: "IMG-22", src: "/assets/venezia/lazer-gourmet-1.webp", alt: "Espaço Gourmet — ângulo 1" },
      { id: "IMG-23", src: "/assets/venezia/lazer-gourmet-2.webp", alt: "Espaço Gourmet — ângulo 2" },
      { id: "IMG-24", src: "/assets/venezia/lazer-gourmet-3.webp", alt: "Espaço Gourmet — ângulo 3" },
      { id: "IMG-25", src: "/assets/venezia/lazer-gourmet-4.webp", alt: "Espaço Gourmet — ângulo 4" },
      { id: "IMG-26", src: "/assets/venezia/lazer-gourmet-5.webp", alt: "Espaço Gourmet — ângulo 5" },
    ],
  },
  {
    id: "academia",
    titulo: "Academia",
    imagens: [
      { id: "IMG-27", src: "/assets/venezia/lazer-academia-1.webp", alt: "Academia — ângulo 1" },
      { id: "IMG-28", src: "/assets/venezia/lazer-academia-2.webp", alt: "Academia — ângulo 2" },
      { id: "IMG-29", src: "/assets/venezia/lazer-academia-3.webp", alt: "Academia — ângulo 3" },
    ],
  },
  {
    id: "brinquedoteca",
    titulo: "Brinquedoteca",
    imagens: [
      { id: "IMG-30", src: "/assets/venezia/lazer-brinquedoteca-1.webp", alt: "Brinquedoteca — ângulo 1" },
      { id: "IMG-31", src: "/assets/venezia/lazer-brinquedoteca-2.webp", alt: "Brinquedoteca — ângulo 2" },
      { id: "IMG-32", src: "/assets/venezia/lazer-brinquedoteca-3.webp", alt: "Brinquedoteca — ângulo 3" },
    ],
  },
  {
    id: "terraco-rooftop",
    titulo: "Terraço (Rooftop)",
    imagens: [
      { id: "IMG-33", src: "/assets/venezia/lazer-rooftop-1.webp", alt: "Terraço / Rooftop — ângulo 1" },
      { id: "IMG-34", src: "/assets/venezia/lazer-rooftop-2.webp", alt: "Terraço / Rooftop — ângulo 2" },
      { id: "IMG-35", src: "/assets/venezia/lazer-rooftop-3.webp", alt: "Terraço / Rooftop — ângulo 3" },
    ],
  },
  {
    id: "pet-bicicletario",
    titulo: "Pet Place e Bicicletário",
    imagens: [
      { id: "IMG-36", src: "/assets/venezia/terreo-pet-place.webp", alt: "Espaço Pet — térreo" },
      { id: "IMG-37", src: "/assets/venezia/terreo-bicicletario.webp", alt: "Bicicletário — térreo" },
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
                {cat.video
                  ? <span className="ml-1 opacity-60"><Play size={10} className="inline" /></span>
                  : <span className="ml-1 opacity-60">({cat.imagens.length})</span>
                }
              </button>
            ))}
          </div>
        </div>

        {/* Video Player or Image Grid */}
        {categoriaAtual.video ? (
          <div className="flex flex-col items-center">
            {/* preload="none" + poster: os 33 MB só descem quando o visitante dá play */}
            <video
              src={categoriaAtual.video}
              controls
              playsInline
              preload="none"
              poster="/assets/venezia/venezia-apresentacao-poster.webp"
              className="w-full max-w-md rounded-lg shadow-lg bg-black"
            />
            <p className="text-gray-400 text-xs mt-4">{categoriaAtual.titulo}</p>
          </div>
        ) : (
          <>
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
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-xs">
                {categoriaAtual.titulo} — {imagens.length} {imagens.length === 1 ? "imagem" : "imagens"}
              </p>
            </div>
          </>
        )}
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
