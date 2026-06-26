# Matriz de permissões — perfis MOVI KIDS (FASE 17.4)

**Atualizado:** 26/06/2026 · FE **v1.8.121** · GAS **v1.5.165**

## Perfis

| Perfil | Entrada | `authRole` / sessão |
|--------|---------|---------------------|
| **Super Admin** | PIN **1421** (`ADMIN_PIN` GAS) | `admin` |
| **Gestor** | PIN na planilha `OPERADORES_SISTEMA` · col perfil `gestor` | `gestor` |
| **Supervisor** | PIN · perfil `supervisor` (F9 pausado) | `supervisor` |
| **Operador** | Nome + PIN balcão | `operador` |
| **Colaborador RH** | `gestao-pessoas.html` · PIN próprio | colaborador (sem admin) |

## Páginas admin (sidebar)

| Página | Admin | Gestor | Supervisor | Operador |
|--------|:-----:|:------:|:----------:|:--------:|
| Hub (`admin`) | ✅ | ✅ | ❌ | ❌ |
| Dashboard | ✅ | ✅ | ❌ | ❌ |
| Relatório | ✅ | ✅ | ❌ | ❌ |
| Operadores / RH | ✅ | ✅ | ❌ | ❌ |
| Caixa do dia | ✅ | ✅ | ✅ | ❌ |
| Histórico | ✅ | ✅ | ✅ | ❌ |
| CONFIG | ✅ | ❌ | ❌ | ❌ |
| Sistema / diagnóstico | ✅ | ❌ | ❌ | ❌ |
| Home / Nova locação | ✅* | ✅* | ✅ | ✅ |

\* Admin/Gestor no PC costumam usar PIN admin para gestão; operadores usam Home no tablet.

**Implementação FE:** `mkPaginaGestaoPermitida_` em `mk-nav.js` · sidebars `showGestorSidebar` / `showSupervisorSidebar`.

## APIs GAS (gestão)

| Ação | Admin | Gestor | Supervisor | Operador |
|------|:-----:|:------:|:----------:|:--------:|
| `kpiMes` / `resumoDia` | ✅ | ✅ | ❌ | ❌ |
| `comandoOperacional` | ✅ | ✅ | ❌ | ❌ |
| `painelGestaoPessoasAdmin` | ✅ | ✅ | ❌ | ❌ |
| `salvarOperacaoConfigAdmin` | ✅ | ❌ | ❌ | ❌ |
| `limparLocacoesTesteAdmin` | ✅ | ❌ | ❌ | ❌ |
| Escritas locação (`salvarLocacao`…) | ✅ | ✅ | ✅ | ✅ |

**Implementação GAS:** `isAdminRequest_` · `isGestaoRequest_` · `isSupervisorOrAdminRequest_`.

## Alertas inteligentes (FASE 17)

| Destino pill | Quem vê | Página |
|--------------|---------|--------|
| Caixa | Admin, Gestor | `caixa` |
| Equipe | Admin, Gestor | `operadores` |
| Sistema / Frota | Admin | `sistema` |
| Comando | Admin, Gestor | `dashboard` (scroll comando) |

## Decisões pendentes (17.5)

| Item | Estado |
|------|--------|
| Reativar **Supervisor** (F9) com escopo caixa+histórico | Pausado — decisão sócio |
| Gestor editar CONFIG parcial (preços) | Não — manter só admin |

## Referências

- `ACESSOS_E_AUTORIZACOES.md` §7
- `PLANO_PREMIUM_ONEUI_FASES_16_22_2026-06.md` §7
- `mk-auth.js` · `mk-nav.js` · GAS `isGestaoRequest_`
