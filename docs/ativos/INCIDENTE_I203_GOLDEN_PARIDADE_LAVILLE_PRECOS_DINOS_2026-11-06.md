# I203 — Golden = La Ville (preços/tempos + 2 dinos)

**Data:** 06/11/2026 (America/Fortaleza) · **FE:** **v1.9.197** · **GAS repo:** **v1.5.238** · Web até Nova versão: **v1.5.237**

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

## FE

Fallback frota Golden + label UI · bump **1.9.197**.
