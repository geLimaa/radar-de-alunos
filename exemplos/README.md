# Exemplos

Saídas reais da nossa solução, geradas com `--seed 42`, `--n 1000` e `--reference-date 2026-09-30`. Servem para conferir **formato** (nomes de campos, tipos, ordem, nulos e casas decimais), não valores.

- Os números, o k, os nomes e as descrições dos clusters são da nossa solução. Os seus vão ser outros, mesmo com seed 42.
- Não copie nada daqui para `data/`. Nome de cluster por id só no dicionário do seu `cluster.py`, com as suas médias; na API e no front, nunca.
- Os alunos são fictícios (nomes do Faker).

## Arquivos

| Arquivo | O que é | Contrato |
|---|---|---|
| [`students.sample.csv`](students.sample.csv) | cabeçalho + ids 1 a 10 de `data/raw/students.csv` | [docs/01](../docs/01-dados-e-clusters.md), 1.3 |
| [`metadata.json`](metadata.json) | `data/raw/metadata.json` completo | [docs/01](../docs/01-dados-e-clusters.md), 1.2 |
| [`students.sample.json`](students.sample.json) | ids 1, 2 e 8 (nunca ativo) de `data/processed/students.json` | [docs/01](../docs/01-dados-e-clusters.md), 2.3 |
| [`clusters.json`](clusters.json) | `data/processed/clusters.json` completo | [docs/01](../docs/01-dados-e-clusters.md), 2.4 |
| [`api/clusters.json`](api/clusters.json) | `GET /api/clusters` | [docs/02](../docs/02-api.md) |
| [`api/students-page.json`](api/students-page.json) | `GET /api/students?clusterId=0&page=1&pageSize=3` | [docs/02](../docs/02-api.md) |
| [`api/summary.json`](api/summary.json) | `GET /api/summary` | [docs/02](../docs/02-api.md) |
| [`api/summary-cluster-0.json`](api/summary-cluster-0.json) | `GET /api/summary?clusterId=0` | [docs/02](../docs/02-api.md) |
| [`api/error-400.json`](api/error-400.json) | `GET /api/students?pageSize=500` → 400 | [docs/02](../docs/02-api.md) |
| [`api/error-404.json`](api/error-404.json) | `GET /api/summary?clusterId=99` → 404 (cluster não existe) | [docs/02](../docs/02-api.md) |

As respostas de `api/` vêm da mesma base dos arquivos acima.

## O que observar

- **CSV:** nulo é célula vazia. O id 8 nunca teve atividade: `daysSinceLastActivity`, a nota das mentorias, as 4 taxas de acerto e a nota da redação estão vazias, e as contagens de aula, simulado e redação são 0. Os ids 1, 7, 8 e 10 não enviaram redação, então `avgEssayScore` está vazio. Os ids 3, 7 e 9 estão há 30 dias ou mais sem atividade, então `lessonsLast30d` = 0.
- **Casas decimais:** o CSV usa casas fixas (`4.40`, `804.0`), mas sem o zero à direita também vale. No JSON, `4.40` vira `4.4`, e está certo.
- **`students.sample.json`:** 21 campos do CSV + `tenureDays` + `clusterId`; nulo vira `null`. O id 8 se matriculou em 2026-09-15, então `tenureDays` = 15.
- **`clusters.json`:** `kSelection` de 2 a 8 (a nossa regra escolheu k = 4). As 7 `features` são uma escolha nossa, com 2 derivadas (`attendanceRate` e `avgCorrectRate`): escolha e justifique as suas. `featureMeans` tem sempre as mesmas 13 chaves, sem as derivadas. A soma de `size` (255 + 206 + 289 + 250) é o `studentCount`.
