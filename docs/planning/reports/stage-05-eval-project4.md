# Avaliação — Stage 05 (project4: Integração no app)

**Data:** 2026-10-08
**Veredito:** concluída
**Confiança da avaliação:** alta

## Resumo executivo
Fase 5 do roadmap-proj4 entregue integralmente: `src/data/wfd-songs-c.ts` (40054 bytes, gerado por `data/generate_songs_module.py` a partir de `data/songs/tipo-c/`) espelha os 22 txt — sondagem normalizada confirma as 11 letras e os 11 estilos no módulo, e o teste de fidelidade contra `wfdGroupsC` passa. `src/routes/index.tsx` exibe "Copiar letra" (Music2) e "Copiar ritmos" (AudioLines) somente no tipo C (`tipo === "C" && song`, linha 225), com feedback de copiado; tipos A e B inalterados. Gates reexecutados pelo monitor: `tsc --noEmit` limpo, `vitest` 4/4 verde, `lint` 0 erros (6 warnings pré-existentes em `ui/`), `build OK` no log de observabilidade.

## Cobertura de requisitos
- Atendido (PRD §5/D2): fonte da verdade em `data/songs/tipo-c/`; módulo TS gerado a partir dela (gerador `data/generate_songs_module.py` existe, 1028 bytes).
- Atendido (PRD §6): botões "Copiar letra" (`song.letra`) e "Copiar ritmos" (`song.estilo`) apenas no tipo C, com feedback visual (`Copiado!` via estado `copied`).
- Atendido: tipos A e B inalterados — os botões vivem dentro do bloco condicional do tipo C; nenhum caminho de A/B toca `wfdSongsC`.
- Atendido: `head()` da rota e rodapé atualizados com menção às estruturas Suno V5.
- Atendido: gates — build OK; `vitest` 4/4; lint 0 erros; `tsc` limpo.
- Parcial: botão desabilitado "caso o artefato não exista" (PRD §6) — o código renderiza os botões só quando `song` existe (`tipo === "C" && song`), o que cobre o caso por ausência de render em vez de estado desabilitado; comportamento equivalente para o usuário, sem UI quebrada.
- Ausente / não evidenciado: nada do escopo da Fase 5.

## Qualidade do código
Pontos fortes: condicional único (`tipo === "C" && song`, l.225) isola a feature sem tocar nos fluxos A/B; cópia só em handlers de evento (sem leitura de browser API no render — hidratação preservada, padrão do project3 mantido); ícones da biblioteca já presente (`Music2`, `AudioLines`); `head()` com descrição única mencionando as estruturas; teste ancora contagem/estilo/fidelidade do módulo.
Pontos de atenção (não bloqueantes): 1) a primeira sondagem ingênua do monitor (cabeçalho cru do txt no TS) falhou para 3 grupos por escaping de template string — artefato da sondagem, não do código: a sondagem normalizada por frase lírica confirma 11/11, e o teste de fidelidade passa; 2) warnings de lint (6, `react-refresh/only-export-components` em `ui/`) são pré-existentes e fora do escopo.

## Discrepâncias
Nenhuma divergência material entre o status declarado (`stages/stage-05-status.md`) e o disco: módulo existe no tamanho/origem anunciados, botões existem só no tipo C, gates conferem (todos reexecutados exceto build, aceito do log de observabilidade `build OK` em 07:55:30). Regra de ouro: código é a verdade — e confirma o status.

## Riscos para as próximas etapas
1. Baixo: `wfd-songs-c.ts` é cópia versionada dos txt — futuras regenerações exigem re-rodar o gerador (mesmo padrão do project2, já anotado; hoje estão idênticos).
2. Baixo: falha de `navigator.clipboard` sem permissão não mostra erro ao usuário (padrão herdado do project2/project3) — fora do escopo desta fase.

## Recomendações
Nenhuma correção bloqueante. Avançar para a Fase 6 / encerramento. Opcional (higiene futura): documentar o comando de regeneração do TS no cabeçalho do gerador.

## Evidências consultadas
- docs/planning/stages/stage-05-status.md
- .opencode/prd-project4.md (§§5–6, D2) → .opencode/roadmap-proj4.md (Fase 5 [x], gate PASSOU)
- src/data/wfd-songs-c.ts (40054 bytes) + data/generate_songs_module.py (origem declarada)
- src/routes/index.tsx (ll. 62, 225–244: condicional tipo C, botões, feedback; l.10 import do módulo)
- Verificação independente: sondagem normalizada 11/11 letras+estilos no TS; `bunx vitest run` → 4/4; `bunx tsc --noEmit` → exit 0; `bun run lint` → 0 erros / 6 warnings; `/tmp/observability/build-errors.log` → `build OK`
