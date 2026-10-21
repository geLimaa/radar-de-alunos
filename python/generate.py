"""Etapa 1: gerar a base sintética de alunos.

Contrato do pipeline de geração de dados definido neste projeto. Resumo do que este
script deve fazer:

- gerar --n alunos fictícios, com as 21 colunas de students.csv na ordem do dicionário de dados;
- respeitar as regras de consistência R1 a R8;
- plantar pelo menos 3 perfis latentes de comportamento, com variação dentro de cada perfil,
  sem expor o perfil no students.csv;
- escrever em --out os arquivos students.csv, metadata.json e profiles_truth.csv;
- ser reprodutível: a mesma seed e os mesmos parâmetros geram arquivos idênticos
  (um único np.random.default_rng(seed), Faker com seed, nada de datetime.now()).

Uso (a partir da pasta python/):
    python generate.py --n 1000 --seed 42 --reference-date 2026-09-30 --out ../data/raw
"""

import argparse
import sys
from datetime import date, timedelta

import json
import numpy
import faker 
import pandas
from pathlib import Path

def iso_date(text):
    try:
        return date.fromisoformat(text)
    except ValueError:
        raise argparse.ArgumentTypeError(f"data inválida: {text!r} (use YYYY-MM-DD)")


def parse_args(argv=None):
    parser = argparse.ArgumentParser(
        description="Gera a base sintética de alunos: students.csv, metadata.json e profiles_truth.csv."
    )
    parser.add_argument("--n", type=int, default=1000,
                        help="quantidade de alunos, de 100 a 20000 (padrão: 1000)")
    parser.add_argument("--seed", type=int, default=42,
                        help="seed do gerador; a mesma seed gera arquivos idênticos (padrão: 42)")
    parser.add_argument("--reference-date", type=iso_date, default=date(2026, 9, 30),
                        help="data de referência R, no formato YYYY-MM-DD (padrão: 2026-09-30)")
    parser.add_argument("--out", default="../data/raw",
                        help="pasta de saída (padrão: ../data/raw)")
    return parser.parse_args(argv)

COLUMNS = [
    "id",
    "name",
    "state",
    "studyYear",
    "desiredCourse",
    "schoolType",
    "plan",
    "mentorshipFrequency",
    "enrolledAt",
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
    "avgEssayScore",
]

PROFILES = [
    {
        "name": "Pf1_Engaged",
        "weight": 0.25,
        "never": 0.0,
        "days_shift": 0,
        "days_scale": 4,
        "lessons_last_30d": 16,
        "mentorship_usage": 0.90,
        "mentorship_miss": 0.05,
        "mentorship_rating": 4.5,
        "simulations_taken": 8.0,
        "ability": 0.68,
        "essays_submitted": 4.0,
        "essay_score": 750
    },
    {
        "name": "Pf2_Inactive",
        "weight": 0.20,
        "never": 0.35,
        "days_shift": 60,
        "days_scale": 20,
        "lessons_last_30d": 2,
        "mentorship_usage": 0.50,
        "mentorship_miss": 0.45,
        "mentorship_rating": 3.4,
        "simulations_taken": 1.0,
        "ability": 0.42,
        "essays_submitted": 0.5,
        "essay_score": 500
    },
    {
        "name": "Pf3_Academic",
        "weight": 0.25,
        "never": 0.0,
        "days_shift": 5,
        "days_scale": 8,
        "lessons_last_30d": 12,
        "mentorship_usage": 0.80,
        "mentorship_miss": 0.10,
        "mentorship_rating": 4.3,
        "simulations_taken": 12.0,
        "ability": 0.70,
        "essays_submitted": 6.0,
        "essay_score": 800
    },
    {
        "name": "Pf4_Mentorship",
        "weight": 0.15,
        "never": 0.0,
        "days_shift": 2,
        "days_scale": 5,
        "lessons_last_30d": 14,
        "mentorship_usage": 0.95,
        "mentorship_miss": 0.03,
        "mentorship_rating": 4.7,
        "simulations_taken": 7.0,
        "ability": 0.55,
        "essays_submitted": 3.0,
        "essay_score": 700
    },
    {
        "name": "Pf5_Sporadic",
        "weight": 0.15,
        "never": 0.02,
        "days_shift": 20,
        "days_scale": 15,
        "lessons_last_30d": 6,
        "mentorship_usage": 0.65,
        "mentorship_miss": 0.25,
        "mentorship_rating": 3.9,
        "simulations_taken": 3.0,
        "ability": 0.50,
        "essays_submitted": 1.0,
        "essay_score": 600
    }
]

STATES = [
    ("SP", 17), 
    ("MG", 10), 
    ("RJ", 8), 
    ("ES", 2), 
    ("BA", 7), 
    ("CE", 7),
    ("PE", 4), 
    ("RN", 3), 
    ("PB", 3), 
    ("MA", 3), 
    ("PI", 3), 
    ("AL", 3),
    ("SE", 2), # SUDESTE + NORDESTE = 72%
    ("DF", 4), 
    ("GO", 4), 
    ("PA", 3), 
    ("PR", 3), 
    ("SC", 3),
    ("RS", 2), 
    ("AM", 2), 
    ("MT", 1), 
    ("MS", 1), 
    ("TO", 1), 
    ("AC", 1),
    ("AP", 1), 
    ("RO", 1), 
    ("RR", 1)
]

STUDY_YEARS = [
    ("high_school_3", 40), 
    ("high_school_2", 20), 
    ("high_school_1", 10),
    ("prep", 30)
]

DESIRED_COURSES = [
    ("medicine", 45), 
    ("law", 10), 
    ("engineering", 10), 
    ("dentistry", 7),
    ("psychology", 7), 
    ("nursing", 6), 
    ("other", 15)
]

SCHOOL_TYPES = [
    ("public", 55), 
    ("private", 45)
]

PLANS = [
    ("standard", 50), 
    ("premium", 35), 
    ("elite", 15)
]

MENTORSHIP_FREQUENCIES = [
    ("monthly", 75), 
    ("biweekly", 25)
]

CORRECT_RATES = [
    ("correctRateLanguages", 0.05),
    ("correctRateHuman", 0.04),
    ("correctRateNature", -0.04),
    ("correctRateMath", -0.05)
]

# TODO 3
def generate_students(args, rng, fake, selected_profiles):
    def parse_weighted_options(weighted_list):
        options = [item[0] for item in weighted_list]
        raw_weights = [item[1] for item in weighted_list]
        total = sum(raw_weights)
        normalized_weights = [w / total for w in raw_weights]
        return options, normalized_weights

    state_opts, state_weights = parse_weighted_options(STATES)
    study_opts, study_weights = parse_weighted_options(STUDY_YEARS)
    course_opts, course_weights = parse_weighted_options(DESIRED_COURSES)
    school_opts, school_weights = parse_weighted_options(SCHOOL_TYPES)
    plan_opts, plan_weights = parse_weighted_options(PLANS)
    freq_opts, freq_weights = parse_weighted_options(MENTORSHIP_FREQUENCIES)

    profile_map = {p["name"]: p for p in PROFILES}

    students_data = []
    truth_data = []

    for i in range(args.n):
        student_id = i + 1
        profile_name = str(selected_profiles[i])
        profile = profile_map[profile_name]

        name = fake.name()
        state = str(rng.choice(state_opts, p=state_weights))
        study_year = str(rng.choice(study_opts, p=study_weights))
        desired_course = str(rng.choice(course_opts, p=course_weights))
        school_type = str(rng.choice(school_opts, p=school_weights))
        plan = str(rng.choice(plan_opts, p=plan_weights))
        mentorship_freq = str(rng.choice(freq_opts, p=freq_weights))

        # R1: enrolledAt in [R - 365, R]
        tenure_days = int(rng.integers(0, 366))
        enrolled_at_date = args.reference_date - timedelta(days=tenure_days)

        # Inactive students (3%-10%)
        is_inactive = rng.random() < profile["never"]

        # R3: Inactive user stats [daysSinceLastActivity == Null]
        if is_inactive:
            days_since_last = None
            lessons_last_30d = 0
            simulations_taken = 0
            essays_submitted = 0
        else:
            # R2: daysSinceLastActivity in [0, tenureDays]
            days_since_last = int(profile["days_shift"] + rng.exponential(profile["days_scale"]))
            days_since_last = min(days_since_last, tenure_days)

            # R4: daysSinceLastActivity >= 30 or lessonsLast30d == 0
            if days_since_last >= 30:
                lessons_last_30d = 0
            else:
                lessons_last_30d = min(int(rng.poisson(profile["lessons_last_30d"])), 40)

            simulations_taken = int(rng.poisson(profile["simulations_taken"]))
            essays_submitted = int(rng.poisson(profile["essays_submitted"]))

        # Mentorships
        if mentorship_freq == "monthly":
            mentorships_frequency = 30
        else:
            mentorships_frequency = 15

        # R5: completedMentorships + missedMentorships ≤ floor(tenureDays / mentorships_frequency) + 1
        max_mentorships_num = tenure_days // mentorships_frequency + 1
        scheduled_mentorships = int(rng.binomial(max_mentorships_num, profile["mentorship_usage"]))
        missed_mentorships = int(rng.binomial(scheduled_mentorships, profile["mentorship_miss"]))
        completed_mentorships = scheduled_mentorships - missed_mentorships

        # R6
        if completed_mentorships > 0:
            avg_mentorship_rating = round(
                float(numpy.clip(rng.normal(profile["mentorship_rating"], 0.5), 1, 5)), 2
            )
        else:
            avg_mentorship_rating = None

        # R7
        if simulations_taken > 0:
            ability = rng.normal(profile["ability"], 0.08)
            correct_rates = {
                column: round(float(numpy.clip(ability + offset + rng.normal(0, 0.05), 0.15, 0.95)), 4)
                for column, offset in CORRECT_RATES
            }
        else:
            correct_rates = {column: None for column, _ in CORRECT_RATES}

        # R8
        if essays_submitted > 0:
            avg_essay_score = round(
                float(numpy.clip(rng.normal(profile["essay_score"], 90), 0, 1000)), 1
            )
        else:
            avg_essay_score = None

        students_data.append({
            "id": student_id,
            "name": name,
            "state": state,
            "studyYear": study_year,
            "desiredCourse": desired_course,
            "schoolType": school_type,
            "plan": plan,
            "mentorshipFrequency": mentorship_freq,
            "enrolledAt": enrolled_at_date.isoformat(),
            "daysSinceLastActivity": days_since_last,
            "lessonsLast30d": lessons_last_30d,
            "completedMentorships": completed_mentorships,
            "missedMentorships": missed_mentorships,
            "avgMentorshipRating": avg_mentorship_rating,
            "simulationsTaken": simulations_taken,
            **correct_rates,
            "essaysSubmitted": essays_submitted,
            "avgEssayScore": avg_essay_score,
        })

        truth_data.append({"id": student_id, "profile": profile_name})

    return students_data, truth_data

def main(argv=None):
    args = parse_args(argv)

    # TODO 1 
    rng = numpy.random.default_rng(args.seed)
    fake = faker.Faker("pt_BR")
    fake.seed_instance(args.seed)

    # TODO 2
    profiles_name = [p["name"] for p in PROFILES]
    profiles_weight = [p["weight"] for p in PROFILES]

    selected_profiles = rng.choice(profiles_name, size=args.n, p=profiles_weight)

    # TODO 3
    students_data, truth_data = generate_students(args, rng, fake, selected_profiles)

    students = pandas.DataFrame(students_data, columns=COLUMNS)
    students["daysSinceLastActivity"] = students["daysSinceLastActivity"].astype("Int64")
    truth = pandas.DataFrame(truth_data, columns=["id", "profile"])

    # TODO 4 
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    students.to_csv(out / "students.csv", index=False, lineterminator="\n")
    truth.to_csv(out / "profiles_truth.csv", index=False, lineterminator="\n")

    # TODO 5
    metadata = {
        "seed": args.seed,
        "students": args.n,
        "referenceDate": args.reference_date.isoformat(),
    }
    (out / "metadata.json").write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")

    return 0


if __name__ == "__main__":
    sys.exit(main())
