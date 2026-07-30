# I129 — Ponto colaborador some na área dela + banco absurdo (Raykelly)

**Registrado:** 29/07/2026  
**Status:** FE **v1.9.75** publicado (Pages) · GAS repo **v1.5.207** ⏳ Nova versão Web · dados FOLHA/BANCO reparados via API  
**Mapa:** `MAPA_ERROS_FALHAS_BUGS.md` I129 · relacionados I44 · I51 · I69

## Sintoma

Raykelly (id **3**) batia ponto e **não via** o registro na área do colaborador (`gestao-pessoas.html`). Admin Ficha mostrava dias **Aberto** sem saída e banco ~**−1133h**.

## Causas

1. **FE** — `fmtDataHoje()` devolvia `DD/MM` e a folha/jornada vem `DD/MM/YYYY` → hub/folha não marcavam o dia e caíam em “Sem registro”.
2. **FE/GAS** — após `registrarPonto`, reload podia servir **cache 90s** do painel sem a batida.
3. **GAS** — `gpPersistBancoFromJornada_` gravava `bancoProjetado` (= abertura + saldo mês) a cada saída → **dobra** o saldo no mês (Raykelly −1117h · Julia −6217h).
4. **Dados** — batidas lixo / abertas: 15/07 0h00, 22–24/07 Aberto noturno, 25/07 0h06; 05/07 e 17/07 abertos sem saída.

## Correção

| Camada | Mudança |
|--------|---------|
| FE **v1.9.75** | `fmtDataHoje` + `gpSameDay_`; hub lê `pontoHoje`/`jornada`/`folha`; pós-ponto **otimista** + `loginPainel({ force: true })` |
| GAS **v1.5.207** | `force=1` bypass cache; não persistir projetado na saída; `salvarBancoHorasRhAdmin` |
| Planilha | Fechou 05/07 e 17/07; removeu lixo 15/22/24/25; `repairBancoHorasAdmin` → ops **0h00** |

## Ops

1. Colaboradora: abrir `gestao-pessoas.html?force=1.9.75` (não usar `force=1.9.72`).
2. Sócio: colar `.gs` raw + **Nova versão** no Deploy `AKfycbwakQ...` (I129 anti-dobra banco).
3. Hoje (29/07) permanece **Aberto** com entrada **14:04** até ela bater saída.

## Evidência pós-repair (API preview)

- status `dentro` · entrada `14:04`
- banco abertura `0h00` · projetado `+1h29` · trabalhado `169h30`
