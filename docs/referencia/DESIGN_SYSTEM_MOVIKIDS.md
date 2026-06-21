# MOVI KIDS — Design System (cartilha oficial)

**Versão doc:** 1.1 · **21/06/2026**  
**Status:** fonte de verdade visual — **consultar antes de criar ou alterar qualquer UI**  
**Auditoria:** sistema completo FE v1.8.86 · portal v1.7.62+ · FASE 9 admin v1.8.28+ · FASE 16 One UI widgets

**Documentos irmãos:**
- [`DESIGN_DNA_MOVIKIDS.md`](DESIGN_DNA_MOVIKIDS.md) — princípios de produto e missão visual (resumo filosófico)
- [`CHECKLIST_FASE9_DNA_ADMIN.md`](../ativos/CHECKLIST_FASE9_DNA_ADMIN.md) — QA admin glass
- **Implementação:** `mk-design.css` + `mk-app.css` (+ `mk-gestao-pessoas.css` só módulos RH)

**Regra Cursor:** `.cursor/rules/design-system-movikids.mdc` (obrigatória para agentes)

---

## 0. Fluxo obrigatório (antes de criar ou alterar UI)

Nenhuma tela, componente, CSS paralelo ou mockup vira produção **sem passar por este fluxo:**

```
1. LER este doc → seção da superfície (§8) + componentes (§6) + tokens (§3)
2. IDENTIFICAR universo CSS (§2): Operação | Portal | Admin | RH | Exceção
3. REUTILIZAR classes existentes — proibido inventar CSS paralelo por tela
4. CHECKLIST §9 — marcar todos os itens aplicáveis
5. HOMOLOGAR no dispositivo certo (§10): celular portal · tablet balcão · PC admin
6. ATUALIZAR este doc se nascer componente novo reutilizável (PR/commit separado)
```

**Proibido:** `mock-pick` custom, gradiente novo, fonte fora de Fredoka/Nunito, botão cinza genérico, campo PIN único largo, dois passos de login na mesma dobra.

---

## 1. Missão visual (resumo)

| Sensação | Materializar |
|----------|----------------|
| Confiança | Layout limpo, tipografia forte, dados legíveis |
| Carinho | Marca Movi Kids, cores quentes, linguagem humana |
| Clareza | **Um hero por dobra** — regra dos 3 níveis (§5) |
| Orgulho | App premium, não planilha interna |

> Detalhe filosófico: [`DESIGN_DNA_MOVIKIDS.md`](DESIGN_DNA_MOVIKIDS.md) §1–§8.

---

## 2. Universos CSS (mapa técnico)

O sistema **não é um único `:root`**. Há contextos com paletas distintas:

| Universo | Onde | CSS principal | `--blue` efetivo |
|----------|------|---------------|------------------|
| **Operação** | `index.html` balcão + auth | `mk-app.css` `:root` | `#1565C0` |
| **Portal** | `acompanhar.html`, QR poster | `mk-design.css` `.mk-portal-page` | `#29B6F6` |
| **Admin FASE 9** | páginas `mk-admin-page` | `mk-design.css` tokens `--mk-admin-*` | `#29B6F6` (accent) + `#1565C0` (corporate) |
| **Colaboradores** | `gestao-pessoas.html` | auth = `mk-app.css` `#gp-auth-gate`; painel = `mk-gestao-pessoas.css` | `#1565C0` (auth) |
| **Exceção financeiro** | `financeiro/index.html` | `financeiro/style.css` | paleta própria — **não estender ao MOVI KIDS** |
| **Legado SMS** | `track.html` | inline | portal ring `#29B6F6` — migrar ou deprecar |

**Ordem de cascade (padrão MOVI KIDS):**
```html
<link rel="stylesheet" href="mk-design.css">
<link rel="stylesheet" href="mk-app.css">
<!-- só se módulo específico: mk-gestao-pessoas.css -->
```

**Fonts (Google Fonts — todas as superfícies MOVI KIDS):**
```html
<link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@600;700;800;900&display=swap" rel="stylesheet">
```
Portal inclui também Nunito 400.

---

## 3. Tokens

### 3.1 Cores — Operação (`mk-app.css` `:root`)

| Token | Hex | Uso |
|-------|-----|-----|
| `--blue` | `#1565C0` | Botões primários, links, PIN focus, theme-color |
| `--blue-dk` | `#0D47A1` | Sombras logo, links escuros |
| `--blue-lt` | `#E3F2FD` | Fundos suaves, hover menu |
| `--pink` | `#C2185B` | Pelúcia, acentos QR balcão |
| `--pink-lt` | `#FCE4EC` | Fundo ícone QR |
| `--green` / `--green-lt` | `#2E7D32` / `#E8F5E9` | OK operacional |
| `--amber` / `--amber-lt` | `#E65100` / `#FFF3E0` | Avisos |
| `--red` / `--red-lt` | `#B71C1C` / `#FFEBEE` | Erro, perigo |
| `--purple` | `#6A1B9A` | Acento raro |
| `--bg` | `#F0F6FF` | Fundo app operação/auth |
| `--card` | `#FFFFFF` | Cards |
| `--border` | `#E0E8F4` | Bordas |
| `--txt` | `#1A2340` | Texto principal |
| `--txt2` | `#5A6680` | Subtítulos, hints |
| `--txt3` | `#9AAAC0` | Labels, micro |

### 3.2 Cores — Portal (`.mk-portal-page`)

| Token | Hex | Uso |
|-------|-----|-----|
| `--blue` | `#29B6F6` | Timer ok, aba ativa, ring |
| `--blue-dk` | `#1565C0` | Links |
| `--gold` | `#FFD54F` | Marca “Kids”, CTA portal |
| `--pink` | `#F06292` | Acentos |
| `--orange` | `#FF8A65` | Tempo extra |

**Fundo portal:** gradiente vertical `#1a237e` → `#1565c0` + `.mk-portal-deco` + `.mk-portal-glow`.

### 3.3 Cores — Admin FASE 9

```css
--mk-admin-blue: #29B6F6;
--mk-admin-blue-dk: #1565C0;
--mk-admin-gold: #FFD54F;
--mk-admin-pink: #F06292;
--mk-admin-orange: #FF8A65;
--mk-admin-glass: rgba(255, 255, 255, 0.72);
--mk-admin-glass-border: rgba(21, 101, 192, 0.12);
--mk-admin-radius: 16px;
```

### 3.4 Espaçamento, raio, sombra

| Token | Valor | Onde |
|-------|-------|------|
| `--mk-space` | `16px` | Padding padrão tiles |
| `--mk-radius` | `12px` | Tiles, hub doors base |
| `--radius` | `16px` | Session cards, cards app |
| `--radius-sm` | `10px` | Botões legado `.btn` |
| `--mk-shadow-1` | `0 2px 8px rgba(13,71,161,.08)` | Tiles mk-design |
| `--shadow-sm` | `0 2px 8px rgba(21,101,192,.08)` | stat-card, QR |
| `--shadow` | `0 4px 20px rgba(21,101,192,.12)` | Modais, sidebar mobile |

### 3.5 Semântica do cronômetro (balcão + portal)

| Estado | Cor | Label | Animação |
|--------|-----|-------|----------|
| Pendente | branco suave | Já já começa | anel cheio |
| Ativa ok | azul | Falta | decrescendo |
| Quase lá (≤5 min) | amarelo | Quase lá! | `mk-portal-tick` |
| Extra | laranja | Tempo extra | `mk-portal-pulse` |

**Regra técnica:** paridade `canonLoc_` / `timestampCanonico_` — nunca quebrar por estética (I16).

### 3.6 Widgets One UI — FASE 16 (`mk-design.css` `:root` admin)

Tokens para KPIs com contexto (centro de comando, cockpit, RH admin). **Números = Nunito**, não Fredoka.

| Token | Valor | Uso |
|-------|-------|-----|
| `--mk-widget-gap` | `12px` | Grid entre widgets |
| `--mk-widget-radius` | `16px` | Card widget |
| `--mk-widget-pad` | `14px 16px` | Padding interno |
| `--mk-widget-val-size` | `18px` | Valor KPI (Nunito 800) |
| `--mk-widget-lbl-size` | `10px` | Label (sentence case) |
| `--mk-widget-ctx-size` | `11px` | Linha interpretativa |
| `--mk-space-8` | `8px` | Gap compacto |
| `--mk-space-12` | `12px` | Gap padrão widget |
| `--mk-space-16` | `16px` | Padding seção |
| `--mk-space-24` | `24px` | Respiro entre blocos |
| `--mk-trend-up` | `#2E7D32` | Contexto positivo (`.trend-up`) |
| `--mk-trend-down` | `#C62828` | Contexto negativo (`.trend-down`) |
| `--mk-trend-neutral` | `#888` | Neutro |

**Classes:** `.mk-widget`, `.mk-widget-val`, `.mk-widget-ctx`, `.mk-command-center` (Dashboard) · `.mk-admin-mob-cmd` (sidebar mobile admin read-only).

---

## 4. Tipografia

### 4.1 Famílias e papéis

| Papel | Fonte | Onde |
|-------|-------|------|
| Logo, timer hero, KPI grande, payback | **Fredoka One** | `.mk-logo-main`, `.mock-clock`, `.mk-portal-ring-time`, `.stat-val` hero |
| Todo o resto | **Nunito** 600–900 | Botões, labels, dados, hints |

### 4.2 Escala tipográfica oficial (px)

#### Auth / Hub (`#mk-auth-gate`, `#gp-auth-gate`, `#mk-tablet-hub`)

| Elemento | Tamanho | Peso | Classe |
|----------|---------|------|--------|
| Logo principal | **38px** | Fredoka | `.mk-logo-main` |
| Subtítulo logo | **13px** | 800 | `.mk-logo-sub` |
| Título etapa | **20px** | 900 | `h2` |
| Hint | **13px** | 700 | `.mk-hint` |
| Step tag | **11px** | 900 | `.mk-step-tag` |
| Select operador | **16px** / h52 | 800 | `.mk-op-select` |
| PIN box | **26px** / 52×58 | 900 | `.mk-pin-box` |
| Botão primário/sec | **16px** / h52 | 900 | `.mk-btn` |
| Erro | **13px** | 800 | `.mk-err` |
| Voltar | **13px** | 900 | `.mk-hub-back` |
| Hub door ícone | **40px** | — | `.mk-hub-door-icon` |
| Hub door título | **14px** | 800 | `.mk-hub-door-title` |
| Hub door sub | **10px** | 700 | `.mk-hub-door-sub` |

#### Portal (`acompanhar.html`)

| Elemento | Tamanho | Classe |
|----------|---------|--------|
| Brand gate | **44px** Fredoka | `.mk-portal-brand-lg` |
| Ring time | **clamp(48–64px)** Fredoka | `.mk-portal-ring-time` |
| Nome criança | **clamp(28–36px)** Fredoka | `.mk-portal-child-name` |
| Input telefone | **20px** | `.mk-portal-input` |
| CTA portal | **17px** / 900 | `.mk-portal-btn` |
| Abas | **14px** | `.mk-portal-tab` |
| Alerta faixa | **13px** | `.mk-portal-alert` |
| Contador N de M | **12px** | `.mk-portal-counter` |

#### Balcão / Admin

| Elemento | Tamanho | Classe / contexto |
|----------|---------|-------------------|
| Sidebar logo | **19px** Fredoka | `.sb-logo` |
| Session criança | **18px** | `.sc-crianca` |
| Timer card | **26px** | `.sc-timer-big` |
| Stat valor | **18px** | `.stat-val` |
| Stat label | **10px** | `.stat-lbl` |
| Botão legado balcão | **13px** | `.btn` |
| Admin micro label | **9px** uppercase | vários |

#### Colaboradores (`#gp-app`)

| Elemento | Tamanho | Classe |
|----------|---------|--------|
| Relógio ponto | **44px** Fredoka | `.mock-clock` |
| Título tela | **22px** Fredoka | `.mock-h1` |
| Nome usuário | **17px** | `.gp-user-name` |

---

## 5. Hierarquia de layout (regra dos 3 níveis)

```
Nível 1 — HERO     → timer, R$ do dia, PIN, CTA principal
Nível 2 — CONTEXTO → quem, quantos, abas, pills, step tag
Nível 3 — DETALHE  → plano, histórico, accordion, tabela secundária
```

**Nunca** três blocos do mesmo peso visual na primeira dobra.

---

## 6. Componentes canônicos

### 6.1 Auth gate (padrão absoluto — imagem de referência admin/balcão)

**HTML de referência:** `index.html` → `#mk-auth-gate`  
**Réplica colaboradores:** `gestao-pessoas.html` → `#gp-auth-gate` (mesmas classes)

| Peça | Classes |
|------|---------|
| Container fullscreen | `#mk-auth-gate` / `#gp-auth-gate` |
| Coluna | `.mk-auth-inner` (max 420px) |
| Logo | `.mk-logo` > `.mk-logo-main` + `.mk-logo-sub` |
| Etapa | `.mk-auth-step` + `.hidden` para alternar |
| Tag | `.mk-step-tag` |
| Hint | `.mk-hint` |
| Dropdown | `.mk-op-select-wrap` + `.mk-op-select` + `.form-label` |
| PIN 4 caixas | `.mk-pin-row` + `.mk-pin-box` (type password, inputMode numeric) |
| Botões | `.mk-btn` primário · `.mk-btn.sec` secundário |
| Erro | `.mk-err` |
| Voltar hub | `.mk-hub-back` |

**Etapas operador:** `#mk-step-select` → `#mk-step-login-pin` (ou `#mk-step-create-pin`)  
**Etapa admin:** `#mk-step-admin` (tag “Administrador”)  
**Colaboradores:** `#s-colab-login` → `#s-colab-pin` (tag “Colaborador”)

### 6.2 Hub tablet (3 portas)

**Referência:** `index.html` `#mk-tablet-hub`  
**Classes:** `.mk-hub-doors` > `.mk-hub-door` + modificadores `--dia` `--mes` `--sys`  
**Responsivo:** 1 col mobile → 3 col ≥640px

### 6.3 Portal responsável

**Referência:** `acompanhar.html`  
**Prefixo:** `mk-portal-*` (~40 classes em `mk-design.css` § Portal)  
**Fluxo:** gate (telefone) → stage carrossel (tabs, alert, ring, info-bar, others, back)

### 6.4 Session card (Home balcão)

**Classes:** `.session-card` + `.carro` / `.pelucia`  
**Hero:** anel timer + `.sc-crianca`  
**Estados:** `.warning`, `.danger` (+ shake)

### 6.5 Botões

| Classe | Uso | Spec |
|--------|-----|------|
| `.mk-btn` | Auth, colaboradores, ações principais | h52, radius 12, blue bg, Nunito 900 |
| `.mk-btn.sec` | Voltar, trocar pessoa | white bg, 2px blue border |
| `.btn` / `.btn-primary` | Balcão legado (encerrar, wizard) | 13px, variants color |
| `.mk-portal-btn` | CTA portal | gold/dourado, portal gate |

### 6.6 Cards admin FASE 9

**Classes:** `.mk-glass-card`, `.mk-exec-cockpit`, `.mk-admin-page`, `.mk-caixa-hero`  
**Efeito:** glass `--mk-admin-glass` + gradiente suave de fundo admin  
**Checklist:** [`CHECKLIST_FASE9_DNA_ADMIN.md`](../ativos/CHECKLIST_FASE9_DNA_ADMIN.md)

### 6.7 Hub colaborador (5 portas)

**Referência:** `gestao-pessoas.html` `#s-colab-hub`  
**Classes:** `.mk-hub-doors` + `.mk-hub-door` (mesmo DNA hub tablet)  
**Grid:** 2 col → 3 col ≥560px

### 6.8 Holerite RH

**Módulo:** `mk-holerite.js` — `mkHolBuildHtml_()`, `mkHolPrintPdf_()`  
**Estilos:** `.mk-hol-*` em `mk-gestao-pessoas.css` + `@media print`  
**Consumidores:** `mk-gestao-pessoas-admin.js`, `mk-gestao-pessoas-ui.js`  
**CNPJ produção:** **66.664.255/0001-67** (I34)

---

## 7. Logo, ícones, imagens

| Ativo | Uso | Caminho |
|-------|-----|---------|
| Wordmark UI | Texto `🚗 Movi Kids` Fredoka + span gold | Todas as telas |
| PWA / manifest | PNG | `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` |
| Empty state Home | PNG | `assets/logo-movi-kids.png` |
| Avatares portal | SVG | `assets/avatar-boy.svg`, `assets/avatar-girl.svg` |
| QR impresso | PNG | `assets/qr-portal-acompanhar.png` |
| Tipo veículo | Emoji | 🚗 carro · 🛺 moto · 🧸 pelúcia |
| Nav / hub | Emoji | 🏠 ➕ 📺 💰 🔧 👥 etc. |

**Regra:** não criar biblioteca de ícones paralela. Emoji só em nav, tipo, empty state — não em cada linha de lista.

---

## 8. Inventário página por página (produção)

### 8.1 `index.html` — SPA principal

| Camada | ID / seção | DNA aplicado |
|--------|------------|--------------|
| Splash | `#splash` | Gradiente blue→pink, Fredoka 42px |
| Hub | `#mk-tablet-hub` | 3 portas, gradiente hub, logo 38px |
| Auth | `#mk-auth-gate` | §6.1 completo |
| Shell | `#app` sidebar + mob header + mob nav | Navy sidebar, Fredoka sb-logo |
| **Sidebar mobile admin** | `#mk-admin-mob-cmd` | KPIs comando read-only + atalhos Balcao/Dashboard (FASE 16.6) |
| **Home** | `#page-home` | stat-cards, session-cards, QR strip |
| **Nova locação** | `#page-nova` | wizard 3 passos, `.vc-card` tiles |
| **Relacionamento** | `#page-relacionamento` | `.mk-admin-soft`, CRM cards |
| **Custos** | `#page-custos` | form glass |
| **Avulso** | `#page-lancamento` | fluxo exceção |
| **Painel ops** | `#page-painel` | `.pcard` grid |
| **Admin hub** | `#page-admin` | centro gestão |
| **Caixa** | `#page-caixa` | hero R$ + accordion |
| **Dashboard** | `#page-dashboard` | `#mk-command-center`, exec cockpit, charts paleta DNA |
| **Relatório** | `#page-relatorio` | mensal Golden |
| **Histórico** | `#page-historico` | analytics |
| **Operadores** | `#page-operadores` | gestão PIN |
| **Config SMS** | `#page-config` | templates |
| **Sistema** | `#page-sistema` | frota, preços, diag |

### 8.2 `acompanhar.html` — Portal

| Vista | Componentes |
|-------|-------------|
| Gate | `.mk-portal-gate`, input tel, `.mk-portal-btn` |
| Play | carrossel, tabs, alert, ring hero, info-bar, others |

### 8.3 `gestao-pessoas.html` — Colaboradores

| Camada | Componentes |
|--------|-------------|
| Auth | `#gp-auth-gate` = §6.1 |
| Hub | 5× mk-hub-door |
| Módulos | ponto, metas, escala, banco, holerite |

### 8.4 Satélites MOVI KIDS

| Página | CSS | Nota |
|--------|-----|------|
| `foto-moldura.html` | mk-design `.mk-frame-*` | Reusa portal btn |
| `assets/qr-balcao-imprimir.html` | inline portal tokens | Cartaz A5 |
| `track.html` | inline legado | **Migrar** para mk-portal ou deprecar |

### 8.5 Fora do design system MOVI KIDS

| Página | Motivo |
|--------|--------|
| `financeiro/index.html` | Produto ZapClin — Segoe UI, dark theme |
| `ponto-mockup.html`, `assets/*mock*` | Protótipo — não copiar para produção |
| `scripts/ops/*.html` | Ferramentas internas |

---

## 9. Animações

| Nome | Arquivo | Uso |
|------|---------|-----|
| `mk-portal-float` | mk-design | glow portal |
| `mk-portal-pop` | mk-design | entrada carrossel |
| `mk-portal-tick` | mk-design | timer quase lá |
| `mk-portal-pulse` | mk-design | tempo extra |
| `mk-mob-ghost-pulse` | mk-design | chip turno fantasma |
| `mk-frame-float` | mk-design | stickers foto moldura |
| `spin` | mk-app | splash loader |
| `gpFade` / `mockFade` | gestão/mock | troca de tela suave 0.25s |
| `shake` | mk-app | session-card danger |

**Regra:** animações leves, ≤8s loop, `ease`/`ease-in-out`. Sem animações que atrasem operação no balcão.

---

## 10. Checklist antes de publicar UI nova

### Obrigatório (todas as superfícies)

- [ ] Consultei **este documento** e a seção §8 da minha página
- [ ] Usei universo CSS correto (§2) — não misturei portal blue em auth operação
- [ ] Fredoka só em logo/timer/hero; Nunito no resto
- [ ] Um hero dominante na primeira dobra (§5)
- [ ] Reutilizei classes de §6 — **zero CSS paralelo** para auth/botões
- [ ] Textos humanos (“Quase lá!”, não “Status: Ativa”)
- [ ] Testei no dispositivo alvo (§11)

### Se mexeu em timer

- [ ] Paridade balcão × portal (`TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1`)

### Se página admin

- [ ] [`CHECKLIST_FASE9_DNA_ADMIN.md`](../ativos/CHECKLIST_FASE9_DNA_ADMIN.md) ≥ 8/10 DNA

### Se nova página standalone

- [ ] Cascade CSS §2 carregado na ordem certa
- [ ] Auth (se houver) = cópia `#mk-auth-gate`, não reinventar
- [ ] Entrada registrada neste doc §8

---

## 11. Homologação por dispositivo

| Superfície | Dispositivo | URL teste |
|------------|-------------|-----------|
| Portal | Celular responsável | `acompanhar.html?force=` |
| Balcão / auth | Tablet loja | `index.html?force=` |
| Admin | PC gestão | `index.html?force=` + PIN 1416 |
| Colaboradores | PC ou celular | `gestao-pessoas.html?force=` |

---

## 12. Anti-padrões (nunca fazer)

| ❌ Proibido | ✅ Fazer |
|------------|----------|
| CSS inline ou `<style>` em produção nova | `mk-design.css` / `mk-app.css` |
| Campo PIN único largo com letter-spacing | 4× `.mk-pin-box` |
| Cards `mock-pick` em auth produção | `.mk-op-select` + Prosseguir |
| Dois passos login visíveis juntos | `.mk-auth-step.hidden` |
| KPIs todos iguais sem hero | 1 hero + pills secundários |
| Tabela crua onde card comunica melhor | session-card / mk-glass-card |
| Emoji em cada linha | só nav, tipo, empty |
| Gradiente inventado fora dos universos | §3 fundos oficiais |
| Fonte system-ui / Segoe no MOVI KIDS | Fredoka + Nunito |
| Copiar mockup (`ponto-mockup.html`) direto | `gestao-pessoas.html` produção |

---

## 13. Lacunas conhecidas (backlog design system)

| Item | Prioridade | Ação |
|------|------------|------|
| Unificar `--blue` dual (#1565C0 vs #29B6F6) em doc único de tokens | P2 | Manter contextos §2 até refactor CSS |
| Migrar `track.html` para `mk-portal-*` | P3 | Deprecar inline |
| Documentar contraste WCAG formal | P3 | Auditoria a11y |
| Ícones SVG nav (substituir emoji gradual) | P4 | Futuro |

---

## 14. Histórico do documento

| Data | Versão | Evento |
|------|--------|--------|
| 06/06/2026 | — | `DESIGN_DNA_MOVIKIDS.md` criado (princípios) |
| 09/06/2026 | — | FASE 9 DNA admin em produção |
| 18/06/2026 | **1.0** | Auditoria ponta a ponta → **este Design System** + regra Cursor obrigatória |

---

*Manter sincronizado com `mk-design.css`, `mk-app.css` e telas de referência. Qualquer divergência código × doc: **corrigir código** ou **atualizar este doc** no mesmo PR.*
