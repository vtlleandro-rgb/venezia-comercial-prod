# CHANGELOG DE HOMOLOGAÇÃO — RESIDENCIAL VENEZIA

**Início do rastreamento:** 2026-06-29  
**Responsável técnico:** Claude (Anthropic)

Toda alteração realizada após 2026-06-29 deve ser registrada aqui antes de ser aplicada.  
Descrições genéricas ("ajustes", "melhorias", "correções diversas") são **proibidas**.

---

## FORMATO OBRIGATÓRIO DE REGISTRO

```
### [DATA] — [ARQUIVO ALTERADO]
- **Módulo impactado:** nome do módulo
- **Status anterior:** status antes da alteração
- **Motivo:** descrição técnica e objetiva da necessidade
- **O que foi alterado:** descrição exata da mudança
- **Evidência:** referência ao arquivo de evidência em EVIDENCIAS_HOMOLOGACAO.md
- **Autorização:** quem autorizou (usuário / auditor)
```

---

## REGISTRO DE ALTERAÇÕES

### 2026-06-29 — client/src/components/Navigation.tsx

- **Módulo impactado:** Galeria (navegação lateral)
- **Status anterior:** HOMOLOGADO VISUALMENTE
- **Motivo:** Auditoria de homologação visual identificou que o item de menu exibia "Apresentação" em vez de "Galeria". O auditor determinou que "Galeria" é mais claro para o usuário final e evita confusão com materiais de apresentação institucional/PDF.
- **O que foi alterado:** Linha 23 — `label: "Apresentação"` → `label: "Galeria"` para o item `{ id: "galeria", ... }`
- **Evidência:** Screenshot 04_galeria.png (pré-correção) + tsc --noEmit PASS (pós-correção)
- **Autorização:** Auditor externo — sessão 2026-06-29

---

### 2026-06-29 — docs/ (criação)

- **Módulo impactado:** Governança do projeto (todos os módulos)
- **Status anterior:** N/A (arquivos novos)
- **Motivo:** Auditor determinou que o protocolo de homologação deve residir no repositório, não apenas na memória da conversa, para garantir rastreabilidade completa e permitir auditoria futura independente.
- **O que foi alterado:** Criação de `docs/PROTOCOLO_HOMOLOGACAO_VENEZIA.md`, `docs/STATUS_PROJETO.md`, `docs/CHANGELOG_HOMOLOGACAO.md`, `docs/EVIDENCIAS_HOMOLOGACAO.md`
- **Evidência:** Arquivos criados com conteúdo verificável
- **Autorização:** Auditor externo — sessão 2026-06-29
