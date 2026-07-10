# Checklist — operação pelo celular (sem PC)

**FE:** v1.9.36 · **GAS:** v1.5.182 (sem deploy necessário)

---

## Atualizar o app no celular/tablet

1. Abra: **https://ribocg-a11y.github.io/movikids/?force=1.9.36**
2. Se tiver ícone PWA: feche o app completamente e abra de novo pelo link.
3. Confirme versão: menu ou banner deve mostrar **1.9.36**.

---

## Teste rápido (2 min)

| Passo | Esperado |
|-------|----------|
| Login operador | Entra no balcão |
| Nova → 1 veículo → salvar | Overlay ~15s → some → card Pendente |
| ▶ Iniciar | Cronômetro conta |
| Nova → 2 veículos (cesta) | Overlay “1 de 2…” → Home após 1º → “2 de 2…” |
| Overlay travado | 14s → botão **Continuar sem esperar** |

---

## Se algo falhar

- **Overlay preso:** toque “Continuar sem esperar” ou recarregue com `?force=1.9.36`
- **Cadastro sumiu:** confira Home após 30s; sync atualiza sozinho
- **Duplicata:** não salvar de novo se overlay ainda estiver ativo

---

## O que NÃO precisa fazer no celular

- ❌ Editor Apps Script
- ❌ Nova versão Web GAS
- ❌ Cursor / git

Tudo isso fica para quando estiver no computador (opcional: GAS batch futuro).
