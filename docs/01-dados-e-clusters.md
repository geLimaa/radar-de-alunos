# Etapas 1 e 2: dados e clusters (Python)

Contrato do `generate.py` (base sintética) e do `cluster.py` (clusters): um nome de campo trocado quebra a API. Tudo aqui é obrigatório, menos o que vem como **Dica** (ajuda opcional, não vale ponto).

- Instalar e rodar: [`../python/README.md`](../python/README.md).
- Saídas reais da nossa solução: [`../exemplos/`](../exemplos/README.md). Servem para conferir formato, não valores.

## Fluxo

```
generate.py ─► data/raw/        students.csv, metadata.json, profiles_truth.csv
cluster.py  ─► data/processed/  students.json, clusters.json  ─► API
```

---

## Etapa 1: gerar os dados (`generate.py`)

### 1.1 Como rodar

```bash
python generate.py --n 1000 --seed 42 --reference-date 2026-09-30 --out ../data/raw
```

- Esses são os padrões (veja `python generate.py --help`).
- `--n`: precisa funcionar de 100 a 20.000 alunos; com 1.000, em menos de 30 s.
- `--reference-date`: a data de referência **R**, o "hoje" da base. Datas e dias partem de R, nunca do relógio.
- `--out`: se a pasta não existir, o script cria (o `cluster.py` também).

### 1.2 Arquivos gerados em `--out`

| Arquivo | Conteúdo |
|---|---|
| `students.csv` | 1 linha por aluno (seção 1.3) |
| `metadata.json` | `{ "seed": 42, "students": 1000, "referenceDate": "2026-09-30" }`: só essas 3 chaves (valores de `--seed`, `--n` e `--reference-date`), sem hora de geração |
| `profiles_truth.csv` | colunas `id,profile`: o perfil latente de cada aluno (seção 1.5), como `1,perfil_a`. Nomes de perfil livres |

### 1.3 Dicionário do `students.csv`

**`tenureDays`** = dias de calendário entre `enrolledAt` e R (int, ≥ 0), o "tempo de casa". **Não** vai no CSV: o gerador usa para as regras da seção 1.4, e o `cluster.py` calcula de novo.

As 21 colunas, **nesta ordem**. Só as marcadas com **nulo** podem ficar vazias.

| # | Campo | Tipo | Valores e significado |
|---|---|---|---|
| 1 | id | int | 1..N, sequencial |
| 2 | name | string | nome fictício: Faker `pt_BR` com seed, ou `Aluno 0001` |
| 3 | state | string | sigla de UF, maiúscula |
| 4 | studyYear | enum | `high_school_1`, `high_school_2`, `high_school_3` (1º a 3º ano do EM), `prep` (cursinho / EM concluído) |
| 5 | desiredCourse | enum | `medicine`, `law`, `engineering`, `dentistry`, `psychology`, `nursing`, `other` |
| 6 | schoolType | enum | `public`, `private` (escola do EM) |
| 7 | plan | enum | `standard`, `premium`, `elite` (plano fictício) |
| 8 | mentorshipFrequency | enum | `monthly`, `biweekly` (cadência das mentorias) |
| 9 | enrolledAt | date `YYYY-MM-DD` | matrícula, em [R − 365 dias, R] |
| 10 | daysSinceLastActivity | int, **nulo** | 0..tenureDays: dias desde a última aula, simulado ou redação (mentoria não conta). **Nulo = nunca teve atividade** |
| 11 | lessonsLast30d | int | ≥ 0 (tipicamente 0–40): aulas nos últimos 30 dias |
| 12 | completedMentorships | int | ≥ 0: mentorias realizadas |
| 13 | missedMentorships | int | ≥ 0: mentorias em que faltou |
| 14 | avgMentorshipRating | float 2 casas, **nulo** | 1.00–5.00: nota média que o aluno deu às mentorias |
| 15 | simulationsTaken | int | ≥ 0: simulados objetivos lançados |
| 16 | correctRateLanguages | float 4 casas, **nulo** | 0–1: acerto médio em Linguagens |
| 17 | correctRateHuman | float 4 casas, **nulo** | 0–1: acerto médio em Ciências Humanas |
| 18 | correctRateNature | float 4 casas, **nulo** | 0–1: acerto médio em Ciências da Natureza |
| 19 | correctRateMath | float 4 casas, **nulo** | 0–1: acerto médio em Matemática |
| 20 | essaysSubmitted | int | ≥ 0: redações enviadas |
| 21 | avgEssayScore | float 1 casa, **nulo** | 0–1000: nota média das redações |

**Formato do CSV:**

- UTF-8, separador `,`, cabeçalho na 1ª linha com os nomes exatos da tabela.
- Nulo = célula vazia. Nunca `NaN`, `null` nem `None`.
- Int sem casa decimal: `45.0` é inválido.
- Float com ponto, **arredondado para as casas da tabela**. Zero à direita é opcional (`4.4` = `4.40`). Aceitamos diferença de 1 na última casa: o `round` do Python serve.

> **Dica (pandas 3):** coluna int com nulo vira float e sai como `45.0`; use o dtype `Int64` (I maiúsculo). Escreva com `to_csv(..., index=False)` e sem `na_rep`. Para mudar parte de uma coluna, use `df.loc[mask, 'col'] = x`: `df['col'][mask] = x` não muda nada.

### 1.4 Regras de consistência

Valem em todas as linhas. O seu teste checa pelo menos R2, R3, R5 e R6 (seção 2.7). ⇒ é "se A, então B"; ⇔ é "A e B andam juntos". Nos exemplos, R = 2026-09-30.

| Id | Regra | Exemplo de violação |
|---|---|---|
| R1 | `enrolledAt` ∈ [R − 365, R] | `enrolledAt` = `2025-09-29` (366 dias antes de R) |
| R2 | `daysSinceLastActivity` é nulo ou está em 0..tenureDays | matrícula em `2026-09-10` (`tenureDays` = 20) e `daysSinceLastActivity` = 35 |
| R3 | `daysSinceLastActivity` nulo ⇒ `lessonsLast30d`, `simulationsTaken` e `essaysSubmitted` = 0 | `daysSinceLastActivity` vazio e `simulationsTaken` = 2 |
| R4 | `daysSinceLastActivity` nulo ou ≥ 30 ⇒ `lessonsLast30d` = 0 | `daysSinceLastActivity` = 45 e `lessonsLast30d` = 3 |
| R5 | `completedMentorships` + `missedMentorships` ≤ floor(tenureDays / cadência) + 1; cadência 30 (`monthly`) ou 15 (`biweekly`) | `monthly`, `tenureDays` = 45: limite floor(45 / 30) + 1 = 2, mas tem 2 realizadas + 1 falta |
| R6 | `avgMentorshipRating` nulo ⇔ `completedMentorships` = 0 | `completedMentorships` = 0 e nota `4.50` |
| R7 | os 4 `correctRate*` são nulos juntos ⇔ `simulationsTaken` = 0 | `simulationsTaken` = 4 e só `correctRateNature` vazia |
| R8 | `avgEssayScore` nulo ⇔ `essaysSubmitted` = 0 | `essaysSubmitted` = 2 e `avgEssayScore` vazio |

> **Dica:** sorteie nesta ordem: `enrolledAt`; se é nunca ativo e, se não for, `daysSinceLastActivity`; as contagens (R3, R4, R5); as médias, só com contagem maior que 0 (R6, R7, R8).

### 1.5 Perfis latentes

O KMeans sempre devolve k grupos, mesmo sem grupo nenhum nos dados. Os perfis plantados criam grupos de verdade, que você confere na tabela cruzada (seção 2.2, item 8).

1. Pelo menos **3 perfis**. Cada aluno está em exatamente um.
2. Cada perfil altera a distribuição de **pelo menos 4 colunas numéricas** (10 a 21).
3. **Variação dentro do perfil:** valores sorteados de distribuições, não clones. Alguma sobreposição entre perfis é bem-vinda.
4. O perfil **não** aparece no `students.csv`, só no `profiles_truth.csv`.
5. Documente os perfis na seção 1 do `python/ANALISE.md` (seção 2.5).

> **Dica:** um perfil pode ser só um conjunto de parâmetros (média de uma normal, taxa de uma Poisson). Sorteie o perfil de cada aluno com `rng.choice`, não em blocos de ids, senão o `id` entrega o perfil.

### 1.6 Distribuições de referência

Alvos aproximados, só para a base parecer real.

| Aspecto | Alvo |
|---|---|
| plan | standard ~50%, premium ~35%, elite ~15% |
| mentorshipFrequency | biweekly ~25% |
| studyYear | high_school_3 ~40%, prep ~30%, high_school_2 ~20%, high_school_1 ~10% |
| desiredCourse | medicine ~45%, law ~10%, engineering ~10%, dentistry ~7%, psychology ~7%, nursing ~6%, other ~15% |
| schoolType | public ~55% |
| state | Nordeste (AL, BA, CE, MA, PB, PE, PI, RN, SE) + Sudeste (ES, MG, RJ, SP) ≥ 60% |
| correctRate | geralmente entre 0,30 e 0,85; Linguagens e Humanas um pouco acima de Natureza e Matemática |
| avgEssayScore | média geral entre 550 e 750 |
| avgMentorshipRating | maioria entre 4 e 5 |
| Nunca ativos | 3% a 10% da base |

### 1.7 Reprodutibilidade

Mesma seed e mesmos parâmetros, no mesmo ambiente, geram **arquivos idênticos, byte a byte**.

- **Um único** `rng = np.random.default_rng(seed)` para todos os sorteios.
- Faker com seed: `Faker.seed(seed)` ou `fake.seed_instance(seed)`.
- Nada de `datetime.now()`, `date.today()`, `np.random.seed` nem do módulo `random`.
- Não percorra `set` de textos (a ordem muda entre execuções): use lista ou `sorted(...)`.

---

## Etapa 2: clusterizar (`cluster.py`)

### 2.1 Como rodar

```bash
python cluster.py --input ../data/raw --out ../data/processed --seed 42 [--k K]
```

- R vem do `metadata.json`: não fixe a data nem use o relógio.
- `--seed` é o `random_state` do KMeans e o campo `seed` do `clusters.json`.
- Sem `--k`, o script escolhe k **entre 3 e 6** por uma regra documentada. Com `--k`, usa o valor dado (precisa funcionar de 2 a 8).
- O `profiles_truth.csv` **não** entra no ajuste do modelo, só na tabela cruzada (item 8).

### 2.2 Requisitos

**1. Features.** Pelo menos **5 numéricas**: `tenureDays`, colunas 10 a 21 ou derivadas delas (taxa de presença = completed ÷ (completed + missed), média das 4 áreas…). Justifique no `ANALISE.md`. Derivada também pode ter nulo (presença sem mentoria é 0 ÷ 0) e precisa de regra.

**2. Categóricas** (`state`, `studyYear`, `desiredCourse`, `schoolType`, `plan`, `mentorshipFrequency`): o recomendado é deixar fora do KMeans e usar só para descrever os clusters. Se entrarem, só com one-hot e justificativa; **nunca** como 0/1/2, que inventa uma ordem inexistente.

**3. Nulos.** Impute com regra documentada no `ANALISE.md`. Nulo tem significado, e 0 diz outra coisa:

- `daysSinceLastActivity` nulo = nunca teve atividade: o valor imputado precisa indicar inatividade (0 seria "ativo hoje"; a média ou a mediana, "tão ativo quanto o aluno típico");
- `avgMentorshipRating` nulo = nenhuma mentoria (0 nem existe na escala 1–5);
- `correctRate*` nulo = nenhum simulado (0 seria "errou tudo");
- `avgEssayScore` nulo = nenhuma redação (0 seria "redação zerada").

Evite sentinelas como 9999: elas inflam o desvio padrão, e a padronização espreme os outros alunos num ponto só.

**4. Escala.** Padronize com `StandardScaler` (média 0 e desvio 1 por feature), de preferência num `Pipeline`. O KMeans usa distância: sem padronizar, `tenureDays` (0 a 365) engole uma taxa (0 a 1).

**5. Escolha de k.**

- Calcule inércia e silhouette para **k = 2 a 8**, com a mesma seed, sempre (mesmo com `--k`): vão no `kSelection`. Silhouette sobre os dados padronizados.
- **Inércia:** soma das distâncias ao quadrado de cada aluno ao centro do seu cluster; sempre cai quando k sobe. Procure o **cotovelo**: o k depois do qual mais um cluster reduz pouco a inércia.
- **Silhouette:** de −1 a 1; quanto maior, mais perto cada aluno está do próprio cluster do que do vizinho.
- Escolha k **entre 3 e 6** com uma regra determinística, num comentário do `cluster.py` e no `ANALISE.md` (ex.: "o menor k entre 3 e 6 cuja silhouette, com 4 casas, fica a menos de 0,01 da maior").
- Justifique no `ANALISE.md` com os dois critérios **e** com a utilidade para o time de Sucesso do Aluno (CS): cada cluster pede uma ação diferente? Só "maior silhouette" não basta.

No `exemplos/clusters.json` (seção 2.4), a inércia cai 1.117 de k = 2 para 3, 892 de 3 para 4 e só 289 de 4 para 5 (cotovelo em 4), e a silhouette é a maior em 4.

**6. Modelo:** `KMeans(n_clusters=k, n_init=10, random_state=seed)`: sorteia os centros iniciais 10 vezes e fica com o melhor; a seed torna os sorteios repetíveis.

**7. Nomes e descrições.** Escritos **à mão** por você, olhando as médias da **sua** base (seed 42, N = 1.000): o caminho esperado é um dicionário `{clusterId: {"name": ..., "description": ...}}` no `cluster.py`, que vai para o `clusters.json`.

- Nome com até 40 caracteres, **diferente entre os clusters** e neutro ("Sem atividade recente", não "Preguiçosos"). Descrição com até 200, útil para o CS (o que marca o grupo, com números).
- O dicionário só vale para a base e o k que você olhou (com outra seed, o id 0 pode ser outro grupo), e tudo bem: não pedimos regra para qualquer base. Id fora dele ou outro k leva `"Cluster N"` (N = id) e uma descrição genérica; aí basta que os nomes existam e sejam diferentes.
- Por isso **a API e o front nunca fixam nome por id**: leem do `clusters.json`.

**8. Tabela cruzada** cluster (linhas) × perfil do `profiles_truth.csv` (colunas), com `pd.crosstab`. Só **depois do ajuste**, como relatório (no `cluster.py` ou num script à parte). Comente no `ANALISE.md`: cada cluster concentra um perfil? Se mistura dois, por quê?

### 2.3 Saída: `data/processed/students.json`

Array ordenado por `id`. Cada objeto tem **os 21 campos do CSV**, com os mesmos nomes (nulo vira `null`, `enrolledAt` fica string `YYYY-MM-DD`, int continua int), mais `tenureDays` (int) e `clusterId` (int, de 0 a k − 1).

Exemplo real: [`../exemplos/students.sample.json`](../exemplos/students.sample.json) (o id 8 nunca teve atividade).

> **Dica (JSON):** leia o CSV com `dtype={"daysSinceLastActivity": "Int64"}` (senão sai `49.0`). `NaN` e `pd.NA` não são JSON válido: troque por `None` (ex.: `df.astype(object).where(df.notna(), None)`) e use `allow_nan=False`. Converta `numpy.int64` com `int(...)`.

### 2.4 Saída: `data/processed/clusters.json`

- `referenceDate` (do `metadata.json`), `seed` (o `--seed`), `studentCount` e `k` (o do modelo final).
- `features`: os nomes usados no KMeans, inclusive derivadas, em camelCase.
- `kSelection`: uma entrada por k de 2 a 8. Inércia com 2 casas, silhouette com 4.
- `clusters`: ordenada por `clusterId`, com `clusterId`, `name`, `description`, `size` e `featureMeans`. Soma de `size` = `studentCount`.
- `featureMeans`: **exatamente 13 chaves**, `tenureDays` + colunas 10 a 21 (sem derivadas). Unidades originais; a média **ignora nulos** e usa valores não imputados (`null` se todos forem nulos). `correctRate*` com 4 casas, o resto com 2.

Trecho real ([`../exemplos/clusters.json`](../exemplos/clusters.json)); `…` marca o que foi cortado:

```
{
  "referenceDate": "2026-09-30", "seed": 42, "studentCount": 1000, "k": 4,
  "features": ["tenureDays", "daysSinceLastActivity", "lessonsLast30d", "attendanceRate",
               "avgMentorshipRating", "avgCorrectRate", "avgEssayScore"],
  "kSelection": [ { "k": 2, "inertia": 4734.84, "silhouette": 0.3422 }, … ],
  "clusters": [
    { "clusterId": 0, "name": "Esfriando", "size": 255,
      "description": "Última atividade há 69 dias em média …",
      "featureMeans": { "daysSinceLastActivity": 69.02, "correctRateMath": 0.4948, … } }, …
  ]
}
```

### 2.5 `python/ANALISE.md`

Curto, com os números da base de seed 42 e N = 1.000. As 5 seções do [modelo](../python/ANALISE.md):

1. **Perfis plantados:** tabela com nome, % da base e colunas afetadas.
2. **Features, nulos e escala**, com o porquê.
3. **Escolha de k:** tabela de inércia e silhouette (k = 2 a 8) e justificativa com os 2 critérios e a utilidade para o CS.
4. **Clusters:** nome, tamanho, 3 médias contra a média geral e 1 ação para o CS por cluster.
5. **Tabela cruzada** cluster × perfil plantado, com comentário, e 1 limitação.

### 2.6 O que versionar

`data/raw/` e `data/processed/` gerados com os padrões (seed 42, N = 1.000) depois da última mudança no código; a `.venv` não. Rodamos os scripts e comparamos com o commitado: o `cluster.py` também sai igual byte a byte (sem hora de geração nem sorteio fora da seed).

### 2.7 Testes Python

No mínimo 2, com pytest. Os esboços estão em [`python/tests/test_generate.py`](../python/tests/test_generate.py), como *skipped*: tire o `pytest.skip("TODO")`.

1. **Mesma seed, mesma saída:** gere duas vezes em pastas diferentes e compare os bytes dos 3 arquivos.
2. **R2, R3, R5 e R6 valem** numa base com N pequeno (ex.: 200).

Gere os dados numa pasta temporária (`tmp_path`), não em `data/raw/`.

---

## Antes de seguir para a API

- [ ] `generate.py` roda com os padrões em menos de 30 s, e também com `--n 100` e `--n 20000`.
- [ ] Arquivos conforme 1.2 e 1.3; R1 a R8 em todas as linhas; 3 ou mais perfis com variação, só no `profiles_truth.csv`; mesma seed, arquivos idênticos.
- [ ] `cluster.py` conforme 2.2; saídas conforme 2.3 e 2.4.
- [ ] Com outros parâmetros, fora de `data/`, tudo roda e os clusters têm nomes diferentes entre si (`"Cluster N"` serve). Ex.: `python generate.py --seed 123 --n 500 --reference-date 2026-03-31 --out /tmp/raw` e `python cluster.py --input /tmp/raw --out /tmp/proc --seed 123 --k 6`.
- [ ] `ANALISE.md` com as 5 seções e `pytest` passando sem *skipped*.

Próximo passo: [`02-api.md`](02-api.md).
