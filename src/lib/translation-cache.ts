// Cache persistente de traduções no navegador (wfd-traducoes-v1).
// Chave versionada; poda automática quando passa do limite.
const STORAGE_KEY = "wfd-traducoes-v1";
const MAX_ENTRIES = 400;

export type WordEntry = { kind: "word"; literal: string; contextual: string };
export type SentenceEntry = { kind: "sentence"; literal: string; natural: string };
export type TranslationEntry = WordEntry | SentenceEntry;

export function wordCacheKey(sentence: string, word: string): string {
  return `w|${word.toLowerCase()}|${sentence}`;
}

export function sentenceCacheKey(sentence: string): string {
  return `s|${sentence}`;
}

function readAll(): Record<string, TranslationEntry> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, TranslationEntry>) : {};
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, TranslationEntry>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // quota/privado — cache persistente vira só memória da sessão
  }
}

function prune(all: Record<string, TranslationEntry>): Record<string, TranslationEntry> {
  const keys = Object.keys(all);
  if (keys.length <= MAX_ENTRIES) return all;
  const next: Record<string, TranslationEntry> = {};
  for (const key of keys.slice(keys.length - MAX_ENTRIES)) {
    next[key] = all[key]!;
  }
  return next;
}

export function getWordTranslation(sentence: string, word: string): WordEntry | null {
  const entry = readAll()[wordCacheKey(sentence, word)];
  return entry && entry.kind === "word" ? entry : null;
}

export function getSentenceTranslation(sentence: string): SentenceEntry | null {
  const entry = readAll()[sentenceCacheKey(sentence)];
  return entry && entry.kind === "sentence" ? entry : null;
}

export function putWordTranslation(
  sentence: string,
  word: string,
  value: { literal: string; contextual: string },
): void {
  const all = readAll();
  all[wordCacheKey(sentence, word)] = { kind: "word", ...value };
  writeAll(prune(all));
}

export function putSentenceTranslation(
  sentence: string,
  value: { literal: string; natural: string },
): void {
  const all = readAll();
  all[sentenceCacheKey(sentence)] = { kind: "sentence", ...value };
  writeAll(prune(all));
}
