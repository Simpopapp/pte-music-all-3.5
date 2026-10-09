# Stage 01 — project7: Página de Cópia Rápida (Letra e Ritmos)

**Data:** 2026-10-08
**Status:** concluída
**Responsável:** builder (agente principal)

## O que foi entregue

- Rota nova `/copiar` (`src/routes/copiar.tsx`): página única com as seções
  dos tipos A, B e C (58 grupos, 116 botões de cópia), navegação por âncora
  no cabeçalho fixo, cards por grupo com os 2 botões grandes
  ("Copiar letra" / "Copiar ritmos") e feedback de cópia.
- Persistência no navegador: hook `src/hooks/use-copied-tracker.ts` com
  localStorage (`wfd-copiados-v1`), leitura SSR-safe em `useEffect`.
- Sequência lógica: destaque do próximo grupo por categoria (letra/ritmos)
  em cada tipo, com badges de progresso (letra n/N, ritmos n/N) por tipo.
- Integração: link "Copiar letra & ritmos" no cabeçalho da home e botão de
  volta; `head()` próprio na rota; rodapé informativo. Comportamento da home
  inalterado.
- Testes: `src/test/use-copied-tracker.test.ts` (5 testes das funções puras).

## Evidências de verificação

- `bunx vitest run`: 15/15 verdes (5 arquivos).
- `bun run build`: OK (nitro build concluído).
- `npm run lint`: 0 erros (6 warnings pré-existentes de react-refresh).
- `bunx tsc --noEmit`: exit 0 — 2 erros iniciais (Link sem `search` em
  `copiar.tsx` e índice `version.groups[i]` sem guarda) corrigidos após
  apontamento do monitor; reexecutado até verde.
- Playwright (1280×1800): link da home → /copiar; 116 botões; cópia da letra
  do grupo 1 tipo A com 2253 chars no clipboard e "Copiado!" com check;
  cópia de ritmos com 199 chars; `localStorage` = {"A-1-letra":true,
  "A-1-ritmos":true} persistindo após reload ("Letra copiada"/"Ritmos
  copiados", aria-pressed=true); badges "Próxima letra/Próximos ritmos:
  Grupo 2" e card do Grupo 2 destacado; seção do tipo C acessível por
  âncora; retorno à home OK; zero pageerrors.
