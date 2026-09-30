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
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler

CLUSTERS_K = 4

CLUSTERS = {
    0: {
        "name": "Focus on Exams and Essays",
        "description": "Last activity 9 days ago on average, 11.7 simulations (overall: 7.0), and 5.2 essays with an average score of 806 (overall: 724). Average accuracy of 0.72 and 91% attendance in mentorships."
    },

    1: {
        "name": "No Recorded Activity",
        "description": "96% have never had any activity (overall: 7.6%). Average tenure of 261 days (overall: 178), no lessons in the last 30 days, almost no simulations, and 3.0 missed mentorships (overall: 0.85)."
    },

    2: {
        "name": "Focus on Mentorships",
        "description": "Last activity 7 days ago, 13.9 lessons/30d, 96% mentorship attendance (0.3 missed). About 7 simulations; essay score 693 (overall 724)."
    },

    3: {
        "name": "Declining Engagement",
        "description": "Last activity 52 days ago on average (overall: 19), 1.2 lessons in the last 30 days, and 1.8 simulations. Average of 1.6 missed mentorships (overall: 0.85) and essay score of 568 (overall: 724)."
    },
}

INTEGER_COLUMNS = [
    "id", 
    "daysSinceLastActivity", 
    "lessonsLast30d", 
    "completedMentorships",
    "missedMentorships", 
    "simulationsTaken", 
    "essaysSubmitted",
    "tenureDays", 
    "clusterId"
]

FLOAT_COLUMNS = [
    "avgMentorshipRating", 
    "correctRateLanguages", 
    "correctRateHuman",
    "correctRateNature", 
    "correctRateMath", 
    "avgEssayScore"
]

FOUR_DECIMAL_COLUMNS = [
    "correctRateLanguages", 
    "correctRateHuman", 
    "correctRateNature", 
    "correctRateMath"
]

MEAN_COLUMNS = [
    "tenureDays", 
    "daysSinceLastActivity", 
    "lessonsLast30d", 
    "completedMentorships",
    "missedMentorships", 
    "avgMentorshipRating", 
    "simulationsTaken",
    "correctRateLanguages", 
    "correctRateHuman", 
    "correctRateNature",
    "correctRateMath", 
    "essaysSubmitted", 
    "avgEssayScore"
]

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
    # Calculates the mean and deviation
    scaler = StandardScaler()
    scaled = scaler.fit_transform(features)

    k_selection = []

    for k in range(2, 9):

        model = KMeans(n_clusters=k, n_init=10, random_state=args.seed)
        model.fit(scaled)

        # Defines how much homogeneous are the students compared to the cluster
        inertia = round(float(model.inertia_), 2)

        # Defines how much closes the students ir to the neighboor group
        silhouette = round(float(silhouette_score(scaled, model.labels_)), 4)

        k_selection.append({
            "k": k, 
            "inertia": inertia, 
            "silhouette": silhouette
        })

    # TODO 4: escolha k (args.k ou a sua regra entre 3 e 6, escrita num comentário e na
    #         seção 3 do ANALISE.md) e ajuste o modelo final.

    # k rule: between 3 e 6, increases k while the inertia falls at least 10% compared to the previouse k, until 6
    # With --k, use the given value.
    if args.k is not None:
        k = args.k
    else:
        inertias = {}
        for item in k_selection:
            inertias[item["k"]] = item["inertia"]

        k = 3
        for candidate in range(4, 7):
            drop = (inertias[candidate - 1] - inertias[candidate]) / inertias[candidate - 1]
            if drop >= 0.10:
                k = candidate
            else:
                break

    final_model = KMeans(n_clusters=k, n_init=10, random_state=args.seed)
    final_model.fit(scaled)
    students["clusterId"] = final_model.labels_
    
    # TODO 5: rode uma vez, olhe as médias de cada cluster da sua base (seed 42, N = 1000) e
    #         escreva à mão um dicionário com nome e descrição por id, por exemplo:
    #             CLUSTERS = {0: {"name": "...", "description": "..."}, ...}
    #         Ele só vale para o k que você olhou: com outro k, ou para um id fora dele, use
    #         o nome "Cluster N" (N = id) e uma descrição genérica. Os nomes precisam ser
    #         diferentes entre si; não precisa de regra que funcione com qualquer seed.
    # ta feito :), usei k = 4, a priori foi escolhido 3 mas APÓS analisar a tabela, foi testado com 4 e destacou-se uma maior distinção entre os grupos dos estudantes, acentuando suas ênfases


    # TODO 6: crie a pasta --out se ela não existir
    #         (pathlib.Path(args.out).mkdir(parents=True, exist_ok=True)) e escreva nela
    #         students.json e clusters.json.
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    students_json = []
    for i in range(len(students)):
        student = {}
        for column in students.columns:
            value = students[column][i]
            if pandas.isna(value):
                student[column] = None
            elif column in INTEGER_COLUMNS:
                student[column] = int(value)
            elif column in FLOAT_COLUMNS:
                student[column] = float(value)
            else:
                student[column] = str(value)
        students_json.append(student)

    students_file = open(out / "students.json", "w", encoding="utf-8")
    json.dump(students_json, students_file, ensure_ascii=False, indent=2, allow_nan=False)
    students_file.write("\n")
    students_file.close()

    clusters_json = []
    for cluster_id in range(k):
        cluster_students = students[students["clusterId"] == cluster_id]

        feature_means = {}
        for column in MEAN_COLUMNS:
            mean = cluster_students[column].mean()
            if pandas.isna(mean):
                feature_means[column] = None
            elif column in FOUR_DECIMAL_COLUMNS:
                feature_means[column] = round(float(mean), 4)
            else:
                feature_means[column] = round(float(mean), 2)

        if k == CLUSTERS_K and cluster_id in CLUSTERS:
            name = CLUSTERS[cluster_id]["name"]
            description = CLUSTERS[cluster_id]["description"]
        else:
            name = f"Cluster {cluster_id}"
            description = "Grupo de alunos com comportamento parecido, sem descrição escrita à mão."

        clusters_json.append({
            "clusterId": cluster_id,
            "name": name,
            "description": description,
            "size": len(cluster_students),
            "featureMeans": feature_means,
        })

    clusters_output = {
        "referenceDate": metadata["referenceDate"],
        "seed": args.seed,
        "studentCount": len(students),
        "k": k,
        "features": list(features.columns),
        "kSelection": k_selection,
        "clusters": clusters_json,
    }

    clusters_file = open(out / "clusters.json", "w", encoding="utf-8")
    json.dump(clusters_output, clusters_file, ensure_ascii=False, indent=2, allow_nan=False)
    clusters_file.write("\n")
    clusters_file.close()

    # TODO 7: só depois do ajuste, imprima a tabela cruzada cluster x profiles_truth.csv
    #         (comente na seção 5 do ANALISE.md).
    truth = pandas.read_csv(Path(args.input) / "profiles_truth.csv")
    merged = students[["id", "clusterId"]].merge(truth, on="id")
    print(pandas.crosstab(merged["clusterId"], merged["profile"]))

    return 0


if __name__ == "__main__":
    sys.exit(main())
