# Dados do empreendimento e regras de cálculo

Tudo vive em `client/src/data/empreendimento.ts`. O site lê os preços primeiro do banco
(tabela `configuracoes`, chave `unidades`, editada pelo painel admin) e cai neste
arquivo quando o banco não responde — por isso ele precisa estar correto mesmo depois
de o admin existir.

## `EMPREENDIMENTO`

```ts
export const EMPREENDIMENTO = {
  nome, incorporadora, arquitetura, projetos, localizacao,   // textos
  totalUnidades, blocos, pavimentos, vagasTotal,             // números/descrição
  elevador, sacadaChurrasqueira,                             // booleanos
  vgvTotal, vgvComDocumentacao, ticketMedio,                 // derivados — ver abaixo
  valorMin, valorMax, areaPrivativaMin, areaPrivativaMax,
  dormitorios, suites, precoM2Min, precoM2Max,
};
```

`vgvTotal`, `ticketMedio` e as faixas são **redundantes** com `UNIDADES`. Dashboard e
Hero já calculam a partir das unidades; mantenha os campos coerentes (soma das
unidades) para os pontos que ainda os leem (proposta em PDF).

## `UNIDADES` — uma linha por unidade

```ts
{ id: "101", numero: "101", andar: 1, final: "Final 01", area: 60.85,
  valorVenda: 375000, valorComDocumentacao: 390000,
  entrada20: 75000, entradaMenosReforco: 45000, parcela36x: 1216.22,
  reforcoChaves: 30000, financCEF: 300000,
  status: "disponivel", precoM2: 6161, observacao: "PNE" }
```

Fórmulas (planilha oficial do Venezia — confirme com a planilha do novo empreendimento):

| Campo | Fórmula |
|---|---|
| `valorComDocumentacao` | `round(valorVenda × 1,04)` — **derivado**, ver abaixo |
| `entrada20` | `valorVenda × 0,20` |
| `reforcoChaves` | valor fixo do reforço na entrega das chaves (Venezia: 30.000) |
| `entradaMenosReforco` | `entrada20 − reforcoChaves` |
| `parcela36x` | `entradaMenosReforco / 37` (ato + 36 parcelas) |
| `financCEF` | `valorVenda × 0,80` |
| `precoM2` | `round(valorVenda / area)` |

`status` é `"disponivel" | "reservado" | "vendido"` e é sobrescrito em runtime pela
tabela `unidades_status` do banco.

### Valor com documentação é derivado — não guarde à mão

No Venezia esse campo era digitado no admin separado do valor de venda e divergiu
(unidade 101 com venda 419.000 e "c/ Doc" 390.000). A correção: `PERCENTUAL_DOCUMENTACAO
= 0.04`, `calcularValorComDocumentacao(valorVenda)` e `normalizarUnidades(lista)`, aplicada
onde as unidades são carregadas (`TabelaSection`, `DashboardSection`, `AdminCorretores`).
No admin a coluna é calculada e somente leitura. Se o percentual mudar no novo
empreendimento, mude a constante — não os dados. Há testes em
`server/documentacao.test.ts`; atualize-os junto.

## `TIPOLOGIAS`

`id` no formato `final-01` (o `PropostaComercial` casa `unidade.final` com esse id),
`nome`, `area`, `dormitorios`, `suites`, `vagas`, `destaque`, `descricao`, `plantaImg`
(planta humanizada da tipologia — aparece na proposta em PDF).

## `CONDICOES_COMERCIAIS`

Textos exibidos na tabela e na proposta: entrada, parcelamento, reforços, financiamento,
correção (INCC-M), observações. `reforcoTotal` numérico deve bater com `reforcoChaves`.

## `IMAGENS`

Chaves usadas fora da galeria: `heroBanner` (Hero), `fachadaEmpreendimento`
(seção O Empreendimento), `location`, `logoVenezia` / `logoVeneziaOficial` (nav,
rodapé, proposta), `logoArtea`, `logoArteaColor`, `logoBlueRealEstate`,
`logoRbConstrutora` (parceiros, proposta). Renomeie as chaves de logo para os
parceiros do novo empreendimento e ajuste `PartnersSection` e `PropostaComercial`.

## Simulador CEF (`client/src/lib/simuladorCEF.ts`)

`CEF_PARAMS`: `taxaAnual` (7,66), `taxaAnualCotista` (7,16), `prazoMaxMeses` (420),
`taxaAdm` (25), além de faixa de renda e percentual financiável. Sistema SAC/Price
conforme o código. Há 29 testes em `server/simuladorCEF.test.ts` — se mudar parâmetros,
atualize os valores esperados. Confirme as taxas vigentes do programa com o cliente.

## Preços dinâmicos (admin)

- Tabela `configuracoes(chave, valor LONGTEXT)`; chave `unidades` guarda o JSON da lista.
- `configuracoes.getUnidades` (público) e `setUnidades` (admin) em `server/routers.ts`.
- O servidor cria a tabela ao subir (`ensureConfiguracoesTable`).
- Ao publicar uma versão que muda o **formato** das unidades, o admin precisa salvar
  uma vez para o banco ficar no formato novo; até lá vale o fallback estático.
