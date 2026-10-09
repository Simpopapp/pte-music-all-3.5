# Avaliação — Stage 03 (project4: Geração paralela das 11 estruturas)

**Data:** 2026-10-08
**Veredito:** concluída
**Confiança da avaliação:** alta

## Resumo executivo
Fase 3 do roadmap-proj4 entregue integralmente: `data/songs/tipo-c/grupo-{01..11}/` contém os 22 artefatos (`letra.txt` + `estilo.txt` por grupo), todos dentro dos limites do guia. A exceção do grupo 11 (1 frase no dataset), sinalizada como risco bloqueante nos evals das Stages 01 e 02, foi resolvida conforme o guia — duplicação física da frase, sem alterar texto — e a letra atinge 2408 chars. Verificação independente confirma letras de 2408–3915 chars, estilos de 185–199 chars sem colchetes e fidelidade íntegra.

## Cobertura de requisitos
- Atendido: 11 pastas × 2 txt existem em `data/songs/tipo-c/` (fonte da verdade, PRD §5).
- Atendido: cada `letra.txt` ≥ ~2000 chars (mínimo real 2408, grupo 11; máximo 3915, grupo 05).
- Atendido: cada `estilo.txt` ≤ 200 chars (faixa real 185–199), sem colchetes (grep confirma zero `[`/`]`).
- Atendido: grupo 11 (1 frase) estruturado via duplicação física da frase — técnica expressamente permitida pelo guia §1 ("duplique fisicamente a linha"); texto da frase inalterado.
- Atendido: estilos dos grupos 2 e 11 ajustados para ≤ 200 chars (reais: 186 e 185).
- Atendido: nenhum grupo pendente; roadmap Fase 3 marcada `[x]` com gate PASSOU.
- Parcial: hooks e BPM do checklist por subagente aceitos do relato do builder (sem trilha em disco além do conteúdo das letras, que contêm BPM e seções).
- Ausente / não evidenciado: nada do escopo da Fase 3.

## Qualidade do código
Pontos fortes: letras seguem o formato V5 do guia (tags uma por linha antes do conteúdo, forma parametrizada com `BPM`/`Energy`, stacking com `|`, ad-libs curtos em parênteses em linha própria — conferido por amostragem no grupo 11); estilos em inglês, separados por vírgula, sem nome de artista; decisão D1 (11 estruturas, não 30) respeitada.
Pontos de atenção (não bloqueantes): 1) o checklist `30/30` do contrato de saída é inaplicável ao grupo 11 (1 frase) — a exceção está declarada no status mas não aditada ao guia; 2) a tolerância de piso do validador (1800 vs ~2000 do guia) continua não documentada — herdado da Stage 02, sem impacto no resultado (o menor grupo tem 2408).

## Discrepâncias
Nenhuma divergência material entre o status declarado (`stages/stage-03-status.md`) e o disco: 22 arquivos existem, faixas de chars declaradas (2408–3915) conferem byte a byte com `wc -c`, e os dois estilos ajustados estão dentro do limite. Regra de ouro: código é a verdade — e confirma o status.

## Riscos para as próximas etapas
1. Nenhum risco herdado do grupo 11 — a exceção foi resolvida dentro do guia e a Fase 4 já valida o resultado.
2. Divergência estilística entre subagentes (risco PRD §10) permanece mitigada só por guia + validador; revisão humana por amostragem continua aconselhável, sem bloqueio.

## Recomendações
1. Aditar ao guia (§3 ou §4) a exceção formal do grupo 11 (duplicação física intensiva como preenchimento permitido) para que futuros re-runs tenham critério escrito.
2. Avançar para as Fases 4–6 conforme o roadmap. Sem correções bloqueantes na Fase 3.

## Evidências consultadas
- docs/planning/stages/stage-03-status.md
- .opencode/prd-project4.md (§§2–5, §9, D1) → .opencode/roadmap-proj4.md (Fase 3 [x], gate PASSOU)
- docs/planning/suno-v5-methodology.md (§§0–1, §3)
- Verificação independente: `ls data/songs/tipo-c/grupo-*/` (11×2 txt); `wc -c` letras (2408–3915) e estilos (185–199); `grep -l '\[' estilo.txt` → zero matches; HEAD do grupo 11 lido integralmente (duplicação física confirmada, frase intacta)
- docs/planning/reports/stage-01-eval-project4.md e stage-02-eval-project4.md (riscos do grupo 11, agora resolvidos)
