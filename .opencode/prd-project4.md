# PRD — project4: Estruturas Musicais Suno V5 para os Grupos do Tipo C

> Derivado de `.opencode/project4.md` (planejamento) e `.opencode/prompt-replicar-artista.md` (metodologia de referência).
> Precedência de escopo: planejamento > PRD > roadmap. Precedência de "como": PRD manda.

---

## 1. Contexto

O app atual (WFD Groups) exibe as 301 frases Write From Dictation do PTE Academic em 3
versões de separação (A: 10/10 → 31 grupos; B: 20/20 → 16 grupos; C: 30/30 → 11 grupos).
O projeto anterior (project3) entregou o seletor A/B/C, cópia texto/JSON e deep-linking.

O planejamento do project4 pede o próximo passo: transformar cada grupo do tipo C em
**estrutura musical completa** para o Suno V5, replicando a escrita de um artista
(Imagine Dragons, definido nas variáveis do prompt-replicar-artista.md), e expor esses
artefatos no app via botões de cópia.

## 2. Problema

As frases dos grupos hoje são texto cru. Para produzir músicas no Suno V5 a partir delas,
é necessário um artefato autoral por grupo:

1. **TXT 1 — Letra completa** (campo de letra do Suno): a música estruturada (seções,
   marcações e instruções de performance embutidas em inglês), com no mínimo ~1000
   caracteres líricos + ~1000 caracteres de instruções embutidas.
2. **TXT 2 — Elementos de estilo** (campo Style do Suno): no máximo 200 caracteres, em
   inglês, sequencial separado por vírgulas, com os elementos que descrevem como a música
   deve ser cantada/produzida.

## 3. Decisão de escopo (registrada)

- O planejamento diz "30 estruturas musicais", porém o tipo C tem **11 grupos** (301
  frases / 30 por grupo). A leitura coerente com "individualmente pra cada um dos grupos
  do tipo C" é: **uma estrutura musical completa por grupo do tipo C → 11 estruturas
  (22 arquivos txt)**. O "30" do planejamento refere-se ao tamanho dos grupos (30 em 30).
- **Decisão:** gerar 11 estruturas, 1 por grupo. Registrada no roadmap (justificativa) e
  aqui. Se o usuário pedir 30 estruturas depois, o pipeline desta PRD é reexecutável.

## 4. Metodologia de replicação (Imagine Dragons → Suno V5)

Fonte: `.opencode/prompt-replicar-artista.md`. Síntese operacional:

1. **Base lírica intocável (OBSERVAÇÃO CONTRADITÓRIA — prioridade máxima):** as 30
   frases de cada grupo devem aparecer **exatamente iguais** ao dataset. Nenhuma palavra
   muda. O trabalho é planejar a **estrutura** (seções, cadência, voz, instruções
   rítmicas ao longo da letra) para que o texto funcione musicalmente no Suno V5.
2. **Instruções de performance em inglês**, embutidas no campo de letra (marcações de
   seção, vocal, BPM, dinâmica, timbre), independentemente do idioma da letra.
3. **Elementos de estilo em inglês** (campo Style ≤ 200 chars), pensados em inglês
   (não traduzidos), escolhidos para o caso específico — nada de copiar os exemplos do
   prompt a menos que servirem de fato.
4. **Estágios de produção por estrutura:** (a) análise das frases do grupo (tema,
   repetições, métrica, humor); (b) plano de arranjo (arco dramático, BPM, tonalidade,
   seções Suno V5); (c) redação da letra estruturada com anotações; (d) revisão de
   fidelidade palavra a palavra; (e) campo de estilo; (f) checagem de limites.

Guia metodológico compartilhado será escrito na Fase 2 (docs/planning/suno-v5-methodology.md)
para que os subagentes paralelos produzam com consistência sem perder qualidade.

## 5. Formato dos artefatos

Para cada grupo N do tipo C (N = 1..11), pasta `data/songs/tipo-c/grupo-{NN}/`:

- `letra.txt` — letra completa com marcações Suno V5 (≥ ~2000 chars no total, sendo
  ~1000 líricos + ~1000 de instruções embutidas; instruções em inglês).
- `estilo.txt` — ≤ 200 chars, inglês, elementos separados por vírgula.

Espelho para o app: `src/data/wfd-songs-c.ts` (strings embutidas, geradas a partir dos
txt, com metadados por grupo). `data/songs/tipo-c/grupo-{NN}/` é a fonte da verdade;
o módulo TS é gerado a partir dela.

## 6. Integração no app

- Nos grupos do **tipo C**, além dos botões atuais (texto, JSON, JSON completo), dois
  botões novos: **"Copiar letra"** (conteúdo de `letra.txt`) e **"Copiar ritmos"**
  (conteúdo de `estilo.txt`).
- Tipos A e B permanecem inalterados (sem os botões).
- Botões desabilitados com feedback claro caso o artefato do grupo não exista.

## 7. Estratégia de execução

- Geração em **paralelo por subagentes** (um agente por grupo, lote simultâneo), cada um
  passando por todos os estágios de produção da seção 4, com o guia metodológico como
  insumo comum e o grupo de frases exato como base lírica.
- Monitor OpenCode (obrigatório no remix): avaliar fases concluídas e escrever relatórios
  em `docs/planning/reports/`. **Proibido** usar o monitor para gerar as estruturas
  (determinação do planejamento).

## 8. Escopo por fase

1. **Fundação do protocolo** — PRD + roadmap + coerência + monitor informado.
2. **Metodologia** — guia Suno V5 / Imagine Dragons (pesquisa + raciocínio, entregue em
   `docs/planning/suno-v5-methodology.md`).
3. **Geração paralela** — 11 estruturas (22 txt) por subagentes simultâneos.
4. **Validação de artefatos** — script de checagem (limites de caracteres, instruções em
   inglês, fidelidade palavra a palavra das 30 frases por grupo).
5. **Integração no app** — módulo TS + botões de cópia no tipo C + head() atualizado.
6. **Validação final e reporte** — build, testes, Playwright, status por stage e
   notificação ao monitor; entrega final ao usuário.

## 9. Critérios de aceite

- [ ] 11 pastas em `data/songs/tipo-c/`, cada uma com `letra.txt` e `estilo.txt`.
- [ ] Cada `letra.txt` contém as 30 frases do grupo **idênticas** ao dataset
      (validação automática palavra a palavra).
- [ ] Cada `letra.txt` ≥ ~2000 chars (≈1000 líricos + ≈1000 instruções, instruções em inglês).
- [ ] Cada `estilo.txt` ≤ 200 chars, em inglês, elementos separados por vírgula.
- [ ] Tipo C no app exibe "Copiar letra" e "Copiar ritmos" por grupo, com feedback visual.
- [ ] Tipos A e B inalterados.
- [ ] `bunx vitest run` verde; `bun run build` sem erros; verificação Playwright da UI.
- [ ] Monitor informado por fase concluída, com relatórios em `docs/planning/reports/`.

## 10. Riscos e mitigações

- **Divergência entre subagentes** → guia metodológico único + validação automática.
- **Alteração acidental das frases** → script de fidelidade palavra a palavra (Fase 4).
- **Estilo > 200 chars** → checagem automática e reescrita pelo agente responsável.
- **Volume de geração** → lotes paralelos; falhas individuais são reexecutadas isoladamente.

## 11. Registros de decisão

- D1: 11 estruturas (1 por grupo do tipo C), e não 30 — ver seção 3.
- D2: fonte da verdade dos txt em `data/songs/tipo-c/`; app consome módulo TS gerado.
- D3: instruções Suno sempre em inglês; frases do dataset jamais alteradas.
