/*
 * GALERIA DO EMPREENDIMENTO — RESIDENCIAL VENEZIA
 * Assets reais disponíveis no projeto, sem duplicar imagens com legendas falsas.
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
    id: "fachada",
    titulo: "Fachada",
    imagens: [
      { id: "FACHADA-01", src: "/assets/venezia/fachada-venezia-oficial.jpg", alt: "Fachada oficial do Residencial Venezia" },
      { id: "FACHADA-02", src: "/assets/venezia/hero-fachada-real.jpg", alt: "Perspectiva renderizada da fachada do Residencial Venezia" },
    ],
  },
  {
    id: "localizacao",
    titulo: "Localização",
    imagens: [
      { id: "LOCAL-01", src: "/assets/venezia/localizacao-venezia-oficial.jpg", alt: "Mapa oficial de localização do Residencial Venezia" },
      { id: "LOCAL-02", src: "/assets/venezia/venezia-location.jpg", alt: "Imagem de apoio da localização e entorno" },
    ],
  },
  {
    id: "plantas",
    titulo: "Plantas e Áreas",
    imagens: [
      { id: "PLANTA-01", src: "/assets/venezia/planta-comercial-venezia.png", alt: "Implantação comercial do Residencial Venezia" },
      { id: "PLANTA-02", src: "/assets/venezia/planta-tipo-venezia.jpeg", alt: "Planta tipo do apartamento Venezia" },
      { id: "AREAS-01", src: "/assets/venezia/quadro-areas-venezia.jpeg", alt: "Quadro oficial de áreas privativas das unidades" },
    ],
  },
  {
    id: "identidade",
    titulo: "Identidade",
    imagens: [
      { id: "LOGO-01", src: "/assets/venezia/logo-venezia-oficial.png", alt: "Logo oficial do Residencial Venezia" },
      { id: "LOGO-02", src: "/assets/venezia/logo-blue-real-estate.jpeg", alt: "Logo Blue Real Estate" },
      { id: "LOGO-03", src: "/assets/venezia/logo-rb-construtora.jpeg", alt: "Logo RB Construtora" },
      { id: "LOGO-04", src: "/assets/venezia/logo-artea.png", alt: "Logo Artea" },
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
