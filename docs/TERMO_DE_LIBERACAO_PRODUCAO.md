# TERMO DE LIBERAÇÃO PARA PRODUÇÃO — RESIDENCIAL VENEZIA COMERCIAL

> Este documento representa a autorização formal para publicação em produção.
> **Nenhuma publicação poderá ocorrer sem que este termo esteja completamente preenchido e assinado.**

**Versão do termo:** 1.0  
**Data de criação:** 2026-06-29  
**Status atual:** 🔴 NÃO PREENCHIDO — publicação em produção BLOQUEADA

---

## IDENTIFICAÇÃO DA VERSÃO

| Campo | Valor |
|---|---|
| **Projeto** | Residencial Venezia — Central Comercial |
| **Versão** | |
| **Data de preenchimento** | |
| **Base de referência** | |
| **Commit SHA** | |
| **Tag Git** | |
| **Build hash (index.js)** | |

---

## CHECKLIST TÉCNICO

Cada item deve ser marcado como ✅ PASSOU ou ✗ FALHOU com evidência.  
Nenhum item pode ser marcado sem evidência objetiva em `EVIDENCIAS_HOMOLOGACAO.md`.

### FASE 1 — Governança

| Item | Status | Evidência |
|---|---|---|
| BASE_OFICIAL_VENEZIA.md criada e preenchida | ✅ PASSOU | docs/BASE_OFICIAL_VENEZIA.md (2026-06-29) |
| DECISOES_ARQUITETURAIS.md criada | ✅ PASSOU | docs/DECISOES_ARQUITETURAIS.md (2026-06-29) |
| PROTOCOLO_HOMOLOGACAO_VENEZIA.md criado | ✅ PASSOU | docs/PROTOCOLO_HOMOLOGACAO_VENEZIA.md (2026-06-29) |
| STATUS_PROJETO.md criado e atualizado | ✅ PASSOU | docs/STATUS_PROJETO.md (2026-06-29) |
| CHANGELOG_HOMOLOGACAO.md criado e ativo | ✅ PASSOU | docs/CHANGELOG_HOMOLOGACAO.md (2026-06-29) |
| EVIDENCIAS_HOMOLOGACAO.md criado e ativo | ✅ PASSOU | docs/EVIDENCIAS_HOMOLOGACAO.md (2026-06-29) |
| Regra anti-ZIP registrada | ✅ PASSOU | Memória permanente + docs/ |
| Módulos congelados com política documentada | ✅ PASSOU | STATUS_PROJETO.md (2026-06-29) |

### FASE 2 — Build e Qualidade de Código

| Item | Status | Evidência |
|---|---|---|
| `tsc --noEmit` sem erros | ✅ PASSOU | PASS — 2026-06-29 |
| `vite build` sem erros | ✅ PASSOU | 2653 modules — 2026-06-29 |
| 0 referências Forge/Manus no frontend | ✅ PASSOU | grep — 2026-06-29 |
| 0 referências /manus-storage/ | ✅ PASSOU | grep — 2026-06-29 |
| Commit SHA registrado | ☐ PENDENTE | Git não inicializado |
| Tag Git `v1.0` criada | ☐ PENDENTE | Git não inicializado |
| GitHub Actions verde | ☐ PENDENTE | Repositório remoto não configurado |

### FASE 3 — Interface Comercial

| Item | Status | Evidência |
|---|---|---|
| Hero / Home | 👁️ VISUAL | E01 — 01_home_topo.png |
| O Empreendimento | 👁️ VISUAL | E02 — 02_empreendimento.png |
| Diferenciais | 👁️ VISUAL | E03 — 03_diferenciais.png |
| Galeria | 👁️ VISUAL | E04 — 04_galeria.png |
| Implantação + Plantas | 👁️ VISUAL | E05 — 05_plantas.png |
| Tabela de Disponibilidade | 👁️ VISUAL | E06 — 06_tabela.png |
| Simulador CEF | 👁️ VISUAL | E07 — 07_simulador.png |
| Dashboard Executivo | 👁️ VISUAL | E08 — 08_dashboard.png |
| Localização | 👁️ VISUAL | E09 — 09_localizacao.png |
| Realização e Parceiros | ⚠️ PARCIAL | E10 — captura incompleta |

### FASE 4 — Banco de Dados (Railway MySQL)

| Item | Status | Evidência |
|---|---|---|
| DATABASE_URL validada | ☐ PENDENTE | |
| Migrations executadas (4/4) | ☐ PENDENTE | |
| Tabelas confirmadas no banco | ☐ PENDENTE | |
| Seed executado com sucesso | ☐ PENDENTE | |
| INSERT corretores comprovado | ☐ PENDENTE | |
| SELECT corretores comprovado | ☐ PENDENTE | |
| INSERT leads comprovado | ☐ PENDENTE | |
| SELECT leads comprovado | ☐ PENDENTE | |
| INSERT propostas comprovado | ☐ PENDENTE | |
| SELECT propostas comprovado | ☐ PENDENTE | |
| INSERT acessos comprovado | ☐ PENDENTE | |
| INSERT cancelamentos comprovado | ☐ PENDENTE | |
| Persistência comprovada (interface → banco → reload) | ☐ PENDENTE | |
| Railway Health OK | ☐ PENDENTE | |
| Backup automático ativado | ☐ PENDENTE | |

### FASE 5 — Fluxos Operacionais

| Item | Status | Evidência |
|---|---|---|
| Login OAuth funcional | ☐ PENDENTE | |
| Painel do Corretor (/corretor) funcional | ☐ PENDENTE | |
| Painel Admin (/admin/corretores) funcional | ☐ PENDENTE | |
| Captura de lead pelo formulário público | ☐ PENDENTE | |
| Geração de proposta funcional | ☐ PENDENTE | |
| PDF gerado com fidelidade visual | ☐ PENDENTE | |
| Cookie de sessão (JWT) funcionando | ☐ PENDENTE | |
| Logout funcional | ☐ PENDENTE | |

### FASE 6 — Deploy

| Item | Status | Evidência |
|---|---|---|
| Repositório remoto configurado (GitHub) | ☐ PENDENTE | |
| Variáveis de ambiente em produção configuradas | ☐ PENDENTE | |
| CHROMIUM_PATH válido no servidor | ☐ PENDENTE | |
| Deploy executado sem erros | ☐ PENDENTE | |
| URL de produção acessível | ☐ PENDENTE | |
| Smoke test pós-deploy (Home, Simulador, Lead) | ☐ PENDENTE | |
| Backup do banco pré-deploy realizado | ☐ PENDENTE | |

---

## APROVAÇÃO FINAL

**Este campo só pode ser preenchido quando TODOS os itens acima estiverem como ✅ PASSOU.**

| Campo | Valor |
|---|---|
| **Responsável Técnico** | |
| **Data da aprovação** | |
| **Commit SHA aprovado** | |
| **Tag Git** | |
| **Versão** | |
| **URL de produção** | |
| **Observações** | |

---

## HISTÓRICO DO TERMO

| Data | Evento |
|---|---|
| 2026-06-29 | Termo criado — publicação em produção BLOQUEADA |
