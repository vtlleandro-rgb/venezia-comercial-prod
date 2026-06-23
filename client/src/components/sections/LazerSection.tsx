import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Sun, PartyPopper, Dumbbell, Gamepad2, Baby, PawPrint, Bike, DoorOpen } from "lucide-react";

const lazerItems = [
  { nome: "Rooftop", icone: Sun, img: "/assets/venezia/card-placeholder.svg", desc: "Terraço panorâmico com vista privilegiada" },
  { nome: "Salão de Festas", icone: PartyPopper, img: "/assets/venezia/card-placeholder.svg", desc: "Espaço amplo e sofisticado para eventos" },
  { nome: "Academia", icone: Dumbbell, img: "/assets/venezia/card-placeholder.svg", desc: "Equipamentos modernos e ambiente climatizado" },
  { nome: "Sala de Jogos", icone: Gamepad2, img: "/assets/venezia/card-placeholder.svg", desc: "Entretenimento para toda a família" },
  { nome: "Brinquedoteca", icone: Baby, img: "/assets/venezia/card-placeholder.svg", desc: "Espaço lúdico e seguro para crianças" },
  { nome: "Pet Place", icone: PawPrint, img: "/assets/venezia/card-placeholder.svg", desc: "Área exclusiva para seus pets" },
  { nome: "Bicicletário", icone: Bike, img: "/assets/venezia/card-placeholder.svg", desc: "Estacionamento seguro para bicicletas" },
  { nome: "Hall de Entrada", icone: DoorOpen, img: "/assets/venezia/card-placeholder.svg", desc: "Recepção elegante e moderna" },
];

export default function LazerSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 bg-white">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto px-6 section-fade-in ${isVisible ? "visible" : ""}`}
      >
        <div className="text-center mb-16">
          <p className="text-[#c62828] text-sm font-medium uppercase tracking-widest mb-3">
            Área de Lazer
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-[#1a1a2e] mb-4">
            Lifestyle & Conforto
          </h2>
          <div className="italian-divider mx-auto mb-6" />
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Espaços pensados para proporcionar qualidade de vida, lazer e convivência
            para toda a família.
          </p>
        </div>

        {/* Rooftop Highlight - usando imagem real do rooftop */}
        <div className="relative rounded-lg overflow-hidden mb-12 shadow-xl">
          <img
            src="/assets/venezia/card-placeholder.svg"
            alt="Rooftop Residencial Venezia"
            className="w-full h-[300px] md:h-[400px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <p className="text-white font-serif text-2xl md:text-3xl">
              Rooftop Exclusivo
            </p>
            <p className="text-white/70 text-sm mt-2">
              Área gourmet, deck panorâmico e vista privilegiada no terraço do empreendimento.
            </p>
          </div>
        </div>

        {/* Amenities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {lazerItems.map((item) => {
            const Icon = item.icone;
            return (
              <div
                key={item.nome}
                className="group relative overflow-hidden rounded-lg aspect-[4/3]"
              >
                <img
                  src={item.img}
                  alt={item.nome}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={16} className="text-white/80" />
                    <p className="text-white font-medium text-sm">{item.nome}</p>
                  </div>
                  <p className="text-white/60 text-xs">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
