#!/usr/bin/env python3
"""Gera src/data/wfd-songs-c.ts a partir de data/songs/tipo-c/ (fonte da verdade)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SONGS = ROOT / "data" / "songs" / "tipo-c"

items = []
for idx in range(1, 12):
    folder = SONGS / f"grupo-{idx:02d}"
    letra = (folder / "letra.txt").read_text(encoding="utf-8").strip()
    estilo = (folder / "estilo.txt").read_text(encoding="utf-8").strip()
    items.append({"group": idx, "letra": letra, "estilo": estilo})

out = "// Gerado por data/generate_songs_module.py — não editar manualmente.\n"
out += "// Estruturas musicais Suno V5 para os grupos do tipo C (project4).\n"
out += "export interface WfdSong {\n  group: number;\n  letra: string;\n  estilo: string;\n}\n\n"
out += "export const wfdSongsC: WfdSong[] = " + json.dumps(items, ensure_ascii=False, indent=2) + ";\n"

target = ROOT / "src" / "data" / "wfd-songs-c.ts"
target.write_text(out, encoding="utf-8")
print(f"OK: {target} ({len(items)} músicas)")
