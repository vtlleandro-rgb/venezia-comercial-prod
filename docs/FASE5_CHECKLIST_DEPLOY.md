# CHECKLIST OPERACIONAL — FASE 5 — DEPLOY PRODUÇÃO
# Residencial Venezia — Central Comercial

**Data:** 2026-06-30  
**Responsável:** Leandro (operacional) + Claude (técnico)  
**Pré-requisito:** Fases 1–4 aprovadas (commit f91072b)  
**Objetivo:** Sistema acessível publicamente com OAuth real e banco Railway ativo.

> **Regra absoluta:** `LOCAL_AUTH_BYPASS` nunca entra em produção.  
> Nenhum módulo homologado será alterado nesta fase.

---

## 1. VARIÁVEIS DE AMBIENTE — SERVIDOR (Railway / VPS / Render)

Estas variáveis ficam no painel do servidor de hospedagem do **backend** (onde o Express roda).  
Nunca colocar no repositório Git, nunca em `.env` commitado.

| Variável | Obrigatória | Valor / Como obter |
|---|---|---|
| `NODE_ENV` | ✅ Sim | `production` (fixo — nunca alterar) |
| `DATABASE_URL` | ✅ Sim | Mesma URL Railway já configurada localmente (`.env` local) |
| `JWT_SECRET` | ✅ Sim | String aleatória segura — mínimo 32 caracteres. Gerar com: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| ~~`OAUTH_SERVER_URL`~~ | ❌ Removida | OAuth substituído por autenticação própria (DECISÃO 009) |
| ~~`VITE_APP_ID`~~ | ❌ Removida | Não mais necessária |
| ~~`OWNER_OPEN_ID`~~ | ❌ Removida | Admin criado via `scripts/create-admin.ts` |
| `CHROMIUM_PATH` | ✅ Sim | Caminho do Chromium no servidor — ver seção 7 abaixo |
| `PORT` | Opcional | Porta do servidor Express. Se não definido: `3000`. Railway define automaticamente. |
| `LOCAL_AUTH_BYPASS` | ❌ Nunca | **Não definir.** Se presente com valor `true`, remove toda a proteção de autenticação. |

---

## 2. VARIÁVEIS DE AMBIENTE — FRONTEND (build Vite)

Com autenticação própria (DECISÃO 009), não há mais variáveis OAuth obrigatórias no frontend.

| Variável | Obrigatória | Valor |
|---|---|---|
| `VITE_LOCAL_AUTH_BYPASS` | ❌ Nunca | **Não definir.** Ativa bypass no frontend. |

> Variáveis `VITE_*` são públicas — nunca colocar segredos nelas.

---

## 3. CRIAR USUÁRIO ADMIN INICIAL

Admin criado via script controlado (senha não commitada):

```bash
# Executar no servidor após deploy e migration 0005 aplicada
ADMIN_EMAIL=vtlleandro@gmail.com ADMIN_PASSWORD='SenhaSegura123!' \
  node -e "require('./dist/scripts/create-admin.js')"
```

Ou localmente apontando para o banco Railway:
```bash
ADMIN_EMAIL=vtlleandro@gmail.com ADMIN_PASSWORD='SenhaSegura123!' \
  npx tsx scripts/create-admin.ts
```

Após o primeiro login, trocar a senha via: `POST /api/auth/change-password`

---

## 4–6. (OAuth removido — DECISÃO 009)

Seções 4, 5 e 6 do checklist original referenciavam `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL` e `VITE_APP_ID`. Essas variáveis foram removidas em 2026-06-30 com a implementação da autenticação própria. Ver DECISÃO 009 em `DECISOES_ARQUITETURAIS.md`.

---

## 7. CHROMIUM_PATH — PDF via Puppeteer

O sistema gera PDFs de proposta usando Puppeteer com Chromium. Em produção, o caminho do executável muda conforme o servidor.

| Ambiente | Caminho típico |
|---|---|
| Ubuntu/Debian | `/usr/bin/chromium-browser` ou `/usr/bin/chromium` |
| Alpine Linux (Docker) | `/usr/bin/chromium-browser` |
| Railway (Nixpacks) | Instalar via `nixpkgs.chromium` no `nixpacks.toml` |
| Render | Adicionar `apt-get install -y chromium` no build command |
| macOS local | `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` (dev) |

**Verificação após deploy:**
```bash
which chromium || which chromium-browser
# Usar o caminho retornado como CHROMIUM_PATH
```

**No Railway com Nixpacks** — criar `nixpacks.toml` na raiz:
```toml
[phases.setup]
nixPkgs = ["chromium"]
```
E definir `CHROMIUM_PATH=/nix/store/.../bin/chromium` (confirmar path após build).

---

## 8. COMANDO DE BUILD

```bash
pnpm run build
# Equivalente a:
# vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
```

O build produz:
- `dist/` — bundle do frontend (HTML + JS + assets)
- `dist/index.js` — bundle do servidor Express

**Verificar antes do build:**
- Todas as variáveis `VITE_*` devem estar definidas (serão embutidas no bundle)
- `tsc --noEmit` deve passar: `pnpm run check`

---

## 9. COMANDO DE START

```bash
NODE_ENV=production node dist/index.js
```

O Express serve:
- Frontend (`dist/`) na rota `/`
- API tRPC em `/api/trpc/*`
- OAuth callback em `/api/oauth/callback`
- PDF em `/api/propostas/:codigo/pdf`
- Health check em `/api/health`

---

## 10. VALIDAÇÃO DE `/api/health`

Após o deploy, confirmar que o servidor está saudável:

```bash
curl https://<URL-DE-PRODUCAO>/api/health
# Resposta esperada: { "status": "ok" } ou similar
```

Se retornar erro 500: verificar logs do servidor — provavelmente `DATABASE_URL` ou `JWT_SECRET` ausentes.

---

## 11. SMOKE TEST FINAL (pós-deploy)

Executar nesta ordem. Cada item deve PASSAR antes de avançar para o próximo.

| # | Ação | Critério de aprovação |
|---|---|---|
| ST-01 | Abrir `https://<URL>/` | Hero carrega, logo Venezia visível, sem erro 404 |
| ST-02 | Scroll completo na Home | Galeria, Plantas, Tabela, Simulador, Localização — sem erro JS no console |
| ST-03 | Simulador — preencher valor e slider | Parcelas calculadas corretamente |
| ST-04 | Formulário de lead | Preencher nome/telefone/email → submeter → confirmar `SELECT * FROM leads` no banco |
| ST-05 | Tabela de Disponibilidade | 12 unidades listadas, status do banco (não localStorage) |
| ST-06 | Acessar `/corretor` sem login | Redireciona para login OAuth (não para Home, não para erro) |
| ST-07 | Fazer login OAuth (usuário real) | Redireciona para `/corretor` após autenticação |
| ST-08 | Painel do Corretor | Dados do corretor carregam, tabela de leads visível |
| ST-09 | Reservar unidade no Painel | Status muda → reload → persiste no banco Railway |
| ST-10 | Abrir aba anônima, ver Tabela | Mesma unidade aparece como Reservada (multiusuário Railway) |
| ST-11 | Acessar `/admin/corretores` | Lista de corretores carrega (requer role admin) |
| ST-12 | Gerar proposta em PDF | PDF baixa com logo Venezia visível no cabeçalho |
| ST-13 | Link da proposta `/proposta/:codigo` | Proposta abre no navegador sem login |
| ST-14 | Logout | Sessão encerrada, `/corretor` redireciona para login |

---

## 12. APÓS SMOKE TEST — ASSINAR O TERMO

Após todos os ST- passarem, preencher no `TERMO_DE_LIBERACAO_PRODUCAO.md`:

```
| Responsável Técnico   | Leandro                        |
| Data da aprovação     | YYYY-MM-DD                     |
| Commit SHA aprovado   | <git rev-parse HEAD>           |
| Tag Git               | v1.0                           |
| URL de produção       | https://<URL>/                 |
| Observações           | Smoke test ST-01 a ST-14 PASSOU|
```

Criar tag Git:
```bash
git tag -a v1.0 -m "Venezia Comercial v1.0 — liberação para produção"
git push origin main --tags
```

---

## HISTÓRICO

| Data | Evento |
|---|---|
| 2026-06-30 | Checklist criado após aprovação Fases 1–4 |
