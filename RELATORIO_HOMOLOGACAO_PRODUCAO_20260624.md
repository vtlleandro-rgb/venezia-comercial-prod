# Relatorio de Homologacao - Venezia Comercial

Data/hora da verificacao: 2026-06-24 15:59:25 -03

## Status geral

Homologacao de producao iniciada, mas bloqueada na camada de deploy/backend.

O sistema local/empacotado esta tecnicamente pronto para homologacao, mas o ambiente publicado ainda nao comprova o fluxo ponta a ponta porque:

- o backend Railway publicado retorna HTTP 502;
- o endpoint `GET /api/health` ainda nao responde na URL de producao;
- o frontend Vercel publicado responde HTTP 200, mas ainda serve bundle antigo, diferente do build local final.

## URLs verificadas

- Frontend Vercel: `https://venezia-comercial-prod.vercel.app/`
- Backend Railway: `https://venezia-comercial-prod-production.up.railway.app`
- Health check esperado: `https://venezia-comercial-prod-production.up.railway.app/api/health`

## Evidencia 1 - Frontend Vercel

Resultado:

- HTTP 200
- Servidor: Vercel
- Pagina carregada: `Residencial Venezia — Central Comercial`

Observacao critica:

O HTML publicado na Vercel referencia:

- JS: `/assets/index-CTO4X-EF.js`
- CSS: `/assets/index-CcsERXQ-.css`

O build local final referencia:

- JS: `/assets/index-M9P_YV__.js`
- CSS: `/assets/index-DXishP15.css`

Conclusao:

O frontend publicado esta online, mas ainda nao comprova o ultimo pacote final gerado nesta homologacao.

## Evidencia 2 - Backend Railway /api/health

Comando validado:

`GET https://venezia-comercial-prod-production.up.railway.app/api/health`

Resultado:

- HTTP 502
- Resposta Railway:

```json
{
  "status": "error",
  "code": 502,
  "message": "Application failed to respond"
}
```

Conclusao:

Backend Railway nao esta operacional no deploy atual. A homologacao nao pode avancar para login, banco, PDF ou fluxo comercial enquanto esse endpoint nao responder HTTP 200 com `{ "ok": true }`.

## Evidencia 3 - CORS/preflight

Comando validado:

`OPTIONS https://venezia-comercial-prod-production.up.railway.app/api/trpc/auth.me`

Headers enviados:

- `Origin: https://venezia-comercial-prod.vercel.app`
- `Access-Control-Request-Method: POST`
- `Access-Control-Request-Headers: content-type`

Resultado:

- HTTP 502
- Resposta Railway: `Application failed to respond`

Conclusao:

Nao foi possivel homologar CORS em producao porque o backend publicado nao respondeu.

## Checklist de homologacao

| Item | Status | Evidencia |
| --- | --- | --- |
| Frontend Vercel online | Parcial | HTTP 200, mas bundle publicado nao e o build final |
| Backend Railway operacional | Reprovado | HTTP 502 |
| `/api/health` HTTP 200 | Reprovado | HTTP 502 |
| Banco MySQL conectado | Nao executado | Bloqueado por backend 502 e falta de execucao no Railway |
| Migrations executadas | Nao executado | Requer Railway/MySQL operacional |
| Seed executado | Nao executado | Requer Railway/MySQL operacional |
| Login Vercel -> Railway -> cookie -> painel | Nao executado | Bloqueado por backend 502 |
| Criar corretor | Nao executado | Bloqueado por backend 502 |
| Criar lead | Nao executado | Bloqueado por backend 502 |
| Gerar proposta | Nao executado | Bloqueado por backend 502 |
| Alterar status de unidade | Nao executado | Bloqueado por backend 502 |
| Criar reserva | Nao executado | Bloqueado por backend 502 |
| Simular venda | Nao executado | Bloqueado por backend 502 |
| Simular cancelamento | Nao executado | Bloqueado por backend 502 |
| Confirmar persistencia no banco | Nao executado | Requer MySQL Railway com migrations e seed |
| PDF real no Railway | Nao executado | Bloqueado por backend 502 |

## Proxima acao operacional obrigatoria

Nao ha nova reconstrucao de codigo indicada neste momento.

Para desbloquear a homologacao, o pacote final precisa ser publicado:

1. Redeploy do backend Railway usando o pacote com `railway.json`.
2. Build Railway esperado: `pnpm install --no-frozen-lockfile && pnpm build:api`.
3. Start Railway esperado: `pnpm start`.
4. Variaveis Railway obrigatorias:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `ADMIN_PASSWORD`
   - `FRONTEND_URL=https://venezia-comercial-prod.vercel.app`
   - `NODE_ENV=production`
   - `CHROMIUM_PATH=/usr/bin/chromium`
5. Executar no Railway/MySQL:
   - `pnpm db:migrate`
   - `pnpm db:seed`
6. Redeploy do frontend Vercel com:
   - `VITE_API_URL=https://venezia-comercial-prod-production.up.railway.app`

## Veredito de homologacao

Status: bloqueado por deploy/backend.

O codigo final contem as correcoes exigidas, mas o ambiente de producao ainda nao esta homologado. O primeiro criterio para retomada da homologacao e:

`GET /api/health -> HTTP 200 -> { "ok": true }`

Somente depois disso faz sentido validar login, banco, proposta, PDF e operacoes comerciais.
