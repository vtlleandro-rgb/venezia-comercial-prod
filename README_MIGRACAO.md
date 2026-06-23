# Migração — Fase 1: site público

Esta cópia torna o site institucional do Residencial Venezia independente do runtime, armazenamento e proxy do Manus. Não altera regras de vendas, simulador, reservas, painel ou autenticação local.

## Rodar localmente

Requer Node.js 20.19+ (ou 22.12+) e pnpm 10.

```bash
pnpm install
pnpm dev
```

Abra o endereço informado pelo Vite, normalmente `http://localhost:3000`.

Para validar a versão de produção:

```bash
pnpm build
pnpm preview
```

O resultado publicável fica em `dist/`.

## Publicar na Vercel

1. Envie esta pasta a um repositório Git.
2. Importe o repositório na Vercel.
3. Use `pnpm build` como comando de build e `dist` como diretório de saída.
4. Publique. O arquivo `vercel.json` já mantém o fallback de rotas da aplicação.

## Publicar no Cloudflare Pages

1. Conecte o repositório em **Workers & Pages**.
2. Selecione o preset Vite.
3. Use `pnpm build` como comando de build e `dist` como diretório de saída.
4. Publique. O arquivo `client/public/_redirects` é copiado ao build e preserva o fallback SPA.

## Imagens pendentes

O backup exportado não contém os ativos visuais originais. As antigas URLs `/manus-storage/` foram substituídas por `client/public/assets/venezia/placeholder.svg`, para que nenhuma imagem quebre em produção.

Quando os arquivos forem recuperados, coloque-os em `client/public/assets/venezia/` e troque cada placeholder pelo respectivo caminho local. As duas imagens que já eram externas (CloudFront) foram preservadas.

## Limites desta fase

Este ainda não é um sistema comercial seguro. Propostas, status, dados de clientes e senha continuam locais ao navegador, como no projeto original. Banco de dados, login real, LGPD e sincronização pertencem à Fase 2.
