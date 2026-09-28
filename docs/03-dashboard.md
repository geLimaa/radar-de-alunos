# Etapa 4: dashboard (React + Vite)

Uma página só (`/`), em `web/`, que mostra os dados da sua API. Tempo sugerido: cerca de 1h15.

- Tudo aqui é obrigatório. **Dica** é ajuda opcional e não vale ponto.
- Instalar e rodar: [`../web/README.md`](../web/README.md). Contrato das rotas: [`02-api.md`](02-api.md). Respostas reais: [`../exemplos/api/`](../exemplos/README.md).

## O que o starter já traz

- `src/api.ts`: `API_URL` (de `VITE_API_URL`, default `http://localhost:3000/api`); `getJson<T>(path, signal?)`, que lança `Error` legível (API fora do ar ou status fora de 2xx); `getHealth()` de exemplo.
- `src/App.tsx`: título, selo "Dados fictícios" e o status da API (`GET /api/health`), que pode sair. Modelo de carregando / ok / erro com "Tentar de novo": estado com `kind`, flag `ignore` no `useEffect` e `attempt` para refazer.
- `src/main.tsx`: `StrictMode` (em dev, cada busca sai 2 vezes na aba Network; é normal).
- `vite.config.ts`: porta 5173 fixa, a única liberada no CORS da API (abra `localhost`, não `127.0.0.1`).
- Instalados: React 19, TypeScript 6, Vite 8, **Recharts 3** e Oxlint. Não precisa instalar mais nada.

**Você implementa:** as funções e os tipos das 3 rotas em `src/api.ts` e o resto desta página.

## A página

| Busca | Blocos | Rota | Refeita quando |
|---|---|---|---|
| Clusters | 1 Cabeçalho (data), 2 Seletor, 5 Cards dos clusters | `GET /api/clusters` | só ao abrir |
| Resumo | 3 Três cards, 4 Gráfico de engajamento | `GET /api/summary` (+ `?clusterId=`) | o cluster muda |
| Alunos | 6 Tabela | `GET /api/students?page=&pageSize=20` (+ `&clusterId=`) | o cluster ou a página muda |

**"Todos" não envia `clusterId`**, nem vazio (`?clusterId=`): as URLs são `/api/summary` e `/api/students?page=1&pageSize=20`.

Rascunho (layout, cores e direção das barras são livres):

```
1  Radar de Alunos  [Dados fictícios]          Data de referência: 30/09/2026
2  Cluster: [ Todos          v ]
3  [ Total de alunos  1.000 ]  [ Engajados  64,8% ]  [ Acerto médio  56,4% ]
4  Alunos por faixa de engajamento
    648
   #####                        245
   #####          34           #####          73
   #####        #####          #####        #####
  Engajado  Perdendo ritmo  Desengajado  Nunca ativo
5  +- Esfriando -------------------+  +- Recém-chegados --------------+
   | 255 alunos · 25,5% da base    |  | 206 alunos · 20,6% da base    |
   | Última atividade há 69 dias…  |  | Matrícula há 25 dias em…      |
   | Tempo de matrícula: 226 dias  |  | Tempo de matrícula: 24,5 dias |
   | Dias sem atividade: 69 dias   |  | Dias sem atividade: 7,4 dias  |
   | Aulas em 30 dias: 0,2         |  | Aulas em 30 dias: 2,7         |
   +-------------------------------+  +-------------------------------+ ...
6  Nome      Cluster         Série      Plano     Engajamento    Última atividade  Mentorias  Acerto médio
   Aluno 3   Esfriando       2º ano EM  Elite     [Desengajado]  há 49 dias        10         52,4%
   Aluno 8   Recém-chegados  3º ano EM  Standard  [Nunca ativo]  Nunca             0          —
   [ Anterior ]              Página 1 de 50 · 1.000 alunos              [ Próxima ]
```

Números e nomes de cluster de [`summary.json`](../exemplos/api/summary.json) e [`clusters.json`](../exemplos/api/clusters.json) (os seus vão ser outros); nomes de alunos ilustrativos.

**Textos fixos:** título, selo, "Data de referência:", "Todos", "Tentar de novo", "Anterior", "Próxima", "Página X de Y", colunas, "há N dias", "hoje", "Nunca" e rótulos. O resto é livre.

## Regras de cada bloco

**1 Cabeçalho.** A data vem de `referenceDate` (de `/clusters` ou `/summary`), nunca fixa no código. Sem ela (carregando ou erro), mostre "—".

**2 Seletor.** `<select>` com "Todos" e um cluster por opção, na ordem da API: texto = `name`, valor = `clusterId`. Trocar atualiza os 3 cards, o gráfico e a tabela (que volta à página 1), sem refazer a busca dos clusters (destacar o escolhido é opcional). O cluster escolhido fica num estado só (`number | null`, `null` = "Todos"), usado pelo seletor e pelos cards dos clusters.

**3 Três cards.** Total = `totalStudents`. Engajados = `engagement.engaged ÷ totalStudents`. Acerto médio = média simples das 4 taxas `correctRate*` de `averages`. No cluster 0 ([`summary-cluster-0.json`](../exemplos/api/summary-cluster-0.json)): 255, 0,0% e 55,1%.

- Total 0 → Engajados "—", nunca `NaN%`. As 4 taxas `null` → Acerto médio "—".
- São as únicas contas do navegador, além da média do bloco 5. Faixa, contagens e médias vêm da API: não conte alunos no front.

**4 Gráfico de engajamento.** Barras de `engagement` na ordem Engajado → Perdendo ritmo → Desengajado → Nunca ativo, fixa numa lista no código (`['engaged', 'slipping', 'disengaged', 'never']`), não na ordem do JSON. As 4 aparecem no eixo mesmo com 0.

**5 Cards dos clusters.** Um por item de `data` de `/clusters`, na ordem da API: `name`, `description`, `size` ("255 alunos") e `share` ("25,5% da base").

- 3 ou 4 métricas de `featureMeans` que diferenciem os clusters, com rótulo e unidade legível (dias, %, até 1 casa): `tenureDays: 226.04` → "Tempo de matrícula: 226 dias". Vale a média das 4 `correctRate*` ("Acerto médio"). Métrica `null` → "—".
- **Clicar num card seleciona o cluster**, e o seletor passa a mostrá-lo.
- Nome, descrição ou cor de cluster **nunca** fixos no código por `clusterId`.

**6 Tabela de alunos.**

| Coluna | Campo | Na tela |
|---|---|---|
| Nome · Cluster | `name` · `clusterName` | como vêm |
| Série · Plano · Engajamento | `studyYear` · `plan` · `engagementBand` | rótulo (Engajamento num selo) |
| Última atividade | `daysSinceLastActivity` | `21` → "há 21 dias" · `1` → "há 1 dia" · `0` → "hoje" · `null` → "Nunca" |
| Mentorias | `completedMentorships` | `0` → "0" |
| Acerto médio | `avgCorrectRate` | `0.5237` → "52,4%" · `null` → "—" |

Paginação **no servidor**: uma requisição por página, 20 alunos (nunca busque todos para fatiar). "Anterior" desabilitado na página 1, "Próxima" na última. "Página X de Y · N alunos" vem de `meta.page`, `meta.totalPages` e `meta.total`. Com 0 alunos, estado vazio, sem "Página 1 de 0".

## Como buscar os dados

- Uma função por rota em `src/api.ts`, com o `getJson` e os tipos das respostas (campo nulo fica `| null`): `getClusters()`, `getSummary(clusterId)`, `getStudents({ clusterId, page, pageSize })`. A URL sai só de `API_URL`; nada de importar JSON de `data/` ou `exemplos/`.
- Trocando de cluster rápido, uma resposta antiga pode chegar depois da nova; a tela precisa terminar com os dados do cluster do seletor (flag `ignore` do `App.tsx` ou `AbortController`).

## Estados

| Busca | Carregando | Erro | Vazio |
|---|---|---|---|
| Clusters | mensagem nos cards dos clusters; data "—"; seletor só com "Todos" | mensagem + "Tentar de novo" | `data: []` → mensagem. `size` 0 → "0 alunos", "0,0% da base", métricas "—" |
| Resumo | mensagem no lugar dos 3 cards e do gráfico | idem | `totalStudents: 0` → mensagem (ou "0", "—", "—") |
| Alunos | mensagem no lugar da tabela | idem | `data: []` → mensagem |

- "Tentar de novo" refaz só aquela busca (mesmo cluster e página), sem recarregar a página. Erro numa busca não apaga os blocos das outras.
- Nunca: tela branca, "Carregando…" eterno, erro só no console, `NaN`, `undefined` ou `null` na tela.
- Para testar: rede lenta ("3G" na aba Network), API parada e o vazio. Sugestão para o vazio (a avaliação faz o mesmo): numa cópia de `data/processed/`, acrescente à lista `clusters` do `clusters.json` o objeto abaixo, com `clusterId` = maior id + 1 (4 se k = 4); aumente `k` em 1 (`studentCount` não muda) e aponte o `DATA_DIR` da API para a cópia. O card dele mostra "0 alunos"; escolhido, resumo e tabela ficam vazios.

```json
{ "clusterId": 4, "name": "Cluster vazio", "description": "Teste de estado vazio", "size": 0,
  "featureMeans": { "tenureDays": null, "daysSinceLastActivity": null, "lessonsLast30d": null,
    "completedMentorships": null, "missedMentorships": null, "avgMentorshipRating": null,
    "simulationsTaken": null, "correctRateLanguages": null, "correctRateHuman": null,
    "correctRateNature": null, "correctRateMath": null, "essaysSubmitted": null, "avgEssayScore": null } }
```

## Formatos pt-BR

| Da API | Na tela | Como |
|---|---|---|
| `1000` | 1.000 | `new Intl.NumberFormat('pt-BR')` |
| `24.54` | 24,5 | `new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })` |
| `0.625` (taxa) | 62,5% | idem, com `{ style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }`; sem × 100 |
| `"2026-09-30"` | 30/09/2026 | `new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(data))` |
| `null` | — | `valor === null` antes de formatar |

- **Nulo é "—", nunca 0; zero é 0, nunca "—".** `valor || '—'` esconde o 0; `valor ?? 0` e `Number(null)` viram 0; `toFixed` usa ponto.
- Vale também no eixo, no rótulo e no tooltip do gráfico. Formatadores num arquivo só (ex.: `src/format.ts`).

## Rótulos

| Campo | Rótulos |
|---|---|
| `engagementBand` | `engaged` → Engajado · `slipping` → Perdendo ritmo · `disengaged` → Desengajado · `never` → Nunca ativo |
| `studyYear` | `high_school_1` → 1º ano EM · `high_school_2` → 2º ano EM · `high_school_3` → 3º ano EM · `prep` → Cursinho |
| `plan` | `standard` → Standard · `premium` → Premium · `elite` → Elite |

- Nenhum valor cru de enum na tela. Rótulos num arquivo só (ex.: `src/labels.ts`).

## Dicas

> **Dica (data um dia antes):** `new Date('2026-09-30')` é meia-noite em UTC, que no Brasil ainda é dia 29. Sem `timeZone: 'UTC'`, sai 29/09/2026.

> **Dica (Recharts 3):** barra de valor 0 não aparece, e o rótulo "0" some junto: use `minPointSize={2}` no `<Bar>`. O `ResponsiveContainer` precisa de altura em número (`height={260}`).

> **Dica (carregando ao trocar o filtro):** `setX({ kind: 'loading' })` direto no `useEffect` gera o aviso `set-state-in-effect` do Oxlint. Chame-o no handler da troca (como o `retry` do `App.tsx`) ou derive o carregando.

## O que não é avaliado nesta etapa

Além da lista do [README](../README.md): router, `kSelection` na tela, e ordenação, busca ou filtros além do cluster.

## Antes de entregar

- [ ] Tudo vem da API: com outra base (outros parâmetros), a página mostra os dados novos sem mudar código.
- [ ] Em "Todos", nenhuma requisição leva `clusterId` (aba Network).
- [ ] 6 blocos; seletor e cards dos clusters no mesmo estado; paginação no servidor.
- [ ] Carregando, erro ("Tentar de novo") e vazio nas 3 buscas.
- [ ] 1.000, 62,5%, 30/09/2026 e "—", inclusive no gráfico; nenhum enum cru.
- [ ] Código: função tipada por rota, componentes por bloco, um jeito só de tratar carregando e erro, sem `any` espalhado.
- [ ] `npm run build`, `typecheck` e `lint` passam (aviso do lint não reprova). Sem código morto nem `console.log` (tirou o status? apague o `getHealth`).

Próximo passo: preencher o [`ENTREGA.md`](../ENTREGA.md).
