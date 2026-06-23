// Residencial Venezia - Dados do Empreendimento
// Design: Italian Luxury Minimal | ARTEÁ Empreendimentos
// Tabela de Vendas atualizada conforme planilha oficial v1

export const EMPREENDIMENTO = {
  nome: "Residencial Venezia",
  incorporadora: "ARTEÁ Empreendimentos",
  arquitetura: "Cadu Cavalheiro Arquitetura",
  projetos: "Complementary Projetos",
  localizacao: "Loteamento Terra Firme, Bairro Areias, Tijucas/SC",
  totalUnidades: 12,
  blocos: 1,
  pavimentos: "4 Pavimentos (1º ao 4º andar)",
  vagasTotal: 12,
  elevador: true,
  sacadaChurrasqueira: true,
  vgvTotal: 4776000,
  vgvComDocumentacao: 4967040,
  ticketMedio: 398000,
  valorMin: 375000,
  valorMax: 419000,
  areaPrivativaMin: 53.63,
  areaPrivativaMax: 57.29,
  dormitorios: 2,
  suites: 2,
  precoM2Min: 6546,
  precoM2Max: 7813,
};

export const TIPOLOGIAS = [
  {
    id: "final-01",
    nome: "Final 01",
    area: 57.29,
    dormitorios: 2,
    suites: 2,
    vagas: 1,
    destaque: "Diferenciado",
    descricao: "Apartamento com 2 suítes, sacada com churrasqueira, maior área privativa do empreendimento.",
    plantaImg: "/assets/venezia/placeholder.svg",
  },
  {
    id: "final-02",
    nome: "Final 02",
    area: 53.63,
    dormitorios: 2,
    suites: 2,
    vagas: 1,
    destaque: null,
    descricao: "Apartamento com 2 suítes, layout funcional e integrado, excelente iluminação natural.",
    plantaImg: "/assets/venezia/placeholder.svg",
  },
  {
    id: "final-03",
    nome: "Final 03",
    area: 53.63,
    dormitorios: 2,
    suites: 2,
    vagas: 1,
    destaque: null,
    descricao: "Apartamento com 2 suítes, planta espelhada do Final 02, mesma qualidade e acabamento.",
    plantaImg: "/assets/venezia/placeholder.svg",
  },
];

export type UnidadeStatus = "disponivel" | "reservado" | "vendido";

export interface Unidade {
  id: string;
  numero: string;
  andar: number;
  final: string;
  area: number;
  valorVenda: number;
  valorComDocumentacao: number;
  entrada20: number;
  entradaMenosReforco: number;
  parcela36x: number;
  reforcoChaves: number;
  financCEF: number;
  status: UnidadeStatus;
  precoM2: number;
}

// Tabela oficial de vendas (conforme planilha v1):
// Entrada = 20% do VALOR VENDA
// Reforço = R$ 20.000 na entrega das chaves (36 meses)
// Entrada líquida = Entrada 20% - R$ 30.000 (reforço descontado)
// Parcela mensal = Entrada líquida / 37 (ato + 36x)
// Saldo devedor da entrada corrigido pelo INCC-M
// Financiamento CEF = 80% do Valor Venda (Programa MCMV Faixa 3)

export const UNIDADES: Unidade[] = [
  // 1º Andar
  { id: "101", numero: "101", andar: 1, final: "Final 01", area: 57.29, valorVenda: 375000, valorComDocumentacao: 390000, entrada20: 75000, entradaMenosReforco: 55000, parcela36x: 1486.49, reforcoChaves: 20000, financCEF: 300000, status: "disponivel", precoM2: 6546 },
  { id: "102", numero: "102", andar: 1, final: "Final 02", area: 53.63, valorVenda: 375000, valorComDocumentacao: 390000, entrada20: 75000, entradaMenosReforco: 55000, parcela36x: 1486.49, reforcoChaves: 20000, financCEF: 300000, status: "disponivel", precoM2: 6993 },
  { id: "103", numero: "103", andar: 1, final: "Final 03", area: 53.63, valorVenda: 375000, valorComDocumentacao: 390000, entrada20: 75000, entradaMenosReforco: 55000, parcela36x: 1486.49, reforcoChaves: 20000, financCEF: 300000, status: "disponivel", precoM2: 6993 },
  // 2º Andar
  { id: "201", numero: "201", andar: 2, final: "Final 01", area: 57.29, valorVenda: 389000, valorComDocumentacao: 404560, entrada20: 77800, entradaMenosReforco: 57800, parcela36x: 1562.16, reforcoChaves: 20000, financCEF: 311200, status: "disponivel", precoM2: 6789 },
  { id: "202", numero: "202", andar: 2, final: "Final 02", area: 53.63, valorVenda: 389000, valorComDocumentacao: 404560, entrada20: 77800, entradaMenosReforco: 57800, parcela36x: 1562.16, reforcoChaves: 20000, financCEF: 311200, status: "disponivel", precoM2: 7254 },
  { id: "203", numero: "203", andar: 2, final: "Final 03", area: 53.63, valorVenda: 389000, valorComDocumentacao: 404560, entrada20: 77800, entradaMenosReforco: 57800, parcela36x: 1562.16, reforcoChaves: 20000, financCEF: 311200, status: "disponivel", precoM2: 7254 },
  // 3º Andar
  { id: "301", numero: "301", andar: 3, final: "Final 01", area: 57.29, valorVenda: 409000, valorComDocumentacao: 425360, entrada20: 81800, entradaMenosReforco: 61800, parcela36x: 1670.27, reforcoChaves: 20000, financCEF: 327200, status: "disponivel", precoM2: 7138 },
  { id: "302", numero: "302", andar: 3, final: "Final 02", area: 53.63, valorVenda: 409000, valorComDocumentacao: 425360, entrada20: 81800, entradaMenosReforco: 61800, parcela36x: 1670.27, reforcoChaves: 20000, financCEF: 327200, status: "disponivel", precoM2: 7627 },
  { id: "303", numero: "303", andar: 3, final: "Final 03", area: 53.63, valorVenda: 409000, valorComDocumentacao: 425360, entrada20: 81800, entradaMenosReforco: 61800, parcela36x: 1670.27, reforcoChaves: 20000, financCEF: 327200, status: "disponivel", precoM2: 7627 },
  // 4º Andar
  { id: "401", numero: "401", andar: 4, final: "Final 01", area: 57.29, valorVenda: 419000, valorComDocumentacao: 435760, entrada20: 83800, entradaMenosReforco: 63800, parcela36x: 1724.32, reforcoChaves: 20000, financCEF: 335200, status: "disponivel", precoM2: 7313 },
  { id: "402", numero: "402", andar: 4, final: "Final 02", area: 53.63, valorVenda: 419000, valorComDocumentacao: 435760, entrada20: 83800, entradaMenosReforco: 63800, parcela36x: 1724.32, reforcoChaves: 20000, financCEF: 335200, status: "disponivel", precoM2: 7813 },
  { id: "403", numero: "403", andar: 4, final: "Final 03", area: 53.63, valorVenda: 419000, valorComDocumentacao: 435760, entrada20: 83800, entradaMenosReforco: 63800, parcela36x: 1724.32, reforcoChaves: 20000, financCEF: 335200, status: "disponivel", precoM2: 7813 },
];

export const AREAS_LAZER = [
  { nome: "Rooftop", icone: "Sun", descricao: "Terraço panorâmico com vista privilegiada" },
  { nome: "Salão de Festas", icone: "PartyPopper", descricao: "Espaço amplo e sofisticado para eventos" },
  { nome: "Academia", icone: "Dumbbell", descricao: "Equipamentos modernos e ambiente climatizado" },
  { nome: "Sala de Jogos", icone: "Gamepad2", descricao: "Entretenimento para toda a família" },
  { nome: "Brinquedoteca", icone: "Baby", descricao: "Espaço lúdico e seguro para crianças" },
  { nome: "Pet Place", icone: "PawPrint", descricao: "Área exclusiva para seus pets" },
  { nome: "Bicicletário", icone: "Bike", descricao: "Estacionamento seguro para bicicletas" },
  { nome: "Hall de Entrada", icone: "DoorOpen", descricao: "Recepção elegante e moderna" },
];

export const DIFERENCIAIS = [
  { titulo: "Portaria Inteligente", icone: "Shield" },
  { titulo: "Elevador", icone: "ArrowUpDown" },
  { titulo: "Garagem Coberta", icone: "Car" },
  { titulo: "Alto Padrão de Acabamento", icone: "Gem" },
  { titulo: "Sacada com Churrasqueira", icone: "Flame" },
  { titulo: "Duas Suítes", icone: "BedDouble" },
  { titulo: "Ambientes Amplos", icone: "Maximize" },
  { titulo: "Design Contemporâneo", icone: "Palette" },
  { titulo: "Infraestrutura Moderna", icone: "Building2" },
  { titulo: "Segurança e Praticidade", icone: "Lock" },
  { titulo: "Excelente Padrão Construtivo", icone: "HardHat" },
  { titulo: "Potencial de Valorização", icone: "TrendingUp" },
];

export const IMAGENS = {
  heroBanner: "/assets/venezia/placeholder.svg",
  lifestyle: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028476442/bFYmgaA9ybdAfHZuiPvNzY/venezia-lifestyle-A3T8kpDyfKjvAAqxgYvhHf.webp",
  location: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028476442/bFYmgaA9ybdAfHZuiPvNzY/venezia-location-gQGt7cvL9AnG3T5jFxEdvF.webp",
  logoArtea: "/assets/venezia/placeholder.svg",
  logoVenezia: "/assets/venezia/placeholder.svg",
};

export const CONDICOES_COMERCIAIS = {
  entrada: "20% do valor de venda",
  parcelamento: "Ato + 36 parcelas mensais",
  reforcos: "R$ 20.000 na entrega das chaves (36 meses)",
  reforcoTotal: 20000,
  financiamento: "80% financiado pelo Programa MCMV — Faixa 3",
  correcao: "Saldo devedor da entrada corrigido pelo INCC-M",
  observacoes: "Valores sujeitos a correção pelo INCC-M durante a obra",
};
