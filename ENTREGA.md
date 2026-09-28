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
| 1. Gerar os dados (`python/generate.py`) | | |
| 2. Clusterização e análise (`python/cluster.py`, `python/ANALISE.md`) | | |
| 3. API (`api/`) | | |
| 4. Dashboard (`web/`) | | |

## 2. Como rodar

<!--
Estes são os comandos do starter. Ajuste ao que você fez e TESTE numa cópia limpa:
descompacte o .zip da entrega numa pasta nova e siga esta seção do zero, sem pular nada.
-->

Versões que usei: Python `x.y`, Node `x.y`.

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
```

## 4. Decisões e trade-offs

<!--
Suas escolhas e o porquê, em tópicos: perfis do gerador, imputação, features, regra do k,
como a API guarda e filtra os dados, como o front busca os dados.
Trade-off = o que você ganhou e do que abriu mão.
Inclua as dúvidas que você decidiu sozinho (resposta que não chegou a tempo ou ponto ambíguo nos docs).
-->

-

## 5. O que ficou de fora e por quê

<!-- O que o enunciado pede e ficou faltando ou pela metade, e o motivo. -->

-

## 6. O que faria com mais tempo

<!-- Próximos passos, em ordem de prioridade. -->

-

## 7. Uso de IA

<!-- Obrigatório (veja a seção 8 do README). Se não usou, escreva "Não usei". -->

- **Ferramentas:**
- **Em quais partes:**
- **Uma sugestão que corrigi ou descartei:** <!-- o que a IA sugeriu, o que estava errado ou não servia, e o que você fez no lugar -->

## 8. Tempo gasto (opcional)

<!-- Aproximado. Não vale ponto: serve para calibrarmos o tamanho do teste. -->

| Etapa | Tempo |
|---|---|
| Leitura e setup | |
| 1. Gerar os dados | |
| 2. Clusterização e análise | |
| 3. API | |
| 4. Dashboard | |
| `ENTREGA.md` | |
| **Total** | |
