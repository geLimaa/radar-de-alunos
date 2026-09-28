# Etapa 3: API (NestJS)

O dashboard consome só esta API: siga nomes e formatos à risca.

- Tempo sugerido: cerca de 1 hora.
- Instalar, rodar e testar: [`../api/README.md`](../api/README.md).
- Respostas reais da nossa solução (para conferir formato, não valores): [`../exemplos/api/`](../exemplos/README.md).
- Dúvidas: seção 9 do [README](../README.md).

## 1. Ponto de partida

**O starter já traz:**

- prefixo `/api`, CORS para `CORS_ORIGIN` e `ConfigModule` global, que valida as variáveis na subida;
- `ValidationPipe` global com `whitelist`, `forbidNonWhitelisted` (parâmetro que o DTO não declara → 400) e `transform` (defaults do DTO, como `page = 1`, chegam preenchidos);
- `GET /api/health` → `{ "status": "ok" }`, com teste unitário e e2e;
- **carga dos dados** em `src/data/`: o `DataService` lê `DATA_DIR/students.json` e `DATA_DIR/clusters.json` uma vez, na subida, e expõe `students`, `clustersFile` e `findCluster(id)`. Arquivo faltando ou inválido: a API não sobe e diz o caminho e o motivo;
- os tipos `Student`, `Cluster` e `ClustersFile` em `src/data/data.types.ts`, iguais ao contrato do [`01-dados-e-clusters.md`](01-dados-e-clusters.md);
- uma **fixture** em `api/test/fixtures/processed/`: 8 alunos de exemplo em 2 clusters. Os e2e usam essa pasta por padrão.

Use `src/data/` como está: importe o `DataModule` no seu módulo (exemplo no [README da API](../api/README.md)). Nada de reler os arquivos por requisição, ler o CSV, reajustar o modelo ou usar banco.

**Você implementa:**

1. a função da faixa de engajamento, com teste unitário (seção 3);
2. `GET /api/clusters` (sem parâmetros; não precisa de DTO), `GET /api/students` e `GET /api/summary` (com DTO, classe que valida a query), contas e erros (seções 4 a 6);
3. os 3 testes e2e (seção 7).

## 2. Variáveis de ambiente

| Variável | Default | Para que serve |
|---|---|---|
| `PORT` | `3000` | porta HTTP |
| `DATA_DIR` | `../data/processed` | pasta com `students.json` e `clusters.json`. Caminho relativo vale a partir de `api/` |
| `CORS_ORIGIN` | `http://localhost:5173` | origem do dashboard liberada no CORS |

- Até gerar os dados, `npm run start:dev` falha com "Arquivo não encontrado" (esperado). Para subir antes: `DATA_DIR=test/fixtures/processed npm run start:dev`.
- Variável no terminal vence o `.env`. Não fixe o caminho no código: na avaliação podemos subir sua API com outra pasta.
- Os dados são lidos só na subida. Gerou de novo? Reinicie a API.

## 3. Regras de negócio

### 3.1 Faixa de engajamento (`engagementBand`)

| `daysSinceLastActivity` | `engagementBand` | Fronteiras do teste |
|---|---|---|
| `null` (nunca teve atividade) | `never` | `null` |
| 0 a 14 | `engaged` | `14` |
| 15 a 30 | `slipping` | `15` e `30` |
| 31 ou mais | `disengaged` | `31` |

- **Função pura** (`number | null` → faixa), num lugar só, usada por `/students` e `/summary`, com teste unitário.

> **Dica:** trate o `null` primeiro, com `=== null`. Em JavaScript, `null <= 14` é `true`, e `if (!dias)` confunde 0 dias (`engaged`) com nulo.

### 3.2 Acerto médio (`avgCorrectRate`)

- Média simples das 4 `correctRate*`, com 4 casas.
- `null` quando o aluno não fez simulado (as 4 taxas são `null` juntas, regra R7). Nunca 0.
- Exemplo real, aluno 1 de [`students.sample.json`](../exemplos/students.sample.json): (0,5748 + 0,6162 + 0,5141 + 0,4833) ÷ 4 = **0,5471**.

## 4. Convenções

- Chaves em camelCase, **exatamente** as deste documento: nem a mais, nem a menos; a ordem é livre.
- `null` explícito: a chave sempre aparece, e campo sem valor é `null`, nunca `0`, `""` ou ausente. Contagem zero (aulas, simulados) é `0` mesmo.
- Datas `YYYY-MM-DD`. Enums sem tradução (`high_school_3`, `premium`).
- Nome de cluster, `k`, data de referência e totais vêm dos arquivos, nunca fixos no código.

| Valor | Casas |
|---|---|
| taxas calculadas: `share`, `avgCorrectRate`, as 4 `correctRate*` do `/summary` | 4 |
| outras médias do `/summary`: `avgEssayScore`, `completedMentorships`, `lessonsLast30d` | 2 |
| o que vem dos arquivos (campos do aluno, `featureMeans`, `kSelection`) | como está |

- Arredonde com `Math.round(x * 10 ** casas) / 10 ** casas`. Diferença de 1 na última casa é tolerada.
- Não use `toFixed`: ele devolve texto. `0.25` e `0.2500` são o mesmo número.
- `totalPages = Math.ceil(total / pageSize)`, que dá 0 quando não há resultado.

**Erros** no formato padrão do Nest (`statusCode`, `message`, `error`):

- **400** em `/students` e `/summary`, para parâmetro de query desconhecido ou inválido: `message` é uma lista de textos do `ValidationPipe`. O texto padrão do Nest (inglês) serve; o texto exato não é avaliado.
- **404**, cluster que não existe no `/summary`: `message` é texto, exatamente `"Cluster não encontrado"`.

Reais ([`error-400.json`](../exemplos/api/error-400.json) e [`error-404.json`](../exemplos/api/error-404.json)):

```json
{ "message": ["pageSize must not be greater than 100"], "error": "Bad Request", "statusCode": 400 }
{ "message": "Cluster não encontrado", "error": "Not Found", "statusCode": 404 }
```

- O 400 sai de um DTO com class-validator no `@Query()`; o 404, de `throw new NotFoundException(...)`. Entrada inválida nunca vira 500 nem é aceita em silêncio.
- Controller fino: filtro, paginação e contas ficam nos services. Nada de `parseInt` manual.

## 5. Rotas

Use aspas quando a URL tem `&`; no PowerShell, `curl.exe`.

### 5.1 `GET /api/clusters`

```bash
curl -s http://localhost:3000/api/clusters
```

- 5 chaves: `referenceDate`, `k`, `studentCount` e `kSelection`, como estão no `clusters.json`, e `data`.
- `data` é a lista `clusters` do arquivo, ordenada por `clusterId`. Cada item tem `clusterId`, `name`, `description`, `size` e `featureMeans` (as 13 chaves) sem mudar, mais **`share`** = `size ÷ studentCount`, com 4 casas.
- `seed` e `features` não entram.

Trecho real de [`clusters.json`](../exemplos/api/clusters.json) (`…` = cortado):

```text
{ "referenceDate": "2026-09-30", "k": 4, "studentCount": 1000,
  "kSelection": [ { "k": 2, "inertia": 4734.84, "silhouette": 0.3422 }, … até k = 8 ],
  "data": [
    { "clusterId": 0, "name": "Esfriando", "description": "…", "size": 255, "share": 0.255,
      "featureMeans": { "tenureDays": 226.04, "daysSinceLastActivity": 69.02, … 13 chaves } },
    … ] }
```

### 5.2 `GET /api/students`

| Parâmetro | Regra | Default |
|---|---|---|
| `clusterId` | opcional, int ≥ 0. Sem ele: todos os clusters | — |
| `page` | int ≥ 1 | `1` |
| `pageSize` | int de 1 a 100 | `20` |

1. Filtre por `clusterId`, se veio, e ordene por `id` crescente.
2. Corte a página: a partir de `(page − 1) × pageSize`, pegue `pageSize` alunos.
3. `meta`: `page` e `pageSize` usados (com os defaults), `total` = alunos que passaram no filtro, e `totalPages`.

Cada item tem **10 chaves**: `id`, `name`, `studyYear`, `plan`, `clusterId`, `daysSinceLastActivity` e `completedMentorships` do `students.json`, sem mudar; `clusterName` (do `clusters.json`); `engagementBand` (3.1); `avgCorrectRate` (3.2).

```bash
curl -s "http://localhost:3000/api/students?clusterId=0&page=1&pageSize=3"
```

Trecho real de [`students-page.json`](../exemplos/api/students-page.json) (1º dos 3 alunos):

```json
{
  "data": [
    { "id": 3, "name": "Pietro Carvalho", "studyYear": "high_school_2", "plan": "elite",
      "clusterId": 0, "clusterName": "Esfriando", "engagementBand": "disengaged",
      "daysSinceLastActivity": 49, "completedMentorships": 10, "avgCorrectRate": 0.5237 }
  ],
  "meta": { "page": 1, "pageSize": 3, "total": 255, "totalPages": 85 }
}
```

Os ids pulam (3, 7, 9) pelo filtro; 255 alunos ÷ 3 por página = 85 páginas.

### 5.3 `GET /api/summary`

- `clusterId` opcional (int ≥ 0). Sem ele: a base toda. Com ele: só os alunos daquele cluster.
- Cluster que não existe → **404** `"Cluster não encontrado"`. Outro parâmetro ou valor inválido → 400.

Resposta com 5 chaves: `referenceDate` (do `clusters.json`); `clusterId` (o pedido, ou `null`); `totalStudents`; `engagement`, sempre com as 4 faixas (0 quando vazia) somando `totalStudents`; e `averages`, com 7 médias: as 4 `correctRate*` (4 casas) e `avgEssayScore`, `completedMentorships` e `lessonsLast30d` (2 casas).

- **Média por aluno, ignorando nulos:** `avgEssayScore` 600, `null` e 700 → 650, não 433,33.
- Sem filtro, calcule sobre todos os alunos, não com a média das médias dos clusters.
- Sem nenhum valor, a média é `null`. Cluster que existe mas não tem alunos: `totalStudents: 0`, faixas em 0 e as 7 médias `null`. Para testar: o cluster vazio da seção [Estados](03-dashboard.md#estados) do dashboard.

```bash
curl -s http://localhost:3000/api/summary
```

Real, de [`summary.json`](../exemplos/api/summary.json):

```json
{ "referenceDate": "2026-09-30", "clusterId": null, "totalStudents": 1000,
  "engagement": { "engaged": 648, "slipping": 34, "disengaged": 245, "never": 73 },
  "averages": { "correctRateLanguages": 0.6192, "correctRateHuman": 0.5974,
    "correctRateNature": 0.5312, "correctRateMath": 0.5099,
    "avgEssayScore": 641.52, "completedMentorships": 5.83, "lessonsLast30d": 10.69 } }
```

**Confira:** as médias de [`summary-cluster-0.json`](../exemplos/api/summary-cluster-0.json) são as do `featureMeans` do cluster 0 (0,6074, 0,5848…). Na sua também.

## 6. Casos de borda

| Requisição | Status | Resposta |
|---|---|---|
| `/api/students?clusterId=99` (não existe) | **200** | `data: []`, `total: 0`, `totalPages: 0` |
| `/api/students?page=9999` (além da última) | **200** | `data: []`, `meta` com `total` e `totalPages` de verdade |
| `/api/students?pageSize=500`, `?pageSize=0`, `?page=0`, `?page=abc` | 400 | lista de mensagens |
| `/api/students?clusterId=-1`, `=abc` ou `=1.5` | 400 | lista de mensagens |
| `/api/students?foo=1` | 400 | `["property foo should not exist"]` |
| `/api/summary?clusterId=99` (não existe) | **404** | `"Cluster não encontrado"` |
| `/api/summary?clusterId=abc` ou `?foo=1` | 400 | lista de mensagens |

- **Cluster que não existe: 200 com lista vazia no `/students`, 404 no `/summary`.**
- `?clusterId=` vazio não é requisito: 200 ou 400 servem, e 400 é melhor (com `@Type`, o vazio vira 0 e filtra o cluster 0). Para "todos", quem chama não manda o parâmetro.

## 7. Testes mínimos

| Tipo | O que verifica |
|---|---|
| unitário (`*.spec.ts` ao lado da função) | faixa de engajamento em `null`, 14, 15, 30 e 31 |
| e2e (`*.e2e-spec.ts` em `test/`) | `/api/students?clusterId=<existente>`: lista não vazia e **todos** os itens com esse `clusterId` |
| e2e | `/api/students?pageSize=500` → 400 |
| e2e | `/api/summary?clusterId=<inexistente>` → 404 |

- Copie a estrutura de `test/health.e2e-spec.ts`. Sem `configureApp(app)`, não há prefixo `/api` nem `ValidationPipe`.
- Os e2e rodam na fixture (`test/setup-e2e.ts`). Opcional: rode também nos seus dados, `DATA_DIR=../data/processed npm run test:e2e`.
- Não fixe números no teste. Pegue os ids de `GET /api/clusters`: um que existe e, para o 404, o maior `clusterId` + 1.
- Os testes do starter continuam passando.

## 8. Dicas

> **Números na query:** tudo chega como texto, e `@IsInt()` recusa `"2"`. Converta com `@Type(() => Number)` (class-transformer):
> ```ts
> @IsOptional() @Type(() => Number) @IsInt() @Min(1)
> page: number = 1;
> ```

> **Erro TS1272 no build** ("A type referenced in a decorated signature must be imported with 'import type'"): um método com decorator (ex.: `@Get()`) usa `interface` ou `type` importado de outro arquivo. Use `import type { Student } from '../data/data.types';`. Classes, como os DTOs, seguem com `import` normal.

## Antes de seguir para o dashboard

- [ ] Sobe com a fixture e com os seus dados.
- [ ] `/api/students` sem parâmetros: 20 primeiros por `id`. Com `clusterId`: `total` = `size` do cluster.
- [ ] Nunca ativo → `never`; sem simulado → `avgCorrectRate: null`. Nenhum `null` virou 0.
- [ ] `/api/summary`: faixas somam `totalStudents`; médias do cluster batem com o `featureMeans`.
- [ ] Toda linha da seção 6 dá o status indicado. Nada fixo no código nem nos testes (nome de cluster, `k`, data, total).
- [ ] `npm test`, `npm run test:e2e`, `npm run build` e `npm run lint` passam.

Próximo passo: [`03-dashboard.md`](03-dashboard.md).
