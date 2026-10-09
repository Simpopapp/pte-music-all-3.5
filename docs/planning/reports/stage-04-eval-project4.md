# Avaliação — Stage 04 (project4: Validação dos artefatos)

**Data:** 2026-10-08
**Veredito:** concluída
**Confiança da avaliação:** alta

## Resumo executivo
Fase 4 do roadmap-proj4 entregue integralmente: `data/validate_songs_tipo_c.py` reexecutado pelo monitor retorna `VALIDACAO OK — 11 grupos x 2 txt, fidelidade palavra a palavra confirmada (330 frases)`. As checagens cobrem existência dos 22 txt, fidelidade das frases do dataset dentro das letras, piso de letra, tags Suno e estilo ≤ 200 sem colchetes. O teste `src/test/wfd-songs-c.test.ts` (3 asserts: 11 estruturas, estilo ≤ 200 sem colchetes, fidelidade) passa dentro do `vitest` 4/4 verde. Roadmap Fase 4 marcada `[x]` com gate PASSOU corresponde ao disco.

## Cobertura de requisitos
- Atendido: script de validação existe (`data/validate_songs_tipo_c.py`, 2557 bytes) e passa sem correções pendentes.
- Atendido: fidelidade palavra a palavra confirmada (301 frases do dataset; 330 posições checadas incluindo repetições por duplicação física — contagem coerente com o arranjo).
- Atendido: limites de caracteres e formato (letra ≥ piso, tags presentes, estilo ≤ 200 sem colchetes) — todos verificados de forma independente.
- Atendido: teste de regra no projeto (`wfd-songs-c.test.ts`) verde.
- Parcial: "instruções em inglês" (gate da Fase 4 no roadmap) é coberto por heurística de tags/marcações, não por detecção de idioma — suficiente para o gate, sem verificação linguística exaustiva.
- Ausente / não evidenciado: nada do escopo da Fase 4.

## Qualidade do código
Pontos fortes: validador automático e determinístico (reexecutável, saída única `VALIDACAO OK`); teste no projeto ancora as 3 invariantes (contagem, estilo, fidelidade com normalização de whitespace/case) contra `wfdGroupsC`, de modo que qualquer regeneração futura que quebre fidelidade falha no CI.
Pontos de atenção (não bloqueantes): 1) piso do validador (1800) vs "~2000" do guia/PRD — tolerância razoável e sem efeito prático (mínimo real 2408), mas ainda não documentada; 2) o teste normaliza com `toLowerCase()`, logo uma alteração de caixa nas frases passaria — o validador standalone é o que garante a fidelidade estrita.

## Discrepâncias
Nenhuma divergência entre o status declarado (`stages/stage-04-status.md`) e o disco: o comando anunciado produz exatamente a saída anunciada, e o teste citado existe e passa. Regra de ouro: código é a verdade — e confirma o status.

## Riscos para as próximas etapas
1. Baixo: validador e teste cobrem contagem, fidelidade e limites, mas não o "inglês das instruções" além de heurística — instruções em português dentro de tags passariam. Revisão humana por amostragem já recomendada desde a Stage 02; segue válida, sem bloqueio.
2. Nenhum risco de regressão para a Fase 5: os txt são fonte da verdade e o módulo TS é gerado a partir deles.

## Recomendações
1. Documentar em uma linha (PRD §9 ou guia §3) a tolerância de piso 1800 vs ~2000 antes de futuros ciclos — higiene, não bloqueio.
2. Avançar para as Fases 5–6 conforme o roadmap. Sem correções na Fase 4.

## Evidências consultadas
- docs/planning/stages/stage-04-status.md
- .opencode/roadmap-proj4.md (Fase 4 [x], gate PASSOU)
- data/validate_songs_tipo_c.py (reexecutado: `VALIDACAO OK`, exit 0)
- src/test/wfd-songs-c.test.ts (3 asserts lidos integralmente; verde dentro do `bunx vitest run` 4/4)
- Verificação independente de limites: `wc -c` (letras 2408–3915, estilos 185–199, sem colchetes)
