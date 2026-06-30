# DECISÕES ARQUITETURAIS — RESIDENCIAL VENEZIA

**Início do registro:** 2026-06-29  
**Responsável técnico:** Claude (Anthropic)

Este documento registra decisões de arquitetura tomadas durante o projeto — não o código, mas o raciocínio que levou a cada escolha. Serve para que qualquer pessoa que entre no projeto futuramente entenda o porquê de cada estrutura, sem depender de memória de conversa.

Cada decisão registra: a escolha feita, o motivo, as alternativas descartadas e a data.

---

## DECISÃO 001 — Status das Unidades em localStorage

**Status:** ATIVA  
**Data:** 2026-06-29  
**Responsável:** Claude  
**Módulo afetado:** Tabela de Disponibilidade, Dashboard Executivo

**Escolha:** `localStorage` (client-side, sem persistência em banco)

**Motivo:**  
O sistema é usado por corretores em plantões de vendas presenciais, frequentemente em ambientes com conectividade instável (redes móveis, sinal fraco em stands). A Tabela de Disponibilidade precisa funcionar mesmo sem internet. O localStorage garante operação offline e sincronização automática entre abas via `StorageEvent`.

**Alternativas descartadas:**  
- Persistência imediata em MySQL: descartada porque depende de conexão estável e adiciona latência visível na marcação de unidades durante atendimento ao cliente.  
- Sincronização híbrida (local + banco): descartada por complexidade desnecessária nesta fase — aumentaria o risco de divergência entre estado local e banco.

**Consequência registrada:**  
Se o corretor limpar o localStorage (limpar dados do navegador), o status das unidades volta ao padrão do `empreendimento.ts`. Isso é comportamento conhecido e aceito. A solução definitiva de persistência em banco fica para fase posterior, após validação operacional.

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

## HISTÓRICO DE VERSÕES DESTE DOCUMENTO

| Versão | Data | Alteração |
|---|---|---|
| 1.0 | 2026-06-29 | Criação com 7 decisões iniciais |
