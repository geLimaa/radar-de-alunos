import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { EnvironmentVariables } from '../config/env.validation';
import type { Cluster, ClustersFile, Student } from './data.types';

/**
 * Lê `students.json` e `clusters.json` de DATA_DIR uma única vez, na subida,
 * e mantém tudo em memória (sem banco). Se um arquivo faltar ou não for um
 * JSON válido, a API não sobe e mostra o motivo.
 */
@Injectable()
export class DataService {
  private readonly logger = new Logger(DataService.name);

  /** Todos os alunos, na ordem do arquivo. Não altere esta lista. */
  readonly students: Student[];
  /** O `clusters.json` inteiro. */
  readonly clustersFile: ClustersFile;

  constructor(config: ConfigService<EnvironmentVariables, true>) {
    const dataDir = resolve(config.get('DATA_DIR', { infer: true }));
    const studentsPath = join(dataDir, 'students.json');
    const clustersPath = join(dataDir, 'clusters.json');

    this.students = readJsonFile<Student[]>(studentsPath);
    this.clustersFile = readJsonFile<ClustersFile>(clustersPath);

    if (!Array.isArray(this.students)) {
      throw new Error(`${studentsPath} deveria ser uma lista de alunos.`);
    }
    if (!Array.isArray(this.clustersFile?.clusters)) {
      throw new Error(`${clustersPath} não tem a lista "clusters".`);
    }

    this.logger.log(
      `Dados carregados de ${dataDir}: ${this.students.length} alunos, ${this.clustersFile.clusters.length} clusters`,
    );
  }

  /** Cluster pelo id, ou `undefined` se ele não existir. */
  findCluster(clusterId: number): Cluster | undefined {
    return this.clustersFile.clusters.find(
      (cluster) => cluster.clusterId === clusterId,
    );
  }
}

function readJsonFile<T>(path: string): T {
  if (!existsSync(path)) {
    throw new Error(
      `Arquivo não encontrado: ${path}. Gere os dados com o cluster.py ou ajuste DATA_DIR ` +
        '(para subir antes de gerar: DATA_DIR=test/fixtures/processed npm run start:dev).',
    );
  }
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
  } catch (error) {
    throw new Error(
      `${path} não é um JSON válido (${(error as Error).message}). Gere os dados de novo com o cluster.py ou ajuste DATA_DIR.`,
    );
  }
}
