import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/configure-app';

// O AppModule carrega os dados de DATA_DIR na subida. Nos e2e, DATA_DIR aponta
// para a fixture de test/fixtures/processed (veja test/setup-e2e.ts).
describe('Summary (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/summary?clusterId=<nonexistent> → 404 for a nonexistent cluster', async () => {
    const clusterResponse = await request(app.getHttpServer()).get('/api/clusters').expect(200)

    const greatestCluster = Math.max(
      ...clusterResponse.body.data.map(
        (cluster: { clusterId: number }) => cluster.clusterId,
      ),
    ) 
    const invalidCluster = greatestCluster + 1 // invalid cluster

    const summaryResponse = await request(app.getHttpServer()).get(`/api/summary?clusterId=${invalidCluster}`).expect(404)

    expect(summaryResponse.body.message).toBe('Cluster não encontrado');
  });
});
