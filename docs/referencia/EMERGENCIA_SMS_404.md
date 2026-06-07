# Emergência — SMS "Failed to fetch" (04/06/2026)

**Resolvido 04/06:** nova implantação Web v78 — URL `AKfycbwakQ-...` (app v1.7.3).

## Causa

O app chama o GAS em `WEBAPP_URL`. Se essa URL devolve **404**, **todos** os SMS falham com `Failed to fetch` (não é o gateway SMS).

O comando `clasp deploy` **não** republica corretamente o tipo **App da web**. Use **Nova versão** no painel do Google.

## Reparo (5 min) — faça agora

1. Abra a planilha → **Extensões → Apps Script**
2. **Implantar → Gerenciar implantações**
3. Na linha da **Web app** (URL com `AKfycbzc...`), clique **Editar** (lápis)
4. **Versão:** Nova versão → **Implantar**
5. No Chrome, abra:
   https://script.google.com/macros/s/AKfycbzcAfu7c3ESVE4sQT_CA5XL3W1bqDZESZX3nTSAWH0Wzqedm2JTVPJwSfYwEOrxkgnw/exec?action=ping

Deve aparecer: `"ok":true,"versao":"v1.5.37"`

6. No tablet: recarregar o app (`?force=1.7.2`) e testar SMS de novo.

## Daqui pra frente

```powershell
cd "...\movikids-github"
.\scripts\deploy-gas.ps1
```

Depois sempre o passo 2–4 acima (Nova versão na mesma implantação).

**Não** criar implantação nova (muda a URL e quebra o app no GitHub).
