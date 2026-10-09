#!/usr/bin/env python3
"""Valida data/wfd-dataset.json contra as regras do PRD (prd-project1.md).

Checa: parse JSON, id/priority_rank sequenciais 1..N, word_count == nº de
palavras, sentence com pontuação final, topic presente, song_group contíguo
com lotes de 8 a 10 frases, e ausência de duplicatas exatas.

Uso: python3 data/validate_wfd.py [caminho/do/dataset.json]
"""
import json
import re
import sys
from itertools import groupby

DEFAULT_PATH = "data/wfd-dataset.json"


def validate(path: str) -> list[str]:
    with open(path, encoding="utf-8") as f:
        ds = json.load(f)
    errs: list[str] = []
    if not isinstance(ds, list) or not ds:
        return ["raiz não é array não-vazio"]

    for i, e in enumerate(ds, 1):
        if e.get("id") != i:
            errs.append(f"id quebrado em {i}: {e.get('id')}")
        if e.get("priority_rank") != i:
            errs.append(f"priority_rank não monotônico em {i}")
        s = e.get("sentence", "")
        if not isinstance(s, str) or not s.strip():
            errs.append(f"sentença vazia em {i}")
        elif not re.search(r"[.?!]$", s):
            errs.append(f"pontuação final ausente em {i}: {s[:40]}")
        if e.get("word_count") != len(s.split()):
            errs.append(f"word_count divergente em {i}")
        if not isinstance(e.get("topic"), str) or not e["topic"]:
            errs.append(f"topic ausente em {i}")
        if not isinstance(e.get("song_group"), int):
            errs.append(f"song_group inválido em {i}")

    groups = {g: len(list(x)) for g, x in groupby(ds, key=lambda e: e["song_group"])}
    if sorted(groups) != list(range(1, len(groups) + 1)):
        errs.append("song_group não contíguo")
    bad = {g: s for g, s in groups.items() if not (8 <= s <= 10)}
    if bad:
        errs.append(f"lotes fora de 8-10: {bad}")

    seen: set[str] = set()
    for e in ds:
        k = re.sub(r"[^a-z0-9 ]", "", e["sentence"].lower()).strip()
        if k in seen:
            errs.append(f"duplicata: {e['sentence'][:50]}")
        seen.add(k)
    return errs


if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_PATH
    errors = validate(path)
    print(f"total: {len(json.load(open(path, encoding='utf-8')))} entradas em {path}")
    if errors:
        print("ERROS:")
        for x in errors[:20]:
            print(" -", x)
        sys.exit(1)
    print("VALIDACAO OK — nenhuma falha.")
