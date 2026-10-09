# Avaliação — Stage 06 (project2 — final fases 1–4)

**Data:** 2026-10-08
**Veredito:** concluída
**Confiança da avaliação:** alta

## Resumo executivo
Project2 (WFD Group Viewer) está 100% entregue e verificado no código: `data/wfd-groups.json` com 31 grupos / 301 frases só-strings e fidelidade total ao dataset, app funcional em `src/routes/index.tsx` (lista, cópia texto/JSON, deep-link `?grupo=N`), validação `VALIDACAO OK` reproduzida pelo monitor, vitest 1/1 e `tsc --noEmit` limpos. Roadmap-proj2 com as 4 fases marcadas [x] e gates PASSOU corresponde ao que o disco mostra.

## Cobertura de requisitos
- Atendido: JSON de grupos (31 arrays, 301 frases, zero metadados, ordem `song_group`+`id` preservada, 22×10 + 9×9); script gerador determinístico; app com lista dos 31 grupos + contagens, painel de frases, `Copiar texto` (join `",\n"` exato), `Copiar JSON` (array do grupo), `JSON (31 grupos)` secundário, feedback ~2s, deep-link `?grupo=N` com fallback 1, `head()` próprio; `src/data/wfd-groups.ts` idêntico ao JSON (31/301, igualdade verificada); dataset original intacto (`id` 1..301).
- Parcial: build OK e verificação visual Playwright (clipboard) — atestados pelo builder via `/tmp/observability` (fora do acesso do monitor), não re-executados nesta avaliação; registrados como confiáveis pelo builder.
- Ausente / não evidenciado: nada do escopo project2. Planejamento `project2.md` (1 linha) integralmente coberto pelo PRD v1 e pelas 4 fases.

## Qualidade do código
Pontos fortes: `validate_groups.py` cobre 8 checagens (parse, 31 grupos, strings não vazias, 8–10, total 301, fidelidade frase a frase, `word_count`, zero metadados); `generate_groups.py` ordena defensivamente e serializa `ensure_ascii=False, indent=2`; `index.tsx` usa só tokens semânticos (`bg-background`, `text-foreground`, `border-border`, `primary`), componentes `ui/` (Button, Card, Badge, ScrollArea, Separator), clipboard apenas em handlers (sem leitura de browser API no render — hidratação preservada), `validateSearch` com bracket access conforme `noPropertyAccessFromIndexSignature`.
Pontos de atenção: `generate_groups.py` linhas 20–21 com `if …: pass` morto (inócuo, sem efeito no output); teste `app-routing.test.tsx` cobre só match de rota `/` (suficiente para o gate, não cobre cópia — cópia coberta pelo Playwright atestado pelo builder).

## Discrepâncias
Nenhuma divergência material entre status declarado e código. Três notas de rastreabilidade: (1) o trio de planejamento canônico `docs/planning/PRD.md`, `ROADMAP.md`, `stages/stage-*-status.md` continua ausente — o projeto usa o trio `.opencode/project2.md`, `prd-project2.md`, `roadmap-proj2.md` como fonte (coerentes entre si, mesmo escopo e versão); (2) validador tolera 8–10 por grupo enquanto o real é 9–10 — tolerância herdada do dataset, não falha; (3) build/Playwright não re-verificados pelo monitor (ver acima).

## Riscos para as próximas etapas
1. Sem `docs/planning/PRD.md`/`ROADMAP.md`/`stages/` canônicos, o histórico formal do roadmap vive só em `.opencode/` — risco baixo, mas um wipe que preserve só `docs/planning/` perderia o vínculo.
2. `src/data/wfd-groups.ts` é cópia versionada do JSON — futuras regenerações do JSON exigem re-gerar o TS (há cabeçalho "não editar manualmente", sem script que o faça; hoje estão idênticos).
3. Sem fallback além de `navigator.clipboard` rejeitado silenciosamente (`() => {}`) — falha de clipboard em browser sem permissão não mostra erro ao usuário.

## Recomendações
1. Espelhar ou referenciar o trio `.opencode/` em `docs/planning/` (ou ao menos `stages/stage-06-status.md`) antes de futuros ciclos — rastreabilidade, não bloqueio.
2. Remover o bloco morto em `generate_groups.py` (linhas 20–21) numa próxima passada de higiene.
3. Se houver project3 consumindo os grupos, definir contrato de import (JSON vs TS) para evitar dupla fonte.

## Evidências consultadas
- `.opencode/project2.md` (planejamento, 1 linha), `.opencode/prd-project2.md` v1 (297 linhas), `.opencode/roadmap-proj2.md` (4 fases [x], gates PASSOU), `.opencode/Plan.md` (protocolo dos 3 arquivos)
- `data/wfd-groups.json` (31 grupos, 301 frases, só strings — verificado), `data/wfd-dataset.json` (301 itens, `id` 1..301 intacto), `data/validate_groups.py` (saída `VALIDACAO OK` reproduzida), `data/generate_groups.py` (determinístico)
- `src/routes/index.tsx` (lista, cópia `",\n"` + `JSON.stringify(...,2)`, `?grupo=N`, `head()`), `src/data/wfd-groups.ts` (31/301, `== JSON` verificado)
- `src/test/app-routing.test.tsx`, `bunx vitest run` (1/1 passed, re-executado), `bunx tsc --noEmit` (limpo, re-executado); build/Playwright: atestado pelo builder via `/tmp/observability`
- `docs/planning/reports/stage-05-eval.md` (etapa anterior, project1), `runtime-skills/15-project-monitor/SKILL.md` + `.opencode/monitor.md` (formato de avaliação)
