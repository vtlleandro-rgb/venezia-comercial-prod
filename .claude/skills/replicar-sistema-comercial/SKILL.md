---
name: replicar-sistema-comercial
description: Replica o Sistema Comercial do Residencial Venezia (site de lançamento imobiliário com galeria, tabela de vendas, simulador CEF, propostas em PDF, painel de corretores e admin) para um NOVO empreendimento, ou faz manutenção no sistema existente. Use sempre que o usuário falar em criar/clonar/adaptar o site comercial para outro empreendimento, trocar imagens, plantas, vídeo, tabela de preços, endereço, logos ou parceiros de um lançamento, comprimir mídia do site, ou publicar alterações no Railway — mesmo que não diga "Venezia" nem "skill". Também use para diagnosticar site pesado, galeria bagunçada ou valores da tabela divergentes.
---

# Replicar o Sistema Comercial (template Venezia)

O Residencial Venezia tem um site comercial completo: landing page com galeria por
categorias e vídeo, implantação/tipologias, tabela de vendas com status de unidades,
simulador de financiamento CEF (MCMV), geração de proposta em PDF, painel do corretor e
painel admin com edição de preços. Stack: React 19 + Vite + Tailwind 4 (client),
Express + tRPC + Drizzle/MySQL (server), deploy no Railway (API + frontend) e Vercel.

Esta skill existe porque replicar o sistema é 90% **trocar dados e mídia** e 10% código —
e porque as coisas que deram errado no Venezia (site com 842 MB de imagens, galeria com
fotos de outro empreendimento, valores "c/ Doc" divergentes, publicação sem conferência)
se repetem se não houver um roteiro. Siga a ordem abaixo; cada passo aponta para o
arquivo de referência com o detalhe.

## Antes de começar: entenda o cliente

Quem opera esse sistema normalmente **não é técnico**. Isso muda como você trabalha:

- Mostre antes de mexer. Gere contact sheets das imagens (`scripts/contact-sheet.mjs`)
  e um preview navegável antes de substituir qualquer coisa na galeria. O maior erro
  cometido no Venezia foi colocar imagens sem conferir o conteúdo — entrou render de
  outro prédio e um print de e-mail rotulado como "planta".
- Nunca publique em produção sem um "pode publicar" explícito. Commit em branch de
  trabalho é fino; push na branch que o Railway serve não é.
- Explique em português simples e sem jargão. "Base64", "fast-forward", "worktree"
  não significam nada para o cliente. Diga o que muda na tela.
- Se o cliente mandar links de OneDrive/Google Drive, saiba que **o ambiente Claude Code
  remoto não alcança esses hosts** (só GitHub). O caminho que funciona é o cliente
  anexar ZIPs de até ~30 MB no chat ou subir os arquivos numa **Release do GitHub**
  (até 2 GB por arquivo, não entra no histórico do Git). Veja `references/midia.md`.

## Roteiro para um empreendimento novo

Faça na ordem. Marque cada item com o cliente.

1. **Repositório.** Crie um repositório novo a partir deste (template), nomeado
   `<empreendimento>-comercial-prod`. Não reaproveite o histórico do Venezia — ele
   carrega 800 MB de imagens antigas nos objetos do Git. Prefira `git init` limpo a
   partir de um `git archive` da branch de produção.
2. **Dados do empreendimento.** Edite `client/src/data/empreendimento.ts`: nome,
   incorporadora, endereço, unidades, tipologias, condições comerciais, imagens. É o
   arquivo central — quase tudo na tela vem dele. Regras de cálculo e campos em
   `references/dados.md`.
3. **Tabela de vendas.** Preencha `UNIDADES` com uma linha por unidade. O valor
   "c/ Documentação" é **derivado** (`valorVenda × 1,04`, função
   `calcularValorComDocumentacao`) — não digite à mão. Confira `entrada20`,
   `entradaMenosReforco`, `parcela36x` e `financCEF` com a planilha do cliente;
   fórmulas em `references/dados.md`.
4. **Textos e contatos.** Troque os textos hardcoded das seções (Hero, Empreendimento,
   Diferenciais, Localização, Parceiros, Rodapé), o WhatsApp padrão, as coordenadas do
   mapa e os pontos estratégicos. Lista arquivo a arquivo em `references/mapa-de-arquivos.md`.
5. **Mídia.** Receba o material (fachadas, interiores, lazer, plantas humanizadas,
   vídeo), **confira visualmente** com contact sheet, comprima com
   `scripts/comprimir-imagens.mjs` e `scripts/comprimir-video.sh`, e só então monte a
   galeria. Meta: todas as imagens do site somando menos de ~15 MB; vídeo com poster e
   `preload="none"`. Detalhes e armadilhas em `references/midia.md`.
6. **Galeria e plantas.** Organize `GaleriaSection.tsx` por categorias com os nomes que
   o cliente usa (Fachadas Diurnas, Imagens Noturnas, Living, Suítes, Espaço Gourmet,
   Academia, Brinquedoteca, Rooftop, Pet/Bicicletário...), a primeira aba sendo o vídeo.
   `PlantasSection.tsx` recebe as plantas humanizadas (térreo, tipo, rooftop, uma por
   tipologia). Use `scripts/gerar-galeria.mjs` para gerar o array a partir de um JSON de
   categorias — evita erro de digitação em dezenas de linhas.
7. **Logos.** Logos escuras somem em fundo escuro (rodapé e card de Parceiros). A
   solução no Venezia foi uma base branca (`bg-white`) atrás da logo; mantenha isso.
8. **Verificação.** Rode `scripts/verificar-assets.sh` (toda referência a
   `/assets/...` tem arquivo? há arquivo sem uso?), `pnpm check`, `pnpm test`,
   `pnpm build:web` e `scripts/smoke-galeria.mjs` (abre o build no Chromium, clica em
   cada aba da galeria e reporta imagens quebradas e respostas HTTP ≥ 400).
9. **Preview para o cliente.** Publique o build como Artifact (link privado) para
   conferência visual. O SPA usa caminhos absolutos e roteamento em `/`; para servir
   num subcaminho é preciso `base: "./"` no Vite, caminhos `assets/...` relativos e
   `<WouterRouter base={window.location.pathname}>`. Faça isso só no build do preview
   e restaure as fontes depois — nunca commite esses ajustes. Sem backend o Dashboard
   fica em "Área Restrita", a tabela mostra os valores estáticos (não os do banco) e o
   Google Maps não carrega: avise o cliente para ele não achar que algo quebrou.
10. **Banco e deploy.** Variáveis de ambiente, migrations, seed, Railway, Vercel e o
    workflow de homologação estão em `references/deploy.md`. O admin edita preços que
    ficam na tabela `configuracoes`; o site lê de lá com fallback para o arquivo
    estático.
11. **Publicação.** Só com autorização explícita. Descubra qual branch o Railway serve
    (no Venezia era `homologada-20260630`, não a `main`) e faça push **fast-forward**,
    nunca force. Alinhe a `main` depois, para o GitHub Actions validar o que está no ar.

## Manutenção no sistema existente

Se o pedido for ajustar o Venezia (ou um clone já no ar), pule para o passo certo do
roteiro. Três regras que evitam retrabalho:

- **Mude só o que foi pedido.** Trocar a galeria não autoriza mexer no hero, na tabela,
  na localização ou no layout. O cliente do Venezia rejeitou entregas por isso.
- **Trabalhe em cima da branch que está no ar**, não da `main`, se elas divergirem.
  Verifique com `git log origin/<branch>` e compare com o que o site mostra.
- **Assets órfãos pesam no deploy** mesmo sem aparecer na tela. Depois de trocar
  imagens, rode a varredura de órfãos.

## Arquivos de referência

- `references/mapa-de-arquivos.md` — cada arquivo com conteúdo específico do
  empreendimento e o que trocar nele (textos, telefones, coordenadas, cores, seed).
- `references/dados.md` — estrutura de `empreendimento.ts`, fórmulas da tabela,
  parâmetros do simulador CEF, tabela `configuracoes` do admin.
- `references/midia.md` — recebimento do material, conferência visual, compressão,
  vídeo, estrutura da galeria e das plantas, verificação, preview.
- `references/deploy.md` — env, MySQL, migrations, seed, Railway, Vercel, branches,
  GitHub Actions, health check, reversão.

## Scripts

Todos rodam com Node 22; os de imagem precisam de `sharp` e o de smoke de `playwright`
(`npm i sharp playwright` numa pasta de trabalho fora do repositório). O de vídeo usa
`ffmpeg` (`npm i ffmpeg-static` se não houver ffmpeg no sistema).

| Script | Para quê |
|---|---|
| `scripts/comprimir-imagens.mjs <origem> <destino>` | PNG/JPG → WebP, 1800 px, q82 (q86 para plantas); grava `manifest.json` |
| `scripts/comprimir-video.sh <entrada.mp4> <saida.mp4>` | H.264 1080p CRF 26 + poster WebP |
| `scripts/contact-sheet.mjs <pasta> <saida.png>` | prancha numerada para o cliente conferir |
| `scripts/gerar-galeria.mjs <categorias.json>` | emite o array `GALERIA` a partir de categorias → arquivos |
| `scripts/verificar-assets.sh` | referências sem arquivo e arquivos sem referência |
| `scripts/smoke-galeria.mjs <url>` | clica nas abas da galeria e reporta quebras |
