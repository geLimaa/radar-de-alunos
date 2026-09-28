"""Testes da geração dos dados. Os dois abaixo são o mínimo pedido; remova o skip ao implementar.

Dica: a pasta python/ já está no caminho de import (pytest.ini), então dá para fazer
`import generate` e chamar `generate.main([...])` com uma pasta temporária (fixture tmp_path).
"""

import pytest


def test_same_seed_generates_identical_files(tmp_path):
    # Esboço:
    # 1. gere duas vezes com a mesma seed, em tmp_path / "a" e tmp_path / "b";
    # 2. compare os bytes de students.csv, metadata.json e profiles_truth.csv.
    pytest.skip("TODO")


def test_consistency_rules_hold(tmp_path):
    # Esboço:
    # 1. gere uma base com N pequeno em tmp_path e leia o students.csv;
    # 2. calcule tenureDays a partir de enrolledAt e da referenceDate do metadata.json;
    # 3. confira as regras R2, R3, R5 e R6 em todas as linhas.
    pytest.skip("TODO")
