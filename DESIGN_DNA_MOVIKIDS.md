# MOVI KIDS — DNA visual e de produto

**Registrado em:** 06/06/2026  
**Gatilho:** Portal `acompanhar.html` carrossel (v1.7.47) — feedback: *“muito bonito, profissional, agradável, amigável; responsáveis se apaixonam; isso vende o serviço.”*

**Regra Cursor (agente):** `.cursor/rules/design-visual-movikids.mdc`  
**Plano mestre (componentes):** `PLANO_MESTRE_REORGANIZADO_2026-06.md` §5

---

## 1. Missão visual

O MOVI KIDS não é só software de loja — é **a experiência que o pai/mãe leva no bolso** enquanto o filho brinca. Cada pixel deve transmitir:

| Sensação | Como materializar |
|----------|-------------------|
| **Confiança** | Layout limpo, tipografia forte, dados legíveis |
| **Carinho** | Marca Movi Kids, cores quentes, linguagem humana |
| **Clareza** | Um foco por tela; sem competição visual |
| **Orgulho** | Parecer app de shopping premium, não formulário interno |

> **Regra de ouro:** Se o responsável mostrar a tela para alguém, deve dar **vontade** — não vergonha.

---

## 2. Referência canônica — Portal carrossel

**Arquivo:** `acompanhar.html` + estilos `mk-design.css` (seção Portal)

### O que funcionou (manter em tudo)

1. **Gradiente de fundo** com glow suave — identidade Movi, não tela branca genérica  
2. **Marca no topo** — Fredoka “Movi **Kids**” (Kids em amarelo)  
3. **Contexto imediato** — `(98) 99999-1234 · 3 brincando`  
4. **Navegação por abas** — nome da criança, mesmo com 1 só (consistência)  
5. **“Criança 1 de N”** — orientação sem manual  
6. **Hero = anel + tempo** — o relógio é o protagonista  
7. **Alertas em faixa** — “Ana em 05:12 — atenção!” antes do hero quando crítico  
8. **Bloco info** — vidro fosco (`rgba` + borda suave): plano, veículo, status  
9. **Outras no mesmo telefone** — lista compacta com pill de tempo  
10. **Rodapé fixo** — “Trocar telefone” discreto, sempre acessível  
11. **Micro-interação** — pop na entrada, pulso no extra, swipe entre crianças  

### Versão de referência

- Frontend: **v1.7.47+**  
- URL: `https://ribocg-a11y.github.io/movikids/acompanhar.html?force=1.7.47`

---

## 3. Tokens e tipografia

```css
/* mk-design.css — portal (estender ao balcão onde fizer sentido) */
--blue: #29B6F6;      /* ação, tempo ok, aba ativa */
--blue-dk: #1565C0;   /* theme-color, links */
--gold: #FFD54F;      /* marca, CTA primário portal, alerta suave */
--orange: #FF8A65;    /* tempo extra */
--pink: #F06292;      /* acentos marca */
```

| Uso | Fonte |
|-----|--------|
| Logo, nome criança, MM:SS do timer | **Fredoka One** |
| Botões, labels, dados, subtítulos | **Nunito** 700–900 |

**Fundos:** gradiente `145deg` azul → roxo → rosa no portal; balcão pode ser mais sóbrio, mas **mesma família** de cor e arredondamento.

---

## 4. Hierarquia — regra dos 3 níveis

```
Nível 1 — HERO     → uma informação que importa agora (timer, R$ do dia, CTA)
Nível 2 — CONTEXTO → quem, o quê, quantos (abas, subtítulo, pills)
Nível 3 — DETALHE  → plano, veículo, histórico (colapsável ou segundo plano)
```

Nunca três heróis do mesmo tamanho na mesma dobra (erro do layout empilhado antigo).

---

## 5. Estados do timer (semântica universal)

| Estado | Cor anel | Label | Comportamento |
|--------|----------|-------|---------------|
| Pendente | branco suave | Já já começa | Anel cheio |
| Ativa ok | azul | Falta | Anel decrescendo |
| Quase lá (≤5 min) | amarelo | Quase lá! | Tick leve no número |
| Extra | laranja | Tempo extra | Pulso no anel + mensagem buscar |

Mesma lógica no **balcão** (`mergeSessaoCanonica`) e **portal** (`canonLoc_`) — beleza **não** pode quebrar paridade (incidente I16).

---

## 6. Onde aplicar este DNA (roadmap visual)

| Superfície | Prioridade | Direção |
|------------|------------|---------|
| **Portal** `acompanhar.html` | Feito v1.7.47 | Referência |
| **Home balcão** — cards de sessão | Alta | Hero timer + MKSessionCard slim (plano mestre §5.3) |
| **Nova locação** — tiles veículo/plano | Alta | Mesmo “tile” visual do portal (arredondado, um foco) |
| **SMS / links** para responsável | Média | Tom humano + link portal com mesma marca |
| **Dashboard admin** | Média | 1 KPI hero + pills; não grade 6 iguais |
| **Relatório PDF** | Baixa | Capa com marca; seções com hierarquia |

---

## 7. Checklist antes de publicar UI

- [ ] Testei no **celular** (portal) ou **tablet** (balcão)?
- [ ] Existe **um** elemento dominante na primeira dobra?
- [ ] Textos são **humanos** (não “Status: Ativa” solto sem contexto)?
- [ ] Cores seguem semântica (azul/amarelo/laranja)?
- [ ] Reutilizei `mk-design.css` / padrão portal?
- [ ] Não regredi paridade cronômetro (`TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1` se mexeu em timer)?

---

## 8. Frases-guia (para o agente e para o time)

- *“Isso vende o serviço.”* — Se não emociona o responsável, refazer.
- *“Profissional e amigável.”* — Não escolher um em detrimento do outro.
- *“Um telefone, N crianças, um foco.”* — Carrossel > lista infinita de heróis.
- *“O relógio é o produto.”* — Tudo orbita o tempo restante.
- *“Beleza com verdade.”* — Timer bonito e **igual** ao balcão.

---

## 9. Histórico

| Data | Evento |
|------|--------|
| 05/06/2026 | Portal redesenhado Pacote G (`mk-design.css`) |
| 06/06/2026 | Carrossel 1–N crianças v1.7.47; DNA registrado neste doc + regra Cursor |
