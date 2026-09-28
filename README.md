# Radar de Alunos: teste técnico Full Stack Júnior

Obrigado por topar o desafio! Aqui estão o panorama e as regras; o detalhe de cada etapa está em [`docs/`](docs/).

## 1. Contexto

A Amentoria é uma plataforma de mentoria para o ENEM. Os alunos têm um mentor (sessões mensais ou quinzenais), assistem a aulas gravadas e lançam simulados por área e redações.

O time de **Sucesso do Aluno** quer entender **que perfis de aluno existem**, para agir cedo com quem está esfriando. Os dados reais são pessoais, e muitos alunos são menores de idade. Por isso você vai construir o fluxo inteiro com dados **sintéticos**, gerados por você:

```
python/generate.py ──► data/raw/students.csv (+ metadata.json, profiles_truth.csv)
python/cluster.py  ──► data/processed/students.json + clusters.json
api/ (NestJS)      ──► lê data/processed na subida e serve /api/...
web/ (React+Vite)  ──► dashboard que consome só a API
```

## 2. Tempo e processo

**Esforço esperado: cerca de 5 horas** (medimos refazendo o teste só com estes docs).

| Etapa | Tempo sugerido |
|---|---|
| Leitura e setup | 30 min |
| 1. Gerar os dados (com testes) | 1h |
| 2. Clusterização e `ANALISE.md` | 1h |
| 3. API | 1h |
| 4. Dashboard | 1h15 |
| `ENTREGA.md` | 15 min |

- **Se chegar a 6 horas, pare** e entregue o que tiver, listando no `ENTREGA.md` o que faltou. Horas extras não contam pontos. Velocidade também não.
- **Prazo:** 7 dias corridos a partir do recebimento. Precisa de mais? Peça: a extensão não tem penalidade.
- **Entrega parcial é aceita.** Toda entrega, mesmo parcial ou com bug, vai para a conversa técnica: ninguém é cortado só pela correção do código.
- **Etapas:** 1) conversa inicial (já aconteceu); 2) este desafio; 3) conversa técnica sobre a entrega ([seção 7](#7-como-vamos-avaliar)); 4) conversa final. Não há outro teste de código.
- **Retorno por escrito** em até 5 dias úteis depois da entrega e depois da conversa técnica.
- **Formato alternativo:** não pode fazer desafio em casa? Peça pelo canal de dúvidas um *pair programming* ao vivo, de cerca de 1h30, sobre o mesmo problema.

## 3. O que você vai construir

4 etapas, nesta ordem. Cada uma usa a saída da anterior. Os docs trazem o contrato completo: siga à risca.

**Regra geral: o que vem dos dados nunca fica fixo no código** (data de referência, quantidades, k). Os nomes dos clusters você escreve no `cluster.py`, olhando as médias da sua base; API e dashboard os leem do `clusters.json`, nunca por id. Podemos rodar tudo com outros `--seed`, `--n`, `--reference-date` e `--k`: aí basta que os nomes existam e sejam diferentes entre si.

1. **Gerar os dados (Python).** `python/generate.py` cria N alunos fictícios em `data/raw/`: CSV de 21 colunas, regras de consistência R1 a R8 e pelo menos 3 perfis escondidos. A mesma *seed* gera arquivos idênticos. Mínimo de 2 testes (pytest). Detalhes: [`docs/01-dados-e-clusters.md`](docs/01-dados-e-clusters.md).
2. **Clusterizar e analisar (Python).** `python/cluster.py` agrupa os alunos com KMeans (features, nulos, padronização e k entre 3 e 6, justificado) e grava `students.json` e `clusters.json` em `data/processed/`, com nome e descrição por cluster. Você preenche as 5 seções do [`python/ANALISE.md`](python/ANALISE.md). Detalhes: mesmo doc da etapa 1.
3. **API (NestJS).** A carga dos dados já vem pronta. Você faz a faixa de engajamento (com teste unitário) e 3 rotas GET: `/api/clusters`, `/api/students` (filtro por cluster e paginação) e `/api/summary`, com validação, erros 400/404 e testes e2e. Detalhes: [`docs/02-api.md`](docs/02-api.md).
4. **Dashboard (React + Vite).** Uma página, só com dados da API: seletor de cluster, 3 cards, gráfico de engajamento, cards dos clusters e tabela paginada no servidor, com estados de carregando/erro/vazio, formatos pt-BR e nulo como "—". Detalhes: [`docs/03-dashboard.md`](docs/03-dashboard.md).

Saídas reais de uma solução nossa (seed 42, N = 1000), para ver o formato: [`exemplos/`](exemplos/README.md). Os seus números serão outros.

## 4. O que NÃO será avaliado

Deploy, autenticação, banco de dados, Docker, CI, design visual refinado e responsividade, tela de detalhe do aluno, testes de front, Swagger e padrões de arquitetura (DDD, Clean etc.). **Simples e correto vence.**

## 5. Como rodar o starter

O starter já roda: os scripts Python têm os parâmetros (e só imprimem `TODO`, com código 1), a API carrega os dados e responde `GET /api/health`, e o dashboard mostra o status da API. Detalhes nos READMEs de [`python/`](python/README.md), [`api/`](api/README.md) e [`web/`](web/README.md).

**Pré-requisitos:** Python 3.11+ (testado no 3.13, o do `.python-version`); Node.js 22.12+ (`nvm install` lê o `.nvmrc`), 24 ou 20.19+; npm e Git.

Um terminal por bloco, a partir da raiz (macOS, Linux e WSL; no PowerShell, a ativação da venv e o `DATA_DIR=` mudam: veja os READMEs de `python/` e `api/`):

```bash
cd python
python3 -m venv .venv      # python3 anterior ao 3.11? use python3.13
source .venv/bin/activate  # no fish: source .venv/bin/activate.fish
pip install -r requirements.txt
pytest                     # no starter: 2 skipped
```

```bash
cd api
npm ci
cp .env.example .env
npm test          # 5 testes unitários passam
npm run test:e2e  # 2 testes e2e passam (usam a fixture)
DATA_DIR=test/fixtures/processed npm run start:dev  # http://localhost:3000/api/health → {"status":"ok"}
```

Sem `DATA_DIR=`, a API lê `data/processed/`, ainda vazia: **não sobe** e pede para gerar os dados. É esperado; até lá, use a *fixture* (8 alunos, 2 clusters).

```bash
cd web
npm ci
cp .env.example .env
npm run dev       # http://localhost:5173 → "Status da API: ok" (com a API no ar)
```

**Fluxo completo**, depois de implementar (em `python/`, com a `.venv` ativa):

```bash
python generate.py --n 1000 --seed 42 --reference-date 2026-09-30 --out ../data/raw
python cluster.py --input ../data/raw --out ../data/processed --seed 42
```

Depois suba a API com `npm run start:dev`, agora sem `DATA_DIR=` (ela lê `../data/processed` só na subida: gerou de novo, reinicie), e o dashboard.

## 6. Entrega

- **Ao finalizar, envie o projeto zipado para [desenvolvimento@amentoriaenem.com](mailto:desenvolvimento@amentoriaenem.com)**, com o seu nome no assunto. O `.zip` leva a pasta `.git` (o histórico de commits conta) e deve sair de um clone limpo, para ir só o que está commitado:

  ```bash
  # na pasta acima do projeto
  git clone <pasta-do-projeto> entrega-seu-nome
  zip -r entrega-seu-nome.zip entrega-seu-nome
  ```
- **Commits ao longo do trabalho**, com mensagem livre.
- **Commite** `data/raw/` e `data/processed/` gerados com seed 42 e N = 1000, e os lockfiles de `api/` e `web/`. Dependência Python nova vai com versão fixa no `requirements.txt`.
- **Não commite** `.env`, `node_modules` nem `.venv` (o `.gitignore` já cuida).
- **[`ENTREGA.md`](ENTREGA.md)** preenchido a partir do modelo (8 seções) e **[`python/ANALISE.md`](python/ANALISE.md)** preenchido.
- **Diff limpo:** sem debug esquecido, sem código morto, sem arquivos gerados fora de `data/` (como `dist/`).

**Antes de enviar**, descompacte o `.zip` numa pasta nova e siga o seu `ENTREGA.md` do zero.

## 7. Como vamos avaliar

| Eixo | Peso | O que observamos |
|---|---|---|
| Funciona de ponta a ponta pelo `ENTREGA.md` | 15 | gera, clusteriza, API sobe, dashboard mostra os dados |
| Geração dos dados | 15 | contrato do CSV, regras R1–R8, perfis com variação, reprodutibilidade |
| Clusterização e análise | 20 | features e nulos bem tratados, escala, escolha de k justificada, interpretação útil |
| API NestJS | 15 | contrato, validação e erros, regra de engajamento, organização |
| Dashboard | 20 | informações pedidas, estados de carregando/erro/vazio, formatos pt-BR, código legível |
| Código e testes | 10 | testes pedidos, clareza, nada fixo no código que deveria vir dos dados |
| Comunicação | 5 | `ENTREGA.md` e `ANALISE.md` claros, decisões e limitações honestas |

A conversa técnica tem avaliação própria e entra na decisão final. São 45 a 60 min, com o mesmo roteiro para todos, e você compartilha a tela com tudo rodando. Temas:

1. **Walkthrough:** como os dados vão do Python até a tela.
2. **Porquês:** o k, a padronização, o que cada cluster significa, o formato da API.
3. **Atalhos**, o que faria com mais tempo e o que mudaria com muito mais alunos.
4. **Mudança ao vivo** no seu repositório (um filtro, um campo ou uma regra), no seu editor, com IA se quiser.
5. **Leitura de código sem IA (10 a 15 min):** trechos curtos nossos; você diz o que fazem e se vê problema. Mais 2 ou 3 perguntas de conceito (ex.: por que padronizar antes do KMeans).
6. **Suas perguntas.**

Não precisa estudar além do que usou. Precisa de adaptação (mais tempo, fonte maior, pausas)? Avise.

## 8. Uso de IA

> **Uso de IA.** Você pode usar ferramentas de IA (ChatGPT, Copilot, Claude, Cursor etc.), como faria no trabalho. Usar IA não tira pontos. Pedimos duas coisas:
> 1. No `ENTREGA.md`, preencha a seção **"Uso de IA"**: quais ferramentas, em quais partes, e um exemplo de sugestão que você corrigiu ou descartou.
> 2. Esteja pronto para explicar e modificar qualquer parte do código na conversa técnica. Nela haverá um bloco curto (10 a 15 min) de leitura de código **sem IA**.
>
> Uso não declarado, ou não conseguir explicar partes centrais da entrega, pode encerrar o processo.

## 9. Dúvidas

Em {{CANAL_DE_DUVIDAS}}, com resposta do time de engenharia em até 1 dia útil. Perguntar não tira ponto. Se a resposta não chegar a tempo, decida, siga e registre a decisão no `ENTREGA.md`.

## 10. Seus dados e seu código

- **O código é seu.** Serve só para esta avaliação e não será usado em produção.
- **Guarda:** até o fim do processo seletivo. Depois apagamos as nossas cópias do seu código; ficam só seu nome, contato e resultado, por até 6 meses. Para pedir acesso ou exclusão antes: [desenvolvimento@amentoriaenem.com](mailto:desenvolvimento@amentoriaenem.com).
- **Dados 100% fictícios**, inventados pelo seu gerador (nomes do Faker ou `Aluno 0001`). Se um nome coincidir com o de alguém real, é só acaso.
- **Não use dados reais de ninguém** (seus, de colegas ou de bases públicas). Isso encerra o processo.

## 11. Segurança

- **Você só recebe este teste por e-mail do domínio oficial da Amentoria** (pacote em anexo ou num repositório da Amentoria), depois da conversa inicial. Há golpes de falso teste com scripts que roubam dados. Recebeu por outro caminho ou pediram para rodar algo fora do pacote? Não rode e confirme com quem fez a sua conversa inicial, nunca por um contato que só aparece no pacote.
- **Nenhum código nosso roda na instalação:** os `package.json` de `api/` e `web/` não têm `postinstall` nem `prepare`, e o `npm ci` instala as versões exatas dos lockfiles. Para barrar também scripts de terceiros, use `npm ci --ignore-scripts`.
