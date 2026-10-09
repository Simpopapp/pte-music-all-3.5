# Stage 03–07 status — project8 (Tradução, Áudio e Aba Settings)

Data: 2026-10-09 · Builder: relatório de stage em
`docs/planning/reports/stage-03-07-eval-project8.md` (avaliado pelo monitor:
veredito parcial → 2 correções aplicadas).

## Status por fase

- **Fase 3 — Aba Settings:** concluída. `/settings` com `head()` próprio; hook
  `useWfdSettings` SSR-safe (leitura só em `useEffect`), parse tolerante; link
  "Config." na home e volta. Persistência verificada (reload mantém 3 switches).
- **Fase 4 — Tradução individual:** concluída. Painel literal + contextual por
  palavra com tradução real do gateway; cache `wfd-traducoes-v1` (prune 400) +
  dedupe; desligado mantém lista simples.
- **Fase 5 — Tradução de frases:** concluída após correção do monitor —
  chevron agora renderiza sempre que o modo frase está ligado (antes: some
  quando palavra também ligada, deixando a expansão inalcançável). Tap
  proposital (<10px, <500ms); drag não expande.
- **Fase 6 — Áudio:** concluída. Play por frase, voz F/M + australiano,
  velocidade aplicada, cache por (frase, voz, acento) — nota: o roadmap
  registrava "por velocidade"; correto é rate client-side (`playbackRate`),
  sem regenerar TTS (decisão registrada no PRD D9).
- **Fase 7 — Validação:** concluída. vitest 24/24; build OK (typecheck limpo);
  lint 0 erros (auto-gen `previewAuthStorage.ts` ignorado no
  `eslint.config.js` — arquivo nunca editável); Playwright OK, sem pageerrors.

## Correções do monitor (pós-avaliação)

1. `src/components/sentence-list.tsx` — chevron de frase independente do modo
   palavra (coexistência do PRD §4 restaurada; revalidado no navegador: 10
   chevrons com os 2 modos ligados, expansão com tradução real).
2. `src/components/sentence-list.tsx` — "Tentar de novo" agora refaz a
   tradução da frase (`fetchSentence`) em vez de colapsar o card.
