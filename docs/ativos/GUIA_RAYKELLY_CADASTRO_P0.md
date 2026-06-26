# P0-5 — Raykelly completar cadastro RH (100%)

**Colaboradora:** Raykelly · `operador_id` **3** · PIN balcão próprio  
**URL:** https://ribocg-a11y.github.io/movikids/gestao-pessoas.html?force=1.8.121  
**Último backup conhecido:** `backups/rh/cadastro-rh-2026-06-23_1657.json` — **25%** (`cadastroOk=false`)

---

## Campos obrigatórios (8)

GAS `gpCadastroReqKeys_()` — todos preenchidos = 100%:

| Campo | Raykelly (backup 23/06) | Preencher |
|-------|-------------------------|-----------|
| nomeCompleto | ✅ Raykelly | — |
| cpf | ❌ vazio | CPF |
| nascimento | ❌ vazio | dd/mm/aaaa |
| telefone | ❌ vazio | celular |
| endereco | ❌ vazio | endereço completo |
| emergencia | ❌ vazio | contato emergência |
| admissao | ✅ 15/06/2026 | — |
| pix | ❌ vazio | chave PIX |

**Faltam 6 campos** → 25% atual.

---

## Passo a passo (Raykelly no celular ou PC)

1. Abrir URL acima (Safari/Chrome)
2. Login com **PIN dela** (não PIN admin)
3. Se bloquear com “complete seu cadastro” — seguir formulário
4. Preencher todos os campos com **\***
5. Salvar → deve ir para hub colaborador (`cadastroOk=true`)
6. Testar login no **tablet balcão** — não deve retornar erro 428

---

## Validação (dev/sócio)

```powershell
.\scripts\testes\TESTE_CADASTRO_RH_READONLY.ps1 -OperadorId 3 -OperadorPin <PIN_RAYKELLY>
```

Esperado: `cadastroOk=True` · `pct=100` · `loginOperador.bloqueio` = login OK ou sem 428.

---

## Por que importa

- Gate **HTTP 428** no balcão enquanto cadastro incompleto
- Holerite / VA proporcional usam dados de admissão e cadastro
- Fecha último **P0** antes de assinar FASE 17 e iniciar RH-G1
