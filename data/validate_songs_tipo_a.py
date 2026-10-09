#!/usr/bin/env python3
"""Valida as estruturas musicais do tipo A (project6).

Regras:
- 31 pastas em data/songs/tipo-a/grupo-{NN}/ com letra.txt e estilo.txt
- letra.txt: contem as frases do grupo INTACTAS (palavra a palavra) e >= ~2000 chars
- estilo.txt: <= 200 chars, sem colchetes
- Instrucoes de performance em ingles (heuristica: presenca de tags [ ])
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SONGS = ROOT / "data" / "songs" / "tipo-a"
_raw = json.loads((ROOT / "data" / "wfd-groups-a.json").read_text(encoding="utf-8"))
GROUPS = _raw["groups"] if isinstance(_raw, dict) else _raw

def normalize(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip().lower()

def main() -> int:
    errors: list[str] = []
    if len(GROUPS) != 31:
        print(f"ERRO: dataset tipo A deveria ter 31 grupos, tem {len(GROUPS)}")
        return 1

    total_sentences = 0
    for idx, sentences in enumerate(GROUPS, start=1):
        total_sentences += len(sentences)
        folder = SONGS / f"grupo-{idx:02d}"
        letra_p = folder / "letra.txt"
        estilo_p = folder / "estilo.txt"
        if not letra_p.is_file():
            errors.append(f"grupo-{idx:02d}: letra.txt ausente")
            continue
        if not estilo_p.is_file():
            errors.append(f"grupo-{idx:02d}: estilo.txt ausente")
            continue

        letra = letra_p.read_text(encoding="utf-8")
        estilo = estilo_p.read_text(encoding="utf-8")
        letra_norm = normalize(letra)

        for s in sentences:
            if normalize(s) not in letra_norm:
                errors.append(f"grupo-{idx:02d}: frase ausente ou alterada: {s!r}")

        if len(letra) < 1800:
            errors.append(f"grupo-{idx:02d}: letra.txt muito curta ({len(letra)} chars; alvo ~2000)")
        if "[" not in letra:
            errors.append(f"grupo-{idx:02d}: letra.txt sem tags Suno (instrucoes de performance)")
        if len(estilo) > 200:
            errors.append(f"grupo-{idx:02d}: estilo.txt com {len(estilo)} chars (max 200)")
        if "[" in estilo or "]" in estilo:
            errors.append(f"grupo-{idx:02d}: estilo.txt nao deve conter colchetes")
        if not estilo.strip():
            errors.append(f"grupo-{idx:02d}: estilo.txt vazio")

    if errors:
        print("VALIDACAO FALHOU:")
        for e in errors:
            print(f"  - {e}")
        return 1
    print(f"VALIDACAO OK — 31 grupos x 2 txt, fidelidade palavra a palavra confirmada ({total_sentences} frases).")
    return 0

if __name__ == "__main__":
    sys.exit(main())
