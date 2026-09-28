# Análise dos clusters

> Modelo. Troque as dicas (linhas com `>`) pelo seu texto; tabelas e frases curtas bastam.
> Use os números da sua base: seed 42 e N = 1000.

## 1. Perfis plantados

> Um perfil por linha: nome, % da base e as colunas que ele altera (e como). Diga em uma frase
> como criou variação dentro do perfil.

| Perfil | % da base | Colunas afetadas e como |
|---|---|---|
| | | |

## 2. Features, nulos e escala

> As features do KMeans (pelo menos 5) e por que cada uma ajuda a separar os alunos. Para cada
> nulo: o que ele significa e o que vira. Por que padronizou e o que ficou de fora.

| Feature | Por quê | Nulo vira |
|---|---|---|
| | | |

## 3. Escolha de k

> Copie os números do `kSelection` do seu `clusters.json`. Justifique o k com a inércia
> (cotovelo), a silhouette **e** a utilidade para o time de Sucesso do Aluno; "maior silhouette"
> sozinho não basta. Escreva a regra que o `cluster.py` usa sem `--k`.

| k | Inércia | Silhouette |
|---|---|---|
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |
| 6 | | |
| 7 | | |
| 8 | | |

## 4. Clusters

> Uma linha por cluster: nome, tamanho (e %), 3 médias com a média geral entre parênteses e uma
> ação concreta para o time de CS (o que fazer e com quem). Os nomes são os que você escreveu
> no `cluster.py` olhando estas médias.

| Cluster | Tamanho | Média 1 (geral) | Média 2 (geral) | Média 3 (geral) | Ação para o CS |
|---|---|---|---|---|---|
| | | | | | |

## 5. Tabela cruzada cluster × perfil plantado

> Contagem de alunos por cluster (linhas) e perfil do `profiles_truth.csv` (colunas). Comente:
> cada cluster concentra um perfil? Se mistura dois, por quê? (Opcional: o ARI,
> `sklearn.metrics.adjusted_rand_score`, resume a concordância num número, de ~0 = acaso a
> 1 = mesmos grupos; só para comentar, nunca para escolher k.)
> Feche com 1 limitação honesta da abordagem e o que faria para reduzi-la.

**Limitação:**
