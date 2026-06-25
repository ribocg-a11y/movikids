# Rotação do PIN administrativo — MOVI KIDS

**Incidente:** I64 (vazamento PIN na UI colaboradores)  
**GAS:** `adminPinPlain_()` lê **Script Property `ADMIN_PIN`** antes do fallback no código.

## Trocar o PIN (sem Nova versão Web)

1. Abrir [Editor GAS](https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit)
2. **Configurações do projeto** (engrenagem) → **Propriedades do script**
3. Adicionar ou editar:
   - **Propriedade:** `ADMIN_PIN`
   - **Valor:** `1421` (rotação I64 — 25/06/2026)
4. Salvar

**PIN atual:** **1421** (desde 25/06/2026 · incidente I64).

O PIN **1416** foi desativado — definir **Script Property `ADMIN_PIN` = `1421`** no GAS (prioridade sobre código).

## Após rotacionar

1. Publicar FE **v1.8.120+** (remove PIN da tela)
2. Opcional: Nova versão Web **v1.5.162+** (mensagens de erro GAS sem citar PIN)
3. Tablets: `?force=1.8.120` ou aguardar PWA
4. Anotar o novo PIN em local seguro (cofre) — **não** commitar no repo

## Limpar PIN antigo no dispositivo

No tablet/PC onde admin logou: sair do admin → limpa `mk_admin_pin_sess_v1` / `mk_admin_pin_persist_v1` ao encerrar sessão (`mkAuthClearAdminPin_`).
