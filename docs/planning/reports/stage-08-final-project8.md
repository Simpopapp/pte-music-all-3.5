# Avaliação — Stage 08 Final (project8: Tradução, Áudio e Aba Settings — encerramento do remix)

**Data:** 2026-10-09
**Veredito:** concluída
**Confiança da avaliação:** alta

## Resumo executivo
O remix project8 está encerrado com as 7 fases do `roadmap-proj8.md` marcadas [x] e evidenciadas no código. As 2 correções exigidas na avaliação anterior permanecem no código (`sentence-list.tsx:349` e `:325`), e os gates foram reexecutados nesta avaliação: `bunx vitest run` 24/24 e `bunx tsc --noEmit` limpo. O "+8" do aviso de encerramento não tem lastro em artefato — é discrepância leve de contagem, sem efeito no veredito.

## Cobertura de requisitos
- Atendido: R1 — tradução individual: palavras viram botões clicáveis (`sentence-list.tsx:253–276`, `aria-label="Traduzir palavra …"`), painel literal + contextual, uma palavra aberta por card; cache `wfd-traducoes-v1` (prune 400) + dedupe (`src/lib/translation-cache.ts`).
- Atendido: R2 — tradução de frases: expansão por tap proposital (`usePropositalTap`, <10px / <500ms), painel literal + natural (`sentence-list.tsx:308–345`), colapso por novo toque; nenhum handler de expansão em scroll.
- Atendido: R3/R6 — áudio por frase com voz F/M + acento australiano, `playbackRate` das settings, um áudio por vez, cache de sessão por `(frase, voz, acento)` (`src/lib/audio-cache.ts:22`); TTS server-side (`src/lib/ai/tts.server.ts`, `tts.functions.ts`).
- Atendido: R4 — rota `/settings` (`src/routes/settings.tsx:19–39`, `head()` próprio), hook `useWfdSettings` SSR-safe com leitura só em `useEffect` (`src/hooks/use-wfd-settings.ts:1–3`), persistência `wfd-settings-v1`, toggles + voz/acento/velocidade, link no header e volta.
- Atendido: R5 — tradução por IA server-side (`src/lib/ai/translate.server.ts`, `translate.functions.ts`), contratos `{literal, contextual}` / `{literal, natural}`, pt-BR, lazy sob clique, erro com retry explícito.
- Atendido: R7/R8 — tokens semânticos, sem cor hardcoded nos arquivos novos; home sem regressão (copiar/tipos/grupos intactos).
- Atendido: Fase 7 — gates reexecutados nesta avaliação: vitest 24/24 (7 arquivos), `tsc --noEmit` limpo.
- Parcial (aceito, não bloqueante): R6 textual — PRD §R6/D5 escreve cache "por (frase, voz, velocidade)"; o código usa `(frase, voz, acento)` + `playbackRate` no cliente, que é tecnicamente correto, e cache de áudio só de sessão (Blob URL). Falta só atualizar o texto do PRD.
- Ausente / não evidenciado: revalidação Playwright do builder (10 chevrons, expansão com tradução real) — aceita como evidência do builder; este monitor conferiu o código correspondente e os gates locais, sem reexecutar gateway nem browser.

## Qualidade do código
Pontos fortes:
- Correções permaneceram cirúrgicas: `sentence-list.tsx:349` `{sentenceMode && (` (chevron independente do modo palavra) e `:325` `onClick={fetchSentence}` (retry refaz a chamada) — grep confirma, sem refatoração de arrasto.
- Fronteira cliente/servidor mantida (`createServerFn` no pacote correto; `process.env` lido no servidor).
- Acessibilidade: `aria-expanded` no chevron e no texto, `aria-pressed` no player e nas palavras, `role="region"` nos painéis.
Pontos de atenção (não bloqueantes, herdados):
- `SentenceItem` segue com ~460 linhas e 4 responsabilidades; próxima feature no card deveria extrair subcomponentes.
- `WordPanel onSwitchWord` continua prop morta; remover ou implementar.
- `tts.server.ts:73` ainda usa `btoa` no servidor; `Buffer` seria mais robusto no Worker.
- Sotaque "australiano" segue como instrução de prompt sem detecção testável de fallback.

## Discrepâncias
1. **Contagem "+8" vs 7 fases:** o aviso de encerramento cita "+8 da etapa do roadmap", mas `roadmap-proj8.md` tem 7 fases, todas [x], e existe um único status do builder para o project8 (`docs/planning/stages/stage-03-07-status-project8.md` — nenhum `stage-08-status*`, `stage-01-status-project8` ou `stage-02-status-project8` em `stages/`). Não há artefato que sustente um "8". Interpretação mais provável: contagem informal (ex.: 7 fases + validação final, ou confusão com outro projeto). Discrepância leve de contagem, sem efeito no código nem no veredito.
2. **Canônicos ausentes (re-registro, sem bloqueio):** `docs/planning/PRD.md` e `docs/planning/ROADMAP.md` canônicos seguem ausentes (glob retorna vazio); o projeto usa o trio `.opencode/` (`project8.md`, `prd-project8.md`, `roadmap-proj8.md`) como fonte — divergência já documentada em avaliações anteriores, apenas re-registrada.
3. **Citação de decisão (remanescente leve):** o status do builder atribui a chave de cache `(frase, voz, acento)` + `playbackRate` ao "PRD D9"; D9 trata de dataset, não de TTS (o correto seria D5/R6). Só referência, sem efeito no código.
4. **Nenhuma divergência funcional:** status do builder e código convergem nas 2 correções e nas 7 fases; nenhuma regressão evidenciada.

## Riscos para as próximas etapas
- Remix encerrado: nenhum risco bloqueante.
- Dívida documentada (pós-remix, baixa prioridade): atualizar PRD D5/R6 para a chave real de cache; remover `onSwitchWord` morto; fallback de modelo de tradução e de sotaque australiano; trocar `btoa` por `Buffer` no TTS server.

## Recomendações
1. (Baixa, pós-remix) Atualizar PRD D5/R6: chave real `(frase, voz, acento)` + `playbackRate` no cliente + cache de áudio só de sessão.
2. (Baixa) Remover `onSwitchWord` morto ou expor troca de palavra no painel.
3. Nenhuma correção obrigatória — remix pode ser dado como encerrado; este relatório não sobrescreve `stage-03-07-eval-project8.md`.

## Evidências consultadas
- `.opencode/project8.md` (planejamento, 1 linha — fonte de escopo)
- `.opencode/prd-project8.md` (§4–§9: R1–R8, D1–D9)
- `.opencode/roadmap-proj8.md` (7 fases, todas [x])
- `.opencode/Plan.md` (protocolo dos 3 arquivos; mensagem de encerramento "+N")
- `docs/planning/stages/stage-03-07-status-project8.md` (status do builder; único `*project8*` em `stages/`)
- `docs/planning/reports/stage-03-07-eval-project8.md` (avaliação anterior, veredito concluída — preservada)
- `src/components/sentence-list.tsx` (linhas 205, 216, 225, 229, 245–276, 308–345, 349, 354 — correções conferidas por grep + leitura)
- `src/routes/settings.tsx` (linhas 1–39: rota + `head()` próprio)
- `src/hooks/use-wfd-settings.ts` (linhas 1–40: SSR-safe, `wfd-settings-v1`)
- `src/lib/audio-cache.ts` (chave `gender|accent|sentence`), `src/lib/translation-cache.ts` (`wfd-traducoes-v1`, prune 400)
- `src/lib/ai/translate.server.ts`, `src/lib/ai/translate.functions.ts`, `src/lib/ai/tts.server.ts`, `src/lib/ai/tts.functions.ts` (existência confirmada)
- Gates reexecutados nesta avaliação (somente leitura): `bunx vitest run` 24/24 (7 arquivos), `bunx tsc --noEmit` limpo
