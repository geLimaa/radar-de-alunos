# Fixture de dados da API

`students.json` e `clusters.json` pequenos, no mesmo formato que o seu `cluster.py` vai gerar em `data/processed/`. Servem para subir a API e rodar os testes e2e **antes** de você ter os seus dados.

## De onde veio

- **8 alunos fictícios** usados como fixture de testes, copiados sem alteração. Os ids são os originais (3, 7, 8, 9, 10, 20, 93 e 254), por isso não são sequenciais.
- **2 clusters:** `0` com 5 alunos (3 na faixa `disengaged` e 2 na `slipping`) e `1` com 3 (1 `never` e 2 `engaged`).
- `studentCount`, `k`, `size` e `featureMeans` foram **recalculados** para esses 8 alunos, com as regras do contrato: média ignorando nulos, taxas com 4 casas e o resto com 2. No cluster `1`, ninguém mandou redação, então `avgEssayScore` é `null`.
- `name` e `description` vêm dos clusters originais. Os números citados nas descrições são os da base de 1.000 alunos, não os destes 8.
- `referenceDate`, `seed`, `features` e `kSelection` foram copiados da base completa. **A `kSelection` é ilustrativa:** não foi calculada para estes 8 alunos.

## Uso

- `npm run test:e2e` usa esta pasta por padrão (veja `test/setup-e2e.ts`).
- Para subir a API com ela: `DATA_DIR=test/fixtures/processed npm run start:dev`.
- Não copie estes arquivos para `data/` e não use como seus dados: a entrega usa o que o seu `generate.py` e o seu `cluster.py` produzem.
