# Avaliação — Stage 03–07 (project8: Tradução, Áudio e Aba Settings) — revalidação final

**Data:** 2026-10-09
**Veredito:** concluída
**Confiança da avaliação:** alta

## Resumo executivo
As 2 correções exigidas na avaliação anterior (veredito parcial) estão no código e verificadas: o chevron de frase renderiza com `sentenceMode` independente de `wordMode`, restaurando a coexistência do PRD §4; e o "Tentar de novo" da frase chama `fetchSentence` em vez de colapsar o card. Gates reexecutados nesta avaliação: vitest 24/24 e `bun run build` OK. Processo corrigido — o builder registrou o status no caminho correto (`stages/`) sem sobrescrever este relatório. Nada mais bloqueia o remix.

## Cobertura de requisitos
- Atendido: R4 — rota `/settings` com `head()` próprio, hook `useWfdSettings` SSR-safe, persistência versionada; sem regressão.
- Atendido: R1 — painel literal + contextual por palavra, cache `wfd-traducoes-v1` (prune 400) + dedupe; desligado mantém lista simples.
- Atendido: R2 (após correção) — `sentence-list.tsx:349` agora `{sentenceMode && (` (antes `sentenceMode && !wordMode`); com os 2 modos ligados os tokens continuam clicáveis E o chevron existe por card, então a expansão de frase é alcançável. Tap proposital (<10px, <500ms, Enter/Espaço) mantido; nenhum handler em scroll.
- Atendido: retry de frase (após correção) — `sentence-list.tsx:325` agora `onClick={fetchSentence}` (antes `toggleExpand`, que com `expanded=true` só colapsava). Retry de palavra já estava correto.
- Atendido: R3/R5 — play por frase, um áudio por vez, `playbackRate` das settings, contratos `{literal, contextual}` / `{literal, natural}`, pt-BR, lazy sob clique, erros com retry.
- Atendido: R7/R8 — tokens semânticos, sem cor hardcoded nos arquivos novos; home mantém copiar/tipos/grupos; `app-routing.test.tsx` verde.
- Atendido: Fase 7 gates — vitest 24/24 (7 arquivos), `bun run build` OK (reexecutados nesta avaliação), lint 0 erros alegado (não reexecutado; sem alteração em `ui/` desde a última medição).
- Parcial (aceito, não bloqueante): R6 — cache de áudio por `(frase, voz, acento)` (`audio-cache.ts`), não por `(frase, voz, velocidade)` como o PRD §R6/D5 escreve. Tecnicamente correto (velocidade é `playbackRate` no cliente, não parâmetro de geração) e cache só de sessão (Blob URL) conforme D5; falta só atualizar o texto do PRD.
- Ausente / não evidenciado: revalidação Playwright alegada (10 chevrons, expansão com tradução real) — aceita como evidência do builder; este monitor conferiu o código correspondente e os gates locais, sem reexecutar chamadas ao gateway nem browser.

## Qualidade do código
Pontos fortes:
- Correções cirúrgicas (2 linhas efetivas em `sentence-list.tsx`), sem refatoração de arrasto nem mudança de contrato.
- Fronteira cliente/servidor mantida; `process.env["LOVABLE_API_KEY"]` dentro de função; `createServerFn` do pacote correto.
- Acessibilidade mantida: `aria-expanded` no chevron e no texto, `aria-pressed` no player, `role="region"` nos painéis.
Pontos de atenção (não bloqueantes, herdados da avaliação anterior):
- `SentenceItem` segue com ~460 linhas e 4 responsabilidades; próxima feature no card deveria extrair subcomponentes.
- `WordPanel onSwitchWord` continua prop morta; remover ou implementar.
- `tts.server.ts:73` ainda usa `btoa` no servidor; `Buffer` seria mais robusto no Worker.
- Sotaque "australiano" segue como instrução de prompt sem detecção testável de fallback (risco R9 segue aberto).

## Discrepâncias
1. **Resolvida — chevron:** avaliação anterior apontou `sentenceMode && !wordMode` (linha 345 antiga); agora linha 349 é `sentenceMode && (` — conforme o alegado pelo builder.
2. **Resolvida — retry:** avaliação anterior apontou `onClick={toggleExpand}` no erro de frase; agora linha 325 é `onClick={fetchSentence}` — conforme o alegado.
3. **Resolvida — higiene de processo:** o builder havia escrito o relato em `reports/`; agora registrou `docs/planning/stages/stage-03-07-status-project8.md` no caminho correto, sem tocar neste relatório.
4. **Remanescente leve — citação de decisão:** o status do builder atribui a chave de cache `(frase, voz, acento)` + `playbackRate` ao "PRD D9"; D9 trata de dataset, não de TTS (o correto seria D5/R6). Divergência só de referência, sem efeito no código.

## Riscos para as próximas etapas
- Remix encerrado: nenhum risco bloqueante. Ficam como dívida documentada: atualizar PRD D5/R6 para a chave real de cache; remover `onSwitchWord` morto; fallback de modelo de tradução e de sotaque australiano (riscos já listados, fora deste escopo).

## Recomendações
1. (Baixa, pós-remix) Atualizar PRD D5/R6: chave real `(frase, voz, acento)` + `playbackRate` no cliente + cache de áudio só de sessão — evita deriva em futuros remixes.
2. (Baixa) Remover `onSwitchWord` morto ou expor troca de palavra no painel.
3. Nenhuma correção obrigatória antes de avançar — roadmap pode ser dado como 100%.

## Evidências consultadas
- `docs/planning/stages/stage-03-07-status-project8.md` (status do builder, caminho correto)
- `.opencode/prd-project8.md` (§4–§9), `.opencode/roadmap-proj8.md` (Fases 3–7)
- `src/components/sentence-list.tsx` (linhas 228–229, 245, 279, 308, 325, 349 citadas — correções conferidas)
- `src/lib/audio-cache.ts`, `src/lib/translation-cache.ts`, `src/hooks/use-wfd-settings.ts`, `src/routes/settings.tsx`
- Gates reexecutados nesta avaliação: `bunx vitest run` 24/24, `bun run build` OK
- Histórico: veredito anterior `parcial` neste mesmo arquivo (2 defeitos) — ambos corrigidos
