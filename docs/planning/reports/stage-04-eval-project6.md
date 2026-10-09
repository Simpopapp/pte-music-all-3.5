# Avaliação — Stage 04 (project6)

**Data:** 2026-10-08
**Veredito:** concluída
**Confiança da avaliação:** alta

## Resumo executivo
Validação dos artefatos passa de forma independente. `data/validate_songs_tipo_a.py` retorna VALIDACAO OK — 31 grupos × 2 txt, 301 frases íntegras palavra a palavra. Correções dos grupos 12 e 25 confirmadas (nenhum estilo acima de 200 chars).

## Cobertura de requisitos
- Atendido: script de validação existe (fidelidade palavra a palavra, piso de letra, tags Suno, estilo ≤200, sem colchetes).
- Atendido: reexecução independente nesta avaliação → `VALIDACAO OK — 31 grupos x 2 txt (301 frases)`.
- Atendido: correções 12/25 — verificação atual mostra zero estilos >200 chars.
- Parcial (tolerado): 3 letras abaixo do alvo ~2000 (g11 1943, g27 1950, g28 1883) mas acima do piso do validador (1800, `alvo ~2000`). O "~" do PRD admite a tolerância; o validador é a referência operacional e passa.

## Qualidade do código
Pontos fortes: validador espelha o padrão project4/5 com limiar ajustado ao tipo A; checa dataset (31 grupos), presença dos 62 txt, fidelidade normalizada, tags `[`, estilo sem colchetes e não-vazio.
Pontos de atenção: o piso 1800 vs alvo ~2000 deveria estar documentado no cabeçalho do script ou no PRD para evitar leitura de "VALIDACAO OK" como "todas ≥2000" — observação documental, não bloqueante.

## Discrepâncias
Nenhuma material. Status declara VALIDACAO OK e correções 12/25; reexecução confirma ambos. Código é a verdade e confirma o status.

## Riscos para as próximas etapas
- Letras curtas (g28 1883) geram músicas Suno mais curtas — aceitável, sem ação; o módulo TS deve refletir os txt sem edição.

## Recomendações
- Opcional: anotar no PRD/validador que o piso operacional é 1800 (alvo ~2000). Não impede a Fase 5.

## Evidências consultadas
- docs/planning/stages/stage-04-status.md; .opencode/roadmap-proj6.md (Fase 4 [x], PASSOU)
- data/validate_songs_tipo_a.py (70 linhas; piso 1800, teto estilo 200)
- Reexecução: `python3 data/validate_songs_tipo_a.py` → VALIDACAO OK (301 frases); estilos >200: NONE; letras <2000: g11/g27/g28 (todas ≥1883)
