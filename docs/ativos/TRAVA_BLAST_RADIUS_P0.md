# Trava — blast radius P0 (balcão vs admin)

**Criado:** 16/07/2026 · pós **I122** (locação fantasma no celular)  
**Status:** obrigatório para agente e revisões

---

## 1. O que aconteceu (post-mortem honesto)

### Linha do tempo

| Passo | Intenção | O que o agente fez demais |
|-------|----------|---------------------------|
| I120 / I120b | Admin lento + cache comando | Escopo admin (OK) + Julia sync |
| **I121** | Meta 0 × Centro 1 no **Dashboard** | Além de `kpiMes`/`mk-admin.js`, **pendurou `invalidateDashCaches_` dentro de `invalidateInicioResumoCache_`** — função chamada em **toda** nova/encerrar/cancelar locação |
| Colar Web **v1.5.200** | Deploy pedido | GAS sob carga; `carregarInicio` 22–36s |
| Sintoma | Celular “fantasma” / não atualiza | FE timeout **25s** + `_t` já zerava cache de `carregarInicio` (latente) → fallback `mk_inicio_cache` |
| **I122** | Apagar o fogo | Aí sim mexeu em `carregarInicio_` + `mk-sync.js` (P0) |

### O que já era frágil (latente)

- FE: `api()` timeout padrão **25s**
- GAS: `carregarInicio_` invalidava cache em todo `_t` (poll 5s com loc Ativa)
- Isso **já podia** falhar; a mudança I121 + carga admin **aumentou a chance** e o usuário sentiu na loja

### O que o agente errou (processo)

1. **Escopo creep:** tarefa Dashboard → tocou invalidação compartilhada do balcão  
2. **Misturou camadas** no mesmo deploy Web  
3. **Não mediu** `carregarInicio` frio/warm **antes** de pedir Nova versão do pacote I121  
4. Corrigiu P0 **depois** do sintoma, em vez de isolar admin

**Não é** “o sistema inteiro foi reescrito”. É acoplamento indevido + latência de sync.

---

## 2. Regra nova (fechada)

| Pedido do usuário | Pode tocar | Não pode tocar |
|-------------------|------------|----------------|
| Dashboard / Meta / Caixa UI / GP admin | `mk-admin.js`, `kpiMes`, `comandoOperacional`, painel GP, CSS admin | `carregarInicio_`, `listarAtivas_`, `mk-sync.js`, timer, `api()` |
| Cronômetro / fantasma / sync tablet | Zona P0 acima | Refator “já que estamos aqui” em kpiMes/folha |
| “Está lento o admin” | Cache/lite **só** admin | Pendurar trabalho em `invalidateInicioResumoCache_` |

**Um PR = uma zona.** Admin e P0 balcão = PRs separados.

---

## 3. Gate antes de Nova versão Web

```text
1) git diff .gs → listar funções alteradas
2) Se alguma ∈ {carregarInicio_, listarAtivas_, iniciarTimer_, salvarLocacao_,
   encerrarLocacao_, cancelarLocacao_, estenderLocacao_, invalidateInicioResumoCache_}:
     → rodar TESTE_I43 + TESTE_I122_SYNC_INICIO_READONLY
     → warm carregarInicio com _t deve ser < 8s
3) Caso contrário → na resposta: "Blast radius P0: nenhum"
```

Script de apoio (agente): `scripts/testes/TESTE_I122_SYNC_INICIO_READONLY.ps1`

---

## 4. Como o sócio exige isso no chat

Frase útil:

> *Só Dashboard — blast radius P0 zero. Não mexer em carregarInicio/mk-sync.*

Ou:

> *Só sync balcão — não mexer em kpiMes/admin.*

---

## 5. Referências

- `.cursor/rules/blast-radius-p0-movikids.mdc`
- `MAPA_ERROS` I122 · I121 · I120b
- `REGRAS_DE_PUBLICACAO_SEGURA.md` Regra tablet / I22
- §7.3 `ACESSOS_E_AUTORIZACOES.md` — editar `.gs` só com pedido
