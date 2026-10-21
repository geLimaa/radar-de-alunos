# Python: dados e clusters

O pipeline de geração e clusterização está implementado neste diretório.

Os dois scripts já têm os parâmetros de linha de comando. Enquanto não forem implementados,
eles só imprimem um `TODO` e saem com código 1.

Requisito: Python 3.11 ou mais novo. Testamos no 3.13, que é a versão do `.python-version`
da raiz. Confira com `python3 --version` (no Windows, `py --list` mostra as versões
instaladas). Rode tudo a partir desta pasta (`python/`): os caminhos padrão
(`../data/raw` e `../data/processed`) são relativos a ela.

## macOS, Linux e WSL

```bash
cd python
python3 -m venv .venv            # se python3 for mais antigo que 3.11, use python3.13 (ou 3.12, 3.11)
source .venv/bin/activate        # no fish: source .venv/bin/activate.fish
pip install -r requirements.txt

python generate.py --n 1000 --seed 42 --reference-date 2026-09-30 --out ../data/raw
python cluster.py --input ../data/raw --out ../data/processed --seed 42
pytest
```

## Windows (PowerShell)

```powershell
cd python
py -3.13 -m venv .venv          # ou -3.12 / -3.11, conforme o que estiver instalado
.venv\Scripts\Activate.ps1
pip install -r requirements.txt

python generate.py --n 1000 --seed 42 --reference-date 2026-09-30 --out ..\data\raw
python cluster.py --input ..\data\raw --out ..\data\processed --seed 42
pytest
```

Se o PowerShell bloquear o `Activate.ps1`, rode antes
`Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`.

## Dicas

- `python generate.py --help` e `python cluster.py --help` mostram os parâmetros.
- No projeto, `pytest` passa com 2 testes marcados como *skipped*. Ao implementar, tire o
  `pytest.skip("TODO")`.
- `ANALISE.md` é o modelo da sua análise (5 seções); preencha depois de rodar o `cluster.py`.
- Nomes dos clusters: rode o `cluster.py` uma vez, olhe as médias de cada cluster, escreva os
  nomes e as descrições num dicionário por id e rode de novo (detalhes no item 7 da seção 2.2
  do documentação do pipeline).
- Não versione a `.venv`. Versione `data/raw/` e `data/processed/` gerados com seed 42 e
  N = 1000.
