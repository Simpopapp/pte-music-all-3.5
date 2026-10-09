#!/usr/bin/env python3
"""Gera data/wfd-groups.json a partir de data/wfd-dataset.json.

Saida: array de 31 arrays de strings — apenas as frases, sem metadados,
na ordem song_group crescente e id crescente dentro de cada grupo.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "wfd-dataset.json"
DST = ROOT / "wfd-groups.json"

with SRC.open(encoding="utf-8") as f:
    dataset = json.load(f)

ordered = sorted(dataset, key=lambda s: (s["song_group"], s["id"]))
groups = []
for entry in ordered:
    g = entry["song_group"]
    if len(groups) < g:
        groups.extend([] for _ in range(g - len(groups)))
    groups[g - 1].append(entry["sentence"])

with DST.open("w", encoding="utf-8") as f:
    json.dump(groups, f, ensure_ascii=False, indent=2)
    f.write("\n")

print(f"OK: {len(groups)} grupos, {sum(len(g) for g in groups)} frases -> {DST}")
