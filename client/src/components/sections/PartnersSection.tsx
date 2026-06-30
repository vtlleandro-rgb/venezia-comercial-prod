import { IMAGENS } from "@/data/empreendimento";

const partners = [
  {
    role: "Realização",
    name: "ARTEÁ Empreendimentos Imobiliários",
    logo: IMAGENS.logoArteaColor,
    bgClass: "bg-white",
  },
  {
    role: "Construção",
    name: "RB Construtora",
    logo: IMAGENS.logoRbConstrutora,
    bgClass: "bg-white",
  },
  {
    role: "Vendas",
    name: "Blue Real Estate",
    logo: IMAGENS.logoBlueRealEstate,
    bgClass: "bg-white",
  },
  {
    role: "Incorporação",
    name: "SPE Residencial Venezia",
    logo: IMAGENS.logoVeneziaOficial,
    bgClass: "bg-[#0a0a0a]",
  },
];

export default function PartnersSection() {
  return (
    <section className="bg-gradient-to-b from-[#f8f8f8] to-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Título */}
        <div className="text-center mb-14">
          <p className="text-[#c62828] text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            Quem faz acontecer
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-[#1a1a2e] mb-4">
            Realização e Parceiros
          </h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="h-[2px] w-8 bg-[#2e7d32]" />
            <span className="h-[2px] w-4 bg-white" />
            <span className="h-[2px] w-8 bg-[#c62828]" />
          </div>
        </div>

        {/* Grid de parceiros */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {partners.map((partner) => (
            <div key={partner.role} className="flex flex-col items-center text-center group">
              {/* Card da logo */}
              <div
                className={`${partner.bgClass} w-full aspect-square max-w-[180px] rounded-xl shadow-md border border-gray-100 flex items-center justify-center p-5 transition-all duration-300 group-hover:shadow-lg group-hover:scale-[1.02]`}
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-w-full max-h-full object-contain"
                  loading="lazy"
                />
              </div>
              {/* Texto */}
              <p className="mt-4 text-[#c62828] text-[11px] font-semibold uppercase tracking-widest">
                {partner.role}
              </p>
              <p className="mt-1 text-[#1a1a2e] text-sm font-medium leading-tight">
                {partner.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
