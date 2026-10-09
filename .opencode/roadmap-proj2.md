# Roadmap — project2 (WFD Group Viewer)

Dependência: PRD em `.opencode/prd-project2.md` (mesmo projeto e versão).

## Fase 1 — Fundação do protocolo (3 arquivos)
- [x] Criar PRD (`prd-project2.md`) derivado do planejamento (project2)
- [x] Criar roadmap (este arquivo) com fases e gates
- [x] Verificar coerência planejamento ↔ PRD ↔ roadmap (mesmo escopo)
- [x] Reportar estado inicial ao monitor OpenCode (recebimento confirmado)
- Gates: 3 arquivos do project2 existem em disco e coerentes; monitor informado. PASSOU.

## Fase 2 — Geração do JSON de grupos
- [x] Escrever script gerador determinístico (dataset → array de 31 arrays de strings)
- [x] Gerar `data/wfd-groups.json` (apenas frases, sem metadados)
- Gates: JSON parseia; 31 grupos; 301 frases; zero metadados além das frases; dataset original intocado. PASSOU.

## Fase 3 — App de visualização e cópia
- [x] Implementar rota principal com lista dos 31 grupos e painel de frases
- [x] Cópia em texto (frases separadas por `,\n`) e em JSON (array de strings) + JSON completo dos 31 grupos
- [x] Feedback visual de cópia, deep-link `?grupo=N` e head() com metadados próprios
- Gates: build sem erros; navegação entre grupos funcional; formatos de cópia exatos (vírgula+parágrafo no texto). PASSOU.

## Fase 4 — Validação e reporte
- [x] Escrever e rodar `data/validate_groups.py` (parse, 31 grupos, 301 frases, fidelidade frase a frase, tamanhos 8–10)
- [x] Gates de build/testes (`bunx vitest run`, `bun run build`) e verificação visual Playwright (cópia verificada no clipboard)
- [x] Marcar roadmap 100% e reportar conclusão ao monitor OpenCode
- Gates: `VALIDACAO OK`; build OK; testes verdes; monitor notificado; entrega final ao usuário. PASSOU.
