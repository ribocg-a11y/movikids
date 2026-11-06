# Protocolo — mudança de tabela de preços / frota

**Obrigatório** antes de declarar “preços alinhados” ou “frota nova”.  
Origem: I203 / I203b / I203c (06/11/2026) — avulso e locações do dia ficaram para trás.

## Princípio

| Alinha | Não copia cegamente |
|--------|---------------------|
| Valores e tempos (planos) | Quantidade de veículos por loja |
| Tipos de preço (Carro/Dino/…) | Frota LV → Golden (Golden tem **4 pelúcias**) |

## Checklist (ordem)

### 1. Planilha (agente · API admin)

- [ ] `CONFIG` → `precos_json` (sem 3h se a grade nova não tem)
- [ ] `CONFIG` → `veiculos_validos_json` (Golden: 4 pelúcias + dinos se pedido)
- [ ] `validarSchema` · `CUSTOS.unidade_id` e demais abas críticas
- [ ] Locações **já cobradas no real** no dia da virada → `corrigirFinanceiroLocacaoAdmin` (**valorPlano + valorTotal**)

### 2. GAS repo (agente prepara · sócio Nova versão Web)

- [ ] `PRECOS` / `VEICULOS_VALIDOS` defaults
- [ ] `validarVeiculosConfig_` aceita novos tipos
- [ ] `corrigirFinanceiroLocacaoAdmin_` aceita `valorPlano`
- [ ] `salvarLocacao_` / avulso leem `operacaoConfig_` (não constante velha)

### 3. Frontend (bump I3 + push)

| Superfície | Arquivo | O que checar |
|------------|---------|--------------|
| Boot / fallback preços | `mk-globals.js` | PRECOS = grade nova + Dino |
| Frota cards | `mk-home.js` · `mk-nova.js` · `mk-operacao.js` · `mk-unidades.js` | Dinos / 4 pelúcias |
| **Lanç. Avulso** | `mk-avulso.js` · `#avulso-tipo-grid` | tipos via PRECOS (Golden **com Dino**) |
| Admin OPCFG | `mk-admin.js` | tipos Dino/Drift · não regrava 3h zerado |
| Estender / planos | `mk-operacao.js` | sem 3h se ausente no catálogo |
| Hub marketing | `index.html` feats | números reais da frota |

### 4. Travas

- [ ] `guard.i203.*` no `pre-push-check`
- [ ] `TESTE_I203_GOLDEN_PARIDADE_LAVILLE_READONLY.ps1`
- [ ] Após Web: re-rodar correção `valorPlano` se ficou só `valorTotal`

### 5. Encerramento

- [ ] `verify-publish-complete` · `encerramento-sessao` exit 0
- [ ] HANDOFF + MAPA + incidente

## Erro clássico (não repetir)

Mudar só CONFIG/balcão Nova Locação e **esquecer Lanç. Avulso** = prova de mapa incompleto (I203c).
