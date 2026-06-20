# MOVI KIDS — Estrutura do repositório GitHub

**Atualizado:** 20/06/2026 · FE **v1.8.71** · GAS repo **v1.5.111**

## Resposta curta: precisa de tudo isso na raiz?

**Não** — a lista longa no GitHub é mistura de **app em produção** (obrigatório na raiz por GitHub Pages) + **docs em pastas** + **alguns atalhos e mockups**.

| O que você vê no GitHub | Precisa no git? | Onde deveria estar |
|-------------------------|-----------------|-------------------|
| `mk-*.js`, `index.html`, `sw.js`, CSS produção | **Sim** — Pages serve da raiz | Raiz (não mover sem quebrar URLs) |
| `acompanhar.html`, `gestao-pessoas.html`, `track.html`, ícones PWA | **Sim** | Raiz |
| `MOVIKIDS_Code_...gs` | **Sim** — fonte GAS canônica | Raiz (nome fixo por tradição) |
| `docs/` | **Sim** — handoff, fases, incidentes | Só em `docs/` |
| `.cursor/rules/` | **Sim** — regras agente Cursor | Oculto no dia a dia |
| `scripts/` | **Sim** — testes e deploy | Fora da raiz |
| `arquivo-historico/` | Opcional mas útil | Não implantar |
| Mockups (`ponto-mockup.html`, redirects) | Opcional | Raiz só por URL antiga; cópias em `docs/prototipos/` |
| `FinanceiroGeral.gs` | Referência FASE 11 | `financeiro/` (não é deploy MOVI KIDS) |
| `protocolo-mestre.ps1`, `verify-gas-deploy.ps1` | Atalhos PC | Raiz = conveniência; origem em `scripts/` |

**Documentação de processo** (incidentes, fases, deploy histórico) fica em **`docs/`** — ativos enxutos: `DEPLOY_ATUAL.md` + `DEPLOY_GAS_*.md`.

---

## Mapa visual

```
movikids-github/
├── PRODUÇÃO (GitHub Pages — raiz obrigatória)
│   ├── index.html              SPA balcão + admin
│   ├── gestao-pessoas.html     RH colaboradores
│   ├── acompanhar.html         Portal responsável
│   ├── foto-moldura.html · track.html
│   ├── mk-*.js (Pacote M)      Módulos FE — ~25 arquivos
│   ├── mk-app.css · mk-design.css · mk-gestao-pessoas.css
│   ├── mk-holerite.js          Holerite compartilhado
│   ├── sw.js · mk-version.js · manifest.json · ícones
│   └── gas-endpoint.json
│
├── GAS (código fonte)
│   ├── MOVIKIDS_Code_...gs     ← único canônico para deploy
│   └── gas/Code.gs             gerado (gitignore) — clasp
│
├── DOCUMENTAÇÃO (agente + sócio)
│   └── docs/
│       ├── INDICE.md           entrada
│       ├── ativos/             handoff, planejamento, mapas
│       ├── referencia/         Design System, memorials
│       ├── arquivo/            incidentes, deploy histórico
│       └── prototipos/         HTML mock (cópias)
│
├── FERRAMENTAS
│   ├── scripts/testes/         protocolo F0–F14
│   ├── scripts/pre-push-check.ps1
│   └── githooks/
│
├── PROTÓTIPOS (URLs legadas na raiz)
│   ├── ponto-mockup.html       mock RH v3.6 (não produção)
│   ├── ponto_mockup.html · mock-ponto.html  → redirect
│   ├── gestao-adm-operadores-mockup.html
│   └── docs/prototipos/      cópias estáticas + README
│
├── OUTROS
│   ├── assets/                 logos, QR, mocks espelhados
│   ├── financeiro/             dashboard ZapClin (FASE 11)
│   ├── arquivo-historico/      GAS legado
│   └── .cursor/rules/          regras Cursor
│
└── ATALHOS PC (raiz)
    ├── protocolo-mestre.ps1
    ├── verify-gas-deploy.ps1
    ├── AGENTS.md · README.md
    └── .clasp.json
```

---

## Por que tantos `mk-*.js` na raiz?

Pacote **M** (modularização): cada fluxo virou arquivo (`mk-nova.js`, `mk-sync.js`, …). GitHub Pages publica **só a raiz** — mover para `src/` exigiria reconfigurar Pages e atualizar dezenas de `<script src>`.

**Regra:** código que o tablet baixa = raiz. Código que só roda no PC = `scripts/`.

---

## Hierarquia documental (conflito)

| Pergunta | Fonte |
|----------|--------|
| Versão FE/GAS agora | `mk-version.js` + header `.gs` + ping |
| Próximo passo operação | `HANDOFF_NOVO_CHAT.md` |
| Fases e prioridades | `PLANEJAMENTO_ATUAL` + `MAPA_FASES.md` |
| Deploy atual | **`DEPLOY_ATUAL.md`** |
| UI | `DESIGN_SYSTEM_MOVIKIDS.md` |
| Deploy histórico | `docs/arquivo/deploy/` — **não** usar versão |

Ver **`MAPA_FASES.md`** para tradução FASE 15 cockpit vs Gestão Pessoas vs Premium 16–22.

---

## O que pode ser limpo depois (janela segura)

| Item | Ação futura |
|------|-------------|
| 27× `DEPLOY_*.md` em `ativos/` | ✅ movidos para `docs/arquivo/deploy/` (20/06) |
| Mockups duplicados em `assets/` | Unificar links para `ponto-mockup.html` |
| `HOMOLOGACAO_PRODUCAO_ASSISTIDA.md` | Obsoleto — usar `CHECKLIST_FASE5` + `TESTE_TABLET_*` |

**Não fazer** sem janela: mover `mk-*.js`, mudar paths do portal, ou apagar mockups sem redirect.
