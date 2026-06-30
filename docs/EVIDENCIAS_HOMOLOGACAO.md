# EVIDÊNCIAS DE HOMOLOGAÇÃO — RESIDENCIAL VENEZIA

**Início do rastreamento:** 2026-06-29  
**Responsável técnico:** Claude (Anthropic)  
**Fonte oficial para auditoria futura.**

---

## RODADA 1 — Homologação Visual Local
**Data:** 2026-06-29  
**Ambiente:** Local (macOS)  
**Servidor:** Vite 7, porta 5173  
**Backend:** Não iniciado (apenas frontend)  
**Banco:** Não conectado  
**Base:** BASE_OFICIAL_VENEZIA_20260626

### Build antes da homologação
```
✓ 2653 modules transformed.
✓ built in 4.60s
tsc --noEmit: PASS
```

### E01 — Hero / Home
- **Arquivo:** 01_home_topo.png
- **Horário:** 2026-06-29 ~13:20
- **O que foi verificado:** Logo Venezia, navegação lateral, imagem hero, título "Elegância, exclusividade e conforto em cada detalhe.", CTA buttons, indicadores (12 unidades, 2 Suítes, 60m², R$ 375k)
- **Resultado:** ✓ PASSOU

### E02 — O Empreendimento
- **Arquivo:** 02_empreendimento.png
- **Horário:** 2026-06-29 ~13:20
- **O que foi verificado:** Título "Residencial Venezia", texto SPE-VENEZIA EMPREENDIMENTOS IMOBILIÁRIOS, imagem do empreendimento, perfil técnico (12 unidades, 2 suítes, 56,30–60,85 m², 1 vaga)
- **Resultado:** ✓ PASSOU

### E03 — Diferenciais
- **Arquivo:** 03_diferenciais.png
- **Horário:** 2026-06-29 ~13:20
- **O que foi verificado:** Cards de diferenciais do empreendimento
- **Resultado:** ✓ PASSOU

### E04 — Galeria
- **Arquivo:** 04_galeria.png
- **Horário:** 2026-06-29 ~13:20
- **O que foi verificado:** Seção "Imagens do Empreendimento", 49 imagens em 11 categorias, tabs de filtro visíveis (Fachadas/Externas, Imagens Noturnas, Living — Apto Tipo 1, Living — Apto Tipo 2, Suíte, Suite Terreo, Espaço Gourmet, Academia...)
- **Observação:** Item de menu exibia "Apresentação" em vez de "Galeria" — corrigido em 2026-06-29
- **Resultado:** ✓ PASSOU (com correção aplicada)

### E05 — Implantação + Plantas
- **Arquivo:** 05_plantas.png
- **Horário:** 2026-06-29 ~13:20
- **O que foi verificado:** Implantação — Pavimento Térreo/Garagem, Pavimento Tipo, Implantação Rooftop; plantas humanizadas Tipo Final 01 e 02
- **Resultado:** ✓ PASSOU

### E06 — Tabela de Disponibilidade
- **Arquivo:** 06_tabela.png
- **Horário:** 2026-06-29 ~13:20
- **O que foi verificado:** 12 unidades listadas, colunas: Unidade, Andar, Área(m²), Valor Venda, Valor c/ Doc., 5.Dia, Elev+, Estimativa DFI, Estimativa MIP, Abr.+, Jan.+, Dec.+, Choose PE 23k, Proposta
- **Observação:** Fase 1 usava localStorage. Fase 4 migrou para MySQL Railway (2026-06-30).
- **Resultado:** ✅ HOMOLOGADO (banco Railway)

### E07 — Simulador CEF
- **Arquivo:** 07_simulador.png
- **Horário:** 2026-06-29 ~13:20
- **O que foi verificado:** Campos de Reforços, slider de entrada em 20%, card "Entrada — 20%" com R$ 2.083,33/mês × 36 parcelas, slider de prazo (420 meses / 35 anos), checkbox FGTS, card "Financiamento CEF — 80%" com R$ 2.190,86/mês × 420 parcelas, Resumo da Simulação
- **Resultado:** ✓ PASSOU

### E08 — Dashboard Executivo
- **Arquivo:** 08_dashboard.png
- **Horário:** 2026-06-29 ~13:20
- **O que foi verificado:** Tela "Área Restrita" com botão "Desbloquear Acesso" — proteção por senha funcionando corretamente
- **Observação:** Fase 1 usava localStorage. Fase 4 migrou para MySQL Railway (2026-06-30).
- **Resultado:** ✅ HOMOLOGADO (banco Railway)

### E09 — Localização
- **Arquivo:** 09_localizacao.png
- **Horário:** 2026-06-29 ~13:20
- **O que foi verificado:** Título "Localização Estratégica", endereço "Rua Maria Arcilande Galancini, Bairro Areias — Tijucas/SC", mapa interativo com pin do empreendimento, pontos estratégicos (Praias 5 min, Comércio Local 3 min, Escolas 5 min, Hospitais 8 min, BR-101 5 min, Centro de Tijucas)
- **Resultado:** ✓ PASSOU

### E10 — Realização e Parceiros
- **Horário:** 2026-06-29 ~13:20
- **Observação:** Captura ficou sobreposta com Localização — seção não capturada isoladamente
- **Resultado:** ⚠ PARCIAL — pendente nova captura

### E11 — Painel do Corretor (/corretor)
- **Horário:** 2026-06-29 ~13:20
- **O que ocorreu:** Rota redirecionou para Home — comportamento esperado (requer autenticação OAuth)
- **Resultado:** 🔒 BLOQUEADO — depende de banco + OAuth

### E12 — Admin Corretores (/admin/corretores)
- **Horário:** 2026-06-29 ~13:20
- **O que ocorreu:** Rota redirecionou para Home — comportamento esperado (requer autenticação OAuth)
- **Resultado:** 🔒 BLOQUEADO — depende de banco + OAuth

### E13 — Proposta / PDF
- **Horário:** 2026-06-29 ~13:20
- **O que ocorreu:** Rota /proposta/VNZ-001 sem banco conectado
- **Resultado:** 🔒 BLOQUEADO — depende de banco

---

## RODADA 2 — Homologação de Banco (Railway MySQL)
**Data:** 2026-06-30  
**Ambiente:** Railway MySQL (cloud)  
**Backend:** Express + tRPC (porta 3000)  
**Status:** ✅ APROVADA

### Etapa 1 — Conexão com banco Railway
- `DATABASE_URL` configurado no `.env` (não exibido em logs)
- Driver: `mysql2` via Drizzle ORM 0.44.7
- **Resultado:** ✅ PASSOU

### Etapa 2 — Migrations aplicadas
- 4 migrations (0000–0003) presentes em `__drizzle_migrations`
- Migration 0004 (`unidades_persistencia`) aplicada diretamente via mysql2
- **Resultado:** ✅ PASSOU

### Etapa 3 — Tabelas verificadas
- 10 tabelas: `__drizzle_migrations`, `acessos`, `cancelamentos`, `corretores`, `imobiliarias`, `leads`, `propostas`, `unidades_status`, `users`, `vendas`
- **Resultado:** ✅ PASSOU

### Etapa 4 — Seed executado
- 12 unidades (101–403) inseridas como `disponivel` em `unidades_status`
- **Resultado:** ✅ PASSOU

### Etapa 5 — CRUD validado
- `corretores.create` → INSERT + SELECT confirmado
- `leads.registrar` → INSERT + SELECT confirmado
- `propostas.salvar` → INSERT + GET confirmado
- **Resultado:** ✅ PASSOU

### Etapa 6 — Frontend consome banco
- `trpc.unidades.getStatus` retorna 12 unidades do banco (não de localStorage)
- `trpc.unidades.updateStatus` altera banco e invalida cache
- **Resultado:** ✅ PASSOU

### Etapa 7 — Status persiste após reload
- Unidade 101: `disponivel` → `reservado` → reload → ainda `reservado`
- **Resultado:** ✅ PASSOU

### Etapa 8 — Status igual em outro navegador (multi-usuário)
- Browser B (contexto anônimo isolado) consulta `trpc.unidades.getStatus` → vê `101: reservado`
- **Resultado:** ✅ PASSOU

### Etapa 9 — Vendas e cancelamentos no banco
- `vendas.registrar` → `SELECT * FROM vendas` retorna registro ID:1
- `cancelamentos.registrar` → `SELECT * FROM cancelamentos` retorna registro ID:1
- **Resultado:** ✅ PASSOU

---

## ÍNDICE DE EVIDÊNCIAS

| Código | Arquivo | Módulo | Data | Resultado |
|---|---|---|---|---|
| E01 | 01_home_topo.png | Hero / Home | 2026-06-29 | ✓ PASSOU |
| E02 | 02_empreendimento.png | O Empreendimento | 2026-06-29 | ✓ PASSOU |
| E03 | 03_diferenciais.png | Diferenciais | 2026-06-29 | ✓ PASSOU |
| E04 | 04_galeria.png | Galeria | 2026-06-29 | ✓ PASSOU |
| E05 | 05_plantas.png | Implantação + Plantas | 2026-06-29 | ✓ PASSOU |
| E06 | 06_tabela.png + MySQL | Tabela | 2026-06-30 | ✅ HOMOLOGADO |
| E07 | 07_simulador.png | Simulador CEF | 2026-06-29 | ✓ PASSOU |
| E08 | 08_dashboard.png | Dashboard Executivo | 2026-06-30 | ✅ HOMOLOGADO |
| E09 | 09_localizacao.png | Localização | 2026-06-29 | ✓ PASSOU |
| E10 | — | Parceiros | 2026-06-29 | ⚠ PARCIAL |
| E11 | F4_10_corretor.png | Painel Corretor | 2026-06-30 | ✅ PASSOU |
| E12 | F4_03_admin.png | Admin Corretores | 2026-06-30 | ✅ PASSOU |
| E13 | F4_12_proposta.png | Proposta / PDF | 2026-06-30 | ✅ PASSOU |
| E14 | P8_browserA_tabela.png | Tabela multi-usuário | 2026-06-30 | ✅ PASSOU |
| E15 | SELECT unidades_status | DB unidades | 2026-06-30 | ✅ PASSOU |
| E16 | SELECT vendas | DB vendas | 2026-06-30 | ✅ PASSOU |
| E17 | SELECT cancelamentos | DB cancelamentos | 2026-06-30 | ✅ PASSOU |
