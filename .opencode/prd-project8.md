# PRD — project8: Tradução, Áudio e Aba Settings (WFD Groups)

> Derivado de `.opencode/project8.md` (planejamento). Precedência de escopo:
> planejamento > PRD > roadmap. Precedência de "como": PRD manda.
> Remix ativado via comando "I've successfully remixed this project...".
> Monitor informado e recebimento confirmado antes de qualquer interação
> com o usuário (regra do Plan.md / AGENTS.md do projeto).

---

## 1. Contexto

O app WFD Groups entrega hoje (estado pós-project7):

- 301 frases Write From Dictation (PTE) em 3 versões de separação:
  - **Tipo A** — 10 em 10 (31 grupos)
  - **Tipo B** — 20 em 20 (16 grupos)
  - **Tipo C** — 30 em 30 (11 grupos)
- Estruturas musicais Suno V5 completas por grupo em todos os tipos
  (`letra` + `estilo`), em `src/data/wfd-songs-{a,b,c}.ts`.
- Home (`/`) com painel do grupo: lista numerada de frases + botões
  "Copiar texto", "Copiar JSON", "Copiar letra", "Copiar ritmos" e
  "JSON (N grupos)".
- Rota `/copiar` (project7) dedicada à cópia rápida letra/ritmos, com
  rastreamento de uso em localStorage (`wfd-copiados-v1`) e destaque do
  próximo grupo por categoria/tipo.
- Stack: TanStack Start v1 (React 19, Vite 7, Tailwind CSS v4), tema escuro
  com tokens semânticos, shadcn/ui, vitest, Playwright (via shell).

A prática real do usuário é **estudar** as frases: ouvir, entender o
significado palavra por palavra e frase por frase, e alternar recursos
sem fricção. Hoje o app não tem tradução, não tem áudio e não tem
nenhuma área de preferências.

## 2. Problema (o que o planejamento resolve)

O usuário estuda frases em inglês (PTE WFD) sem suporte do app:

1. **Sem tradução** — para entender uma palavra ou frase, ele sai do app
   (dicionário externo) e perde a posição e o ritmo de estudo.
2. **Sem áudio** — WFD é um item de *listening*; ouvir a frase com
   pronúncia australiana (sotaque alvo do exame) é parte central do estudo,
   e hoje não existe player de frase.
3. **Sem controle de preferências** — recursos futuros (tradução, voz
   masculina/feminina, IA) precisam de um ponto único de ativação, ou
   cada feature nova viraria poluição na interface da home.

## 3. Objetivo (texto do planejamento, na íntegra)

> adicione 3 coisas : 1- tradução, 2- audio, 3- aba settings da seguinte
> forma: tradução: adicionar 3 tipos de tradução ativaveis/ desativaveis
> na aba settings, tipo 1 = individual: palavra por palavra (vc clica na
> palavra e mostra a tradução literal dela + tradução contextual breve,
> levando em conta o contexto de utilização dela na frase/motivo), 2-
> frases, nesse caso o card expande mostrando a tradução + a tradução não
> literal daquela frase, ou seja levando em conta o contexto geral da
> frase. (cuidado aqui pra os cards não ficarem abrindo durante a rolagem
> da pagina em mobile sem sem click proposital). 3- aba settings pra
> ativar ou desativar esses recursos e outras funções que podem ser uteis
> ou novas que você acha validas de serem colocadas, como pronuncia
> australiana, ou voz masculina/ feminina ou até i.a (futuramente). veja
> a melhor forma de fazer isso

## 4. Interpretação registrada (ambiguidade do planejamento)

O planejamento diz "3 tipos de tradução", mas o item "3" descreve a
**aba settings** ("aba settings pra ativar ou desativar esses recursos e
outras funções"), não um tipo de tradução. Interpretação adotada:

- **Tipo 1 — Tradução individual** (palavra por palavra: literal +
  contextual breve).
- **Tipo 2 — Tradução de frases** (expansão do card: tradução da frase +
  tradução não literal/natural, com contexto geral).
- **Aba Settings** — o terceiro elemento: painel que ativa/desativa os
  recursos e agrupa preferências (áudio, voz, velocidade, futuros).

Ambos os modos de tradução são **independentes e ativáveis
separadamente**; podem coexistir (palavra e frase ativos ao mesmo tempo).
Esta decisão fica registrada como interpretação do escopo; o usuário
poderá corrigi-la sem retrabalho estrutural (os modos já são toggláveis
de forma independente).

## 5. Requisitos (do planejamento → requisitos verificáveis)

### R1 — Tradução individual (palavra por palavra)
- Ativável/desativável na aba settings.
- Ativa: cada palavra do texto da frase na home vira um alvo clicável
  (button inline, mesmo fluxo visual; sem quebra de linha ou layout).
- Clique na palavra → painel/tooltip ancorado mostrando **tradução
  literal** da palavra + **tradução contextual breve** (o que a palavra
  significa no contexto daquela frase/motivo — ex.: "port" como porto vs.
  "ports" de computador).
- O painel fecha ao clicar fora, na própria palavra ou ao trocar de
  frase/grupo; apenas uma palavra aberta por vez.
- Funciona também em mobile (toque); nada de expansão por hover.

### R2 — Tradução de frases (expansão do card)
- Ativável/desativável na aba settings.
- Ativa: cada card de frase do painel do grupo ganha ação explícita de
  expandir (área de toque clara), revelando:
  - **Tradução literal** da frase completa;
  - **Tradução não literal/natural** — como um brasileiro diria aquela
    frase, considerando o contexto geral.
- **Proteção anti-expansão acidental (mobile)**: a expansão ocorre
  SOMENTE com toque proposital. Requisito duro:
  - nunca expandir por rolagem, por toque longo acidental ou por hover;
  - detecção de "tap real": deslocamento do ponteiro < ~10px entre
    touchstart e touchend; qualquer arrasto (scroll) cancela a ação;
  - nenhum handler de expansão em scroll/passive listeners.
- Estado de expansão por frase, não global (cada card se expande
  individualmente); tocar de novo colapsa.

### R3 — Áudio das frases
- Botão de play por frase (e por grupo como conveniência se simples) no
  painel do grupo da home.
- Reprodução com **pronúncia australiana** (inglês en-AU) como padrão do
  estudo PTE, selecionável em settings.
- **Voz masculina ou feminina** selecionável em settings.
- **Velocidade de reprodução** ajustável em settings (0,5× / 0,75× / 1× /
  1,25×) — útil para repetição em WFD.
- Feedback visual de "tocando" no botão durante a reprodução.

### R4 — Aba Settings
- Rota própria `/settings` com link visível no cabeçalho da home
  (ícone de engrenagem + rótulo).
- Agrupa e persiste preferências:
  - Tradução individual (palavra por palavra): ligada/desligada;
  - Tradução de frases: ligada/desligada;
  - Áudio: ligado/desligado;
  - Voz: feminina (padrão) / masculina;
  - Acento: australiano (padrão) / neutro americano (quando disponível
    no provedor de voz);
  - Velocidade: 0,5× / 0,75× / 1× (padrão) / 1,25×.
- Persistência **no navegador** (localStorage, chave versionada), mesmo
  padrão do project7 — sem conta, sem backend de perfil.
- SSR-safe: leitura só em `useEffect` (regra do AGENTS.md; nunca
  `typeof window` no render).
- Espaço rotulado "Em breve" para recursos futuros (ex.: tradução por IA
  avançada) — informativo, não funcional.

### R5 — Fonte das traduções (IA via gateway)
- Traduções geradas por IA no servidor (Lovable AI Gateway) — nunca
  dicionário estático hardcoded no cliente: o requisito de tradução
  **contextual** depende do sentido na frase.
- Contrato por palavra: `{ literal: string, contextual: string }` —
  literal curta (palavra/locução equivalente); contextual breve (1
  frase), considerando a frase completa.
- Contrato por frase: `{ literal: string, natural: string }` — literal
  (tradução direta) e natural (não literal, contexto geral).
- Idioma de destino: **português (pt-BR)** — o usuário é brasileiro.
- Cache obrigatório: mesmo pedido (palavra+frase / frase) não repete
  chamada de IA — cache em memória por sessão + localStorage persistente
  (chave versionada), com deduplicação de requisições simultâneas.
- Estado de carregamento e erro explícitos ("Gerando tradução…" /
  "Não foi possível traduzir — toque para tentar de novo").

### R6 — Áudio (fonte de voz)
- Áudio gerado no servidor (text-to-speech via Lovable AI Gateway) —
  não depender dos vozes do sistema operacional (inconsistentes e sem
  garantia de sotaque australiano).
- Cache do áudio por (frase + voz + velocidade) para evitar regenerar.
- Controles mínimos: play/stop por frase; um áudio por vez.

### R7 — Design coerente com o app
- Tema escuro e tokens semânticos do design system; nenhuma cor
  hardcoded (regra do projeto).
- Traduções e áudio aparecem como camada discreta: o conteúdo de estudo
  (frase) continua dominante; tradução é secundária.
- Responsivo: mobile 1 coluna; hierarquia intacta; sem quebrar os
  elementos existentes da home (copiar, tipos, grupos).
- Acessível: botões de palavra com `aria-label` ("tradução de
  <palavra>"), expansão com `aria-expanded`, player com `aria-pressed`.

### R8 — Integração mínima e não-regressão
- Home continua com TODOS os comportamentos de hoje (copiar, tipos,
  grupos, link para /copiar).
- Rota `/settings` com `head()` próprio (título/descrição específicos).
- Link de volta de `/settings` para a home.

## 6. Decisões técnicas (registradas)

- **D1 — Lovable Cloud + AI Gateway**: tradução contextual e TTS exigem
  IA server-side. Lovable Cloud será ativado; as chamadas de IA passam
  por `createServerFn` (app-internal), nunca expostas no cliente.
- **D2 — Settings como rota própria** `/settings` (`src/routes/settings.tsx`):
  área de preferências completa, link no header. Alternativa (sheet na
  home) descartada por poluir a home e não escalar para recursos futuros.
- **D3 — Hook de settings** `src/hooks/use-wfd-settings.ts`: estado
  React + leitura em `useEffect` (SSR-safe) + gravação imediata em
  `wfd-settings-v1` (localStorage, JSON tipado com defaults).
- **D4 — Tradução por IA com cache**: `src/server/translate.ts`
  (createServerFn) chamando o AI Gateway; saída JSON estrita; cache
  duplo (Map em memória + `wfd-traducoes-v1` no localStorage) e
  deduplicação de pedidos idênticos em voo.
- **D5 — TTS por IA**: `src/server/tts.ts` (createServerFn) gerando
  áudio (mp3/wav) no servidor; cache por (frase, voz, velocidade) em
  memória/Blob URL; playback via `<audio>`/HTMLAudioElement criado no
  cliente (browser-only).
- **D6 — Tap proposital**: componente de frase com detecção de tap
  (pointerdown/pointerup com distância < 10px e duração < 500ms); hover
  nunca expande; fallback `click` para desktop.
- **D7 — Palavra clicável**: tokenização do texto por regex de palavras
  (preserva pontuação); apenas palavras reais viram botão; estado
  "palavra aberta" vive no card (uma por card).
- **D8 — Idioma de destino**: pt-BR fixo por enquanto (usuário brasileiro);
  seletor de idioma fica para o futuro.
- **D9 — Sem dados novos no dataset**: nenhuma frase/letra/ritmo muda;
  tradução e áudio são derivadas em runtime + cache.

## 7. Escopo por fase

1. **Fundação do protocolo** — PRD + roadmap criados a partir do
   planejamento; monitor informado (relato de arquivos ausentes) com
   recebimento confirmado; coerência entre os 3 arquivos.
2. **Backend de IA** — ativar Lovable Cloud; funções server de tradução
   (palavra e frase) e TTS via AI Gateway; contrato e tratamento de erro.
3. **Aba Settings** — rota `/settings`, hook de settings com persistência
   localStorage SSR-safe, toggles dos recursos, preferências de voz e
   velocidade, link no header.
4. **Tradução individual** — modo palavra por palavra na home: palavras
   clicáveis, painel literal + contextual, cache e estados.
5. **Tradução de frases** — expansão proposital do card com tradução
   literal + natural; proteção anti-expansão acidental no scroll mobile.
6. **Áudio** — player por frase na home, TTS com voz australiana e
   seleção masculina/feminina, velocidade, cache de áudio.
7. **Validação final e reporte** — testes (settings + cache + tap),
   build, lint, Playwright (botões, expansão, settings, reload), status
   por stage, notificação ao monitor, entrega ao usuário.

## 8. Critérios de aceite

- [ ] `/settings` existe, abre/fecha pelo header, e persiste preferências
      entre reloads (localStorage, SSR-safe).
- [ ] Com tradução individual ativa, clicar numa palavra mostra tradução
      literal + contextual; com desativada, palavras não são clicáveis.
- [ ] Com tradução de frases ativa, toque proposital expande o card
      mostrando tradução literal + natural; arrasto/scroll NÃO expande.
- [ ] Com áudio ativo, cada frase tem botão de play funcional; voz
      masculina/feminina e velocidade respeitam as settings.
- [ ] Mesma tradução/áudio pedida duas vezes não chama IA duas vezes
      (cache verificado por teste).
- [ ] Falha de IA mostra estado de erro e permite tentar de novo.
- [ ] Home sem regressão: copiar texto/JSON/letra/ritmos e navegação de
      tipos/grupos funcionam como antes.
- [ ] `bunx vitest run` verde (settings + cache); `bun run build` OK;
      `npm run lint` sem erros.
- [ ] Verificação Playwright: toggles, expansão por tap, reload com
      preferências, player presente.
- [ ] Monitor notificado por fase concluída, com relatórios em
      `docs/planning/reports/`.

## 9. Riscos e mitigações

- **Hidratação (SSR + localStorage)** → leitura de settings/cache só em
  `useEffect`; teste do hook; verificação Playwright.
- **Custo/latência de IA** → cache duplo + deduplicação; tradução só sob
  clique (lazy); nenhuma geração em massa na carga da página.
- **Expansão acidental em mobile** → detecção de tap por deslocamento
  (< 10px) e duração (< 500ms); testes de componente; Playwright touch.
- **Voz australiana indisponível no provedor** → fallback transparente
  para voz neutra com indicação discreta; setting guarda a intenção.
- **Regressão na home** → alterações aditivas na home (tokens clicáveis
  e player); botões de copiar intocados; testes de rota existentes
  (`app-routing.test.tsx`) continuam verdes.
- **Perda de preferências** → gravação imediata no toggle; chave
  versionada (`-v1`); merge com defaults na leitura (esquema evolutivo).

## 10. Registros de decisão

- Interpretação dos "3 tipos de tradução" conforme seção 4.
- D1..D9 conforme seção 6. Nenhuma decisão altera dados do dataset.
- Idioma de destino pt-BR fixo (D8) — decisão do builder registrada;
  reversível sem retrabalho estrutural.
