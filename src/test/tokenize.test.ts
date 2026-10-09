import { describe, expect, it } from "vitest";
import { tokenize, wordTokens } from "@/lib/tokenize";

describe("tokenize", () => {
  it("trata contrações e hífen como um único token de palavra", () => {
    expect(wordTokens("Don't stop, well-known student's work.")).toEqual([
      "Don't",
      "stop",
      "well-known",
      "student's",
      "work",
    ]);
  });

  it("não transforma pontuação em palavra e preserva o texto original", () => {
    const sentence = "Hello, world!";
    expect(wordTokens(sentence)).toEqual(["Hello", "world"]);
    expect(
      tokenize(sentence)
        .map((t) => t.text)
        .join(""),
    ).toBe(sentence);
  });
});
