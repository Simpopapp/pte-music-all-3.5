# Roadmap — project5 (Estruturas Musicais Suno V5 — Tipo B)

Dependência: PRD em `.opencode/prd-project5.md` (mesmo projeto e versão).
Execução: subagentes paralelos para as estruturas (proibido usar o monitor para isso).

## Fase 1 — Fundação do protocolo (3 arquivos)
- [x] Criar PRD (`prd-project5.md`) derivado do planejamento (project5)
- [x] Criar roadmap (este arquivo) com fases e gates
- [x] Verificar coerência planejamento ↔ PRD ↔ roadmap (mesmo escopo)
- [x] Reportar estado inicial ao monitor OpenCode (recebimento confirmado)
- Gates: 3 arquivos do project5 existem em disco e coerentes; monitor informado.

## Fase 2 — Metodologia (adaptação do guia ao tipo B)
- [x] Revisar `docs/planning/suno-v5-methodology.md` para grupos de 20 frases (densidade de seções, duplicação)
- [x] Confirmar contrato de saída dos subagentes (formato exato dos 2 txt)
- Gates: guia cobre o caso do tipo B e o formato dos 2 txt. PASSOU (2026-10-08: §5 de adaptação ao tipo B adicionado ao guia).

## Fase 3 — Geração paralela das 16 estruturas
- [x] Mapear os 16 grupos do tipo B e preparar briefs individuais
- [x] Spawnar subagentes simultâneos (1 por grupo, todos os estágios de produção)
- [x] Gerar `data/songs/tipo-b/grupo-{NN}/letra.txt` + `estilo.txt` (16×2)
- [x] Reexecutar isoladamente qualquer grupo com falha
- Gates: 16 pastas × 2 txt existem; nenhum grupo pendente. PASSOU (2026-10-08: 32 artefatos; grupo 08 reexecutado isoladamente com brief corrigido — frases erradas do 1º lote).

## Fase 4 — Validação dos artefatos
- [x] Script `data/validate_songs_tipo_b.py` (fidelidade palavra a palavra, limites de chars, inglês nas instruções)
- [x] Corrigir e revalidar até `VALIDACAO OK`
- Gates: validação automática passa para os 32 txt. PASSOU (2026-10-08: VALIDACAO OK — 301 frases íntegras).

## Fase 5 — Integração no app
- [x] Gerar `src/data/wfd-songs-b.ts` a partir dos txt
- [x] Botões "Copiar letra" e "Copiar ritmos" nos grupos do tipo B
- [x] Atualizar head() da rota e rodapé
- Gates: build OK; testes verdes; tipos A/C inalterados. PASSOU (2026-10-08: vitest 7/7; lint 0 erros; build OK; Playwright confirmou botões em B, ausentes em A e intactos em C).

## Fase 6 — Validação final e reporte
- [x] Verificação Playwright (botões, cópia, deep-link)
- [x] Registrar stage status e notificar o monitor (`Stage NN completed`)
- [x] Marcar roadmap 100% e entregar ao usuário
- Gates: build OK; testes verdes; monitor notificado; entrega final. PASSOU (2026-10-08: vitest 7/7; build OK; lint 0 erros; clipboard letra 2222 chars e ritmos 195 chars íntegros).

## Justificativas registradas
- Escopo: planejamento diz "~20 estruturas"; tipo B tem 16 grupos → 16 estruturas
  (1 por grupo), conforme decisão D1 da PRD.
