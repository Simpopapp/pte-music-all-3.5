# Roadmap — project3 (Versões de separação A/B/C)

Dependência: PRD em `.opencode/prd-project3.md` (mesmo projeto e versão).

## Fase 1 — Fundação do protocolo (3 arquivos)
- [x] Criar PRD (`prd-project3.md`) derivado do planejamento (project3)
- [x] Criar roadmap (este arquivo) com fases e gates
- [x] Verificar coerência planejamento ↔ PRD ↔ roadmap (mesmo escopo)
- [x] Reportar estado inicial ao monitor OpenCode (recebimento confirmado)
- Gates: 3 arquivos do project3 existem em disco e coerentes; monitor informado. PASSOU.

## Fase 2 — Geração das 3 versões de grupos
- [x] Escrever script gerador determinístico (dataset → A: song_group; B: fatias de 20; C: fatias de 30)
- [x] Gerar `data/wfd-groups-{a,b,c}.json` (apenas frases, sem metadados)
- [x] Gerar módulos TS em `src/data/` (`wfd-groups-{a,b,c}.ts` + `wfd-group-versions.ts`)
- Gates: validação das 3 versões passa; A idêntico ao `wfd-groups.json` original; dataset intocado. PASSOU (2026-10-08: VALIDACAO OK, tsc limpo).

## Fase 3 — App com seletor de tipo (A/B/C)
- [x] Seletor A/B/C no cabeçalho, refletido na URL (`?tipo=A|B|C&grupo=N`) com validação/fallback
- [x] Navegação, painel, badge e rótulo do JSON completo dinâmicos por tipo
- [x] Cópia texto (`,\n`), JSON do grupo e JSON completo da versão ativa, com feedback visual
- [x] head() da rota atualizado (3 versões, 301 frases)
- Gates: build sem erros; testes (`bunx vitest run`) verdes; troca de tipo revalida o grupo sem UI quebrada. PASSOU (2026-10-08: build OK, teste de rota verde, Playwright confirmou seletor/deep-link/cópia).

## Fase 4 — Validação e reporte
- [x] Rodar `data/validate_group_versions.py` (totais 31/16/11, fidelidade frase a frase, A == original)
- [x] Verificação visual Playwright (seletor, deep-link `?tipo=C&grupo=2`, clipboard)
- [x] Marcar roadmap 100% e reportar conclusão ao monitor OpenCode
- Gates: `VALIDACAO OK`; build OK; testes verdes; monitor notificado; entrega final ao usuário. PASSOU.
