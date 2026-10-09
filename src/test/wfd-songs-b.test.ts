import { describe, expect, it } from "vitest";
import { wfdGroupsB } from "@/data/wfd-groups-b";
import { wfdSongsB } from "@/data/wfd-songs-b";

describe("wfdSongsB (estruturas Suno V5 do tipo B)", () => {
  it("tem uma estrutura por grupo do tipo B (16 no total)", () => {
    expect(wfdSongsB).toHaveLength(16);
    expect(wfdSongsB.map((s) => s.group)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
    ]);
  });

  it("mantém o campo de estilo dentro do limite do Suno (≤ 200 chars, sem colchetes)", () => {
    for (const song of wfdSongsB) {
      expect(song.estilo.length, `grupo ${song.group}`).toBeLessThanOrEqual(200);
      expect(song.estilo, `grupo ${song.group}`).not.toMatch(/[[\]]/);
    }
  });

  it("mantém as frases do dataset intactas na letra (fidelidade palavra a palavra)", () => {
    const normalize = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
    for (const song of wfdSongsB) {
      const sentences = wfdGroupsB[song.group - 1] ?? [];
      for (const sentence of sentences) {
        expect(normalize(song.letra)).toContain(normalize(sentence));
      }
    }
  });
});
