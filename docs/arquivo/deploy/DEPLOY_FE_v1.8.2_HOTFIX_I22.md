# Deploy FE v1.8.2 — Hotfix I22 (Home fora do ar)

**Tipo:** só frontend — **não** exige Nova versão Web GAS.  
**Commit:** `f2574da` — `fix: remover div extra no Dashboard que quebrava Home (FE v1.8.2)`  
**Incidente:** `../arquivo/incidentes/INCIDENTE_I22_HOME_FORA_DO_AR_FASE6_HTML_2026-06-09.md`

---

## Regra de ouro (frontend)

Subir **juntos** após qualquer mudança FE:

| Artefato | Valor |
|----------|-------|
| `mk-version.js` | `MK_VERSION = '1.8.2'` |
| `sw.js` | `SW_VERSION = '1.8.2'` |
| `index.html` | cache-bust `?v=1.8.2` em todos os scripts |

**URL produção:**

https://ribocg-a11y.github.io/movikids/?force=1.8.2

**Antes do push (hotfix P0 — I22):**

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\pre-push-check.ps1
# Hotfix P0: check-operacao-livre.ps1 -Force somente com aprovacao explicita
git push origin main
```

---

## O que muda

| Arquivo | Correção |
|---------|----------|
| `index.html` | Remove `</div>` extra após `#mk-exec-cockpit` que fechava `#page-dashboard` cedo |
| `mk-version.js` / `sw.js` | Bump **1.8.2** |

**GAS:** sem alteração — ping continua na versão já publicada (alvo v1.5.76 após deploy FASE 6–7).

---

## Validação

**Tablet (obrigatório):**

1. Abrir `?force=1.8.2` ou limpar cache / reinstalar PWA  
2. Home carrega — cards de locação, sync, Nova locação  
3. Balcão operacional (F0–F1)  

**PC admin:**

1. Dashboard admin continua ok (cockpit FASE 6)  

**CI:**

- `guard.html.page-balance` no pre-push → page-home/nova/dashboard balanceados  

---

## Critério de pronto

- [ ] Push `main` com v1.8.2  
- [ ] Tablet Home operacional confirmado pelo responsável  
- [ ] Incidente I22 documentado (Regra 14 ativa)  

---

## Referências

- Deploy GAS FASE 6–7: `DEPLOY_v1.5.76_FASE7_LEADING.md`  
- Regra 14: `REGRAS_DE_PUBLICACAO_SEGURA.md`  
- Handoff: `HANDOFF_NOVO_CHAT.md`
