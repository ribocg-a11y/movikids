# Checklist — Aba RESPONSAVEIS (planilha MOVI KIDS) — I59

**Camada:** 3 — CRM portal · **GAS:** v1.5.156 · **Status:** ✅ Fechada (prod)

## Schema (layout legado)

| Col | Campo |
|-----|-------|
| A–I | id, criadoEm, atualizadoEm, telefone, responsavel, criancasJson, observacao, origem, status |

**Layout:** header **linha 1** · dados **linha 2+**

## Resultado 24/06

| Item | Valor |
|------|-------|
| Repair | 241 linhas formatadas · header protegido |
| Cadastros | **241** planilha · **240** canônicos mapa |
| validarSchema | **schemaOk=True** |
| TESTE_PROTOCOLO_ABA | **ok_with_warnings** (1 tel curto L233) |
| listarResponsaveis | **ok** |

**Deploy:** ✅ Nova versão Web v1.5.156 · repair 24/06

**Aviso:** linha 233 telefone `987203839` (9 dígitos) — corrigir manualmente se necessário.
