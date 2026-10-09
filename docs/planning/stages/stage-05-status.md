# Stage 05 — Integração no app (project5)
Data: 2026-10-08
- data/generate_songs_module_b.py → src/data/wfd-songs-b.ts (16 músicas, prettier fix aplicado)
- Botões "Copiar letra"/"Copiar ritmos" habilitados nos tipos B e C; tipo A inalterado
- head() e rodapé atualizados; novo teste src/test/wfd-songs-b.test.ts (3 testes)
# Stage 05 — Integração no app (project6)
Data: 2026-10-08
- src/data/wfd-songs-a.ts gerado por data/generate_songs_module_a.py (31 músicas, 77.502 chars)
- src/routes/index.tsx: lookup estendido ao tipo A; botões "Copiar letra"/"Copiar ritmos" agora em A/B/C; head/og e rodapé atualizados ("todos os tipos")
- src/test/wfd-songs-a.test.ts: 3 testes (padrão wfd-songs-b/c.test.ts) — vitest 10/10
- Tipos B/C inalterados (apenas condição dos botões generalizada de B/C para song &&)
