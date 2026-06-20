# CONFIG operacional — template canônico (FASE 4)

**Planilha:** aba **CONFIG** (colunas `Chave` | `Valor`)  
**GAS:** `operacaoConfig_()` · fallback = constantes `VEICULOS_VALIDOS` + `PRECOS` no `.gs` (linhas ~99–131)  
**Teste:** `scripts/testes/TESTE_OPERACAO_CONFIG_READONLY.ps1`

---

## Chaves na planilha

| Chave | Tipo | Obrigatório |
|-------|------|-------------|
| `veiculos_validos_json` | JSON array de strings | Recomendado |
| `precos_json` | JSON objeto por tipo/plano | Recomendado |
| `formas_pagamento_json` | JSON array | Opcional |
| `regras_operacionais_json` | JSON objeto | Opcional |

**Fonte saudável:** `diagnosticoConfigOperacional` → `okConfig: true`, `fonte: config_ou_default`, `problemas: []`.

---

## veiculos_validos_json

```json
[
  "Carro 01", "Carro 02", "Carro 03", "Carro 04",
  "Triciclo 01", "Triciclo 02",
  "Pelúcia 01", "Pelúcia 02", "Pelúcia 03", "Pelúcia 04"
]
```

Regras: nome deve conter `Carro`, `Triciclo` ou `Pel` (Pelúcia); sem duplicatas.

---

## precos_json

Espelha `PRECOS` no GAS. Chaves de tipo: `Carro`, `Triciclo`, `Pelúcia`. Planos: `10min`, `20min`, `30min`, `40min`, `60min`, `3h`.

```json
{
  "Carro": {
    "10min": { "valor": 12, "mins": 10, "adicional": 1.00 },
    "20min": { "valor": 22, "mins": 20, "adicional": 1.00 },
    "30min": { "valor": 30, "mins": 30, "adicional": 1.00 },
    "40min": { "valor": 40, "mins": 40, "adicional": 1.00 },
    "60min": { "valor": 55, "mins": 60, "adicional": 1.00 },
    "3h":    { "valor": 130, "mins": 180, "adicional": 1.00 }
  },
  "Triciclo": {
    "10min": { "valor": 12, "mins": 10, "adicional": 1.00 },
    "20min": { "valor": 22, "mins": 20, "adicional": 1.00 },
    "30min": { "valor": 30, "mins": 30, "adicional": 1.00 },
    "40min": { "valor": 40, "mins": 40, "adicional": 1.00 },
    "60min": { "valor": 55, "mins": 60, "adicional": 1.00 },
    "3h":    { "valor": 130, "mins": 180, "adicional": 1.00 }
  },
  "Pelúcia": {
    "10min": { "valor": 15, "mins": 10, "adicional": 1.20 },
    "20min": { "valor": 25, "mins": 20, "adicional": 1.20 },
    "30min": { "valor": 35, "mins": 30, "adicional": 1.20 },
    "40min": { "valor": 45, "mins": 40, "adicional": 1.20 },
    "60min": { "valor": 65, "mins": 60, "adicional": 1.20 },
    "3h":    { "valor": 150, "mins": 180, "adicional": 1.20 }
  }
}
```

**Conferência negócio (08/06/2026):** Carro/Triciclo 3h = **130** · Pelúcia 3h = **150**.

---

## formas_pagamento_json (opcional)

```json
["PIX", "Debito", "Credito", "Dinheiro"]
```

---

## regras_operacionais_json (opcional)

```json
{
  "alertaMinutosRestantes": 5,
  "maxMinutosExtras": 720,
  "bloquearInicioEncerradaCancelada": true,
  "exigirAvisoExtra": true
}
```

---

## Como editar

1. **Planilha** — colar JSON na aba CONFIG (uma chave por linha).  
2. **App tablet** — **Sistema → Editar frota e preços** (admin; chama `salvarOperacaoConfigAdmin_`).  
3. **Validar** — `?action=diagnosticoConfigOperacional` ou `TESTE_OPERACAO_CONFIG_READONLY.ps1`.

**Sem Nova versão GAS** se só a planilha mudar. Após salvar no app, o cache `carregarInicio_v2` é limpo automaticamente.

---

## Produção (08/06/2026)

| Campo | Valor |
|-------|-------|
| `okConfig` | `true` |
| `fonte` | `config_ou_default` |
| Veículos | 10 |
| Carro 3h | 130 |
| Pelúcia 3h | 150 |
| KPI `ocupacaoFrota` | 9 itens |
