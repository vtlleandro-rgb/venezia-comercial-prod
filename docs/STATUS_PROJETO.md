# STATUS DO PROJETO — RESIDENCIAL VENEZIA

**Última atualização:** 2026-06-29 15:01 BRT  
**Responsável técnico:** Claude (Anthropic)  
**Base de referência:** BASE_OFICIAL_VENEZIA_20260629  
**Snapshot MD5:** `7d77ce54f5d10a17c260b4288f1670f0`

---

## MÓDULOS DO SISTEMA

| Módulo | Status | Última Evidência | Responsável | Próxima Etapa |
|---|---|---|---|---|
| Hero / Home | 🔒 CONGELADO | E01 — 01_home_topo.png (2026-06-29) | Claude | Nenhuma — aguarda banco para teste de persistência |
| O Empreendimento | 🔒 CONGELADO | E02 — 02_empreendimento.png (2026-06-29) | Claude | Nenhuma |
| Diferenciais | 🔒 CONGELADO | E03 — 03_diferenciais.png (2026-06-29) | Claude | Nenhuma |
| Galeria | 🔒 CONGELADO | E04 — 04_galeria.png (2026-06-29) | Claude | Nenhuma — nav corrigida para "Galeria" |
| Implantação + Plantas | 🔒 CONGELADO | E05 — 05_plantas.png (2026-06-29) | Claude | Nenhuma |
| Tabela de Disponibilidade | 🔒 CONGELADO | E06 — 06_tabela.png (2026-06-29) | Claude | Aguarda banco para validar persistência real |
| Simulador CEF | 🔒 CONGELADO | E07 — 07_simulador.png (2026-06-29) | Claude | Nenhuma — cálculo local validado |
| Dashboard Executivo | 🔒 CONGELADO | E08 — 08_dashboard.png (2026-06-29) | Claude | Aguarda banco para validar persistência real |
| Localização | 🔒 CONGELADO | E09 — 09_localizacao.png (2026-06-29) | Claude | Nenhuma |
| Realização e Parceiros | ⚠️ PARCIAL | E10 — captura incompleta (2026-06-29) | Claude | Nova captura isolada |
| **Banco — Railway MySQL** | 🔄 EM HOMOLOGAÇÃO | — | Claude | Aguardando DATABASE_URL → 9 etapas oficiais |
| Painel do Corretor (/corretor) | 🔒 BLOQUEADO | — | Claude | Depende de banco + OAuth homologados |
| Admin Corretores (/admin) | 🔒 BLOQUEADO | — | Claude | Depende de banco + OAuth homologados |
| Proposta / PDF (/proposta/:codigo) | 🔒 BLOQUEADO | — | Claude | Depende de banco homologado |
| Deploy / Publicação Final | ⬜ NÃO INICIADO | — | Claude | Depende de todos os módulos anteriores |

---

## LEGENDA

| Símbolo | Status | Significado |
|---|---|---|
| 🔒 | CONGELADO | Homologado visualmente. Proibido alterar sem CHANGELOG + justificativa + nova evidência. |
| ✅ | HOMOLOGADO | Visual + banco + persistência + fluxos completos. |
| 🔄 | EM HOMOLOGAÇÃO | Validação em andamento pelas 9 etapas oficiais. |
| 🔒 | BLOQUEADO | Depende de módulo não homologado. Não iniciar. |
| ⬜ | NÃO INICIADO | Fora do ciclo de homologação. |
| ⚠️ | PARCIAL | Homologação iniciada mas incompleta. Causa identificada. |

> **Nota:** O símbolo 🔒 aparece tanto em CONGELADO quanto em BLOQUEADO. Distingui-los pelo texto. CONGELADO = já validado, não tocar. BLOQUEADO = ainda não validado, não iniciar.

---

## POLÍTICA DE CONGELAMENTO

Todo módulo que alcança **HOMOLOGADO VISUALMENTE** é automaticamente promovido a **CONGELADO**.

Um módulo CONGELADO **só pode ser alterado** se o `CHANGELOG_HOMOLOGACAO.md` contiver:

```
Justificativa técnica obrigatória:
- Tipo de alteração: [ ] Correção de bug  [ ] Infraestrutura  [ ] Outro
- Altera layout?         NÃO
- Altera comportamento?  NÃO
- Altera navegação?      NÃO
- Altera assets?         NÃO
- Evidência antes:       [arquivo]
- Evidência depois:      [arquivo]
- Autorização:           [quem autorizou]
```

Qualquer alteração que responda SIM a qualquer item acima invalida o congelamento e exige nova rodada de homologação visual completa.

---

## REGRA DE PROMOÇÃO DE STATUS

```
NÃO INICIADO → EM HOMOLOGAÇÃO → CONGELADO → HOMOLOGADO
                                    ↑
                    (após banco + persistência + fluxos)
```

BLOQUEADO → só avança quando a dependência for homologada.  
PARCIAL → volta para EM HOMOLOGAÇÃO após nova evidência.

---

## HISTÓRICO DE ATUALIZAÇÕES DESTE ARQUIVO

| Data | Alteração |
|---|---|
| 2026-06-29 15:01 | Criação inicial com registro pós-homologação visual |
| 2026-06-29 15:01 | Adição de colunas "Responsável" e "Próxima Etapa" |
| 2026-06-29 15:01 | Implementação da política de CONGELAMENTO automático |
| 2026-06-29 15:01 | Módulos homologados visualmente promovidos para CONGELADO |
