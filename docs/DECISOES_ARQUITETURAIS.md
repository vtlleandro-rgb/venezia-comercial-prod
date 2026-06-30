# DECISÕES ARQUITETURAIS — RESIDENCIAL VENEZIA

**Início do registro:** 2026-06-29  
**Responsável técnico:** Claude (Anthropic)

Este documento registra decisões de arquitetura tomadas durante o projeto — não o código, mas o raciocínio que levou a cada escolha. Serve para que qualquer pessoa que entre no projeto futuramente entenda o porquê de cada estrutura, sem depender de memória de conversa.

Cada decisão registra: a escolha feita, o motivo, as alternativas descartadas e a data.

---

## DECISÃO 001 — Status das Unidades em localStorage

**Status:** ~~ATIVA~~ **REVOGADA — substituída por DECISÃO 008**  
**Data original:** 2026-06-29 | **Data de revogação:** 2026-06-30  
**Responsável:** Claude  
**Módulo afetado:** Tabela de Disponibilidade, Dashboard Executivo

**Escolha original:** `localStorage` (client-side, sem persistência em banco)

**Motivo da revogação (2026-06-30):**  
Decisão 001 foi tomada como solução inicial para a Fase 2 (interface). Na Fase 4 (homologação funcional), o auditor identificou que o sistema será operado por equipe comercial com múltiplos usuários em dispositivos diferentes. `localStorage` é isolado por navegador — um corretor em um dispositivo não enxerga o status marcado por outro corretor, tornando o sistema inoperável para operação comercial real. A decisão foi revogada e substituída pela DECISÃO 008.

**Ver:** DECISÃO 008 abaixo.

---

## DECISÃO 002 — OAuth como Opcional

**Status:** ATIVA  
**Data:** 2026-06-29  
**Responsável:** Claude  
**Módulo afetado:** Autenticação, Painel do Corretor, Admin Corretores

**Escolha:** OAuth configurável via variável de ambiente `OAUTH_SERVER_URL` — sem valor, o login OAuth simplesmente não funciona, mas o sistema não quebra.

**Motivo:**  
Durante a desmanusização, o provider OAuth original era o Manus. Ao remover o Manus, o provider ficou genérico. O sistema foi projetado para ser agnóstico: qualquer provider OAuth 2.0 compatível com o caminho `WebDevAuthPublicService` funciona. Sem configuração, o sistema roda normalmente para o público (Home, Galeria, Simulador, etc.).

**Alternativas descartadas:**  
- OAuth obrigatório: descartado porque bloquearia o sistema inteiro se o provider estivesse fora do ar.  
- Autenticação própria com email/senha: descartada por aumentar a superfície de ataque e o escopo da fase atual.

**Consequência registrada:**  
Sem `OAUTH_SERVER_URL`, as rotas `/corretor` e `/admin/corretores` redirecionam para Home. Isso é comportamento esperado e documentado. O acesso ao Dashboard usa senha local `venezia2025` (client-side), independente de OAuth.

---

## DECISÃO 003 — Senha do Dashboard Hardcoded (Client-Side)

**Status:** ATIVA  
**Data:** 2026-06-29  
**Responsável:** Claude  
**Módulo afetado:** Dashboard Executivo

**Escolha:** Senha `venezia2025` verificada no `AuthContext.tsx` (client-side, sem backend)

**Motivo:**  
O Dashboard mostra indicadores de vendas da equipe comercial (VGV, unidades disponíveis/reservadas/vendidas). Não contém dados pessoais de clientes nem acesso administrativo ao banco. A proteção por senha simples no frontend é suficiente para impedir acesso acidental por visitantes do site, sem o custo de implementar autenticação de dois níveis.

**Alternativas descartadas:**  
- Autenticação server-side para o Dashboard: descartada por over-engineering — o Dashboard é uma camada de visualização de dados que já estão em localStorage.  
- Sem proteção: descartado porque a equipe não quer que os indicadores de vendas fiquem visíveis para qualquer visitante.

**Consequência registrada:**  
A senha pode ser descoberta por qualquer pessoa com acesso ao código-fonte do bundle (`AuthContext.tsx` compilado). Isso foi avaliado e aceito: o Dashboard não expõe dados sensíveis que justifiquem proteção criptográfica.

---

## DECISÃO 004 — Galeria como Módulo da Home (Single-Page)

**Status:** ATIVA  
**Data:** 2026-06-29  
**Responsável:** Claude  
**Módulo afetado:** Galeria, Navegação

**Escolha:** Galeria como seção da rota `/` (single-page), não como rota separada `/galeria`

**Motivo:**  
O modelo comercial do empreendimento é um single-page site de vendas — padrão do setor imobiliário de alto padrão. A navegação por scroll mantém o cliente em fluxo contínuo: Hero → Empreendimento → Diferenciais → Galeria → Plantas → Tabela → Simulador. Quebrar esse fluxo com rotas separadas prejudica a experiência de apresentação.

**Alternativas descartadas:**  
- Rota dedicada `/galeria`: descartada por quebrar o fluxo de apresentação e aumentar a navegação necessária durante um atendimento.

---

## DECISÃO 005 — Implantação como Seção de Plantas (Não Módulo Separado)

**Status:** ATIVA  
**Data:** 2026-06-29  
**Responsável:** Claude  
**Módulo afetado:** PlantasSection, Navegação

**Escolha:** Implantação e plantas humanizadas na mesma seção (`PlantasSection.tsx`), acessada pelo item "Implantação" na navegação.

**Motivo:**  
Implantação e plantas são materiais técnicos complementares consultados no mesmo momento da negociação (quando o cliente pergunta "qual o layout do apartamento?"). Separá-los criaria duas seções com um item de menu cada, aumentando o scroll desnecessariamente.

**Alternativas descartadas:**  
- LazerSection como módulo próprio no menu: descartada por já estar integrada na sequência visual da Galeria.  
- Menu item "Plantas" separado de "Implantação": descartado para manter o menu lateral conciso.

---

## DECISÃO 006 — Desmanusização sem Reinvenção de Layout

**Status:** ATIVA  
**Data:** 2026-06-29  
**Responsável:** Claude  
**Módulo afetado:** Todos

**Escolha:** Remover dependências Manus/Forge sem alterar nenhuma linha de CSS, layout, imagem, texto comercial ou componente visual.

**Motivo:**  
O layout original foi aprovado comercialmente pela equipe do Venezia e usado em apresentações reais. Qualquer alteração visual durante a migração criaria risco de regressão visual e exigiria nova aprovação comercial, atrasando o projeto. A desmanusização é uma operação de infraestrutura, não de design.

**Alternativas descartadas:**  
- Refatoração visual durante a migração: descartada pelo auditor externo como fora de escopo.  
- Migração gradual (mantendo Manus parcialmente): descartada por criar estado híbrido impossível de auditar.

**Consequência registrada:**  
75 imagens foram mantidas exatamente como estavam no Manus, apenas migradas para `/client/public/assets/venezia/`. Nenhum componente visual foi recriado ou simplificado.

---

## DECISÃO 007 — MySQL como Banco Definitivo

**Status:** ATIVA  
**Data:** 2026-06-29  
**Responsável:** Claude  
**Módulo afetado:** Banco de dados, Drizzle ORM, server/db.ts

**Escolha:** MySQL (Railway) com Drizzle ORM

**Motivo:**  
O Manus usava MySQL internamente. A migração para MySQL no Railway preserva compatibilidade total com o schema existente (4 migrations prontas), sem necessidade de converter tipos ou reescrever queries. Railway oferece MySQL gerenciado com backup automático e conexão SSL.

**Alternativas descartadas:**  
- PostgreSQL (Neon/Supabase): descartado por exigir migração do driver (`mysql2` → `pg`), conversão de tipos (`mysqlEnum` → `pgEnum`, `timestamp` → diferente) e reescrita das migrations — retrabalho desnecessário.  
- SQLite local: descartado por ser incompatível com produção multi-usuário.  
- PlanetScale: avaliado, mas a arquitetura de branches do PlanetScale adiciona complexidade operacional desnecessária para esta fase.

---

## DECISÃO 008 — Persistência de Unidades, Vendas e Cancelamentos no MySQL Railway

**Status:** ATIVA  
**Data:** 2026-06-30  
**Responsável:** Claude  
**Módulo afetado:** Tabela de Disponibilidade, Reserva, Venda, Cancelamento  
**Substitui:** DECISÃO 001

**Escolha:** MySQL Railway via tRPC (3 tabelas: `unidades_status`, `vendas`, `cancelamentos`)

**Motivo:**  
O auditor identificou durante a Fase 4 de homologação funcional que o sistema será operado por equipe comercial com múltiplos corretores em dispositivos diferentes. `localStorage` é isolado por navegador — um corretor em um dispositivo não enxerga o status marcado por outro. Para operação comercial real, o banco deve ser a fonte de verdade única. A implementação mantém estado local otimista para resposta imediata na UI (sem latência perceptível durante o atendimento), e persiste no banco em background via mutação tRPC.

**Alternativas descartadas:**  
- Manter localStorage + sincronização eventual: descartado — criaria divergência de estado entre dispositivos durante atendimento simultâneo, com risco de dupla venda da mesma unidade.  
- Substituir estado local por polling agressivo: descartado por aumentar latência da UI durante atendimento com cliente presente.

**Padrão implementado:**  
- `unidades.getStatus` — `publicProcedure`, retorna mapa `{ unidadeId: status }` das 12 unidades  
- `unidades.updateStatus` — `protectedProcedure`, exige `ctx.user` autenticado  
- `vendas.registrar` / `cancelamentos.registrar` — `protectedProcedure`, exige autenticação  
- `useUnidadesStatus` — banco Railway é fonte oficial; `DEFAULT_STATUS` (empreendimento.ts) é apenas fallback enquanto o banco carrega  
- `AuthContext` — mantém estado local otimista + chama mutação tRPC em background

**Critérios de aprovação comprovados (2026-06-30):**  
- Status alterado persiste após reload: ✅  
- Status igual em contexto anônimo (outro navegador/aba incógnito): ✅  
- Venda aparece em `SELECT * FROM vendas`: ✅  
- Cancelamento aparece em `SELECT * FROM cancelamentos`: ✅  
- `tsc --noEmit` 0 erros: ✅  
- Mutations protegidas por autenticação: ✅  

---

## HISTÓRICO DE VERSÕES DESTE DOCUMENTO

| Versão | Data | Alteração |
|---|---|---|
| 1.0 | 2026-06-29 | Criação com 7 decisões iniciais |
| 1.1 | 2026-06-30 | DECISÃO 001 revogada; DECISÃO 008 adicionada (persistência MySQL para itens 8/9/10) |
