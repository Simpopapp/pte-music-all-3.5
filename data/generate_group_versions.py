#!/usr/bin/env python3
"""Gera as 3 versões de separação de grupos do project3 (Fase 2).

Origem: data/wfd-dataset.json (301 frases, id 1..301).
- Tipo A: agrupamento por song_group (idêntico ao data/wfd-groups.json).
- Tipo B: fatias fixas de 20 frases sobre a sequência ordenada por id.
- Tipo C: fatias fixas de 30 frases sobre a sequência ordenada por id.

Saídas:
- data/wfd-groups-a.json, data/wfd-groups-b.json, data/wfd-groups-c.json
  (array de arrays de strings, apenas frases, UTF-8 sem BOM,
  ensure_ascii=False, indent=2 + newline final).
- src/data/wfd-groups-a.ts, src/data/wfd-groups-b.ts, src/data/wfd-groups-c.ts
  (mesmo formato do src/data/wfd-groups.ts atual).
- src/data/wfd-group-versions.ts (mapa de metadados das 3 versões).

Determinístico: nenhuma aleatoriedade, ordem estável por id crescente.
Não altera data/wfd-dataset.json nem data/wfd-groups.json.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent
SRC = ROOT / "wfd-dataset.json"
DST = {
    "A": ROOT / "wfd-groups-a.json",
    "B": ROOT / "wfd-groups-b.json",
    "C": ROOT / "wfd-groups-c.json",
}
TS_DST = {
    "A": REPO / "src" / "data" / "wfd-groups-a.ts",
    "B": REPO / "src" / "data" / "wfd-groups-b.ts",
    "C": REPO / "src" / "data" / "wfd-groups-c.ts",
}
VERSIONS_TS = REPO / "src" / "data" / "wfd-group-versions.ts"

EXPORT_NAMES = {"A": "wfdGroupsA", "B": "wfdGroupsB", "C": "wfdGroupsC"}
CHUNK = {"B": 20, "C": 30}


def to_ts(groups: list[list[str]], export_name: str, version: str, chunk_desc: str) -> str:
    payload = json.dumps(groups, ensure_ascii=False, indent=2)
    return (
        f"// Gerado por data/generate_group_versions.py — não editar manualmente.\n"
        f"// Versão {version} ({chunk_desc}): {len(groups)} grupos, "
        f"{sum(len(g) for g in groups)} frases.\n"
        f"export const {export_name}: string[][] = {payload};\n"
    )


def main() -> None:
    with SRC.open(encoding="utf-8") as f:
        dataset = json.load(f)

    by_id = sorted(dataset, key=lambda s: s["id"])
    sequence = [s["sentence"] for s in by_id]

    # Tipo A: por song_group, id crescente dentro do grupo
    ordered = sorted(dataset, key=lambda s: (s["song_group"], s["id"]))
    groups_a: list[list[str]] = []
    for entry in ordered:
        g = entry["song_group"]
        if len(groups_a) < g:
            groups_a.extend([] for _ in range(g - len(groups_a)))
        groups_a[g - 1].append(entry["sentence"])

    # Tipos B e C: fatias fixas da sequência global
    def chunks(seq: list[str], size: int) -> list[list[str]]:
        return [seq[i : i + size] for i in range(0, len(seq), size)]

    groups_b = chunks(sequence, CHUNK["B"])
    groups_c = chunks(sequence, CHUNK["C"])

    all_groups = {"A": groups_a, "B": groups_b, "C": groups_c}
    descs = {
        "A": "lotes originais do dataset (song_group)",
        "B": f"fatias de {CHUNK['B']}",
        "C": f"fatias de {CHUNK['C']}",
    }

    for version, groups in all_groups.items():
        with DST[version].open("w", encoding="utf-8", newline="\n") as f:
            json.dump(groups, f, ensure_ascii=False, indent=2)
            f.write("\n")
        ts = to_ts(groups, EXPORT_NAMES[version], version, descs[version])
        TS_DST[version].parent.mkdir(parents=True, exist_ok=True)
        with TS_DST[version].open("w", encoding="utf-8", newline="\n") as f:
            f.write(ts)

    versions_ts = """// Gerado por data/generate_group_versions.py — não editar manualmente.
// Metadados das 3 versões de separação de grupos (project3).
import { wfdGroupsA } from "./wfd-groups-a";
import { wfdGroupsB } from "./wfd-groups-b";
import { wfdGroupsC } from "./wfd-groups-c";

export type GroupVersionId = "A" | "B" | "C";

export interface GroupVersion {
  id: GroupVersionId;
  label: string;
  shortLabel: string;
  chunkDescription: string;
  groupCount: number;
  sentenceCount: number;
  groups: string[][];
}

export const groupVersions: Record<GroupVersionId, GroupVersion> = {
  A: {
    id: "A",
    label: "Tipo A — 10 em 10",
    shortLabel: "10 em 10",
    chunkDescription: "lotes originais do dataset (song_group)",
    groupCount: wfdGroupsA.length,
    sentenceCount: wfdGroupsA.flat().length,
    groups: wfdGroupsA,
  },
  B: {
    id: "B",
    label: "Tipo B — 20 em 20",
    shortLabel: "20 em 20",
    chunkDescription: "fatias de 20 frases",
    groupCount: wfdGroupsB.length,
    sentenceCount: wfdGroupsB.flat().length,
    groups: wfdGroupsB,
  },
  C: {
    id: "C",
    label: "Tipo C — 30 em 30",
    shortLabel: "30 em 30",
    chunkDescription: "fatias de 30 frases",
    groupCount: wfdGroupsC.length,
    sentenceCount: wfdGroupsC.flat().length,
    groups: wfdGroupsC,
  },
};

export const groupVersionIds: GroupVersionId[] = ["A", "B", "C"];
"""
    with VERSIONS_TS.open("w", encoding="utf-8", newline="\n") as f:
        f.write(versions_ts)

    for version, groups in all_groups.items():
        sizes = [len(g) for g in groups]
        print(
            f"Tipo {version}: {len(groups)} grupos, "
            f"{sum(sizes)} frases, tamanhos {sizes} -> {DST[version].name}"
        )
    print(f"OK: metadados -> {VERSIONS_TS.relative_to(REPO)}")


if __name__ == "__main__":
    main()
