# Pacote C — Nova locação em 3 passos (v1.7.7)

## Mudanças

| Antes (4 passos) | Depois (3 passos) |
|------------------|-------------------|
| Veículo → Plano → Dados + review → Pagamento + review | **1 O quê** (veículo + plano) → **2 Quem** → **3 Fechar** |

- Barra de resumo fixa no topo (`#nova-summary-bar`)
- Busca de responsável cadastrado no passo 2 (inline)
- Dois CTAs no passo 3: **Confirmar cadastro** | **Confirmar e enviar SMS / iniciar**
- Rascunho (`NOVA_DRAFT_KEY`) migra steps antigos automaticamente

## Publicar

```powershell
git push origin main
```

Tablets: https://ribocg-a11y.github.io/movikids/?force=1.7.7
