// Cliente-importável: funções server de tradução (gateway fica no servidor).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const translateWordFn = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        sentence: z.string().min(1).max(400),
        word: z.string().min(1).max(60),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { translateWordServer } = await import("./translate.server");
    return translateWordServer(data.sentence, data.word);
  });

export const translateSentenceFn = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ sentence: z.string().min(1).max(400) }).parse(data))
  .handler(async ({ data }) => {
    const { translateSentenceServer } = await import("./translate.server");
    return translateSentenceServer(data.sentence);
  });
