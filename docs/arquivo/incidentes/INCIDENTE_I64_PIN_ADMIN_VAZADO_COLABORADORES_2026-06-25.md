# Incidente I64 — PIN admin vazado + faixa preview na área colaboradores

**Data:** 25/06/2026 · **Severidade:** P0 segurança / UX  
**FE:** v1.8.120 · **GAS:** v1.5.162 (repo)

## Sintoma

- Faixa azul **"Pré-visualização ADM — somente leitura"** visível na tela Colaboradores (ex.: hub "Colaborador Demo").
- PIN administrativo **1416** exposto na interface (texto na tela de preview, hub Administração, validação no browser).

## Causa raiz

| Vetor | Onde |
|-------|------|
| PIN em texto na UI | `gestao-pessoas.html` ("Digite seu PIN admin **1416**"), `index.html` ("PIN ADM 1416") |
| Validação client-side | `mk-gestao-pessoas-ui.js` `pin !== '1416'` |
| Modo preview ADM | `gpAdmPreviewMode_` + banner; fluxo Demo admin na mesma página dos colaboradores |
| Erros GAS | 44× `'Acesso negado — PIN admin 1416'` nas respostas API |

Relacionado a **I38** (banner fantasma) — regressão de UX; I64 fecha vazamento de segredo.

## Correção

| Mudança | Arquivo |
|---------|---------|
| Faixa **oculta em produção** (`MK_GP_PROD`) | `mk-gestao-pessoas-ui.js`, `mk-gestao-pessoas.css` |
| Login colaborador **limpa** sessão preview | `gpAfterColabLogin_` |
| Preview PIN via **`loginAdmin` GAS** (sem hardcode) | `admPreviewValidarPin_` |
| Remover **1416** da UI produção | `index.html`, `gestao-pessoas.html` |
| Erros GAS genéricos | `.gs` v1.5.162 |

## Rotação PIN

Ver `docs/ativos/ROTACAO_PIN_ADMIN.md` — Script Property `ADMIN_PIN` no GAS (imediato, sem Nova versão Web).

## Teste

1. Colaborador: hub → Colaboradores → PIN próprio → **sem** faixa azul.
2. Admin preview: `Pré-visualizar colaborador` → funciona sem PIN na tela.
3. `index.html`: porta Administração **sem** "1416".
