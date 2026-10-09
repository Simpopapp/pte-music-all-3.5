// Gerado por data/generate_group_versions.py — não editar manualmente.
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
