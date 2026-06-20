# Deploy GAS v1.5.80 — FASE 9 Folha + viabilidade CLT

**FE pareado:** **v1.8.10** — ver `DEPLOY_FE_v1.8.10_FASE9_FOLHA_VIABILIDADE.md`  
**Depende de:** aba **FOLHA** na planilha (B68 custo total) · GAS **v1.5.79** + FE **v1.8.9** em produção (ou homolog)

---

## Regra de ouro

**Arquivo canônico no PC (header deve mostrar v1.5.80):**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

**Opção A — clasp (recomendado após alteração no repo):**

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\check-operacao-livre.ps1
.\scripts\deploy-gas.ps1
```

**Opção B — colar manualmente:**

1. Explorer → cole o caminho do `.gs` na barra → Enter → duplo clique  
2. Ctrl+A → Ctrl+C  
3. [Editor Apps Script](https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit) → **Código.gs** → Ctrl+A → Ctrl+V → Salvar  

**Publicar (obrigatório — senão produção continua v1.5.79 ou anterior):**

1. **Implantar → Gerenciar implantações**  
2. Editar implantação Web (**Deploy ID `AKfycbwakQ...`**)  
3. **Nova versão** → Implantar  
4. **Nunca** `clasp deploy` · **Nunca** criar deploy novo  

**Regra 16:** toda resposta do agente termina com `Mudança no AppScript: sim|não` + link canônico `.gs` abaixo.

| Link | URL |
|------|-----|
| **Editor GAS** | https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit |
| **Ping produção** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping |
| **FE teste** | https://ribocg-a11y.github.io/movikids/?force=1.8.10 |
| **Planilha** | https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit |

**Deploy ID único (não trocar):** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

---

## O que muda (v1.5.80)

| Entrega | Detalhe |
|---------|---------|
| `lerFolhaPlanejamento_` | Lê B5, B68, B7, B9, B11 da aba FOLHA |
| `buildViabilidadeContratacao_` | Semáforo verde/amarelo/vermelho + 6 gates objetivos |
| `kpiMes.viabilidadeContratacao` | Estudo sustentabilidade + projeção com folha |
| `kpiMes.folhaPlanejamento` | Parâmetros folha |
| Alertas | `CONTRATACAO_VIAVEL` · `CONTRATACAO_AGUARDAR` · `CONTRATACAO_NAO_VIAVEL` |
| Leading | `breakEvenComFolha`, `custoDiaComFolha` |
| Cache | Chave `kpiMes80_*` (invalida cache 79) |

**Gates (todos verdes = contratar):**

- Margem ≥10% **sem** folha no mês atual  
- Projeção mês cheio cobre folha (resultado ≥ 0)  
- Reserva projetada ≥ R$ 2.500 após folha  
- Margem projetada com folha ≥ 18%  
- ≥ 12 dias com locação no mês  
- Faturamento projetado ≥ piso sugerido  

**Não alterou:** balcão, Home operador, `resumoDia`, portal, PIN admin.

---

## Testes após Nova versão Web

Ping deve retornar `"versao": "v1.5.80"`.

```powershell
.\scripts\check-operacao-livre.ps1
.\scripts\testes\TESTE_KPI_MES_READONLY.ps1
.\scripts\pre-push-check.ps1
```

**Validação visual (PC admin, após FE v1.8.10 no Pages):**

1. Dashboard → painel **Sustentabilidade CLT** (`#mk-contratacao-panel`)  
2. Alerta strip → código `CONTRATACAO_*` conforme semáforo  
3. Narrativa cockpit menciona simulação CLT  
4. Alterar **FOLHA B68** → recarregar Dashboard → valores atualizam  
5. Operador na Home **não** vê painel de contratação  

**Ordem recomendada:** `check-operacao-livre` → GAS v1.5.80 (**deploy-gas.ps1** + **Nova versão Web**) → ping ok → push FE v1.8.10 → `?force=1.8.10`

---

## Referências

- Memorial folha: `../referencia/FOLHA_PAGAMENTO_MEMORIAL_E_PLANILHA.md`  
- Base alertas: `DEPLOY_v1.5.79_FASE8_ALERTAS.md`
