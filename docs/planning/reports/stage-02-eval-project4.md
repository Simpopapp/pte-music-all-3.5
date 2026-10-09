# Avaliação — Stage 02 (project4: Metodologia Suno V5 / Imagine Dragons)

**Data:** 2026-10-08
**Veredito:** concluída
**Confiança da avaliação:** alta

## Resumo executivo
Fase 2 do roadmap-proj4 entregue integralmente: `docs/planning/suno-v5-methodology.md` existe (82 linhas, 4576 bytes), cobre os 6 estágios de produção, o formato Suno V5 verificado, o DNA sonoro sem o nome do artista e o contrato de saída dos subagentes — consistente com a PRD §§4–5 e com o `prompt-replicar-artista.md` §§5–6. Roadmap com Fase 2 marcada `[x]` e gate PASSOU corresponde ao disco. Nota de arquivo: `docs/planning/reports/stage-02-eval.md` (sem sufixo) refere-se à Fase 2 do project3; este relatório usa o sufixo `-project4` para preservar o histórico.

## Cobertura de requisitos
- Atendido: guia publicado em `docs/planning/suno-v5-methodology.md` com regra suprema (frases intocáveis, §0), formato V5 (§1: tags uma por linha antes do conteúdo, forma parametrizada, stacking `|` máx. 4–8, ad-libs ≤ 3 palavras, duplicação física em vez de `(x2)`, style sem colchetes/sem nome de artista, alvo ~2000 chars), DNA sem o nome (§2: percussão tribal, arco quiet→loud, BPM 100–124, `Energy: Maximum`), 6 estágios obrigatórios (§3) e contrato de saída (§4: blocos `===LETRA`/`===ESTILO`/`===CHECKLIST`).
- Atendido: contrato de saída definido em dois lugares consistentes (PRD §5 + guia §4).
- Atendido: metas quantitativas alinhadas nas três fontes — letra ~2000 (≈1000 líricos + ≈1000 instruções em inglês), estilo ≤ 200 chars (prompt §5, PRD §2/§5, guia §§1/3).
- Atendido: roadmap Fase 2 marcada `[x]` com gate e data.
- Parcial (rastreabilidade): pesquisa web "8+ fontes 2026" aceita do relato do builder — o conteúdo do guia é tecnicamente plausível e internamente consistente, mas não há trilha de fontes em disco (sem URLs/lista) para auditoria independente.

## Qualidade do código
Pontos fortes: guia como fonte única para os 11 subagentes (mitiga a divergência, risco previsto na PRD §10); instrução de fidelidade com prioridade máxima declarada; estilo com front-load e ordem fixa (gênero → mood → voz → instrumentos → produção → tempo); checklist do contrato exige contagem explícita (`frases: 30/30`, chars de letra/estilo, BPM, hook).
Pontos de atenção (não bloqueantes): 1) grupo 11 (1 frase) torna o checklist `30/30` inaplicável — o guia não prevê exceção; 2) validador antecipado `data/validate_songs_tipo_c.py` usa piso de 1800 chars (tolerância de ~10% sobre os ~2000 do guia) — tolerância razoável, mas deveria estar documentada no guia ou na PRD §9 para não parecer divergência na Fase 4.

## Discrepâncias
Nenhuma divergência material entre o status declarado (`stages/stage-02-status.md`) e o disco: guia existe no path anunciado, cobre o que o status promete, roadmap marca apenas Fases 1–2 como concluídas, e `data/songs/` continua inexistente (Fase 3 corretamente ainda não iniciada). Regra de ouro: código é a verdade — e confirma o status.

## Riscos para as próximas etapas
1. **Grupo 11 (1 frase)** — herdado da Stage 01 e ainda sem decisão: nenhum arranjo honesto de 1 frase atinge ~2000 chars; a Fase 3 vai gerar esse grupo contra um gate impossível salvo exceção formal. Recomendação já registrada no eval da Stage 01.
2. Divergência entre subagentes (risco PRD §10) depende só do guia + validador — o validador cobre fidelidade, limites e colchetes, mas não verifica "inglês nas instruções" além da heurística de tags `[ ]`; instruções em português dentro de tags passariam. Revisão humana por amostragem na Fase 4 é aconselhável.
3. Nomenclatura de relatórios: futuros stages do project4 devem manter o sufixo `-project4` (ou renomear o conjunto legado) para evitar sobrescrita acidental do histórico project1/2/3.

## Recomendações
1. Resolver a exceção do grupo 11 antes do spawn da Fase 3 (adendo à PRD §5 ou ao guia §3).
2. Documentar a tolerância 1800 vs ~2000 do validador (uma linha na PRD §9 ou no guia §3) antes da Fase 4.
3. Avançar para a Fase 3 (11 subagentes paralelos, 1 por grupo) conforme o roadmap. Sem correções bloqueantes na Fase 2.

## Evidências consultadas
- docs/planning/stages/stage-02-status.md
- docs/planning/suno-v5-methodology.md (82 linhas: §§0–4 lidos integralmente)
- .opencode/prd-project4.md (§§2, 4, 5, 9, 10) e .opencode/roadmap-proj4.md (Fases 1–2 [x], Fases 3–6 pendentes)
- .opencode/prompt-replicar-artista.md (§§5–6: limites 1000+1000 e 200 chars, observação contraditória)
- data/validate_songs_tipo_c.py (piso 1800, teto estilo 200, sem colchetes — lido até linha 60)
- Verificação independente: `data/songs/` inexistente (Fase 3 não iniciada — correto); `wfd-groups-c.json` com 11 grupos (contexto do checklist 30/30)
