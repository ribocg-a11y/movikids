# Incidente I27 — GAS exige login Google; app GitHub Pages Failed to fetch (14/06/2026)

## Sintoma

- App `ribocg-a11y.github.io/movikids` → **Failed to fetch** em `listarOperadoresAdmin`, `carregarInicio`, etc.
- Ping na **barra do browser** (logado no Google) → JSON `v1.5.92` ✅
- `fetch()` do app/tablet → **TypeError: Failed to fetch** ❌

## Causa raiz

A Web App GAS está com **"Quem tem acesso" ≠ Qualquer pessoa (Anyone)**.

Requisição **anônima** (como o `fetch` do GitHub Pages) recebe redirect para `accounts.google.com/ServiceLogin` em vez de JSON. O browser não consegue autenticar no cross-origin → **Failed to fetch**.

**Não confundir com I26** (editor @92 / exec @91). Aqui a versão pode estar certa mas o **acesso público** está errado.

## Implantações em 14/06/2026

| Deploy ID | @versão | Descrição | Acesso anônimo (teste curl) |
|-----------|---------|-----------|-------------------------------|
| `AKfycbwakQ...` | @138 | v1.5.92 | ❌ ServiceLogin |
| `AKfycbwkvWg...` | @139 | Movi Kids.v133 | ❌ ServiceLogin |

O usuário criou **implantação nova @139** ao publicar no editor. **Não usar** — incidente **I1** (URL nova quebra tablet/FE que apontam para `AKfycbwakQ...`).

## Correção (obrigatória no editor — não criar implantação nova)

1. [Editor Apps Script](https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit)
2. **Implantar → Gerenciar implantações**
3. **Editar** (ícone lápis) na implantação **`AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`** — **não** "Nova implantação"
4. Configuração:
   - **Executar como:** Eu (`USER_DEPLOYING`)
   - **Quem tem acesso:** **Qualquer pessoa** / **Anyone** (anônimo, sem conta Google)
5. **Implantar** (Nova versão no **mesmo** ID)
6. Opcional: arquivar ou ignorar @139 `AKfycbwkvWg...` — não trocar URL no código

## Teste pós-correção

**Aba anônima** (sem login Google):

```
https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping
```

Deve mostrar JSON `{"ok":true,"versao":"v1.5.92",...}` **sem** tela de login.

Gate local:

```powershell
.\scripts\verify-gas-deploy.ps1
# check live.anonymous deve ser ok
```

App: Ctrl+F5 em `?force=1.8.22`.

## Limitação clasp

`clasp deploy -i` **não** aplica `WebAppConfig` (access ANYONE) — ver [clasp#1115](https://github.com/google/clasp/issues/1115). O `gas/appsscript.json` tem `"access":"ANYONE"` mas a implantação Web no Google pode ficar com acesso restrito até **Editar** no editor.

## Trava

`verify-gas-deploy.ps1` → check `live.anonymous` (curl HEAD: ServiceLogin = fail).
