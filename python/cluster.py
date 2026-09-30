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

import json 
import pandas
from pathlib import Path


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

# TODO 2
def build_features(students):

    # Features
    days_since_last_activity_feature = []
    lessons_last_30d_feature = []
    attendance_rate_feature = []
    mentorships_usage_feature = []
    simulations_taken_feature = []
    avg_correct_rate_feature = []
    avg_essay_score_feature = []

    for i in range(len(students)):
        tenure_days = students["tenureDays"][i]

        days_since_last_activity = students["daysSinceLastActivity"][i]
        if pandas.isna(days_since_last_activity):
            days_since_last_activity_feature.append(tenure_days)
        else:
            days_since_last_activity_feature.append(days_since_last_activity)

        lessons_last_30d_feature.append(students["lessonsLast30d"][i])
        simulations_taken_feature.append(students["simulationsTaken"][i])

        completed_mentorships = students["completedMentorships"][i]
        missed_mentorships = students["missedMentorships"][i]
        total_mentorships = completed_mentorships + missed_mentorships

        if total_mentorships > 0:
            attendance_rate_feature.append(completed_mentorships / total_mentorships)
        else:
            attendance_rate_feature.append(None)

        if students["mentorshipFrequency"][i] == "monthly":
            cadence = 30
        else:
            cadence = 15
        max_mentorships = tenure_days // cadence + 1
        mentorships_usage_feature.append(total_mentorships / max_mentorships)

        if students["simulationsTaken"][i] > 0:
            rates_sum = (
                students["correctRateLanguages"][i]
                + students["correctRateHuman"][i]
                + students["correctRateNature"][i]
                + students["correctRateMath"][i]
            )
            avg_correct_rate_feature.append(rates_sum / 4)
        else:
            avg_correct_rate_feature.append(None)

        avg_essay_score = students["avgEssayScore"][i]
        if pandas.isna(avg_essay_score):
            avg_essay_score_feature.append(None)
        else:
            avg_essay_score_feature.append(avg_essay_score)

    features = pandas.DataFrame()

    features["daysSinceLastActivity"] = days_since_last_activity_feature
    features["lessonsLast30d"] = lessons_last_30d_feature
    features["attendanceRate"] = attendance_rate_feature
    features["mentorshipUsage"] = mentorships_usage_feature
    features["simulationsTaken"] = simulations_taken_feature
    features["avgCorrectRate"] = avg_correct_rate_feature
    features["avgEssayScore"] = avg_essay_score_feature

    for column in ["attendanceRate", "avgCorrectRate", "avgEssayScore"]:
        median = features[column].median()
        features[column] = features[column].fillna(median)

    return features


def main(argv=None):
    args = parse_args(argv)

    # TODO 1: leia students.csv e metadata.json de args.input e calcule tenureDays.
    dir_path = Path(args.input)
    students = pandas.read_csv(dir_path / "students.csv", dtype={"daysSinceLastActivity": "Int64"})

    file = open(dir_path / "metadata.json", encoding="utf-8")
    metadata = json.load(file)
    file.close()

    reference_date = pandas.to_datetime(metadata["referenceDate"])
    enrolled_at = pandas.to_datetime(students["enrolledAt"])
    students["tenureDays"] = (reference_date - enrolled_at).dt.days

    # TODO 2: monte as features e trate os nulos (explique na seção 2 do ANALISE.md).
    features = build_features(students)

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
