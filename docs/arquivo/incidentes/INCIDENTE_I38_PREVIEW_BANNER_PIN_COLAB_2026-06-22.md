# Incidente I38 — Faixa “Pré-visualização ADM” com login PIN da colaboradora

**Data:** 22/06/2026  
**Severidade:** P1 UX (operação confusa; ponto/cadastro podiam parecer “somente leitura”)  
**Camadas:** FE `mk-gestao-pessoas-ui.js` · `mk-gestao-pessoas.js`  
**Versão correção:** FE **v1.8.110** (repo; publicação Pages pendente se não push)

---

## Sintoma

Colaboradora (Raykelly) entra pelo fluxo normal — hub balcão → Colaboradores → nome + **PIN próprio** — e vê faixa azul:

> Pré-visualização ADM — somente leitura

Botões **Trocar** / **Voltar admin** visíveis. Operadora acredita estar em modo errado; cadastro/ponto podem parecer bloqueados (mensagens de preview no ponto).

**Evidência:** screenshot tablet 22/06 — hub Raykelly com banner ADM após login com PIN dela (não fluxo “Pré-visualizar colaborador” do admin).

---

## Diagnóstico errado (não repetir)

Atribuir automaticamente a URL `gestao-pessoas.html?admPreview=1` ou sessão admin **sem** confirmar no código. A colaboradora pode estar no fluxo correto e mesmo assim ver o banner.

---

## Causa raiz

1. **`renderColabHub`** exibia banner quando `gpAdmPreviewMode_ || p.preview` (linha ~839).
2. **`admPreviewEntrar`** gravava `PESSOAS[uid].preview = true` via `Object.assign`.
3. **`colabEntrar`** (login real com PIN) fazia `Object.assign({}, PESSOAS[uid] || {}, mapped, { pin })` **sem** `preview: false`.
4. `gpMapPainel` / GAS `buscarPainelColaborador` **não** enviam `preview` — mas propriedade antiga **permanece** no merge.
5. `gpClearAdmPreviewSession_` limpava `gpAdmPreviewMode_` e sessionStorage, mas **não** apagava `preview` nos objetos `PESSOAS`.

Cenário típico: mesma aba/PWA — alguém abriu preview admin antes; depois colaboradora logou com PIN; `gpAdmPreviewMode_` false, `p.preview` true → banner fantasma.

---

## Correção (v1.8.110)

| Mudança | Arquivo |
|---------|---------|
| Banner **só** se `gpAdmPreviewMode_ === true` | `mk-gestao-pessoas-ui.js` `renderColabHub` |
| Login PIN → `preview: false` explícito | `colabEntrar`, refresh pós-ponto |
| `gpClearPessoasPreviewFlags_()` em `gpClearAdmPreviewSession_` | `mk-gestao-pessoas-ui.js` |
| `loginPainel` retorna `preview: false` | `mk-gestao-pessoas.js` |

---

## Residual (backlog)

| ID | Item | Prioridade |
|----|------|------------|
| I38-R1 | `salvarCadastro` ainda muta `PESSOAS` em memória em preview antes do guard API | P2 |
| I38-R2 | `sessionStorage mk_gp_adm_preview_v1` sem `from=` reabre gate preview | P2 |
| I38-R3 | CTA “Registrar ponto” visível em preview (flash só) | P3 |

---

## Teste

1. Admin → Operadores → Pré-visualizar Raykelly → hub com banner.
2. Voltar admin ou abrir Colaboradores pelo hub (`from=index`).
3. Raykelly + PIN → **sem** faixa azul.
4. Registrar ponto → grava em `FOLHA_PONTO`.

Script: incluir caso em `TESTE_GESTAO_PESSOAS_READONLY.ps1` (futuro).

---

## Aprendizado

**Nunca** usar flag de objeto (`p.preview`) como fonte de verdade de modo de sessão — só variável de sessão (`gpAdmPreviewMode_`) + URL explícita `admPreview=1`.
