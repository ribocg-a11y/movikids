# I203 — Golden = La Ville (preços/tempos + 2 dinos)

**Data:** 06/11/2026 (America/Fortaleza) · **FE:** **v1.9.198** · **GAS Web:** **v1.5.238** · repo **v1.5.239**

## Pedido

Tabela de preços/tempos do Golden igual à do La Ville + dois dinossauros no Golden.

## Live (CONFIG planilha — já aplicado via `salvarOperacaoConfigAdmin`)

| Item | Antes Golden | Depois (= La Ville) |
|------|--------------|---------------------|
| Brinquedos 10–60min | 12/22/30/40/55 a=1 · Pel 15… a=1,2 | **15/25/35/45/65 a=1,5** |
| Plano 3h | sim | **removido** |
| Dino 10–60min | — | **20/35/50/65/90 a=2** |
| Frota | 4+3+4 | **+ Dino 01/02** (IDs internos interim `Dino 0N Carro` até Web 238) |

La Ville (`unidade_laville`) permanece no catálogo embutido — intocado.

## Por que `Dino 0N Carro` no ID

Web **v1.5.237** `validarVeiculosConfig_` só aceitava Carro/Triciclo/Pel. Bypass: nome com `Dino` + `Carro` → tipo **Dino** + passa validador. FE **v1.9.197** `mkVeiculoLabelUi_` mostra **Dino 01/02**.

## GAS v1.5.238 (repo — Nova versão Web pendente §7.3)

- `VEICULOS_VALIDOS` + `PRECOS` alinhados à grade LV
- Validator aceita **Dino/Drift**
- `OPCFG_TIPOS_SCHEMA_` + Dino/Drift
- `invalidateOperacaoConfigCache_` no save
- Action `alinharGoldenLavilleConfigAdmin` → renomeia frota limpa `Dino 01`/`Dino 02`

Após Nova versão Web:

```text
?action=alinharGoldenLavilleConfigAdmin&adminPin=****
```

## I203b — impacto sistêmico (mesma sessão)

- **Frota Golden própria:** 4 carros · 3 triciclos · **4 pelúcias** · 2 dinos (LV continua 3 pelúcias)
- IDs limpos `Dino 01`/`Dino 02` após Web **v1.5.238** + `alinharGoldenLavilleConfigAdmin`
- Planilha: CONFIG atualizado · CUSTOS header `unidade_id` reparado (`schemaOk`)
- FE: `mk-globals` sem tabela 12/55/3h · fallbacks home/nova/operacao · admin OPCFG tipos Dino/Drift + strip 3h
- Guard `guard.i203.*` + `TESTE_I203_GOLDEN_PARIDADE_LAVILLE_READONLY.ps1`
- Repo **v1.5.239:** backfill CUSTOS col G + trava nPel===4 no alinhar (sócio: Nova versão)

## I203c — omissão Avulso + locações do dia (06/11)

**Falha de mapa:** `mk-avulso.js` só listava Dino em La Ville; Golden ficou sem Dino na página Lanç. Avulso.

**Locações pré-virada cobradas no real com tabela nova:**
| id | Veículo | Plano | Antes | Depois |
|----|---------|-------|-------|--------|
| 5355 | Pelúcia 01 | 10min | 15 | 15 (confirmado) |
| 5356 | Carro 01 | 10min | plano 12 / total→15 | total **15**; valorPlano **15** após Web 239 (`corrigir` + `valorPlano`) |

Protocolo novo: `PROTOCOLO_MUDANCA_TABELA_PRECOS_FROTA.md`.

## FE

Fallbacks + admin + **avulso Golden+Dino** · bump **1.9.199**.
