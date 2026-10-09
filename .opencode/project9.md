# project9 — Traduções e áudio prontos no projeto (remover dependência de nuvem/IA em uso)

## Contexto (correção do project8)
No project8 a frase "ou até i.a (futuramente)" foi mal interpretada: a IA virou
o motor das traduções e do áudio **durante o uso do app**. Hoje:
- tradução de palavra e de frase é gerada sob clique via Lovable AI Gateway
  (`src/lib/ai/translate.server.ts` / `translate.functions.ts`), com cache só
  depois do primeiro uso;
- o áudio é gerado sob clique via TTS na nuvem (`src/lib/ai/tts.server.ts` /
  `tts.functions.ts`).

Isso estava errado: era trabalho prévio que o builder deveria ter feito.
IA no app NÃO é requisito agora.

## Objetivo
Substituir 100% o sistema "traduzir/gerar durante o uso" por conteúdo **pronto,
criado pelo próprio builder, salvo nos arquivos do projeto** (não em nuvem),
sem perder NADA de qualidade nem de funcionalidade do project8.

## O que fazer

### 1. Traduções de frases (301 frases)
- O builder escreve, ele mesmo, para cada uma das 301 frases:
  - `literal`: tradução literal fiel em pt-BR;
  - `natural`: como um brasileiro diria a mesma ideia (não literal, contexto geral).
- Salvar em `data/wfd-translations.json` (fonte) e módulo tipado
  `src/data/wfd-translations.ts`, indexado pelo id/texto exato da frase.

### 2. Traduções palavra por palavra (todas as palavras de todas as frases)
- Para CADA palavra de CADA frase (mesma tokenização usada hoje em
  `sentence-list.tsx`), o builder escreve:
  - `literal`: tradução de dicionário curta;
  - `contextual`: o que a palavra significa NAQUELA frase (1 frase breve, pt-BR).
- A mesma palavra em frases diferentes pode ter sentidos diferentes
  (ex.: "port"): a chave é sempre (frase + posição/palavra), nunca só a palavra.
- Mesmo arquivo/módulo do item 1 (ex.: `words: [{ word, literal, contextual }]`
  por frase, na ordem dos tokens).
- Qualidade igual ou superior à da IA atual; revisar em lotes (por grupo do
  Tipo A) para manter consistência.

### 3. Áudio pré-gerado
- Gerar uma única vez, fora do app, os arquivos de áudio de todas as 301 frases
  para todas as combinações das settings: voz feminina/masculina ×
  sotaque australiano/neutro (velocidade continua no navegador via
  `playbackRate`, sem arquivos extras).
- Usar a mesma voz/qualidade atual (vozes Aoede/Puck, instrução de sotaque
  australiano) só como ferramenta de produção do builder; converter para MP3
  compacto (ffmpeg, mono, ~48–64 kbps) e salvar em `public/audio/...`
  com nome determinístico (ex.: `public/audio/{frase-id}-{voz}-{acento}.mp3`).
- Conferir: 301 × 4 arquivos existentes, todos tocáveis, tamanho total
  razoável (registrar o total no status).
- Se o tamanho total for inviável, registrar e reduzir bitrate antes de
  cortar qualquer combinação — nenhuma opção de settings pode sumir.

### 4. App consumindo apenas dados locais
- `sentence-list.tsx`: tradução de palavra e de frase lidas do módulo local
  (instantâneo, sem "Gerando tradução…", sem estado de erro de rede).
- Áudio: tocar o MP3 local correspondente às settings; manter um áudio por vez,
  estado "tocando", velocidade.
- Manter intactos: aba Config., toggles, persistência `wfd-settings-v1`,
  proteção anti-expansão acidental no mobile, coexistência dos dois modos,
  home e `/copiar` sem regressão.

### 5. Remover a nuvem
- Apagar `src/lib/ai/*`, `src/lib/translation-cache.ts`, `src/lib/audio-cache.ts`
  e qualquer chamada a server functions de IA.
- Remover dependências que só serviam a isso (`ai`, `@ai-sdk/openai`, etc.),
  se nada mais as usar.
- Remover/limpar a seção "Em breve: IA" da aba settings (IA não é plano atual).
- O app deve funcionar com 0 chamadas de rede para tradução/áudio.
- Desativar o uso do backend se nada mais depender dele (registrar no status
  o que foi possível remover e o que é estrutural da plataforma).

### 6. Validação
- Teste: toda frase das 301 tem `literal` e `natural` não vazios.
- Teste: toda palavra tokenizada de toda frase tem `literal` e `contextual`.
- Teste: existe arquivo de áudio para cada frase × voz × sotaque.
- `bunx vitest run`, `bun run build`, lint limpos.
- Playwright: palavra, frase e áudio funcionando com a rede de IA bloqueada;
  nenhuma requisição para gateway/servidor durante o uso.
- Seguir o protocolo do monitor (PRD + roadmap do project9, status por stage,
  relatórios em `docs/planning/reports/`).

## Critério de sucesso
Mesma experiência do project8, mesma ou melhor qualidade, tudo pronto e salvo
no projeto, nenhuma IA/nuvem usada durante o uso do app.

## Instruções finais
Não use python pra automatizar a geração, opte por agentes simultaneous
trabalhando em diferentes versões, encontre o meio termo ideal onde cada
agente consiga realizar melhor um numero de traduções pra ser
suficientemente util tendo em vista que são muitas mas sem lotar o agente
com varias responsabilidades pra ele não se perder, recomendado ~20
subagents pras 301 frases em seus respectivos tipos.
