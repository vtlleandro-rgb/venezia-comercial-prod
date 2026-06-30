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
import PartnersSection from "@/components/sections/PartnersSection";
import { useCorretor } from "@/hooks/useCorretor";
import WhatsAppFloat from "@/components/WhatsAppFloat";

type CorretorData = NonNullable<ReturnType<typeof useCorretor>["corretor"]>;

interface HomeProps {
  corretorExterno?: CorretorData;
}

export default function Home({ corretorExterno }: HomeProps = {}) {
  const { corretor: corretorQuery } = useCorretor();
  // corretorExterno tem prioridade (vindo de /:slug); fallback para ?corretor=slug
  const corretor = corretorExterno ?? corretorQuery;

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
        <SimuladorSection corretor={corretor} />
        <DashboardSection />
        <LocalizacaoSection />
        <PartnersSection />
        <Footer corretor={corretor} />
      </main>
      <WhatsAppFloat corretor={corretor} />
    </div>
  );
}
