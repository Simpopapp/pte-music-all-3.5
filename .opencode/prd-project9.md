# PRD — project9: Traduções e áudio prontos no projeto

Planejamento de origem: `.opencode/project9.md` (fonte de verdade do escopo).
Roadmap associado: `.opencode/roadmap-proj9.md`.
Versão: project9 · Data de criação: 2026-10-09 · Autor: builder (agente principal).
Execução: builder direto + subagentes paralelos (sem OpenCode em remix, conforme AGENTS.md).

---

## 1. Resumo executivo

O project8 entregou tradução de palavra, tradução de frase e áudio, mas os três
dependem de IA/nuvem **durante o uso do app**: o usuário clica, uma server
function chama o Lovable AI Gateway e só então o resultado aparece (e fica em
cache local). A frase "ou até i.a (futuramente)" do project8 foi mal
interpretada: IA não é requisito agora. Todo esse conteúdo é trabalho prévio do
builder.

O project9 troca "gerar no uso" por "conteúdo pronto no repositório":

1. 301 traduções de frase (`literal` + `natural`) escritas pelo builder.
2. Traduções de todas as 2.980 ocorrências de palavra (1.117 palavras únicas),
   cada ocorrência com `literal` + `contextual`, chaveadas por frase + posição.
3. 1.204 arquivos MP3 (301 frases × 2 vozes × 2 sotaques) em `public/audio/`.
4. `sentence-list.tsx` lendo só dados locais — zero rede em tempo de uso.
5. Remoção de `src/lib/ai/*`, caches e dependências de IA.

Critério único de sucesso: mesma experiência do project8, mesma ou melhor
qualidade, tudo salvo no projeto, nenhuma chamada a IA/nuvem ao usar o app.

## 2. Situação atual confirmada no código (não copiada do planejamento)

| Item | Evidência | Consequência |
|---|---|---|
| Tradução sob clique | `src/lib/ai/translate.server.ts` (163 linhas), `translate.functions.ts` | Remover; substituir por lookup |
| TTS sob clique | `src/lib/ai/tts.server.ts` (vozes Aoede/Puck, prefixo "Say with an Australian accent:") | Usar só como ferramenta de produção, fora do app |
| Gateway | `src/lib/ai/gateway.server.ts` (88 linhas) | Remover do runtime do app |
| Caches | `src/lib/translation-cache.ts`, `src/lib/audio-cache.ts`, teste `translation-cache.test.ts` | Remover junto com o teste |
| Consumo | `src/components/sentence-list.tsx` (462 linhas) importa as server fns e os caches | Reescrever o consumo, manter UX |
| Settings | `src/hooks/use-wfd-settings.ts`, chave `wfd-settings-v1` | Intocado (persistência é requisito) |
| Rota settings | `src/routes/settings.tsx` (254 linhas) tem seção "Em breve: IA" | Remover a seção |
| Dependências | `package.json`: `ai`, `@ai-sdk/openai` | Remover se nada mais usar |
| Dataset | `data/wfd-dataset.json`: 301 objetos `{id, sentence, word_count, topic, song_group}` | Fonte canônica das frases |
| Frases únicas | 301 únicas de 301 (verificado) | Chave por texto exato é segura |
| Tokens | 2.980 ocorrências, 1.117 palavras únicas (case-insensitive) | Escopo real do trabalho palavra a palavra |
| Versões de grupo | A: 31 grupos/301 frases; B: 16 grupos/300; C: 11 grupos/300 | Tradução indexada pela frase, não pelo grupo |
| Backend | Lovable Cloud ativo, `drizzle/migrations` vazio (journal sem entradas) | Nenhuma migration necessária; backend só é estrutural |

Observação: as versões B e C listam 300 frases (uma a menos que A). A cobertura
dos testes é definida pelas 301 frases do dataset; as versões B/C são
subconjuntos e devem continuar funcionando sem frase "órfã" sem tradução.

## 3. Princípios e decisões técnicas

### D1. Chave de tradução
- Frase: texto exato (string idêntica à de `wfd-dataset.json`). Já provado único.
- Palavra: `(frase, índice do token)`. Nunca só a palavra, pois "port", "second",
  "will", "left" mudam de sentido por frase.
- O índice é a posição entre os **tokens de palavra** (apenas os que casam
  `TOKEN_RE`), 0-based, na ordem da frase. Pontuação não conta.

### D2. Tokenização única e compartilhada
Hoje `tokenize` e `TOKEN_RE` vivem dentro de `sentence-list.tsx`. A fonte da
verdade passa a ser um módulo puro `src/lib/tokenize.ts` exportando `TOKEN_RE`,
`tokenize` e `wordTokens(sentence): string[]`. O componente, os testes e o
script de verificação usam o mesmo módulo, impedindo divergência entre dados e UI.
Regex mantida: `/[A-Za-z][A-Za-z'’-]*/g` (inclui apóstrofo reto e curvo e hífen).

### D3. Formato dos dados
Fonte editável por humanos/subagentes em JSON; módulo TypeScript tipado
consumido pelo app.

```jsonc
// data/translations/shard-NN.json  (um shard por lote de frases)
{
  "shard": 1,
  "sentences": [
    {
      "id": 1,                       // id do wfd-dataset.json
      "text": "Make sure you wash your hands before preparing food.",
      "literal": "Certifique-se de que você lava suas mãos antes de preparar comida.",
      "natural": "Lave bem as mãos antes de preparar qualquer comida.",
      "words": [
        { "word": "Make", "literal": "fazer", "contextual": "Aqui forma 'make sure': garantir/certificar-se." }
      ]
    }
  ]
}
```

- `data/wfd-translations.json`: agregado dos shards (gerado por script
  determinístico de **merge**, não de tradução; o script não escreve conteúdo).
- `src/data/wfd-translations.ts`: módulo tipado, exporta
  `wfdTranslations: Record<string, SentenceTranslation>` indexado pelo texto
  exato, mais `getSentenceTranslation(text)` e `getWordTranslation(text, index)`.
- Tamanho esperado: ~301 × (2 frases curtas) + 2.980 × (2 textos curtos)
  ≈ 600–900 KB de JSON. Para não pesar o bundle inicial, o módulo é carregado
  com `import()` dinâmico no primeiro uso das traduções (ver D6).

### D4. Proibição de automatizar a tradução por script
O planejamento é explícito: não usar Python para gerar traduções. Scripts são
permitidos **apenas** para: merge de shards, validação de cobertura e geração de
áudio (que é produção de mídia, não de texto). O conteúdo textual é escrito pelos
subagentes (modelo), revisado em lotes.

### D5. Áudio pré-gerado
- Combinações: 2 vozes (feminina=Aoede, masculina=Puck) × 2 sotaques
  (australiano, neutro) = 4 variantes por frase → 1.204 arquivos.
- Velocidade não gera arquivos: continua `audio.playbackRate` no navegador,
  com `preservesPitch = true`.
- Nome determinístico: `public/audio/{id3}-{voz}-{acento}.mp3`, onde `id3` é o
  id do dataset com 3 dígitos (`001`), `voz ∈ {feminina, masculina}`,
  `acento ∈ {australiano, neutro}`. Exemplo: `public/audio/001-feminina-australiano.mp3`.
- Codificação: ffmpeg, mono, 24 kHz, ~48–64 kbps (`-ac 1 -ar 24000 -b:a 56k`),
  saída do TTS é WAV (RIFF) segundo o `tts.server.ts` atual.
- Orçamento de tamanho: frase média ≈ 4 s → ~28 KB a 56 kbps → ~34 MB no total.
  Teto aceitável 60 MB. Se estourar: reduzir bitrate (48 → 40 kbps) **antes** de
  cortar qualquer combinação. Nenhuma opção de settings pode sumir.
- A geração usa o mesmo gateway e as mesmas vozes/instrução de sotaque do app
  atual, só como ferramenta de produção, uma única vez, fora do runtime.
- Manifesto `data/audio-manifest.json` (id, voz, acento, bytes, duração) é
  gerado na produção e serve de insumo para o teste de cobertura.

### D6. Carregamento
- Traduções: `import()` dinâmico do módulo de dados quando o usuário ativa/usa
  qualquer modo de tradução; resultado em cache de módulo (memória). Não há
  estado de rede nem "Gerando tradução…". Enquanto o chunk carrega (instantâneo
  em local), o painel mostra o conteúdo assim que disponível; sem spinner de erro.
- Áudio: `new Audio(url)` apontando para o arquivo estático; **sem** preload em
  massa (1.204 arquivos). Pré-carrega só o arquivo clicado (`preload="auto"` no
  elemento criado sob demanda).
- SSR: nada de `window`/`localStorage` no render; leitura de settings já é
  SSR-safe em `useEffect` (regra de AGENTS.md para hooks que leem browser APIs).

### D7. Remoção da nuvem
Remover do runtime: `src/lib/ai/*`, `translation-cache.ts`, `audio-cache.ts`,
testes dos caches, imports em `sentence-list.tsx`, pacotes `ai` e
`@ai-sdk/openai` (após `rg` provar que nada mais importa). O Lovable Cloud
continua ativo por ser estrutural da plataforma/remix; registrar no status o
que foi possível remover e o que é estrutural. Não criar tabelas, não semear
dados, não usar edge functions.

### D8. Sem regressão
Intocados: aba Config., toggles (tradução individual, tradução de frases,
áudio), `wfd-settings-v1`, proteção anti-expansão acidental no mobile
(`TAP_MAX_DISTANCE=10px`, `TAP_MAX_DURATION=500ms`), coexistência dos dois modos,
home e `/copiar`, cópia de letra/ritmos, `head()` das rotas.

## 4. Requisitos funcionais

### R1. Tradução de frases (301)
- R1.1 Cada frase possui `literal`: fiel à estrutura inglesa, em pt-BR correto,
  sem inventar nem omitir informação; palavras funcionais traduzidas.
- R1.2 Cada frase possui `natural`: como um brasileiro diria a mesma ideia em
  contexto geral; pode reordenar e trocar expressões; mantém o sentido.
- R1.3 `literal` ≠ `natural` quando a tradução literal soa artificial; quando
  coincidirem, é aceitável, mas isso deve ser raro (<10% das frases) e revisado.
- R1.4 Nenhum campo vazio, nenhum "TODO", nenhuma cópia do inglês.
- R1.5 Nomes próprios e siglas preservados (Canada → Canadá apenas quando é a
  grafia pt-BR correta).

### R2. Tradução palavra a palavra (2.980 ocorrências)
- R2.1 Para cada token de palavra da frase, na ordem de `wordTokens`, existe
  `{word, literal, contextual}`.
- R2.2 `word` repete exatamente o token (com capitalização original), usado pelo
  teste para detectar desalinhamento de índice.
- R2.3 `literal`: tradução de dicionário curta (1–3 palavras, ex.: "lavar").
- R2.4 `contextual`: 1 frase breve em pt-BR explicando o papel/sentido **naquela
  frase** (≤ 140 caracteres), inclusive para palavras funcionais (artigos,
  preposições) com função clara ("indica o momento: antes de preparar").
- R2.5 A mesma palavra em frases diferentes recebe contextual coerente com cada
  frase. Cópia cega de um contextual entre frases é proibida salvo identidade
  real de função.
- R2.6 Contrações e possessivos ("don't", "student's") são **um** token; o
  literal cobre o conjunto ("não", "do estudante").

### R3. Áudio
- R3.1 Existe MP3 para toda (frase × voz × sotaque): 301 × 2 × 2 = 1.204.
- R3.2 Todo MP3 toca no navegador (duração > 0.5 s, decodificável).
- R3.3 O app escolhe o arquivo por `settings.voz` e `settings.acento`; muda ao
  trocar a setting sem recarregar a página.
- R3.4 Um áudio por vez: iniciar outro interrompe o atual. Estado "tocando" por
  frase; botão alterna play/parar; ao terminar, volta a ocioso.
- R3.5 Velocidade via `playbackRate` aplicada ao iniciar e ao mudar a setting
  durante a reprodução.
- R3.6 Falha de carregamento (arquivo ausente) mostra erro discreto no botão e
  não quebra a lista; não há retry de rede de IA.

### R4. UI consumindo dados locais
- R4.1 Painel de palavra: abre instantaneamente com `literal` + `contextual`;
  uma palavra aberta por card (comportamento atual preservado).
- R4.2 Painel de frase (expansão do card): `literal` + `natural`; sem estado
  `loading`/`error`/"Tentar de novo".
- R4.3 Removidos os estados `loading` e `error` dos tipos `WordPanelState` e
  `SentencePanelState`; `Loader2` deixa de ser importado se não for usado.
- R4.4 Sem `useEffect` de busca; leitura síncrona do módulo carregado.
- R4.5 Textos de interface "Gerando tradução…" e similares deixam de existir.
- R4.6 Mobile: sem expansão por scroll/hover; toque proposital mantido.

### R5. Settings
- R5.1 Remover a seção "Em breve: IA" de `settings.tsx` (IA não é plano atual).
- R5.2 Manter textos de ajuda coerentes ("traduções e áudio já vêm prontos no app").
- R5.3 Chave `wfd-settings-v1` e formato de dados inalterados (sem migração).

### R6. Remoção de nuvem
- R6.1 Nenhum import de `@/lib/ai/*`, `translation-cache`, `audio-cache` em `src/`.
- R6.2 Nenhum `createServerFn` de IA restante; `rg "ai.gateway|LOVABLE_API_KEY"`
  em `src/` retorna vazio.
- R6.3 Pacotes `ai`/`@ai-sdk/openai` removidos do `package.json` se órfãos.
- R6.4 Durante o uso (Playwright) zero requisições a gateway/server functions.

## 5. Requisitos não funcionais

- N1. Qualidade textual: pt-BR correto, acentuação completa, sem anglicismos
  desnecessários, sem repetições mecânicas.
- N2. Performance: abrir painel < 50 ms após carregado; chunk de dados carregado
  sob demanda e fora do bundle inicial da home.
- N3. Acessibilidade: botões de áudio com `aria-label`/`aria-pressed`; painéis
  com `aria-expanded` (mantidos).
- N4. Tamanho do repositório: áudio total registrado no status; alvo ≤ 60 MB.
- N5. Determinismo: nomes de arquivos e chaves reproduzíveis a partir do dataset.
- N6. Segurança: nenhuma chave em código; `LOVABLE_API_KEY` só no ambiente do
  builder durante a produção do áudio e nunca persistida em arquivo do repositório.
- N7. SSR/hidratação: sem acesso a APIs do browser no render.

## 6. Plano de produção do conteúdo

### 6.1 Divisão das frases em lotes para subagentes
O planejamento recomenda ~20 subagentes simultâneos para as 301 frases, com
lotes que permitam atenção ao detalhe sem sobrecarregar cada agente.

- 301 frases ÷ 20 subagentes ≈ 15 frases por lote (último lote com 16).
- Cada frase tem ~10 palavras → ~150 palavras por lote (~300 campos textuais
  de palavra + 30 de frase). Tamanho confortável para qualidade.
- Ordenação por `id` do dataset (que acompanha `song_group` na versão A), para
  que lotes sejam contíguos e fáceis de auditar: lote N = ids `15(N-1)+1 … 15N`
  (lote 20 = ids 286–301).
- Cada subagente escreve **somente** seu shard `data/translations/shard-NN.json`
  e nunca toca outros arquivos (evita conflito de escrita).

### 6.2 Brief obrigatório ao subagente de tradução
Cada brief contém: (a) lista exata de ids e textos do lote, copiada do
dataset; (b) regra de tokenização (regex D2) com exemplo; (c) esquema JSON de
D3; (d) critérios R1/R2 com exemplos bons e ruins; (e) proibição de scripts de
tradução automática; (f) instrução de autoverificação: contar tokens por frase
e conferir que `words.length` bate; (g) caminho do arquivo de saída.

Exemplo bom (frase 1):
- `literal`: "Certifique-se de que você lava suas mãos antes de preparar comida."
- `natural`: "Lave bem as mãos antes de mexer na comida."
- palavra "Make" → literal "fazer", contextual "Em 'make sure': garantir, certificar-se."
- palavra "before" → literal "antes de", contextual "Marca o que vem primeiro: lavar antes de preparar."

Exemplo ruim (rejeitado): contextual "Tradução de make" (vazio de informação);
contextual copiando o literal; contextual em inglês.

### 6.3 Revisão em lotes
- Passo 1 (mecânico): script de validação (ver §8) detecta campos vazios,
  desalinhamento de `word` e contagem de tokens.
- Passo 2 (qualitativo): amostragem ≥ 20% de cada shard por um subagente
  revisor distinto do autor, buscando: literal artificial, natural que mudou o
  sentido, contextual genérico, palavras com sentido diferente (homógrafos).
- Passo 3 (consistência): revisor transversal sobre as palavras mais polissêmicas
  (lista das ~40 palavras com mais ocorrências e/ou homógrafos conhecidos: port,
  right, left, second, will, can, present, project, issue, article, state,
  course, term, minute, major, content, lead, record, subject, object).
- Todo shard reprovado volta ao autor com a lista de correções; não se avança
  de fase com shard pendente.

### 6.4 Merge
`data/merge_translations.py` (apenas junta shards, ordena por id, valida
unicidade de ids e de textos, grava `data/wfd-translations.json` e gera
`src/data/wfd-translations.ts`). O script não contém texto de tradução.

### 6.5 Produção de áudio
- Script de produção em `data/` (ex.: `generate_audio.py`): lê o dataset,
  chama o gateway com as mesmas vozes/instrução do `tts.server.ts`, grava WAV
  temporário em `/tmp`, converte para MP3 com ffmpeg e grava em `public/audio/`.
- Idempotente: pula arquivos existentes e válidos (`ffprobe` com duração > 0.5 s).
- Concorrência limitada (4–6 requisições) e retry com backoff em 429/5xx;
  respeitar exit 5/rate limit com espera.
- Ordem: primeiro `masculina-neutro` e `feminina-australiano` de 3 frases como
  amostra de qualidade, depois lote completo, em execuções de ≤ 10 min cada
  (limite de 600 s do ambiente), retomáveis.
- Verificação: `ffprobe` em todos; manifesto; contagem 1.204; soma de bytes.
- A produção do áudio ocorre **antes** da remoção do código de TTS, pois reusa
  o gateway e as vozes; só depois a nuvem sai do app.

## 7. Plano de implementação do app

### 7.1 Arquivos novos
- `src/lib/tokenize.ts` — D2.
- `src/data/wfd-translations.ts` — gerado (D3).
- `src/lib/audio-path.ts` — `audioPathFor(id, voz, acento)` puro e testável;
  precisa do `id` por frase, então `src/data/wfd-sentence-ids.ts` mapeia texto →
  id (gerado do dataset) ou o próprio módulo de traduções expõe `id`.
- `src/lib/audio-player.ts` — controlador singleton: `play(url, rate)`,
  `stop()`, `subscribe(listener)`; garante um áudio por vez; sem acesso a
  `window` no import (criação de `Audio` só dentro de `play`).
- Testes em `src/test/` (ver §8).

### 7.2 Arquivos alterados
- `src/components/sentence-list.tsx` — consumir dados locais e o player.
- `src/routes/settings.tsx` — remover "Em breve: IA", ajustar textos.
- `package.json`/lockfile — remover pacotes órfãos.

### 7.3 Arquivos removidos
`src/lib/ai/gateway.server.ts`, `translate.server.ts`, `translate.functions.ts`,
`tts.server.ts`, `tts.functions.ts`, `src/lib/translation-cache.ts`,
`src/lib/audio-cache.ts`, `src/test/translation-cache.test.ts`.
(Remoção só após a fase de áudio concluída e após o app já rodar sem eles.)

### 7.4 Passo a passo do componente
1. Extrair `tokenize`/`TOKEN_RE` para `src/lib/tokenize.ts`.
2. Substituir os estados assíncronos por derivação direta:
   `const t = translations?.[sentence]`; palavra = `t?.words[wordIndex]`.
3. O índice do token de palavra é calculado ao iterar `tokenize(sentence)`
   (contador incrementado apenas para tokens com `word !== null`).
4. Painel aberto guarda `{ sentenceKey, wordIndex }` em vez de só a palavra.
5. Áudio: botão chama `audioPlayer.play(audioPathFor(id, voz, acento), velocidade)`;
   o estado "tocando" vem de `subscribe`, comparado com a URL atual.
6. Troca de voz/acento durante reprodução: para o áudio atual (comportamento
   simples e previsível) — registrar no status.
7. Manter marcação, classes e `aria-*` existentes para não alterar o visual.

### 7.5 Compatibilidade com as três versões de grupo
As listas de grupo (A/B/C) são `string[][]` de frases. O lookup é por texto, então
a mudança não exige alterar `wfd-groups-*.ts`. Frase sem entrada (caso B/C se
divergirem do dataset) faz o teste de cobertura falhar, evidenciando o problema.

## 8. Estratégia de testes e validação

### 8.1 Testes unitários (vitest), um por regra
1. `wfd-translations.test.ts`: as 301 frases do dataset têm `literal` e
   `natural` não vazios (trim.length > 0) e diferentes do texto inglês.
2. Mesmo arquivo: para toda frase, `words.length === wordTokens(sentence).length`
   e `words[i].word === wordTokens(sentence)[i]`; `literal` e `contextual`
   não vazios; `contextual.length ≤ 140`.
3. Mesmo arquivo: nenhuma tradução contém marcadores proibidos (`TODO`, `???`,
   `[`, `]`) nem é igual ao inglês original.
4. Mesmo arquivo: todo texto de todas as versões de grupo A/B/C (todas as
   frases) possui entrada em `wfdTranslations`.
5. `audio-files.test.ts`: para cada frase × voz × sotaque o arquivo existe em
   `public/audio/` com tamanho > 2 KB (1.204 verificações).
6. `audio-path.test.ts`: `audioPathFor(1, "feminina", "australiano")` retorna
   `/audio/001-feminina-australiano.mp3`; id de 3 dígitos; trocas de voz/acento
   mudam o caminho.
7. `tokenize.test.ts`: contrações e hífen são um token; pontuação não vira
   token de palavra; `wordTokens("Don't stop.")` = ["Don't", "stop"].
8. `audio-player.test.ts`: iniciar um segundo áudio para o primeiro (um por vez),
   com `Audio` simulado; `stop()` notifica assinantes.
9. Teste de ausência de nuvem: nenhum arquivo em `src/` (exceto testes) importa
   `@/lib/ai` nem referencia `ai.gateway.lovable.dev`.
10. Settings: `use-wfd-settings.test.ts` existente continua verde (sem alterar).

### 8.2 Gates de build
`bunx vitest run` verde; `bun run build` OK; `bun run lint` 0 erros;
`tsgo --noEmit` limpo (respeitando `noPropertyAccessFromIndexSignature` e
`exactOptionalPropertyTypes`: acesso por colchetes em Records e spread
condicional para props opcionais).

### 8.3 Playwright (viewport 1280×1800 e um viewport mobile com toque)
- Bloquear qualquer host externo e `/_serverFn` com `page.route(..., abort)` e
  registrar requisições; durante o fluxo completo não pode haver requisição
  bloqueada nem falha.
- Fluxo: ativar tradução individual → tocar numa palavra → painel com literal e
  contextual esperados (conferir o texto contra o módulo de dados).
- Fluxo: tap proposital no card → tradução literal + natural; drag/scroll não
  expande (aria-expanded).
- Fluxo: play com voz feminina/australiano → o `src` do `Audio` termina em
  `-feminina-australiano.mp3`; trocar settings e repetir com os outros três.
- Fluxo: iniciar segunda frase interrompe a primeira.
- Reload e settings persistidos; home e `/copiar` sem regressão; zero `pageerror`.
- Captura de screenshot dos painéis para o relatório.

## 9. Critérios de aceite por fase

| Fase | Aceite |
|---|---|
| 1 Fundação | 3 arquivos coerentes em disco; status do estágio escrito |
| 2 Infra de dados | `tokenize.ts`, esquema, script de merge, validador e testes (falhando em dado vazio) prontos |
| 3 Traduções | 20 shards completos, validação mecânica verde, revisão ≥ 20% sem pendências |
| 4 Áudio | 1.204 MP3 válidos, manifesto, tamanho total registrado, amostra auditada |
| 5 App local | UI consome só dados locais, player único, settings limpas, sem estados de rede |
| 6 Remoção da nuvem | `src/lib/ai` e caches removidos, pacotes órfãos fora, `rg` vazio |
| 7 Validação final | vitest/build/lint/tsgo verdes, Playwright sem rede de IA, status + monitor |

## 10. Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Subagente perde alinhamento de tokens | Palavra com tradução trocada | Campo `word` redundante + teste de alinhamento; shard reprovado volta ao autor |
| Qualidade desigual entre subagentes | Inconsistência | Brief único com exemplos; revisor transversal; polissêmicas auditadas |
| Contextuals genéricos ("tradução de X") | Valor pedagógico baixo | Regra R2.4/R2.5 + amostragem de revisão + limite de repetição de contextual idêntico |
| Rate limit/429 do gateway na produção do áudio | Atraso | Concorrência limitada, retry com backoff, execução retomável em passos < 10 min |
| Tamanho do áudio | Repositório pesado | Orçamento 60 MB; reduzir bitrate antes de cortar combinação |
| Voz/sotaque inconsistentes entre frases | Experiência irregular | Mesma instrução fixa; auditoria de amostras por voz/acento |
| Bundle inicial grande | Home lenta | Dados em chunk dinâmico (D6); medir tamanho no build |
| Remover IA antes de gerar o áudio | Perder a ferramenta de produção | Ordem fixa: áudio (fase 4) antes da remoção (fase 6) |
| Hidratação (SSR) | Aviso/erro no console | Player cria `Audio` só em `play`; sem browser API no render |
| Remix reativa o protocolo sem arquivos | Retrabalho | Arquivos project9/prd/roadmap versionados em `.opencode/` |
| Monitor indisponível (OpenCode fora do ar) | Sem relatório automático | Registrar no status; reenviar mensagem quando o monitor voltar |

## 11. Decisões registradas (sem consulta ao usuário, conforme protocolo)

- DR1. Chunk de dados carregado sob demanda em vez de bundle estático.
- DR2. Trocar voz/acento durante reprodução para o áudio atual (não troca "a quente").
- DR3. Formato de áudio MP3 mono 24 kHz ~56 kbps (compatível com todos os navegadores-alvo).
- DR4. Id de 3 dígitos nos nomes de arquivo, estável e ordenável.
- DR5. Lotes de ~15 frases (20 subagentes), conforme recomendação do planejamento.
- DR6. Lovable Cloud permanece ativo (estrutural); nenhuma tabela, nenhuma migration.
- DR7. O app deixa de oferecer qualquer funcionalidade de IA; a seção "Em breve: IA"
  é removida (planejamento, item 5).
- DR8. Scripts só para merge/validação/áudio; nunca para gerar texto de tradução.

## 12. Escopo explicitamente fora

- Novas funcionalidades de interface além das descritas.
- Tradução para outros idiomas além de pt-BR.
- Edição das letras/estilos das músicas (`wfd-songs-*`) e das versões de grupo.
- Backend, autenticação, tabelas, edge functions.
- Qualquer IA em tempo de uso (inclusive "futuramente").

## 13. Definição de pronto (DoD)

1. Todas as caixas do roadmap do project9 marcadas, cada fase com Gates PASSOU e evidência.
2. Testes de cobertura de dados e áudio verdes e capazes de falhar (verificado ao
   remover temporariamente uma entrada).
3. Playwright comprova uso sem rede de IA.
4. `docs/planning/stages/stage-NN-status-project9.md` escrito por fase e monitor
   informado (ou indisponibilidade registrada).
5. Relatório final ao usuário em três blocos: feito / verificação / pendências.

## 14. Anexo A — esquema TypeScript

```ts
export interface WordTranslation {
  word: string;
  literal: string;
  contextual: string;
}
export interface SentenceTranslation {
  id: number;
  text: string;
  literal: string;
  natural: string;
  words: WordTranslation[];
}
export type WfdTranslations = Record<string, SentenceTranslation>;
```

## 15. Anexo B — ordem de execução dos lotes

| Lote | ids | Lote | ids |
|---|---|---|---|
| 01 | 1–15 | 11 | 151–165 |
| 02 | 16–30 | 12 | 166–180 |
| 03 | 31–45 | 13 | 181–195 |
| 04 | 46–60 | 14 | 196–210 |
| 05 | 61–75 | 15 | 211–225 |
| 06 | 76–90 | 16 | 226–240 |
| 07 | 91–105 | 17 | 241–255 |
| 08 | 106–120 | 18 | 256–270 |
| 09 | 121–135 | 19 | 271–285 |
| 10 | 136–150 | 20 | 286–301 |

Execução em ondas (para não saturar): 2 ondas de 10 subagentes simultâneos, ou 1
onda de 20 se o ambiente permitir; entre ondas, validar mecanicamente os shards
já prontos.

## 16. Anexo C — checklist do revisor

- [ ] A frase `literal` preserva todos os elementos da original?
- [ ] A `natural` soa como fala/escrita brasileira real e mantém o sentido?
- [ ] Todos os tokens têm entrada e `word` confere?
- [ ] O `literal` da palavra é curto e correto para a classe gramatical?
- [ ] O `contextual` explica o papel NAQUELA frase (não uma definição genérica)?
- [ ] Homógrafos/polissêmicos têm o sentido certo?
- [ ] Acentuação e ortografia pt-BR corretas?
- [ ] Sem repetição mecânica de contextual entre palavras diferentes?
- [ ] Sem texto em inglês nos campos de tradução (exceto termos intraduzíveis citados)?

## 17. Anexo D — checklist de áudio

- [ ] 1.204 arquivos, nomes conforme D5.
- [ ] `ffprobe`: duração entre 0.8 s e 12 s, codec mp3, 1 canal.
- [ ] Amostra auditiva/espectral: sem silêncio inicial > 0.6 s, sem corte no fim.
- [ ] Diferença perceptível entre australiano e neutro (instrução aplicada).
- [ ] Vozes feminina e masculina corretas em todas as frases (checagem por manifesto).
- [ ] Soma de bytes registrada e ≤ orçamento.

## 18. Anexo E — mensagem ao monitor por estágio

Ao concluir cada fase: escrever `docs/planning/stages/stage-NN-status-project9.md`
(entregue / arquivos / evidências / notas para o monitor) e enviar "Stage NN
completed (project9). Please evaluate against PRD and roadmap." Aguardar o
relatório em `docs/planning/reports/stage-NN-eval-project9.md` e aplicar as
correções apontadas antes de avançar. No encerramento: "remix finalizado (+N da
etapa do roadmap que foi efetuada)".
