import Navigation from "@/components/Navigation";
import HeroSection from "@/components/sections/HeroSection";
import EmpreendimentoSection from "@/components/sections/EmpreendimentoSection";
import DiferenciaisSection from "@/components/sections/DiferenciaisSection";
import GaleriaSection from "@/components/sections/GaleriaSection";
import PlantasSection from "@/components/sections/PlantasSection";
import TabelaSection from "@/components/sections/TabelaSection";
import SimuladorSection from "@/components/sections/SimuladorSection";
import DashboardSection from "@/components/sections/DashboardSection";
import LocalizacaoSection from "@/components/sections/LocalizacaoSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Main Content - offset for sidebar on desktop */}
      <main className="lg:ml-64">
        <HeroSection />
        <EmpreendimentoSection />
        <DiferenciaisSection />
        <GaleriaSection />
        <PlantasSection />
        <TabelaSection />
        <SimuladorSection />
        <DashboardSection />
        <LocalizacaoSection />
        <Footer />
      </main>
    </div>
  );
}
