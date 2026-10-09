# PRD — project7: Página de Cópia Rápida (Letra e Ritmos)

> Derivado de `.opencode/project7` (planejamento). Precedência de escopo:
> planejamento > PRD > roadmap. Precedência de "como": PRD manda.

---

## 1. Contexto

O app WFD Groups já entrega:

- 301 frases Write From Dictation (PTE) em 3 versões de separação:
  - **Tipo A** — 10 em 10 (31 grupos)
  - **Tipo B** — 20 em 20 (16 grupos)
  - **Tipo C** — 30 em 30 (11 grupos)
- Estruturas musicais Suno V5 completas por grupo em **todos os tipos**
  (project4/5/6): `letra` (letra completa com marcações de performance) e
  `estilo` (elementos de estilo ≤ 200 chars), expostas via `src/data/wfd-songs-{a,b,c}.ts`.
- Na página principal (`/`), cada grupo já tem botões "Copiar letra" e
  "Copiar ritmos" — mas eles convivem com os botões de texto/JSON e exigem
  navegar tipo → grupo → copiar, um grupo por vez.

## 2. Problema (o que o planejamento resolve)

O fluxo de produção real do usuário é **consumir as estruturas musicais em
sequência**: copiar letra + ritmos do grupo 1, depois do 2, e assim por diante,
por tipo. Hoje isso é lento e fácil de perder a posição:

1. Os botões de cópia musical dividem espaço com botões de texto/JSON na home.
2. Não há registro de **quais grupos já foram usados** — o usuário esquece
   onde parou entre sessões.
3. Não há indicação de **qual é o próximo** da sequência lógica em cada
   categoria (letra / ritmos) de cada tipo.

## 3. Objetivo (texto do planejamento, na íntegra)

> criar uma pagina focada exclusivamente em facilitar os botões de copiar
> letra e ritmo sem separação de paginas mas com um layout e design muito bem
> planejado pra ser bonito, intuitivo e focado nesses 2 botões facilmente
> identificaveis e salvando só no navegador quais botões ja foram usados, pra
> facilitar lembrar qual é o proximo de qual categoria na sequencia logica de
> cada tipo. ou seja, organizado, bonito, facil e intuitivo

## 4. Requisitos (do planejamento → requisitos verificáveis)

### R1 — Página única, sem separação de páginas
- Nova rota `/copiar` com **tudo em uma única página**.
- Os 3 tipos (A/B/C) aparecem na mesma página, em seções distintas com
  navegação por âncora/scroll — **não** em rotas ou páginas separadas.
- Nenhuma frases individual exibida em destaque; o foco é copiar, não ler.

### R2 — Foco nos 2 botões
- Por grupo: exatamente 2 botões grandes e facilmente identificáveis —
  **"Copiar letra"** e **"Copiar ritmos"**.
- Botões com hierarquia visual dominante; qualquer outro elemento (números,
  contadores) é secundário e discreto.
- Feedback visual de cópia (ícone de check + estado "Copiado!"/"usado").

### R3 — Registro no navegador (localStorage)
- Ao copiar com sucesso, registrar **só no navegador** (sem backend):
  chave `tipo-grupo-categoria`, ex.: `A-3-letra`, `C-11-ritmos`.
- Persistente entre sessões (mesmo navegador).
- Nada de dados pessoais; é um booleano por botão, ~120 registros no máximo.

### R4 — Próximo da sequência lógica
- Por **tipo** e por **categoria** (letra, ritmos), o próximo é o grupo de
  menor número ainda não copiado.
- A página destaca visualmente o próximo grupo de cada categoria em cada tipo.
- Resumo por tipo: progresso (n/N) e próximo grupo de letra e de ritmos.
- Ação rápida "copiar próximo" não é exigida; o destaque visual basta.

### R5 — Organizado, bonito, fácil e intuitivo
- Design coerente com o design system atual (tema escuro, dourado primário,
  Space Grotesk/Fraunces, tokens semânticos) — sem cores hardcoded.
- Responsivo (mobile: 1 coluna; desktop: grade de cards).
- Acessível: botões com `aria-label`/`aria-pressed`, seções com `aria-labelledby`.

### R6 — Integração mínima com o app existente
- Link visível na home (`/`) para `/copiar` e de volta na página de cópia.
- A home continua intacta: mesmos botões e comportamento de hoje.
- `head()` próprio na rota com título/descrição/og específicos do app.

## 5. Decisões técnicas (registradas)

- **D1 — Rota nova `/copiar`** (`src/routes/copiar.tsx`): página dedicada em
  vez de reformular a home; a home fica intocada (menor risco de regressão).
- **D2 — Fonte dos dados:** reutilizar `groupVersions` + `wfd-songs-a/b/c`
  já existentes. Nenhum dado novo é gerado neste projeto.
- **D3 — Estado de uso via hook dedicado** `src/hooks/use-copied-tracker.ts`:
  leitura/escrita de localStorage em `useEffect` (SSR-safe — nunca `typeof
  window` no render), estado React + gravação por evento de cópia bem-sucedido.
- **D4 — Chave de armazenamento:** `wfd-copiados-v1`, JSON
  `{ "A-3-letra": true, ... }`.
- **D5 — Categorias:** `letra` (conteúdo de `song.letra`) e `ritmos`
  (conteúdo de `song.estilo`), mesmos textos dos botões da home.
- **D6 — Sem backend:** nenhum dado novo no Lovable Cloud; localStorage
  apenas (o planejamento diz "salvando só no navegador").

## 6. Escopo por fase

1. **Fundação do protocolo** — PRD + roadmap + monitor informado.
2. **Página de cópia** — rota `/copiar`, layout das seções por tipo, cards
   por grupo com os 2 botões grandes e feedback de cópia.
3. **Persistência e sequência** — hook localStorage, marcação de usados,
   destaque do próximo por categoria/tipo, resumo de progresso por tipo.
4. **Integração** — links home ↔ `/copiar`, `head()` da rota, rodapé.
5. **Validação final e reporte** — testes, build, lint, Playwright, status
   por stage, notificação ao monitor, entrega ao usuário.

## 7. Critérios de aceite

- [ ] Rota `/copiar` renderiza A, B e C **na mesma página** (58 grupos,
      116 botões de cópia, sem troca de página).
- [ ] Cada grupo tem exatamente 2 botões: "Copiar letra" e "Copiar ritmos",
      com conteúdo idêntico aos botões da home (mesma fonte de dados).
- [ ] Copiar com sucesso grava no localStorage e sobrevive a reload.
- [ ] O próximo grupo não copiado de cada categoria/tipo fica destacado.
- [ ] Progresso por tipo (letra n/N, ritmos n/N) visível.
- [ ] Home inalterada em comportamento; links de ida e volta funcionam.
- [ ] `bunx vitest run` verde (inclui teste do tracker); `bun run build` OK;
      `npm run lint` sem erros.
- [ ] Verificação Playwright da página (botões, estado usado, reload).
- [ ] Monitor informado por fase concluída, com relatórios em
      `docs/planning/reports/`.

## 8. Riscos e mitigações

- **Hidratação (SSR + localStorage)** → leitura só em `useEffect`; teste do
  hook; verificação Playwright.
- **Página pesada (58 grupos)** → cards compactos e leve; sem imagens;
  conteúdo já estático nos módulos TS.
- **Regressão na home** → `/copiar` é rota nova; nenhum arquivo da home é
  alterado além do link no cabeçalho.
- **Perda de registro** → gravação imediata no evento de sucesso da cópia;
  chave versionada (`-v1`) para evolução futura sem conflito.

## 9. Registros de decisão

- D1..D6 conforme seção 5. Nenhuma decisão exige dados novos ou backend.
