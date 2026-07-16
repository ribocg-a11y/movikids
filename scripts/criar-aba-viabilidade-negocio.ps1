# Instala aba VIABILIDADE_NEGOCIO na planilha MOVI KIDS
#
# Cloud/Linux: não há OAuth clasp aqui — rode no PC do sócio (Editor Apps Script).
#
# Passos (PC):
# 1. Abrir planilha: https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit
# 2. Extensões → Apps Script
# 3. Colar o conteúdo de scripts/planilha/instalarAbaViabilidadeNegocio.gs
# 4. Executar instalarAbaViabilidadeNegocio
# 5. Autorizar se pedir
# 6. Preencher amarelo: Contadora (B22), Manutenção (B21), etc.
#
# Alternativa: Importar CSV
#   docs/ativos/VIABILIDADE_NEGOCIO_MEMORIAL.csv → Arquivo → Importar → Nova aba
#
# Doc: docs/ativos/ESTUDO_NEGOCIO_BREAK_EVEN_TICKET_2026-07.md

Write-Host @"
MOVI KIDS — aba VIABILIDADE_NEGOCIO

1) Planilha:
   https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit

2) Extensões > Apps Script > colar:
   scripts\planilha\instalarAbaViabilidadeNegocio.gs

3) Rodar: instalarAbaViabilidadeNegocio

4) Preencher amarelos: B21 Manutenção, B22 Contadora, B23 Material, B24 Sistemas

CSV espelho: docs\ativos\VIABILIDADE_NEGOCIO_MEMORIAL.csv
"@
