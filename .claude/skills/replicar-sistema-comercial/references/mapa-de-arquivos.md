# Mapa de arquivos: o que é específico do empreendimento

Levantado com `grep -rli venezia client/src server shared scripts` e por leitura. Ordem
aproximada de impacto. Quando trocar, prefira mover o valor para `empreendimento.ts`
em vez de espalhar novos hardcodes.

## Dados centrais

| Arquivo | O que tem | O que fazer |
|---|---|---|
| `client/src/data/empreendimento.ts` | `EMPREENDIMENTO` (nome, incorporadora, arquitetura, localização, VGV, faixas de preço, áreas), `TIPOLOGIAS`, `UNIDADES` (uma por unidade), `AREAS_LAZER`, `DIFERENCIAIS`, `IMAGENS`, `CONDICOES_COMERCIAIS` | Reescrever por completo. Ver `dados.md`. |
| `shared/const.ts` | constantes compartilhadas (nome do sistema) | Trocar o nome. |

## Seções da landing (`client/src/components/sections/`)

| Arquivo | Conteúdo específico | Observação |
|---|---|---|
| `HeroSection.tsx` | título, subtítulo, chamadas; usa `IMAGENS.heroBanner` e `IMAGENS.logoVenezia`; preço mínimo vem do tRPC/`EMPREENDIMENTO.valorMin` | Texto hardcoded em ~25 linhas. |
| `EmpreendimentoSection.tsx` | parágrafo institucional (cita incorporadora e arquiteto), cards (unidades, suítes, área, vaga), "Perfil do Empreendimento"; usa `IMAGENS.fachadaEmpreendimento` | ~39 linhas de texto. |
| `DiferenciaisSection.tsx` | lê `DIFERENCIAIS` de `empreendimento.ts` | Só ajustar o array. |
| `GaleriaSection.tsx` | array `GALERIA` (categorias → imagens) + `video` na primeira categoria | Gerar com `scripts/gerar-galeria.mjs`. Ver `midia.md`. |
| `PlantasSection.tsx` | array `PLANTAS` (implantações e tipologias com descrição) | Uma planta humanizada por card. |
| `TabelaSection.tsx` | lê unidades do tRPC (`configuracoes.getUnidades`) com fallback em `UNIDADES`; aplica `normalizarUnidades` | Não precisa mudar. Rótulos das colunas ("Chaves R$ 20k") são texto: ajustar se o reforço mudar. |
| `SimuladorSection.tsx` | faixa do slider vem das unidades; textos citam "Caixa/MCMV Faixa 3" | Ajustar se o programa de financiamento mudar; parâmetros em `lib/simuladorCEF.ts`. |
| `DashboardSection.tsx` | VGV, ticket médio, R$/m² derivados das unidades; relatório em HTML com nome do empreendimento | Trocar nome no template do relatório. |
| `LocalizacaoSection.tsx` | `VENEZIA_LAT`/`VENEZIA_LNG` (coordenadas), endereço no parágrafo, `pontos` (nome + minutos), texto "Potencial de Valorização", iframe do Google Maps (`maps?q=lat,lng&z=17&output=embed`) | Renomear as constantes; pegar coordenadas do link do Maps. |
| `PartnersSection.tsx` | array `partners` (papel, nome, logo, `bgClass`) | Manter `bg-white` em logos escuras. |
| `LazerSection.tsx` | **código morto** no Venezia (não montado em `Home.tsx`) | Montar só se houver uma imagem real por ambiente. |

## Componentes globais (`client/src/components/`)

| Arquivo | Conteúdo específico |
|---|---|
| `Navigation.tsx` | logo (`IMAGENS.logoVenezia`), nome da incorporadora sob a logo, itens do menu |
| `Footer.tsx` | WhatsApp padrão (`5548996962020`), formulário "Fale com um Consultor", blocos Realização / Construção e Incorporação (razão social, endereço, cidade), "© ANO RAZÃO SOCIAL", logo sobre base branca |
| `WhatsAppFloat.tsx` | `WHATSAPP_PADRAO`, mensagem inicial |
| `PropostaComercial.tsx` | template da proposta em PDF: nome, logos (`IMAGENS.logoVenezia`, `logoArteaColor`, `logoBlueRealEstate`), condições comerciais, tipologia por unidade (`TIPOLOGIAS[].plantaImg`) |
| `VendaModal.tsx` | textos do fluxo de venda, link `wa.me/55…`, rótulo "Valor c/ Documentação (4%)" |
| `AdminPanel.tsx`, `pages/AdminCorretores.tsx`, `pages/PainelCorretor.tsx` | placeholders de telefone/e-mail e nomes de exemplo |

## Servidor e dados

| Arquivo | Conteúdo específico |
|---|---|
| `scripts/seed.ts` | usuário admin ("Administrador Venezia", `admin@venezia.local`), imobiliária e corretor de exemplo |
| `server/routers.ts` | slugs/nomes de exemplo em validações; rota `configuracoes` (preços dinâmicos) |
| `server/_core/context.ts`, `server/_core/vite.ts` | nome nos logs |
| `drizzle/migrations/*.sql` | genéricas — não dependem do empreendimento |
| `.env.example` | `DATABASE_URL` (nome do banco), `FRONTEND_URL`, `VITE_API_URL` |

## Identidade visual

Cores mais usadas (Tailwind arbitrárias): `#c62828` (vermelho — destaques), `#1a1a2e`
(azul-marinho — fundos escuros), `#f8f7f4` (bege — fundos claros), `#b71c1c`, `#0d47a1`.
A "italian-divider" (verde/branco/vermelho) está no CSS global. Para outra marca, troque
as cores com um find/replace controlado e revise o divisor. Fontes: Cormorant Garamond
(títulos) e Outfit (texto), carregadas do Google Fonts em `client/index.html`.

## Assets (`client/public/assets/<empreendimento>/`)

Convenção de nomes usada na entrega final do Venezia: `fachada-01-dia.webp`,
`apto-1-living-1.webp`, `lazer-gourmet-2.webp`, `terreo-pet-place.webp`,
`planta-humanizada-pav-tipo.webp`, `logo-*.png|webp`, `localizacao-*.jpg`,
`<empreendimento>-apresentacao.mp4` + `-poster.webp`. Nomes descritivos em minúsculas,
sem acento, hífens. Troque também o nome da pasta e todas as referências
`/assets/venezia/` (grep) ao replicar.
