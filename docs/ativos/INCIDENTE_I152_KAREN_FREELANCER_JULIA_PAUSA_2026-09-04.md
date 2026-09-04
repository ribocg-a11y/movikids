# I152 — Karen Freelancer + Julia pausa (01/09/2026)

**Status:** Julia balcão **bloqueada** ✅ (live) · GAS repo **v1.5.216** ⏳ Nova versão Web · FE **v1.9.111**  
**Data:** 04/09/2026

---

## Pedido

1. **Karen** (nova operadora) — fluxo cadastro/PIN/ambiente; freelance sex–dom diária; **só sistema + dados dela**; sem folha CLT ainda.
2. **Julia** — saída **01/09**; bloquear acesso; deixar parado (histórico ok).

---

## Auditoria (04/09 — antes/depois)

| Item | Karen (id **5**) | Julia (id **4**) |
|------|------------------|------------------|
| OPERADORES_SISTEMA | ✅ ativa · **sem PIN** | ✅ **ativo=NAO** · PIN limpo (excluirOperadorSistema) |
| Login balcão | Aparece · 1º acesso cria PIN | **Não aparece** na lista |
| COLABORADORES_RH | ✅ linha (admissão 04/09) · **2 linhas duplicadas** | Histórico 100% · ainda listava no painel RH |
| BANCO_HORAS | ✅ linha 0h00 | ✅ |
| Folha/escala CLT | Não ativar ainda | Histórico ponto até 01/09 preservado |
| Hub Colaboradores | Só após ter PIN | Sem PIN → fora de `listarColaboradoresGestao` |

**Buraco do desenho antigo:** após criar PIN, `loginOperador` exigia cadastro RH **100%** (428) — incompatível com freelance parcial.

**Buraco Julia:** `gpSyncJuliaPadrao_` **reativava** RH `ativo=SIM` ao abrir painel admin.

---

## Correção GAS v1.5.216

| Mudança | Efeito |
|---------|--------|
| `gpIsModoOperacaoSoRh_` + login sem 428 se função Freelancer/Diarista | Karen no balcão com cadastro parcial |
| `gpSyncJuliaPadrao_` respeita ops inativa → RH `NAO` | Não “ressuscita” Julia |
| `excluirOperadorSistema` também marca RH `NAO` | Pausa completa |
| `configurarModoOperadorRhAdmin` | `freelancer` / `clt` / `inativo` |
| `deduplicarColaboradoresRhAdmin` | Remove 2ª linha Karen |

---

## Já feito (sem Nova versão Web)

```text
excluirOperadorSistema Julia id=4 adminPin=1421 → ok
listarOperadoresLogin: Eduarda, Karen, Milena, Raykelly (sem Julia)
```

Milena permanece logada no tablet (não derrubamos o turno).

---

## Após Nova versão Web v1.5.216 (sócio — PC)

Raw: https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

```powershell
# 1) Karen freelancer + dedupe
$GAS = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec"
Invoke-RestMethod "${GAS}?action=configurarModoOperadorRhAdmin&adminPin=1421&operadorId=5&modo=freelancer"
# 2) Julia RH inativo (reforço)
Invoke-RestMethod "${GAS}?action=configurarModoOperadorRhAdmin&adminPin=1421&operadorId=4&modo=inativo"
# 3) ping
Invoke-RestMethod "${GAS}?action=ping"
```

---

## Fluxo Karen (desenhado — tablet)

1. Tablet `?force=1.9.111` → escolher **Karen**
2. **Primeiro acesso:** criar PIN 4 dígitos (+ confirmar)
3. Com GAS **v1.5.216** + modo freelancer: entra no **balcão** mesmo com cadastro RH parcial
4. **Colaboradores:** após PIN, vê só o hub dela — pode completar dados quando quiser
5. Folha/holerite/escala CLT: **não ativar** até ordem explícita (`modo=clt`)

---

## Julia

- Sem login balcão ✅
- Sem PIN ✅
- Após Web 216: RH `ativo=NAO` + sync não reativa
- Histórico ponto/folha **preservado**

---

## Teste pós-colar (04/09 ~12:27 BRT)

| Check | Resultado |
|-------|-----------|
| ping | **v1.5.216** ✅ |
| Karen `modo=freelancer` | ✅ funcao **Freelancer** · turno **sex–dom (diária)** · 1 duplicata RH removida · cadastroPct **25** · Sem PIN |
| Julia `modo=inativo` | ✅ fora do login · RH inativo |
| Login lista | Eduarda · Karen · Milena · Raykelly (sem Julia) ✅ |

**Bug encontrado no teste:** `Number(0) \|\| 1621` — salário/VA/meta/bônus **0** voltavam ao default CLT. Corrigido em **v1.5.217** (`gpNumField_`). Recolar raw + reaplicar `modo=freelancer`.
