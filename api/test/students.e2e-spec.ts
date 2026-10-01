import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/configure-app';

// O AppModule carrega os dados de DATA_DIR na subida. Nos e2e, DATA_DIR aponta
// para a fixture de test/fixtures/processed (veja test/setup-e2e.ts).
describe('Students (e2e)', () => {
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

  it('GET /api/students?clusterId=<existent> → only students from that cluster', async () => {
    const clusterResponse = await request(app.getHttpServer()).get('/api/clusters').expect(200)

    const clusterId = clusterResponse.body.data[0].clusterId
    const studentsResponse = await request(app.getHttpServer()).get(`/api/students?clusterId=${clusterId}`).expect(200)

    expect(studentsResponse.body.data.length).toBeGreaterThan(0)
    expect(studentsResponse.body.data.every(
      (student: {
        clusterId: number
      }) => student.clusterId === clusterId)).toBe(true)
  });

  it('GET /api/students?pageSize=500 → 400', () => {
    return request(app.getHttpServer()).get('/api/students?pageSize=500').expect(400);
  });
});
