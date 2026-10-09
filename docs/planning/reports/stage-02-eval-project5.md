# Avaliação — Stage 02 (project5)

**Data:** 2026-10-08
**Veredito:** concluída
**Confiança da avaliação:** alta

## Resumo executivo
Fase 2 (Metodologia adaptada ao tipo B) entregue integralmente: `docs/planning/suno-v5-methodology.md` cresceu de guia do project4 para 100 linhas com §5 dedicado ao tipo B (seções menores, duplicação, instruções densas, grupo 16, checklist 20/20); contrato de saída dos subagentes confirmado no PRD §15 para 16 grupos; §§0–4 intocadas como declarado.

## Cobertura de requisitos
- Atendido: §5 (linhas 84–100) cobre grupos de 20 frases — seções com 3–4 frases, estrutura mínima Intro→Outro preservada, máx. 1–2 duplicações por grupo, hook até 3×, instruções densas para ~1000 chars, grupo 16 estilo "single/anthem" com duplicação física.
- Atendido: contrato de saída confirmado — PRD §15 fixa `===LETRA/ESTILO/CHECKLIST===` para grupos 1–16 com `data/wfd-groups-b.json`; §5 fixa checklist `20/20` (grupo 16: `1/1 (duplicação física)`).
- Atendido: nenhuma regra das §§0–4 alterada (diff conceitual: só adição do §5); nenhuma pesquisa nova — guia validado no project4 reutilizado, como previsto no roadmap.
- Atendido: roadmap Fase 2 marcada `[x]` com linha de Gates "PASSOU (2026-10-08: §5 ... adicionado)".

## Qualidade do código
Pontos fortes: §5 referencia dataset, precedente (grupo 11 do tipo C) e limites corretos; PRD §4 antecipa a diferença de densidade (20 vs 30 frases) de forma consistente com o §5.
Pontos de atenção (não bloqueantes): o corpo das §§3–4 ainda diz "30 frases", "grupos (1–11)" e `data/wfd-groups-c.json` — correto como documento-fonte do project4, mas um subagente apressado pode ler o número errado antes de chegar ao §5; o §5 e o PRD §15 dão o número certo, de modo que o risco é de atenção, não de bloqueio.

## Discrepâncias
Nenhuma entre status e disco: §5 existe com o conteúdo declarado; contrato existe no PRD §15; roadmap Fase 2 corresponde. Nota de formato: `stage-02-status.md` (5 linhas) não traz campo `Status:` explícito nem hash de verificação do guia — o handoff "Stage 02 completed" e o conteúdo do §5 suprem a avaliação. Regra de ouro aplicada: o código (guia em disco) é a verdade, e ele confirma o status.

## Riscos para as próximas etapas
- Médio-baixo: ambiguidade residual 30 vs 20 frases no mesmo arquivo — mitigável com uma linha de cabeçalho no §5 ("para tipo B, ler 30 como 20, 1–11 como 1–16") ou instruindo subagentes a ler PRD §15 + §5 como autoridade; sem isso, aumenta a chance de checklist errado (`30/30`) num grupo do tipo B.
- Baixo: `data/songs/tipo-b/` já gerado (16×2 txt, 09:31–09:32) antes desta avaliação — se algum txt fugiu ao §5, a Fase 4 (validador) pega; nenhum re-trabalho de metodologia exigido agora.
- Baixo: colisão de nomes em `stages/`/`reports/` entre projetos (ver eval Stage 01) — este relatório usa sufixo `-project5` para não sobrescrever `stage-02-eval.md` do project3.

## Recomendações
Avançar para as Fases 3–6 sem reabrir metodologia. Opcional (não bloqueante): (1) trocar no §5 a frase "Nenhuma regra das seções 0–4 muda" por remissão explícita de leitura ("onde se lê 30/1–11/wfd-groups-c.json, ler 20/1–16/wfd-groups-b.json no project5"); (2) checagem amostral de 1–2 `letra.txt` do tipo B contra o checklist `20/20` na Fase 4.

## Evidências consultadas
- docs/planning/stages/stage-02-status.md (5 linhas, project5, 09:30)
- docs/planning/suno-v5-methodology.md (100 linhas; §5 linhas 84–100)
- .opencode/prd-project5.md (§4 metodologia, §13 inventário, §15 contrato tipo B)
- .opencode/roadmap-proj5.md (Fase 2 [x] + Gates PASSOU)
- data/wfd-groups-b.json (16 listas, [20×15, 1] — base do §5)
- data/songs/tipo-b/ (16 pastas × letra.txt+estilo.txt — geração adiantada, fora do escopo mas confirma aplicabilidade do §5)
