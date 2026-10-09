import { describe, expect, it } from "vitest";
import { wfdGroupsC } from "@/data/wfd-groups-c";
import { wfdSongsC } from "@/data/wfd-songs-c";

describe("wfdSongsC (estruturas Suno V5 do tipo C)", () => {
  it("tem uma estrutura por grupo do tipo C (11 no total)", () => {
    expect(wfdSongsC).toHaveLength(11);
    expect(wfdSongsC.map((s) => s.group)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it("mantém o campo de estilo dentro do limite do Suno (≤ 200 chars, sem colchetes)", () => {
    for (const song of wfdSongsC) {
      expect(song.estilo.length, `grupo ${song.group}`).toBeLessThanOrEqual(200);
      expect(song.estilo, `grupo ${song.group}`).not.toMatch(/[[\]]/);
    }
  });

  it("mantém as frases do dataset intactas na letra (fidelidade palavra a palavra)", () => {
    const normalize = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
    for (const song of wfdSongsC) {
      const sentences = wfdGroupsC[song.group - 1] ?? [];
      for (const sentence of sentences) {
        expect(normalize(song.letra)).toContain(normalize(sentence));
      }
    }
  });
});
