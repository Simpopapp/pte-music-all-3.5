import { describe, expect, it } from "vitest";
import { buildCopyKey, countCopied, findNextGroup, parseCopied } from "@/hooks/use-copied-tracker";

describe("use-copied-tracker (project7)", () => {
  it("buildCopyKey compõe tipo-grupo-categoria", () => {
    expect(buildCopyKey("A", 3, "letra")).toBe("A-3-letra");
    expect(buildCopyKey("C", 11, "ritmos")).toBe("C-11-ritmos");
  });

  it("parseCopied aceita apenas booleanos e rejeita lixo", () => {
    expect(parseCopied(null)).toEqual({});
    expect(parseCopied("")).toEqual({});
    expect(parseCopied("não é json")).toEqual({});
    expect(parseCopied("[1,2]")).toEqual({});
    expect(parseCopied('{"A-1-letra":true,"A-2-letra":"sim","B-1-ritmos":false}')).toEqual({
      "A-1-letra": true,
      "B-1-ritmos": false,
    });
  });

  it("findNextGroup aponta o próximo grupo não copiado por categoria", () => {
    const vazio: Record<string, boolean> = {};
    expect(findNextGroup(vazio, "A", "letra", 31)).toBe(1);
    expect(findNextGroup(vazio, "A", "ritmos", 31)).toBe(1);

    const comDois: Record<string, boolean> = {
      "A-1-letra": true,
      "A-2-letra": true,
      "A-1-ritmos": true,
    };
    expect(findNextGroup(comDois, "A", "letra", 31)).toBe(3);
    expect(findNextGroup(comDois, "A", "ritmos", 31)).toBe(2);
  });

  it("findNextGroup devolve null quando a sequência está completa", () => {
    const completo: Record<string, boolean> = {
      "C-1-letra": true,
      "C-2-letra": true,
      "C-3-letra": true,
    };
    expect(findNextGroup(completo, "C", "letra", 3)).toBeNull();
  });

  it("countCopied conta só a categoria pedida do tipo pedida", () => {
    const estado: Record<string, boolean> = {
      "B-1-letra": true,
      "B-2-letra": true,
      "B-2-ritmos": true,
      "C-1-letra": true,
    };
    expect(countCopied(estado, "B", "letra", 16)).toBe(2);
    expect(countCopied(estado, "B", "ritmos", 16)).toBe(1);
    expect(countCopied(estado, "C", "letra", 11)).toBe(1);
    expect(countCopied(estado, "C", "ritmos", 11)).toBe(0);
  });
});
