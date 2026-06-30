# GATE DE PRODUÇÃO — VENEZIA COMERCIAL v1.0

**Data de estabelecimento:** 2026-06-29  
**Estabelecido por:** Auditor externo  
**Status atual:** FASE 3 EM ANDAMENTO

Este documento define as fases obrigatórias que devem ser concluídas antes da publicação em produção. Nenhuma fase pode ser iniciada sem a conclusão comprovada da fase anterior.

---

## FASE 1 — GOVERNANÇA

**Status: ✅ APROVADA**  
**Data de aprovação:** 2026-06-29

| Critério | Status |
|---|---|
| BASE_OFICIAL_VENEZIA.md | ✅ |
| DECISOES_ARQUITETURAIS.md | ✅ |
| PROTOCOLO_HOMOLOGACAO_VENEZIA.md | ✅ |
| STATUS_PROJETO.md | ✅ |
| CHANGELOG_HOMOLOGACAO.md | ✅ |
| EVIDENCIAS_HOMOLOGACAO.md | ✅ |
| GATE_DE_PRODUCAO.md | ✅ |
| TERMO_DE_LIBERACAO_PRODUCAO.md | ✅ |
| Regra anti-ZIP registrada | ✅ |
| Módulos congelados com política documentada | ✅ |
| Processo de homologação definido | ✅ |

---

## FASE 2 — INTERFACE COMERCIAL

**Status: 🟡 APROVADA COM RESSALVAS**  
**Data de aprovação parcial:** 2026-06-29  
**Ressalva:** Homologação visual local — fluxos completos com banco pendentes.

| Módulo | Status |
|---|---|
| Hero / Home | 👁️ CONGELADO VISUALMENTE |
| O Empreendimento | 👁️ CONGELADO VISUALMENTE |
| Diferenciais | 👁️ CONGELADO VISUALMENTE |
| Galeria | 👁️ CONGELADO VISUALMENTE |
| Implantação + Plantas | 👁️ CONGELADO VISUALMENTE |
| Tabela de Disponibilidade | 👁️ CONGELADO VISUALMENTE |
| Simulador CEF | 👁️ CONGELADO VISUALMENTE |
| Dashboard Executivo | 👁️ CONGELADO VISUALMENTE |
| Localização | 👁️ CONGELADO VISUALMENTE |
| Realização e Parceiros | ⚠️ PARCIAL |

---

## FASE 3 — BANCO DE DADOS

**Status: 🟢 AUTORIZADA — EM ANDAMENTO**  
**Data de autorização:** 2026-06-29

### Escopo PERMITIDO nesta fase
- Criação do MySQL no Railway
- Validação da DATABASE_URL
- Criação do `.env`
- Execução das migrations (Drizzle push)
- Verificação das tabelas criadas
- Seed de homologação
- Testes CRUD (INSERT / SELECT / UPDATE / DELETE)
- Validação de persistência pela interface (Etapas 7 e 8 do protocolo)

### Escopo PROIBIDO nesta fase
- Alterar layout de qualquer módulo
- Alterar assets (imagens, ícones, logos)
- Alterar componentes já congelados
- Alterar navegação lateral
- Alterar arquitetura de banco (de MySQL para outro)
- Iniciar FASE 4 antes da conclusão desta

### Checklist desta fase
| Etapa | Status |
|---|---|
| Etapa 0 — Identificação do ambiente | ☐ PENDENTE |
| Etapa 1 — Validar DATABASE_URL | ☐ PENDENTE |
| Etapa 2 — Criar .env | ☐ PENDENTE |
| Etapa 3 — Executar migrations | ☐ PENDENTE |
| Etapa 4 — Confirmar estrutura do banco | ☐ PENDENTE |
| Etapa 5 — Seed | ☐ PENDENTE |
| Etapa 6 — CRUD por tabela | ☐ PENDENTE |
| Etapa 7 — Interface consome o banco | ☐ PENDENTE |
| Etapa 8 — Persistência comprovada | ☐ PENDENTE |
| Etapa 9 — Relatório final | ☐ PENDENTE |

---

## FASE 4 — FLUXOS OPERACIONAIS

**Status: 🔒 BLOQUEADA**  
**Desbloqueio:** Conclusão comprovada da Fase 3

Fluxos que deverão ser testados:
- Login OAuth (corretor e admin)
- Painel do Corretor — visualização e edição de dados
- Painel Admin — gestão de corretores e leads
- Captura de lead pelo formulário público
- Geração de proposta com código VNZ-xxx
- PDF com fidelidade visual
- Cookie de sessão JWT (emissão, validade, logout)
- OAuth callback e criação de usuário no banco

---

## FASE 5 — DEPLOY FINAL

**Status: 🔒 BLOQUEADA**  
**Desbloqueio:** Conclusão comprovada das Fases 3 e 4

Requisitos obrigatórios antes do deploy:
- Git inicializado com commit SHA e tag `v1.0`
- Repositório remoto configurado
- Variáveis de ambiente em produção
- CHROMIUM_PATH válido no servidor de destino
- `TERMO_DE_LIBERACAO_PRODUCAO.md` completamente preenchido
- Backup do banco realizado
- Smoke test pós-deploy aprovado

---

## PROTOCOLO DE ABERTURA DE PRÓXIMA FASE

Para avançar de uma fase para a seguinte:
1. Todas as etapas da fase atual marcadas como ✅ PASSOU
2. Relatório final da fase registrado em `EVIDENCIAS_HOMOLOGACAO.md`
3. `STATUS_PROJETO.md` atualizado
4. `CHANGELOG_HOMOLOGACAO.md` atualizado
5. `GATE_DE_PRODUCAO.md` (este arquivo) atualizado com a nova fase

---

## HISTÓRICO DO GATE

| Data | Evento |
|---|---|
| 2026-06-29 | Gate criado pelo auditor externo |
| 2026-06-29 | Fase 1 (Governança) aprovada |
| 2026-06-29 | Fase 2 (Interface) aprovada com ressalvas |
| 2026-06-29 | Fase 3 (Banco) autorizada — aguardando DATABASE_URL |
