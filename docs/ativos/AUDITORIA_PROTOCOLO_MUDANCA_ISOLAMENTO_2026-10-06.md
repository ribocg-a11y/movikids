# Auditoria de protocolo — mudança isolamento multi-loja (06/10/2026)

**Papel:** auditor de mudança / segurança operacional  
**Escopo:** I170–I178 · conformidade com `ROTEIRO_AGENTE`, `REGRAS_DE_PUBLICACAO` (Regra 20), `PROTOCOLO_DIAGNOSTICO` §1.5

---

## 1. Veredito

| Dimensão | Nota | Status |
|----------|------|--------|
| Isolamento Contas / início | Adequado | ✅ |
| Isolamento hist API (I172) | Web **v1.5.233** OK | ✅ |
| Isolamento comando ADM (I173) | Web ainda misturava; **corrigido repo v1.5.234** | ⏳ Nova Web |
| Conta mestre cross-loja (I174) | Corrigido repo | ⏳ Nova Web |
| Cobertura de teste dual | **Ausente** → criado `TESTE_ISOLAMENTO_MULTIUNIDADE_READONLY` | ✅ repo |
| Guards estáticos I173–I178 | **Ausentes** → adicionados ao `pre-push-check` | ✅ |
| Declaração “fechado” sem matriz | **Não conformidade** (agente) | Corrigido em processo |
| Padrão moderno (fail-closed + tenant key em cache/leitura/escrita) | Parcial → alvo v1.5.234 | ⏳ deploy |

**Conclusão:** o protocolo de *documentação* existia (Regra 20 / §1.5), mas a **cobertura executável** (teste + guards + fix P0) não estava completa. Medidas urgentes aplicadas no repo **v1.5.234** + FE **v1.9.165**.

---

## 2. Checklist mínimo (padrão tenant isolation)

Para qualquer sistema multi-unidade moderno, mudança de isolamento exige:

| # | Controle | Antes | Depois |
|---|----------|-------|--------|
| 1 | Filtro no **store** (GAS), não só UI | Parcial | I172–I176/I178 |
| 2 | Cache key com `tenantId` **e** builder filtrado | I173 falhava | `comandoOp_v3_` + uid no builder |
| 3 | Escrita associa tenant (conta/loc) | Conta mestre sem uid | I174 |
| 4 | Leitura com colunas do tenant id | kpiMes 19 cols | I178 `COL_LOC_READ_=29` |
| 5 | Teste dual automatizado | ❌ | `TESTE_ISOLAMENTO_*` |
| 6 | Guard CI/pre-push | só I170–I172 | + I173–I178 |
| 7 | Reteste pós-deploy Web | falhou em I170 | obrigatório pós Nova Web 1.5.234 |
| 8 | Docs / mapa / protocolo | parcial | atualizado |

---

## 3. Evidência live (pré-correção 1.5.234)

| Action | Golden | La Ville | Resultado |
|--------|--------|----------|-----------|
| carregarInicio nSess | 8 | 0 | PASS |
| listarHistorico (1.5.233) | 8 / uid=golden | 1 / uid=laville | PASS I172 |
| comandoOperacional nHoje | **6** | **6** | **FAIL I173** |
| kpiMes nHoje | 5 | 1 | parcial (veículo) |

---

## 4. Ações urgentes executadas nesta sessão

1. GAS **v1.5.234:** I173 comando · I174 conta · I175 leading · I176 custos hist · I178 kpiMes cols  
2. Guards `pre-push` I173–I178 + ajuste I121 janela regex  
3. `TESTE_ISOLAMENTO_MULTIUNIDADE_READONLY.ps1` + hook pre-push  
4. FE **v1.9.165** (custos hist série com `unidadeId` explícito)  
5. Docs MAPA / auditoria / handoff  

**Bloqueio sócio:** Nova versão Web **v1.5.234** (mesmo Deploy ID) → rodar `TESTE_ISOLAMENTO_MULTIUNIDADE_READONLY.ps1` (comando G≠L).

---

## 5. Não conformidade de processo (agente) — registrada

- Fechou isolamento sem matriz §1.5.1  
- Confiança em carimbo `unidadeId` sem filtrar builder  
- Sem teste automatizado dual até esta auditoria  

*Próxima mudança multi-loja: esta checklist §2 é gate obrigatório.*
