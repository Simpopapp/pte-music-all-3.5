# PRD — project2: WFD Group Viewer (JSON de grupos + app de visualização e cópia)

- **Projeto:** project2
- **Fonte de escopo:** `.opencode/project2.md` (planejamento)
- **Derivação:** PRD criado conforme o protocolo de 3 arquivos (`.opencode/Plan.md`), caso "1 existe: crie os outros 2 e depois execute"
- **Dependência:** artefato de dados do project1 — `data/wfd-dataset.json` (301 frases WFD, 31 `song_group`)
- **Status:** v1 — aprovado para execução
- **Monitor:** estado inicial reportado e recebimento confirmado (OpenCode, porta 4096)

---

## 1. Visão geral

### 1.1 Problema

O dataset do project1 (`data/wfd-dataset.json`) entrega 301 frases WFD com
metadados completos (`id`, `priority_rank`, `word_count`, `topic`,
`song_group`). Esse formato atende ao agente downstream de música, mas é
ruim para consumo humano direto: quem quer trabalhar com um grupo de
frases por vez (revisar, colar em outra ferramenta, alimentar um
gerador) precisa abrir o JSON inteiro, localizar o `song_group`
manualmente e extrair as frases à mão.

### 1.2 Objetivo

Duas entregas complementares:

1. **JSON de grupos** — um arquivo JSON novo com os 31 grupos de frases,
   contendo **apenas as frases em si**, separadas (cada frase é um item
   próprio), sequenciais (a ordem do dataset original é preservada) e
   agrupadas (cada grupo é uma unidade distinta na estrutura).
2. **App de visualização e cópia** — uma página web que apresenta os
   grupos um a um e permite copiar o grupo atual em **2 formatos**:
   texto puro ou JSON. Em ambos os formatos o conteúdo copiado contém
   **apenas as frases, separadas por vírgula + parágrafo** (no caso do
   texto) ou como array JSON de strings (no caso do JSON).

### 1.3 Consumidor final

O próprio usuário (estudo/revisão das frases WFD) e qualquer ferramenta
externa que receba texto colado ou JSON colado. O app é de uso local no
preview; não há backend, autenticação ou persistência.

---

## 2. Escopo

### 2.1 Dentro do escopo

- Gerar `data/wfd-groups.json` a partir de `data/wfd-dataset.json` por
  script determinístico (não manual).
- Estrutura do JSON de grupos: array de 31 arrays de strings. Cada
  array interno contém apenas as frases de um `song_group`, na ordem do
  dataset original (por `id` crescente dentro do grupo).
- App web (rota principal do app) para:
  - listar os 31 grupos com sua contagem de frases;
  - exibir as frases do grupo selecionado, uma por linha;
  - copiar o grupo atual como **texto** (frases separadas por
    `,\n` — vírgula + parágrafo);
  - copiar o grupo atual como **JSON** (array de strings);
  - copiar o JSON completo dos 31 grupos (ação secundária útil).
- Estados de feedback de cópia (confirmação visual temporária).
- Validação automatizada do JSON de grupos por script.

### 2.2 Fora do escopo

- Qualquer metadado no JSON de grupos além das frases (sem `id`, sem
  `topic`, sem `word_count`, sem `song_group` explícito como campo).
- Backend, banco de dados, autenticação, armazenamento remoto.
- Edição, anotação ou reordenação de frases no app.
- Geração musical (agente downstream).
- Alteração do dataset original do project1.

---

## 3. Análise do dataset de origem

### 3.1 Fatos levantados no código (verificados)

- `data/wfd-dataset.json`: array JSON válido com **301 objetos**.
- Campos por objeto: `id` (1..301, sequencial), `priority_rank`,
  `sentence`, `word_count`, `topic`, `song_group`.
- **31 grupos** (`song_group` 1..31), contíguos e em ordem crescente.
- Distribuição: grupos 1–22 com **10 frases**; grupos 23–31 com
  **9 frases** (total 301 = 22×10 + 9×9).
- A ordem dentro do array é `id` crescente; os `song_group` formam
  blocos contíguos (não há intercalação de grupos).

### 3.2 Implicações de projeto

1. A geração dos grupos é uma operação de **particionamento**
   determinístico: agrupar por `song_group`, preservando a ordem de
   `id` dentro de cada grupo.
2. Nenhuma deduplicação ou reordenação é necessária — o dataset já
   passou pela validação do project1 (script `data/validate_wfd.py`).
3. `word_count` pode ser recalculado na validação para conferir
   integridade das frases extraídas (as frases não devem sofrer
   nenhuma alteração).

---

## 4. Especificação do JSON de grupos

### 4.1 Arquivo

- Caminho: `data/wfd-groups.json` (ao lado do dataset original).
- Encoding UTF-8, sem BOM.
- JSON bruto, sem preâmbulo ou comentários.

### 4.2 Estrutura

```json
[
  [
    "Make sure you wash your hands before preparing food.",
    "Online courses allow students to work at their own pace."
  ],
  [
    "..."
  ]
]
```

- **Array externo:** 31 elementos, um por `song_group`, em ordem
  crescente de grupo. O índice do array (0-based) + 1 é o número do
  grupo — não há campo numérico de grupo porque a única informação
  permitida são as frases.
- **Array interno:** apenas strings (as frases verbatim), na ordem do
  `id` crescente do dataset original.
- Nenhum objeto, campo, chave ou metadado adicional.

### 4.3 Regras de transformação (script gerador)

1. Carregar `data/wfd-dataset.json`.
2. Ordenar estável por `song_group` crescente e, dentro do grupo, por
   `id` crescente (o dataset já está assim; a ordenação é defensiva).
3. Mapear para array de arrays de strings, extraindo somente
   `sentence`.
4. Serializar com `json.dump(..., ensure_ascii=False, indent=2)`.
5. Escrever em `data/wfd-groups.json`.

### 4.4 Regras de formatação do texto copiado (opção texto)

- Separador entre frases: **vírgula seguida de quebra de parágrafo**
  (`",\n"`) — exatamente o que o planejamento chama de
  "virgula+paragrafo".
- Sem vírgula final após a última frase (separador só entre frases).
- Sem numeração, sem tópicos, sem cabeçalho.
- Frases mantêm capitalização e pontuação verbatim do dataset.

### 4.5 Regras do JSON copiado (opção JSON)

- Conteúdo: o array de strings do grupo atual, serializado com
  `JSON.stringify(grupo, null, 2)` (legível, 2 espaços).
- Sem wrapper objeto (sem `{"group": n, ...}`) — apenas frases.

---

## 5. Especificação do app

### 5.1 Stack e arquitetura

- TanStack Start (React 19) + Tailwind CSS v4, conforme o template.
- Dados: import estático do JSON de grupos no bundle (Vite resolve
  `data/wfd-groups.json` via import relativo). Nenhuma requisição de
  rede, nenhum server function — o dataset é estático e público.
- Nova rota principal do app substituindo o conteúdo placeholder da
  home (`src/routes/index.tsx`), pois o produto deste projeto É o app.
- `head()` da rota com title/description/og próprios e específicos.

### 5.2 Layout e interação

- **Coluna esquerda (navegação):** lista dos 31 grupos (rótulo
  "Grupo N" + contagem de frases), scrollável, com estado de seleção
  destacado. Em telas estreitas vira seletor/horizontal acima do
  conteúdo.
- **Painel principal:** número do grupo, contagem, lista de frases
  (uma por linha, tipografia legível, numeração opcional apenas visual
  — a cópia nunca inclui numeração).
- **Ações de cópia** (sempre visíveis no painel):
  1. `Copiar texto` — frases separadas por `,\n`.
  2. `Copiar JSON` — array de strings formatado.
  3. `Copiar JSON (31 grupos)` — ação secundária para o array completo.
- **Feedback:** botão mostra confirmação temporária (~2s) após copiar
  ("Copiado!"), revertendo ao rótulo original.
- **Estado selecionado:** o grupo 1 inicia selecionado; a seleção pode
  ser refletida na URL via search param `?grupo=N` (deep-link simples,
  TanStack Router validation), fallback para grupo 1.

### 5.3 Cópia

- API: `navigator.clipboard.writeText` dentro de handlers de clique
  (browser-only por natureza); fallback silencioso para
  `document.execCommand("copy")` via textarea temporário em caso de
  rejeição da API assíncrona.
- Nenhum acesso a storage de browser no render (regra de hidratação do
  AGENTS.md — a cópia é evento, não render).

### 5.4 Design

- Direção visual: dark minimalista consistente com o design system
  existente (tokens semânticos `bg-background`, `text-foreground`,
  `border-border`, acento `primary`). Nenhuma cor hardcoded.
- Tipografia: sans do projeto; frases em tamanho confortável de leitura.
- Componentes reutilizados de `src/components/ui/` (Button, Card,
  Badge, ScrollArea quando disponível).

---

## 6. Validação

### 6.1 Script de validação do JSON de grupos

Script único (python, `data/validate_groups.py`) que verifica:

1. `wfd-groups.json` parseia como JSON.
2. Array externo com exatamente 31 grupos.
3. Cada elemento é um array de strings não vazio.
4. Tamanhos entre 8 e 10 frases por grupo (herda a regra do dataset).
5. Total de frases == 301.
6. **Fidelidade:** para cada grupo, a lista de frases extraída é
   idêntica às `sentence` do dataset original na mesma ordem
   (`song_group` + `id`).
7. `word_count` confere para cada frase (integridade extra).
8. Saída: `VALIDACAO OK` ou listagem de falhas.

### 6.2 Gates do app

- Build sem erros (`bun run build`) e sem erros no
  `/tmp/observability/build-errors.log`.
- Testes existentes continuam passando (`bunx vitest run`) —
  `src/test/app-routing.test.tsx` cobre a rota `/`; ajustar o teste
  apenas se a home deixar de renderizar o conteúdo placeholder atual.
- Verificação visual via Playwright (browser shell): grupos listados,
  seleção funcional, botões de cópia presentes e clipboard recebendo o
  formato esperado (permissão de clipboard concedida no teste).

---

## 7. Escopo por fases

### Fase 1 — Fundação do protocolo

- Criar `prd-project2.md` (este arquivo) e `roadmap-proj2.md`.
- Aceite: 3 arquivos do project2 existem e são coerentes (mesmo
  escopo, mesmas fases).

### Fase 2 — Geração do JSON de grupos

- Escrever e rodar o script gerador (§4.3); gerar
  `data/wfd-groups.json`.
- Aceite: JSON parseia; 31 grupos; 301 frases; zero metadados além das
  frases.

### Fase 3 — App de visualização e cópia

- Implementar a rota principal (layout §5.2, cópia §5.3, design §5.4)
  e os metadados de head.
- Aceite: os 31 grupos navegáveis; cópia em texto e JSON funciona com
  o formato exato; feedback visual de cópia.

### Fase 4 — Validação e reporte

- Rodar `data/validate_groups.py`, build, testes e verificação visual
  Playwright; reportar conclusão ao monitor OpenCode.
- Aceite: validação `VALIDACAO OK`; build OK; testes verdes; monitor
  notificado; roadmap 100% marcado.

---

## 8. Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Alteração acidental de frases na transformação | Dados corrompidos | Validação de fidelidade frase a frase contra o dataset (§6.1 item 6) |
| Vírgula final indevida no texto copiado | Formato fora da regra | Join com `,\n` (sem trailing separator) + teste de clipboard no Playwright |
| Hidratação quebrada por leitura de clipboard/storage no render | Erro de SSR | Cópia apenas em handlers de evento (§5.3) |
| Import do JSON fora de `src/` não resolvido pelo build | Build quebra | Import relativo dentro do root do projeto (Vite resolve); verificado no gate de build |
| Teste de rota existente quebra com a nova home | Gate de testes falha | Ajustar o teste somente onde a expectativa é do conteúdo placeholder |

---

## 9. Decisões registradas

1. **Array de arrays** (não objetos com chave de grupo): a única
   informação permitida é a frase; a numeração do grupo é implícita
   pela posição.
2. **Script gerador, não edição manual**: determinismo e validação de
   fidelidade; o dataset original permanece intocado.
3. **Home substituída pelo app**: o produto do project2 é o app; o
   conteúdo anterior era placeholder de template.
4. **Deep-link por search param `?grupo=N`**: compartilhar um grupo
   específico sem backend.
5. **JSON copiado sem wrapper**: aderência estrita a "apenas as
   frases"; o número do grupo é conhecido pelo contexto do app.
6. **OpenCode não usado para produção** (regra do AGENTS.md): só como
   monitor avaliador nos handoffs.
