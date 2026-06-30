import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { DIFERENCIAIS } from "@/data/empreendimento";
import {
  Shield, ArrowUpDown, Car, Gem, Flame, BedDouble,
  Maximize, Palette, Building2, Lock, HardHat, TrendingUp,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Shield, ArrowUpDown, Car, Gem, Flame, BedDouble,
  Maximize, Palette, Building2, Lock, HardHat, TrendingUp,
};

export default function DiferenciaisSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="diferenciais" className="py-24 bg-[#f8f7f4]">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto px-6 section-fade-in ${isVisible ? "visible" : ""}`}
      >
        <div className="text-center mb-16">
          <p className="text-[#c62828] text-sm font-medium uppercase tracking-widest mb-3">
            Diferenciais
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-[#1a1a2e] mb-4">
            Projetado para Surpreender
          </h2>
          <div className="italian-divider mx-auto mb-6" />
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Cada detalhe do Residencial Venezia foi pensado para oferecer o máximo em conforto,
            segurança e valorização.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {DIFERENCIAIS.map((item, index) => {
            const Icon = iconMap[item.icone] || Shield;
            return (
              <div
                key={item.titulo}
                className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 text-center group"
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#c62828]/10 flex items-center justify-center group-hover:bg-[#c62828]/20 transition-colors">
                  <Icon size={20} className="text-[#c62828]" />
                </div>
                <p className="text-[#1a1a2e] text-sm font-medium">{item.titulo}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
