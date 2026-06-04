const BASE =
  "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec";

async function api(params) {
  const url = `${BASE}?${new URLSearchParams({ ...params, t: String(Date.now()) })}`;
  const r = await fetch(url, { cache: "no-store" });
  return r.json();
}

const ci = await api({ action: "carregarInicio" });
const ativos = ci.ativos || [];
console.log("=== Locacoes Pendente/Ativa (carregarInicio) ===");
console.log("total:", ativos.length);
for (const a of ativos) {
  console.log(
    `- id=${a.id} status=${a.status} tel=${a.telefone} ${a.responsavel} / ${a.crianca}`
  );
}

if (ativos.length) {
  const tel = String(ativos[0].telefone || "").replace(/\D/g, "");
  const portal = await api({ action: "buscarPortalResponsavel", telefone: tel });
  console.log("\n=== Portal teste telefone ativo ===");
  console.log(JSON.stringify(portal, null, 2));
} else {
  const lr = await api({ action: "listarResponsaveis", limite: "5" });
  const sample = lr.responsaveis?.[0];
  if (sample?.telefone) {
    const portal = await api({
      action: "buscarPortalResponsavel",
      telefone: sample.telefone,
    });
    console.log("\n=== Sem ativas agora; teste com telefone historico ===");
    console.log("telefone:", sample.telefone, sample.responsavel);
    console.log(JSON.stringify(portal, null, 2));
  }
}
