// Server-only: tradução contextual pt-BR via Lovable AI Gateway.
// Cache em memória por processo + deduplicação de pedidos idênticos em voo.
import { Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createResponsesCall, gatewayApiKey } from "./gateway.server";

export const TRANSLATION_MODEL = "openai/gpt-6-astra";

export interface WordTranslation {
  literal: string;
  contextual: string;
}

export interface SentenceTranslation {
  literal: string;
  natural: string;
}

const wordSchema = z.object({
  literal: z.string(),
  contextual: z.string(),
});

const sentenceSchema = z.object({
  literal: z.string(),
  natural: z.string(),
});

const wordCache = new Map<string, WordTranslation>();
const wordInFlight = new Map<string, Promise<WordTranslation>>();
const sentenceCache = new Map<string, SentenceTranslation>();
const sentenceInFlight = new Map<string, Promise<SentenceTranslation>>();

const MAX_CACHE = 500;

function remember<T>(cache: Map<string, T>, key: string, value: T) {
  if (!cache.has(key) && cache.size >= MAX_CACHE) {
    // evict o primeiro inserido (FIFO simples)
    const first = cache.keys().next();
    if (!first.done) cache.delete(first.value);
  }
  cache.set(key, value);
}

const WORD_INSTRUCTIONS = `Você é um tradutor PT-BR < EN para estudo de inglês (PTE Academic).
Dada uma palavra em inglês dentro de uma frase completa, responda em JSON estrito com:
- "literal": tradução literal curta da palavra (a tradução de dicionário, minúscula, sem frases longas).
- "contextual": o que a palavra significa NESSA frase, em pt-BR, em UMA frase breve e natural (máx. ~140 chars).
Não adicione comentários, exemplos ou campos extras. Responda apenas o objeto JSON.`;

const SENTENCE_INSTRUCTIONS = `Você é um tradutor PT-BR < EN para estudo de inglês (PTE Academic).
Dada uma frase em inglês, responda em JSON estrito com:
- "literal": tradução literal fiel da frase em pt-BR.
- "natural": a tradução NÃO literal — como um brasileiro diria a mesma ideia, em pt-BR, considerando o contexto geral da frase.
Não adicione comentários ou campos extras. Responda apenas o objeto JSON.`;

export async function translateWordServer(
  sentence: string,
  word: string,
): Promise<WordTranslation> {
  const key = `w|${word.toLowerCase()}|${sentence}`;
  const cached = wordCache.get(key);
  if (cached) return cached;
  const running = wordInFlight.get(key);
  if (running) return running;

  const promise = (async (): Promise<WordTranslation> => {
    const result = createResponsesCall({
      apiKey: gatewayApiKey(),
      model: TRANSLATION_MODEL,
      instructions: WORD_INSTRUCTIONS,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: `Frase: "${sentence}"\nPalavra: "${word}"` }],
        },
      ],
      output: Output.object({ schema: wordSchema }),
    });
    try {
      const parsed = (await result.output) as {
        literal: string;
        contextual: string;
      } | null;
      if (!parsed) throw new Error("Tradução vazia");
      const value: WordTranslation = {
        literal: parsed.literal.trim(),
        contextual: parsed.contextual.trim(),
      };
      remember(wordCache, key, value);
      return value;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error) && error.text) {
        const fallback = safeParse(error.text, wordSchema);
        if (fallback) {
          remember(wordCache, key, fallback);
          return fallback;
        }
      }
      throw error;
    } finally {
      wordInFlight.delete(key);
    }
  })();
  wordInFlight.set(key, promise);
  return promise;
}

export async function translateSentenceServer(sentence: string): Promise<SentenceTranslation> {
  const key = `s|${sentence}`;
  const cached = sentenceCache.get(key);
  if (cached) return cached;
  const running = sentenceInFlight.get(key);
  if (running) return running;

  const promise = (async (): Promise<SentenceTranslation> => {
    const result = createResponsesCall({
      apiKey: gatewayApiKey(),
      model: TRANSLATION_MODEL,
      instructions: SENTENCE_INSTRUCTIONS,
      messages: [{ role: "user", content: [{ type: "text", text: `Frase: "${sentence}"` }] }],
      output: Output.object({ schema: sentenceSchema }),
    });
    try {
      const parsed = (await result.output) as {
        literal: string;
        natural: string;
      } | null;
      if (!parsed) throw new Error("Tradução vazia");
      const value: SentenceTranslation = {
        literal: parsed.literal.trim(),
        natural: parsed.natural.trim(),
      };
      remember(sentenceCache, key, value);
      return value;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error) && error.text) {
        const fallback = safeParse(error.text, sentenceSchema);
        if (fallback) {
          remember(sentenceCache, key, fallback);
          return fallback;
        }
      }
      throw error;
    } finally {
      sentenceInFlight.delete(key);
    }
  })();
  sentenceInFlight.set(key, promise);
  return promise;
}

function safeParse<S extends z.ZodTypeAny>(text: string, schema: S): z.infer<S> | null {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    const parsed = schema.safeParse(JSON.parse(text.slice(start, end + 1)));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
