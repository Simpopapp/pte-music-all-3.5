# Roadmap — project4 (Estruturas Musicais Suno V5 — Tipo C)

Dependência: PRD em `.opencode/prd-project4.md` (mesmo projeto e versão).
Execução: subagentes paralelos para as estruturas (proibido usar o monitor para isso).

## Fase 1 — Fundação do protocolo (3 arquivos)
- [x] Criar PRD (`prd-project4.md`) derivado do planejamento (project4)
- [x] Criar roadmap (este arquivo) com fases e gates
- [x] Verificar coerência planejamento ↔ PRD ↔ roadmap (mesmo escopo)
- [x] Reportar estado inicial ao monitor OpenCode (recebimento confirmado)
- Gates: 3 arquivos do project4 existem em disco e coerentes; monitor informado.

## Fase 2 — Metodologia Suno V5 / Imagine Dragons
- [x] Pesquisar técnicas atuais de prompting Suno V5 (marcações, style field, performance)
- [x] Sintetizar guia metodológico em `docs/planning/suno-v5-methodology.md`
- [x] Definir contrato de saída dos subagentes (formato exato dos 2 txt)
- Gates: guia existe, cobre os estágios de produção e o formato dos 2 txt. PASSOU (2026-10-08: guia publicado com 8+ fontes 2026; stage-02 registrado).

## Fase 3 — Geração paralela das 11 estruturas
- [x] Mapear os 11 grupos do tipo C e preparar briefs individuais
- [x] Spawnar subagentes simultâneos (1 por grupo, todos os estágios de produção)
- [x] Gerar `data/songs/tipo-c/grupo-{NN}/letra.txt` + `estilo.txt` (11×2)
- [x] Reexecutar isoladamente qualquer grupo com falha
- Gates: 11 pastas × 2 txt existem; nenhum grupo pendente. PASSOU (2026-10-08: 22 artefatos; grupo 11 tem 1 frase no dataset — estruturada via duplicação física permitida pelo guia; estilos dos grupos 2 e 11 ajustados para ≤200 chars).

## Fase 4 — Validação dos artefatos
- [x] Script de validação (fidelidade palavra a palavra, limites de chars, inglês nas instruções)
- [x] Corrigir e revalidar até `VALIDACAO OK`
- Gates: validação automática passa para os 22 txt. PASSOU (2026-10-08: `data/validate_songs_tipo_c.py` → VALIDACAO OK).

## Fase 5 — Integração no app
- [x] Gerar `src/data/wfd-songs-c.ts` a partir dos txt
- [x] Botões "Copiar letra" e "Copiar ritmos" nos grupos do tipo C
- [x] Atualizar head() da rota e rodapé
- Gates: build OK; testes verdes; tipos A/B inalterados. PASSOU (2026-10-08: build OK; vitest 4/4; lint 0 erros; Playwright confirmou botões só no tipo C).

## Fase 6 — Validação final e reporte
- [x] Verificação Playwright (botões, cópia, deep-link)
- [x] Registrar stage status e notificar o monitor (`Stage NN completed`)
- [x] Marcar roadmap 100% e entregar ao usuário
- Gates: build OK; testes verdes; monitor notificado; entrega final. PASSOU (2026-10-08: clipboard da letra com 3087 chars íntegros; ritmos 188 chars).

## Justificativas registradas
- Escopo: planejamento diz "30 estruturas"; tipo C tem 11 grupos → 11 estruturas
  (1 por grupo), conforme decisão D1 da PRD.
