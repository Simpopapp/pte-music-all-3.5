// Testes do cache persistente de traduções (project8).
import { afterEach, describe, expect, it } from "vitest";
import {
  getSentenceTranslation,
  getWordTranslation,
  putSentenceTranslation,
  putWordTranslation,
  sentenceCacheKey,
  wordCacheKey,
} from "@/lib/translation-cache";

afterEach(() => {
  window.localStorage.clear();
});

describe("translation-cache", () => {
  it("salva e recupera tradução de palavra", () => {
    expect(getWordTranslation("frase", "word")).toBeNull();
    putWordTranslation("frase", "word", { literal: "palavra", contextual: "x" });
    expect(getWordTranslation("frase", "word")).toEqual({
      kind: "word",
      literal: "palavra",
      contextual: "x",
    });
  });

  it("salva e recupera tradução de frase", () => {
    expect(getSentenceTranslation("frase")).toBeNull();
    putSentenceTranslation("frase", { literal: "a", natural: "b" });
    expect(getSentenceTranslation("frase")).toEqual({
      kind: "sentence",
      literal: "a",
      natural: "b",
    });
  });

  it("chave de palavra ignora caixa e separa por frase", () => {
    putWordTranslation("frase um", "Word", { literal: "1", contextual: "2" });
    expect(getWordTranslation("frase um", "word")).not.toBeNull();
    expect(getWordTranslation("frase dois", "word")).toBeNull();
    expect(wordCacheKey("a", "X")).toBe(`w|x|a`);
    expect(sentenceCacheKey("a")).toBe("s|a");
  });

  it("poda o cache quando passa do limite", () => {
    for (let i = 0; i < 410; i++) {
      putSentenceTranslation(`frase ${i}`, { literal: String(i), natural: String(i) });
    }
    expect(getSentenceTranslation("frase 5")).toBeNull();
    expect(getSentenceTranslation("frase 409")).not.toBeNull();
  });
});
