"""Testes da geração dos dados. Os dois abaixo são o mínimo pedido; remova o skip ao implementar.

Dica: a pasta python/ já está no caminho de import (pytest.ini), então dá para fazer
`import generate` e chamar `generate.main([...])` com uma pasta temporária (fixture tmp_path).
"""

import pytest
import json
import pandas
import generate

FILES = ["students.csv", "metadata.json", "profiles_truth.csv"]

def run(out, seed=42, n=200):
    generate.main([
        "--n", str(n),
        "--seed", str(seed),
        "--reference-date", "2026-09-30",
        "--out", str(out),
    ])

def test_same_seed_generates_identical_files(tmp_path):
    run(tmp_path / "a")
    run(tmp_path / "b")
    for name in FILES:
        assert (tmp_path / "a" / name).read_bytes() == (tmp_path / "b" / name).read_bytes()


def test_consistency_rules_hold(tmp_path):
    run(tmp_path)
    df = pandas.read_csv(tmp_path / "students.csv", dtype={"daysSinceLastActivity": "Int64"})
    metadata = json.loads((tmp_path / "metadata.json").read_text(encoding="utf-8"))
    reference = pandas.Timestamp(metadata["referenceDate"])
    tenure = (reference - pandas.to_datetime(df["enrolledAt"])).dt.days

    days = df["daysSinceLastActivity"]
    never = days.isna()
    active = ~never
    assert never.any()
    assert (days[active] >= 0).all()
    assert (days[active] <= tenure[active]).all()

    counts = df.loc[never, ["lessonsLast30d", "simulationsTaken", "essaysSubmitted"]]
    assert (counts == 0).all().all()

    cadence = df["mentorshipFrequency"].map({"monthly": 30, "biweekly": 15})
    total = df["completedMentorships"] + df["missedMentorships"]
    assert (total <= tenure // cadence + 1).all()

    no_completed = df["completedMentorships"] == 0
    assert no_completed.any()
    assert (df["avgMentorshipRating"].isna() == no_completed).all()