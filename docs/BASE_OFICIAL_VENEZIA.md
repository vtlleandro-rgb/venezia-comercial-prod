# BASE OFICIAL DO SISTEMA — RESIDENCIAL VENEZIA

> Este documento é a certidão de nascimento da versão oficial do projeto.
> Não pode ser alterado sem registro simultâneo em CHANGELOG_HOMOLOGACAO.md.

---

## IDENTIFICAÇÃO

| Campo | Valor |
|---|---|
| **Projeto** | Residencial Venezia — Central Comercial |
| **Versão** | 1.0 |
| **Data de certificação** | 2026-06-29 |
| **Hora de certificação** | 15:01:15 -03 (BRT) |
| **Base de referência** | BASE_OFICIAL_VENEZIA_20260629 |
| **Responsável técnico** | Claude (Anthropic — claude-sonnet-4-6) |
| **Localização** | `/Users/leandrodossantos/Claude/Projects/venezia-comercial/` |

---

## CONTROLE DE VERSÃO

| Campo | Valor |
|---|---|
| **Repositório** | Local — sem remote configurado |
| **Git Branch** | `main` |
| **Git Commit SHA** | `b647f65` |
| **Git Tag** | `v1.0-base-oficial` |
| **Snapshot MD5 dos fontes** | `7d77ce54f5d10a17c260b4288f1670f0` |
| **Hash build index.js** | `5772a48cf64ba4b6797d6da1b22833b6` (index-DbgHVFTo.js) |
| **Hash build index.es.js** | `a153a4cc50c51a650cbe77830959adb1` (index.es-CKEuEyZw.js) |
| **Total de arquivos fonte** | 162 arquivos (excluindo node_modules, dist, assets de imagem) |

> O Snapshot MD5 é calculado sobre todos os arquivos fonte ordenados. Qualquer alteração em qualquer arquivo altera este hash, funcionando como ponto de restauração.

> **Observação:** O projeto não possui git inicializado. A rastreabilidade é feita via Snapshot MD5 e os documentos `docs/`. Recomenda-se inicializar git + criar tag `v1.0-base-oficial` antes do primeiro deploy.

---

## AMBIENTE

### Sistema Operacional
| Campo | Valor |
|---|---|
| **Sistema** | macOS |
| **Kernel** | Darwin 24.6.0 |
| **Arquitetura** | arm64 (Apple Silicon) |

### Runtime
| Componente | Versão (package.json) | Versão resolvida (lockfile) |
|---|---|---|
| **Node.js** | — | v24.17.0 |
| **pnpm** | — | 11.9.0 |

### Frontend
| Dependência | Range declarado | Versão resolvida |
|---|---|---|
| **Vite** | ^7.1.7 | 7.1.9 |
| **React** | ^19.2.1 | 19.2.1 |
| **TypeScript** | 5.9.3 | 5.9.3 |
| **Tailwind CSS** | ^4.1.11 | — |
| **Framer Motion** | ^12.23.22 | 12.23.22 |
| **Wouter** | ^3.3.5 | 3.7.1 |

### Backend
| Dependência | Range declarado | Versão resolvida |
|---|---|---|
| **Express** | ^4.21.2 | 4.17.21 |
| **tRPC Server** | ^11.6.0 | 11.17.0 |
| **jose (JWT)** | 6.1.0 | 6.1.0 |
| **Puppeteer Core** | ^25.1.0 | 25.1.0 |

### Banco de dados
| Dependência | Range declarado | Versão resolvida |
|---|---|---|
| **Drizzle ORM** | ^0.44.5 | 0.44.7 |
| **Drizzle Kit** | ^0.31.4 | 0.31.10 |
| **MySQL2** | ^3.15.0 | 3.22.4 |
| **MySQL target** | — | MySQL 8 (Railway) |

---

## STATUS DOS MÓDULOS NA DATA DE CERTIFICAÇÃO

| Módulo | Status | Evidência |
|---|---|---|
| Hero / Home | 👁️ HOMOLOGADO VISUALMENTE | E01 — 01_home_topo.png |
| O Empreendimento | 👁️ HOMOLOGADO VISUALMENTE | E02 — 02_empreendimento.png |
| Diferenciais | 👁️ HOMOLOGADO VISUALMENTE | E03 — 03_diferenciais.png |
| Galeria | 👁️ HOMOLOGADO VISUALMENTE | E04 — 04_galeria.png |
| Implantação + Plantas | 👁️ HOMOLOGADO VISUALMENTE | E05 — 05_plantas.png |
| Tabela de Disponibilidade | 👁️ HOMOLOGADO VISUALMENTE | E06 — 06_tabela.png |
| Simulador CEF | 👁️ HOMOLOGADO VISUALMENTE | E07 — 07_simulador.png |
| Dashboard Executivo | 👁️ HOMOLOGADO VISUALMENTE | E08 — 08_dashboard.png |
| Localização | 👁️ HOMOLOGADO VISUALMENTE | E09 — 09_localizacao.png |
| Realização e Parceiros | ⚠️ PARCIAL | E10 — captura incompleta |
| Banco de dados — Railway MySQL | 🔄 EM HOMOLOGAÇÃO | Aguardando DATABASE_URL |
| Painel do Corretor | 🔒 BLOQUEADO | Depende de banco + OAuth |
| Admin Corretores | 🔒 BLOQUEADO | Depende de banco + OAuth |
| Proposta / PDF | 🔒 BLOQUEADO | Depende de banco |
| Deploy / Publicação Final | ⬜ NÃO INICIADO | Depende de banco + OAuth |

---

## ORIGEM

| Campo | Valor |
|---|---|
| **Plataforma de origem** | Manus (Forge / butterfly-effect.dev) |
| **Processo** | Desmanusização controlada — remoção de todas as dependências Manus/Forge |
| **Validação de desmanusização** | Aprovada por auditor externo em 2026-06-29 |
| **ZIP de código auditado** | VENEZIA_v2_codigo_20260629.zip |
| **0 referências Forge no frontend** | Comprovado |
| **0 referências /manus-storage/** | Comprovado |
| **0 referências BUILT_IN_FORGE_API_*** | Comprovado |

---

## INTEGRIDADE DO BUILD

```
vite build:   ✓ 2653 modules transformed — built in 4.60s
tsc --noEmit: ✓ PASS — 0 erros
```

---

## PONTO DE RESTAURAÇÃO

Para restaurar o projeto ao estado desta base oficial:

1. Verificar que o Snapshot MD5 dos fontes é `7d77ce54f5d10a17c260b4288f1670f0`
2. Confirmar que o build produz `index-DbgHVFTo.js` com MD5 `5772a48cf64ba4b6797d6da1b22833b6`
3. Confirmar `tsc --noEmit` sem erros
4. Confirmar `vite build` sem erros

Se qualquer um desses valores divergir, a base foi alterada após esta certificação.
