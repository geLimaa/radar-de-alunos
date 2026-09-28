import { ConfigService } from '@nestjs/config';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { EnvironmentVariables } from '../config/env.validation';
import { DataService } from './data.service';

const FIXTURE_DIR = join(__dirname, '../../test/fixtures/processed');

function createService(dataDir: string): DataService {
  return new DataService(
    new ConfigService<EnvironmentVariables, true>({ DATA_DIR: dataDir }),
  );
}

describe('DataService', () => {
  let emptyDir: string;

  beforeEach(() => {
    emptyDir = mkdtempSync(join(tmpdir(), 'radar-api-'));
  });

  afterEach(() => {
    rmSync(emptyDir, { recursive: true, force: true });
  });

  it('falha com o caminho e a dica quando falta students.json', () => {
    expect(() => createService(emptyDir)).toThrow(
      /Arquivo não encontrado: .*students\.json\. Gere os dados com o cluster\.py ou ajuste DATA_DIR/,
    );
  });

  it('falha quando falta clusters.json', () => {
    writeFileSync(join(emptyDir, 'students.json'), '[]');
    expect(() => createService(emptyDir)).toThrow(
      /Arquivo não encontrado: .*clusters\.json/,
    );
  });

  it('falha com mensagem clara quando o JSON é inválido', () => {
    writeFileSync(join(emptyDir, 'students.json'), '[{"id": 1,');
    expect(() => createService(emptyDir)).toThrow(
      /students\.json não é um JSON válido/,
    );
  });

  it('carrega a fixture de test/fixtures/processed', () => {
    const service = createService(FIXTURE_DIR);

    expect(service.students).toHaveLength(service.clustersFile.studentCount);
    expect(service.clustersFile.clusters).toHaveLength(service.clustersFile.k);
    expect(service.findCluster(0)?.clusterId).toBe(0);
    expect(service.findCluster(99)).toBeUndefined();
  });
});
