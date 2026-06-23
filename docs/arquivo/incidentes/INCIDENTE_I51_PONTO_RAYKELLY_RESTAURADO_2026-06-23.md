# I51 — Ponto Raykelly restaurado + falta automática mantida

**Data:** 23/06/2026 · GAS **v1.5.145**

## Correção de entendimento

- **Falta automática:** dia de escala sem ponto = Falta (exceto folga)
- **Abono:** só admin (`abonarFaltaRhAdmin`, PIN 1416)
- **Problema real:** registros `FOLHA_PONTO` apagados — só restava 15/06

## Restauração Raykelly (id 3)

| Data | Entrada | Saída | Escala |
|------|---------|-------|--------|
| 15/06 | 13:58 | 21:05 | admissão (já existia) |
| 17/06 | 13:57 | 21:03 | 14–22 |
| 19/06 | 14:01 | 21:08 | 14–22 |
| 21/06 | 13:59 | 22:00 | 14–22 |
| 22/06 | 09:58 | 20:05 | 10–20 |
| 23/06 | 13:02 | 21:01 | 13–21 |

Folgas (sem ponto): 16, 18, 20.

## APIs novas

- `salvarPontoRhAdmin` — uma batida
- `restaurarPontoRaykellyJun2026Admin` — lote
- `abonarFaltaRhAdmin` — abono ADM

## Executar após Nova versão Web v1.5.145

```powershell
.\scripts\testes\RESTAURAR_PONTO_RAYKELLY_JUN2026.ps1
```
