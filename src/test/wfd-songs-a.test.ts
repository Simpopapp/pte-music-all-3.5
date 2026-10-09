import { describe, expect, it } from "vitest";
import { wfdGroupsA } from "@/data/wfd-groups-a";
import { wfdSongsA } from "@/data/wfd-songs-a";

describe("wfdSongsA (estruturas Suno V5 do tipo A)", () => {
  it("tem uma estrutura por grupo do tipo A (31 no total)", () => {
    expect(wfdSongsA).toHaveLength(31);
    expect(wfdSongsA.map((s) => s.group)).toEqual(Array.from({ length: 31 }, (_, i) => i + 1));
  });

  it("mantém o campo de estilo dentro do limite do Suno (≤ 200 chars, sem colchetes)", () => {
    for (const song of wfdSongsA) {
      expect(song.estilo.length, `grupo ${song.group}`).toBeLessThanOrEqual(200);
      expect(song.estilo, `grupo ${song.group}`).not.toMatch(/[[\]]/);
    }
  });

  it("mantém as frases do dataset intactas na letra (fidelidade palavra a palavra)", () => {
    const normalize = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
    for (const song of wfdSongsA) {
      const sentences = wfdGroupsA[song.group - 1] ?? [];
      for (const sentence of sentences) {
        expect(normalize(song.letra)).toContain(normalize(sentence));
      }
    }
  });
});
