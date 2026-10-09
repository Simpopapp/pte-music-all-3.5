# Avaliação — Stage 05 (project1 — final fases 1–5)

**Data:** 2026-10-08
**Veredito:** parcial
**Confiança da avaliação:** média

## Resumo executivo
Dataset `data/wfd-dataset.json` existe e está tecnicamente íntegro: 301 itens, ranks 1..301 únicos e monótonos, 31 song_group de 9–10 frases, `word_count` 100% conferido, sem frases duplicadas ou vazias. Não foi possível atestar "Roadmap 100%" porque os 3 artefactos de planeamento (PRD.md, ROADMAP.md, stage status) estão ausentes: `docs/planning/stages/` e `docs/planning/reports/` vazios. Falta também evidência das 3 fontes e do script de validação citados.

## Cobertura de requisitos
- Atendido: 301 frases com `id`, `priority_rank`, `sentence`, `word_count`, `topic`, `song_group`; unicidade; rank sequencial 1..301; 31 grupos (22×10 + 9×9 = 301); `word_count` confere com split() em 301/301.
- Parcial: distribuição `topic` fortemente concentrada (Campus 228/301, Science 36, resto ≤19); `word_count` real 6..15, fora da faixa "lotes 8-10" declarada — 6, 7 e 11–15 existem no dataset.
- Ausente / não evidenciado: PRD.md; ROADMAP.md; `stages/stage-*-status.md` do builder; fontes (ptenepal x2, ptehelper) e critério de recorrência; script de validação citado (parse, unicidade, monotonia, lotes).

## Qualidade do código
Pontos fortes: schema consistente; ficheiro único bem formado (59 KB); verificação independente via Python confirma 0 divergências de `word_count`, 0 duplicadas, grupos dentro de 9–10.
Pontos de atenção: sem testes, sem script versionado, sem documentação de origem — impossível reproduzir o ranking por recorrência; tópicos e faixa de palavras divergem do declarado.

## Discrepâncias
Status declarado ("Roadmap 100% executado fases 1-5", "VALIDACAO OK", "lotes 8-10") vs. código real: dataset cumpre contagens e integridade, mas não há roadmap/PRD/status para confrontar "100%", e a faixa 8–10 não se confirma (min 6, max 15). Regra de ouro: código é a verdade — o dataset vale pelo que contém, não pelo rótulo de conclusão.

## Riscos para as próximas etapas
1. Sem PRD/ROADMAP versionados, qualquer consumo do dataset (player, song_group, UI) não tem contrato.
2. Sem fontes + script, regeneração/correção do ranking não é auditável.
3. Concentração temática e palavras fora de 8–10 podem quebrar pressupostos de quem consumir `topic`/`word_count`.

## Recomendações
1. Repor `docs/planning/PRD.md` e `ROADMAP.md` (ou placeholders com o escopo real das fases 1–5) antes de declarar conclusão.
2. Registar `docs/planning/stages/stage-05-status.md` no formato do protocolo (título, status, data, entregas, ficheiros, notas).
3. Versionar script de validação + lista das 3 fontes e regra de desempate de recorrência.
4. Decidir e documentar: faixa de `word_count` oficial (manter 6–15 real ou filtrar para 8–10) e se a concentração em Campus é intencional.

## Evidências consultadas
- docs/planning/ (PRD.md ausente, ROADMAP.md ausente, stages/ vazio, reports/ vazio)
- data/wfd-dataset.json (301 itens, verificação Python: ranks, unicidade, grupos, word_count, topics)
- runtime-skills/15-project-monitor/SKILL.md + references/protocol.md (formato de avaliação)
- AGENTS.md raiz (regras de remix/monitor: informar falta dos 3 ficheiros ao monitor antes de qualquer pergunta ao utilizador)
