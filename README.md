# Residencial Venezia — Central Comercial

Sistema de vendas do empreendimento Residencial Venezia, desenvolvido com React 19 + TypeScript + Vite + Express + tRPC + MySQL (Drizzle ORM).

## Stack

- **Frontend:** React 19, TypeScript 5.9, Tailwind CSS 4, Framer Motion 12, Wouter 3
- **Backend:** Express 4, tRPC v11, TanStack Query v5
- **Banco de dados:** MySQL (Railway / PlanetScale / TiDB) via Drizzle ORM
- **PDF:** Puppeteer Core 25 (server-side) + jsPDF 4 / html2canvas-pro 2 (client-side fallback)
- **Package manager:** pnpm 10.4.1

## Configuração

Copie `.env.example` para `.env` e preencha as variáveis:

```bash
cp .env.example .env
```

Variáveis obrigatórias:
- `DATABASE_URL` — conexão MySQL (ex: `mysql://user:pass@host:3306/venezia_comercial`)
- `JWT_SECRET` — chave para assinar sessões (mínimo 32 caracteres)

Variáveis opcionais (OAuth para login de corretores):
- `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID`

## Desenvolvimento

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

## Testes

```bash
pnpm test
```

## Assets

Imagens do empreendimento em `client/public/assets/venezia/` — 75 arquivos (fachadas, internas, plantas, logos).

## Banco de dados

```bash
# Aplicar migrations
pnpm drizzle-kit migrate

# Abrir Drizzle Studio
pnpm drizzle-kit studio
```

## Autenticação

- **Corretores / Admin:** OAuth configurável via variáveis de ambiente (`OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID`)
- **Dashboard interno:** senha local `venezia2025` (localStorage, sem backend)
