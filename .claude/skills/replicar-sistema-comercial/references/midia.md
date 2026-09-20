# Mídia: receber, conferir, comprimir, montar a galeria

## 1. Receber o material

O ambiente remoto do Claude Code **não alcança OneDrive, Google Drive, Dropbox nem
WeTransfer** (proxy de saída bloqueia; o conector do Google Drive lista arquivos mas
devolve o conteúdo em base64 dentro da resposta, inviável acima de poucos KB). O que
funciona:

1. **Anexo no chat** — ZIPs de até ~30 MB. Bom para lotes pequenos.
2. **Release do GitHub** — o cliente abre `github.com/<org>/<repo>/releases/new`, cria
   uma tag (ex.: `midia-<empreendimento>`), arrasta os ZIPs em "Attach binaries" e
   publica. Até 2 GB por arquivo e **não entra no histórico do Git**. Baixe com:
   ```bash
   curl -sL -H "Authorization: Bearer $GH_TOKEN" -H "Accept: application/octet-stream" \
     -o arquivo.zip https://api.github.com/repos/<org>/<repo>/releases/assets/<id>
   ```
   (ids via `GET /repos/<org>/<repo>/releases/tags/<tag>`). Confira o SHA-256 contra
   o que a página da release mostra.

Nunca commite os originais (PNGs de 10 MB, vídeo de 200 MB): ficam no histórico para
sempre. Extraia numa pasta de trabalho fora do repositório.

ZIPs vindos do macOS trazem `__MACOSX/` e nomes com acento em NFD — normalize com
`nome.normalize("NFC")` ao casar nomes de arquivo.

## 2. Conferir antes de usar

Gere pranchas numeradas com `scripts/contact-sheet.mjs` e **olhe você mesmo** antes de
mostrar ao cliente: o Venezia tinha um render com "TERRAZZO" escrito na fachada, um
print de e-mail servindo como "implantação" e uma tabela duplicada rotulada como
"planta tipo". Depois mande as pranchas ao cliente e peça aprovação por número
("prancha 2, imagem 5"). Só então substitua.

## 3. Comprimir

Diagnóstico rápido: bytes por pixel. Um JPEG bem codificado fica em ~0,15–0,2 B/px;
os do Venezia estavam em 1,5–1,7 (qualidade quase sem perda). Não é resolução demais,
é codificação ruim — reencodar resolve sem perder nitidez.

`scripts/comprimir-imagens.mjs <origem> <destino> [--max 1800] [--q 82]`:
- WebP com `effort: 6`; lado maior limitado a 1800 px (fotos) — desenhos técnicos
  grandes (plantas com texto) use `--max 2400 --q 86`.
- Preserva alfa (logos); mantém o nome base do arquivo em slug
  (`FACHADA - 01 dia.png` → `fachada-01-dia.webp`).
- Resultado típico: 10 MB → 300–400 KB (−95%).

`scripts/comprimir-video.sh entrada.mp4 saida.mp4`: H.264 High, `scale=1080:-2`,
CRF 26, preset medium, AAC 128k, `+faststart`; gera `saida-poster.webp` do segundo 3.
203 MB (1440×1926, 15 Mbps) → 33 MB. No `<video>` use `preload="none"`, `poster`,
`playsInline`, `controls`: o arquivo só desce quando alguém dá play.

Meta por site: imagens < 15 MB somadas; nenhuma acima de ~600 KB; vídeo ≤ 35 MB.

## 4. Estrutura da galeria

`GaleriaSection.tsx` tem `GALERIA: GaleriaCategory[]`, cada categoria com `id`,
`titulo`, `imagens[{ id, src, alt }]` e opcionalmente `video`. A primeira categoria é o
vídeo (`imagens: []`, `video: "/assets/.../apresentacao.mp4"`). Contador no título:
"N imagens em M categorias" (vídeo conta como categoria).

Categorias que o cliente do Venezia validou (use como padrão para lançamentos
residenciais): Vídeo de Apresentação · Fachadas Diurnas · Imagens Noturnas · Living —
Apto Tipo 1 · Living — Apto Tipo 2 e 3 · Suíte Casal · Suíte Solteiro · Espaço Gourmet ·
Academia · Brinquedoteca · Terraço (Rooftop) · Pet Place e Bicicletário. Adapte aos
ambientes que existem no material — **não repita a mesma foto em vários cards** e não
invente categoria sem imagem.

**Não coloque na galeria** logos, mapa de localização nem quadro de áreas: o cliente
considerou "bagunça". Logos ficam em Parceiros e rodapé; mapa na seção Localização.

`scripts/gerar-galeria.mjs categorias.json` emite o array a partir de um JSON:
```json
[{ "id": "fachadas-diurnas", "titulo": "Fachadas Diurnas",
   "imagens": [["fachada-01-dia", "Fachada 01 — diurna"], ["fachada-02", "Fachada 02"]] }]
```

## 5. Implantação e tipologias

`PlantasSection.tsx`: cards com `titulo`, `descricao`, `imagem`. Padrão: Implantação
Térreo/Garagens, Pavimento Tipo, Rooftop, Tipologia Final 01/02/03 — cada um com a
planta humanizada correspondente. Sem imagem própria, deixe o card de fora em vez de
repetir a do pavimento tipo. Plantas em q86 e até 2400 px para o texto continuar
legível no lightbox.

## 6. Verificar

- `scripts/verificar-assets.sh`: toda referência `/assets/<pasta>/…` no `client/src`
  resolve para arquivo? Há arquivo sem referência (órfão)? Remova órfãos — pesam no
  deploy mesmo sem aparecer.
- `pnpm check`, `pnpm test`, `pnpm build:web`.
- `scripts/smoke-galeria.mjs http://127.0.0.1:8090/` com o build servido
  (`python3 -m http.server` dentro de `dist/public`): clica em cada aba, conta imagens,
  reporta `naturalWidth === 0` e respostas ≥ 400. Encerre o servidor pelo PID, não com
  `pkill -f` (mata o próprio shell).

## 7. Preview para o cliente (Artifact)

O artifact serve o site num subcaminho; o SPA tem caminhos absolutos e rota em `/`.
Para o preview, e só nele:

1. `base: "./"` no `vite.config.ts`;
2. `"/assets/…"` → `"assets/…"` nos arquivos que têm caminho literal;
3. `<WouterRouter base={window.location.pathname.replace(/\/$/, "")}>` em `App.tsx`;
4. `vite build --outDir <pasta-fora-do-repo>`; restaure as fontes (backup/cópia).

Limite de 15 MB por arquivo binário: publique uma versão de preview do vídeo
(`scale=720:-2`, CRF 30 → ~12 MB) e diga ao cliente que o real é maior. Avise também:
sem backend, Dashboard em "Área Restrita", tabela com valores estáticos, Maps não
carrega. Na republicação passe `null` para arquivos que saíram, senão acumulam.
