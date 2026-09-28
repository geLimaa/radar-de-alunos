# web: dashboard Radar de Alunos

React 19 + TypeScript + Vite 8, com [Recharts](https://recharts.org) já instalado para o gráfico.

Hoje a página só mostra o título, o selo "Dados fictícios" e o status da API (`GET /api/health`). O dashboard que você vai construir está descrito em [`../docs/03-dashboard.md`](../docs/03-dashboard.md).

## Como rodar

Precisa de Node 20.19+ ou 22.12+.

```bash
npm ci
cp .env.example .env
npm run dev
```

Abra http://localhost:5173. A API precisa estar rodando em http://localhost:3000 (veja `../api`); sem ela, a página mostra "Status da API: erro" e o botão "Tentar de novo".

A porta 5173 é fixa (no `dev` e no `preview`) porque a API libera CORS só para ela. Se a porta estiver ocupada, o Vite para com erro em vez de subir em outra.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento em http://localhost:5173 |
| `npm run build` | checa os tipos e gera o build em `dist/` |
| `npm run typecheck` | só checa os tipos |
| `npm run lint` | lint com Oxlint (regras em `.oxlintrc.json`) |
| `npm run preview` | serve o build de `dist/`, também em http://localhost:5173 (pare o `dev` antes) |

Com o Recharts, o bundle passa dos 500 kB do aviso padrão do Vite. Isso é esperado, e por isso o `vite.config.ts` sobe o limite do aviso para 1000 kB (`build.chunkSizeWarningLimit`).

## Onde mexer

- `src/api.ts`: `API_URL` (vem de `VITE_API_URL`, com default `http://localhost:3000/api`) e as funções que chamam a API. Coloque as novas chamadas aqui. O `getJson` aceita um `signal` opcional, se você usar `AbortController`.
- `src/App.tsx`: a página.
- `src/index.css`: estilos.
- Arquivos novos (sugestão): `src/format.ts` (formatadores), `src/labels.ts` (rótulos) e `src/components/` (um componente por bloco da página).

> **Dica (TypeScript estrito):** o `tsconfig.app.json` liga `verbatimModuleSyntax` e `erasableSyntaxOnly`. Tipo importado de outro arquivo precisa de `import type { ... }` ou `import { getSummary, type SummaryResponse }`: sem isso, o `build` dá erro TS1484 e o `dev` fica com a tela branca e um `SyntaxError` de import no console. E `enum` não compila (erro TS1294): use união de strings, como `type Band = 'engaged' | 'slipping' | 'disengaged' | 'never'`.
