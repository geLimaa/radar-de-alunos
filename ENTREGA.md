# Entrega: Radar de Alunos

<!--
Modelo da sua entrega. Comentários como este não aparecem no GitHub; pode apagá-los.
Seja curto: tópicos e tabelas bastam. Este arquivo é um mapa para quem avalia.
Não ponha seu nome aqui nem nos arquivos: quem corrige não precisa saber quem fez.
-->

## 1. O que foi feito

<!-- Situação de cada etapa. Se parou nas 6 horas, diga em que ponto. -->

| Etapa | Situação (pronta / parcial / não feita) | Observação |
|---|---|---|
| 1. Gerar os dados (`python/generate.py`) | PRONTO | - |
| 2. Clusterização e análise (`python/cluster.py`, `python/ANALISE.md`) | PRONTO | - |
| 3. API (`api/`) | PRONTO | - |
| 4. Dashboard (`web/`) | PRONTO | - |

## 2. Como rodar

<!--
Estes são os comandos do starter. Ajuste ao que você fez e TESTE numa cópia limpa:
descompacte o .zip da entrega numa pasta nova e siga esta seção do zero, sem pular nada.
-->

Versões que usei: Python `3.14.7`, Node `24.15.0`, npm `11.12.1`.

**Dados** (em `python/`):

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python generate.py --n 1000 --seed 42 --reference-date 2026-09-30 --out ../data/raw
python cluster.py --input ../data/raw --out ../data/processed --seed 42
```

**API** (em `api/`):

```bash
npm ci
cp .env.example .env
npm run start:dev
```

**Dashboard** (em `web/`, com a API no ar):

```bash
npm ci
cp .env.example .env
npm run dev
```

Abra http://localhost:5173.

## 3. Como rodar os testes

<!--
Os comandos e, em uma linha, o que cada teste verifica.
Os e2e da API usam a fixture de api/test/fixtures/processed. Se rodou também com os
seus dados (DATA_DIR=../data/processed npm run test:e2e), diga aqui.
-->

```bash
# Python (em python/, com a .venv ativa)
pytest

# API (em api/)
npm test
npm run test:e2e

# WEB (em web/)
não há testes automatizados
```

## 4. Decisões e trade-offs

<!--
Suas escolhas e o porquê, em tópicos: perfis do gerador, imputação, features, regra do k,
como a API guarda e filtra os dados, como o front busca os dados.
Trade-off = o que você ganhou e do que abriu mão.
Inclua as dúvidas que você decidiu sozinho (resposta que não chegou a tempo ou ponto ambíguo nos docs).
-->
### Geração
- Cinco perfis latentes foram definidos para representar comportamentos distintos
- Os pesos foram escolhidos manualmente para distribuir os alunos entre os perfis
- Distribuições Poisson, Normal, Exponencial e Binomial foram usadas para gerar variação nos dados
- O atributo `never` foi calibrado para manter aproximadamente 7,3% de alunos nunca ativos, dentro do intervalo pedido
- Uma seed única foi usada para garantir reprodutibilidade.

### Clusterização

- Sete features comportamentais foram usadas, campos textuais ficaram fora porque não possuem distância numérica natural
- Nulos de atividade foram representados por `tenureDays` e os demais foram preenchidos pela mediana, para não influencia no KMeans
- `StandardScaler` foi usado para colocar as features em escalas comparáveis antes do KMeans, dentro do intervalo 0-1
- Foram testados `k` de 2 a 8, escolhi `k = 4` em vez de `k = 3` porque a queda da inércia de 3 para 4 foi de 14,3%, e quatro grupos produziram perfis mais úteis para o Sucesso do Aluno, apesar de `k = 3` ter silhouette maior.

### API

- dados carregados uma vez na inicialização
- armazenamento em memória, sem banco
- paginação feita no backend
- regra de engajamento centralizada na API

### Dashboard

- frontend consome somente a API
- null aparece como '—'
- filtro de cluster controla resumo e tabela
- paginação é feita no servidor
- componentes separados por bloco da tela

## Trade-Offs

- **Imputação pela mediana:** simplifica o tratamento dos nulos, mas pode esconder a diferença entre ausência e desempenho mediano
- **KMeans:** é simples e interpretável, mas exige escolher `k` e pressupõe grupos separáveis por distância
- **Arquivos em memória:** simplificam a API para a base pequena, mas não escalam bem para grandes volumes ou atualizações frequentes
- **Paginação no backend:** reduz os dados enviados ao navegador, mas exige uma requisição por página

## 5. O que ficou de fora e por quê

<!-- O que o enunciado pede e ficou faltando ou pela metade, e o motivo. -->

- O eixo e o tooltip do gráfico de engajamento ainda usam a formatação padrão do Recharts, em vez de aplicar explicitamente os formatadores pt-BR exigidos para todos os valores do gráfico. Isso ficou como acabamento final
- Durante o carregamento inicial dos clusters, o seletor ainda não é exibido com a opção única “Todos”; ele aparece somente depois que a resposta de `/clusters` chega. A busca e os demais estados continuam funcionando
- O `getHealth` e o tipo `HealthResponse`, que vieram do starter, continuam em `web/src/api.ts` mesmo após a remoção do bloco visual de status da API. É código sem uso que deveria ser removido antes da entrega final

## 6. O que faria com mais tempo

<!-- Próximos passos, em ordem de prioridade. -->

- Remover o código não utilizado do health check e aplicar os formatadores pt-BR também no eixo e tooltip do gráfico
- Criar testes automatizados para os componentes e principais estados do dashboard
- Refatorar o `cluster.py` em funções menores e adicionar indicadores para diferenciar valores originalmente nulos de valores realmente iguais a zero
- Melhorar acessibilidade, responsividade e feedback visual de carregamento
- Em uma versão maior, substituir os arquivos em memória por persistência implementando um banco de dados e acompanhar a evolução dos alunos ao longo do tempo

## 7. Uso de IA

<!-- Obrigatório (veja a seção 8 do README). Se não usou, escreva "Não usei". -->

- **Ferramentas:** Codex & Claude
- **Em quais partes:** entendimento dos documentos, explicação e revisão da geração dos dados e do KMeans (forte uso em /python), organização dos componentes React, formatação, CSS completo
- **Uma sugestão que corrigi ou descartei:**  foi sugerido usar AbortController para cancelar requisições quando o cluster fosse trocado rapidamente. Optei por usar uma flag ignore no useEffect, porque essa abordagem já era indicada no documento, era suficiente para evitar que respostas antigas atualizassem a tela e mantinha o código mais simples para o escopo do projeto.

## 8. Tempo gasto (opcional)

<!-- Aproximado. Não vale ponto: serve para calibrarmos o tamanho do teste. -->

| Etapa | Tempo |
|---|---|
| Leitura e setup | 15min |
| 1. Gerar os dados | 2h |
| 2. Clusterização e análise | 2h |
| 3. API | 1h |
| 4. Dashboard | 1h |
| `ENTREGA.md` | 15min |
| **Total** | 6h30min |
