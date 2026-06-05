# MOVI KIDS — Estado atual (04/06/2026)



Referencia unica para alinhamento local x producao.  

**Incidentes:** `INCIDENTE_AUTH_OPERADORES_2026-06-04.md`, `INCIDENTE_DEPLOY_E_EXTRAS_2026-06-04.md`  

**SMS gateway:** `TROCA_SMS_GATEWAY_DJVJRL_2026-06-04.md`  

**Roadmap mestre:** `PLANO_MESTRE_REORGANIZADO_2026-06.md`



## Producao (verificar apos cada deploy)



| Camada | Versao alvo | URL / ID |

|--------|-------------|----------|

| Apps Script | **v1.5.42** (colar + Nova versao Web) | Deploy `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y` |

| SMS Gateway Cloud | **DJVJRL** / device `wihWegHr4wXaVJQ1R-GZR` | Aparelho remoto ONLINE |

| Frontend | **v1.7.17** | https://ribocg-a11y.github.io/movikids/?force=1.7.17 |

| Pacote SMS P0 | **FECHADO** | `PACOTE_SMS_P0_UNIFICADO_v1.5.38_v1.7.11.md` |

| Planilha | MOVIKIDS_Planilha_Base | https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit |

| Portal responsavel | acompanhar.html | mesma base GitHub Pages |

| Cronometro curto | track.html | URL GAS alinhada (v1.7.6) |



**Editor Apps Script:** https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit



Teste rapido GAS:  

https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping



URL morta (nao usar): `AKfycbzc...` → 404



## Script Properties (SMS)



| Propriedade | Valor producao |

|-------------|----------------|

| `SMS_GATEWAY_USER` | `DJVJRL` |

| `SMS_GATEWAY_PASS` | `t4bh_q2x1favfo` |

| `SMS_GATEWAY_DEVICE_ID` | `wihWegHr4wXaVJQ1R-GZR` |



## Arquivos canonicos



- **GAS:** `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` (v1.5.42)

- **Clasp:** `gas/Code.gs` (gerado por `scripts/sync-gas-to-clasp.ps1` — nao editar a mao)

- **Login:** `mk-auth.js` + gate em `index.html`

- **Deploy:** `DEPLOY_GAS_v1.5.32_AUTH.md`, `scripts/deploy-gas.ps1` (bloqueia DEPLOY_ID antigo)

- **Emergencia:** `scripts/corrigir-locacao-206.html`, `scripts/corrigir-locacoes-extras-lote.html`



## Protecoes pos-incidente (v1.7.5+)



| Protecao | Onde |

|----------|------|

| ADM encerra sem SMS de extra | frontend v1.7.5+ |

| Sem extras fantasmas com GAS offline | frontend v1.7.6 + `somentePlano` no GAS |

| Nunca `clasp deploy` | `REGRAS_DE_PUBLICACAO_SEGURA.md` Regra 8 |

| Cache / URL GAS | `mk-version.js`, `gas-endpoint.json` |



## Auth operadores — ADM (GAS 1.5.35+)



| Acao | API |

|------|-----|

| Resetar PIN | `resetarPinOperadorAdmin` + `adminPin=1416` |

| Liberar balcao | `liberarSessaoOperadorAdmin` |

| Corrigir locacao encerrada | `corrigirFinanceiroLocacaoAdmin` + `zerarExtra` (v1.5.36+) |



## Roadmap UX



- [x] Pacote A — design system v1.7.0

- [x] Financeiro extras + historico — v1.7.1 + GAS v1.5.37

- [x] Pacote B — Hub admin — v1.7.2

- [x] Pacote Incidente — cache, ADM SMS, offline encerrar — v1.7.4–1.7.6 + GAS v79

- [x] Pacote C — Nova locacao 3 passos — **v1.7.7+**

- [x] Pacote SMS P0 + troca gateway DJVJRL — **v1.5.41 + v1.7.11**

- [ ] Pacote D — Drawer sessao — proximo



## Validacao rapida



1. Ping GAS → `ok:true`, `versao:v1.5.41`

2. SMS teste → Delivered no destino

3. Tablet → `?force=1.7.11`, rodape Online

4. Nova locacao → Enviar SMS e iniciar


