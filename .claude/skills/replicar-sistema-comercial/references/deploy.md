# Banco, deploy e publicação

## Variáveis de ambiente (`.env.example`)

| Variável | Uso |
|---|---|
| `DATABASE_URL` | `mysql://usuario:senha@host:3306/<banco>` |
| `JWT_SECRET` | assinatura do cookie de sessão (jose) |
| `ADMIN_PASSWORD` | senha do painel admin (`/admin-login`) |
| `FRONTEND_URL` | origem permitida no CORS quando frontend e API estão em domínios diferentes |
| `PORT`, `NODE_ENV=production` | servidor Express |
| `CHROMIUM_PATH` | Puppeteer para PDF da proposta (`/usr/bin/chromium` no Railway) |
| `VITE_API_URL` | (build do frontend) URL da API quando servida pela Vercel |
| `VITE_GOOGLE_MAPS_API_KEY` | mapa da seção Localização |

## Banco (MySQL + Drizzle)

- `pnpm db:migrate` aplica `drizzle/migrations/000{1,2,3}_*.sql`: users, imobiliarias,
  corretores, leads, acessos, propostas, unidades_status, operacao_logs, vendas,
  cancelamentos_reservas, proposta_registros, configuracoes.
- `pnpm db:seed` (`scripts/seed.ts`): admin local, imobiliária e corretor de exemplo —
  troque nomes/e-mails antes de rodar num empreendimento novo.
- O servidor também cria `configuracoes` sozinho ao subir.
- `scripts/migrate.ts` existe para o GitHub Actions.

## Railway (API + frontend no mesmo serviço)

`railway.json`: builder NIXPACKS, `pnpm install --no-frozen-lockfile --prod=false && pnpm build`,
start `pnpm start`, restart ON_FAILURE ×10. `.nvmrc = 22` (o build quebrou sem ele —
não use `engines.node` nem `railway.toml`, já deram problema). Health: `GET /api/health`
→ `{ ok: true }`. Se responder 502, a API não subiu (checar `DATABASE_URL` e logs) —
o site inteiro cai junto porque o Express serve o frontend estático.

**Descubra qual branch o Railway está servindo antes de publicar.** No Venezia era
`homologada-20260630` (à frente da `main`); o nome da branch não diz nada — compare o
conteúdo do site com `git show origin/<branch>:client/src/components/sections/GaleriaSection.tsx`.
O ambiente remoto do Claude Code não alcança o painel do Railway; peça ao cliente
para conferir o deploy ou acionar "Redeploy".

## Vercel (frontend separado, opcional)

`vercel.json` na raiz; build `pnpm build:web`; precisa de `VITE_API_URL` apontando para
o Railway e `FRONTEND_URL` no Railway apontando para a Vercel (CORS). Se só o Railway
está em uso, a Vercel pode ficar desatualizada sem prejuízo.

## GitHub Actions

`.github/workflows/homologacao-venezia.yml` roda em push na `main` (e manual): MySQL
de serviço, `pnpm check`, `pnpm test`, `pnpm build`. Mantenha a `main` alinhada com a
branch de produção (push fast-forward) para o workflow validar o que está no ar.

## Fluxo de publicação que funcionou

1. Trabalhe numa branch a partir da **branch de produção**, não da `main`, se
   divergirem (`git worktree add <pasta> -b publicacao origin/<producao>`).
2. Aplique só o aprovado; valide (`check`, `test`, `build:web`, smoke).
3. Faça push da branch de trabalho (`claude/…`) — guarda o trabalho sem tocar produção.
4. Preview via Artifact; espere o "pode publicar".
5. Push **fast-forward** para a branch de produção, verificando antes que ela não
   mudou (`git fetch` + comparar SHA) e que é ancestral do seu commit
   (`git merge-base --is-ancestor`). Nunca `--force`.
6. Depois, fast-forward da `main` para o mesmo commit e acompanhe o Actions
   (`GET /repos/<org>/<repo>/actions/runs?branch=main`).
7. Diga ao cliente o que testar no ar e o SHA de reversão (`git push origin <sha>:<branch>`).

## Reversão

Fast-forward reverte com um push do SHA anterior para a branch de produção. Mantenha
uma branch-espelho do que foi publicado (`claude/publicacao-…`) como registro.
