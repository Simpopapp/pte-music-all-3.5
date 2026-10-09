# Roadmap — project6 (Estruturas Musicais Suno V5 — Tipo A)

Dependência: PRD em `.opencode/prd-project6.md` (mesmo projeto e versão).
Execução: subagentes paralelos para as estruturas (proibido usar o monitor para isso).

## Fase 1 — Fundação do protocolo (3 arquivos)
- [x] Criar PRD (`prd-project6.md`) derivado do planejamento (project6)
- [x] Criar roadmap (este arquivo) com fases e gates
- [x] Verificar coerência planejamento ↔ PRD ↔ roadmap (mesmo escopo)
- [x] Reportar estado inicial ao monitor OpenCode (recebimento confirmado)
- Gates: 3 arquivos do project6 existem em disco e coerentes; monitor informado. PASSOU (2026-10-08: relatório stage-01-eval-project6.md, veredito concluída).

## Fase 2 — Metodologia (adaptação do guia ao tipo A)
- [x] Adicionar seção de adaptação ao tipo A em `docs/planning/suno-v5-methodology.md` (grupos de 10/9 frases: densidade de seções, duplicação, instruções)
- [x] Confirmar contrato de saída dos subagentes (formato exato dos 2 txt)
- Gates: guia cobre o caso do tipo A e o formato dos 2 txt. PASSOU (2026-10-08: §6 de adaptação ao tipo A adicionado ao guia; contrato herdado dos project4/5).

## Fase 3 — Geração paralela das 31 estruturas
- [x] Mapear os 31 grupos do tipo A e preparar briefs individuais
- [x] Spawnar subagentes simultâneos (1 por grupo, todos os estágios de produção)
- [x] Gerar `data/songs/tipo-a/grupo-{NN}/letra.txt` + `estilo.txt` (31×2)
- [x] Reexecutar isoladamente qualquer grupo com falha
- Gates: 31 pastas × 2 txt existem; nenhum grupo pendente. PASSOU (2026-10-08: 62 artefatos gravados em 4 lotes paralelos; 31 IDs em .lovable/agent-ids-project6.txt).

## Fase 4 — Validação dos artefatos
- [x] Script `data/validate_songs_tipo_a.py` (fidelidade palavra a palavra, limites de chars, inglês nas instruções)
- [x] Corrigir e revalidar até `VALIDACAO OK`
- Gates: validação automática passa para os 62 txt. PASSOU (2026-10-08: VALIDACAO OK — 301 frases íntegras; estilos dos grupos 12 e 25 ajustados ao limite de 200 chars).

## Fase 5 — Integração no app
- [x] Gerar `src/data/wfd-songs-a.ts` a partir dos txt
- [x] Botões "Copiar letra" e "Copiar ritmos" nos grupos do tipo A
- [x] Atualizar head() da rota e rodapé
- [x] Teste unitário do módulo (padrão `wfd-songs-b.test.ts` / `wfd-songs-c.test.ts`)
- Gates: build OK; testes verdes; lint sem erros; tipos B/C inalterados. PASSOU (2026-10-08: módulo com 31 músicas; vitest 10/10; lint 0 erros).

## Fase 6 — Validação final e reporte
- [x] Verificação Playwright (botões, cópia, deep-link; A/B/C)
- [x] Registrar stage status e notificar o monitor (`Stage NN completed`)
- [x] Marcar roadmap 100% e entregar ao usuário
- Gates: build OK; testes verdes; monitor notificado; entrega final. PASSOU (2026-10-08: Playwright confirma cópia íntegra em A/B/C; monitor notificado na sessão "project6 — monitor").

## Justificativas registradas
- Escopo: planejamento diz "~30 estruturas"; tipo A tem 31 grupos → 31 estruturas
  (1 por grupo), conforme decisão D1 da PRD.
