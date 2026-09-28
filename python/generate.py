"""Etapa 1: gerar a base sintética de alunos.

Contrato completo em ../docs/01-dados-e-clusters.md (seção "Etapa 1"). Resumo do que este
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
from datetime import date


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


def main(argv=None):
    args = parse_args(argv)

    # TODO 1: crie um único gerador aleatório com a seed (np.random.default_rng(args.seed))
    #         e um Faker("pt_BR") com a mesma seed, se for usar nomes do Faker.
    # TODO 2: defina os perfis latentes (pelo menos 3) e sorteie um perfil para cada aluno
    #         (descreva-os na seção 1 do ANALISE.md).
    # TODO 3: sorteie os campos categóricos e os numéricos de cada aluno, respeitando R1 a R8.
    # TODO 4: crie a pasta --out se ela não existir
    #         (pathlib.Path(args.out).mkdir(parents=True, exist_ok=True)) e escreva nela
    #         students.csv no formato pedido (nulo = célula vazia, int sem ".0",
    #         float arredondado para as casas do dicionário de dados).
    # TODO 5: escreva metadata.json ({"seed", "students", "referenceDate"}) e profiles_truth.csv (id,profile).

    print("TODO: implemente a geração dos dados em generate.py "
          "(veja ../docs/01-dados-e-clusters.md).", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
