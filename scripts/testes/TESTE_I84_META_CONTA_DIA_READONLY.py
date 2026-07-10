#!/usr/bin/env python3
"""I84 — validação READONLY: meta operador dedup conta/dia (I42).
Sem escritas — só GET na API GAS."""

import json
import re
import sys
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import datetime

BASE = (
    "https://script.google.com/macros/s/"
    "AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec"
)
ADMIN_PIN = "1421"
JULIA_ID = 4
RAYKELLY_ID = 3


def api(params: dict, timeout=90) -> dict:
    qs = urllib.parse.urlencode({k: str(v) for k, v in params.items()})
    url = f"{BASE}?{qs}"
    req = urllib.request.Request(url, headers={"User-Agent": "MOVIKIDS-I84-test"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def norm_tel(t: str) -> str:
    return re.sub(r"\D", "", str(t or ""))


def conta_key_from_loc(loc: dict) -> str:
    cid = int(loc.get("contaId") or 0)
    if cid > 0:
        return f"c:{cid}"
    tel = norm_tel(loc.get("telefone"))
    if len(tel) >= 8:
        return f"t:{tel}"
    lid = int(loc.get("id") or 0)
    return f"id:{lid}" if lid > 0 else "?"


def add_check(checks: list, name: str, status: str, detail: str = ""):
    checks.append({"name": name, "status": status, "detail": detail})


def main() -> int:
    checks = []
    hoje = datetime.now().strftime("%d/%m/%Y")

    try:
        ping = api({"action": "ping"})
        if not ping.get("ok"):
            raise RuntimeError("ping falhou")
        ver = ping.get("versao", "")
        add_check(checks, "ping", "ok", ver)
        if not re.search(r"v1\.5\.18[0-9]|v1\.5\.19", ver):
            add_check(checks, "gas.versao.i84", "fail", f"esperado v1.5.180+ — atual {ver}")
        else:
            add_check(checks, "gas.versao.i84", "ok", ver)

        # --- Caixa I42 (loja inteira) ---
        resumo = api(
            {
                "action": "resumoDia",
                "data": hoje,
                "adminPin": ADMIN_PIN,
                "_t": int(datetime.now().timestamp() * 1000),
            }
        )
        if not resumo.get("ok"):
            raise RuntimeError(f"resumoDia: {resumo.get('erro')}")

        n_caixa = int(resumo.get("n") or 0)
        n_sess = int(resumo.get("nSessoes") or 0)
        locs = [l for l in (resumo.get("locacoes") or []) if str(l.get("status", "")) == "Encerrada"]
        keys = [conta_key_from_loc(l) for l in locs]
        uniq_keys = set(keys)
        n_calc = len(uniq_keys)

        add_check(
            checks,
            "caixa.n_vs_sessoes",
            "ok" if n_caixa <= n_sess else "fail",
            f"n={n_caixa} nSessoes={n_sess}",
        )
        add_check(
            checks,
            "caixa.n_alinhado",
            "ok" if n_caixa == n_calc else "fail",
            f"API n={n_caixa} calc contas={n_calc} sessoes={len(locs)}",
        )

        by_key = defaultdict(list)
        by_tel = defaultdict(list)
        for l in locs:
            by_key[conta_key_from_loc(l)].append(l)
            tel = norm_tel(l.get("telefone"))
            if tel:
                by_tel[tel].append(l)

        grupos_dup = {k: v for k, v in by_key.items() if len(v) > 1}
        tels_dup = {t: v for t, v in by_tel.items() if len(v) > 1}
        if grupos_dup:
            det = "; ".join(
                f"{k}→{len(v)}sess" for k, v in sorted(grupos_dup.items(), key=lambda x: -len(x[1]))[:5]
            )
            add_check(checks, "caixa.grupos_mesma_conta", "ok", f"{len(grupos_dup)} grupo(s): {det}")
        else:
            add_check(checks, "caixa.grupos_mesma_conta", "ok", "nenhum telefone/conta repetido hoje")

        # --- Meta Julia (operador 4) ---
        meta_j = api({"action": "metaOperadorTurno", "operadorId": JULIA_ID, "_t": int(datetime.now().timestamp() * 1000)})
        if not meta_j.get("ok") or not meta_j.get("configurado"):
            add_check(checks, "meta.julia", "fail", meta_j.get("erro", "nao configurado"))
        else:
            n_meta = int(meta_j.get("hoje", {}).get("n") or 0)
            add_check(checks, "meta.julia.hoje", "ok", f"n={n_meta} meta={meta_j.get('meta')}")

        n_raw = None
        aud = api({"action": "listarAuditoriaAdmin", "adminPin": ADMIN_PIN, "operador": "Julia", "limite": 200})
        if not aud.get("ok", True) and aud.get("erro"):
            add_check(checks, "auditoria.julia", "fail", aud.get("erro"))
        else:
            enc_hoje = [
                e
                for e in (aud.get("eventos") or [])
                if e.get("acao") == "encerrarLocacao" and str(e.get("timestamp", "")).startswith(hoje)
            ]
            n_raw = len(enc_hoje)
            add_check(checks, "auditoria.julia.encerrar_hoje", "ok", f"raw={n_raw}")

            if meta_j.get("configurado"):
                n_meta = int(meta_j.get("hoje", {}).get("n") or 0)
                add_check(
                    checks,
                    "meta.julia.dedup",
                    "ok" if n_meta <= n_raw else "fail",
                    f"meta n={n_meta} <= raw encerrar={n_raw}",
                )
                if n_raw > n_meta:
                    add_check(
                        checks,
                        "meta.julia.dedup_ativo",
                        "ok",
                        f"dedup removeu {n_raw - n_meta} sessão(ões) duplicada(s)",
                    )
                elif n_raw == n_meta and n_raw > 0:
                    add_check(
                        checks,
                        "meta.julia.dedup_ativo",
                        "warn",
                        "meta=raw — sem duplicata detectada OU dedup não aplicou",
                    )

        # Painel preview (metas.atual deve bater com metaOperadorTurno)
        prev = api(
            {
                "action": "buscarPainelColaboradorPreview",
                "adminPin": ADMIN_PIN,
                "operadorId": JULIA_ID,
                "competencia": "07/2026",
            }
        )
        if prev.get("ok"):
            atual_painel = int((prev.get("metas") or {}).get("atual") or 0)
            n_meta = int((meta_j.get("hoje") or {}).get("n") or 0) if meta_j.get("configurado") else -1
            add_check(
                checks,
                "painel.julia.metas_atual",
                "ok" if atual_painel == n_meta else "fail",
                f"painel atual={atual_painel} metaTurno={n_meta}",
            )
        else:
            add_check(checks, "painel.julia", "fail", prev.get("erro", "?"))

        # Cruzar caixa: se há tel duplicado, meta não deve contar cada sessão
        if tels_dup and meta_j.get("configurado"):
            max_dup = max(len(v) for v in tels_dup.values())
            n_meta = int(meta_j.get("hoje", {}).get("n") or 0)
            # loja tem dup mas meta Julia pode ser só parte — só alerta se raw >> meta com dup evidente
            if n_raw >= max_dup and n_meta < n_raw:
                add_check(
                    checks,
                    "regra.4_mesmo_tel",
                    "ok",
                    f"loja tem tel com até {max_dup} sessões; meta Julia={n_meta} < raw={n_raw}",
                )
            elif max_dup >= 2 and n_meta == n_raw:
                add_check(
                    checks,
                    "regra.4_mesmo_tel",
                    "warn",
                    f"tel repetido na loja (max {max_dup}x) mas meta=raw ({n_meta}) — conferir operador",
                )
            else:
                add_check(checks, "regra.4_mesmo_tel", "ok", f"max_dup_loja={max_dup}")

        # Raykelly referência (mês com histórico)
        meta_r = api({"action": "metaOperadorTurno", "operadorId": RAYKELLY_ID})
        if meta_r.get("ok") and meta_r.get("configurado"):
            add_check(
                checks,
                "meta.raykelly.mes",
                "ok",
                f"locTotal={meta_r.get('mes', {}).get('locTotal')} diasMeta={meta_r.get('mes', {}).get('diasComMeta')}",
            )

        fails = [c for c in checks if c["status"] == "fail"]
        result = {
            "suite": "TESTE_I84_META_CONTA_DIA_READONLY",
            "data": hoje,
            "ok": len(fails) == 0,
            "checks": checks,
            "resumo": {
                "caixa_n": n_caixa,
                "caixa_nSessoes": n_sess,
                "grupos_mesma_conta": len(grupos_dup),
                "tels_repetidos": len(tels_dup),
                "julia_meta_hoje": (meta_j.get("hoje") or {}).get("n") if meta_j.get("configurado") else None,
                "julia_raw_encerrar": n_raw,
            },
        }
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0 if result["ok"] else 1

    except Exception as ex:
        add_check(checks, "exception", "fail", str(ex))
        print(json.dumps({"suite": "TESTE_I84_META_CONTA_DIA_READONLY", "ok": False, "checks": checks}, indent=2))
        return 1


if __name__ == "__main__":
    sys.exit(main())
