# Avaliação — Stage 01 (project4: Fundação do protocolo)

**Data:** 2026-10-08
**Veredito:** concluída
**Confiança da avaliação:** alta

## Resumo executivo
Fase 1 do roadmap-proj4 entregue integralmente: trio planejamento → PRD → roadmap existe em disco, coerente no mesmo escopo (estruturas Suno V5 para os grupos do tipo C + botões de cópia no app), com a decisão D1 (11 estruturas, 1 por grupo) registrada na PRD §3 e no roadmap. OpenCode responde `{"healthy":true}` em `127.0.0.1:4096`. Nenhum artefato de fase futura foi antecipado.

## Cobertura de requisitos
- Atendido: `.opencode/project4.md` (planejamento, 635 bytes) pede estruturas por grupo do tipo C com 2 txt + paralelismo + botões de cópia.
- Atendido: `.opencode/prd-project4.md` (7032 bytes, 11 seções) deriva do planejamento + `prompt-replicar-artista.md`, define os 2 txt (§2, §5), os 6 estágios (§4), as 6 fases (§8) e os critérios de aceite (§9).
- Atendido: `.opencode/roadmap-proj4.md` (6 fases, gates por fase) com Fase 1 marcada `[x]` e justificativa de escopo ao final.
- Atendido: coerência — os três arquivos descrevem o mesmo produto; o "30" do planejamento é lido como tamanho do grupo (30 em 30), não como contagem de estruturas.
- Atendido: monitor informado (status registra recebimento confirmado via sessão `opencode run` — aceito do relato do builder, sem trilha independente em disco).
- Atendido: OpenCode no ar — health-check reexecutado pelo monitor retorna saudável.

## Qualidade do código
Pontos fortes: PRD com precedência explícita (planejamento > PRD > roadmap; "PRD manda no como"), decisões versionadas D1/D2/D3 (§11), proibição de usar o monitor para gerar estruturas (§7 — respeita a separação builder/monitor), fonte da verdade definida (`data/songs/tipo-c/` → TS gerado).
Pontos de atenção (não bloqueantes): `docs/planning/PRD.md` / `ROADMAP.md` canônicos ausentes — o projeto usa o trio `.opencode/project4.md`, `prd-project4.md`, `roadmap-proj4.md` como fonte (mesma situação já anotada nos evals de project2/project3); risco de rastreabilidade baixo, mas um wipe que preserve só `docs/planning/` perderia o vínculo.

## Discrepâncias
Nenhuma divergência material entre o status declarado (`stages/stage-01-status.md`) e o disco: os 3 arquivos existem, a D1 corresponde ao dataset real (tipo C tem 11 grupos — verificado: 10×30 + 1×1 = 301 frases em `data/wfd-groups-c.json`), e o roadmap marca só a Fase 1 como concluída. Regra de ouro: código é a verdade — e confirma o status.

## Riscos para as próximas etapas
1. **Grupo 11 do tipo C tem 1 frase** (resto de 301 = 10×30 + 1×1). A meta de `letra.txt` ≥ ~2000 chars (≈1000 líricos) é inalcançável com 1 frase sem violar a regra suprema (fidelidade) — a Fase 3 precisa de uma decisão prévia (ex.: permitir duplicação física intensiva como preenchimento, ou registrar exceção formal para o grupo 11). Sem isso, a validação da Fase 4 falhará nesse grupo por construção.
2. Stage 03 (11 subagentes paralelos) ainda não iniciou — `data/songs/` inexistente, o que é correto neste ponto; nenhum acoplamento antecipado.
3. Colisão de nomes em `docs/planning/reports/`: `stage-02-eval.md` já existe e refere-se à Fase 2 do project3, não do project4. Os relatórios do project4 usam sufixo `-project4` para preservar o histórico.

## Recomendações
1. Antes do spawn da Fase 3, decidir e registrar (adendo à PRD §5 ou ao guia) o tratamento do grupo 11 (1 frase): critério de aceite diferenciado ou técnica de preenchimento permitida.
2. Avançar para a Fase 3 conforme o roadmap. Sem correções prévias na Fase 1.

## Evidências consultadas
- docs/planning/stages/stage-01-status.md
- .opencode/project4.md → .opencode/prd-project4.md (§§2–5, §8, §11 D1/D2/D3) → .opencode/roadmap-proj4.md (Fase 1 [x], justificativa)
- .opencode/prompt-replicar-artista.md (§§5–6: 1000+1000 chars, style ≤ 200, observação contraditória)
- data/wfd-groups-c.json (verificação Python: 11 grupos, tamanhos 10×30 + 1×1, total 301)
- Verificação independente: `curl -sf http://127.0.0.1:4096/api/health` → `{"healthy":true}`; `ls data/songs` → inexistente (correto)
