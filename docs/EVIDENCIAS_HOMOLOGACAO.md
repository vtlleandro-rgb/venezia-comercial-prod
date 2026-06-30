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
- **Observação:** Dados em localStorage — sem persistência de banco nesta etapa
- **Resultado:** 👁️ HOMOLOGADO VISUALMENTE (localStorage)

### E07 — Simulador CEF
- **Arquivo:** 07_simulador.png
- **Horário:** 2026-06-29 ~13:20
- **O que foi verificado:** Campos de Reforços, slider de entrada em 20%, card "Entrada — 20%" com R$ 2.083,33/mês × 36 parcelas, slider de prazo (420 meses / 35 anos), checkbox FGTS, card "Financiamento CEF — 80%" com R$ 2.190,86/mês × 420 parcelas, Resumo da Simulação
- **Resultado:** ✓ PASSOU

### E08 — Dashboard Executivo
- **Arquivo:** 08_dashboard.png
- **Horário:** 2026-06-29 ~13:20
- **O que foi verificado:** Tela "Área Restrita" com botão "Desbloquear Acesso" — proteção por senha funcionando corretamente
- **Observação:** Dados em localStorage — sem persistência de banco nesta etapa
- **Resultado:** 👁️ HOMOLOGADO VISUALMENTE (localStorage)

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
**Data:** Pendente  
**Ambiente:** Railway MySQL (cloud)  
**Backend:** Express + tRPC (a iniciar)  
**Status:** 🔄 AGUARDANDO DATABASE_URL

*(Esta seção será preenchida durante a execução das 9 etapas oficiais)*

---

## ÍNDICE DE EVIDÊNCIAS

| Código | Arquivo | Módulo | Data | Resultado |
|---|---|---|---|---|
| E01 | 01_home_topo.png | Hero / Home | 2026-06-29 | ✓ PASSOU |
| E02 | 02_empreendimento.png | O Empreendimento | 2026-06-29 | ✓ PASSOU |
| E03 | 03_diferenciais.png | Diferenciais | 2026-06-29 | ✓ PASSOU |
| E04 | 04_galeria.png | Galeria | 2026-06-29 | ✓ PASSOU |
| E05 | 05_plantas.png | Implantação + Plantas | 2026-06-29 | ✓ PASSOU |
| E06 | 06_tabela.png | Tabela | 2026-06-29 | 👁️ VISUALMENTE |
| E07 | 07_simulador.png | Simulador CEF | 2026-06-29 | ✓ PASSOU |
| E08 | 08_dashboard.png | Dashboard Executivo | 2026-06-29 | 👁️ VISUALMENTE |
| E09 | 09_localizacao.png | Localização | 2026-06-29 | ✓ PASSOU |
| E10 | — | Parceiros | 2026-06-29 | ⚠ PARCIAL |
| E11 | — | Painel Corretor | 2026-06-29 | 🔒 BLOQUEADO |
| E12 | — | Admin Corretores | 2026-06-29 | 🔒 BLOQUEADO |
| E13 | — | Proposta / PDF | 2026-06-29 | 🔒 BLOQUEADO |
