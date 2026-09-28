"""Etapa 2: clusterizar os alunos.

Contrato completo em ../docs/01-dados-e-clusters.md (seção "Etapa 2"). Resumo do que este
script deve fazer:

- ler students.csv e metadata.json de --input (a data de referência vem do metadata.json);
- não usar profiles_truth.csv para ajustar o modelo;
- montar pelo menos 5 features numéricas, com uma regra documentada para os nulos
  ("nunca ativo" não é "0 dias" e "sem simulado" não é "acerto 0");
- padronizar (StandardScaler, de preferência num Pipeline) e rodar
  KMeans(n_clusters=k, n_init=10, random_state=seed);
- calcular inércia e silhouette para k = 2..8 (sempre, mesmo com --k) e, sem --k, escolher k
  entre 3 e 6 por uma regra documentada; com --k, usar o valor dado;
- dar nome (até 40 caracteres, diferentes entre si) e descrição (até 200) a cada cluster,
  escritos à mão num dicionário depois de olhar as médias da sua base (seed 42, N = 1000);
  com outro k ou um id fora do dicionário, usar "Cluster N";
- escrever em --out os arquivos students.json e clusters.json no formato do contrato
  (o campo seed do clusters.json é o --seed);
- depois do ajuste, comparar os clusters com profiles_truth.csv numa tabela cruzada.

Uso (a partir da pasta python/):
    python cluster.py --input ../data/raw --out ../data/processed --seed 42 [--k K]
"""

import argparse
import sys


def parse_args(argv=None):
    parser = argparse.ArgumentParser(
        description="Clusteriza os alunos e gera students.json e clusters.json."
    )
    parser.add_argument("--input", default="../data/raw",
                        help="pasta com students.csv e metadata.json (padrão: ../data/raw)")
    parser.add_argument("--out", default="../data/processed",
                        help="pasta de saída (padrão: ../data/processed)")
    parser.add_argument("--seed", type=int, default=42,
                        help="random_state do KMeans e campo seed do clusters.json (padrão: 42)")
    parser.add_argument("--k", type=int, default=None,
                        help="número de clusters; sem ele, k é escolhido entre 3 e 6 por uma regra documentada")
    return parser.parse_args(argv)


def main(argv=None):
    args = parse_args(argv)

    # TODO 1: leia students.csv e metadata.json de args.input e calcule tenureDays.
    # TODO 2: monte as features e trate os nulos (explique na seção 2 do ANALISE.md).
    # TODO 3: padronize e calcule inércia e silhouette para k = 2..8 com random_state=args.seed.
    # TODO 4: escolha k (args.k ou a sua regra entre 3 e 6, escrita num comentário e na
    #         seção 3 do ANALISE.md) e ajuste o modelo final.
    # TODO 5: rode uma vez, olhe as médias de cada cluster da sua base (seed 42, N = 1000) e
    #         escreva à mão um dicionário com nome e descrição por id, por exemplo:
    #             CLUSTERS = {0: {"name": "...", "description": "..."}, ...}
    #         Ele só vale para o k que você olhou: com outro k, ou para um id fora dele, use
    #         o nome "Cluster N" (N = id) e uma descrição genérica. Os nomes precisam ser
    #         diferentes entre si; não precisa de regra que funcione com qualquer seed.
    # TODO 6: crie a pasta --out se ela não existir
    #         (pathlib.Path(args.out).mkdir(parents=True, exist_ok=True)) e escreva nela
    #         students.json e clusters.json.
    # TODO 7: só depois do ajuste, imprima a tabela cruzada cluster x profiles_truth.csv
    #         (comente na seção 5 do ANALISE.md).

    print("TODO: implemente a clusterização em cluster.py "
          "(veja ../docs/01-dados-e-clusters.md).", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
