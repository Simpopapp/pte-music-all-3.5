# Roadmap — project9 (Traduções e áudio prontos no projeto)

Dependência: PRD em `.opencode/prd-project9.md` (mesmo projeto e versão de `project9.md`).
Execução: builder direto + subagentes (sem OpenCode em remix, conforme AGENTS.md).
Ordem fixa: o áudio (fase 4) acontece ANTES da remoção da nuvem (fase 6), pois reusa o gateway.

## Fase 1 — Fundação do protocolo (3 arquivos)
- [x] Migrations Drizzle copiadas limpas (journal vazio, nada a aplicar)
- [x] PRD (`prd-project9.md`) criado a partir do planejamento (`project9.md`)
- [x] Roadmap (este arquivo) com fases e gates
- [ ] Monitor informado (OpenCode fora do ar nesta sessão; reenviar quando voltar)
- Gates: 3 arquivos do project9 existem em disco e coerentes (escopo, 301 frases, 4 variantes de áudio).

## Fase 2 — Infra de dados e testes
- [ ] `src/lib/tokenize.ts` extraído de `sentence-list.tsx` + teste
- [ ] Esquema/tipos de tradução e `data/translations/` (shards)
- [ ] `data/merge_translations.py` (só merge) e validador de cobertura
- [ ] Testes de cobertura (frase, palavra, alinhamento) capazes de falhar
- Gates: testes falham com dado ausente e passam com dado de amostra.

## Fase 3 — Traduções (20 subagentes, ~15 frases cada)
- [ ] Ondas de subagentes escrevem shards 01–20 (sem script de tradução)
- [ ] Validação mecânica verde (tokens alinhados, campos não vazios)
- [ ] Revisão ≥ 20% por shard + auditoria das palavras polissêmicas
- [ ] Merge gera `data/wfd-translations.json` e `src/data/wfd-translations.ts`
- Gates: 301 frases e 2.980 palavras cobertas; revisão sem pendências.

## Fase 4 — Áudio pré-gerado (301 × 2 vozes × 2 sotaques)
- [ ] Script de produção idempotente (`data/generate_audio.py`), mesmas vozes/instrução
- [ ] Amostra de 3 frases × 4 variantes auditada
- [ ] 1.204 MP3 em `public/audio/` + manifesto + `ffprobe` de todos
- [ ] Tamanho total registrado (≤ 60 MB; reduzir bitrate antes de cortar variante)
- Gates: contagem 1.204, todos tocáveis, teste de existência verde.

## Fase 5 — App consumindo só dados locais
- [ ] `audio-path.ts` e `audio-player.ts` (um áudio por vez, velocidade via playbackRate)
- [ ] `sentence-list.tsx` lê traduções do módulo local (sem loading/erro de rede)
- [ ] Settings: remover "Em breve: IA" e ajustar textos
- Gates: palavra, frase e áudio funcionam; home, /copiar e persistência sem regressão.

## Fase 6 — Remover a nuvem
- [ ] Apagar `src/lib/ai/*`, `translation-cache.ts`, `audio-cache.ts` e o teste do cache
- [ ] Remover pacotes `ai` / `@ai-sdk/openai` se órfãos
- [ ] `rg` de gateway/LOVABLE_API_KEY/@/lib/ai em `src/` vazio; teste de ausência de nuvem
- Gates: build OK sem os módulos; registro do que é estrutural da plataforma.

## Fase 7 — Validação final e reporte
- [ ] `bunx vitest run`, `bun run build`, `bun run lint`, `tsgo --noEmit` verdes
- [ ] Playwright (desktop + toque) com rede de IA bloqueada: zero requisições
- [ ] Status por fase em `docs/planning/stages/` e monitor notificado
- [ ] Correções do monitor aplicadas e revalidadas; entrega final ao usuário
- Gates: critério de sucesso do PRD §1 atendido com evidências.
