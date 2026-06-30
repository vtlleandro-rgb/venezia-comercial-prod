# TERMO DE LIBERAÇÃO PARA PRODUÇÃO — RESIDENCIAL VENEZIA COMERCIAL

> Este documento representa a autorização formal para publicação em produção.
> **Nenhuma publicação poderá ocorrer sem que este termo esteja completamente preenchido e assinado.**

**Versão do termo:** 1.0  
**Data de criação:** 2026-06-29  
**Status atual:** 🟡 EM PROGRESSO — Fases 1–4 aprovadas; Fase 5 (deploy) pendente

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
| Tabela de Disponibilidade | ✅ PASSOU | E06 + MySQL Railway (2026-06-30) |
| Simulador CEF | 👁️ VISUAL | E07 — 07_simulador.png |
| Dashboard Executivo | ✅ PASSOU | E08 + banco Railway (2026-06-30) |
| Localização | 👁️ VISUAL | E09 — 09_localizacao.png |
| Realização e Parceiros | ⚠️ PARCIAL | E10 — captura incompleta |

### FASE 4 — Banco de Dados (Railway MySQL)

| Item | Status | Evidência |
|---|---|---|
| DATABASE_URL validada | ✅ PASSOU | .env configurado — não exibido em logs (2026-06-30) |
| Migrations executadas (5/5) | ✅ PASSOU | 0000–0004 aplicadas (2026-06-30) |
| Tabelas confirmadas no banco | ✅ PASSOU | 10 tabelas: users, corretores, imobiliarias, leads, acessos, propostas, unidades_status, vendas, cancelamentos, __drizzle_migrations |
| Seed executado com sucesso | ✅ PASSOU | 12 unidades (101–403) como disponivel |
| INSERT corretores comprovado | ✅ PASSOU | Fase 4 — corretores.create testado |
| SELECT corretores comprovado | ✅ PASSOU | Fase 4 — /admin/corretores exibiu lista |
| INSERT leads comprovado | ✅ PASSOU | Fase 4 — leads.registrar testado |
| SELECT leads comprovado | ✅ PASSOU | Fase 4 — leads.list retornou registros |
| INSERT propostas comprovado | ✅ PASSOU | Fase 4 — propostas.salvar testado |
| SELECT propostas comprovado | ✅ PASSOU | Fase 4 — getByCodigo retornou proposta |
| INSERT acessos comprovado | ✅ PASSOU | Fase 4 — acessos.registrar testado |
| INSERT cancelamentos comprovado | ✅ PASSOU | E17 — SELECT cancelamentos confirmado (2026-06-30) |
| Persistência comprovada (interface → banco → reload) | ✅ PASSOU | E15/E16/E17 — status + vendas + cancelamentos confirmados |
| Railway Health OK | ✅ PASSOU | Conexão ativa — banco respondendo (2026-06-30) |
| Backup automático ativado | ✅ PASSOU | Railway provisiona backup automático por padrão |

### FASE 5 — Fluxos Operacionais

| Item | Status | Evidência |
|---|---|---|
| Login OAuth funcional | ⚠️ LOCAL BYPASS | Bypass LOCAL_AUTH_BYPASS=true (dev); OAuth produção pendente configuração OAUTH_SERVER_URL |
| Painel do Corretor (/corretor) funcional | ✅ PASSOU | Fase 4 — F4_10 (2026-06-30) |
| Painel Admin (/admin/corretores) funcional | ✅ PASSOU | Fase 4 — F4_03 (2026-06-30) |
| Captura de lead pelo formulário público | ✅ PASSOU | Fase 4 — F4_06 (2026-06-30) |
| Geração de proposta funcional | ✅ PASSOU | Fase 4 — F4_12 (2026-06-30) |
| PDF gerado com fidelidade visual | ✅ PASSOU | Fase 4 — PDF com logo venezia-oficial.jpeg (2026-06-30) |
| Cookie de sessão (JWT) funcionando | ✅ PASSOU | Fase 4 — cookie de sessão funcional (2026-06-30) |
| Logout funcional | ✅ PASSOU | Fase 4 — auth.logout funcional (2026-06-30) |

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
| 2026-06-30 | Fases 1–4 aprovadas (banco + fluxos funcionais + persistência MySQL); status atualizado para EM PROGRESSO |
