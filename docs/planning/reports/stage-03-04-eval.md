# Avaliação — Stage 03-04 (project3: App com seletor A/B/C + Validação e reporte)

**Data:** 2026-10-08
**Veredito:** concluída
**Confiança da avaliação:** alta

## Resumo executivo
Fases 3 e 4 do roadmap-proj3 entregues integralmente e roadmap marcado 100%. O app ganhou seletor A/B/C acessível no cabeçalho com URL `?tipo=A|B|C&grupo=N` validada por `validateSearch`, badge/painel/rótulo do JSON dinâmicos por versão, cópias nos formatos especificados e `head()` atualizado. Verificação independente confirma `VALIDACAO OK`, `build OK`, `tsc --noEmit` limpo e `vitest` 1/1 verde. Sem regressões detectadas.

## Cobertura de requisitos
- Atendido (Fase 3): seletor A/B/C no cabeçalho de `src/routes/index.tsx` — `role="radiogroup"` + `role="radio"` com `aria-checked`, rótulos "10/20/30 em 10/20/30" e destaque `primary` no tipo ativo (§5.1 do PRD).
- Atendido (Fase 3): `validateSearch` normaliza tipo inválido → A e grupo fora da faixa/não-inteiro → 1, com teto por versão (`groupVersions[tipo].groupCount`) — fallback seguro de deep-link (§2.1, §5.2).
- Atendido (Fase 3): navegação em coluna, badge (`N grupos · 301 frases`), título do painel ("Grupo N · Tipo X"), descrição e rótulo `JSON (N grupos)` dinâmicos por versão; cópias `join(",\n")`, `JSON.stringify(grupo, null, 2)` e JSON completo da versão ativa, com feedback ~2s.
- Atendido (Fase 3): `head()` menciona as 3 versões e as 301 frases, com `og:type` e `twitter:card` mantidos (§5.5).
- Atendido (Fase 3): fix de tipos no `Link` do `__root.tsx` (`search={{ tipo: "A", grupo: 1 }}`) — o log de build registra o erro intermediário `TS2322 Property 'tipo' is missing` (07:11:26) e os builds seguintes voltam a `build OK`.
- Atendido (Fase 4): `data/validate_group_versions.py` → `VALIDACAO OK` (reexecutado pelo monitor); roadmap `.opencode/roadmap-proj3.md` com Fases 3 e 4 marcadas `[x]` e linhas de Gates.
- Parcial: nada pendente de escopo.
- Ausente / não evidenciado: nada — Fases 3 e 4 cobertas.

## Qualidade do código
Pontos fortes: `validateSearch` tipado (`HomeSearch`), normalização case-insensitive do tipo e guarda `Number.isInteger` do grupo; `navigateTo` centraliza a navegação com clamp ao teto da versão; `version.groups[groupIndex] ?? []` evita crash em índice ausente; chaves de lista incluem o tipo (`${tipo}-${n}`), evitando reutilização incorreta de DOM entre versões; cópia só em handlers de evento (sem risco de SSR/hidratação); apenas tokens semânticos, sem cores hardcoded.
Pontos de atenção (não bloqueantes): 1) ao trocar de tipo in-app, `navigateTo` faz clamp ao máximo (`Math.min`) em vez de cair para o grupo 1 como o PRD §2.1 descreve — UX razoável (mantém posição próxima), sem UI quebrada, mas diverge da letra do PRD; 2) o teste `src/test/app-routing.test.tsx` cobre apenas o match de `/` e não os novos search params — suficiente para o gate, mas uma asserção de `validateSearch` (tipo inválido → A, grupo fora da faixa → 1) endureceria regressões futuras.

## Discrepâncias
- Positiva: PRD §5.1 pedia botões com `aria-pressed`; o implementado usa `role="radio"` + `aria-checked` dentro de `radiogroup`, que é o padrão ARIA correto para esse controle — melhoria, não defeito.
- Processo: não há `docs/planning/stages/stage-03-status.md` / `stage-04-status.md` — o handoff chegou só como mensagem com evidências. O código e os gates suprem a avaliação, mas fica o registro para o builder retomar o arquivo de status nas próximas etapas.
- Evidência Playwright (seletor → Tipo C com 11 grupos, deep-link `?tipo=C&grupo=2`, clipboard, fallback `?tipo=Z&grupo=999` → A/1, console limpo) aceita do relato do builder: todos os caminhos alegados correspondem a código inspecionado (`validateSearch`, contagens 31/16/11, formatos de cópia) e nenhum ponto contradiz o código.

## Riscos para as próximas etapas
- Baixo: project3 está 100% concluído; não há próxima fase dependente.
- Grupos finais de B e C com 1 frase (resto de 301) renderizam normalmente (lista + painel); nenhum tratamento visual extra exigido pelo PRD.
- Recomendação futura (fora de escopo): alinhar PRD §2.1 ao comportamento de clamp-ao-máximo ou ajustar `navigateTo` para grupo 1, e estender o teste de rota a `validateSearch`.

## Recomendações
Nenhuma correção bloqueante. Avançar para encerramento do project3 / entrega final ao usuário. Opcional: teste de `validateSearch` e alinhamento textual do PRD sobre a transição de tipo.

## Evidências consultadas
- Mensagem de handoff "Stage 03-04 completed (project3)" com evidências declaradas
- .opencode/project3.md (planejamento) → .opencode/prd-project3.md (§2, §5, §6) → .opencode/roadmap-proj3.md (Fases 3 e 4 marcadas [x], 100%)
- docs/planning/stages/stage-02-status.md e docs/planning/reports/stage-02-eval.md (contexto da Fase 2)
- src/routes/index.tsx (seletor, validateSearch, cópias, head) e src/routes/__root.tsx (Link com search tipado)
- src/data/wfd-group-versions.ts (mapa A/B/C)
- Verificação independente: `python3 data/validate_group_versions.py` → VALIDACAO OK; `/tmp/observability/build-errors.log` → build OK (07:13:08, após erro intermediário corrigido em 07:11:26); `bunx vitest run` → 1/1 verde; `bunx tsc --noEmit` → limpo (exit 0); git limpo
