# PRD — project3: Versões de separação de grupos (Tipo A / B / C)

- **Projeto:** project3
- **Fonte de escopo:** `.opencode/project3.md` (planejamento)
- **Derivação:** PRD criado conforme o protocolo de 3 arquivos (`.opencode/Plan.md`), caso "1 existe: crie os outros 2 e depois execute"
- **Dependência:** artefatos do project1 (`data/wfd-dataset.json`) e project2 (`data/wfd-groups.json`, app WFD Group Viewer)
- **Status:** v1 — aprovado para execução
- **Monitor:** estado inicial reportado ao OpenCode (porta 4096) antes da execução

---

## 1. Visão geral

### 1.1 Problema

O app do project2 expõe os 301 grupos do WFD Group Viewer com **uma única
separação** de grupos (a original do dataset: lotes de 8–10 frases). O
consumidor downstream (geração musical por lote e revisão humana) precisa de
tamanhos de lote diferentes conforme o caso de uso: lotes pequenos (granulares,
10 em 10) para revisão fina, lotes médios (20 em 20) e lotes grandes (30 em 30)
para menos iterações no pipeline. Hoje, trocar o tamanho do lote exige refazer
o particionamento à mão fora do app.

### 1.2 Objetivo

Criar **3 versões de separação dos grupos, selecionáveis no app**:

| Tipo | Divisão | Grupos resultantes | Origem |
|---|---|---|---|
| **A** | 10 em 10 (atual) | 31 grupos (22×10 + 9×9) | dataset original (`song_group`) |
| **B** | 20 em 20 | 16 grupos (15×20 + 1×1) | repartição da sequência A |
| **C** | 30 em 30 | 11 grupos (10×30 + 1×1) | repartição da sequência A |

O usuário alterna entre os tipos no app e navega/copia grupo por grupo
exatamente como hoje, mas dentro da versão selecionada.

### 1.3 Consumidor final

O próprio usuário (estudo/revisão) e o agente downstream de música, que passa a
receber lotes no tamanho adequado. Sem backend, autenticação ou persistência —
o app segue estático e público.

---

## 2. Escopo

### 2.1 Dentro do escopo

- Script gerador determinístico que produz as 3 versões de grupos a partir de
  `data/wfd-dataset.json`:
  - Tipo A: particionamento por `song_group` do dataset (idêntico ao
    `data/wfd-groups.json` atual — conteúdo e ordem preservados).
  - Tipos B e C: fatias fixas de 20 e 30 frases sobre a sequência completa
    ordenada por `id` (mesma ordem global do dataset).
- Arquivos de dados novos (um por tipo) e módulo(s) TypeScript correspondentes
  em `src/data/`, no mesmo padrão do existente (`wfd-groups.ts`).
- App: **seletor de tipo (A/B/C)** visível e acessível; a navegação de grupos,
  o painel de frases e as 3 ações de cópia (texto, JSON, JSON completo)
  operam sobre o tipo selecionado.
- Deep-link: search params `?tipo=A|B|C` + `?grupo=N` validados no TanStack
  Router, com fallback seguro (tipo inválido → A; grupo fora da faixa → 1).
- Regra de transição: ao trocar o tipo, se o grupo atual não existir na nova
  versão, cair para o grupo 1 (a URL é fonte da verdade; o `validateSearch`
  normaliza).
- Metadados `head()` atualizados para refletir as 3 versões.
- Validação automatizada das 3 versões por script (fidelidade frase a frase
  contra o dataset).

### 2.2 Fora do escopo

- Alteração do dataset original (`data/wfd-dataset.json`) ou do
  `data/wfd-groups.json` do project2 (continuam como fonte de verdade).
- Novos formatos de cópia, edição ou anotação de frases.
- Backend, banco, autenticação, persistência de preferência do usuário
  (a seleção vive na URL, não em storage).
- Geração musical (agente downstream).

---

## 3. Análise da origem (verificado no código)

- `data/wfd-dataset.json`: 301 objetos, `id` 1..301 sequencial, 31
  `song_group` contíguos (grupos 1–22 com 10 frases, 23–31 com 9).
- `data/wfd-groups.json` / `src/data/wfd-groups.ts`: array de 31 arrays de
  strings, ordem = `song_group` crescente, `id` crescente dentro do grupo —
  que é exatamente a ordem global de `id` crescente (blocos contíguos).
- `src/routes/index.tsx`: home atual com `validateSearch` de `?grupo=N`
  (1..31), navegação em coluna, painel de frases e cópias
  `join(",\n")`, `JSON.stringify(grupo, null, 2)` e JSON completo.

### 3.1 Implicações de projeto

1. Como a ordem global dos grupos do Tipo A equivale à ordem de `id`
   crescente, os Tipos B e C são **fatias determinísticas da mesma
   sequência** — nenhuma frase muda de posição relativa entre versões.
2. Apenas o Tipo B tem um grupo final incompleto com 1 frase (301 = 15×20+1)
   e o Tipo C também (301 = 10×30+1). O planejamento não impõe mínimo por
   grupo; o resto vai para o último grupo (decisão registrada em §9).
3. O `validateSearch` atual fixa o teto de grupo em `wfdGroups.length`; passa
   a depender do tipo selecionado.

---

## 4. Especificação dos dados

### 4.1 Arquivos gerados

- `data/wfd-groups-a.json` — idêntico em conteúdo a `data/wfd-groups.json`
  (31 grupos, lotes 8–10 do dataset).
- `data/wfd-groups-b.json` — 16 grupos: grupos 1–15 com 20 frases, grupo 16
  com 1 frase.
- `data/wfd-groups-c.json` — 11 grupos: grupos 1–10 com 30 frases, grupo 11
  com 1 frase.

Todos: UTF-8 sem BOM, JSON bruto (array de arrays de strings, apenas frases,
sem metadados), `ensure_ascii=False`, `indent=2`.

### 4.2 Regras de transformação (script gerador)

1. Carregar `data/wfd-dataset.json`.
2. Ordenar estável por `id` crescente e extrair somente `sentence` →
   sequência única de 301 frases.
3. **Tipo A:** agrupar por `song_group` (ordem `id` dentro do grupo) —
   replicando exatamente `data/wfd-groups.json`.
4. **Tipo B:** fatiar a sequência em blocos de 20 (último bloco com o resto).
5. **Tipo C:** fatiar a sequência em blocos de 30 (último bloco com o resto).
6. Serializar os 3 arquivos e imprimir um resumo (grupos, frases por grupo).

### 4.3 Módulos TypeScript

- `src/data/wfd-groups-a.ts`, `src/data/wfd-groups-b.ts`,
  `src/data/wfd-groups-c.ts` — gerados pelo script (não editados à mão),
  no formato do `wfd-groups.ts` atual.
- `src/data/wfd-group-versions.ts` — mapa `{ A, B, C }` com labels
  ("Tipo A — 10 em 10", etc.), contagem de grupos e descrição por tipo.

`src/data/wfd-groups.ts` permanece como está (consumido como Tipo A ou
substituído pelo A gerado — o conteúdo é o mesmo; decidir pela geração nova
para manter todos os 3 arquivos simétricos, mantendo o original intocado).

---

## 5. Especificação do app

### 5.1 Seletor de tipo

- Posição: no cabeçalho da home, ao lado do título/badge — sempre visível.
- Controle: grupo segmentado com 3 opções (`A`, `B`, `C`) + tooltip/label
  curto ("10 em 10", "20 em 20", "30 em 30").
- Acessibilidade: `role="radiogroup"`/botões com `aria-pressed` e rótulo
  claro; tipo ativo destacado com o token `primary` do design system.
- Seleção refletida na URL (`?tipo=B`) e compartilhável.

### 5.2 Comportamento ao trocar de tipo

- O `grupo` é revalidado contra a contagem de grupos do novo tipo; se o
  número atual exceder o teto, a URL normaliza para 1.
- A lista de grupos da coluna esquerda, o badge do cabeçalho
  (ex. "16 grupos · 301 frases") e as descrições do painel passam a refletir
  o tipo ativo.

### 5.3 Cópia (sem mudanças de formato)

- `Copiar texto`: frases do grupo atual separadas por `,\n` (vírgula +
  parágrafo), sem trailing separator, sem numeração.
- `Copiar JSON`: array de strings do grupo atual (`JSON.stringify(g, null, 2)`).
- `Copiar JSON (todos os grupos)`: array completo da versão ativa; rótulo
  dinâmico com o número de grupos do tipo (ex. "JSON (16 grupos)").
- Feedback visual temporário (~2s) por botão, como hoje.

### 5.4 Design

- Dark minimalista com tokens semânticos (`bg-background`, `text-foreground`,
  `border-border`, acento `primary`). Nenhuma cor hardcoded.
- Reuso de Button, Card, Badge, ScrollArea; o seletor segue o estilo dos
  botões de grupo existentes (borda, `primary/10` quando ativo).

### 5.5 head() da rota

- `title` e `description` mencionando as 3 versões (A 10, B 20, C 30) e as
  301 frases; `og:title`, `og:description`, `og:type`, `twitter:card`
  mantidos e coerentes.

---

## 6. Validação

### 6.1 Script de validação das versões

`data/validate_group_versions.py` verifica, para cada um dos 3 arquivos:

1. Parseia como JSON; array externo de arrays de strings não vazios.
2. Totais: A = 31 grupos, B = 16, C = 11; total de frases = 301 em cada.
3. Tamanhos: A entre 8 e 10; B com 15×20 + 1×1; C com 10×30 + 1×1.
4. **Fidelidade:** a concatenação dos grupos de cada versão é idêntica,
  frase a frase e na ordem, às `sentence` do dataset por `id` crescente
  (garante que B e C são fatias da mesma sequência).
5. Tipo A idêntico ao `data/wfd-groups.json` original.
6. Saída: `VALIDACAO OK` ou listagem de falhas.

### 6.2 Gates do app

- Build sem erros (`bun run build`) e `/tmp/observability/build-errors.log` OK.
- Testes (`bunx vitest run`) verdes; atualizar `src/test/app-routing.test.tsx`
  se a home mudar de forma que afete as expectativas do teste.
- Verificação visual via Playwright: seletor A/B/C funcional, troca de tipo
  muda a lista e o painel, deep-link `?tipo=C&grupo=2` renderiza o grupo
  correto, clipboard recebe o formato esperado.

---

## 7. Escopo por fases

### Fase 1 — Fundação do protocolo

- Criar este PRD e `roadmap-proj3.md`; reportar estado inicial ao monitor.
- Aceite: 3 arquivos do project3 existem e são coerentes.

### Fase 2 — Geração das 3 versões

- Script gerador + 3 JSONs + módulos TS em `src/data/`.
- Aceite: validação das 3 versões passa; A é idêntico ao original.

### Fase 3 — App com seletor de tipo

- Seletor A/B/C no app, revalidação de grupo por tipo, cópias dinâmicas,
  deep-link `?tipo=&grupo=`, head() atualizado.
- Aceite: build OK, testes verdes, verificação Playwright das 3 versões.

### Fase 4 — Validação e reporte

- Script de validação, gates de build/teste, checagem visual; marcar roadmap
  100% e reportar conclusão ao monitor.
- Aceite: tudo verde; monitor notificado.

---

## 8. Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Divergência entre Tipo A gerado e `wfd-groups.json` original | Duas verdades | Validação §6.1 item 5 compara byte a byte (conteúdo) |
| Grupo fora da faixa ao trocar de tipo | UI quebrada/blank | `validateSearch` normaliza por tipo; transição cai no grupo 1 |
| Import de JSON fora de `src/` não resolvido | Build quebra | Módulos TS gerados dentro de `src/data/`, padrão existente |
| Hidratação/clipboard no render | Erro de SSR | Cópia só em handlers de evento (padrão atual mantido) |
| Teste de rota desatualizado com o seletor | Gate de testes falha | Ajustar o teste junto com a mudança da home |

---

## 9. Decisões registradas

1. **Fatias fixas para B e C** (em vez de reagrugar por domínio): a ordem
   global do Tipo A já é a ordem de `id`; fatiar preserva o alinhamento
   entre versões (a frase N ocupa a mesma posição sequencial em A, B e C).
2. **Resto vai para o último grupo**: 301 não divide por 20 nem por 30;
   os grupos finais de B (1 frase) e C (1 frase) carregam o resto. O
   planejamento não impõe mínimo por grupo nas versões B/C.
3. **Seleção vive na URL** (`?tipo=&grupo=`), não em storage — deep-link e
   zero persistência, coerente com o project2.
4. **Tipo A regenerado pelo script** para os 3 arquivos serem simétricos e
   validados pela mesma origem; `data/wfd-groups.json` original permanece
   intocado como referência.
5. **Rótulo dinâmico do JSON completo** ("JSON (N grupos)") para não mentir
   o número quando o tipo muda.
6. **OpenCode não usado para produção** (regra do AGENTS.md): apenas como
   monitor avaliador nos handoffs.
