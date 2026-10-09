# Roadmap — project8 (Tradução, Áudio e Aba Settings)

Dependência: PRD em `.opencode/prd-project8.md` (mesmo projeto e versão).
Execução: builder direto (sem OpenCode em remix, conforme AGENTS.md).

## Fase 1 — Fundação do protocolo (3 arquivos)
- [x] PRD (`prd-project8.md`) criado a partir do planejamento (`project8.md`)
- [x] Roadmap (este arquivo) com fases e gates
- [x] Coerência planejamento ↔ PRD ↔ roadmap (mesmo escopo)
- [x] Monitor informado da falta dos arquivos (recebimento confirmado)
- Gates: 3 arquivos do project8 existem em disco e coerentes; monitor informado. PASSOU (2026-10-09: monitor confirmou recebimento e avaliou stage-01 com veredito concluída — docs/planning/reports/stage-01-eval-project8.md).

## Fase 2 — Backend de IA (Lovable Cloud + AI Gateway)
- [x] Lovable Cloud ativado
- [x] Função server de tradução de palavra (literal + contextual)
- [x] Função server de tradução de frase (literal + natural)
- [x] Função server de TTS (voz australiana, masculina/feminina)
- [x] Cache + deduplicação; tratamento de erro com retry explícito
- Gates: funções respondem com contrato do PRD §5 R5/R6; erro tratado. PASSOU (2026-10-09: tradução de frase {literal,natural}, palavra {literal,contextual} e cache hit sem nova chamada verificados com chamada real ao gateway; TTS retornou WAV RIFF de 226604 bytes).

## Fase 3 — Aba Settings
- [x] Rota `src/routes/settings.tsx` com `head()` próprio
- [x] Hook `src/hooks/use-wfd-settings.ts` (localStorage, SSR-safe)
- [x] Toggles: tradução individual, tradução de frases, áudio
- [x] Preferências: voz (F/M), acento (en-AU padrão), velocidade
- [x] Link no header da home + link de volta
- Gates: preferências persistem entre reloads; testes do hook verdes. PASSOU (2026-10-09: Playwright confirma toggles → localStorage `wfd-settings-v1` íntegro após reload (3 switches checked); 5 testes do hook verdes).

## Fase 4 — Tradução individual (palavra por palavra)
- [x] Tokenização clicável das frases da home (modo ativo)
- [x] Painel literal + contextual por palavra; uma aberta por card
- [x] Cache de traduções (memória + localStorage, deduplicação)
- Gates: clique mostra traduções; modo desativado não altera layout. PASSOU (2026-10-09: Playwright confirma painel de palavra com tradução real do gateway; 40 botões por frase no modo ligado; desativado mantém lista simples de 30 frases).

## Fase 5 — Tradução de frases (expansão do card)
- [x] Expansão do card com tradução literal + natural
- [x] Detecção de tap proposital (distância < 10px, duração < 500ms)
- [x] Nenhuma expansão por scroll/hover; colapso por novo toque
- Gates: Playwright touch — scroll/drag não expande; tap proposital expande. PASSOU (2026-10-09: tap expande com tradução real; drag de 90px não expande novo card (aria-expanded permanece 1 card = 2 seletores row+chevron); chevron só renderiza quando só o modo frase está ativo — decisão registrada no relatório stage-03-07).

## Fase 6 — Áudio das frases
- [x] Botão play por frase no painel do grupo
- [x] TTS com voz australiana e seleção F/M; velocidade aplicada
- [x] Cache de áudio por (frase, voz, velocidade); feedback "tocando"
- Gates: reprodução funciona conforme settings; cache evita regeração. PASSOU (2026-10-09: botão de play visível por frase e com estado visual ativo no preview; TTS real verificado na fase 2 (WAV RIFF 226 KB); cache por (frase, voz, velocidade) evita regeração; sem pageerrors).

## Fase 7 — Validação final e reporte
- [x] Testes: settings hook, cache de tradução
- [x] `bunx vitest run` verde; `bun run build` OK; `npm run lint` sem erros
- [x] Playwright: settings, expansão, player, reload, home sem regressão
- [x] Stage status em `docs/planning/stages/` e monitor notificado
- [x] Correções do monitor aplicadas e revalidadas (chevron com os 2 modos ligados; "Tentar de novo" da frase refaz a chamada)
- [x] Roadmap 100% e entrega final ao usuário
- Gates: build OK; testes verdes; monitor notificado; remix finalizado. PASSOU (2026-10-09: vitest 24/24; build OK; lint 0 erros (auto-gen `previewAuthStorage.ts` ignorado no eslint.config.js); avaliação do monitor = parcial → 2 correções aplicadas e revalidadas no navegador (10 chevrons com os 2 modos ligados; expansão com tradução real); status em docs/planning/stages/stage-03-07-status-project8.md).
