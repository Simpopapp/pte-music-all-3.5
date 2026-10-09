#!/usr/bin/env python3
"""Valida as 3 versões de grupos do project3 (Fase 2/4).

Para cada versão (A/B/C):
1. Parseia como JSON; array externo de arrays de strings não vazios.
2. Totais: A = 31 grupos, B = 16, C = 11; 301 frases em cada.
3. Tamanhos: A entre 8 e 10; B = 15x20 + 1x1; C = 10x30 + 1x1.
4. Fidelidade: concatenação dos grupos idêntica, frase a frase e na ordem,
   às sentence do dataset por id crescente.
5. Tipo A idêntico ao data/wfd-groups.json original.

Saída: VALIDACAO OK ou listagem de falhas (exit 1).
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
FILES = {
    "A": ROOT / "wfd-groups-a.json",
    "B": ROOT / "wfd-groups-b.json",
    "C": ROOT / "wfd-groups-c.json",
}
ORIGINAL = ROOT / "wfd-groups.json"
EXPECTED_COUNTS = {"A": 31, "B": 16, "C": 11}

errors: list[str] = []

with (ROOT / "wfd-dataset.json").open(encoding="utf-8") as f:
    dataset = json.load(f)
expected_sequence = [s["sentence"] for s in sorted(dataset, key=lambda s: s["id"])]

with ORIGINAL.open(encoding="utf-8") as f:
    original = json.load(f)

for version, path in FILES.items():
    try:
        with path.open(encoding="utf-8") as f:
            groups = json.load(f)
    except FileNotFoundError:
        errors.append(f"Tipo {version}: arquivo ausente {path.name}")
        continue
    except json.JSONDecodeError as e:
        errors.append(f"Tipo {version}: JSON inválido ({e})")
        continue

    if not isinstance(groups, list) or not groups:
        errors.append(f"Tipo {version}: raiz não é array não vazio")
        continue
    for i, g in enumerate(groups, 1):
        if not isinstance(g, list) or not g:
            errors.append(f"Tipo {version} grupo {i}: não é array não vazio")
            break
        for item in g:
            if not isinstance(item, str) or not item.strip():
                errors.append(f"Tipo {version} grupo {i}: elemento não-string ou vazio")
                break

    if len(groups) != EXPECTED_COUNTS[version]:
        errors.append(
            f"Tipo {version}: esperados {EXPECTED_COUNTS[version]} grupos, "
            f"encontrados {len(groups)}"
        )

    total = sum(len(g) for g in groups if isinstance(g, list))
    if total != 301:
        errors.append(f"Tipo {version}: total de frases {total} != 301")

    sizes = [len(g) for g in groups if isinstance(g, list)]
    if version == "A":
        for i, n in enumerate(sizes, 1):
            if not 8 <= n <= 10:
                errors.append(f"Tipo A grupo {i}: tamanho {n} fora de 8-10")
    elif version == "B":
        if sizes != [20] * 15 + [1]:
            errors.append(f"Tipo B: tamanhos {sizes} != 15x20 + 1x1")
    elif version == "C":
        if sizes != [30] * 10 + [1]:
            errors.append(f"Tipo C: tamanhos {sizes} != 10x30 + 1x1")

    flat = [s for g in groups if isinstance(g, list) for s in g if isinstance(s, str)]
    if flat != expected_sequence:
        errors.append(f"Tipo {version}: sequência difere do dataset por id crescente")

    if version == "A" and groups != original:
        errors.append("Tipo A: difere do data/wfd-groups.json original")

if errors:
    print("FALHAS:")
    for e in errors:
        print(" -", e)
    raise SystemExit(1)
print("VALIDACAO OK")
