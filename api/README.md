# API (NestJS)

Starter da API do Radar de Alunos. O contrato completo das rotas está em [`../docs/02-api.md`](../docs/02-api.md).

## O que já vem pronto

- prefixo global `/api`;
- CORS liberado para a origem definida em `CORS_ORIGIN`;
- `ConfigModule` global, com validação das variáveis de ambiente na subida (`src/config/env.validation.ts`);
- `ValidationPipe` global com `whitelist`, `forbidNonWhitelisted` e `transform` (class-validator e class-transformer já instalados);
- `GET /api/health` → `{ "status": "ok" }`, com um teste unitário e um teste e2e (Jest + supertest);
- **carga dos dados** em `src/data/`:
  - `DataService` lê `DATA_DIR/students.json` e `DATA_DIR/clusters.json` uma vez, na subida, e guarda tudo em memória (sem banco). Se um arquivo faltar ou não for JSON válido, a API não sobe e mostra o caminho e o motivo;
  - `data.types.ts` tem os tipos `Student`, `Cluster` e `ClustersFile`, iguais ao contrato dos arquivos;
  - `data.service.spec.ts` testa a carga;
- uma **fixture** pequena em `test/fixtures/processed/` (8 alunos em 2 clusters, [veja o README dela](test/fixtures/processed/README.md)), usada pelos testes e2e.

## O que você implementa

- a **função da faixa de engajamento** (pura) e o teste unitário dela, com as fronteiras `null`, 14, 15, 30 e 31;
- as rotas `GET /api/clusters`, `GET /api/students` e `GET /api/summary`, com DTO e validação dos parâmetros de query, os cálculos e os erros 400 e 404;
- os testes e2e mínimos:
  - `GET /api/students?clusterId=<um existente>` só devolve alunos desse cluster;
  - `GET /api/students?pageSize=500` → 400;
  - `GET /api/summary?clusterId=<inexistente>` → 404.

## Como rodar

Requisito: Node 22.12+ ou 24 (20.19+ também funciona) e npm, como na seção 5 do [README da raiz](../README.md).

```bash
npm ci
cp .env.example .env
npm run start:dev        # modo watch: http://localhost:3000/api/health (só com dados gerados; antes, use a fixture abaixo)
```

O `.env.example` aponta `DATA_DIR` para `../data/processed`. Enquanto você não gerar os seus dados com o `cluster.py`, essa pasta está vazia e a API **não sobe**: ela mostra `Arquivo não encontrado: .../students.json. Gere os dados com o cluster.py ou ajuste DATA_DIR`. É esperado.

**Antes de gerar seus dados**, suba com a fixture:

```bash
DATA_DIR=test/fixtures/processed npm run start:dev
```

No PowerShell (Windows):

```powershell
$env:DATA_DIR = "test/fixtures/processed"; npm run start:dev
# depois, para voltar ao .env: Remove-Item Env:DATA_DIR
```

Uma variável definida no terminal vence a do `.env`. A API lê os dados só na subida: gerou de novo? Reinicie.

Testes, lint e build:

```bash
npm test                 # unitários: arquivos *.spec.ts dentro de src/
npm run test:e2e         # e2e: arquivos *.e2e-spec.ts dentro de test/ (usam a fixture)
npm run lint             # ESLint (corrige o que der automaticamente)
npm run build            # compila para dist/
npm run start:prod       # roda o build (node dist/main)
```

Os e2e sobem o `AppModule` inteiro com `DATA_DIR` apontando para a fixture (`test/setup-e2e.ts`), então passam antes de você gerar os dados e não dependem da sua seed. Para rodar contra os seus dados: `DATA_DIR=../data/processed npm run test:e2e`.

## Variáveis de ambiente

| Variável | Default | Para que serve |
|---|---|---|
| `PORT` | `3000` | porta HTTP |
| `DATA_DIR` | `../data/processed` | pasta com `students.json` e `clusters.json` gerados pelo Python. Caminho relativo vale a partir desta pasta `api/`, que é onde os comandos `npm` rodam |
| `CORS_ORIGIN` | `http://localhost:5173` | origem do dashboard autorizada no CORS |

Sem `.env`, valem os defaults. Se alguma variável for inválida (por exemplo, `PORT=abc`), a API não sobe e mostra o motivo no terminal.

## Onde colocar o seu código

- `src/main.ts` sobe a aplicação.
- `src/configure-app.ts` aplica o prefixo, o CORS e o `ValidationPipe`. Os testes e2e usam a mesma função, então mudanças de configuração global vão aí.
- `src/health/` é um módulo de exemplo (controller, módulo e teste).
- `src/data/` é a carga dos dados. Use, não reescreva.
- Sugestão, não obrigação: um módulo por assunto, como `src/students/`, `src/clusters/` e `src/summary/`, importados no `AppModule`. Organize como achar melhor.

Para usar os dados num módulo seu, importe o `DataModule` nele e injete o `DataService`:

```ts
@Module({ imports: [DataModule], controllers: [StudentsController], providers: [StudentsService] })
export class StudentsModule {}

@Injectable()
export class StudentsService {
  constructor(private readonly data: DataService) {}
  // this.data.students, this.data.clustersFile, this.data.findCluster(id)
}
```

## Dica: erro TS1272 no build

Se o build ou o `start:dev` quebrar com `TS1272: A type referenced in a decorated signature must be imported with 'import type'…`, é porque um método com decorator (por exemplo, o `@Get()` de um controller) usa no parâmetro ou no retorno um tipo que só existe no TypeScript (uma `interface` ou um `type`). A causa são duas opções do `tsconfig` (`isolatedModules` e `emitDecoratorMetadata`). Troque o import por `import type`:

```ts
import type { Student } from '../data/data.types';
```

Classes, como os DTOs de validação, continuam com `import` normal.
