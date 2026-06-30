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
| `OAUTH_SERVER_URL` | ✅ Sim | URL do servidor OAuth (ver seção 4 abaixo) |
| `VITE_APP_ID` | ✅ Sim | App ID registrado no provider OAuth (ver seção 6 abaixo) |
| `OWNER_OPEN_ID` | ✅ Sim | OpenId do usuário administrador principal (ver seção 3 abaixo) |
| `CHROMIUM_PATH` | ✅ Sim | Caminho do Chromium no servidor — ver seção 7 abaixo |
| `PORT` | Opcional | Porta do servidor Express. Se não definido: `3000`. Railway define automaticamente. |
| `LOCAL_AUTH_BYPASS` | ❌ Nunca | **Não definir.** Se presente com valor `true`, remove toda a proteção de autenticação. |

---

## 2. VARIÁVEIS DE AMBIENTE — FRONTEND (build Vite)

Estas variáveis são embutidas no bundle JavaScript durante o `vite build`.  
No Railway (se build acontece no servidor): definir como variáveis de ambiente do serviço.  
No Vercel (se frontend separado): definir no painel do projeto como variáveis de build.

| Variável | Obrigatória | Valor / Como obter |
|---|---|---|
| `VITE_OAUTH_PORTAL_URL` | ✅ Sim | URL do portal OAuth onde o usuário faz login (ver seção 5 abaixo) |
| `VITE_APP_ID` | ✅ Sim | Mesmo App ID do servidor — provider OAuth registra este ID |
| `VITE_LOCAL_AUTH_BYPASS` | ❌ Nunca | **Não definir.** Ativa bypass no frontend, removendo guard de autenticação. |

> **Atenção:** Variáveis `VITE_*` são públicas — ficam visíveis no bundle JS.  
> Nunca colocar segredos (JWT_SECRET, DATABASE_URL) em variáveis VITE_.

---

## 3. COMO OBTER / DEFINIR `OWNER_OPEN_ID`

`OWNER_OPEN_ID` define qual usuário recebe automaticamente a role `admin` ao fazer login pela primeira vez. Sem isso, o primeiro login cria um usuário comum sem acesso ao painel `/admin/corretores`.

**Procedimento:**

1. Fazer o deploy sem `OWNER_OPEN_ID` (temporariamente)
2. Fazer login com o OAuth do usuário administrador (Leandro)
3. Consultar o banco Railway:
   ```sql
   SELECT open_id, name, email FROM users ORDER BY created_at LIMIT 5;
   ```
4. Copiar o valor de `open_id` do usuário administrador
5. Definir `OWNER_OPEN_ID=<valor copiado>` nas variáveis do servidor
6. Reiniciar o servidor
7. Fazer login novamente — a role `admin` é atribuída no próximo login

**Alternativa (sem reiniciar):**
```sql
UPDATE users SET role = 'admin' WHERE email = 'vtlleandro@gmail.com';
```

---

## 4. ONDE CONFIGURAR `OAUTH_SERVER_URL`

`OAUTH_SERVER_URL` é a URL base do servidor OAuth que expõe o serviço gRPC-Web `webdev.v1.WebDevAuthPublicService`.

O backend usa dois endpoints nessa URL:
- `POST /webdev.v1.WebDevAuthPublicService/ExchangeToken` — troca code por token
- `POST /webdev.v1.WebDevAuthPublicService/GetUserInfo` — obtém dados do usuário

**O provider OAuth original era o Manus.** Para produção, é necessário ter acesso a um provider compatível com este protocolo.

**Opções:**
1. **Se o cliente tem acesso ao provider OAuth original do Manus:** usar a URL fornecida por eles
2. **Se precisar de um novo provider:** contatar o time responsável pelo `webdev.v1.WebDevAuthPublicService` para obter credenciais de produção

**Onde configurar:** variável de ambiente no servidor (Railway, Render, VPS) — nunca no frontend.

---

## 5. ONDE CONFIGURAR `VITE_OAUTH_PORTAL_URL`

`VITE_OAUTH_PORTAL_URL` é a URL do portal onde o usuário clica "Fazer Login" e é redirecionado para autenticar.

O frontend constrói a URL de login assim:
```
${VITE_OAUTH_PORTAL_URL}/app-auth?appId=${VITE_APP_ID}&redirectUri=${origin}/api/oauth/callback&state=${btoa(redirectUri)}
```

**Onde configurar:** variável de ambiente de build (Vite). No Railway: adicionar junto com as demais variáveis antes do `vite build`. No Vercel: painel > Settings > Environment Variables.

---

## 6. ONDE CONFIGURAR `VITE_APP_ID`

`VITE_APP_ID` é o identificador do aplicativo registrado no provider OAuth.

- É o mesmo valor usado no servidor (`ENV.appId`) e no frontend (`import.meta.env.VITE_APP_ID`)
- Obtido no painel do provider OAuth quando o app foi registrado
- O provider valida que o `appId` no callback corresponde ao app registrado

**Onde configurar:** variável de ambiente em **dois lugares**:
1. Servidor (como `VITE_APP_ID`) — usado pelo `sdk.ts` via `ENV.appId`
2. Build Vite (como `VITE_APP_ID`) — embutido no bundle frontend

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
