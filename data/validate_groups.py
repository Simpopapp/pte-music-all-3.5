#!/usr/bin/env python3
"""Valida data/wfd-groups.json contra data/wfd-dataset.json (project2)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
errors = []

with (ROOT / "wfd-groups.json").open(encoding="utf-8") as f:
    groups = json.load(f)

with (ROOT / "wfd-dataset.json").open(encoding="utf-8") as f:
    dataset = json.load(f)

# 1. parseia (chegou aqui) 2. 31 grupos
if not isinstance(groups, list) or len(groups) != 31:
    errors.append(f"esperados 31 grupos, encontrados {len(groups) if isinstance(groups, list) else type(groups)}")

# 3. arrays de strings nao vazios
for i, g in enumerate(groups, 1):
    if not isinstance(g, list) or not g or not all(isinstance(s, str) and s.strip() for s in g):
        errors.append(f"grupo {i}: nao é array de strings não vazio")

# 4. tamanhos 8-10
for i, g in enumerate(groups, 1):
    if not 8 <= len(g) <= 10:
        errors.append(f"grupo {i}: tamanho {len(g)} fora de 8-10")

# 5. total de frases
total = sum(len(g) for g in groups)
if total != 301:
    errors.append(f"total de frases {total} != 301")

# 6. fidelidade: frases identicas ao dataset, mesma ordem
expected = {}
for s in sorted(dataset, key=lambda x: (x["song_group"], x["id"])):
    expected.setdefault(s["song_group"], []).append(s["sentence"])
for i, g in enumerate(groups, 1):
    if g != expected.get(i):
        errors.append(f"grupo {i}: frases divergem do dataset original")

# 7. word_count confere
for s in dataset:
    wc = len(s["sentence"].split())
    if wc != s["word_count"]:
        errors.append(f"id {s['id']}: word_count {s['word_count']} != {wc}")

# 8. zero metadados: todos os elementos sao strings
for i, g in enumerate(groups, 1):
    for item in g:
        if not isinstance(item, str):
            errors.append(f"grupo {i}: elemento não-string {item!r}")
            break

if errors:
    print("FALHAS:")
    for e in errors:
        print(" -", e)
    raise SystemExit(1)
print("VALIDACAO OK")
