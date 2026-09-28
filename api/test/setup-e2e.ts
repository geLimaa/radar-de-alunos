import { join } from 'node:path';

// Os testes e2e sobem o AppModule inteiro, que carrega os dados de DATA_DIR.
// Por padrão eles usam a fixture pequena de test/fixtures/processed, que não
// depende dos seus dados. Para rodar contra outra pasta:
//   DATA_DIR=../data/processed npm run test:e2e
process.env.DATA_DIR ??= join(__dirname, 'fixtures', 'processed');
