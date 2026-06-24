import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { MapPin, Car, School, ShoppingBag, Heart, Waves } from "lucide-react";
import { IMAGENS } from "@/data/empreendimento";

const pontosProximos = [
  { icone: Waves, nome: "Praias de Tijucas", distancia: "5 min" },
  { icone: ShoppingBag, nome: "Comércio Local", distancia: "3 min" },
  { icone: School, nome: "Escolas e Faculdades", distancia: "5 min" },
  { icone: Heart, nome: "Hospitais e Clínicas", distancia: "8 min" },
  { icone: Car, nome: "BR-101", distancia: "5 min" },
  { icone: MapPin, nome: "Centro de Tijucas", distancia: "7 min" },
];

// Coordenadas exatas conforme link: https://maps.app.goo.gl/qgeKhHQAsptvjv7t6
const VENEZIA_LAT = -27.218892;
const VENEZIA_LNG = -48.634958;

export default function LocalizacaoSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="localizacao" className="py-24 bg-white">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto px-6 section-fade-in ${isVisible ? "visible" : ""}`}
      >
        <div className="text-center mb-12">
          <p className="text-[#c62828] text-sm font-medium uppercase tracking-widest mb-3">
            Localização
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-[#1a1a2e] mb-4">
            Localização Estratégica
          </h2>
          <div className="italian-divider mx-auto mb-6" />
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Rua Maria Arcilande Galancini, Bairro Areias — Tijucas/SC. Uma das regiões com maior
            potencial de valorização do litoral catarinense.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Google Maps Embed com Logo Overlay */}
          <div className="relative rounded-lg overflow-hidden shadow-lg">
            <iframe
              src={`https://www.google.com/maps?q=${VENEZIA_LAT},${VENEZIA_LNG}&z=17&output=embed`}
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização Residencial Venezia"
              className="w-full h-[400px]"
            />
            {/* Logo overlay como marcador visual */}
            <div className="absolute top-3 left-3 bg-[#1a1a2e]/90 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3 shadow-lg border border-white/10">
              <img
                src={IMAGENS.logoVenezia}
                alt="Venezia"
                className="h-8 w-auto"
              />
              <div className="text-white text-xs leading-tight">
                <p className="font-semibold">Residencial Venezia</p>
                <p className="text-white/70">R. Maria Arcilande Galancini</p>
              </div>
            </div>
          </div>

          {/* Points of Interest */}
          <div>
            <h3 className="font-serif text-2xl text-[#1a1a2e] mb-6">Pontos Estratégicos</h3>
            <div className="space-y-4">
              {pontosProximos.map((ponto) => {
                const Icon = ponto.icone;
                return (
                  <div
                    key={ponto.nome}
                    className="flex items-center gap-4 p-4 bg-[#f8f7f4] rounded-lg hover:bg-[#f0efe8] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#c62828]/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-[#c62828]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[#1a1a2e] font-medium text-sm">{ponto.nome}</p>
                    </div>
                    <span className="text-[#c62828] text-sm font-medium">{ponto.distancia}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 p-5 bg-[#1a1a2e] rounded-lg text-white">
              <h4 className="font-serif text-lg mb-2">Potencial de Valorização</h4>
              <p className="text-white/70 text-sm leading-relaxed">
                Tijucas é uma das cidades com maior crescimento imobiliário de Santa Catarina,
                com valorização média de 15-20% ao ano nos últimos 3 anos. A proximidade com
                Balneário Camboriú e a infraestrutura em expansão tornam a região uma das mais
                promissoras do litoral sul do Brasil.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
