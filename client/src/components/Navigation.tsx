import { useState, useEffect } from "react";
import {
  Home,
  Building2,
  LayoutGrid,
  DollarSign,
  Calculator,
  MapPin,
  Menu,
  X,
  Star,
  Image,
  Shield,
  BarChart3,
} from "lucide-react";
import { IMAGENS } from "@/data/empreendimento";

const navItems: Array<{ id: string; label: string; icon: any; isRestricted?: boolean }> = [
  { id: "home", label: "Início", icon: Home },
  { id: "empreendimento", label: "O Empreendimento", icon: Building2 },
  { id: "diferenciais", label: "Diferenciais", icon: Star },
  { id: "galeria", label: "Apresentação", icon: Image },
  { id: "plantas", label: "Implantação", icon: LayoutGrid },
  { id: "tabela", label: "Tabela de Vendas", icon: DollarSign },
  { id: "simulador", label: "Simulador", icon: Calculator },
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "localizacao", label: "Localização", icon: MapPin },
  { id: "acesso-restrito", label: "Acesso Restrito", icon: Shield, isRestricted: true },
];

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [reservasPendentes, setReservasPendentes] = useState(0);

  // Monitorar reservas pendentes via localStorage
  useEffect(() => {
    const checkReservas = () => {
      try {
        const statusData = localStorage.getItem("venezia_unidades_status");
        if (statusData) {
          const statuses = JSON.parse(statusData) as Record<string, string>;
          const count = Object.values(statuses).filter((s) => s === "reservado").length;
          setReservasPendentes(count);
        } else {
          setReservasPendentes(0);
        }
      } catch {
        setReservasPendentes(0);
      }
    };

    checkReservas();
    // Escutar mudanças no localStorage (de outras abas) e custom event
    window.addEventListener("storage", checkReservas);
    window.addEventListener("venezia-status-update", checkReservas);
    // Polling leve a cada 2s para capturar mudanças na mesma aba
    const interval = setInterval(checkReservas, 2000);

    return () => {
      window.removeEventListener("storage", checkReservas);
      window.removeEventListener("venezia-status-update", checkReservas);
      clearInterval(interval);
    };
  }, []);

  const scrollToSection = (id: string) => {
    // Acesso Restrito redireciona para a seção tabela
    const targetId = id === "acesso-restrito" ? "tabela" : id;
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-[#1a1a2e] text-white p-3 rounded-lg shadow-lg"
        aria-label="Menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <nav
        className={`fixed left-0 top-0 h-full w-64 bg-[#1a1a2e] z-40 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-6 flex flex-col items-center gap-3 border-b border-white/10">
          <img
            src={IMAGENS.logoVenezia}
            alt="Residencial Venezia"
            className="h-14 w-auto brightness-0 invert"
          />
          <img
            src={IMAGENS.logoArtea}
            alt="ARTEÁ Empreendimentos"
            className="h-8 w-auto opacity-80"
          />
        </div>

        {/* Nav Items */}
        <div className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            // Badge para Tabela de Vendas e Acesso Restrito quando há reservas pendentes
            const showBadge = reservasPendentes > 0 && (item.id === "tabela" || item.id === "acesso-restrito");
            return (
              <div key={item.id}>
                {item.isRestricted && (
                  <div className="mx-6 my-2 border-t border-white/10" />
                )}
                <button
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all duration-200 relative ${
                    item.isRestricted
                      ? isActive
                        ? "bg-[#c62828]/20 text-[#c62828] border-l-3 border-[#c62828]"
                        : "text-[#c62828]/70 hover:text-[#c62828] hover:bg-[#c62828]/10"
                      : isActive
                      ? "bg-white/10 text-white border-l-3 border-[#c62828]"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {showBadge && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-amber-500 rounded-full animate-pulse shadow-sm">
                      {reservasPendentes}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <p className="text-white/40 text-xs text-center">
            Central Comercial
          </p>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
