# STATUS DO PROJETO — RESIDENCIAL VENEZIA

**Última atualização:** 2026-06-30 (auth própria) BRT  
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
| Tabela de Disponibilidade | ✅ HOMOLOGADO | E06 + MySQL persistência (2026-06-30) | Claude | — |
| Simulador CEF | 🔒 CONGELADO | E07 — 07_simulador.png (2026-06-29) | Claude | Nenhuma — cálculo local validado |
| Dashboard Executivo | ✅ HOMOLOGADO | E08 (2026-06-30) | Claude | — |
| Localização | 🔒 CONGELADO | E09 — 09_localizacao.png (2026-06-29) | Claude | Nenhuma |
| Realização e Parceiros | ⚠️ PARCIAL | E10 — captura incompleta (2026-06-29) | Claude | Nova captura isolada |
| **Banco — Railway MySQL** | ✅ HOMOLOGADO | Fase 3 completa (2026-06-30) | Claude | — |
| Painel do Corretor (/corretor) | ✅ HOMOLOGADO | Fase 4 — F4_10 (2026-06-30) | Claude | — |
| Admin Corretores (/admin) | ✅ HOMOLOGADO | Fase 4 — F4_03 (2026-06-30) | Claude | — |
| Proposta / PDF (/proposta/:codigo) | ✅ HOMOLOGADO | Fase 4 — PDF com logo (2026-06-30) | Claude | — |
| Deploy / Publicação Final | 🔄 EM HOMOLOGAÇÃO | — | Claude | Fase 5: deploy + smoke test + Termo Final |

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
| 2026-06-30 | Fase 3 (banco) e Fase 4 (funcional) aprovadas; itens 8/9/10 persistem no MySQL |
| 2026-06-29 15:01 | Módulos homologados visualmente promovidos para CONGELADO |
