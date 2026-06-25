# Checklist — Camada 4 AUD_* (planilha MOVI KIDS) — I61

**Camada:** 4 — logs append-only · **GAS:** v1.5.159 prod · **Status:** ✅ prod 25/06

## Abas

| Aba | Cols | Repair API | Consumidor |
|-----|------|------------|------------|
| AUDITORIA | 8 | `repararAuditoriaPlanilhaAdmin` | Metas RH · bônus · `listarAuditoriaAdmin` |
| AUD_TURNO | 7 | `repararAudTurnoPlanilhaAdmin` | Login/logout balcão |
| AUD_SMS | 13 | `repararAudSmsPlanilhaAdmin` | SMS pausado — histórico |
| AUD_WHATSAPP | 12 | `repararAudWhatsappPlanilhaAdmin` | WA pausado — histórico |
| AUD_RESPONSAVEIS | 7 | `repararAudResponsaveisPlanilhaAdmin` | Import CRM |

**Layout comum:** header **linha 1** · dados **linha 2+** (nunca reformatar milhares de linhas)

## Scripts

- Lote: `REPARAR_AUD_CAMADA4_PLANILHA_ADMIN.ps1`
- Teste: `TESTE_AUD_CAMADA4_READONLY.ps1`
- Por aba: `TESTE_PROTOCOLO_ABA_PLANILHA.ps1 -Aba AUDITORIA` (etc.)

## Pós-deploy

1. Colar `.gs` v1.5.159 + Nova versão Web
2. `.\scripts\testes\REPARAR_AUD_CAMADA4_PLANILHA_ADMIN.ps1`
3. `.\scripts\testes\TESTE_AUD_CAMADA4_READONLY.ps1`

**Regra:** repair **não altera** linhas de log — só header, congelar L1, proteger L1.
