# CHANGELOG DE HOMOLOGAÇÃO — RESIDENCIAL VENEZIA

**Início do rastreamento:** 2026-06-29  
**Responsável técnico:** Claude (Anthropic)

Toda alteração realizada após 2026-06-29 deve ser registrada aqui antes de ser aplicada.  
Descrições genéricas ("ajustes", "melhorias", "correções diversas") são **proibidas**.

---

## FORMATO OBRIGATÓRIO DE REGISTRO

```
### [DATA] — [ARQUIVO ALTERADO]
- **Módulo impactado:** nome do módulo
- **Status anterior:** status antes da alteração
- **Motivo:** descrição técnica e objetiva da necessidade
- **O que foi alterado:** descrição exata da mudança
- **Evidência:** referência ao arquivo de evidência em EVIDENCIAS_HOMOLOGACAO.md
- **Autorização:** quem autorizou (usuário / auditor)
```

---

## REGISTRO DE ALTERAÇÕES

### 2026-06-30 — server/_core/sdk.ts + server/_core/oauth.ts + server/_core/env.ts + server/db.ts + drizzle/schema.ts + drizzle/0005_auth_propria.sql + client/src/const.ts + client/src/App.tsx + client/src/pages/Login.tsx + scripts/create-admin.ts

- **Módulo impactado:** Autenticação (fluxo de login/logout para Painel Corretor e Admin)
- **Status anterior:** Login dependia de `OAUTH_SERVER_URL` (provider Manus) — não disponível em produção
- **Motivo:** Eliminar dependência de OAuth externo. DECISÃO 009 — autenticação própria por e-mail/senha.
- **O que foi alterado:**
  - `schema.ts`: +`password_hash varchar(255)` na tabela `users`
  - `0005_auth_propria.sql`: `ALTER TABLE users ADD COLUMN password_hash` (só estrutura, sem dados)
  - `sdk.ts`: removida lógica OAuth/Manus; adicionado `hashPassword` e `verifyPassword` com `crypto.scrypt`
  - `oauth.ts`: removido callback OAuth; criado `POST /api/auth/login`, `POST /api/auth/change-password`, `GET /api/auth/setup-status`
  - `env.ts`: removidas variáveis `oAuthServerUrl`, `ownerOpenId`, `appId`
  - `db.ts`: +`getUserByEmail`, +`setPasswordHash`, +`countAdmins`; removida lógica de `ownerOpenId`
  - `const.ts`: `getLoginUrl()` → `"/login"` (rota interna, sem VITE_OAUTH_*)
  - `App.tsx`: registrada rota `/login`
  - `Login.tsx`: formulário e-mail/senha com visual Venezia
  - `scripts/create-admin.ts`: script controlado; senha recebida via env var, nunca commitada
- **Evidência:** smoke test 9 itens PASSOU sem LOCAL_AUTH_BYPASS (commit 5b86189)
- **Autorização:** Auditor externo — sessão 2026-06-30

---

### 2026-06-30 — drizzle/schema.ts + migration 0004 + server/db.ts + server/routers.ts + useUnidadesStatus.ts + AuthContext.tsx

- **Módulo impactado:** Reserva (item 8), Venda (item 9), Cancelamento (item 10) da Homologação Fase 4
- **Status anterior:** Itens 8/9/10 PARCIAL — persistência apenas em localStorage (inoperável para equipe comercial multi-usuário)
- **Motivo:** Auditor identificou que localStorage é isolado por navegador — um corretor não enxerga o status marcado por outro. Sistema destinado a equipe com múltiplos dispositivos exige banco como fonte de verdade única.
- **O que foi alterado:**
  - `drizzle/schema.ts`: +3 tabelas (`unidades_status`, `vendas`, `cancelamentos`) com `mysqlEnum` confirmado compatível com Drizzle/MySQL
  - `drizzle/0004_unidades_persistencia.sql`: migration com CREATE TABLE + seed de 12 unidades (`101`–`403`) como `disponivel`
  - `drizzle/meta/_journal.json`: entrada idx=4 registrada
  - `server/db.ts`: +6 funções (`getUnidadesStatus`, `updateUnidadeStatus`, `registrarVenda`, `listVendas`, `registrarCancelamento`, `listCancelamentos`)
  - `server/routers.ts`: +3 routers; mutations com `protectedProcedure`; `getStatus` com `publicProcedure`
  - `useUnidadesStatus.ts`: reescrito — banco Railway é fonte oficial; localStorage removido como fonte de verdade
  - `AuthContext.tsx`: `salvarDadosVenda` e `addCancelamento` persistem no banco via tRPC mutation (estado otimista local mantido)
- **Evidência:** `tsc --noEmit` PASS + SELECT confirmado no banco + teste multi-navegador PASSOU (commit 00b228a)
- **Autorização:** Auditor externo — sessão 2026-06-30

---

### 2026-06-29 — client/src/components/Navigation.tsx

- **Módulo impactado:** Galeria (navegação lateral)
- **Status anterior:** HOMOLOGADO VISUALMENTE
- **Motivo:** Auditoria de homologação visual identificou que o item de menu exibia "Apresentação" em vez de "Galeria". O auditor determinou que "Galeria" é mais claro para o usuário final e evita confusão com materiais de apresentação institucional/PDF.
- **O que foi alterado:** Linha 23 — `label: "Apresentação"` → `label: "Galeria"` para o item `{ id: "galeria", ... }`
- **Evidência:** Screenshot 04_galeria.png (pré-correção) + tsc --noEmit PASS (pós-correção)
- **Autorização:** Auditor externo — sessão 2026-06-29

---

### 2026-06-30 — client/src/components/PropostaComercial.tsx

- **Módulo impactado:** PDF da Proposta Comercial
- **Status anterior:** CONGELADO (homologado visualmente com ressalva: logo ausente no PDF)
- **Motivo:** Logo do Venezia não aparecia no cabeçalho do PDF gerado pelo Puppeteer. O arquivo `.webp` (logo-venezia.webp) não é carregado pelo Puppeteer headless. Substituído pelo asset `.jpeg` (logo-venezia-oficial.jpeg) que é totalmente compatível.
- **O que foi alterado:** Linha 131 — `IMAGENS.logoVenezia` → `IMAGENS.logoVeneziaOficial` (apenas a variável de logo; nenhum layout, cálculo ou estrutura alterados)
- **Evidência:** tsc --noEmit PASS
- **Autorização:** Auditor externo — sessão 2026-06-30

---

### 2026-06-30 — server/_core/context.ts + .env

- **Módulo impactado:** Autenticação — Gestão de Corretores (/admin/corretores) e Painel do Corretor (/corretor)
- **Status anterior:** BLOQUEADO (dependia de OAuth não configurado)
- **Motivo:** Sem `OAUTH_SERVER_URL` configurado, `trpc.auth.me` retorna `null` e ambas as rotas redirecionam para Home. Para homologação local, foi implementado bypass de autenticação controlado por duas variáveis simultâneas: `NODE_ENV=development` E `LOCAL_AUTH_BYPASS=true`. Nunca ativo em produção.
- **O que foi alterado:** Adicionada constante `LOCAL_BYPASS_ACTIVE` (falsa por padrão; só verdadeira com as duas condições) e usuário mock `LOCAL_BYPASS_USER` com role `admin`. OAuth original intacto e continua sendo o fluxo de produção.
- **Evidência:** tsc --noEmit PASS + NODE_ENV e LOCAL_AUTH_BYPASS confirmados no .env
- **Autorização:** Auditor externo — sessão 2026-06-30

---

### 2026-06-29 — docs/ (criação)

- **Módulo impactado:** Governança do projeto (todos os módulos)
- **Status anterior:** N/A (arquivos novos)
- **Motivo:** Auditor determinou que o protocolo de homologação deve residir no repositório, não apenas na memória da conversa, para garantir rastreabilidade completa e permitir auditoria futura independente.
- **O que foi alterado:** Criação de `docs/PROTOCOLO_HOMOLOGACAO_VENEZIA.md`, `docs/STATUS_PROJETO.md`, `docs/CHANGELOG_HOMOLOGACAO.md`, `docs/EVIDENCIAS_HOMOLOGACAO.md`
- **Evidência:** Arquivos criados com conteúdo verificável
- **Autorização:** Auditor externo — sessão 2026-06-29
