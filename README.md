# Radar de Alunos

Plataforma full stack para análise de engajamento e perfis comportamentais de alunos.

## Visão geral

O projeto combina um pipeline de dados em Python, uma API REST em NestJS e um dashboard em React. Os dados são sintéticos e servem para demonstrar geração reprodutível, clusterização, regras de engajamento e visualização.

## Arquitetura atual

```text
python/generate.py  ->  data/raw/
python/cluster.py   ->  data/processed/
api/               ->  API REST
web/               ->  dashboard React
```

## Tecnologias

- Python, Pandas, NumPy, Faker e Scikit-learn;
- NestJS, TypeScript, class-validator e Jest;
- React, TypeScript, Vite e Recharts.

## Como executar

### Dados

```bash
cd python
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python generate.py --n 1000 --seed 42 --reference-date 2026-09-30 --out ../data/raw
python cluster.py --input ../data/raw --out ../data/processed --seed 42
```

### API

```bash
cd api
npm ci
cp .env.example .env
npm run start:dev
```

A API fica disponível em `http://localhost:3000/api`.

### Dashboard

```bash
cd web
npm ci
cp .env.example .env
npm run dev
```

O dashboard fica disponível em `http://localhost:5173`.

## Testes

```bash
cd python && pytest
cd api && npm test
cd api && npm run test:e2e
cd api && npm run build
cd web && npm run typecheck
cd web && npm run build
```

## API

- `GET /api/health`
- `GET /api/clusters`
- `GET /api/students`
- `GET /api/summary`

A documentação detalhada dos contratos fica nos DTOs, serviços e testes da API.

## Próximos passos

- Persistir os dados em PostgreSQL;
- Adicionar Prisma, migrations e seed;
- Usar Docker Compose para o ambiente local;
- Expandir testes unitários, de integração e e2e;
- Evoluir a API com filtros, histórico de clusterizações e Swagger.

## Licença

Projeto educacional e de portfólio.
