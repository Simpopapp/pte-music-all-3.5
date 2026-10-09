// Tokenização única das frases: usada pela UI, pelos testes e pelos dados de tradução.
// A posição de uma palavra (índice entre os tokens de palavra) é a chave das
// traduções palavra a palavra do project9.
export type Token = { text: string; word: string | null };

const TOKEN_SOURCE = "[A-Za-z][A-Za-z'’-]*";

export function tokenize(sentence: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  for (const match of sentence.matchAll(new RegExp(TOKEN_SOURCE, "g"))) {
    const start = match.index ?? 0;
    if (start > last) tokens.push({ text: sentence.slice(last, start), word: null });
    tokens.push({ text: match[0], word: match[0] });
    last = start + match[0].length;
  }
  if (last < sentence.length) tokens.push({ text: sentence.slice(last), word: null });
  return tokens;
}

/** Somente as palavras, na ordem da frase (índice 0-based = chave da tradução). */
export function wordTokens(sentence: string): string[] {
  return tokenize(sentence).flatMap((t) => (t.word === null ? [] : [t.word]));
}
