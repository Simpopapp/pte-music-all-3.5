# Roadmap — project1 (PTE WFD Dataset)

Dependência: PRD em `.opencode/prd-project1.md` (mesmo projeto e versão).

## Fase 1 — Fundação do protocolo (3 arquivos)
- [x] Criar PRD (`prd-project1.md`) derivado do planejamento
- [x] Criar roadmap (este arquivo) com fases e gates
- [x] Verificar coerência planejamento ↔ PRD ↔ roadmap (mesmo escopo)
- Gates: 3 arquivos existem em disco e coerentes; monitor informado do estado inicial. PASSOU.

## Fase 2 — Pesquisa de fontes WFD
- [x] Buscar listas WFD em ApeUni High-Frequency Predictions
- [x] Buscar listas WFD em AlfaPTE, PTE Tools, Real PTE
- [x] Buscar fontes comunitárias complementares (fóruns, PDFs) com >=2 corroboracoes
- [x] Registrar URLs e evidências de frequência por fonte
- Fontes efetivas: ptenepal.com (snapshot semanal 5–11 out 2026, 214 itens; snapshot "updated weekly", 213 itens) e ptehelper.com.au (100 respostas WFD numeradas). GoPTE e ApeUni consultados (conteúdo dinâmico/apos login; usados como corroboracao indireta).
- Gates: >=3 fontes independentes consultadas (ptenepal x2, ptehelper, + busca ApeUni/GoPTE); URLs registradas; nenhuma fonte RS/RA aceita. PASSOU.

## Fase 3 — Compilação e ranking
- [x] Consolidar frases de todas as fontes e descartar não-WFD
- [x] Deduplicar (consolidar recorrencias elevando rank)
- [x] Atribuir priority_rank (monotonico) e topic
- [x] Calcular word_count por frase
- Resultado: uniao de 307 frases unicas (8 em 3 fontes, 200 em 2, 99 em 1); boilerplate removido; variantes resolvidas (ex.: "ports for trade" prevaleceu sobre "exports"); 301 frases finais. Rank = (recorrencia desc, posicao na predicao mais recente asc).
- Gates: >=50 frases genuinas (301); ranks monotonicos; zero duplicatas exatas. PASSOU.

## Fase 4 — Batching e geração do JSON
- [x] Agrupar em song_group sequenciais de 8–10 frases por dominio/fluxo
- [x] Rebalancear lotes vizinhos ate fechar todos entre 8 e 10
- [x] Gerar data/wfd-dataset.json (JSON bruto, sem preambulo)
- Resultado: 31 lotes (deficit distribuido em grupos de 9: lotes de 10 e 9, todos entre 8 e 10); topicos via classificador por palavras-chave.
- Gates: JSON parseia; id sequencial 1..301; song_group 8–10; word_count conferido. PASSOU.

## Fase 5 — Validação e reporte
- [x] Script de validacao: parse, consistencia de campos, tamanhos de lote, unicidade
- [x] Corrigir quaisquer falhas apontadas pelo script (6 entradas de boilerplate removidas; bug de rebalanceamento corrigido)
- [x] Reportar conclusao ao project-monitor (OpenCode)
- [x] Checagem de 5 min / 10 tentativas sobre novos arquivos e fases
- Gates: script sem falhas ("VALIDACAO OK"); monitor notificado; roadmap 100% marcado; entrega final ao usuario. PASSOU.
