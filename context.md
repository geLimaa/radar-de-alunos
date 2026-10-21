# Contexto do projeto

## Objetivo

Este projeto será evoluído como um projeto de portfólio, com forte ênfase em backend.

A aplicação analisa perfis comportamentais de alunos usando dados sintéticos, clusterização com KMeans, uma API e um dashboard web.

## Estado atual

O projeto possui três partes principais:

- `python/`: geração dos dados sintéticos e clusterização com Pandas e Scikit-learn;
- `api/`: API NestJS que atualmente lê JSONs processados e mantém os dados em memória;
- `web/`: dashboard React + TypeScript + Vite que consome a API.

Também existem documentação, testes, fixtures, exemplos e dados gerados em `data/`.

## Direção planejada

A evolução planejada é transformar os dados atualmente mockados em dados persistidos em banco, mantendo o pipeline de geração e clusterização separado da aplicação web.

Fluxo desejado:

```text
geração dos dados → KMeans/clusters → importação → PostgreSQL → API NestJS → frontend React
```

Tecnologias e recursos planejados:

- PostgreSQL;
- Prisma ORM;
- migrations e seed reproduzível;
- Docker e possivelmente Docker Compose;
- Jest para testes unitários, integração e e2e;
- API NestJS modular e robusta;
- DTOs, validação, paginação, filtros, ordenação e tratamento centralizado de erros;
- Swagger/OpenAPI;
- logs e configuração por ambiente;
- frontend adaptado aos contratos reais do backend.

## Princípios para próximas alterações

- Priorizar backend bem projetado, testável e explicável.
- Manter Python como processo batch/offline de geração e análise, sem executar KMeans dentro das requisições HTTP.
- Preferir um monólito modular bem estruturado a uma arquitetura excessivamente complexa.
- Não adicionar autenticação, filas ou microserviços sem uma justificativa clara.
- Preservar o que já funciona quando isso não conflitar com a nova arquitetura.
- Antes de modificar arquivos, confirmar que a mudança está dentro do escopo pedido.
- Nunca modificar arquivos sem autorização explícita do usuário.

## Comportamento do agente

O usuário pediu que o projeto seja lido antes das próximas etapas e que nenhuma alteração seja feita sem permissão. Para qualquer mudança, explicar brevemente o que será alterado e depois implementar somente o escopo autorizado.

