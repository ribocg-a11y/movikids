# Checklist — operação pelo celular (sem PC)

**FE:** v1.9.39 · **GAS:** v1.5.187 (batch ativo)

---

## Atualizar o app no celular/tablet

1. Abra: **https://ribocg-a11y.github.io/movikids/?force=1.9.39**
2. Se tiver ícone PWA: feche o app completamente e abra de novo pelo link.
3. Confirme versão: menu ou banner deve mostrar **1.9.39**.

---

## Teste rápido (3 min)

| Passo | Esperado |
|-------|----------|
| Login operador | Entra no balcão |
| Nova → 1 veículo → salvar | Overlay ~15s → some → card Pendente |
| ▶ Iniciar | Cronômetro conta |
| Nova → 2 veículos (cesta) | Overlay “1 de 2…” → batch mais rápido se GAS 187 |
| Overlay travado | 14s → botão **Continuar sem esperar** |
| **Encerradas hoje** | Conta **1 linha por telefone** (não repetir mesmo número) |
| **Caixa admin** | **Todas** as locações do dia (ex.: 12 loc · 8 contas) |

---

## Regra I103 (contagem)

| Tela | Número |
|------|--------|
| Tile **Contas hoje** | Telefones únicos |
| Lista **Encerradas** | Agrupada por conta |
| **Caixa** | Total de locações |

---

## Se algo falhar

- **Overlay preso:** toque “Continuar sem esperar” ou recarregue com `?force=1.9.39`
- **Cadastro sumiu:** confira Home após 30s; sync atualiza sozinho
- **Duplicata:** não salvar de novo se overlay ainda estiver ativo
- **Contagem errada:** Encerradas = contas · Caixa = locações (I103)

---

## O que NÃO precisa fazer no celular

- ❌ Editor Apps Script
- ❌ Nova versão Web GAS (já v1.5.187)
- ❌ Cursor / git

Tudo isso fica para quando estiver no computador.
