# PROTOCOLO OFICIAL DE HOMOLOGAÇÃO — RESIDENCIAL VENEZIA

**Versão:** 1.0  
**Data de criação:** 2026-06-29  
**Responsável técnico:** Claude (Anthropic)  
**Status:** VIGENTE — não pode ser alterado sem justificativa técnica registrada no CHANGELOG_HOMOLOGACAO.md

---

## 1. OBJETIVO

Garantir rastreabilidade completa de todas as etapas de homologação do sistema Residencial Venezia — Central Comercial, permitindo que qualquer auditor identifique o que foi validado, quando, por quem e com qual evidência.

---

## 2. BASE OFICIAL

- **Projeto:** Residencial Venezia — Central Comercial
- **Base de referência:** BASE_OFICIAL_VENEZIA_20260626
- **Localização:** `/Users/leandrodossantos/Claude/Projects/venezia-comercial/`
- **Stack:** React 19 + TypeScript 5.9 + Vite 7 + Express 4 + tRPC v11 + Drizzle ORM + MySQL

---

## 3. CRITÉRIOS DE STATUS

| Status | Significado |
|---|---|
| 👁️ HOMOLOGADO VISUALMENTE | Validado por screenshot em ambiente local. Não comprova persistência de banco. |
| ✅ HOMOLOGADO | Validado visualmente + banco + persistência real + fluxos completos comprovados. |
| 🔄 EM HOMOLOGAÇÃO | Etapas de validação em andamento. |
| 🔒 BLOQUEADO | Depende de outro módulo não homologado. Não pode ser iniciado. |
| ⬜ NÃO INICIADO | Ainda não entrou no ciclo de homologação. |

---

## 4. REGRA DE CONGELAMENTO

**Nenhum módulo com status HOMOLOGADO VISUALMENTE ou HOMOLOGADO poderá ser alterado sem:**

1. Registrar a alteração em `CHANGELOG_HOMOLOGACAO.md` com data, arquivo, motivo e módulo impactado.
2. Apresentar justificativa técnica objetiva.
3. Atualizar `STATUS_PROJETO.md` com o novo status.
4. Anexar nova evidência em `EVIDENCIAS_HOMOLOGACAO.md`.

**Violação desta regra invalida a homologação do módulo afetado.**

---

## 5. EVIDÊNCIAS ACEITAS

- Screenshot do estado da tela (formato PNG)
- Log completo de execução de comando
- Resposta SQL com resultado (rows retornados)
- Resposta HTTP com status code e body
- Saída de `tsc --noEmit` sem erros
- Saída de `vite build` sem erros
- Saída de `drizzle-kit push` com tabelas confirmadas

---

## 6. CRITÉRIOS DE APROVAÇÃO POR ETAPA

Para que uma etapa seja marcada como ✓ PASSOU:
- O resultado deve ser observável e registrado
- Deve haver evidência anexada em `EVIDENCIAS_HOMOLOGACAO.md`
- Não pode conter erros não tratados

Para que uma etapa seja marcada como ⚠ PARCIAL:
- O resultado é observável mas incompleto
- A causa da incompletude deve ser identificada e registrada

Para que uma etapa seja marcada como ✗ FALHOU:
- O resultado não é o esperado
- O erro deve ser transcrito integralmente
- Nenhuma correção pode ser aplicada sem registro no CHANGELOG

---

## 7. AS 9 ETAPAS OFICIAIS DE HOMOLOGAÇÃO DE BANCO

### ETAPA 0 — Identificação do Ambiente
Registrar antes de qualquer comando:
- Ambiente (Local / Railway / Produção)
- Branch utilizada
- Commit SHA
- Base utilizada (BASE_OFICIAL_VENEZIA_20260626)
- Banco de destino
- Data e hora da execução

### ETAPA 1 — Validar DATABASE_URL
- Validar formato: `mysql://user:pass@host:port/database`
- Verificar host, porta, banco, usuário
- **Não exibir senha em nenhum log ou documento**

### ETAPA 1.5 — Teste de Conexão (sem migrations)
Antes de qualquer `drizzle-kit push`, verificar:
- ✓ Conexão TCP ao host:porta bem-sucedida
- ✓ Banco de dados encontrado e acessível
- ✓ Permissões do usuário (SELECT, INSERT, UPDATE, DELETE, CREATE)
- ✓ Versão do MySQL (deve ser 8.x)
- ✓ Charset do servidor (`character_set_server = utf8mb4`)
- ✓ Collation (`collation_server = utf8mb4_unicode_ci` ou equivalente)

**Se qualquer item falhar: não executar Etapa 3. Reportar falha e aguardar correção.**

Comandos de verificação:
```sql
SELECT VERSION();
SHOW VARIABLES LIKE 'character_set%';
SHOW VARIABLES LIKE 'collation%';
SELECT user(), current_user();
SHOW GRANTS FOR CURRENT_USER();
```

### ETAPA 2 — Criar .env
Confirmar presença e carregamento de:
- `DATABASE_URL`
- `JWT_SECRET`
- `CHROMIUM_PATH`
- `NODE_ENV`

### ETAPA 3 — Executar Migrations
```bash
pnpm drizzle-kit push
```
Entregar:
- Log completo de execução
- Quantidade de migrations aplicadas
- Tempo de execução
- Erros, se houver

### ETAPA 4 — Confirmar Estrutura do Banco
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = DATABASE();
```
Entregar:
- Lista completa das tabelas criadas
- Quantidade de tabelas encontradas

### ETAPA 5 — Seed de Homologação
Criar dados mínimos:
- 1 imobiliária
- 1 corretor
- 1 lead
- 1 proposta
- 1 acesso

Registrar os IDs gerados para cada registro.

### ETAPA 6 — Homologação CRUD
Para cada tabela relevante, executar e registrar:
- `INSERT` com dados reais
- `SELECT` com resultado
- `UPDATE` com confirmação
- `DELETE` quando aplicável

### ETAPA 7 — Teste da Aplicação (CRÍTICO)
**Sem alterar nenhum código.**

Subir stack completo (Vite + Express + MySQL) e comprovar que:
- Corretor aparece na interface
- Lead aparece na interface
- Proposta aparece na interface
- Acesso aparece na interface

**Não basta existir no banco. O frontend deve consumir os dados via tRPC.**

### ETAPA 8 — Teste de Persistência (CRÍTICO)
Criar registros pela interface (não por script):
1. Criar um lead pelo formulário público
2. Atualizar a página
3. Comprovar que o registro permanece

Repetir para: proposta, corretor, acesso.

### ETAPA 9 — Relatório Final
Cada item classificado como:
- ✓ PASSOU — com evidência
- ⚠ PARCIAL — com causa identificada
- ✗ FALHOU — com erro transcrito

**Expressões proibidas:** "deve funcionar", "provavelmente", "está pronto", "aparenta estar correto".

---

## 8. HISTÓRICO DE VERSÕES

| Versão | Data | Alteração |
|---|---|---|
| 1.0 | 2026-06-29 | Criação do protocolo oficial |
