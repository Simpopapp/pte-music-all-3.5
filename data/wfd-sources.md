# Fontes — project1 (PTE WFD Dataset)

Fontes consultadas e método de ranking, conforme PRD §3 e §6.

## Fontes efetivas (frases extraídas)

1. **PTE Nepal — Weekly Prediction File, 5–11 out 2026** (214 itens)
   https://ptenepal.com/blog/pte-prediction-oct5-11-2026-write-from-dictation/
2. **PTE Nepal — snapshot "updated weekly"** (213 itens; os URLs antigos de
   jun/ago-redirecionam para a lista semanal corrente)
   https://ptenepal.com/blog/pte-write-from-dictation-predictions-june-2026/
3. **PTE Helper — 100 Write From Dictation (respostas numeradas)**
   https://ptehelper.com.au/write-from-dictation/

## Fontes de corroboracao (consultadas, conteúdo dinâmico)

- ApeUni (https://www.apeuni.com/en) — predições semanais de alta frequência.
- GoPTE (https://gopte.co/wfd) — 39k questões WFD por semana de ocorrência.

## Método

- União das 3 fontes: 307 frases únicas (8 em 3 fontes, 200 em 2, 99 em 1).
- Remoção de boilerplate de página (6 entradas) → 301 frases finais.
- `priority_rank` = ordenação por (recorrência entre fontes desc,
  posição na predição mais recente asc).
- Variantes resolvidas por maioria/prioridade de fonte (PRD §3.2), ex.:
  "The nation achieved prosperity by opening its ports for trade."
- `topic` via classificador por palavras-chave (PRD §4.3); predominância
  de Campus reflete a composição real dos bancos WFD.
- `song_group`: 31 lotes, todos entre 9 e 10 frases (22×10 + 9×9).

## Validação

```sh
python3 data/validate_wfd.py
```
