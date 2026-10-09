# PRD — project1: PTE Write From Dictation (WFD) Dataset Compilation

- **Projeto:** project1
- **Fonte de escopo:** `.opencode/project1.md` (planejamento)
- **Derivação:** PRD criado conforme o protocolo de 3 arquivos (`.opencode/Plan.md`)
- **Status:** v1 — aprovado para execução

---

## 1. Visão geral

### 1.1 Objetivo

Compilar o dataset mais completo, acurado e atualizado possível de frases
oficiais de "Write From Dictation" (WFD) do PTE Academic, minerado de bancos
de questões e pools de predição reais e confiáveis (ApeUni High-Frequency
Predictions, AlfaPTE, PTE Tools, Real PTE, entre outros de confiança
equivalente).

### 1.2 Resultado esperado

Um único arquivo JSON válido, bruto e não escapado, contendo um array de
objetos — cada objeto representando uma frase WFD real, com metadados de
rank de prioridade, contagem de palavras, tópico acadêmico e lote de
compilação musical (`song_group`).

### 1.3 Consumidor final

Um agente downstream de geração de música, que transformará cada
`song_group` em uma trilha. O dataset é a interface única entre a coleta
de dados e esse agente. Nenhuma interface web, API ou banco de dados é
gerada neste projeto.

---

## 2. Escopo

### 2.1 Dentro do escopo

- Coleta de frases WFD genuínas de fontes públicas confiáveis na web.
- Ordenação estrita das frases por frequência de repetição no exame
  (rank 1 = frase mais frequentemente repetida).
- Transcrição verbatim 100% fiel ao áudio oficial do exame
  (capitalização padrão, pontuação exata, gramática correta, zero typos,
  zero parafraseio).
- Agrupamento sequencial em lotes (`song_group`) de exatamente 8 a 10
  frases, agrupadas logicamente por domínio acadêmico / fluxo temático.
- Cálculo de `word_count` por frase.
- Classificação por `topic` dentro dos domínios previstos.
- Validação sintática e semântica do JSON final.
- Registro do progresso no roadmap (`roadmap-proj.md`).

### 2.2 Fora do escopo

- Frases de "Repeat Sentence", "Read Aloud" ou exercícios mock sintéticos.
- Interface de usuário, página web, API ou integração de backend.
- Geração musical propriamente dita (pertence ao agente downstream).
- Cobertura de outras tarefas do PTE (Summarize, Essay, etc.).

---

## 3. Fontes e estratégia de coleta

### 3.1 Ordem de prioridade das fontes

1. **ApeUni High-Frequency Predictions** — pool de predição de alta
   frequência mais citado pela comunidade PTE; considerado o melhor
   proxy de frequência real do exame.
2. **AlfaPTE** — banco de questões reais com listas WFD.
3. **PTE Tools** — repositório de frases de prática alinhadas ao exame.
4. **Real PTE** — compilações comunitárias de questões reais.
5. **Fontes equivalentes** — blogs, fóruns (Reddit r/PLE, r/pte), YouTube
   e PDFs públicos de alta confiança, somente quando corroborados por
   pelo menos uma fonte das categorias 1–4 ou por múltiplas fontes
   independentes.

### 3.2 Regras de coleta

- Toda frase entra no dataset **somente** se identificada como WFD.
- Em caso de divergência entre fontes (ex.: pontuação ou preposição
  diferente), prevalece a variante em maioria; em empate, prevalece a
  fonte de maior prioridade.
- Duplicatas entre fontes são consolidadas em uma única entrada; a
  recorrência entre fontes **eleva** o rank de prioridade.
- Frases sem evidência clara de origem WFD são descartadas.

### 3.3 Limitações conhecidas

- A ordem exata de frequência é derivada de predições da comunidade
  (não do Pearson oficial, que não publica rankings). O rank é
  portanto a melhor aproximação disponível, ordenada por:
  1. Aparição em listas "high-frequency/most repeated" explícitas;
  2. Recorrência entre múltiplas fontes independentes;
  3. Presença nas predições recentes (janeiro–outubro 2026).
- O dataset é um snapshot; novas ondas de predição podem alterar ranks.

---

## 4. Esquema de dados

### 4.1 Formato

Array JSON único, válido, bruto e não escapado. Sem preâmbulo, sem
comentários, sem markdown, sem texto conversacional.

### 4.2 Estrutura do objeto

```json
[
  {
    "id": 1,
    "priority_rank": 1,
    "sentence": "Exact verbatim sentence here.",
    "word_count": 12,
    "topic": "History / Science / Business / Campus / Social Sciences",
    "song_group": 1
  }
]
```

### 4.3 Definição campo a campo

| Campo | Tipo | Regra |
|---|---|---|
| `id` | integer | Sequencial, começa em 1, incrementa de 1 em 1, único. |
| `priority_rank` | integer | 1 = frase mais frequentemente repetida. Pode repetir entre frases de frequência equivalente; nunca decresce ao longo do array. |
| `sentence` | string | Frase verbatim, capitalização padrão de frase (inicial maiúscula, resto minúsculo salvo nomes próprios), pontuação final exata (normalmente ponto). |
| `word_count` | integer | Número de palavras separadas por espaço na `sentence`. |
| `topic` | string | Um dos domínios: History, Science, Business, Campus, Social Sciences (valores adicionais de domínio acadêmico são aceitos quando nenhuma categoria se aplicar bem, ex.: "Arts", "Environment"). |
| `song_group` | integer | 1-based; lotes sequenciais de 8 a 10 frases; agrupamento lógico por domínio/fluxo temático. |

### 4.4 Restrições do arquivo final

- Encoding UTF-8, sem BOM.
- Aspas simples/duplas internas escapadas conforme JSON padrão
  (`\"`), sem escapes visuais ao consumidor.
- Nenhum campo nulo; nenhum objeto incompleto.
- O array fecha corretamente (`]`) — validação obrigatória de parse.

---

## 5. Regras de qualidade

### 5.1 Verbatim

- A string `sentence` deve corresponder 100% à transcrição oficial do
  áudio do exame, conforme reportada pelas fontes.
- Capitalização padrão: primeira letra maiúscula, nomes próprios
  maiúsculos, resto minúsculo.
- Pontuação: ponto final presente; vírgulas conforme a transcrição.
- Zero typos, zero parafraseio, zero "melhorias" gramaticais.

### 5.2 Deduplicação

- Frases idênticas (ou diferindo apenas em pontuação trivial) contam
  como uma, com rank elevado pela recorrência.
- Frases quase idênticas com variação substantiva (ex.: uma palavra
  diferente) são mantidas como entradas separadas.

### 5.3 Consistência interna (obrigatória)

- `word_count` == número real de palavras de `sentence`.
- `id` sequencial sem faltas.
- `song_group` contíguo e em ordem crescente.
- Tamanho de cada `song_group` entre 8 e 10 frases (exceção: último
  lote pode fechar abaixo de 8 apenas se o total não dividir — a
  preferência é reagrupar para manter todos os lotes entre 8 e 10).

---

## 6. Regras de ranking

1. Rank 1 = a frase mais frequentemente repetida segundo as fontes de
   alta frequência.
2. Empates de frequência resolvem por: (a) maior recorrência entre
   fontes, (b) presença na predição mais recente, (c) ordem alfabética
   estável da frase.
3. O array final é ordenado por `priority_rank` crescente; `id` segue
   essa ordem.

---

## 7. Regras de batching musical (`song_group`)

- Lotes sequenciais de 8 a 10 frases.
- Agrupamento lógico: frases do mesmo domínio acadêmico ou fluxo
  temático afim ficam no mesmo lote sempre que possível, para dar
  coerência temática à trilha musical gerada.
- `song_group` 1 inicia nas frases de maior rank; lotes subsequentes
  seguem a ordem do dataset.
- Ao final, nenhum lote pode ter menos de 8 frases — ajustar limites
  dos lotes vizinhos (9↔10, 8↔9) para cumprir a regra, sem quebrar a
  coerência temática mais do que o necessário.

---

## 8. Escopo por fases e critérios de aceite

### Fase 1 — Fundação do protocolo

- Criar `prd-project1.md` (este arquivo) e `roadmap-proj.md`.
- Aceite: os 3 arquivos existem, preenchidos, coerentes entre si
  (mesmo projeto, mesmas fases).

### Fase 2 — Pesquisa de fontes

- Buscar na web as fontes prioritárias (§3.1) e coletar listas WFD
  com indicação de frequência.
- Aceite: pelo menos 3 fontes independentes consultadas com URLs
  registradas no roadmap/relatório de fase.

### Fase 3 — Compilação e ranking

- Consolidar frases, deduplicar, atribuir `priority_rank` e `topic`.
- Aceite: ≥ 50 frases WFD genuínas; duplicatas consolidadas; ranks
  monotônicos.

### Fase 4 — Batching e geração do JSON

- Atribuir `song_group` (8–10 frases/lote), calcular `word_count`,
  gerar o JSON final.
- Aceite: JSON parseia sem erro; todas as regras de consistência (§5.3,
  §7) passam.

### Fase 5 — Validação e reporte

- Rodar checagem automatizada do dataset; reportar conclusão ao
  monitor; checagem de 5 min / 10 tentativas de novos arquivos/fases.
- Aceite: script de validação sem falhas; monitor informado; roadmap
  100% marcado.

---

## 9. Validação e gates

Gate mínimo por fase (conforme Plan.md §19):

1. Mudanças conferidas em disco.
2. Fase de dados: validação por script (parse JSON, consistência de
   campos, tamanhos de lote, unicidade de `id`, monotonia de rank).
3. Nenhum erro no log de build/observabilidade.
4. Checkbox `[x]` no roadmap com a linha de Gates preenchida.

---

## 10. Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Ranking real indisponível (Pearson não publica) | Ranks aproximados | Usar proxies de alta frequência da comunidade e registrar a limitação |
| Fontes divergentes entre si | Frases com variantes | Regra de maioria + prioridade de fonte (§3.2) |
| Contaminação com Repeat Sentence | Dataset inválido | Verificação cruzada: frases marcadas RS/RA em qualquer fonte são descartadas |
| Pagamentos/paywall de bancos de questões | Menos cobertura | Usar páginas públicas, PDFs e compilações comunitárias citáveis |
| Lotes não fecham em 8–10 | Regra de batching quebrada | Rebalancear limites de lotes vizinhos (§7) |

---

## 11. Entrega

- Arquivo: `data/wfd-dataset.json` na raiz do projeto.
- Conteúdo: apenas o array JSON (sem texto ao redor).
- O arquivo é o artefato consumido pelo agente de música downstream.

---

## 12. Decisões registradas

1. **Entrega como arquivo JSON no projeto** (não como mensagem de chat):
   rastreabilidade e consumo direto pelo agente downstream.
2. **Ranking por proxies comunitários**: o Pearson não publica
   frequências; ApeUni et al. são o melhor proxy disponível — limitação
   registrada (§3.3).
3. **Domínios de tópico abertos com default fechado**: as 5 categorias
   do schema são o default; categorias extras só quando nenhuma delas
   se aplicar bem.
4. **Último lote < 8 frases evitado por rebalanceamento**: a regra de
   8–10 é dura; lotes vizinhos absorvem o resíduo (§7).
5. **Coleta pelo agente principal**: OpenCode não é usado para tarefas
   do remix (regra do AGENTS.md); OpenCode atua apenas como monitor
   avaliador.
