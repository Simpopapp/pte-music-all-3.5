# Avaliação — Stage 02 (project8: Backend de IA)

**Data:** 2026-10-09
**Veredito:** parcial
**Confiança da avaliação:** alta

## Resumo executivo
O núcleo do backend de IA da Fase 2 existe e está bem isolado: tradução de palavra e frase via AI Gateway com o contrato exato do PRD (`{literal, contextual}` / `{literal, natural}`) e TTS Gemini com voz feminina/masculina e instrução de sotaque australiano, tudo atrás de `createServerFn` com fronteira cliente/servidor correta. Falta, porém, cache no TTS (requisito R6) e não há status formal da Fase 2 em `docs/planning/stages/`, de modo que a fase não pode ser dada como concluída sem ressalvas. Nada aqui bloqueia a Fase 3 (Settings).

## Cobertura de requisitos
- Atendido: função server de tradução de palavra (`translateWordFn` → `translateWordServer`, contrato `{literal, contextual}`, validação zod `sentence 1–400` / `word 1–60`).
- Atendido: função server de tradução de frase (`translateSentenceFn` → `translateSentenceServer`, contrato `{literal, natural}`).
- Atendido: função server de TTS (`speakSentenceFn` → `synthesizeSpeech`, `Aoede` feminina / `Puck` masculina, `australiano` via instrução `Say with an Australian accent`, retorno WAV base64, `TtsError` com status).
- Atendido (tradução): cache em memória (Map, FIFO, cap 500) + deduplicação de pedidos idênticos em voo (`wordInFlight` / `sentenceInFlight`) + fallback de parse (`safeParse` sobre `NoObjectGeneratedError.text`).
- Parcial: tratamento de erro — erros são tipados e lançados (`TtsError`, throw em tradução vazia), mas não há retry no servidor; o retry explícito do gate ("toque para tentar de novo") é responsabilidade da UI das Fases 4/5/6, ainda inexistente.
- Parcial: "Lovable Cloud ativado" — alegado pelo builder e plausível (`@supabase/supabase-js` presente no `package.json`, chamadas ao gateway com `LOVABLE_API_KEY`), mas sem evidência independente no código inspecionado (nenhum cliente Cloud novo, nenhuma migration nesta fase — o que é esperado, pois a fase não exige tabela).
- Ausente / não evidenciado: cache de TTS por (frase + voz + velocidade) exigido pelo PRD R6 e pelo gate da Fase 2 ("Cache + deduplicação") — `synthesizeSpeech` faz fetch direto sem Map nem dedupe; cada play futuro regenera ~226 KB.
- Ausente / não evidenciado: cache persistente (localStorage `wfd-traducoes-v1` previsto em D4) — existe só o Map em memória do servidor; a camada persistente é cliente e pertence naturalmente às Fases 4/6, mas o gate da Fase 2 a cita de forma genérica.
- Ausente: velocidade de reprodução (0,5×–1,25×) — corretamente deferida para a Fase 6 (é `playbackRate` no cliente, não parâmetro do TTS atual); sem impacto neste veredito.

## Qualidade do código
Pontos fortes:
- Fronteira cliente/servidor exemplar: `*.server.ts` nunca importado estaticamente pelo cliente — `*.functions.ts` usa `await import("./translate.server")` / `("./tts.server")` dentro do `.handler()` (§9.2 do AGENTS.md respeitado).
- `process.env["LOVABLE_API_KEY"]` lido dentro de função (`gatewayApiKey()`, `synthesizeSpeech`), nunca em module scope; import de `createServerFn` vindo de `@tanstack/react-start` (correto).
- Contratos zod espelham o PRD §5 R5/R6; limites de tamanho (400/60) mitigam custo/latência; `arrayBufferToBase64` em chunks evita estouro de pilha.
- `gateway.server.ts` adapta o padrão run-id do AI Gateway (`X-Lovable-AIG-Run-ID`, `Lovable-API-Key`, `store: false`) em vez de improvisar fetch cru.
Pontos de atenção:
- `tts.server.ts` usa `btoa` no servidor — funciona no Worker atual, mas é API de browser; `Buffer.from(...).toString("base64")` seria mais robusto no runtime de borda.
- Sotaque "australiano" é apenas instrução de prompt, não voz en-AU dedicada — o risco R9 do PRD (fallback de voz) continua sem definição testável: nenhum código detecta "voz indisponível" nem expõe o fallback neutro de forma verificável.
- `TRANSLATION_MODEL = "openai/gpt-6-astra"` e `providerOptions.openai.reasoningEffort: "low"` acoplados sem comentário de fallback de modelo — se o modelo for desativado, tradução quebra sem alternativa.
- Desvio de path vs. PRD (D4/D5 previam `src/server/translate.ts` e `src/server/tts.ts`; entregue em `src/lib/ai/*`): desvio para melhor (client-safe + import protection), mas o PRD deveria ser atualizado para não divergir da árvore real.

## Discrepâncias
1. `docs/planning/stages/stage-02-status.md` em disco descreve o **project6** (metodologia Suno, 2026-10-08), não a Fase 2 do project8 — o builder não registrou status formal da etapa avaliada; a única fonte de "o que foi entregue" é a mensagem de handoff. Convenção por-projeto anterior (`stage-01-eval-project8.md`) indica que o status deveria existir.
2. Verificação funcional alegada (tradução `{literal,natural}` OK, palavra `{literal,contextual}` OK, cache hit sem nova chamada OK, TTS 226604 bytes com header RIFF) não foi reproduzida por este monitor (chamadas ao gateway não são reexecutadas em avaliação) — aceita como evidência do builder, não como fato verificado.
3. PRD/roadmap globais (`docs/planning/PRD.md`, `ROADMAP.md`) não existem; as fontes reais são `.opencode/prd-project8.md` (273 linhas), `.opencode/roadmap-proj8.md` (53 linhas) e `.opencode/project8.md` — consistente com a convenção por-projeto já reconhecida no stage-01-eval-project8, não é falha.
4. Checkboxes da Fase 2 no roadmap (`roadmap-proj8.md` linhas 13–19) continuam `- [ ]` embora o backend exista — higiene pendente ao encerrar a fase.

## Riscos para as próximas etapas
- **Cache de TTS ausente**: cada play regenera áudio (~226 KB, latência + custo); a Fase 6 precisa implementar o cache por (frase, voz, velocidade) antes de expor o player — senão o primeiro uso real estoura custo.
- **Sotaque por prompt não garantido**: se o provedor ignorar a instrução, o usuário ouve americano sem saber; definir na Fase 6 como detectar e sinalizar o fallback (ex.: teste de fumaça + etiqueta discreta na UI).
- **Cache só em memória do servidor**: restart do Worker limpa tudo; a persistência localStorage (D4) precisa sair na Fase 4 junto com a UI de palavra, ou o "mesmo pedido não repete chamada" só vale dentro da sessão do servidor.
- **Sem testes nesta fase**: nenhum `*.test.ts` para tradução/TTS/cache; a Fase 7 cobra vitest verde — acumular testes até lá aumenta o risco de descobrir o fallback de parse quebrado tarde.

## Recomendações
1. Adicionar cache + dedupe ao TTS (Map por `frase|voz|acento`, mesmo padrão de `translate.server.ts`) antes ou junto da Fase 6 — prioridade alta, bloqueia custo.
2. Registrar `docs/planning/stages/stage-02-status-project8.md` (ou atualizar o status da Fase 2) com arquivos, contratos e a verificação funcional, e marcar os checkboxes da Fase 2 no roadmap — prioridade alta, rastreabilidade.
3. Atualizar D4/D5 no PRD para `src/lib/ai/*` (árvore real) — prioridade baixa, evita deriva documental.
4. Na Fase 6, definir teste objetivo do sotaque australiano e do fallback neutro (PRD §9) em vez de assumir a instrução de prompt — prioridade média.
5. Não reexecutar chamadas de IA nesta avaliação; na Fase 7, incluir um teste de contrato com mock (sem gateway) para `safeParse` + validadores zod — prioridade média.

## Evidências consultadas
- `.opencode/project8.md` (planejamento-fonte, 1 linha)
- `.opencode/prd-project8.md` (§5 R5/R6, §6 D1/D4/D5, §7 fase 2, §9 riscos)
- `.opencode/roadmap-proj8.md` (Fase 2, linhas 13–19)
- `docs/planning/stages/stage-02-status.md` (project6 — divergente, ver discrepância 1)
- `docs/planning/reports/stage-01-eval-project8.md` (veredito anterior + convenção por-projeto)
- `src/lib/ai/gateway.server.ts` (88 linhas: run-id fetch, `/v1/responses` via `streamText`, `gatewayApiKey`)
- `src/lib/ai/translate.server.ts` (161 linhas: cache + in-flight + `safeParse`)
- `src/lib/ai/translate.functions.ts` (24 linhas: `translateWordFn` / `translateSentenceFn`)
- `src/lib/ai/tts.server.ts` (75 linhas: `synthesizeSpeech`, `VOICES`, `TtsError`)
- `src/lib/ai/tts.functions.ts` (38 linhas: `speakSentenceFn`, WAV base64)
- `package.json` (`ai` 7.x, `@ai-sdk/openai` 4.x, `zod` 3.x, `@supabase/supabase-js` presente)
