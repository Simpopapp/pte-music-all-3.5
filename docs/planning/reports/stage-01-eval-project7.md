# Avaliação — Stage 01 (project7) — entrega final (reverificada)

**Data:** 2026-10-08
**Veredito:** concluída
**Confiança da avaliação:** alta

## Resumo executivo
Página `/copiar` entregue e fiel ao planejamento: 58 grupos (31+16+11, confirmado via `groupVersions`) com 116 botões em rota única, hook `wfd-copiados-v1` SSR-safe, destaque do próximo por categoria/tipo e links home ↔ `/copiar`. Os 2 erros de tipo apontados na avaliação anterior foram corrigidos (`Link search`, guarda de índice) e todos os gates reexecutados pelo monitor estão verdes: tsc exit 0, vitest 15/15, build OK, lint 0 erros. Remix finalizado.

## Cobertura de requisitos
- Atendido: R1 página única — `src/routes/copiar.tsx` (333 linhas) renderiza A/B/C na mesma página com âncoras `#tipo-a/b/c` e `head()` próprio (título/descrição/og).
- Atendido: R2 2 botões — cada card tem exatamente `Copiar letra` (song.letra) e `Copiar ritmos` (song.estilo), mesma fonte da home; feedback `Copiado!` + check; `aria-pressed`/`aria-label` presentes.
- Atendido: R3 localStorage — hook `src/hooks/use-copied-tracker.ts` (97 linhas), chave `wfd-copiados-v1`, leitura em `useEffect` (SSR-safe), parse tolerante; 5 testes das funções puras.
- Atendido: R4 próximo — menor grupo não copiado por categoria/tipo, badges `Próxima letra/Próximos ritmos: Grupo N` + destaque no card + progresso `letra n/N · ritmos n/N` por tipo.
- Atendido: R5 design/acessibilidade — tokens semânticos (sem cores hardcoded), grade responsiva (1→4 colunas), seções com `aria-labelledby`.
- Atendido: R6 integração — link home→`/copiar` (`src/routes/index.tsx` L152–159) e volta com `search={{ tipo: "A", grupo: 1 }}`; contagens clipboard batem ao char com a home (A g1 letra 2253 / estilo 199, verificado via bun).
- Atendido: roadmap 100% (5/5 fases `[x]` com Gates PASSOU) e `docs/planning/stages/stage-01-status-project7.md` atualizado com o gate de tipos.

## Qualidade do código
Pontos fortes:
- Reuso sem duplicação: `songsByType` + `groupVersions` como fonte única; `CopyButton`/`TypeSection` tipados; funções puras testadas incluindo lixo/sequência completa.
- SSR-safe real: nenhum `window`/`localStorage` no render; `hydrated` gateia a gravação; fallback silencioso em modo privado.
- Regressão contida: home só ganha o link; botões e comportamento existentes intactos.
- Correção dos tipos cirúrgica e idiomática: `search` explícito no `Link` de volta; `version.groups[i]?.length ?? 0` sem supressões nem casts.
Pontos de atenção (não bloqueantes):
- PRD com 139 linhas vs mínimo formal 500 — aceito pela máxima qualidade-acima-da-facilidade (escopo estreito, conteúdo completo).
- `flash` com `setTimeout` sem cleanup no unmount — irrelevante na prática.

## Discrepâncias
Nenhuma pendência. Avaliação anterior marcou `parcial` exclusivamente pelos 2 erros `tsc`; ambos corrigidos e reverificados no disco (`copiar.tsx:81` com `search`, `copiar.tsx:231` com `?.` + `?? 0`). Status, roadmap e código convergem. Regra de ouro: código confirma o status.

## Riscos para as próximas etapas
- Nenhum — roadmap encerrado. Residual: página com 116 botões carrega 3 datasets Suno no bundle (rota 13.26 kB + chunks, build 1.08s) — monitorar peso se letras crescerem.

## Recomendações
- Declarar remix finalizado (recebido: `remix finalizado (+5 fases do roadmap do project7 efetuadas)`).
- Sem novas fases; evoluções futuras (ex.: "copiar próximo" em 1 clique, limpar progresso) como novo remix.

## Evidências consultadas
- docs/planning/stages/stage-01-status-project7.md (atualizado com gate tsc); .opencode/roadmap-proj7.md (5/5 [x]); .opencode/prd-project7.md (R1–R6, D1–D6)
- src/routes/copiar.tsx L79–86 (Link com search), L230–232 (guarda de índice); src/hooks/use-copied-tracker.ts; src/routes/index.tsx L152–159
- Reverificação independente: `bunx tsc --noEmit` → exit 0; `bunx vitest run` → 15/15; `npm run lint` → 0 erros (6 warnings pré-existentes `ui/`); `bun run build` → OK; groupCounts 31/16/11=58 e A-g1 2253/199 conferem
