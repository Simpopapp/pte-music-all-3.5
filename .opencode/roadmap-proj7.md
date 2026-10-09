# Roadmap — project7 (Página de Cópia Rápida — Letra e Ritmos)

Dependência: PRD em `.opencode/prd-project7.md` (mesmo projeto e versão).
Execução: builder direto (sem geração de conteúdo; sem usar o monitor para implementar).

## Fase 1 — Fundação do protocolo (3 arquivos)
- [x] PRD (`prd-project7.md`) criado a partir do planejamento (`project7`)
- [x] Roadmap (este arquivo) com fases e gates
- [x] Coerência planejamento ↔ PRD ↔ roadmap (mesmo escopo)
- [x] Monitor informado da ativação do remix (recebimento confirmado)
- Gates: 3 arquivos do project7 existem em disco e coerentes; monitor informado. PASSOU (2026-10-08: sessão "project7 — monitor", recebimento confirmado).

## Fase 2 — Página de cópia
- [x] Rota `src/routes/copiar.tsx` com `head()` próprio
- [x] Seções por tipo (A/B/C) na mesma página, com navegação por âncora
- [x] Card por grupo com 2 botões grandes ("Copiar letra" / "Copiar ritmos")
- [x] Feedback visual de cópia (check + "Copiado!")
- Gates: /copiar renderiza 58 grupos × 2 botões em uma única página. PASSOU (2026-10-08: Playwright confirma 116 botões com aria-pressed em uma rota; zero pageerrors).

## Fase 3 — Persistência e sequência
- [x] Hook `src/hooks/use-copied-tracker.ts` (localStorage, SSR-safe)
- [x] Botões usados marcados e persistidos entre reloads
- [x] Destaque do próximo grupo por categoria/tipo + progresso por tipo
- Gates: cópia grava no localStorage; reload mantém estado; próximo destacado. PASSOU (2026-10-08: `wfd-copiados-v1` = {"A-1-letra":true,"A-1-ritmos":true} após reload; badges avançam para Grupo 2; card do Grupo 2 com destaque).

## Fase 4 — Integração no app
- [x] Link home → /copiar e volta, sem alterar comportamento da home
- [x] head() com título/descrição/og próprios; rodapé informativo
- Gates: navegação ida/volta funciona; home sem regressão. PASSOU (2026-10-08: link no cabeçalho da home leva a /copiar e o botão voltar retorna a /?tipo=A&grupo=1).

## Fase 5 — Validação final e reporte
- [x] Teste unitário do tracker (`src/test/use-copied-tracker.test.ts`)
- [x] `bunx vitest run` verde; `bun run build` OK; `npm run lint` sem erros
- [x] Verificação Playwright (botões, estado usado, reload, navegação)
- [x] Stage status em `docs/planning/stages/` e monitor notificado
- [x] Roadmap 100% e entrega final ao usuário
- Gates: build OK; testes verdes; monitor notificado. PASSOU (2026-10-08: vitest 15/15; build OK; lint 0 erros; `tsc --noEmit` exit 0 após correção dos 2 erros apontados pelo monitor (Link `search` + índice opcional); cópia íntegra de letra (2253 chars) e ritmos (199 chars); monitor notificado).
